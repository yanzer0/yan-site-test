/**
 * Escrita na agenda INFUSER pela API do Google Calendar.
 *
 * Por que este módulo existe: o Cal.com não tem endpoint para editar a
 * descrição de um booking já criado. Verificado na API v2 em 17/08/2026 —
 * existe reagendar, cancelar, confirmar, trocar local e adicionar convidado,
 * mas não editar o corpo do evento. Quem escreve o roteiro no card é o Google,
 * direto.
 *
 * Autenticação por service account (`infuser-agenda@infuser-painel`), com o
 * calendário compartilhado com ela. Sem Workspace, sem domain-wide delegation,
 * sem refresh token que expira. O passo a passo está em
 * `specs/003-roteiro-call-automatico/setup-google.md`.
 *
 * Escopo `calendar.events`: edita evento, e não consegue apagar o calendário
 * nem mexer em compartilhamento.
 *
 * Envs:
 *   GOOGLE_SERVICE_ACCOUNT_B64  (sensível) — o JSON da chave, em base64
 *   GOOGLE_CALENDAR_ID          — o id do calendário INFUSER
 *
 * 🔴 A credencial vai em base64 e não como JSON cru. A chave privada tem `\n`
 * literais, e num arquivo `.env` eles não sobrevivem: o `JSON.parse` morre em
 * "Expected property name at position 1". Base64 não tem esse problema.
 */

import { JWT } from "google-auth-library";

const ESCOPO = "https://www.googleapis.com/auth/calendar.events";
const RAIZ = "https://www.googleapis.com/calendar/v3/calendars";

/** Janela em torno do horário de início para localizar o evento criado pelo Cal.com. */
const TOLERANCIA_MS = 2 * 60 * 1000;

export class ErroAgenda extends Error {
  constructor(
    readonly operacao: string,
    readonly detalhe: string,
  ) {
    super(`falha ao ${operacao}: ${detalhe}`);
    this.name = "ErroAgenda";
  }
}

interface CredencialServiceAccount {
  readonly client_email: string;
  readonly private_key: string;
}

interface EventoGoogle {
  readonly id: string;
  readonly summary?: string;
  readonly description?: string;
  readonly start?: { readonly dateTime?: string };
  readonly attendees?: readonly { readonly email?: string }[];
}

function lerCredencial(): CredencialServiceAccount {
  const bruto = process.env.GOOGLE_SERVICE_ACCOUNT_B64;
  if (!bruto) throw new ErroAgenda("autenticar", "GOOGLE_SERVICE_ACCOUNT_B64 ausente");
  try {
    return JSON.parse(Buffer.from(bruto, "base64").toString("utf8")) as CredencialServiceAccount;
  } catch {
    throw new ErroAgenda("autenticar", "GOOGLE_SERVICE_ACCOUNT_B64 nao e um JSON valido em base64");
  }
}

function idDoCalendario(): string {
  const id = process.env.GOOGLE_CALENDAR_ID;
  if (!id) throw new ErroAgenda("acessar agenda", "GOOGLE_CALENDAR_ID ausente");
  return id;
}

async function obterToken(): Promise<string> {
  const credencial = lerCredencial();
  const cliente = new JWT({
    email: credencial.client_email,
    key: credencial.private_key,
    scopes: [ESCOPO],
  });
  const { token } = await cliente.getAccessToken();
  if (!token) throw new ErroAgenda("autenticar", "o Google nao devolveu access token");
  return token;
}

