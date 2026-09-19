/**
 * O módulo único de banco, sem banco: o que se prova aqui é a TRADUÇÃO.
 *
 * O tagged template é a peça que impede SQL montado por concatenação em todo o
 * funil. Se ele numerar errado, trocar a ordem dos valores ou deixar passar um
 * `undefined`, o estrago é dado gravado no lugar errado - e nenhum teste de
 * rota pega isso, porque a query continua "funcionando".
 *
 * O `pg` é dublado porque o que está sob teste é a montagem do texto, não o
 * servidor. A conversa real com o Postgres tem o seu próprio arquivo
 * (`banco-integracao.test.ts`).
 */

import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const espiao = vi.hoisted(() => ({
  chamadas: [] as { texto: string; valores: unknown[] }[],
  proximoRowCount: 1 as number | null,
}));

vi.mock("pg", () => {
  class Pool {
    async query(texto: string, valores: unknown[]) {
      espiao.chamadas.push({ texto, valores });
      return { rows: [{ marcador: "linha" }], rowCount: espiao.proximoRowCount };
    }
    on() {
      return this;
    }
    async end() {}
  }
  return { Pool, default: { Pool } };
});

process.env.POSTGRES_URL = "postgres://usuario:segredo@localhost:5432/teste";

const { sql } = await import("@/lib/diagnostico/banco");

beforeEach(() => {
  espiao.chamadas.length = 0;
  espiao.proximoRowCount = 1;
});

describe("tagged template", () => {
  it("numera as interpolacoes de $1 a $n na ordem em que aparecem", async () => {
    await sql`SELECT * FROM leads WHERE email_norm = ${"a@b.c"} AND origem = ${"indicacao"}`;

    expect(espiao.chamadas[0].texto).toBe(
      "SELECT * FROM leads WHERE email_norm = $1 AND origem = $2",
    );
    expect(espiao.chamadas[0].valores).toEqual(["a@b.c", "indicacao"]);
  });

  it("aceita interpolacoes coladas, sem texto entre elas", async () => {
    await sql`A ${1}${2} B`;

    expect(espiao.chamadas[0].texto).toBe("A $1$2 B");
    expect(espiao.chamadas[0].valores).toEqual([1, 2]);
  });

  it("nao confunde null com ausencia: null e um valor e passa", async () => {
    await sql`UPDATE leads SET empresa = ${null}`;

    expect(espiao.chamadas[0].valores).toEqual([null]);
  });

  it("recusa undefined com TypeError, antes de ir ao banco", async () => {
    const semValor = undefined;

    await expect(sql`UPDATE leads SET empresa = ${semValor}`).rejects.toThrow(TypeError);
    expect(espiao.chamadas).toEqual([]);
  });

  it("devolve rowCount 0 quando o driver manda null", async () => {
    espiao.proximoRowCount = null;

    const resultado = await sql`DELETE FROM parciais`;

    expect(resultado.rowCount).toBe(0);
    expect(resultado.rows).toEqual([{ marcador: "linha" }]);
  });
});

describe("sql.query", () => {
  it("repassa texto e parametros sem tocar em nenhum dos dois", async () => {
    await sql.query("SELECT * FROM respostas WHERE lead_id = ANY($1::uuid[])", [["id-1", "id-2"]]);

    expect(espiao.chamadas[0].texto).toBe("SELECT * FROM respostas WHERE lead_id = ANY($1::uuid[])");
    expect(espiao.chamadas[0].valores).toEqual([["id-1", "id-2"]]);
  });

  it("funciona sem parametros", async () => {
    await sql.query("SELECT count(*) FROM leads");

    expect(espiao.chamadas[0].valores).toEqual([]);
  });

  it("recusa undefined tambem por aqui", async () => {
    await expect(sql.query("SELECT $1", [undefined])).rejects.toThrow(TypeError);
  });
});

describe("POSTGRES_URL conferida ao carregar o modulo", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  /**
   * Carrega o módulo como um processo que SERVE. A trava de carregamento fica
   * de fora em teste e em `next build` de propósito (ver o módulo), então aqui
   * o ambiente se apresenta como o de produção para exercitá-la.
   */
  async function carregarServindo(valor: string | undefined) {
    vi.resetModules();
    // O módulo reaproveita o pool guardado no `globalThis` (é o que faz o HMR
    // do Next não abrir um pool por salvamento). Sem limpar, o reimport acharia
    // o pool da carga anterior e nem chegaria a olhar a variável.
    delete (globalThis as { poolDoFunil?: unknown }).poolDoFunil;

    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PHASE", "");
    vi.stubEnv("POSTGRES_URL", valor);

    return import("@/lib/diagnostico/banco");
  }

  it("falha ao carregar quando a variavel nao existe", async () => {
    await expect(carregarServindo(undefined)).rejects.toThrow(/POSTGRES_URL/);
  });

  it("falha ao carregar quando o protocolo nao e postgres", async () => {
    await expect(carregarServindo("https://banco.exemplo.com")).rejects.toThrow(/POSTGRES_URL/);
  });

  it("nao ecoa o valor lido na mensagem de erro", async () => {
    await expect(
      carregarServindo("https://usuario:senha-sintetica@host/banco"),
    ).rejects.not.toThrow(/senha-sintetica/);
  });

  it("aceita postgresql:// alem de postgres://", async () => {
    await expect(carregarServindo("postgresql://u:p@host:5432/d")).resolves.toHaveProperty("sql");
  });

  it("em teste o modulo carrega sem a variavel, mas a consulta falha", async () => {
    vi.resetModules();
    delete (globalThis as { poolDoFunil?: unknown }).poolDoFunil;
    vi.stubEnv("POSTGRES_URL", undefined);

    // Sem isto, um teste de função pura que só arrasta este módulo no grafo de
    // imports passaria a exigir banco configurado.
    const modulo = await import("@/lib/diagnostico/banco");

    await expect(modulo.sql`SELECT 1`).rejects.toThrow(/POSTGRES_URL/);
  });
});

