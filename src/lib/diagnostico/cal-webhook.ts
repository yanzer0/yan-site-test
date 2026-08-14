/**
 * Verificação e leitura do webhook do Cal.com.
 *
 * Separado da rota para ser testável sem HTTP. A rota fica só com o transporte.
 *
 * O Cal.com assina o raw body com HMAC-SHA256 e manda no header
 * `x-cal-signature-256`. Diferença para o webhook da Kiwify, que já existe neste
 * repo: lá o algoritmo é SHA-1.
 */

import { createHmac, timingSafeEqual } from "node:crypto";

/** Eventos que interessam. Qualquer outro é ignorado com 200. */
export const EVENTOS_TRATADOS = [
  "BOOKING_CREATED",
  "BOOKING_CANCELLED",
  "BOOKING_RESCHEDULED",
] as const;

export type EventoCal = (typeof EVENTOS_TRATADOS)[number];

export interface PayloadCal {
  readonly triggerEvent?: string;
  readonly payload?: {
    readonly uid?: string;
    readonly startTime?: string;
    readonly attendees?: readonly { readonly email?: string; readonly name?: string }[];
    readonly responses?: Record<string, unknown>;
  };
}

/**
 * Compara a assinatura em tempo constante.
 *
 * O `timingSafeEqual` exige buffers do mesmo tamanho, e ele próprio lança se
 * forem diferentes. Por isso o tamanho é checado antes: assinatura de tamanho
 * errado é rejeitada sem exceção, que é o caminho normal de um payload forjado.
 */
export function assinaturaConfere(rawBody: string, assinatura: string, segredo: string): boolean {
  if (!assinatura || !segredo) return false;

  const esperada = createHmac("sha256", segredo).update(rawBody).digest("hex");
  const a = Buffer.from(esperada, "utf8");
  const b = Buffer.from(assinatura.trim().toLowerCase(), "utf8");

  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function eventoTratado(evento: string | undefined): evento is EventoCal {
  return typeof evento === "string" && (EVENTOS_TRATADOS as readonly string[]).includes(evento);
}

export interface AgendamentoLido {
  readonly bookingId: string;
  readonly inicioEm: Date;
  readonly email: string;
}

/**
 * Extrai o que interessa do payload, ou null quando falta o essencial.
 *
 * Devolver null em vez de lançar é deliberado: payload de terceiro chegando
 * incompleto é caso esperado, não excepcional, e o chamador responde 200 para
 * não provocar tempestade de retry.
 */
export function lerAgendamento(corpo: PayloadCal): AgendamentoLido | null {
  const bookingId = corpo.payload?.uid;
  const inicio = corpo.payload?.startTime;
  const email = corpo.payload?.attendees?.[0]?.email;

  if (!bookingId || !inicio || !email) return null;

  const inicioEm = new Date(inicio);
  if (Number.isNaN(inicioEm.getTime())) return null;

  return { bookingId, inicioEm, email };
}
