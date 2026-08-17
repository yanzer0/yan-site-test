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
 * Nota do que se descobriu e deixou de ser necessário: o Cal.com grava o uid do
 * booking no `iCalUID` do evento, na forma `<uid>@Cal.com` (verificado em
 * 17/08/2026 com booking real). Servia para localizar o evento da call e
 * escrever nele. Não se escreve mais nele — ver o bloco vermelho abaixo — então
 * a busca saiu daqui em vez de virar código morto. O achado fica registrado em
 * `_projetos/funil-diagnostico-captura.md` no brain, caso volte a ser útil.
 */

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
 * 🔴 O roteiro NUNCA vai na descrição do evento do Cal.com.
 *
 * O lead é convidado daquele evento, e a documentação do Google é explícita:
 * `visibility: "private"` significa "only event attendees may view event
 * details". Ou seja, `private` esconde de quem NÃO é convidado — o convidado
 * sempre vê a descrição, e não existe campo que esconda dela só ele.
 *
 * O andaime contém "revela trauma e o que NÃO propor", "a resposta DELE é o
 * fechamento", "cala depois do ta certo". Material interno de condução de
 * venda. Na agenda do prospect, isso queima a call.
 *
 * Então o roteiro vai num evento PRÓPRIO, no calendário INFUSER, sem convidado
 * nenhum. Quem enxerga é quem tem o calendário: Yan, Pedro e Iago. O evento do
 * Cal.com fica intocado, com o link da reunião e os convidados que ele criou.
 */
const PREFIXO_DO_ROTEIRO = "Roteiro:";

/** Marca o evento como nosso, para achar de novo sem depender de título. */
function chaveDoRoteiro(bookingId: string): string {
  return `roteiro-${bookingId}`;
}

interface EventoDeRoteiro {
  readonly bookingId: string;
  readonly nomeDoLead: string;
  readonly inicioEm: Date;
  readonly descricao: string;
}

/**
 * Cria (ou atualiza) o evento de roteiro. Devolve o id.
 *
 * `transparency: "transparent"` para não ocupar o horário: o evento da call já
 * ocupa, e dois blocos sólidos no mesmo slot fariam o Cal.com e as pessoas
 * lerem a agenda como duas reuniões.
 *
 * `extendedProperties.private` guarda a chave do booking. É a forma de
 * reencontrar o evento sem depender do título, que uma pessoa pode editar —
 * e `private` aqui é do Google, significa "não replicado para as cópias dos
 * convidados", que neste evento nem existem.
 */
export async function publicarRoteiro(evento: EventoDeRoteiro): Promise<string> {
  const existente = await acharEventoDeRoteiro(evento.bookingId);

  const fim = new Date(evento.inicioEm.getTime() + 30 * 60 * 1000);
  const corpo = {
    summary: `${PREFIXO_DO_ROTEIRO} ${evento.nomeDoLead}`,
    description: evento.descricao,
    start: { dateTime: evento.inicioEm.toISOString() },
    end: { dateTime: fim.toISOString() },
    transparency: "transparent",
    visibility: "private",
    reminders: { useDefault: false, overrides: [] },
    extendedProperties: { private: { infuserRoteiro: chaveDoRoteiro(evento.bookingId) } },
  };

  if (existente) {
    await chamar(
      `/events/${encodeURIComponent(existente)}`,
      { method: "PATCH", body: JSON.stringify(corpo) },
      "atualizar evento de roteiro",
    );
    return existente;
  }

  const criado = await chamar<{ id: string }>(
    "/events?sendUpdates=none",
    { method: "POST", body: JSON.stringify(corpo) },
    "criar evento de roteiro",
  );
  return criado.id;
}

/** O evento de roteiro deste booking, se já existir. Idempotência do reprocesso. */
async function acharEventoDeRoteiro(bookingId: string): Promise<string | null> {
  const achados = await listar({
    privateExtendedProperty: `infuserRoteiro=${chaveDoRoteiro(bookingId)}`,
  });
  return achados[0]?.id ?? null;
}
