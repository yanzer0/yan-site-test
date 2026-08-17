/**
 * Webhook do Stripe: registra o pagamento do Mapa de IA (R$ 197).
 *
 * Quem libera o agendamento é este registro, não a URL de retorno. O visitante
 * controla a URL; não controla o banco.
 *
 * Responde 200 mesmo quando não consegue processar, de propósito: código de
 * erro faz o Stripe entrar em retry, e retry não conserta payload que não
 * interessa. A exceção é falha de persistência, que devolve 500 justamente
 * PARA o Stripe reentregar — perder um pagamento é o que não pode acontecer.
 *
 * Envs:
 *   STRIPE_WEBHOOK_SECRET  (sensível)
 *   POSTGRES_URL           (sensível)
 */

import { NextRequest, NextResponse } from "next/server";

import { alertar } from "@/lib/diagnostico/alerta";
import { registrarPagamento } from "@/lib/diagnostico/pagamento-db";
import {
  assinaturaStripeConfere,
  EVENTO_PAGAMENTO,
  type EventoStripe,
} from "@/lib/diagnostico/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SessaoDoEvento {
  readonly id?: string;
  readonly payment_status?: string;
  readonly amount_total?: number;
  readonly currency?: string;
  readonly customer_details?: { readonly email?: string | null };
  readonly customer_email?: string | null;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const segredo = process.env.STRIPE_WEBHOOK_SECRET;
  if (!segredo) {
    console.error("[mapa-pago/webhook] STRIPE_WEBHOOK_SECRET nao configurado");
    return NextResponse.json({ erro: "config_missing" }, { status: 500 });
  }

  const rawBody = await req.text();
  const assinatura = req.headers.get("stripe-signature") ?? "";
  const agora = Math.floor(Date.now() / 1000);

  if (!assinaturaStripeConfere(rawBody, assinatura, segredo, agora)) {
    return NextResponse.json({ erro: "invalid_signature" }, { status: 401 });
  }

  let evento: EventoStripe;
  try {
    evento = JSON.parse(rawBody) as EventoStripe;
  } catch {
    return NextResponse.json({ erro: "invalid_json" }, { status: 400 });
  }

  if (evento.type !== EVENTO_PAGAMENTO) {
    return NextResponse.json({ ok: true, ignorado: evento.type ?? "sem_tipo" });
  }

  const sessao = evento.data?.object as SessaoDoEvento | undefined;
  const email = sessao?.customer_details?.email ?? sessao?.customer_email ?? null;

  if (!sessao?.id || !email || sessao.payment_status !== "paid") {
    // Não é erro do Stripe, então não se pede retry. Mas alguém precisa ver:
    // é dinheiro que entrou sem virar pedido.
    console.error(`[mapa-pago/webhook] sessao incompleta: ${sessao?.id ?? "sem id"}`);
    await alertar({
      source: "funil-diagnostico/mapa-pago",
      severity: "error",
      message: `Pagamento do Mapa de IA chegou sem dados suficientes. sessao=${sessao?.id ?? "?"} status=${sessao?.payment_status ?? "?"}. Conferir no painel do Stripe.`,
    });
    return NextResponse.json({ ok: false, erro: "sessao_incompleta" });
  }

  try {
    await registrarPagamento({
      stripeSessionId: sessao.id,
      email,
      valorCentavos: sessao.amount_total ?? 0,
      moeda: sessao.currency ?? "brl",
    });
  } catch {
    // 500 aqui é PROPOSITAL: faz o Stripe reentregar. Pagamento que não vira
    // pedido é o único erro deste fluxo que não tem conserto manual barato.
    console.error(`[mapa-pago/webhook] falha ao gravar pedido da sessao ${sessao.id}`);
    await alertar({
      source: "funil-diagnostico/mapa-pago",
      severity: "error",
      message: `PAGOU E NAO GRAVOU. sessao=${sessao.id}. O Stripe vai reentregar; se nao resolver, liberar o agendamento a mao.`,
    });
    return NextResponse.json({ erro: "storage_failed" }, { status: 500 });
  }

  await alertar({
    source: "funil-diagnostico/mapa-pago",
    severity: "info",
    message: `Mapa de IA vendido. sessao=${sessao.id} valor=${((sessao.amount_total ?? 0) / 100).toFixed(2)} ${(sessao.currency ?? "brl").toUpperCase()}.`,
  });

  return NextResponse.json({ ok: true });
}
