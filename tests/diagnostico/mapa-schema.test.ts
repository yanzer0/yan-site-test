import { describe, it, expect } from "vitest";

import { validarMapa } from "@/lib/diagnostico/mapa-schema";
import type { MapaConteudo } from "@/lib/diagnostico/mapa-tipos";

/** Um mapa válido mínimo, para as variações partirem daqui. */
function mapaValido(sobrescreve: Partial<MapaConteudo> = {}): unknown {
  return {
    cliente: "Metalurgica Vertex",
    contato: "Ricardo Menezes",
    processo: "orcamento de peca sob medida",
    segmento: "Metalurgia",
    resumo: "Hoje um orcamento passa por quatro maos e para quando o Douglas tira ferias.",
    etapas: [
      {
        ordem: 1,
        titulo: "O pedido chega por e-mail ou WhatsApp",
        descricao: "O cliente manda desenho, foto ou descricao. Nao existe formato padrao.",
        responsavel: "os 3 vendedores",
        ferramenta: "Outlook e WhatsApp",
        volume: "cerca de 40 por semana",
      },
    ],
    citacao: { texto: "O Douglas e o gargalo e ele sabe disso.", autor: "Ricardo Menezes" },
    achados: [
      {
        tipo: "atrito",
        classificacao: "fato",
        titulo: "Uma pessoa so sabe calcular",
        descricao: "A operacao de orcamento para quando o Douglas nao esta.",
        origem: "quando ele tira ferias a gente para de orcar",
      },
      {
        tipo: "encaixe",
        classificacao: "leitura",
        titulo: "Na entrada do pedido",
        descricao: "Uma porta unica que so deixa seguir com os dados minimos.",
        oQueMuda: "O Douglas para de perseguir informacao faltando.",
      },
      {
        tipo: "limite",
        classificacao: "limite",
        titulo: "Preco final sem conferencia humana",
        descricao: "Enquanto o criterio for julgamento dele, mandar direto e risco.",
      },
    ],
    lacunas: [],
    proximoPasso: {
      titulo: "Medir a entrada antes de mexer no calculo",
      descricao: "Olhar os ultimos 20 orcamentos e contar quantos voltaram.",
      passos: ["Contar os retornos ao vendedor"],
    },
    ...sobrescreve,
  };
}

