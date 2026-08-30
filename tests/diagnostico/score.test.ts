import { describe, it, expect } from "vitest";

import { avaliar, ofertaAlternativa, scoreMaximo, MOTIVOS_CORTE } from "@/lib/diagnostico/score";
import { P } from "@/lib/diagnostico/perguntas";
import config from "@/lib/diagnostico/score-config.json";
import type { ConfigScore, Respostas } from "@/lib/diagnostico/tipos";

const CONFIG = config as unknown as ConfigScore;

/** 120+ caracteres, o mínimo que pontua como descrição detalhada. */
const DESCRICAO_LONGA =
  "O pedido chega por e-mail, o vendedor repassa para a engenharia, que monta o custo numa planilha copiada de um modelo antigo e devolve.";
const DESCRICAO_CURTA = "vendas";

function respostas(sobrescreve: Record<string, string | string[]> = {}): Respostas {
  return {
    [P.TIPO_USO]: "empresa",
    [P.FREQUENCIA]: "todo_dia",
    [P.COMO_FUNCIONA]: DESCRICAO_LONGA,
    [P.CONSEQUENCIA]: ["refazer"],
    [P.ONDE_INFORMACAO]: ["planilha"],
    [P.RESPONSAVEL]: "espalhado",
    [P.DECISAO]: "diretoria",
    [P.ACESSO]: "sim_com_aprovacao",
    // Os gates passam por padrão na fixture: ela representa uma submissão
    // COMPLETA, e cada teste de pontuação abaixo mede pontuação, não gate.
    [P.TEMPO_CALL]: "sim",
    [P.INVESTIMENTO]: "cabe",
    ...sobrescreve,
  };
}

describe("scoreMaximo", () => {
  it("deriva o teto total dos tetos por criterio", () => {
    // 5 operacao + 3 dor + 3 info + 2 patrocinador + 2 decisao + 2 colaboracao
    expect(scoreMaximo(CONFIG)).toBe(17);
  });
});

describe("fronteiras das faixas", () => {
  it("11 pontos e o piso de qualificado", () => {
    const r = avaliar(respostas(), CONFIG);
    expect(r.score).toBe(11);
    expect(r.faixa).toBe("qualificado");
    expect(r.motivoCorte).toBeNull();
  });

  it("10 pontos ainda e revisao humana", () => {
    const r = avaliar(respostas({ [P.CONSEQUENCIA]: ["nao_acontece"] }), CONFIG);
    expect(r.score).toBe(10);
    expect(r.faixa).toBe("revisao");
  });

  it("6 pontos e o piso de revisao humana", () => {
    const r = avaliar(
      respostas({
        [P.FREQUENCIA]: "mensal",
        [P.COMO_FUNCIONA]: DESCRICAO_CURTA,
        [P.DECISAO]: "nao_sou_eu",
        [P.ACESSO]: "dificil",
      }),
      CONFIG,
    );
    expect(r.score).toBe(6);
    expect(r.faixa).toBe("revisao");
  });

  it("5 pontos cai para nao-ICP de empresa", () => {
    const r = avaliar(
      respostas({
        [P.FREQUENCIA]: "mensal",
        [P.COMO_FUNCIONA]: DESCRICAO_CURTA,
        [P.ONDE_INFORMACAO]: ["whatsapp"],
        [P.DECISAO]: "nao_sou_eu",
        [P.ACESSO]: "dificil",
      }),
      CONFIG,
    );
    expect(r.score).toBe(5);
    expect(r.faixa).toBe("nao_icp_empresa");
    expect(r.motivoCorte).toBeNull();
  });
});

