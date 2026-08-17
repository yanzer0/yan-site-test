import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { cancelarBooking } from "@/lib/diagnostico/cal-api";
import {
  acharSessaoDoPagamento,
  EVENTO_REEMBOLSO,
  reembolsouTudo,
} from "@/lib/diagnostico/stripe";

/**
 * O reembolso desfaz o pedido: dinheiro devolvido, call cancelada, horário
 * liberado para quem pagaria.
 *
 * Por que isto virou código e teste: o schema já previa o estado `reembolsado`
 * desde o começo e NADA no código escrevia esse valor. O webhook do Stripe
 * estava inscrito num evento só. Reembolsar devolvia o dinheiro e deixava a
 * call de pé na agenda, com o horário bloqueado. É o pior caso comercial do
 * funil, e era silencioso.
 *
 * O que se testa aqui são as bordas que dão para exercitar sem banco: o cliente
 * do Cal.com e a busca de sessão no Stripe. A parte de SQL é coberta pela prova
 * ponta a ponta em `provar-reembolso.mjs`, que roda contra o banco de verdade.
 */

const fetchOriginal = globalThis.fetch;

beforeEach(() => {
  vi.unstubAllEnvs();
});

afterEach(() => {
  globalThis.fetch = fetchOriginal;
  vi.unstubAllEnvs();
});

/** Troca o fetch por um que responde o que o teste mandar. */
function fetchQueResponde(status: number, corpo: unknown) {
  const espiao = vi.fn(async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => corpo,
  }));
  globalThis.fetch = espiao as unknown as typeof fetch;
  return espiao;
}

describe("evento que o Stripe precisa mandar", () => {
  it("e charge.refunded, nao refund.created", () => {
    // refund.created dispara ANTES de saber se o reembolso vai vingar.
    // Cancelar a call de alguem por um reembolso que falhou seria pior que nao
    // cancelar: o cliente fica sem a call E sem o dinheiro de volta.
    expect(EVENTO_REEMBOLSO).toBe("charge.refunded");
  });
});

describe("reembolso parcial nao cancela a call", () => {
  // O proprio painel do Stripe avisa: charge.refunded ocorre "including partial
  // refunds". Devolver R$ 50 de R$ 197 e tirar a call da pessoa seria pior que
  // nao cancelar nada: ela pagou a maior parte e perderia a hora.
  const CHEIO = 19700;

  it("devolucao integral desfaz", () => {
    expect(reembolsouTudo({ amount: CHEIO, amount_refunded: CHEIO, refunded: true })).toBe(true);
  });

  it("devolucao parcial NAO desfaz", () => {
    expect(reembolsouTudo({ amount: CHEIO, amount_refunded: 5000, refunded: false })).toBe(false);
  });

  it("confia no campo refunded do Stripe quando ele vem", () => {
    expect(reembolsouTudo({ refunded: true })).toBe(true);
  });

  it("sem o campo refunded, compara os valores", () => {
    expect(reembolsouTudo({ amount: CHEIO, amount_refunded: CHEIO })).toBe(true);
    expect(reembolsouTudo({ amount: CHEIO, amount_refunded: CHEIO - 1 })).toBe(false);
  });

  it("payload vazio nao e tratado como reembolso total", () => {
    // Cancelar a call de alguem por um payload que nao diz nada seria destruir
    // com base em ausencia de informacao.
    expect(reembolsouTudo({})).toBe(false);
    expect(reembolsouTudo({ amount: 0, amount_refunded: 0 })).toBe(false);
  });
});

