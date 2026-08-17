#!/usr/bin/env node
/**
 * Prova o webhook do Stripe contra o ambiente REAL, sem gastar dinheiro.
 *
 * Uso:
 *   node --env-file=.env.local scripts/diagnostico/provar-webhook.mjs
 *
 * Por que existe: o painel do Stripe só oferece "Enviar eventos de teste" no
 * modo de teste. Em produção o menu do destino tem apenas Editar/Desativar/
 * Excluir, então não há como pedir ao Stripe que dispare um evento contra o
 * endpoint de produção. Mas nós temos o signing secret, e a assinatura é só um
 * HMAC — dá para montar o evento exatamente como o Stripe monta e entregar.
 *
 * O que este script prova:
 *   1. o endpoint recebe
 *   2. a assinatura CERTA é aceita e a ERRADA é recusada
 *   3. o código grava o pedido no banco, com o valor certo
 *   4. reentrega do mesmo evento não duplica (o Stripe reentrega de verdade)
 *   5. evento com assinatura válida mas velha é recusado (anti-replay)
 *
 * O que NÃO prova, e por isso fica dito em voz alta: a página de retorno lendo
 * uma sessão REAL do Stripe. Esse caminho só roda com uma compra de verdade —
 * é o que `provar-pagamento.mjs` confere depois.
 *
 * O pedido criado aqui é apagado no fim.
 */

import { createHmac } from "node:crypto";
import { createClient } from "@vercel/postgres";

const SEGREDO = process.env.STRIPE_WEBHOOK_SECRET;
const BASE = process.env.ROTEIRO_BASE_URL ?? "https://useinfuser.com";
const ROTA = "/api/diagnostico/mapa-pago/webhook";

/** Prefixo `PROVA` para nunca colidir com uma sessão real do Stripe. */
const SESSAO = "cs_PROVA_WEBHOOK";
const VALOR_CENTAVOS = 19700;

if (!SEGREDO) {
  console.error("\n  STRIPE_WEBHOOK_SECRET ausente\n");
  process.exit(1);
}

const ok = (t) => `  ✅ ${t}`;
const nao = (t) => `  ❌ ${t}`;
let falhou = false;

/** Monta o corpo do jeito que o Stripe monta. */
function corpoDoEvento() {
  return JSON.stringify({
    id: "evt_prova_webhook",
    object: "event",
    type: "checkout.session.completed",
    data: {
      object: {
        id: SESSAO,
        object: "checkout.session",
        payment_status: "paid",
        amount_total: VALOR_CENTAVOS,
        currency: "brl",
        customer_details: { email: "prova.webhook@useinfuser.com", name: "Prova de Webhook" },
      },
    },
  });
}

/** Assina como o Stripe: `t=<ts>,v1=HMAC(ts + "." + corpo)`. */
function assinar(corpo, segredo, timestamp) {
  const v1 = createHmac("sha256", segredo).update(`${timestamp}.${corpo}`).digest("hex");
  return `t=${timestamp},v1=${v1}`;
}

async function entregar(corpo, assinatura) {
  const r = await fetch(`${BASE}${ROTA}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "stripe-signature": assinatura },
    body: corpo,
  });
  return { status: r.status, corpo: await r.json().catch(() => ({})) };
}

/** Reporta um caso e lembra se algum falhou, para o exit code no fim. */
function conferir(nome, resposta, esperado) {
  const passou = resposta.status === esperado;
  if (!passou) falhou = true;
  console.log(
    passou
      ? ok(`${nome}: ${resposta.status}`)
      : nao(`${nome}: esperava ${esperado}, veio ${resposta.status} ${JSON.stringify(resposta.corpo)}`),
  );
}

console.log(`\n  Provando o webhook em ${BASE} (sem dinheiro)\n`);

const agora = Math.floor(Date.now() / 1000);
const corpo = corpoDoEvento();

conferir("assinatura ERRADA é recusada", await entregar(corpo, assinar(corpo, "whsec_do_atacante", agora)), 401);
conferir("REPLAY de 10 min atrás é recusado", await entregar(corpo, assinar(corpo, SEGREDO, agora - 600)), 401);
conferir("assinatura CERTA é aceita", await entregar(corpo, assinar(corpo, SEGREDO, agora)), 200);
conferir("REENTREGA é aceita", await entregar(corpo, assinar(corpo, SEGREDO, agora)), 200);

// ── o que sobrou no banco depois das duas entregas ───────────────────────
const cliente = createClient({
  connectionString: process.env.POSTGRES_URL_NON_POOLING ?? process.env.POSTGRES_URL,
});
await cliente.connect();

try {
  const r = await cliente.query(
    `SELECT COUNT(*)::int AS n, MIN(estado) AS estado, MIN(valor_centavos) AS valor
       FROM pedidos_mapa WHERE stripe_session_id = $1`,
    [SESSAO],
  );
  const { n, estado, valor } = r.rows[0];

  if (n === 1) {
    console.log(ok(`gravou UMA vez nas duas entregas (idempotência): estado="${estado}"`));
    if (valor === VALOR_CENTAVOS) {
      console.log(ok(`valor gravado bate: ${(valor / 100).toFixed(2)}`));
    } else {
      console.log(nao(`valor DIVERGE: esperava ${VALOR_CENTAVOS}, gravou ${valor}`));
      falhou = true;
    }
  } else if (n === 0) {
    console.log(nao("o webhook respondeu 200 mas NÃO gravou o pedido"));
    falhou = true;
  } else {
    console.log(nao(`DUPLICOU em ${n} linhas: a idempotência não segura reentrega`));
    falhou = true;
  }

  const apagou = await cliente.query(`DELETE FROM pedidos_mapa WHERE stripe_session_id = $1`, [SESSAO]);
  console.log(`\n  limpeza: ${apagou.rowCount} pedido(s) de prova removido(s)`);
} finally {
  await cliente.end();
}

console.log(
  falhou
    ? "\n  ─── ALGUM ELO FALHOU. Não confie no webhook até resolver. ───\n"
    : "\n  ─── Webhook provado. Falta só a compra real (provar-pagamento.mjs). ───\n",
);
process.exit(falhou ? 1 : 0);