describe("cortes duros vencem a pontuacao", () => {
  it("processo esporadico reprova mesmo com o resto otimo", () => {
    const r = avaliar(
      respostas({
        [P.FREQUENCIA]: "esporadico",
        [P.CONSEQUENCIA]: ["refazer", "perde_prazo", "dinheiro_errado"],
        [P.ONDE_INFORMACAO]: ["planilha", "sistema_erp"],
        [P.RESPONSAVEL]: "eu_mesmo",
        [P.DECISAO]: "so_eu",
        [P.ACESSO]: "sim_sem_problema",
      }),
      CONFIG,
    );
    expect(r.faixa).toBe("nao_icp_empresa");
    expect(r.motivoCorte).toBe(MOTIVOS_CORTE.SEM_RECORRENCIA);
  });

  it("sem dono e sem decisao reprova com score que seria de qualificado", () => {
    const r = avaliar(
      respostas({
        [P.CONSEQUENCIA]: ["refazer", "perde_prazo", "dinheiro_errado"],
        [P.ONDE_INFORMACAO]: ["planilha", "sistema_erp"],
        [P.RESPONSAVEL]: "ninguem",
        [P.DECISAO]: "nao_sou_eu",
        [P.ACESSO]: "sim_sem_problema",
      }),
      CONFIG,
    );
    expect(r.score).toBeGreaterThanOrEqual(CONFIG.limiares.qualificadoMin);
    expect(r.faixa).toBe("nao_icp_empresa");
    expect(r.motivoCorte).toBe(MOTIVOS_CORTE.SEM_DONO_SEM_DECISAO);
  });

  it("sem dono mas COM decisao nao dispara o corte", () => {
    const r = avaliar(respostas({ [P.RESPONSAVEL]: "ninguem", [P.DECISAO]: "so_eu" }), CONFIG);
    expect(r.motivoCorte).toBeNull();
  });

  it("uso pessoal ignora todo o resto", () => {
    const r = avaliar(respostas({ [P.TIPO_USO]: "pessoal" }), CONFIG);
    expect(r.faixa).toBe("nao_icp_pessoal");
    expect(r.motivoCorte).toBe(MOTIVOS_CORTE.USO_PESSOAL);
  });
});

/**
 * Os dois gates de compromisso (decisão do Yan, 30/08).
 *
 * Eles não pontuam: reprovam. Um lead com score de qualificado que diga não ter
 * a hora, ou que o piso não cabe, sai da agenda gratuita mesmo assim.
 */
describe("gates de tempo e investimento", () => {
  /** O melhor lead possível, para provar que o gate vence a pontuação. */
  function excelente(sobrescreve: Record<string, string | string[]> = {}) {
    return respostas({
      [P.CONSEQUENCIA]: ["refazer", "perde_prazo", "dinheiro_errado"],
      [P.ONDE_INFORMACAO]: ["planilha", "sistema_erp"],
      [P.RESPONSAVEL]: "eu_mesmo",
      [P.DECISAO]: "so_eu",
      [P.ACESSO]: "sim_sem_problema",
      ...sobrescreve,
    });
  }

  it("sem tempo reprova o lead que seria qualificado", () => {
    const r = avaliar(excelente({ [P.TEMPO_CALL]: "nao" }), CONFIG);
    expect(r.score).toBeGreaterThanOrEqual(CONFIG.limiares.qualificadoMin);
    expect(r.faixa).toBe("nao_icp_empresa");
    expect(r.motivoCorte).toBe(MOTIVOS_CORTE.SEM_TEMPO);
  });

  it("investimento que nao cabe reprova o lead que seria qualificado", () => {
    const r = avaliar(excelente({ [P.INVESTIMENTO]: "nao_cabe" }), CONFIG);
    expect(r.score).toBeGreaterThanOrEqual(CONFIG.limiares.qualificadoMin);
    expect(r.faixa).toBe("nao_icp_empresa");
    expect(r.motivoCorte).toBe(MOTIVOS_CORTE.SEM_INVESTIMENTO);
  });

  it("falhar os dois tem motivo proprio, e nao o do primeiro que casar", () => {
    const r = avaliar(
      excelente({ [P.TEMPO_CALL]: "nao", [P.INVESTIMENTO]: "nao_cabe" }),
      CONFIG,
    );
    expect(r.motivoCorte).toBe(MOTIVOS_CORTE.SEM_TEMPO_E_SEM_INVESTIMENTO);
  });

  it("so eu, sem outras pessoas, PASSA no gate de tempo", () => {
    // É um sim sobre a hora. Diagnóstico sem quem executa rende menos, e isso
    // é informação para quem conduz, não motivo para tirar a call.
    const r = avaliar(excelente({ [P.TEMPO_CALL]: "so_eu" }), CONFIG);
    expect(r.faixa).toBe("qualificado");
    expect(r.motivoCorte).toBeNull();
  });

  it("cabe com aprovacao interna PASSA no gate de investimento", () => {
    const r = avaliar(excelente({ [P.INVESTIMENTO]: "cabe_com_aprovacao" }), CONFIG);
    expect(r.faixa).toBe("qualificado");
    expect(r.motivoCorte).toBeNull();
  });

  it("o gate vem ANTES dos cortes de ICP, porque e ele que escolhe a alternativa", () => {
    // Sem tempo E processo esporádico. Se o corte de recorrência ganhasse, o
    // motivo seria SEM_RECORRENCIA e o lead receberia a oferta de uma call
    // paga que ele acabou de dizer que não consegue fazer.
    const r = avaliar(
      excelente({ [P.TEMPO_CALL]: "nao", [P.FREQUENCIA]: "esporadico" }),
      CONFIG,
    );
    expect(r.motivoCorte).toBe(MOTIVOS_CORTE.SEM_TEMPO);
    expect(ofertaAlternativa(r)).toBe("kit");
  });
});