describe("estrutura minima", () => {
  it("aceita um mapa completo", () => {
    const r = validarMapa(mapaValido());
    expect(r.ok, r.ok ? "" : JSON.stringify(r.problemas)).toBe(true);
  });

  it("rejeita o que nao e objeto", () => {
    for (const lixo of [null, "texto", 42, undefined]) {
      expect(validarMapa(lixo).ok).toBe(false);
    }
  });

  it("rejeita processo sem nenhuma etapa", () => {
    const r = validarMapa(mapaValido({ etapas: [] }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.problemas.some((p) => p.onde === "etapas")).toBe(true);
  });
});

describe("FR-005: fato precisa de origem rastreavel", () => {
  it("rejeita achado classificado como fato sem trecho de origem", () => {
    const r = validarMapa(
      mapaValido({
        achados: [
          { tipo: "atrito", classificacao: "fato", titulo: "Algo", descricao: "Sem origem" },
          { tipo: "encaixe", classificacao: "leitura", titulo: "X", descricao: "Y", oQueMuda: "Z" },
          { tipo: "limite", classificacao: "limite", titulo: "L", descricao: "M" },
        ] as never,
      }),
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.problemas.some((p) => p.porque.includes("sem trecho de origem"))).toBe(true);
  });

  it("aceita leitura sem origem, porque leitura e inferencia nossa", () => {
    const r = validarMapa(
      mapaValido({
        achados: [
          { tipo: "atrito", classificacao: "leitura", titulo: "A", descricao: "B" },
          { tipo: "encaixe", classificacao: "leitura", titulo: "X", descricao: "Y", oQueMuda: "Z" },
          { tipo: "limite", classificacao: "limite", titulo: "L", descricao: "M" },
        ] as never,
      }),
    );
    expect(r.ok).toBe(true);
  });
});

describe("FR-008: o COMO nao entra no documento", () => {
  const comEncaixe = (descricao: string, oQueMuda = "algo muda") =>
    mapaValido({
      achados: [
        { tipo: "atrito", classificacao: "leitura", titulo: "A", descricao: "B" },
        { tipo: "encaixe", classificacao: "leitura", titulo: "Entrada", descricao, oQueMuda },
        { tipo: "limite", classificacao: "limite", titulo: "L", descricao: "M" },
      ] as never,
    });

  it.each(["n8n", "Zapier", "webhook", "Supabase", "Python"])(
    "rejeita encaixe que cita a ferramenta de solucao '%s'",
    (ferramenta) => {
      const r = validarMapa(comEncaixe(`A gente monta isso com ${ferramenta}.`));
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.problemas.some((p) => p.porque.includes("ferramenta de solucao"))).toBe(true);
    },
  );

  it.each(["R$ 5.000", "sprint de duas semanas", "prazo de entrega curto", "cronograma fechado"])(
    "rejeita marca de orcamento ou prazo: '%s'",
    (marca) => {
      const r = validarMapa(comEncaixe(`Isso resolve rapido, ${marca}.`));
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.problemas.some((p) => p.porque.includes("orcamento ou prazo"))).toBe(true);
    },
  );

  it("permite que a ETAPA cite a ferramenta que o cliente ja usa hoje", () => {
    // A etapa descreve o processo do cliente. Dizer que ele usa Excel e fato,
    // nao e propor solucao. So o encaixe e proibido de citar ferramenta.
    const r = validarMapa(
      mapaValido({
        etapas: [
          {
            ordem: 1,
            titulo: "Monta o custo",
            descricao: "Numa planilha do Excel guardada no OneDrive, com banco de dados nenhum.",
            responsavel: "Douglas",
            ferramenta: "Excel",
            volume: "40 por semana",
          },
        ],
      }),
    );
    expect(r.ok, r.ok ? "" : JSON.stringify(r.problemas)).toBe(true);
  });
});

describe("FR-009: a secao de limites e obrigatoria", () => {
  it("rejeita mapa sem nenhum limite", () => {
    const r = validarMapa(
      mapaValido({
        achados: [
          { tipo: "atrito", classificacao: "leitura", titulo: "A", descricao: "B" },
          { tipo: "encaixe", classificacao: "leitura", titulo: "X", descricao: "Y", oQueMuda: "Z" },
        ] as never,
      }),
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.problemas.some((p) => p.porque.includes("diagnostico raso"))).toBe(true);
  });

  it("rejeita mapa sem atrito e sem encaixe", () => {
    const r = validarMapa(
      mapaValido({
        achados: [{ tipo: "limite", classificacao: "limite", titulo: "L", descricao: "M" }] as never,
      }),
    );
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.problemas.some((p) => p.porque.includes("atrito"))).toBe(true);
      expect(r.problemas.some((p) => p.porque.includes("encaixe"))).toBe(true);
    }
  });
});

describe("regras de forma", () => {
  it("rejeita em-dash em qualquer lugar do conteudo", () => {
    const r = validarMapa(mapaValido({ resumo: "O processo trava — e ninguem percebe." }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.problemas.some((p) => p.porque.includes("em-dash"))).toBe(true);
  });

  it("rejeita encaixe sem 'o que muda'", () => {
    const r = validarMapa(
      mapaValido({
        achados: [
          { tipo: "atrito", classificacao: "leitura", titulo: "A", descricao: "B" },
          { tipo: "encaixe", classificacao: "leitura", titulo: "X", descricao: "Y" },
          { tipo: "limite", classificacao: "limite", titulo: "L", descricao: "M" },
        ] as never,
      }),
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.problemas.some((p) => p.porque.includes("o que muda"))).toBe(true);
  });

  it("exige lacunas como array, mesmo vazio", () => {
    const r = validarMapa(mapaValido({ lacunas: undefined as never }));
    expect(r.ok).toBe(false);
  });

  it("reporta TODOS os problemas de uma vez, nao so o primeiro", () => {
    const r = validarMapa({ cliente: "", etapas: [], achados: [] });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.problemas.length).toBeGreaterThan(3);
  });
});
