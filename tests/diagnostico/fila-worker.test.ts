import { readFileSync } from "node:fs";
import { join } from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { chamarApi } from "../../scripts/diagnostico/roteiro-http.mjs";

const ROOT = join(import.meta.dirname, "..", "..");
const queueRoute = readFileSync(
  join(ROOT, "src", "app", "api", "diagnostico", "roteiro", "fila", "route.ts"),
  "utf8",
);
const worker = readFileSync(
  join(ROOT, "scripts", "diagnostico", "servico-roteiro.mjs"),
  "utf8",
);

describe("the script worker queue cadence", () => {
  it("never holds the HTTP request open while waiting for work", () => {
    expect(queueRoute).not.toContain("ESPERA_MAXIMA_S");
    expect(queueRoute).not.toContain("INTERVALO_DA_ESPERA_MS");
    expect(queueRoute).not.toMatch(/while \(fila\.length === 0/);
  });

  it("polls quickly and waits locally between successful rounds", () => {
    expect(worker).not.toContain("?esperar=");
    expect(worker).toContain("const PAUSA_ENTRE_CONSULTAS_MS = 60_000");
    expect(worker).toContain(
      "await dormir(pausar ? PAUSA_APOS_ERRO_MS : PAUSA_ENTRE_CONSULTAS_MS)",
    );
  });
});

describe("the script worker HTTP transport", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("retries an idempotent completion once after a transient socket failure", async () => {
    const socketError = Object.assign(new TypeError("fetch failed"), {
      cause: Object.assign(new Error("other side closed"), { code: "UND_ERR_SOCKET" }),
    });
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(socketError)
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );
    const dormir = vi.fn().mockResolvedValue(undefined);
    const aoRepetir = vi.fn();

    const result = await chamarApi({
      baseUrl: "https://worker.test",
      segredo: "test-secret",
      caminho: "/api/diagnostico/roteiro/concluir",
      opcoes: { method: "POST", body: "{}" },
      repetirFalhaTransitoria: true,
      fetchFn: fetchMock,
      dormir,
      aoRepetir,
    });

    expect(result).toEqual({ ok: true, status: 200, corpo: { ok: true } });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0]?.[1]?.headers).toMatchObject({ Connection: "close" });
    expect(dormir).toHaveBeenCalledOnce();
    expect(aoRepetir).toHaveBeenCalledWith({
      caminho: "/api/diagnostico/roteiro/concluir",
      codigo: "UND_ERR_SOCKET",
      mensagem: "other side closed",
    });
  });

  it("does not retry the queue reservation after a transport failure", async () => {
    const socketError = Object.assign(new TypeError("fetch failed"), {
      cause: Object.assign(new Error("other side closed"), { code: "UND_ERR_SOCKET" }),
    });
    const fetchMock = vi.fn().mockRejectedValue(socketError);

    await expect(
      chamarApi({
        baseUrl: "https://worker.test",
        segredo: "test-secret",
        caminho: "/api/diagnostico/roteiro/fila",
        fetchFn: fetchMock,
      }),
    ).rejects.toThrow("UND_ERR_SOCKET: other side closed");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("does not retry an HTTP failure response", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ erro: "nao_autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const result = await chamarApi({
      baseUrl: "https://worker.test",
      segredo: "test-secret",
      caminho: "/api/diagnostico/roteiro/concluir",
      opcoes: { method: "POST", body: "{}" },
      repetirFalhaTransitoria: true,
      fetchFn: fetchMock,
    });

    expect(result).toEqual({
      ok: false,
      status: 401,
      corpo: { erro: "nao_autorizado" },
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("does not retry a permanent transport failure", async () => {
    const certificateError = Object.assign(new TypeError("fetch failed"), {
      cause: Object.assign(new Error("certificate has expired"), {
        code: "CERT_HAS_EXPIRED",
      }),
    });
    const fetchMock = vi.fn().mockRejectedValue(certificateError);

    await expect(
      chamarApi({
        baseUrl: "https://worker.test",
        segredo: "test-secret",
        caminho: "/api/diagnostico/roteiro/concluir",
        opcoes: { method: "POST", body: "{}" },
        repetirFalhaTransitoria: true,
        fetchFn: fetchMock,
      }),
    ).rejects.toThrow("CERT_HAS_EXPIRED: certificate has expired");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