/**
 * 🔴 O gate falha FECHADO. A rota de submissão é pública: se resposta ausente
 * passasse, bastaria remover o campo do POST para atravessar os dois gates.
 */
describe("os gates nao se atravessam por omissao", () => {
  it("sem a resposta de tempo, reprova", () => {
    const { [P.TEMPO_CALL]: _ignorado, ...semTempo } = respostas();
    expect(avaliar(semTempo, CONFIG).motivoCorte).toBe(MOTIVOS_CORTE.SEM_TEMPO);
  });

  it("sem a resposta de investimento, reprova", () => {
    const { [P.INVESTIMENTO]: _ignorado, ...semInvestimento } = respostas();
    expect(avaliar(semInvestimento, CONFIG).motivoCorte).toBe(MOTIVOS_CORTE.SEM_INVESTIMENTO);
  });

  it("valor inventado no lugar da opcao tambem reprova", () => {
    const r = avaliar(respostas({ [P.INVESTIMENTO]: "cabe_muito_mesmo" }), CONFIG);
    expect(r.motivoCorte).toBe(MOTIVOS_CORTE.SEM_INVESTIMENTO);
  });
});

describe("a alternativa que cada saida recebe", () => {
  it("qualificado nao recebe alternativa nenhuma", () => {
    // Ele vai para o calendário. `ofertaAlternativa` só é chamada fora daí.
    expect(ofertaAlternativa(avaliar(respostas(), CONFIG))).toBe("call_paga");
  });

  it("quem nao tem tempo recebe o Kit, nunca a call paga", () => {
    const r = avaliar(respostas({ [P.TEMPO_CALL]: "nao" }), CONFIG);
    expect(ofertaAlternativa(r)).toBe("kit");
  });

  it("quem falhou so o dinheiro continua na call paga", () => {
    // R$ 197 não é o piso do projeto, e o Mapa é entregável fechado.
    const r = avaliar(respostas({ [P.INVESTIMENTO]: "nao_cabe" }), CONFIG);
    expect(ofertaAlternativa(r)).toBe("call_paga");
  });

  it("quem falhou os dois recebe o Kit", () => {
    const r = avaliar(
      respostas({ [P.TEMPO_CALL]: "nao", [P.INVESTIMENTO]: "nao_cabe" }),
      CONFIG,
    );
    expect(ofertaAlternativa(r)).toBe("kit");
  });

  it("uso pessoal continua no Kit", () => {
    expect(ofertaAlternativa(avaliar(respostas({ [P.TIPO_USO]: "pessoal" }), CONFIG))).toBe("kit");
  });

  it("corte de ICP sem gate reprovado segue na call paga, como antes", () => {
    const r = avaliar(respostas({ [P.FREQUENCIA]: "esporadico" }), CONFIG);
    expect(r.motivoCorte).toBe(MOTIVOS_CORTE.SEM_RECORRENCIA);
    expect(ofertaAlternativa(r)).toBe("call_paga");
  });
});

