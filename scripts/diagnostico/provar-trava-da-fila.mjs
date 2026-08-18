#!/usr/bin/env node
/**
 * Prova que dois consumidores simultâneos NÃO pegam o mesmo roteiro.
 *
 * Uso:
 *   node --env-file=.env.local scripts/diagnostico/provar-trava-da-fila.mjs
 *
 * Por que existe: em 17/08 a VPS e uma tarefa agendada no PC do Yan geraram o
 * mesmo roteiro ao mesmo tempo. O `flock` do supervisor protege contra dois
 * processos no mesmo host, e não contra dois hosts. A trava tinha que estar na
 * fila, e trava de fila só se prova com concorrência de verdade: um teste que
 * chama duas vezes em sequência passa mesmo com a trava quebrada.
 *
 * Roda contra o banco real, em transações paralelas, e limpa o que criou.
 */

import { createClient } from "@vercel/postgres";

const CONEXAO = process.env.POSTGRES_URL_NON_POOLING ?? process.env.POSTGRES_URL;
const BOOKING = "prova-trava-fila";
const RESERVA_MINUTOS = 30;

const ok = (t) => `  ✅ ${t}`;
const nao = (t) => `  ❌ ${t}`;
let falhou = false;

function conferir(condicao, certo, errado) {
  if (condicao) console.log(ok(certo));
  else { console.log(nao(errado)); falhou = true; }
}

/** A mesma reserva que `reservarTrabalho` faz, sem os joins do worker. */
const RESERVA = `
  UPDATE roteiros
     SET estado = 'processando',
         tentativas = roteiros.tentativas + 1,
         entregue_em = now(),
         atualizado_em = now()
   WHERE id IN (
     SELECT r2.id FROM roteiros r2
      WHERE r2.cal_booking_id = $1
        AND r2.tentativas < 3
        AND (
          r2.estado IN ('pendente','falhou')
          OR (r2.estado = 'processando'
              AND r2.entregue_em < now() - ($2 || ' minutes')::interval)
        )
      ORDER BY r2.enfileirado_em
      LIMIT 1
      FOR UPDATE OF r2 SKIP LOCKED
   )
  RETURNING cal_booking_id, tentativas`;

const admin = createClient({ connectionString: CONEXAO });
await admin.connect();

console.log("\n  Provando a trava da fila de roteiros\n");

try {
  // Um agendamento e um lead de mentira, só para a linha da fila existir.
  await admin.query(`DELETE FROM roteiros WHERE cal_booking_id = $1`, [BOOKING]);
  await admin.query(`DELETE FROM agendamentos WHERE cal_booking_id = $1`, [BOOKING]);
  const lead = await admin.query(
    `INSERT INTO leads (nome, email, email_norm, origem, tipo, consentimento_em)
     VALUES ('Prova Trava', 'prova.trava@useinfuser.com', 'prova.trava@useinfuser.com',
             'teste', 'empresa', now())
     RETURNING id`,
  );
  const leadId = lead.rows[0].id;
  await admin.query(
    `INSERT INTO agendamentos (cal_booking_id, lead_id, inicio_em, estado)
     VALUES ($1, $2, now() + interval '2 days', 'agendado')`,
    [BOOKING, leadId],
  );
  await admin.query(`INSERT INTO roteiros (cal_booking_id) VALUES ($1)`, [BOOKING]);

  // ── dois consumidores, ao mesmo tempo, em conexões separadas ──────────
  const a = createClient({ connectionString: CONEXAO });
  const b = createClient({ connectionString: CONEXAO });
  await Promise.all([a.connect(), b.connect()]);

  const disputar = async (cliente) => {
    await cliente.query("BEGIN");
    const r = await cliente.query(RESERVA, [BOOKING, RESERVA_MINUTOS]);
    await cliente.query("COMMIT");
    return r.rowCount;
  };

  const [ganhouA, ganhouB] = await Promise.all([disputar(a), disputar(b)]);
  await Promise.all([a.end(), b.end()]);

  console.log(`  consumidor A levou ${ganhouA} item(ns), consumidor B levou ${ganhouB}`);
  conferir(
    ganhouA + ganhouB === 1,
    "exatamente UM consumidor levou o item",
    `os dois pegaram o mesmo item (${ganhouA} + ${ganhouB}): a trava nao segura`,
  );

  const depois = await admin.query(
    `SELECT estado, tentativas, entregue_em IS NOT NULL AS reservado
       FROM roteiros WHERE cal_booking_id = $1`,
    [BOOKING],
  );
  const linha = depois.rows[0];
  conferir(linha.estado === "processando", `estado virou "${linha.estado}"`, `estado ficou "${linha.estado}"`);
  conferir(linha.reservado, "entregue_em foi carimbado", "entregue_em ficou vazio");
  conferir(
    linha.tentativas === 1,
    `tentativas contou a ENTREGA: ${linha.tentativas}`,
    `tentativas = ${linha.tentativas}, deveria ser 1`,
  );

  // ── reserva viva bloqueia; reserva vencida devolve ────────────────────
  const enquantoReservado = await admin.query(RESERVA, [BOOKING, RESERVA_MINUTOS]);
  conferir(
    enquantoReservado.rowCount === 0,
    "item reservado NAO e entregue de novo",
    "item reservado foi entregue outra vez",
  );

  await admin.query(
    `UPDATE roteiros SET entregue_em = now() - interval '2 hours' WHERE cal_booking_id = $1`,
    [BOOKING],
  );
  const apos = await admin.query(RESERVA, [BOOKING, RESERVA_MINUTOS]);
  conferir(
    apos.rowCount === 1,
    "reserva VENCIDA volta para a fila (worker que morreu nao prende a call)",
    "reserva vencida nao voltou: uma maquina desligada prenderia a call para sempre",
  );
  conferir(
    apos.rows[0].tentativas === 2,
    "a reentrega tambem contou, entao crash em laco esbarra no teto",
    `tentativas = ${apos.rows[0].tentativas}, deveria ser 2`,
  );

  // ── o teto ainda vale ─────────────────────────────────────────────────
  await admin.query(
    `UPDATE roteiros SET tentativas = 3, estado = 'falhou' WHERE cal_booking_id = $1`,
    [BOOKING],
  );
  const noTeto = await admin.query(RESERVA, [BOOKING, RESERVA_MINUTOS]);
  conferir(
    noTeto.rowCount === 0,
    "item no teto de tentativas para de ser entregue",
    "item no teto continua sendo entregue: laco infinito",
  );
} finally {
  await admin.query(`DELETE FROM roteiros WHERE cal_booking_id = $1`, [BOOKING]);
  await admin.query(`DELETE FROM agendamentos WHERE cal_booking_id = $1`, [BOOKING]);
  await admin.query(`DELETE FROM leads WHERE email_norm = 'prova.trava@useinfuser.com'`);
  console.log("\n  limpeza: lead, agendamento e roteiro de prova removidos");
  await admin.end();
}

console.log(falhou ? "\n  ─── A TRAVA NAO SEGURA. ───\n" : "\n  ─── Trava provada sob concorrencia real. ───\n");
process.exit(falhou ? 1 : 0);
