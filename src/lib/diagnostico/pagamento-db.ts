/**
 * Pedidos pagos do Mapa de IA no Postgres.
 *
 * Quem decide se o lead pode agendar a call paga é este banco, e não a query
 * string da URL de retorno.
 */

import { sql } from "@vercel/postgres";

import { ErroPersistencia } from "./db";
import { normalizarEmail } from "./normalizar";

export interface PedidoPago {
  readonly stripeSessionId: string;
  readonly email: string;
  readonly valorCentavos: number;
  readonly moeda: string;
}

/**
 * Grava o pagamento. Idempotente por sessão: o Stripe reentrega webhook, e
 * reentrega é operação normal, não erro.
 *
 * Vincula ao lead pelo e-mail quando ele já existe. Quando não existe (alguém
 * pagou por um link repassado sem ter preenchido o formulário), grava mesmo
 * assim: o dinheiro entrou e o pedido precisa existir.
 */
export async function registrarPagamento(pedido: PedidoPago): Promise<void> {
  const emailNorm = normalizarEmail(pedido.email);
  try {
    await sql`
      INSERT INTO pedidos_mapa (stripe_session_id, lead_id, email, email_norm, valor_centavos, moeda)
      VALUES (
        ${pedido.stripeSessionId},
        (SELECT id FROM leads WHERE email_norm = ${emailNorm} ORDER BY criado_em DESC LIMIT 1),
        ${pedido.email}, ${emailNorm}, ${pedido.valorCentavos}, ${pedido.moeda}
      )
      ON CONFLICT (stripe_session_id) DO NOTHING
    `;
  } catch (causa) {
    throw new ErroPersistencia("registrar pagamento", causa);
  }
}

/**
 * Este e-mail tem pagamento válido e ainda não usado?
 *
 * `pago` libera o agendamento; `agendado` não, porque a call paga é uma por
 * pagamento. Sem isso, um link de retorno guardado no histórico do navegador
 * vira agendamento infinito.
 */
export async function pagamentoLiberaAgendamento(email: string): Promise<boolean> {
  try {
    const r = await sql<{ existe: boolean }>`
      SELECT EXISTS (
        SELECT 1 FROM pedidos_mapa
         WHERE email_norm = ${normalizarEmail(email)} AND estado = 'pago'
      ) AS existe
    `;
    return r.rows[0]?.existe ?? false;
  } catch (causa) {
    throw new ErroPersistencia("consultar pagamento", causa);
  }
}

/** Marca que o pagamento virou call marcada. Fecha o ciclo do pedido. */
export async function vincularAgendamentoPago(
  email: string,
  calBookingId: string,
): Promise<void> {
  try {
    await sql`
      UPDATE pedidos_mapa
         SET estado = 'agendado', cal_booking_id = ${calBookingId}, atualizado_em = now()
       WHERE email_norm = ${normalizarEmail(email)}
         AND estado = 'pago'
    `;
  } catch (causa) {
    throw new ErroPersistencia("vincular agendamento pago", causa);
  }
}
