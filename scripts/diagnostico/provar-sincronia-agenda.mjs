#!/usr/bin/env node
/**
 * Prova se um evento criado DIRETO no Google Agenda bloqueia o horário no Cal.com.
 *
 * Uso:
 *   node --env-file=.env.local scripts/diagnostico/provar-sincronia-agenda.mjs
 *
 * Por que empírico e não por configuração: olhar a tela de "Calendars" do
 * Cal.com diz o que ESTÁ LIGADO, não o que ACONTECE. O que importa para o lead
 * é se o horário que já tem compromisso aparece como livre para ele marcar. Um
 * calendário conectado mas não marcado para checagem de conflito passa na
 * inspeção visual e falha na prática.
 *
 * Então este script pergunta às duas fontes e cruza:
 *   1. ao Cal.com, quais horários ele está oferecendo (endpoint público)
 *   2. ao Google, o que já existe na agenda da Infuser no mesmo período
 *
 * Sobreposição = double booking esperando para acontecer.
 *
 * Só leitura. Não cria, não apaga e não move nada em nenhum dos dois lados.
 */

import { createSign } from "node:crypto";

const CAL_URL = process.env.NEXT_PUBLIC_CAL_URL ?? "https://cal.com/infuser/diagnostico";
const CALENDARIO = process.env.GOOGLE_CALENDAR_ID;
const CREDENCIAL_B64 = process.env.GOOGLE_SERVICE_ACCOUNT_B64;

const DIAS_A_OLHAR = 10;

if (!CALENDARIO || !CREDENCIAL_B64) {
  console.error("\n  GOOGLE_CALENDAR_ID ou GOOGLE_SERVICE_ACCOUNT_B64 ausente\n");
  process.exit(1);
}

const ok = (t) => `  ✅ ${t}`;
const nao = (t) => `  ❌ ${t}`;
const info = (t) => `  •  ${t}`;

/** `https://cal.com/infuser/diagnostico` → `{ usuario: "infuser", evento: "diagnostico" }` */
function partesDoCal(url) {
  const caminho = new URL(url).pathname.replace(/^\/+|\/+$/g, "").split("/");
  return { usuario: caminho[0], evento: caminho[1] };
}

// ── Google: token da service account ─────────────────────────────────────
function base64url(entrada) {
  return Buffer.from(entrada).toString("base64url");
}

async function tokenDoGoogle() {
  const cred = JSON.parse(Buffer.from(CREDENCIAL_B64, "base64").toString("utf8"));
  const agora = Math.floor(Date.now() / 1000);

  const cabecalho = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const corpo = base64url(
    JSON.stringify({
      iss: cred.client_email,
      scope: "https://www.googleapis.com/auth/calendar.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat: agora,
      exp: agora + 3600,
    }),
  );

  const assinatura = createSign("RSA-SHA256")
    .update(`${cabecalho}.${corpo}`)
    .sign(cred.private_key, "base64url");

  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${cabecalho}.${corpo}.${assinatura}`,
    }),
  });

  const dados = await r.json();
  if (!r.ok) throw new Error(`google recusou o token: ${dados.error_description ?? dados.error}`);
  return dados.access_token;
}

/** Eventos com hora marcada. Dia inteiro fica de fora: não bloqueia horário. */
async function eventosDoGoogle(token, de, ate) {
  const url = new URL(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDARIO)}/events`,
  );
  url.searchParams.set("timeMin", de.toISOString());
  url.searchParams.set("timeMax", ate.toISOString());
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("orderBy", "startTime");
  url.searchParams.set("maxResults", "250");

  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const dados = await r.json();
  if (!r.ok) throw new Error(`google recusou a listagem: ${dados.error?.message}`);

  return (dados.items ?? [])
    .filter((e) => e.status !== "cancelled" && e.start?.dateTime && e.end?.dateTime)
    // `transparent` = "disponível" no Google. Quem marca assim está dizendo
    // que o horário NÃO é para bloquear, então não conta como conflito.
    .filter((e) => e.transparency !== "transparent")
    .map((e) => ({
      titulo: e.summary ?? "(sem titulo)",
      inicio: new Date(e.start.dateTime),
      fim: new Date(e.end.dateTime),
    }));
}

