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
  // Teto subiu de 14 para 16 em 30/08, com os dois gates de compromisso. O teto
  // existe por causa de abandono, então ele sobe com o que entra e nunca por
  // conveniência: as duas perguntas novas são de um toque, sem digitação.
  it("a trilha de empresa fica entre 10 e 16 perguntas", () => {
    const total = perguntasDaTrilha("empresa").length;
    expect(total).toBeGreaterThanOrEqual(10);
    expect(total).toBeLessThanOrEqual(16);
  });

  it("a trilha pessoal termina em no maximo 6", () => {
    expect(perguntasDaTrilha("pessoal").length).toBeLessThanOrEqual(6);
  });
});

describe("regras de conteudo (principio II: GPCT, nunca BANT)", () => {
  const enunciados = PERGUNTAS.map((p) => p.enunciado.toLowerCase()).join(" | ");

  /**
   * 🔴 A regra mudou em 30/08 (emenda 1.1.0 da constitution), e o que a
   * substitui é mais estreito, não mais frouxo.
   *
   * O que continua proibido, e é a razão de o BANT ter sido banido: pedir ao
   * LEAD que ele nomeie uma faixa. Número dito pelo cliente antes do custo da
   * dor ancora a proposta inteira nele, que é o risco 3 da decisão de 25/08.
   *
   * O que passou a ser permitido: NÓS declararmos o piso e perguntarmos se ele
   * cabe. Quem nomeia o número somos nós, e piso não vira teto.
   */
  it("nao pede ao lead que ele nomeie faixa, valor ou orcamento", () => {
    for (const proibido of [
      "orçamento",
      "quanto voce pretende",
      "quanto você pretende",
      "que faixa",
      "qual faixa",
      "quanto voce investiria",
      "quanto você investiria",
      "valor que",
      "quanto pode pagar",
    ]) {
      expect(enunciados).not.toContain(proibido);
    }
  });

  it("toda pergunta que pontua continua sendo de situacao, sem valor nenhum", () => {
    // A exceção vale só para os gates, que não pontuam. Se um dia alguém puser
    // preço numa pergunta pontuável, o score passa a depender de dinheiro
    // declarado e o princípio II morre de verdade.
    const pontuaveisComValor = PERGUNTAS.filter(
      (p) => p.criterioIcp !== undefined && /R\$|reais/i.test(p.enunciado),
    );
    expect(pontuaveisComValor.map((p) => p.id)).toEqual([]);
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

describe("os dois gates de compromisso", () => {
  const trilha = perguntasDaTrilha("empresa");

  it("nao pontuam: gate reprova, criterio soma", () => {
    for (const id of [P.TEMPO_CALL, P.INVESTIMENTO]) {
      expect(trilha.find((p) => p.id === id)?.criterioIcp).toBeUndefined();
    }
  });

  it("a trilha pessoal nao passa por eles", () => {
    // Quem marcou uso pessoal já saiu pelo corte de uso pessoal. Perguntar a
    // ele se sustenta R$ 3 mil seria cobrar pedágio de quem nem entrou na fila.
    const ids = perguntasDaTrilha("pessoal").map((p) => p.id);
    expect(ids).not.toContain(P.TEMPO_CALL);
    expect(ids).not.toContain(P.INVESTIMENTO);
  });

  it("vem depois de tudo que qualifica e antes do contato", () => {
    // Antes: pedágio na porta, e o lead sai sem ter descrito nada.
    // Depois do contato: o consentimento pousa em cima do preço.
    const posicao = (id: string) => trilha.findIndex((p) => p.id === id);
    expect(posicao(P.ACESSO)).toBeLessThan(posicao(P.TEMPO_CALL));
    expect(posicao(P.TEMPO_CALL)).toBeLessThan(posicao(P.INVESTIMENTO));
    expect(posicao(P.INVESTIMENTO)).toBeLessThan(posicao(P.CONTATO));
    expect(posicao(P.CONTATO)).toBe(trilha.length - 1);
  });

  it("o gate de dinheiro nao tem escapatoria de nao sei", () => {
    // Num gate de dinheiro, "não sei dizer" é a opção que todo mundo clica
    // para não responder, e o gate deixa de gatear.
    const opcoes = trilha.find((p) => p.id === P.INVESTIMENTO)?.opcoes ?? [];
    expect(opcoes.map((o) => o.id)).not.toContain("nao_sei");
    expect(opcoes.length).toBeGreaterThanOrEqual(3);
  });
});
