/**
 * Verificação do webhook do Stripe e leitura da sessão de checkout.
 *
 * Sem SDK de propósito. O que precisamos do Stripe são duas coisas — conferir
 * uma assinatura HMAC e ler uma sessão pela API REST — e as duas cabem em
 * poucas linhas. Uma dependência a menos é uma superfície a menos, e este
 * módulo lida com dinheiro.
 *
 * A assinatura do Stripe é diferente da do Cal.com: o header traz timestamp e
 * assinatura juntos (`t=...,v1=...`), e o que se assina é `timestamp.corpo`.
 * Copiar o esquema do outro webhook aqui daria "assinatura inválida" sempre.
 *
 * Envs:
 *   STRIPE_SECRET_KEY      (sensível)
 *   STRIPE_WEBHOOK_SECRET  (sensível)
 */

import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Janela de tolerância do timestamp, em segundos.
 *
 * Existe contra replay: sem ela, um webhook capturado uma vez vale para sempre.
 * Cinco minutos é o valor que a própria documentação do Stripe usa.
 */
export const TOLERANCIA_SEGUNDOS = 300;

export class ErroStripe extends Error {
  constructor(readonly motivo: string) {
    super(motivo);
    this.name = "ErroStripe";
  }
}

interface CabecalhoAssinatura {
  readonly timestamp: number;
  readonly assinaturas: readonly string[];
}

/** `t=1700000000,v1=abc...,v1=def...` → partes. */
function lerCabecalho(header: string): CabecalhoAssinatura | null {
  const partes = header.split(",").map((p) => p.trim().split("="));
  const timestamp = Number(partes.find(([k]) => k === "t")?.[1]);
  const assinaturas = partes.filter(([k]) => k === "v1").map(([, v]) => v);

  if (!Number.isFinite(timestamp) || assinaturas.length === 0) return null;
  return { timestamp, assinaturas };
}

function iguais(a: string, b: string): boolean {
  const x = Buffer.from(a, "utf8");
  const y = Buffer.from(b, "utf8");
  if (x.length !== y.length) return false;
  return timingSafeEqual(x, y);
}

/**
 * Confere a assinatura do webhook.
 *
 * `agoraEmSegundos` entra como parâmetro para o teste poder fixar o relógio, e
 * porque relógio errado já custou caro nesta base (ver o learning
 * `relogio-adiantado-quebra-jwt`).
 */
export function assinaturaStripeConfere(
  rawBody: string,
  header: string,
  segredo: string,
  agoraEmSegundos: number,
): boolean {
  if (!header || !segredo) return false;

  const cabecalho = lerCabecalho(header);
  if (!cabecalho) return false;

  if (Math.abs(agoraEmSegundos - cabecalho.timestamp) > TOLERANCIA_SEGUNDOS) return false;

  const esperada = createHmac("sha256", segredo)
    .update(`${cabecalho.timestamp}.${rawBody}`)
    .digest("hex");

  // Várias v1 podem vir durante a rotação do segredo. Basta uma bater.
  return cabecalho.assinaturas.some((recebida) => iguais(esperada, recebida));
}

export interface SessaoDeCheckout {
  readonly id: string;
  readonly pago: boolean;
  readonly email: string | null;
  readonly valorCentavos: number;
  readonly moeda: string;
}

interface RespostaSessao {
  readonly id?: string;
  readonly payment_status?: string;
  readonly amount_total?: number;
  readonly currency?: string;
  readonly customer_details?: { readonly email?: string | null };
  readonly customer_email?: string | null;
  readonly error?: { readonly message?: string };
}

/**
 * Lê a sessão direto do Stripe.
 *
 * A página de retorno recebe o `session_id` na URL, e URL é coisa que o
 * visitante controla. Quem decide se pagou é esta chamada, nunca o parâmetro.
 */
export async function lerSessao(sessionId: string): Promise<SessaoDeCheckout> {
  const chave = process.env.STRIPE_SECRET_KEY;
  if (!chave) throw new ErroStripe("STRIPE_SECRET_KEY ausente");

  const resposta = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
    { headers: { Authorization: `Bearer ${chave}` } },
  );

  const corpo = (await resposta.json()) as RespostaSessao;
  if (!resposta.ok) {
    throw new ErroStripe(`stripe respondeu ${resposta.status}: ${corpo.error?.message ?? ""}`);
  }

  return {
    id: corpo.id ?? sessionId,
    pago: corpo.payment_status === "paid",
    email: corpo.customer_details?.email ?? corpo.customer_email ?? null,
    valorCentavos: corpo.amount_total ?? 0,
    moeda: corpo.currency ?? "brl",
  };
}

export interface EventoStripe {
  readonly type?: string;
  readonly data?: { readonly object?: Record<string, unknown> };
}

/** Garante pagamento concluído. É o que cria o pedido. */
export const EVENTO_PAGAMENTO = "checkout.session.completed";

/**
 * Desfaz o pedido: dinheiro devolvido, call cancelada, horário liberado.
 *
 * É `charge.refunded` e não `refund.created` porque `charge.refunded` só dispara
 * quando o reembolso foi de fato efetivado. `refund.created` dispara antes de
 * saber se vai dar certo, e cancelar a call de alguém por um reembolso que
 * falhou seria o pior dos dois mundos.
 *
 * 🔴 Este evento precisa estar INSCRITO no destino do webhook no painel do
 * Stripe. Código que trata evento não inscrito nunca roda, e o silêncio parece
 * sucesso: o reembolso acontece, o dinheiro volta, e a call fica de pé.
 */
export const EVENTO_REEMBOLSO = "charge.refunded";

interface RespostaBusca {
  readonly data?: readonly { readonly id?: string }[];
  readonly error?: { readonly message?: string };
}

/**
 * Acha a sessão de checkout de um PaymentIntent.
 *
 * Só é chamada no caminho de exceção: quando um reembolso chega para um pedido
 * gravado antes de guardarmos o PaymentIntent. Sem ela, esses pedidos ficariam
 * para sempre sem como ser reembolsados automaticamente.
 *
 * Devolve `null` quando o Stripe não conhece esse PaymentIntent ou quando a
 * chamada falha. Quem chama já está num caminho degradado e trata os dois casos
 * do mesmo jeito: alerta um humano.
 */
export async function acharSessaoDoPagamento(paymentIntent: string): Promise<string | null> {
  const chave = process.env.STRIPE_SECRET_KEY;
  if (!chave) return null;

  try {
    const resposta = await fetch(
      `https://api.stripe.com/v1/checkout/sessions?payment_intent=${encodeURIComponent(paymentIntent)}&limit=1`,
      { headers: { Authorization: `Bearer ${chave}` } },
    );

    if (!resposta.ok) return null;

    const corpo = (await resposta.json()) as RespostaBusca;
    return corpo.data?.[0]?.id ?? null;
  } catch {
    return null;
  }
}
