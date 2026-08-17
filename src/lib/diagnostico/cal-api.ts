/**
 * Cancelamento de booking na API do Cal.com.
 *
 * Só existe uma operação aqui, e de propósito: cancelar. Este módulo é chamado
 * a partir de um webhook de dinheiro, e a regra da casa é que o agente não
 * ganha capacidade que o produto não precisa. Criar, remarcar e listar não
 * entram enquanto ninguém precisar.
 *
 * Cancelar no Cal.com é o único ponto que precisa ser tocado: é ele quem criou
 * o evento no Google Calendar e quem detém o slot. Cancelando ali, o Cal.com
 * apaga o evento da agenda, libera o horário para outro lead e ainda dispara
 * BOOKING_CANCELLED de volta para o nosso webhook, que atualiza o estado. Se
 * fôssemos apagar o evento direto no Google, o slot continuaria ocupado no
 * Cal.com e o horário nunca voltaria a ser vendido.
 *
 * API v2. A v1 foi descomissionada e responde 410.
 *
 * Env:
 *   CAL_API_KEY  (sensível, `cal_live_...`)
 */

const API = "https://api.cal.com/v2";

/** Quanto esperar pelo Cal.com antes de desistir. Estamos dentro de um webhook. */
const TIMEOUT_MS = 8000;

export type ResultadoCancelamento =
  | { readonly estado: "cancelado" }
  /** Já estava cancelado. Não é falha: reentrega de webhook chega aqui. */
  | { readonly estado: "ja_cancelado" }
  /** Sem CAL_API_KEY configurada. Alguém precisa cancelar à mão. */
  | { readonly estado: "sem_credencial" }
  | { readonly estado: "falhou"; readonly motivo: string };

interface RespostaCal {
  readonly status?: string;
  readonly error?: { readonly message?: string };
  readonly data?: { readonly status?: string };
}

/**
 * Cancela o booking.
 *
 * Nunca lança: quem chama é um webhook de pagamento, e uma exceção aqui faria o
 * Stripe reentregar um evento cujo lado do dinheiro já foi processado. O
 * resultado volta como valor para o chamador decidir se alerta.
 */
export async function cancelarBooking(
  bookingUid: string,
  motivo: string,
): Promise<ResultadoCancelamento> {
  const chave = process.env.CAL_API_KEY;
  if (!chave) return { estado: "sem_credencial" };

  const controle = new AbortController();
  const relogio = setTimeout(() => controle.abort(), TIMEOUT_MS);

  try {
    const resposta = await fetch(
      `${API}/bookings/${encodeURIComponent(bookingUid)}/cancel`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${chave}`,
          "Content-Type": "application/json",
          // A v2 versiona por header. Sem isso o Cal.com escolhe uma versão por
          // conta própria e o contrato muda sem aviso.
          "cal-api-version": "2024-08-13",
        },
        body: JSON.stringify({ cancellationReason: motivo }),
        signal: controle.signal,
      },
    );

    const corpo = (await resposta.json().catch(() => ({}))) as RespostaCal;

    if (resposta.ok) return { estado: "cancelado" };

    // O Cal.com responde 400 quando o booking já está cancelado. Tratar como
    // falha faria a reentrega do webhook alertar o time sem haver problema.
    const mensagem = corpo.error?.message ?? "";
    if (/already\s+cancelled|already\s+canceled/i.test(mensagem)) {
      return { estado: "ja_cancelado" };
    }

    return { estado: "falhou", motivo: `http ${resposta.status}: ${mensagem || "sem detalhe"}` };
  } catch (causa) {
    const motivoErro = causa instanceof Error && causa.name === "AbortError"
      ? `sem resposta em ${TIMEOUT_MS}ms`
      : "falha de rede";
    return { estado: "falhou", motivo: motivoErro };
  } finally {
    clearTimeout(relogio);
  }
}
