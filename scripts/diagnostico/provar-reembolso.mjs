#!/usr/bin/env node
/**
 * Prova o fluxo de reembolso contra a PRODUÇÃO, sem mexer em dinheiro real.
 *
 * Uso:
 *   node --env-file=.env.local scripts/diagnostico/provar-reembolso.mjs
 *
 * Como funciona: planta um pedido de mentira no banco, entrega um
 * `charge.refunded` assinado com o segredo de produção, e confere o que o
 * webhook fez. Nenhuma cobrança real é tocada — o PaymentIntent é inventado e
 * o Stripe nunca é chamado para reembolsar nada.
 *
 * O que se prova:
 *   1. reembolso total marca o pedido como `reembolsado`
 *   2. reembolso PARCIAL não marca e não cancela
 *   3. reentrega do mesmo evento não reprocessa
 *   4. reembolso de cobrança que não é nossa é ignorado sem erro
 *   5. o pedido reembolsado para de liberar o agendamento
 *
 * O que NÃO se prova aqui: o cancelamento no Cal.com de verdade, que exige um
 * booking real e a CAL_API_KEY. Sem a chave, o webhook responde
 * `cancelamento: "falhou"` e alerta — e este script confere justamente isso,
 * porque sucesso fingido nesse ponto é o que faria o horário ficar bloqueado
 * para sempre.
 *
 * Tudo que este script cria, ele apaga no fim.
 */

import { createHmac } from "node:crypto";
import { createClient } from "@vercel/postgres";

const SEGREDO = process.env.STRIPE_WEBHOOK_SECRET;
const BASE = process.env.ROTEIRO_BASE_URL ?? "https://useinfuser.com";
const ROTA = "/api/diagnostico/mapa-pago/webhook";

const SESSAO = "cs_PROVA_REEMBOLSO";
const PAGAMENTO = "pi_PROVA_REEMBOLSO";
const EMAIL = "prova.reembolso@useinfuser.com";
const BOOKING = "prova-booking-inexistente";
const VALOR = 19700;

if (!SEGREDO) {
  console.error("\n  STRIPE_WEBHOOK_SECRET ausente\n");
  process.exit(1);
}

const ok = (t) => `  ✅ ${t}`;
const nao = (t) => `  ❌ ${t}`;
let falhou = false;

function conferir(condicao, certo, errado) {
  if (condicao) {
    console.log(ok(certo));
  } else {
    console.log(nao(errado));
    falhou = true;
  }
}

/** Monta um `charge.refunded` como o Stripe monta. */
function eventoReembolso({ paymentIntent, devolvido, total, integral }) {
  return JSON.stringify({
    id: "evt_prova_reembolso",
    object: "event",
    type: "charge.refunded",
    data: {
      object: {
        id: "ch_prova",
        object: "charge",
        payment_intent: paymentIntent,
        amount: total,
        amount_refunded: devolvido,
        refunded: integral,
      },
    },
  });
}

function assinar(corpo, timestamp) {
  const v1 = createHmac("sha256", SEGREDO).update(`${timestamp}.${corpo}`).digest("hex");
  return `t=${timestamp},v1=${v1}`;
}

