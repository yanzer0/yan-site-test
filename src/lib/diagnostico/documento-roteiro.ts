/**
 * O roteiro vira um documento anexável ao evento da call.
 *
 * 🔴 Por que Drive, e não uma URL nossa: o Calendar ACEITA anexo com `fileUrl`
 * de fora do Drive — testado em 17/08, grava e mostra o ícone. E é exatamente
 * por isso que não serve: o lead é convidado do evento, vê o anexo e CLICA. Um
 * link nosso abre para ele. Com o arquivo no Drive, quem barra é a ACL do
 * Google: ele vê o anexo e recebe "você precisa de permissão".
 *
 * A conta de serviço não tem espaço de Drive próprio (limitação do Google para
 * service account sem Workspace), então grava DENTRO de uma pasta do Yan
 * compartilhada com ela. O arquivo herda o compartilhamento da pasta, que é o
 * que dá a ACL de graça.
 *
 * Envs:
 *   GOOGLE_SERVICE_ACCOUNT_B64  (sensível)
 *   GOOGLE_DRIVE_FOLDER_ID      pasta compartilhada com a service account
 */

import { JWT } from "google-auth-library";

import { ErroAgenda } from "./agenda-google";

/** Escopo mínimo: cria e enxerga só o que ela mesma criou. Não lê o Drive todo. */
const ESCOPO_DRIVE = "https://www.googleapis.com/auth/drive.file";

/** Sem timeout, um Google lento pendura a função inteira. */
const TIMEOUT_DRIVE_MS = 60_000;

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
 * conversa dele é bom sinal. O que não pode é ele ler as falas — disso cuida a
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

async function tokenDoDrive(): Promise<string> {
  const bruto = process.env.GOOGLE_SERVICE_ACCOUNT_B64;
  if (!bruto) throw new ErroDocumento("autenticar no drive", "GOOGLE_SERVICE_ACCOUNT_B64 ausente");

  const cred = JSON.parse(Buffer.from(bruto, "base64").toString("utf8")) as {
    client_email: string;
    private_key: string;
  };

  const cliente = new JWT({
    email: cred.client_email,
    key: cred.private_key,
    scopes: [ESCOPO_DRIVE],
  });
  const { token } = await cliente.getAccessToken();
  if (!token) throw new ErroDocumento("autenticar no drive", "sem access token");
  return token;
}

export interface DocumentoNoDrive {
  readonly fileId: string;
  readonly fileUrl: string;
}

/**
 * Sobe (ou substitui) o PDF na pasta compartilhada.
 *
 * Substitui em vez de acumular: reprocessar o mesmo agendamento tem que
 * atualizar o documento, não encher a pasta de "Preparo - Vertex - Call 1.pdf"
 * repetidos que ninguém sabe qual é o bom.
 *
 * 🔴 NÃO cria permissão nenhuma no arquivo. Ele herda o compartilhamento da
 * pasta, e é isso que barra o lead. Chamar `permissions.create` com
 * `type: anyone` aqui destruiria a única proteção do desenho.
 */
export async function publicarNoDrive(pdf: Buffer, nome: string): Promise<DocumentoNoDrive> {
  const pasta = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!pasta) throw new ErroDocumento("publicar no drive", "GOOGLE_DRIVE_FOLDER_ID ausente");

  const token = await tokenDoDrive();
  const auth = { Authorization: `Bearer ${token}` };

  const existente = await acharPorNome(nome, pasta, auth);

  const metadados = existente
    ? { name: nome }
    : { name: nome, parents: [pasta], mimeType: "application/pdf" };

  const corpo = new FormData();
  corpo.append(
    "metadata",
    new Blob([JSON.stringify(metadados)], { type: "application/json" }),
  );
  corpo.append("file", new Blob([new Uint8Array(pdf)], { type: "application/pdf" }));

  const url = existente
    ? `https://www.googleapis.com/upload/drive/v3/files/${existente}?uploadType=multipart&fields=id,webViewLink`
    : `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink`;

  const resposta = await comTimeout(
    url,
    { method: existente ? "PATCH" : "POST", headers: auth, body: corpo },
    TIMEOUT_DRIVE_MS,
  );

  const dados = (await resposta.json()) as {
    id?: string;
    webViewLink?: string;
    error?: { message?: string };
  };

  if (!resposta.ok || !dados.id) {
    const dica =
      resposta.status === 403
        ? " (403 aqui costuma ser a Drive API desligada no projeto, ou a pasta nao compartilhada com a service account)"
        : "";
    throw new ErroDocumento(
      "publicar no drive",
      `${resposta.status} ${dados.error?.message ?? ""}${dica}`,
    );
  }

  return {
    fileId: dados.id,
    fileUrl: dados.webViewLink ?? `https://drive.google.com/file/d/${dados.id}/view`,
  };
}

/** O documento deste lead, se já existir na pasta. Base da substituição. */
async function acharPorNome(
  nome: string,
  pasta: string,
  auth: Record<string, string>,
): Promise<string | null> {
  // Aspas simples delimitam o valor na query do Drive, então escapar é o que
  // impede um nome de empresa com apóstrofo de quebrar (ou torcer) a busca.
  const seguro = nome.replace(/'/g, "\\'");
  const busca = new URLSearchParams({
    q: `name = '${seguro}' and '${pasta}' in parents and trashed = false`,
    fields: "files(id)",
    pageSize: "1",
  });

  const resposta = await comTimeout(
    `https://www.googleapis.com/drive/v3/files?${busca}`,
    { method: "GET", headers: auth },
    TIMEOUT_DRIVE_MS,
  );
  if (!resposta.ok) return null;

  const dados = (await resposta.json()) as { files?: { id: string }[] };
  return dados.files?.[0]?.id ?? null;
}

export interface AnexoDoRoteiro {
  readonly fileId: string;
  readonly fileUrl: string;
  readonly titulo: string;
}

/**
 * Prende o documento ao evento da call.
 *
 * `supportsAttachments=true` é obrigatório: sem ele o Google aceita a
 * requisição e IGNORA o campo `attachments`, sem erro nenhum. Falha silenciosa
 * clássica — o evento salva, o anexo não existe, e nada avisa.
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
  const url =
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}` +
    `/events/${encodeURIComponent(eventoId)}?supportsAttachments=true&sendUpdates=none`;

  const resposta = await comTimeout(
    url,
    {
      method: "PATCH",
      headers: { Authorization: `Bearer ${tokenDoCalendario}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        attachments: [
          {
            fileId: anexo.fileId,
            fileUrl: anexo.fileUrl,
            title: anexo.titulo,
            mimeType: "application/pdf",
          },
        ],
      }),
    },
    TIMEOUT_DRIVE_MS,
  );

  if (!resposta.ok) {
    const corpo = (await resposta.json().catch(() => ({}))) as { error?: { message?: string } };
    throw new ErroAgenda("anexar no evento", `${resposta.status} ${corpo.error?.message ?? ""}`);
  }
}
