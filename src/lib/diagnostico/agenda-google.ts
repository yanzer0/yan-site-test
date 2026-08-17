/**
 * Acesso à agenda INFUSER pela API do Google Calendar.
 *
 * Autenticação por service account (`infuser-agenda@infuser-painel`), com o
 * calendário compartilhado com ela. Sem Workspace, sem domain-wide delegation,
 * sem refresh token que expira. Passo a passo em
 * `specs/003-roteiro-call-automatico/setup-google.md`.
 *
 * 🔴 O que este módulo NÃO faz mais, e por quê: ele já escreveu o roteiro na
 * descrição do evento. Não pode. O lead é convidado do evento da call, e a
 * documentação do Google é literal: `visibility: "private"` significa "only
 * event attendees may view event details". `private` esconde de quem NÃO é
 * convidado; o convidado sempre lê a descrição. O roteiro agora vai como ANEXO
 * de um arquivo no Drive, cuja permissão o lead não tem. Ver `documento-roteiro.ts`.
 *
 * Envs:
 *   GOOGLE_SERVICE_ACCOUNT_B64  (sensível), o JSON da chave, em base64
 *   GOOGLE_CALENDAR_ID          o id do calendário INFUSER
 *
 * 🔴 A credencial vai em base64 e não como JSON cru. A chave privada tem `\n`
 * literais, e num arquivo `.env` eles não sobrevivem: o `JSON.parse` morre em
 * "Expected property name at position 1". Base64 não tem esse problema.
 */

import { JWT } from "google-auth-library";

const ESCOPO = "https://www.googleapis.com/auth/calendar.events";
const RAIZ = "https://www.googleapis.com/calendar/v3/calendars";

/** Nenhuma chamada remota sem teto. Um Google lento não pendura o worker. */
const TIMEOUT_MS = 30_000;

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
  readonly attendees?: readonly {
    readonly email?: string;
    readonly organizer?: boolean;
  }[];
}

/** O evento como precisamos dele para reescrever sem apagar o que já estava lá. */
export interface EventoDaCall {
  readonly id: string;
  readonly descricao: string | null;
  readonly convidados: readonly { readonly email: string; readonly organizador: boolean }[];
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

export function idDoCalendario(): string {
  const id = process.env.GOOGLE_CALENDAR_ID;
  if (!id) throw new ErroAgenda("acessar agenda", "GOOGLE_CALENDAR_ID ausente");
  return id;
}

export async function obterToken(): Promise<string> {
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

async function comTimeout(url: string, opcoes: RequestInit): Promise<Response> {
  const controle = new AbortController();
  const alarme = setTimeout(() => controle.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...opcoes, signal: controle.signal });
  } finally {
    clearTimeout(alarme);
  }
}

async function chamar<T>(caminho: string, opcoes: RequestInit, operacao: string): Promise<T> {
  const token = await obterToken();
  const resposta = await comTimeout(`${RAIZ}/${encodeURIComponent(idDoCalendario())}${caminho}`, {
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
 * Lê o evento antes de reescrevê-lo.
 *
 * Existe porque as duas coisas que este sistema escreve no evento dependem do
 * que já está lá: a descrição é somada à que o Cal.com escreveu, e a lista de
 * convidados precisa ser conhecida para tirar o lead SEM tirar o organizador
 * junto. Escrever sem ler seria sobrescrever no escuro.
 */
export async function lerEvento(eventoId: string): Promise<EventoDaCall> {
  const evento = await chamar<EventoGoogle>(
    `/events/${encodeURIComponent(eventoId)}`,
    { method: "GET" },
    "ler evento da call",
  );

  return {
    id: evento.id,
    descricao: evento.description ?? null,
    convidados: (evento.attendees ?? [])
      .filter((quem): quem is { email: string; organizer?: boolean } => Boolean(quem.email))
      .map((quem) => ({ email: quem.email, organizador: quem.organizer === true })),
  };
}

/**
 * A lista de convidados sem o lead, preservando o resto.
 *
 * Nunca remove quem está marcado como organizador: tirar o organizador da
 * própria reunião quebraria o evento, e o alvo aqui é só o lead. Devolve `null`
 * quando não há o que mudar, para o chamador não gastar um PATCH à toa.
 */
export function convidadosSemOLead(
  convidados: readonly { readonly email: string; readonly organizador: boolean }[],
  emailDoLead: string,
): readonly { readonly email: string }[] | null {
  const alvo = emailDoLead.trim().toLowerCase();
  const ficam = convidados.filter(
    (quem) => quem.organizador || quem.email.trim().toLowerCase() !== alvo,
  );

  if (ficam.length === convidados.length) return null;
  return ficam.map((quem) => ({ email: quem.email }));
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
 * Sufixo que o Cal.com usa no `iCalUID` do evento que cria no Google.
 *
 * Verificado em 17/08/2026 num booking real: o booking `rdbMSePKJxKoNHZKyqhP7r`
 * virou o evento de `iCalUID: rdbMSePKJxKoNHZKyqhP7r@Cal.com`. Chave exata, e o
 * Google filtra por ela direto na listagem.
 */
export const SUFIXO_ICAL_DO_CAL = "@Cal.com";

/** `<uid do booking>@Cal.com`. */
export function icalUidDoBooking(bookingId: string): string {
  return `${bookingId}${SUFIXO_ICAL_DO_CAL}`;
}

/**
 * Acha o evento que o Cal.com criou para este agendamento.
 *
 * Duas passadas: `iCalUID` (exato, o caminho normal) e, se falhar, janela de
 * dois minutos em torno do início cruzada com o e-mail de quem agendou. A
 * segunda existe para o dia em que o Cal.com mudar o formato do uid, e aí o
 * roteiro ainda chega, e o que quebra é a via rápida, não a feature.
 *
 * Com mais de um candidato, este módulo NÃO escolhe. Anexar no evento errado
 * entrega material interno para outra pessoa.
 */
export async function acharEventoDaCall(
  bookingId: string,
  inicioEm: Date,
  emailDoLead: string,
): Promise<string> {
  const porUid = await listar({ iCalUID: icalUidDoBooking(bookingId) });
  if (porUid.length === 1) return porUid[0].id;

  const tolerancia = 2 * 60 * 1000;
  const naJanela = await listar({
    timeMin: new Date(inicioEm.getTime() - tolerancia).toISOString(),
    timeMax: new Date(inicioEm.getTime() + tolerancia).toISOString(),
  });

  const alvo = emailDoLead.trim().toLowerCase();
  const comOLead = naJanela.filter((evento) =>
    (evento.attendees ?? []).some((quem) => quem.email?.trim().toLowerCase() === alvo),
  );

  if (comOLead.length === 1) return comOLead[0].id;
  if (comOLead.length === 0) {
    throw new ErroAgenda(
      "achar evento da call",
      `nenhum evento casa com o booking ${bookingId}, nem por iCalUID nem por horario`,
    );
  }
  throw new ErroAgenda(
    "achar evento da call",
    `${comOLead.length} candidatos para o booking ${bookingId}; nao anexo em nenhum para nao acertar o errado`,
  );
}
