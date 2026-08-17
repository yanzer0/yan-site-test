/**
 * O que este sistema escreve no evento da call: anexo, descrição e convidados.
 *
 * ONDE O ROTEIRO MORA, já que o nome "documento" sugere Drive e NÃO é isso:
 *   - o markdown fonte, no brain, commitado pelo worker
 *   - o PDF, na coluna `pdf` da tabela `roteiros`, no nosso Postgres
 *   - no evento, apenas um LINK para `/roteiro/<token>` em useinfuser.com
 *
 * O Google Drive foi o desenho original e não é mais usado. Ele caiu por
 * impossibilidade técnica, não por preferência: service account em conta Gmail
 * pessoal não tem quota de armazenamento, nem criando dentro de pasta
 * compartilhada, porque o arquivo pertence a quem o cria. Verificado em 17/08:
 *
 *   403 Service Accounts do not have storage quota. Leverage shared drives,
 *       or use OAuth delegation instead.
 *
 * As duas saídas que o Google sugere exigem Workspace. O caminho de Drive foi
 * removido em 18/08 junto deste cabeçalho, que continuava explicando "por que
 * Drive e não uma URL nossa" enquanto o código já fazia o contrário, e chegou
 * a induzir a erro quem foi conferir como a proteção funcionava.
 *
 * Quem barra o lead, então, NÃO é a ACL do Google: é o cookie da rota que serve
 * o PDF (`acesso-roteiro.ts`). E desde 18/08 o lead também sai da lista de
 * convidados do evento, o que tira o link do campo de visão dele.
 *
 * Env:
 *   GOOGLE_SERVICE_ACCOUNT_B64  (sensível, usado por `agenda-google`)
 */

import { ErroAgenda } from "./agenda-google";

/** Sem timeout, um Google lento pendura a função inteira. */
const TIMEOUT_GOOGLE_MS = 60_000;

export class ErroDocumento extends Error {
  constructor(
    readonly operacao: string,
    readonly detalhe: string,
  ) {
    super(`falha ao ${operacao}: ${detalhe}`);
    this.name = "ErroDocumento";
  }
}

/**
 * Nome do arquivo como o LEAD vai ler, porque ele enxerga o nome do anexo.
 *
 * "Preparo" e não "roteiro de vendas": um cliente ver que a Infuser preparou a
 * conversa dele é bom sinal. O que não pode é ele ler as falas, e disso cuida a
 * permissão, não o nome.
 */
export function nomeDoDocumento(empresa: string | null, nomeDoLead: string): string {
  const quem = (empresa?.trim() || nomeDoLead.trim() || "lead").replace(/[\\/:*?"<>|]/g, "-");
  return `Preparo - ${quem} - Call 1.pdf`;
}

async function comTimeout(url: string, opcoes: RequestInit, ms: number): Promise<Response> {
  const controle = new AbortController();
  const alarme = setTimeout(() => controle.abort(), ms);
  try {
    return await fetch(url, { ...opcoes, signal: controle.signal });
  } finally {
    clearTimeout(alarme);
  }
}


export interface AnexoDoRoteiro {
  /**
   * O endereço do documento em `useinfuser.com`, e não um arquivo do Drive.
   *
   * O Calendar aceita anexo de terceiro (testado em 17/08: grava e mostra o
   * ícone). Isso é o que viabiliza servir o PDF por conta própria, necessário
   * porque service account não tem quota de Drive sem Workspace.
   */
  readonly fileUrl: string;
  readonly titulo: string;
}

/**
 * Prende o documento ao evento da call.
 *
 * `supportsAttachments=true` é obrigatório: sem ele o Google aceita a
 * requisição e IGNORA o campo `attachments`, sem erro nenhum. Falha silenciosa
 * clássica: o evento salva, o anexo não existe, e nada avisa.
 *
 * PATCH e não PUT: PUT substituiria o recurso e apagaria o link da reunião e os
 * convidados que o Cal.com criou.
 */
export async function anexarNoEvento(
  eventoId: string,
  anexo: AnexoDoRoteiro,
  tokenDoCalendario: string,
  calendarId: string,
): Promise<void> {
  await prepararEvento(eventoId, { anexo }, tokenDoCalendario, calendarId);
}

/** Tudo que este sistema escreve no evento da call. */
export interface PreparoDoEvento {
  readonly anexo?: AnexoDoRoteiro;
  /** Já montada. Quem decide o que pode entrar é `contato-no-evento.ts`. */
  readonly descricao?: string;
  /**
   * Os convidados que FICAM no evento.
   *
   * Passar a lista sem o lead é o que o tira dali. Não existe opção no Cal.com
   * que separe "manda o convite por e-mail" de "adiciona como convidado no
   * Google": as sete opções de Privacidade e segurança do event type foram
   * conferidas uma a uma em 17/08 e nenhuma faz isso. Como já editamos o evento
   * para anexar o roteiro, a remoção sai no mesmo PATCH.
   *
   * Lista vazia é diferente de campo ausente: `[]` limpa os convidados,
   * `undefined` deixa como está.
   */
  readonly convidados?: readonly { readonly email: string }[];
}

/**
 * Escreve no evento da call: anexo, descrição e lista de convidados.
 *
 * Um PATCH só, e não três, porque cada chamada a mais é uma chance de o evento
 * ficar meio pronto. O estado que não pode existir nem por um instante é
 * "roteiro anexado com o lead ainda convidado", e é justamente o que aconteceria
 * se o anexo fosse numa chamada e a remoção em outra que falhasse.
 *
 * `sendUpdates=none` é deliberado: sem ele o Google avisa os convidados a cada
 * alteração, e o lead receberia "evento atualizado" antes da call, além de um
 * "você foi removido" ao sair da lista.
 */
export async function prepararEvento(
  eventoId: string,
  preparo: PreparoDoEvento,
  tokenDoCalendario: string,
  calendarId: string,
): Promise<void> {
  const corpo: Record<string, unknown> = {};

  if (preparo.anexo) {
    corpo.attachments = [
      { fileUrl: preparo.anexo.fileUrl, title: preparo.anexo.titulo, mimeType: "application/pdf" },
    ];
  }
  if (preparo.descricao !== undefined) corpo.description = preparo.descricao;
  if (preparo.convidados !== undefined) corpo.attendees = preparo.convidados;

  if (Object.keys(corpo).length === 0) return;

  const url =
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}` +
    `/events/${encodeURIComponent(eventoId)}?supportsAttachments=true&sendUpdates=none`;

  const resposta = await comTimeout(
    url,
    {
      method: "PATCH",
      headers: { Authorization: `Bearer ${tokenDoCalendario}`, "Content-Type": "application/json" },
      body: JSON.stringify(corpo),
    },
    TIMEOUT_GOOGLE_MS,
  );

  if (!resposta.ok) {
    const detalhe = (await resposta.json().catch(() => ({}))) as { error?: { message?: string } };
    throw new ErroAgenda("preparar evento", `${resposta.status} ${detalhe.error?.message ?? ""}`);
  }
}
