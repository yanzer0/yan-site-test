import { describe, expect, it } from "vitest";

import {
  parseEnvironment,
  validateProductionEnvironment,
} from "../../deploy/vps/validate-env.mjs";

function validEnvironment(): Record<string, string> {
  return {
    CAL_WEBHOOK_SECRET: "cal-webhook-" + "a".repeat(32),
    DEMO_MARJA_PASS: "demo-" + "b".repeat(24),
    DEMO_MARJA_USER: "infuser",
    GOOGLE_CALENDAR_ID: "agenda@group.calendar.google.com",
    GOOGLE_SERVICE_ACCOUNT_B64: Buffer.from(
      JSON.stringify({ client_email: "service@example.com", private_key: "private-key" }),
    ).toString("base64"),
    MAPA_PUBLICAR_SECRET: "mapa-" + "c".repeat(32),
    NEXT_PUBLIC_CAL_URL: "https://cal.com/infuser",
    NEXT_PUBLIC_MAPA_IA_URL: "https://useinfuser.com/diagnostico",
    OPS_ALERT_URL: "https://hooks.example.com/alerts",
    POSTGRES_URL: "postgresql://user:pass@db.example.com/app",
    POSTGRES_URL_NON_POOLING: "postgresql://user:pass@db.example.com/app",
    ROTEIRO_ACESSO_CHAVE: "access-" + "d".repeat(20),
    ROTEIRO_PUBLIC_BASE_URL: "https://www.useinfuser.com",
    ROTEIRO_WORKER_SECRET: "worker-" + "e".repeat(32),
    STRIPE_SECRET_KEY: "rk_live_" + "f".repeat(24),
    STRIPE_WEBHOOK_SECRET: "whsec_" + "g".repeat(24),
  };
}

describe("production environment gate", () => {
  it("accepts the complete production contract", () => {
    expect(() => validateProductionEnvironment(validEnvironment())).not.toThrow();
  });

  it("parses quoted dotenv values without exposing them", () => {
    expect(parseEnvironment('A="value"\nexport B=other\n# ignored')).toEqual({
      A: "value",
      B: "other",
    });
  });

  it("rejects the repeated placeholder that caused the migration fault", () => {
    const environment = validEnvironment();
    environment.ROTEIRO_ACESSO_CHAVE = "placeholder-value-placeholder";
    environment.ROTEIRO_WORKER_SECRET = "placeholder-value-placeholder";

    expect(() => validateProductionEnvironment(environment)).toThrow(
      "ROTEIRO_ACESSO_CHAVE/ROTEIRO_WORKER_SECRET",
    );
  });

  it("rejects an invalid Google credential", () => {
    const environment = validEnvironment();
    environment.GOOGLE_SERVICE_ACCOUNT_B64 = "not-base64";

    expect(() => validateProductionEnvironment(environment)).toThrow(
      "GOOGLE_SERVICE_ACCOUNT_B64",
    );
  });
});
