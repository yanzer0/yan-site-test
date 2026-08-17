/**
 * Mostra a estrutura real de um evento criado pelo Cal.com na agenda INFUSER.
 *
 * Existe para responder com FATO, não com palpite, a pergunta de que campo
 * serve para casar um booking do Cal.com com o evento do Google: o uid aparece
 * em algum lugar? o attendee está lá? o iCalUID tem forma reconhecível?
 */
import { createSign } from "node:crypto";

const cred = JSON.parse(
  Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_B64, "base64").toString("utf8"),
);
const calendarId = process.env.GOOGLE_CALENDAR_ID;
const base64url = (v) => Buffer.from(v).toString("base64url");

async function token() {
  const antes = Date.now();
  const r = await fetch("https://www.google.com", { method: "HEAD" });
  const desvio = Date.now() - (new Date(r.headers.get("date")).getTime() + (Date.now() - antes) / 2);
  const agora = Math.floor((Date.now() - desvio) / 1000);
  const h = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const p = base64url(
    JSON.stringify({
      iss: cred.client_email,
      scope: "https://www.googleapis.com/auth/calendar.events",
      aud: cred.token_uri,
      iat: agora,
      exp: agora + 3600,
    }),
  );
  const sig = createSign("RSA-SHA256").update(`${h}.${p}`).sign(cred.private_key, "base64url");
  const resp = await fetch(cred.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${h}.${p}.${sig}`,
    }),
  });
  const d = await resp.json();
  if (!resp.ok) throw new Error(`${d.error}: ${d.error_description}`);
  return d.access_token;
}

const auth = { Authorization: `Bearer ${await token()}` };
const url = new URL(
  `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
);
url.searchParams.set("singleEvents", "true");
url.searchParams.set("orderBy", "startTime");
url.searchParams.set("maxResults", "25");
url.searchParams.set("timeMin", "2026-08-01T00:00:00Z");

const r = await fetch(url, { headers: auth });
const { items = [] } = await r.json();

console.log(`\n  ${items.length} eventos desde 01/08\n`);

for (const e of items) {
  const doCal =
    /cal\.com/i.test(e.description ?? "") ||
    /cal\.com/i.test(e.location ?? "") ||
    /@Cal\.com|calendso/i.test(e.iCalUID ?? "");
  console.log(`  ${doCal ? "[CAL.COM]" : "[   ?   ]"} ${e.start?.dateTime ?? e.start?.date}  ${e.summary}`);
}

const alvo = items.filter(
  (e) => /cal\.com/i.test(e.description ?? "") || /cal\.com/i.test(e.location ?? ""),
).at(-1);

if (!alvo) {
  console.log("\n  Nenhum evento reconhecivelmente criado pelo Cal.com.\n");
  process.exit(0);
}

console.log(`\n  ───── ANATOMIA DO EVENTO DO CAL.COM ─────\n`);
console.log(`  summary:    ${alvo.summary}`);
console.log(`  iCalUID:    ${alvo.iCalUID}`);
console.log(`  location:   ${alvo.location ?? "(sem)"}`);
console.log(`  creator:    ${alvo.creator?.email ?? "(sem)"}`);
console.log(`  organizer:  ${alvo.organizer?.email ?? "(sem)"}`);
console.log(`  attendees:  ${(alvo.attendees ?? []).map((a) => a.email).join(", ") || "(NENHUM)"}`);
console.log(`  extendedProperties: ${JSON.stringify(alvo.extendedProperties ?? {})}`);
console.log(`\n  --- description (${(alvo.description ?? "").length} chars) ---`);
console.log(alvo.description ?? "(vazia)");