async function chamar<T>(caminho: string, opcoes: RequestInit, operacao: string): Promise<T> {
  const token = await obterToken();
  const resposta = await fetch(`${RAIZ}/${encodeURIComponent(idDoCalendario())}${caminho}`, {
    ...opcoes,
    headers: {
      ...opcoes.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (resposta.status === 204) return undefined as T;

  const corpo = (await resposta.json()) as T & { error?: { message?: string } };
  if (!resposta.ok) {
    // 404 aqui quase nunca é calendário inexistente: é o calendário não
    // compartilhado com a service account (passo 4 do setup). A mensagem do
    // Google não diz isso, então dizemos nós.
    const dica =
      resposta.status === 404
        ? " (404 costuma ser o calendario NAO compartilhado com a service account, nao id errado)"
        : "";
    throw new ErroAgenda(operacao, `${resposta.status} ${corpo.error?.message ?? ""}${dica}`);
  }
  return corpo;
}

/**
 * Sufixo que o Cal.com usa no `iCalUID` do evento que cria no Google.
 *
 * Verificado em 17/08/2026 num booking real: o booking `rdbMSePKJxKoNHZKyqhP7r`
 * virou o evento de `iCalUID: rdbMSePKJxKoNHZKyqhP7r@Cal.com`. É chave exata, e
 * o Google aceita filtrar por ela direto na listagem.
 */
export const SUFIXO_ICAL_DO_CAL = "@Cal.com";

/** `<uid do booking>@Cal.com`. */
export function icalUidDoBooking(bookingId: string): string {
  return `${bookingId}${SUFIXO_ICAL_DO_CAL}`;
}

/**
 * Acha o evento que o Cal.com criou para este agendamento.
 *
 * Duas passadas, nesta ordem:
 *
 *   1. Filtro por `iCalUID`. É identificação exata e não depende de horário nem
 *      de texto. É o caminho normal.
 *   2. Só se a primeira não achar: janela de dois minutos em torno do início,
 *      filtrando pelo e-mail de quem agendou. Existe para o dia em que o
 *      Cal.com mudar o formato do uid — aí o roteiro ainda chega, e o que
 *      quebra é a via rápida, não a feature.
 *
 * Se a segunda passada devolver mais de um candidato, este módulo NÃO escolhe.
 * Escrever roteiro no evento errado é pior que não escrever: some o roteiro
 * certo e polui o card de outra pessoa. Falha em voz alta e o alerta avisa.
 */
export async function acharEvento(
  bookingId: string,
  inicioEm: Date,
  emailDoLead: string,
): Promise<string> {
  const porUid = await listar({ iCalUID: icalUidDoBooking(bookingId) });
  if (porUid.length === 1) return porUid[0].id;

  const naJanela = await listar({
    timeMin: janela(inicioEm, -1),
    timeMax: janela(inicioEm, 1),
  });

  const alvo = emailDoLead.trim().toLowerCase();
  const comOLead = naJanela.filter((evento) =>
    (evento.attendees ?? []).some((quem) => quem.email?.trim().toLowerCase() === alvo),
  );

  if (comOLead.length === 1) return comOLead[0].id;
  if (comOLead.length === 0) {
    throw new ErroAgenda(
      "achar evento",
      `nenhum evento na agenda casa com o booking ${bookingId}, nem por iCalUID nem por horario`,
    );
  }
  throw new ErroAgenda(
    "achar evento",
    `${comOLead.length} eventos candidatos para o booking ${bookingId}; nao escrevo em nenhum para nao acertar o errado`,
  );
}

function janela(inicio: Date, sentido: -1 | 1): string {
  return new Date(inicio.getTime() + sentido * TOLERANCIA_MS).toISOString();
}

async function listar(parametros: Record<string, string>): Promise<readonly EventoGoogle[]> {
  const busca = new URLSearchParams({ singleEvents: "true", maxResults: "10", ...parametros });
  const resposta = await chamar<{ items?: readonly EventoGoogle[] }>(
    `/events?${busca}`,
    { method: "GET" },
    "listar eventos",
  );
  return resposta.items ?? [];
}

/**
 * Escreve a descrição do evento.
 *
 * PATCH e não PUT de propósito: PUT substituiria o recurso inteiro e apagaria o
 * link da reunião, os convidados e o lembrete que o Cal.com configurou.
 */
export async function escreverDescricao(eventoId: string, descricao: string): Promise<void> {
  await chamar(
    `/events/${encodeURIComponent(eventoId)}`,
    { method: "PATCH", body: JSON.stringify({ description: descricao }) },
    "escrever descricao",
  );
}
