/**
 * Webhook do Stripe: o dinheiro do Mapa de IA (R$ 197), nos dois sentidos.
 *
 * Quem libera o agendamento é este registro, não a URL de retorno. O visitante
 * controla a URL; não controla o banco.
 *
 * Dois eventos, simétricos:
 *   `checkout.session.completed` cria o pedido e libera o agendamento.
 *   `charge.refunded`            desfaz: marca reembolsado e cancela a call.
 *
 * O reembolso precisa cancelar de verdade. Sem isso, quem pede o dinheiro de
 * volta fica com a hora na agenda e o horário bloqueado para quem pagaria: o
 * pior caso comercial do funil. E quem cancela é o Cal.com, não o Google, porque
 * é o Cal.com que detém o slot; apagar só o evento do Google devolveria a hora
 * na agenda sem devolver o horário para venda.
 *
 * Responde 200 mesmo quando não consegue processar, de propósito: código de
 * erro faz o Stripe entrar em retry, e retry não conserta payload que não
 * interessa. A exceção é falha de persistência, que devolve 500 justamente
 * PARA o Stripe reentregar — perder um pagamento é o que não pode acontecer.
 *
 * Envs:
 *   STRIPE_WEBHOOK_SECRET  (sensível)
 *   STRIPE_SECRET_KEY      (sensível, só no caminho degradado do reembolso)
 *   CAL_API_KEY            (sensível, sem ela o cancelamento vira alerta)
 *   POSTGRES_URL           (sensível)
 */

import { NextRequest, NextResponse } from "next/server";

import { alertar } from "@/lib/diagnostico/alerta";
import { cancelarBooking } from "@/lib/diagnostico/cal-api";
import {
  anotarPaymentIntent,
  registrarPagamento,
  reembolsarPedido,
} from "@/lib/diagnostico/pagamento-db";
import {
  acharSessaoDoPagamento,
  assinaturaStripeConfere,
  EVENTO_PAGAMENTO,
  EVENTO_REEMBOLSO,
  type EventoStripe,
} from "@/lib/diagnostico/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SessaoDoEvento {
  readonly id?: string;
  readonly payment_status?: string;
  readonly amount_total?: number;
  readonly currency?: string;
  readonly payment_intent?: string | null;
  readonly customer_details?: { readonly email?: string | null };
  readonly customer_email?: string | null;
}

interface CobrancaDoEvento {
  readonly id?: string;
  readonly payment_intent?: string | null;
  readonly amount_refunded?: number;
  readonly refunded?: boolean;
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

  if (evento.type === EVENTO_REEMBOLSO) {
    return processarReembolso(evento.data?.object as CobrancaDoEvento | undefined);
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
      // Sem isto o reembolso não encontra este pedido depois: `charge.refunded`
      // traz o PaymentIntent e não traz o id da sessão.
      paymentIntent: sessao.payment_intent ?? null,
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

const ORIGEM_ALERTA = "funil-diagnostico/mapa-pago";

/**
 * Desfaz o pedido reembolsado e cancela a call.
 *
 * A ordem importa: marca no banco PRIMEIRO, cancela depois. Se o Cal.com
 * estiver fora do ar, o pedido já consta reembolsado e o agendamento não é
 * liberado de novo para o mesmo e-mail; o cancelamento vira alerta e alguém
 * resolve à mão. O contrário — cancelar antes de marcar — deixaria a janela em
 * que a call some da agenda mas o banco ainda acha que o pedido está de pé.
 *
 * Sempre 200: a esta altura o dinheiro já voltou ao cliente pelo Stripe. Retry
 * não desfaz reembolso, e o que falta é trabalho humano, não reentrega.
 */
async function processarReembolso(cobranca: CobrancaDoEvento | undefined): Promise<NextResponse> {
  const paymentIntent = cobranca?.payment_intent;
  if (!paymentIntent) {
    console.error("[mapa-pago/webhook] charge.refunded sem payment_intent");
    return NextResponse.json({ ok: false, erro: "sem_payment_intent" });
  }

  let pedido = await reembolsarPedido(paymentIntent);

  // Caminho degradado: pedido gravado antes da coluna existir. Pergunta ao
  // Stripe qual foi a sessão, cura o registro e tenta de novo. Sem isso, um
  // pedido antigo reembolsaria no Stripe e ficaria de pé aqui, calado.
  if (!pedido) {
    const sessaoId = await acharSessaoDoPagamento(paymentIntent);
    if (sessaoId && (await anotarPaymentIntent(sessaoId, paymentIntent))) {
      pedido = await reembolsarPedido(paymentIntent);
    }
  }

  if (!pedido) {
    // Reembolso de cobrança que não é deste funil. Acontece: a mesma conta
    // Stripe vende outras coisas. Não é erro e não merece alerta.
    return NextResponse.json({ ok: true, ignorado: "pedido_nao_encontrado" });
  }

  if (pedido.jaEstava) {
    return NextResponse.json({ ok: true, jaProcessado: true });
  }

  if (!pedido.calBookingId) {
    // Reembolsou antes de agendar. Nada na agenda para desfazer.
    await alertar({
      source: ORIGEM_ALERTA,
      severity: "info",
      message: `Mapa de IA reembolsado antes de agendar. sessao=${pedido.stripeSessionId}. Nada a cancelar.`,
    });
    return NextResponse.json({ ok: true, cancelamento: "nao_havia_call" });
  }

  const cancelamento = await cancelarBooking(
    pedido.calBookingId,
    "Pagamento reembolsado",
  );

  if (cancelamento.estado === "cancelado" || cancelamento.estado === "ja_cancelado") {
    await alertar({
      source: ORIGEM_ALERTA,
      severity: "warning",
      message: `Mapa de IA reembolsado. sessao=${pedido.stripeSessionId} booking=${pedido.calBookingId}. Call cancelada e horario liberado.`,
    });
    return NextResponse.json({ ok: true, cancelamento: cancelamento.estado });
  }

  // 🔴 Dinheiro devolvido e call DE PÉ. É o estado que não pode passar calado:
  // o horário segue bloqueado para quem pagaria, e alguém precisa cancelar à mão.
  const porque =
    cancelamento.estado === "sem_credencial"
      ? "CAL_API_KEY nao configurada"
      : cancelamento.motivo;

  console.error(`[mapa-pago/webhook] reembolso sem cancelar ${pedido.calBookingId}: ${porque}`);
  await alertar({
    source: ORIGEM_ALERTA,
    severity: "error",
    message: `REEMBOLSOU E A CALL CONTINUA DE PE. sessao=${pedido.stripeSessionId} booking=${pedido.calBookingId}. Motivo: ${porque}. CANCELAR A MAO no Cal.com, senao o horario fica bloqueado.`,
  });

  return NextResponse.json({ ok: true, cancelamento: "falhou" });
}