/**
 * O validador do ambiente de produção roda como CLI (`node validate-env.mjs`),
 * e é assim que ele é exercitado aqui: num processo Node de verdade, chamando a
 * função exportada. Executá-lo como ele realmente roda também mantém o caso
 * independente do fim de linha com que o repositório foi clonado.
 *
 * Todos os valores abaixo são SINTÉTICOS. Nenhum segredo real entra em teste.
 */
const VALIDADOR = pathToFileURL(resolve("deploy/vps/validate-env.mjs")).href;

function ambienteValido(): Record<string, string> {
  return {
    POSTGRES_URL: "postgresql://formulario:senha-falsa@formulario-db:5432/formulario",
    ROTEIRO_ACESSO_CHAVE: `acesso-${"a".repeat(20)}`,
    ROTEIRO_WORKER_SECRET: `worker-${"b".repeat(32)}`,
    GOOGLE_CALENDAR_ID: "agenda@group.calendar.google.com",
    GOOGLE_SERVICE_ACCOUNT_B64: Buffer.from(
      JSON.stringify({ client_email: "conta@exemplo.com", private_key: "chave-falsa" }),
    ).toString("base64"),
    MAPA_PUBLICAR_SECRET: `mapa-${"c".repeat(32)}`,
    CAL_WEBHOOK_SECRET: `cal-${"d".repeat(32)}`,
    NEXT_PUBLIC_CAL_URL: "https://cal.com/infuser",
    NEXT_PUBLIC_MAPA_IA_URL: "https://www.useinfuser.com/mapa",
    OPS_ALERT_URL: "https://hooks.exemplo.com/alertas",
    STRIPE_SECRET_KEY: `sk_test_${"e".repeat(24)}`,
    STRIPE_WEBHOOK_SECRET: `whsec_${"f".repeat(32)}`,
    DEMO_MARJA_USER: "infuser",
    DEMO_MARJA_PASS: `demo-${"g".repeat(24)}`,
    ROTEIRO_PUBLIC_BASE_URL: "https://www.useinfuser.com",
  };
}

function validar(ambiente: Record<string, string>): { ok: boolean; saida: string } {
  const roteiro = [
    `const { validateProductionEnvironment } = await import(${JSON.stringify(VALIDADOR)});`,
    `validateProductionEnvironment(${JSON.stringify(ambiente)});`,
  ].join("\n");

  const executado = spawnSync(process.execPath, ["--input-type=module", "-e", roteiro], {
    encoding: "utf8",
  });

  return { ok: executado.status === 0, saida: `${executado.stdout}${executado.stderr}` };
}

describe("validate-env: POSTGRES_URL_NON_POOLING opcional", () => {
  it("aceita o ambiente sem POSTGRES_URL_NON_POOLING", () => {
    const { ok, saida } = validar(ambienteValido());

    expect(saida).not.toContain("POSTGRES_URL_NON_POOLING");
    expect(ok).toBe(true);
  });

  it("continua conferindo POSTGRES_URL_NON_POOLING quando ela vem preenchida", () => {
    const { ok, saida } = validar({
      ...ambienteValido(),
      POSTGRES_URL_NON_POOLING: "http://nao-e-postgres",
    });

    expect(ok).toBe(false);
    expect(saida).toContain("POSTGRES_URL_NON_POOLING: URL Postgres invalida");
  });

  it("continua recusando POSTGRES_URL invalida", () => {
    const { ok, saida } = validar({ ...ambienteValido(), POSTGRES_URL: "http://nao-e-postgres" });

    expect(ok).toBe(false);
    expect(saida).toContain("POSTGRES_URL: URL Postgres invalida");
  });

  it("continua recusando POSTGRES_URL ausente", () => {
    const ambiente = ambienteValido();
    delete (ambiente as Record<string, string | undefined>).POSTGRES_URL;

    const { ok, saida } = validar(ambiente as Record<string, string>);

    expect(ok).toBe(false);
    expect(saida).toContain("POSTGRES_URL: ausente");
  });
});