describe("tetos por criterio", () => {
  it("dor com 3 consequencias mais os dois bonus nao passa de 3", () => {
    const r = avaliar(
      respostas({ [P.CONSEQUENCIA]: ["refazer", "perde_prazo", "dinheiro_errado"] }),
      CONFIG,
    );
    const dor = r.pontosPorCriterio.find((c) => c.criterio === "dor_relevante");
    expect(dor?.pontos).toBe(3);
  });

  it("nao_acontece zera a dor mesmo marcado junto de outras", () => {
    const r = avaliar(
      respostas({ [P.CONSEQUENCIA]: ["refazer", "perde_prazo", "nao_acontece"] }),
      CONFIG,
    );
    const dor = r.pontosPorCriterio.find((c) => c.criterio === "dor_relevante");
    expect(dor?.pontos).toBe(0);
  });

  it("operacao com frequencia maxima mais descricao longa nao passa de 5", () => {
    const r = avaliar(respostas({ [P.FREQUENCIA]: "varias_dia" }), CONFIG);
    const op = r.pontosPorCriterio.find((c) => c.criterio === "operacao_existente");
    expect(op?.pontos).toBe(5);
  });
});

describe("bonus de descricao", () => {
  it("descricao curta nao ganha o ponto extra", () => {
    const comLonga = avaliar(respostas(), CONFIG);
    const comCurta = avaliar(respostas({ [P.COMO_FUNCIONA]: DESCRICAO_CURTA }), CONFIG);
    expect(comLonga.score - comCurta.score).toBe(CONFIG.pontos.descricaoLongaPontos);
  });
});

describe("fontes de informacao", () => {
  it("duas fontes digitais valem mais que uma", () => {
    const uma = avaliar(respostas({ [P.ONDE_INFORMACAO]: ["planilha"] }), CONFIG);
    const duas = avaliar(respostas({ [P.ONDE_INFORMACAO]: ["planilha", "email"] }), CONFIG);
    expect(duas.score).toBeGreaterThan(uma.score);
  });

  it("so papel nao pontua, porque nao da para ler", () => {
    const r = avaliar(respostas({ [P.ONDE_INFORMACAO]: ["papel"] }), CONFIG);
    const info = r.pontosPorCriterio.find((c) => c.criterio === "informacao_disponivel");
    expect(info?.pontos).toBe(0);
  });
});

describe("robustez de entrada", () => {
  it("respostas vazias nao explodem e caem em nao-ICP", () => {
    const r = avaliar({}, CONFIG);
    expect(r.score).toBe(0);
    expect(r.faixa).toBe("nao_icp_empresa");
  });

  it("opcao desconhecida vale zero em vez de quebrar", () => {
    const r = avaliar(respostas({ [P.FREQUENCIA]: "valor_que_nao_existe" }), CONFIG);
    const op = r.pontosPorCriterio.find((c) => c.criterio === "operacao_existente");
    expect(op?.pontos).toBe(CONFIG.pontos.descricaoLongaPontos);
  });

  it("carimba a versao do config usada", () => {
    expect(avaliar(respostas(), CONFIG).versaoScore).toBe(CONFIG.versao);
  });
});