describe("cancelarBooking", () => {
  it("sem CAL_API_KEY nao inventa sucesso", async () => {
    vi.stubEnv("CAL_API_KEY", "");
    const espiao = fetchQueResponde(200, {});

    const r = await cancelarBooking("uid-123", "Pagamento reembolsado");

    expect(r.estado).toBe("sem_credencial");
    expect(espiao, "nao pode nem tentar chamar sem credencial").not.toHaveBeenCalled();
  });

  it("cancela e devolve cancelado", async () => {
    vi.stubEnv("CAL_API_KEY", "cal_live_fake");
    const espiao = fetchQueResponde(200, { status: "success" });

    const r = await cancelarBooking("uid-123", "Pagamento reembolsado");

    expect(r.estado).toBe("cancelado");
    expect(espiao).toHaveBeenCalledOnce();
  });

  it("usa a v2 e fixa a versao da API", async () => {
    vi.stubEnv("CAL_API_KEY", "cal_live_fake");
    const espiao = fetchQueResponde(200, {});

    await cancelarBooking("uid-123", "Pagamento reembolsado");

    const [url, opcoes] = espiao.mock.calls[0] as unknown as [string, RequestInit];
    // A v1 foi descomissionada e responde 410.
    expect(url).toContain("https://api.cal.com/v2/bookings/uid-123/cancel");
    expect((opcoes.headers as Record<string, string>)["cal-api-version"]).toBe("2024-08-13");
  });

  it("escapa o uid na URL", async () => {
    vi.stubEnv("CAL_API_KEY", "cal_live_fake");
    const espiao = fetchQueResponde(200, {});

    await cancelarBooking("uid/../../admin", "motivo");

    const [url] = espiao.mock.calls[0] as unknown as [string];
    expect(url).not.toContain("uid/../../admin");
    expect(url).toContain(encodeURIComponent("uid/../../admin"));
  });

  it("booking ja cancelado nao e falha", async () => {
    // O Stripe reentrega. A segunda entrega acha o booking ja cancelado, e
    // tratar isso como erro alertaria o time sem haver problema nenhum.
    vi.stubEnv("CAL_API_KEY", "cal_live_fake");
    fetchQueResponde(400, { error: { message: "Booking already cancelled" } });

    const r = await cancelarBooking("uid-123", "motivo");

    expect(r.estado).toBe("ja_cancelado");
  });

  it("erro de verdade volta como falhou, com motivo", async () => {
    vi.stubEnv("CAL_API_KEY", "cal_live_fake");
    fetchQueResponde(403, { error: { message: "Forbidden" } });

    const r = await cancelarBooking("uid-123", "motivo");

    expect(r.estado).toBe("falhou");
    expect(r).toHaveProperty("motivo");
    if (r.estado === "falhou") expect(r.motivo).toContain("403");
  });

  it("nunca lanca, mesmo com a rede caindo", async () => {
    // Quem chama e um webhook de dinheiro. Excecao aqui faria o Stripe
    // reentregar um evento cujo lado do dinheiro ja foi processado.
    vi.stubEnv("CAL_API_KEY", "cal_live_fake");
    globalThis.fetch = vi.fn(async () => {
      throw new Error("ECONNREFUSED");
    }) as unknown as typeof fetch;

    const r = await cancelarBooking("uid-123", "motivo");

    expect(r.estado).toBe("falhou");
  });
});

describe("acharSessaoDoPagamento (caminho degradado)", () => {
  it("devolve o id da sessao quando o Stripe conhece o pagamento", async () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "rk_live_fake");
    fetchQueResponde(200, { data: [{ id: "cs_live_abc" }] });

    expect(await acharSessaoDoPagamento("pi_123")).toBe("cs_live_abc");
  });

  it("devolve null quando nao acha, em vez de lancar", async () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "rk_live_fake");
    fetchQueResponde(200, { data: [] });

    expect(await acharSessaoDoPagamento("pi_123")).toBeNull();
  });

  it("devolve null quando o Stripe recusa a chave restrita", async () => {
    // A chave de producao e restrita. Se ela nao puder listar sessoes por
    // payment_intent, o caminho degradado falha e o alerta assume.
    vi.stubEnv("STRIPE_SECRET_KEY", "rk_live_fake");
    fetchQueResponde(403, { error: { message: "permission" } });

    expect(await acharSessaoDoPagamento("pi_123")).toBeNull();
  });

  it("sem chave nao chama a API", async () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "");
    const espiao = fetchQueResponde(200, { data: [{ id: "cs_x" }] });

    expect(await acharSessaoDoPagamento("pi_123")).toBeNull();
    expect(espiao).not.toHaveBeenCalled();
  });
});
