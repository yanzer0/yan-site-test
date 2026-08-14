import { describe, it, expect } from "vitest";

import { PERGUNTAS, perguntasDaTrilha, P } from "@/lib/diagnostico/perguntas";
import { CRITERIOS_ICP } from "@/lib/diagnostico/tipos";

/**
 * Estes testes são o guard do princípio III da constitution: o score é derivado
 * do ICP, e o ICP é uma tabela, não intuição. Se alguém adicionar pergunta
 * pontuável sem critério, ou remover a última pergunta de um critério, quebra aqui.
 */

describe("cobertura dos 6 criterios do ICP", () => {
  it("todo criterio tem ao menos uma pergunta", () => {
    const cobertos = new Set(PERGUNTAS.map((p) => p.criterioIcp).filter(Boolean));
    const semPergunta = CRITERIOS_ICP.filter((c) => !cobertos.has(c));
    expect(semPergunta).toEqual([]);
  });

  it("nenhuma pergunta pontua fora dos criterios conhecidos", () => {
    const validos: readonly string[] = CRITERIOS_ICP;
    const forasteiras = PERGUNTAS.filter(
      (p) => p.criterioIcp !== undefined && !validos.includes(p.criterioIcp),
    );
    expect(forasteiras).toEqual([]);
  });
});

describe("limites de tamanho do formulario", () => {
  it("a trilha de empresa fica entre 10 e 14 perguntas", () => {
    const total = perguntasDaTrilha("empresa").length;
    expect(total).toBeGreaterThanOrEqual(10);
    expect(total).toBeLessThanOrEqual(14);
  });

  it("a trilha pessoal termina em no maximo 6", () => {
    expect(perguntasDaTrilha("pessoal").length).toBeLessThanOrEqual(6);
  });
});

describe("regras de conteudo (principio II: GPCT, nunca BANT)", () => {
  const enunciados = PERGUNTAS.map((p) => p.enunciado.toLowerCase()).join(" | ");

  it("nao pergunta orcamento nem investimento", () => {
    for (const proibido of ["orçamento", "investimento", "quanto voce pretende", "valor que"]) {
      expect(enunciados).not.toContain(proibido);
    }
  });

  it("nao pergunta urgencia nem o gatilho de agora", () => {
    for (const proibido of ["urgente", "urgência", "te fez procurar", "com que pressa"]) {
      expect(enunciados).not.toContain(proibido);
    }
  });

  it("nao pergunta dor subjetiva", () => {
    for (const proibido of ["o quanto incomoda", "quanto isso te custa", "qual sua maior dor"]) {
      expect(enunciados).not.toContain(proibido);
    }
  });
});

describe("integridade estrutural", () => {
  it("nenhum id de pergunta se repete", () => {
    const ids = PERGUNTAS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("toda pergunta de escolha tem opcoes", () => {
    const semOpcoes = PERGUNTAS.filter(
      (p) =>
        (p.tipo === "escolha_unica" || p.tipo === "multipla_escolha") &&
        (p.opcoes === undefined || p.opcoes.length === 0),
    );
    expect(semOpcoes.map((p) => p.id)).toEqual([]);
  });

  it("nenhuma opcao repete id dentro da mesma pergunta", () => {
    for (const pergunta of PERGUNTAS) {
      if (!pergunta.opcoes) continue;
      const ids = pergunta.opcoes.map((o) => o.id);
      expect(new Set(ids).size, `opcoes duplicadas em ${pergunta.id}`).toBe(ids.length);
    }
  });

  it("a ramificacao de uso pessoal vem antes de qualquer pergunta de empresa", () => {
    const ramificacao = PERGUNTAS.find((p) => p.id === P.TIPO_USO);
    const primeiraDeEmpresa = perguntasDaTrilha("empresa")
      .filter((p) => p.trilha === "empresa")
      .reduce((menor, p) => Math.min(menor, p.ordem), Number.MAX_SAFE_INTEGER);
    expect(ramificacao).toBeDefined();
    expect(ramificacao!.ordem).toBeLessThan(primeiraDeEmpresa);
  });

  it("a trilha pessoal nao inclui nenhuma pergunta pontuavel", () => {
    const pontuaveis = perguntasDaTrilha("pessoal").filter((p) => p.criterioIcp !== undefined);
    expect(pontuaveis.map((p) => p.id)).toEqual([]);
  });
});
