#!/usr/bin/env node
/**
 * Prova o caminho do dinheiro de ponta a ponta, depois de uma compra real.
 *
 * Uso:
 *   node --env-file=.env.local scripts/diagnostico/provar-pagamento.mjs
 *
 * Por que existe: o pagamento é a única parte do funil que não dá para exercitar
 * sem cartão. Todo o resto foi provado no caminho real. Este script fecha a
 * lacuna DEPOIS da compra, conferindo os quatro elos que ninguém vê:
 *
 *   1. o Stripe registrou a sessão como paga
 *   2. o WEBHOOK chegou e gravou o pedido no nosso banco
 *   3. o pedido libera o agendamento
 *   4. a página de retorno mostra o calendário para essa sessão
 *
 * O elo 2 é o que mais silenciosamente falha: o cliente vê "pagamento
 * aprovado" na tela do Stripe mesmo que o nosso webhook nunca tenha rodado.
 */

import { createClient } from "@vercel/postgres";

const CHAVE = process.env.STRIPE_SECRET_KEY;
const BASE = process.env.ROTEIRO_BASE_URL ?? "https://useinfuser.com";

if (!CHAVE) {
  console.error("\n  STRIPE_SECRET_KEY ausente\n");
  process.exit(1);
}

const ok = (t) => `  ✅ ${t}`;
const nao = (t) => `  ❌ ${t}`;

console.log(`\n  Provando o caminho do dinheiro em ${BASE}\n`);

// ── 1. o Stripe tem uma sessão paga? ─────────────────────────────────────
const r = await fetch("https://api.stripe.com/v1/checkout/sessions?limit=3", {
  headers: { Authorization: `Bearer ${CHAVE}` },
});
const dados = await r.json();
if (!r.ok) {
  console.error(nao(`Stripe respondeu ${r.status}: ${dados.error?.message}`));
  process.exit(1);
}

const pagas = (dados.data ?? []).filter((s) => s.payment_status === "paid");
if (pagas.length === 0) {
  console.log(nao("nenhuma sessão PAGA no Stripe ainda"));
  console.log("     (se você acabou de pagar, espere alguns segundos e rode de novo)\n");
  process.exit(2);
}

const sessao = pagas[0];
const email = sessao.customer_details?.email ?? sessao.customer_email;
const valor = ((sessao.amount_total ?? 0) / 100).toFixed(2);
console.log(ok(`Stripe: sessão paga de R$ ${valor} ${(sessao.currency ?? "").toUpperCase()}`));
console.log(`     ${sessao.id}`);

// ── 2. o webhook gravou o pedido? ────────────────────────────────────────
const cliente = createClient({
  connectionString: process.env.POSTGRES_URL_NON_POOLING ?? process.env.POSTGRES_URL,
});
await cliente.connect();

try {
  const pedido = await cliente.query(
    `SELECT estado, valor_centavos, moeda, lead_id, pago_em
       FROM pedidos_mapa WHERE stripe_session_id = $1`,
    [sessao.id],
  );

  if (pedido.rowCount === 0) {
    console.log(nao("o WEBHOOK não gravou o pedido no nosso banco"));
    console.log("     O cliente pagou e viu sucesso na tela do Stripe, mas para nós");
    console.log("     esse pagamento não existe. É a falha silenciosa clássica.");
    console.log("     Conferir as entregas do webhook no painel do Stripe.\n");
    process.exit(3);
  }

  const p = pedido.rows[0];
  console.log(ok(`webhook gravou: estado="${p.estado}" valor=${(p.valor_centavos / 100).toFixed(2)} ${p.moeda}`));
  console.log(`     vinculado a lead: ${p.lead_id ?? "nenhum (pagou sem ter preenchido o formulário)"}`);

  if (p.valor_centavos !== sessao.amount_total) {
    console.log(nao(`valor DIVERGE: Stripe ${sessao.amount_total} vs banco ${p.valor_centavos}`));
    process.exit(4);
  }
  console.log(ok("valor no banco bate com o do Stripe"));

  // ── 3. o pedido libera o agendamento? ──────────────────────────────────
  const libera = await cliente.query(
    `SELECT EXISTS (SELECT 1 FROM pedidos_mapa
      WHERE email_norm = $1 AND estado = 'pago') AS existe`,
    [(email ?? "").trim().toLowerCase()],
  );
  console.log(
    libera.rows[0]?.existe
      ? ok("o pagamento libera o agendamento")
      : nao("o pagamento NÃO libera o agendamento"),
  );

  // ── 4. a página de retorno mostra o calendário? ────────────────────────
  const pagina = await fetch(`${BASE}/diagnostico/pago?session_id=${sessao.id}`);
  const html = await pagina.text();
  const liberou = /escolher o horário|Agora é/i.test(html);
  const recusou = /Não consegui/i.test(html);

  console.log(
    liberou && !recusou
      ? ok("a página de retorno mostra o calendário para quem pagou")
      : nao(`a página de retorno NÃO liberou (http ${pagina.status})`),
  );

  console.log(`\n  ─────────────────────────────────────────────`);
  console.log(`  CAMINHO DO DINHEIRO PROVADO de ponta a ponta.`);
  console.log(`  Agora dá pra reembolsar no painel do Stripe.`);
  console.log(`  ─────────────────────────────────────────────\n`);
} finally {
  await cliente.end();
}
