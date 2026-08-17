/**
 * Cria (ou cancela) um booking de teste no event type de diagnóstico.
 *
 * Por que precisa existir: a configuração de `destinationCalendar` e
 * `customName` aparece correta na API, mas o único booking que existe é
 * ANTERIOR a ela, e a v2 não expõe `updatedAt` do event type. Sem um booking
 * novo, "a configuração está valendo" é inferência, não fato.
 *
 * O attendee usa `@exemplo-infuser.test`. `.test` é reservado pela RFC 2606 e
 * não resolve em lugar nenhum: o convite não alcança pessoa alguma.
 */
const CHAVE = process.env.CAL_API_KEY;
const EVENT_TYPE = 6672241;

async function v2(caminho, versao, opcoes = {}) {
  const r = await fetch(`https://api.cal.com/v2${caminho}`, {
    ...opcoes,
    headers: {
      ...opcoes.headers,
      Authorization: `Bearer ${CHAVE}`,
      "cal-api-version": versao,
      "Content-Type": "application/json",
    },
  });
  return { status: r.status, corpo: await r.json().catch(() => ({})) };
}

const acao = process.argv[2];

if (acao === "slots") {
  const de = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);
  const ate = new Date(Date.now() + 6 * 86400000).toISOString().slice(0, 10);
  const r = await v2(
    `/slots?eventTypeId=${EVENT_TYPE}&start=${de}&end=${ate}&timeZone=America/Sao_Paulo`,
    "2024-09-04",
  );
  if (r.status !== 200) {
    console.error(`${r.status}: ${JSON.stringify(r.corpo).slice(0, 400)}`);
    process.exit(1);
  }
  const dias = Object.entries(r.corpo.data ?? {});
  for (const [dia, horarios] of dias.slice(0, 3)) {
    const lista = (horarios ?? []).map((h) => h.start ?? h).slice(0, 4);
    console.log(`  ${dia}: ${lista.join("  ")}`);
  }
  process.exit(0);
}

if (acao === "criar") {
  const quando = process.argv[3];
  const r = await v2("/bookings", "2024-08-13", {
    method: "POST",
    body: JSON.stringify({
      start: quando,
      eventTypeId: EVENT_TYPE,
      attendee: {
        name: "Ricardo Alves",
        email: "ybotossi+teste005@gmail.com",
        timeZone: "America/Sao_Paulo",
        language: "pt-BR",
      },
      metadata: { origem: "teste-003" },
    }),
  });
  if (r.status >= 400) {
    console.error(`${r.status}: ${JSON.stringify(r.corpo).slice(0, 600)}`);
    process.exit(1);
  }
  const b = r.corpo.data;
  console.log(`uid=${b.uid}`);
  console.log(`title=${b.title}`);
  console.log(`start=${b.start}`);
  process.exit(0);
}

if (acao === "cancelar") {
  const uid = process.argv[3];
  const r = await v2(`/bookings/${uid}/cancel`, "2024-08-13", {
    method: "POST",
    body: JSON.stringify({ cancellationReason: "booking de teste da feature 003" }),
  });
  console.log(`cancelar ${uid}: ${r.status} ${r.corpo.data?.status ?? JSON.stringify(r.corpo).slice(0, 200)}`);
  process.exit(0);
}

console.error("uso: booking-teste.mjs slots | criar <iso> | cancelar <uid>");
process.exit(1);
