/**
 * Webhook do Cal.com: vincula o agendamento ao lead que já foi persistido.
 *
 * Fluxo:
 *   1. Verifica HMAC-SHA256 do raw body contra `x-cal-signature-256`.
 *      Assinatura inválida => 401 e nada é gravado.
 *   2. Evento fora da lista tratada => 200 com marca de ignorado.
 *   3. BOOKING_CREATED vincula; CANCELLED e RESCHEDULED atualizam o estado.
 *
 * Responde 200 mesmo em falha de vínculo, de propósito: código de erro faria o
 * Cal.com entrar em retry, e o problema não é do lado dele. A falha vai para o
 * log e para o alerta. Mesma política do kiwify-webhook que já existe aqui.
 *
 * Envs:
 *   CAL_WEBHOOK_SECRET  (sensível, o mesmo configurado no painel do Cal.com)
 *   POSTGRES_URL        (sensível)
 *
 * Consumidor adicional: a feature 003 gera o roteiro da call. Aqui só se
 * ENFILEIRA — quem gera é o worker que roda na máquina do Yan, onde o brain
 * vive. O webhook precisa responder em milissegundos e o `/call-roteiro` leva
 * minutos, então acoplar os dois faria o Cal.com dar timeout e reentregar.
 */

import { NextRequest, NextResponse } from "next/server";

import {
  assinaturaConfere,
  eventoTratado,
  lerAgendamento,
  type PayloadCal,
} from "@/lib/diagnostico/cal-webhook";
import {
  atualizarEstadoAgendamento,
  buscarLeadPorContato,
  vincularAgendamento,
} from "@/lib/diagnostico/db";
import { enfileirarRoteiro } from "@/lib/diagnostico/roteiro-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const segredo = process.env.CAL_WEBHOOK_SECRET;
  if (!segredo) {
    console.error("[diagnostico/cal-webhook] CAL_WEBHOOK_SECRET nao configurado");
    return NextResponse.json({ erro: "config_missing" }, { status: 500 });
  }

  const rawBody = await req.text();
  const assinatura = req.headers.get("x-cal-signature-256") ?? "";

  if (!assinaturaConfere(rawBody, assinatura, segredo)) {
    return NextResponse.json({ erro: "invalid_signature" }, { status: 401 });
  }

  let corpo: PayloadCal;
  try {
    corpo = JSON.parse(rawBody) as PayloadCal;
  } catch {
    return NextResponse.json({ erro: "invalid_json" }, { status: 400 });
  }

  if (!eventoTratado(corpo.triggerEvent)) {
    return NextResponse.json({ ok: true, ignorado: corpo.triggerEvent ?? "sem_evento" });
  }

  const agendamento = lerAgendamento(corpo);
  if (!agendamento) {
    console.error("[diagnostico/cal-webhook] payload sem uid, startTime ou attendee");
    return NextResponse.json({ ok: false, erro: "payload_incompleto" });
  }

  try {
    if (corpo.triggerEvent === "BOOKING_CANCELLED") {
      // Não há limpeza a fazer na agenda: o roteiro é ANEXO do evento da call,
      // e o Cal.com apaga o evento inteiro ao cancelar. O PDF fica no Drive de
      // propósito — lead que cancelou continua sendo lead, e o diagnóstico
      // continua valendo (FR-022).
      await atualizarEstadoAgendamento(agendamento.bookingId, "cancelado");
      return NextResponse.json({ ok: true });
    }

    const leadId = await buscarLeadPorContato(agendamento.email, null);
    if (!leadId) {
      // Agendou sem ter passado pelo formulário. Não é erro do Cal.com.
      console.error(`[diagnostico/cal-webhook] agendamento sem lead: ${agendamento.bookingId}`);
      return NextResponse.json({ ok: false, erro: "lead_nao_encontrado" });
    }

    await vincularAgendamento(leadId, agendamento.bookingId, agendamento.inicioEm);

    if (corpo.triggerEvent === "BOOKING_RESCHEDULED") {
      // FR-022: remarcação muda a data e NÃO regera o roteiro. O diagnóstico é
      // o mesmo, e o modo é único, então o conteúdo não mudaria em nada.
      await atualizarEstadoAgendamento(agendamento.bookingId, "remarcado");
      return NextResponse.json({ ok: true });
    }

    await enfileirarRoteiro(agendamento.bookingId);
    return NextResponse.json({ ok: true, enfileirado: true });
  } catch {
    console.error(`[diagnostico/cal-webhook] falha ao vincular ${agendamento.bookingId}`);
    return NextResponse.json({ ok: false, erro: "vinculo_falhou" });
  }
}
