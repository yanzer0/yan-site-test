import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

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
