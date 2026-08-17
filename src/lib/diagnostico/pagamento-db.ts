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
  /**
   * O PaymentIntent da sessão. Opcional porque nem toda forma de pagamento gera
   * um, e porque pedidos gravados antes desta coluna existir não têm.
   *
   * É por ele que o reembolso encontra o pedido: `charge.refunded` traz o
   * PaymentIntent e NÃO traz o id da sessão de checkout.
   */
  readonly paymentIntent?: string | null;
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
      INSERT INTO pedidos_mapa (
        stripe_session_id, stripe_payment_intent, lead_id,
        email, email_norm, valor_centavos, moeda
      )
      VALUES (
        ${pedido.stripeSessionId},
        ${pedido.paymentIntent ?? null},
        (SELECT id FROM leads WHERE email_norm = ${emailNorm} ORDER BY criado_em DESC LIMIT 1),
        ${pedido.email}, ${emailNorm}, ${pedido.valorCentavos}, ${pedido.moeda}
      )
      ON CONFLICT (stripe_session_id) DO UPDATE
        -- Reentrega não altera nada, EXCETO preencher o PaymentIntent quando ele
        -- faltava. Um pedido gravado antes desta coluna existir fica curável na
        -- próxima reentrega, em vez de ficar para sempre sem como ser reembolsado.
        SET stripe_payment_intent = COALESCE(
              pedidos_mapa.stripe_payment_intent, EXCLUDED.stripe_payment_intent
            )
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

/**
 * Marca que o pagamento virou call marcada. Fecha o ciclo do pedido.
 *
 * Devolve `true` quando havia mesmo um pedido pago para consumir. `false` é o
 * caso normal do lead qualificado, que agenda sem ter pago nada.
 */
export async function vincularAgendamentoPago(
  email: string,
  calBookingId: string,
): Promise<boolean> {
  try {
    const r = await sql`
      UPDATE pedidos_mapa
         SET estado = 'agendado', cal_booking_id = ${calBookingId}, atualizado_em = now()
       WHERE email_norm = ${normalizarEmail(email)}
         AND estado = 'pago'
    `;
    return (r.rowCount ?? 0) > 0;
  } catch (causa) {
    throw new ErroPersistencia("vincular agendamento pago", causa);
  }
}

/** O que sobra de um pedido reembolsado, para o chamador saber o que desfazer. */
export interface PedidoReembolsado {
  readonly stripeSessionId: string;
  /** O booking a cancelar. `null` quando o lead reembolsou antes de agendar. */
  readonly calBookingId: string | null;
  /** Já estava reembolsado quando este evento chegou (reentrega do Stripe). */
  readonly jaEstava: boolean;
}

/**
 * Marca o pedido como reembolsado e devolve o que precisa ser desfeito.
 *
 * Idempotente de propósito: o Stripe reentrega, e um reembolso processado duas
 * vezes não pode cancelar duas vezes nem alertar duas vezes. O `WHERE` só pega
 * pedido que ainda NÃO está reembolsado, então a segunda entrega não atualiza
 * linha nenhuma e volta com `jaEstava: true`.
 *
 * Devolve `null` quando o PaymentIntent não é de nenhum pedido nosso. Isso é
 * informação, não erro: significa reembolso de uma cobrança que não veio deste
 * funil, e quem chama decide se ignora.
 */
export async function reembolsarPedido(paymentIntent: string): Promise<PedidoReembolsado | null> {
  try {
    const atualizado = await sql<{ stripe_session_id: string; cal_booking_id: string | null }>`
      UPDATE pedidos_mapa
         SET estado = 'reembolsado', reembolsado_em = now(), atualizado_em = now()
       WHERE stripe_payment_intent = ${paymentIntent}
         AND estado <> 'reembolsado'
      RETURNING stripe_session_id, cal_booking_id
    `;

    const linha = atualizado.rows[0];
    if (linha) {
      return {
        stripeSessionId: linha.stripe_session_id,
        calBookingId: linha.cal_booking_id,
        jaEstava: false,
      };
    }

    // Nada atualizado: ou o pedido já estava reembolsado, ou não é nosso.
    const existente = await sql<{ stripe_session_id: string; cal_booking_id: string | null }>`
      SELECT stripe_session_id, cal_booking_id
        FROM pedidos_mapa
       WHERE stripe_payment_intent = ${paymentIntent}
       LIMIT 1
    `;

    const anterior = existente.rows[0];
    if (!anterior) return null;

    return {
      stripeSessionId: anterior.stripe_session_id,
      calBookingId: anterior.cal_booking_id,
      jaEstava: true,
    };
  } catch (causa) {
    throw new ErroPersistencia("reembolsar pedido", causa);
  }
}

/**
 * Preenche o PaymentIntent de um pedido que foi gravado sem ele.
 *
 * Existe para os pedidos anteriores a esta coluna: quando o reembolso chega e
 * não acha ninguém pelo PaymentIntent, o webhook busca a sessão no Stripe e
 * cura o registro por aqui, em vez de desistir do reembolso.
 */
export async function anotarPaymentIntent(
  stripeSessionId: string,
  paymentIntent: string,
): Promise<boolean> {
  try {
    const r = await sql`
      UPDATE pedidos_mapa
         SET stripe_payment_intent = ${paymentIntent}, atualizado_em = now()
       WHERE stripe_session_id = ${stripeSessionId}
         AND stripe_payment_intent IS NULL
    `;
    return (r.rowCount ?? 0) > 0;
  } catch (causa) {
    throw new ErroPersistencia("anotar payment intent", causa);
  }
}
