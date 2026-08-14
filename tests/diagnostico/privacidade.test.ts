import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Guard executável de FR-026: nenhum dado pessoal em log ou em query string.
 *
 * Vira teste em vez de item de checklist porque vazamento de PII em log é o tipo
 * de coisa que entra numa linha de debug às pressas e fica lá por meses. Revisão
 * manual pega na primeira vez e esquece na décima.
 */

const RAIZ = process.cwd();

const ROTAS = [
  "src/app/api/diagnostico/submit/route.ts",
  "src/app/api/diagnostico/parcial/route.ts",
  "src/app/api/diagnostico/cal-webhook/route.ts",
];

const CAMADAS = ["src/lib/diagnostico/db.ts", "src/lib/diagnostico/alerta.ts"];

function ler(caminho: string): string {
  return readFileSync(join(RAIZ, caminho), "utf8");
}

/** Linhas de log, sem comentários. */
function linhasDeLog(conteudo: string): string[] {
  return conteudo
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/^\s*\/\/.*$/gm, " ")
    .split("\n")
    .filter((linha) => /console\.(log|error|warn|info|debug)/.test(linha));
}

/** Identificadores que carregam dado pessoal e nunca podem ser interpolados num log. */
const CAMPOS_PII = [
  "dados.nome",
  "dados.email",
  "dados.whatsapp",
  "validacao.dados",
  "contato.nome",
  "contato.email",
  "contato.whatsapp",
  "agendamento.email",
  "extras.nome",
  "extras.email",
  "extras.whatsapp",
  "emailNorm",
  "whatsappNorm",
];

describe("nenhum dado pessoal em log", () => {
  it.each([...ROTAS, ...CAMADAS])("%s nao interpola PII em console.*", (arquivo) => {
    const logs = linhasDeLog(ler(arquivo));
    for (const linha of logs) {
      for (const campo of CAMPOS_PII) {
        expect(linha, `PII '${campo}' vazando em: ${linha.trim()}`).not.toContain(campo);
      }
    }
  });

  it("as rotas logam pelo menos alguma coisa em falha, senao quebra em silencio", () => {
    for (const rota of ROTAS) {
      expect(linhasDeLog(ler(rota)).length, `${rota} sem nenhum log`).toBeGreaterThan(0);
    }
  });
});

describe("nenhum dado pessoal em URL", () => {
  it("nenhuma rota monta query string com campo de contato", () => {
    for (const arquivo of [...ROTAS, ...CAMADAS]) {
      const conteudo = ler(arquivo);
      // Padrões de montagem de querystring com nome/email/telefone.
      expect(conteudo).not.toMatch(/[?&](email|nome|name|whatsapp|phone|telefone)=/i);
    }
  });

  it("o submit usa POST, nunca GET com dados no caminho", () => {
    const submit = ler("src/app/api/diagnostico/submit/route.ts");
    expect(submit).toContain("export async function POST");
    expect(submit).not.toContain("export async function GET");
  });

  it("o parcial tambem e POST", () => {
    const parcial = ler("src/app/api/diagnostico/parcial/route.ts");
    expect(parcial).toContain("export async function POST");
    expect(parcial).not.toContain("export async function GET");
  });
});

describe("segredos nunca no codigo", () => {
  it.each([...ROTAS, ...CAMADAS])("%s le segredo de process.env, nunca literal", (arquivo) => {
    const conteudo = ler(arquivo);
    // Nenhuma string longa que pareça token, chave ou URL de webhook com token.
    expect(conteudo).not.toMatch(/(secret|token|key|senha|password)\s*[:=]\s*["'][A-Za-z0-9_\-]{16,}["']/i);
    expect(conteudo).not.toMatch(/postgres:\/\/[^"'\s]+/i);
  });

  it("o segredo do webhook vem do ambiente", () => {
    const webhook = ler("src/app/api/diagnostico/cal-webhook/route.ts");
    expect(webhook).toContain("process.env.CAL_WEBHOOK_SECRET");
  });
});

describe("consentimento e validado no servidor", () => {
  it("o submit valida antes de qualquer persistencia", () => {
    const submit = ler("src/app/api/diagnostico/submit/route.ts");

    // Medir a partir do corpo da função. Medir no arquivo inteiro compara a
    // ordem dos IMPORTS, que não diz nada sobre o fluxo de execução.
    const inicioDoCorpo = submit.indexOf("export async function POST");
    expect(inicioDoCorpo).toBeGreaterThan(-1);
    const corpo = submit.slice(inicioDoCorpo);

    const posValidacao = corpo.indexOf("validarSubmissao(");
    const posGravar = corpo.indexOf("gravarLead(");
    expect(posValidacao).toBeGreaterThan(-1);
    expect(posGravar).toBeGreaterThan(-1);
    expect(posValidacao).toBeLessThan(posGravar);
  });

  it("o submit devolve erro e sai quando a validacao falha", () => {
    const submit = ler("src/app/api/diagnostico/submit/route.ts");
    expect(submit).toMatch(/if\s*\(!validacao\.ok\)/);
    expect(submit).toContain("status: 400");
  });
});