// ── Cal.com: os horários que ele está oferecendo agora ───────────────────
async function slotsDoCal(de, ate) {
  const { usuario, evento } = partesDoCal(CAL_URL);
  const url = new URL("https://api.cal.com/v2/slots");
  url.searchParams.set("eventTypeSlug", evento);
  url.searchParams.set("username", usuario);
  url.searchParams.set("start", de.toISOString().slice(0, 10));
  url.searchParams.set("end", ate.toISOString().slice(0, 10));

  const r = await fetch(url, { headers: { "cal-api-version": "2024-09-04" } });
  const dados = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`cal.com respondeu ${r.status}: ${JSON.stringify(dados).slice(0, 200)}`);

  // A resposta é { data: { "2026-08-18": [{ start }, ...], ... } }.
  const porDia = dados.data ?? {};
  return Object.values(porDia)
    .flat()
    .map((s) => new Date(s.start ?? s.time))
    .filter((d) => !Number.isNaN(d.getTime()));
}

function seSobrepoe(inicioA, fimA, inicioB, fimB) {
  return inicioA < fimB && inicioB < fimA;
}

const fmt = (d) =>
  d.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" });

// ── a prova ──────────────────────────────────────────────────────────────
const de = new Date();
const ate = new Date(de.getTime() + DIAS_A_OLHAR * 24 * 60 * 60 * 1000);

console.log(`\n  O Cal.com respeita a agenda do Google?`);
console.log(`  Janela: ${fmt(de)} ate ${fmt(ate)}\n`);

const token = await tokenDoGoogle();
const [ocupados, slots] = await Promise.all([
  eventosDoGoogle(token, de, ate),
  slotsDoCal(de, ate),
]);

console.log(info(`Google: ${ocupados.length} compromisso(s) com hora marcada`));
console.log(info(`Cal.com: ${slots.length} horario(s) sendo oferecidos`));

if (slots.length === 0) {
  console.log(nao("o Cal.com nao ofereceu horario nenhum: sem isso nao da para concluir nada"));
  process.exit(2);
}
if (ocupados.length === 0) {
  console.log(
    "\n  A agenda esta vazia na janela olhada, entao nao ha conflito para detectar.",
  );
  console.log("  Para provar de verdade: crie um evento no Google dentro do horario de");
  console.log("  atendimento, espere um minuto e rode de novo.\n");
  process.exit(3);
}

// Duração da call, para saber se um slot invade um compromisso.
const DURACAO_MIN = 60;

const colisoes = [];
for (const slot of slots) {
  const fimSlot = new Date(slot.getTime() + DURACAO_MIN * 60 * 1000);
  for (const evento of ocupados) {
    if (seSobrepoe(slot, fimSlot, evento.inicio, evento.fim)) {
      colisoes.push({ slot, evento });
    }
  }
}

console.log("");
if (colisoes.length === 0) {
  console.log(ok("nenhum horario oferecido colide com compromisso do Google"));
  console.log("     O Cal.com esta respeitando a agenda: evento criado direto no");
  console.log("     Google bloqueia o horario para o lead.\n");
  process.exit(0);
}

console.log(nao(`${colisoes.length} horario(s) oferecidos EM CIMA de compromisso do Google`));
for (const { slot, evento } of colisoes.slice(0, 8)) {
  console.log(`     ${fmt(slot)} oferecido, mas ha "${evento.titulo}" ate ${fmt(evento.fim)}`);
}
console.log("\n     O Cal.com NAO esta checando essa agenda. Conectar em");
console.log("     Cal.com > Settings > Calendars e marcar a agenda para conflito.\n");
process.exit(1);
