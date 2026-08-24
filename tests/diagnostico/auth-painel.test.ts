/**
 * O acesso ao painel é a única coisa entre a base comercial e a internet.
 * Estes testes travam a parte que dá para provar sem banco: o hash da senha, a
 * anonimização do freio e o que o evento de cadastro carrega.
 *
 * O que NÃO dá para provar aqui, e por isso é verificado no caminho HTTP real
 * contra o servidor rodando: que `/leads`, `/leads/[id]`, `/leads/export` e
 * `/leads/equipe` recusam quem não tem sessão, e que membro comum não abre a
 * tela de aprovação. Essas são as portas, e porta se testa batendo nela.
 */

import { describe, expect, it, beforeEach, afterEach } from "vitest";

import { etiqueta, ipDaRequisicao } from "@/lib/diagnostico/rate-limit";
import {
  conferirSenha,
  criticarSenha,
  gastarTempoDeSenha,
  gerarHash,
  TAMANHO_MINIMO_SENHA,
} from "@/lib/diagnostico/senha";

const SENHA = "cavalo-bateria-grampo-correto";

beforeEach(() => {
  process.env.PAINEL_SEGREDO = "segredo-de-teste-do-painel";
});

afterEach(() => {
  delete process.env.PAINEL_SEGREDO;
  delete process.env.PAINEL_ADMIN_EMAIL;
});

describe("o hash da senha", () => {
  it("nunca guarda a senha, em forma nenhuma", async () => {
    const hash = await gerarHash(SENHA);
    expect(hash).not.toContain(SENHA);
    expect(hash).not.toContain(Buffer.from(SENHA).toString("base64"));
  });

  it("gera hash diferente para a mesma senha", async () => {
    // Sal aleatório por conta. Sem isso, duas pessoas com a mesma senha teriam
    // o mesmo hash, e uma tabela pronta quebraria as duas de uma vez.
    const [a, b] = await Promise.all([gerarHash(SENHA), gerarHash(SENHA)]);
    expect(a).not.toBe(b);
  });

  it("carrega os parâmetros de custo no próprio hash", async () => {
    // É o que permite encarecer o hash amanhã sem invalidar quem já tem conta.
    const [algo, n, r, p] = (await gerarHash(SENHA)).split("$");
    expect(algo).toBe("scrypt");
    expect(Number(n)).toBeGreaterThanOrEqual(131072);
    expect(Number(r)).toBe(8);
    expect(Number(p)).toBe(1);
  });

  it("confere a senha certa e recusa a errada", async () => {
    const hash = await gerarHash(SENHA);
    expect(await conferirSenha(SENHA, hash)).toBe(true);
    expect(await conferirSenha(`${SENHA}x`, hash)).toBe(false);
    expect(await conferirSenha("", hash)).toBe(false);
  });

  it("recusa hash malformado em vez de explodir", async () => {
    // Registro corrompido no banco tem que NEGAR acesso, não derrubar a rota
    // com stack trace - e stack trace numa tela de login é informação de graça.
    for (const ruim of ["", "abc", "scrypt$x$8$1$aa$bb", "bcrypt$1$2$3$aa$bb", "$$$$$"]) {
      expect(await conferirSenha(SENHA, ruim)).toBe(false);
    }
  });

  it("gasta trabalho de verdade quando a conta não existe", async () => {
    // O caminho do e-mail inexistente precisa custar o mesmo do caminho real,
    // senão a diferença de tempo entrega quais e-mails têm conta.
    const t0 = Date.now();
    expect(await gastarTempoDeSenha(SENHA)).toBe(false);
    expect(Date.now() - t0).toBeGreaterThan(50);
  });
});

describe("a crítica da senha", () => {
  it("recusa senha curta", () => {
    expect(criticarSenha("a".repeat(TAMANHO_MINIMO_SENHA - 1), "yan@infuser.com").ok).toBe(false);
    expect(criticarSenha("a".repeat(TAMANHO_MINIMO_SENHA), "yan@infuser.com").ok).toBe(true);
  });

  it("recusa senha que contém o e-mail", () => {
    expect(criticarSenha("yangalasso-2026-forte", "yangalasso@infuser.com").ok).toBe(false);
  });

  it("recusa senha longa demais", () => {
    // scrypt trabalha em cima do que recebe: senha gigante seria um jeito
    // barato de fazer o servidor gastar caro.
    expect(criticarSenha("a".repeat(201), "yan@infuser.com").ok).toBe(false);
  });

  it("aceita frase longa sem símbolo", () => {
    expect(criticarSenha("cavalo bateria grampo correto", "yan@infuser.com").ok).toBe(true);
  });
});

describe("o freio de tentativas", () => {
  it("🔴 não guarda e-mail nem IP em claro", () => {
    // Contar tentativas não exige saber de quem elas são. Guardar em claro
    // criaria uma lista de quem tentou entrar de onde.
    const e = etiqueta("conta", "yan@infuser.com");
    const i = etiqueta("origem", "189.4.77.10");

    expect(e).not.toContain("yan");
    expect(e).not.toContain("infuser.com");
    expect(i).not.toContain("189.4.77.10");
    expect(e).toMatch(/^conta:[0-9a-f]{64}$/);
    expect(i).toMatch(/^origem:[0-9a-f]{64}$/);
  });

  it("dá a mesma etiqueta para o mesmo e-mail, mudando maiúscula", () => {
    expect(etiqueta("conta", "Yan@Infuser.com")).toBe(etiqueta("conta", "yan@infuser.com"));
  });

  it("separa o balde da conta do balde da origem", () => {
    // Cota única faria o primeiro que chega monopolizar e derrubar todo mundo.
    expect(etiqueta("conta", "mesmo-valor")).not.toBe(etiqueta("origem", "mesmo-valor"));
  });

  it("fecha por padrão sem o segredo configurado", () => {
    delete process.env.PAINEL_SEGREDO;
    expect(() => etiqueta("conta", "yan@infuser.com")).toThrow();
  });

  it("lê o IP do cabeçalho que a Vercel escreve", () => {
    expect(ipDaRequisicao(new Headers({ "x-real-ip": "203.0.113.9" }))).toBe("203.0.113.9");
    expect(ipDaRequisicao(new Headers({ "x-forwarded-for": "203.0.113.9, 10.0.0.1" }))).toBe(
      "203.0.113.9",
    );
    // Sem cabeçalho nenhum, todo mundo divide um balde: conservador, nunca permissivo.
    expect(ipDaRequisicao(new Headers())).toBe("sem-origem");
  });
});