async function entregar(corpo) {
  const agora = Math.floor(Date.now() / 1000);
  const r = await fetch(`${BASE}${ROTA}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "stripe-signature": assinar(corpo, agora) },
    body: corpo,
  });
  return { status: r.status, corpo: await r.json().catch(() => ({})) };
}

const cliente = createClient({
  connectionString: process.env.POSTGRES_URL_NON_POOLING ?? process.env.POSTGRES_URL,
});
await cliente.connect();

async function estadoDoPedido() {
  const r = await cliente.query(
    `SELECT estado, reembolsado_em FROM pedidos_mapa WHERE stripe_session_id = $1`,
    [SESSAO],
  );
  return r.rows[0] ?? null;
}

async function plantarPedido() {
  await cliente.query(`DELETE FROM pedidos_mapa WHERE stripe_session_id = $1`, [SESSAO]);
  await cliente.query(
    `INSERT INTO pedidos_mapa
       (stripe_session_id, stripe_payment_intent, email, email_norm,
        valor_centavos, moeda, estado, cal_booking_id)
     VALUES ($1, $2, $3, $3, $4, 'brl', 'agendado', $5)`,
    [SESSAO, PAGAMENTO, EMAIL, VALOR, BOOKING],
  );
}

console.log(`\n  Provando o reembolso em ${BASE}\n`);

try {
  // ── 1. reembolso PARCIAL nao pode desfazer ────────────────────────────
  await plantarPedido();
  const parcial = await entregar(
    eventoReembolso({ paymentIntent: PAGAMENTO, devolvido: 5000, total: VALOR, integral: false }),
  );
  const depoisDoParcial = await estadoDoPedido();

  conferir(
    parcial.corpo.ignorado === "reembolso_parcial",
    `parcial recusado: ${JSON.stringify(parcial.corpo)}`,
    `parcial NAO foi tratado como parcial: ${JSON.stringify(parcial.corpo)}`,
  );
  conferir(
    depoisDoParcial?.estado === "agendado",
    "parcial deixou o pedido de pe, como deve",
    `parcial mexeu no pedido: estado=${depoisDoParcial?.estado}`,
  );

  // ── 2. reembolso TOTAL desfaz ─────────────────────────────────────────
  const total = await entregar(
    eventoReembolso({ paymentIntent: PAGAMENTO, devolvido: VALOR, total: VALOR, integral: true }),
  );
  const depoisDoTotal = await estadoDoPedido();

  conferir(
    depoisDoTotal?.estado === "reembolsado",
    `total marcou reembolsado (em ${depoisDoTotal?.reembolsado_em?.toISOString?.() ?? "?"})`,
    `total NAO marcou: estado=${depoisDoTotal?.estado}`,
  );

  // O cancelamento tem que FALHAR ALTO quando falha, nunca fingir sucesso.
  //
  // Este booking é de mentira de propósito: o script não pode consumir um
  // horário real da agenda. Então o Cal.com vai recusar, e o que se prova aqui
  // é o MOTIVO da recusa. "not found" significa que a credencial chegou e foi
  // aceita, e que só o booking não existe. "CAL_API_KEY nao configurada"
  // significa que a variável não chegou ao runtime, e aí nenhum reembolso real
  // vai liberar horário nenhum.
  const { cancelamento, motivo } = total.corpo;

  if (cancelamento === "cancelado" || cancelamento === "ja_cancelado") {
    console.log(ok(`cancelou no Cal.com: ${cancelamento}`));
  } else if (cancelamento === "falhou" && !motivo) {
    // 🔴 Sem `motivo` não dá para distinguir credencial ausente de booking
    // inexistente, e as duas exigem ação diferente. Passar aqui seria aprovar
    // por FALTA de informação: foi o que este script fez uma vez, quando o
    // deploy que introduziu o campo ainda não tinha subido e a comparação com
    // `undefined` caiu no ramo de sucesso.
    console.log(nao("resposta sem `motivo`: nao da para saber se a credencial chegou"));
    console.log("     Provavelmente o deploy com o campo ainda nao subiu. Rodar de novo.");
    falhou = true;
  } else if (cancelamento === "falhou" && /nao configurada/i.test(motivo)) {
    console.log(nao("CAL_API_KEY NAO chegou ao runtime: reembolso nao libera horario"));
    console.log("     Conferir `vercel env ls production` e se houve deploy DEPOIS de adicionar.");
    falhou = true;
  } else if (cancelamento === "falhou") {
    console.log(ok(`credencial aceita pelo Cal.com; recusou o booking falso: ${motivo}`));
    console.log("     Cancelamento de booking REAL so se prova com uma call de verdade.");
  } else {
    console.log(nao(`resposta inesperada no cancelamento: ${JSON.stringify(total.corpo)}`));
    falhou = true;
  }

  // ── 3. reentrega nao reprocessa ───────────────────────────────────────
  const reentrega = await entregar(
    eventoReembolso({ paymentIntent: PAGAMENTO, devolvido: VALOR, total: VALOR, integral: true }),
  );
  conferir(
    reentrega.corpo.jaProcessado === true,
    "reentrega reconhecida como ja processada",
    `reentrega reprocessou: ${JSON.stringify(reentrega.corpo)}`,
  );

  // ── 4. pedido reembolsado nao libera mais o agendamento ───────────────
  const libera = await cliente.query(
    `SELECT EXISTS (
       SELECT 1 FROM pedidos_mapa WHERE email_norm = $1 AND estado = 'pago'
     ) AS existe`,
    [EMAIL],
  );
  conferir(
    libera.rows[0]?.existe === false,
    "pedido reembolsado nao libera mais o agendamento",
    "pedido reembolsado AINDA libera agendamento",
  );

  // ── 5. cobranca de fora do funil e ignorada sem barulho ───────────────
  const alheia = await entregar(
    eventoReembolso({ paymentIntent: "pi_de_outro_produto", devolvido: 100, total: 100, integral: true }),
  );
  conferir(
    alheia.corpo.ignorado === "pedido_nao_encontrado",
    "reembolso de outro produto ignorado sem erro",
    `reembolso alheio tratado errado: ${JSON.stringify(alheia.corpo)}`,
  );
} finally {
  const apagou = await cliente.query(`DELETE FROM pedidos_mapa WHERE stripe_session_id = $1`, [
    SESSAO,
  ]);
  console.log(`\n  limpeza: ${apagou.rowCount} pedido(s) de prova removido(s)`);
  await cliente.end();
}

console.log(
  falhou
    ? "\n  ─── ALGUM ELO FALHOU. Nao confie no reembolso ate resolver. ───\n"
    : "\n  ─── Reembolso provado de ponta a ponta no banco. ───\n",
);
process.exit(falhou ? 1 : 0);
