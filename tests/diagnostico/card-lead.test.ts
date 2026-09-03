/**
 * O que estes testes protegem: o card que nasce sozinho no brain.
 *
 * Card com frontmatter fora do schema é bloqueado pelo checker do brain, e a
 * quebra aparece no commit seguinte de quem estiver trabalhando lá — longe daqui
 * e sem contexto. Melhor pegar na suíte.
 */

import { describe, expect, it } from "vitest";

import {
  dataIso,
  montarCard,
  quandoLegivel,
  slugDaEmpresa,
  STATUS_ENTRADA,
  valorYaml,
  type DadosDoCard,
} from "@/lib/diagnostico/card-lead";
import { REQUIRED_FIELDS, ENUM_ORIGEM, ENUM_STATUS } from "./schema-do-brain";

const BASE: DadosDoCard = {
  nome: "Ricardo Alves",
  empresa: "Vertex Componentes",
  papel: "dono",
  porte: "6_20",
  email: "ricardo@vertex.com.br",
  whatsapp: "+5511999998888",
  origem: "instagram",
  score: 12,
  faixa: "qualificado",
  // Instante em UTC, nao `new Date(2026, 7, 21, 14, 30)`: a fixture em hora
  // local fazia o teste passar em qualquer fuso e nao provava nada sobre a
  // Vercel, que monta o card em UTC. 17:30Z = 14:30 em Sao Paulo.
  inicioDaCall: new Date("2026-08-21T17:30:00.000Z"),
  respostas: [
    {
      perguntaId: "processo",
      enunciado: "Qual processo mais consome tempo do time hoje?",
      resposta: "Orçamento. A gente refaz três vezes até fechar.",
    },
  ],
  hoje: "2026-08-17",
};

function frontmatter(card: string): Record<string, string> {
  const bloco = card.split("---")[1] ?? "";
  return Object.fromEntries(
    bloco
      .split("\n")
      .filter((linha) => /^[a-z_]+:/.test(linha))
      .map((linha) => {
        const corte = linha.indexOf(":");
        return [linha.slice(0, corte), linha.slice(corte + 1).trim()];
      }),
  );
}

describe("slugDaEmpresa", () => {
  it("normaliza acento, caixa e espaco", () => {
    expect(slugDaEmpresa("Indústria São João")).toBe("industria-sao-joao");
  });

  it("descarta o sufixo societario, que nao identifica a empresa", () => {
    expect(slugDaEmpresa("Vertex Componentes LTDA")).toBe("vertex-componentes");
    expect(slugDaEmpresa("Alfa S/A")).toBe("alfa");
  });

  it("nao deixa hifen sobrando na ponta", () => {
    expect(slugDaEmpresa("  --Metalúrgica--  ")).toBe("metalurgica");
  });

  it("limita o tamanho sem terminar em hifen", () => {
    const slug = slugDaEmpresa("Companhia Brasileira de Distribuicao de Materiais Eletricos");
    expect(slug.length).toBeLessThanOrEqual(40);
    expect(slug).not.toMatch(/-$/);
  });

  it("nunca devolve vazio, porque vazio viraria pasta sem nome", () => {
    expect(slugDaEmpresa("!!!")).toBe("lead-sem-empresa");
    expect(slugDaEmpresa("")).toBe("lead-sem-empresa");
  });
});

describe("datas", () => {
  // 🔴 Estes casos usam INSTANTE em UTC de proposito. A versao anterior deste
  // bloco construia `new Date(2026, 7, 5, 9, 5)`, que e hora local: o valor
  // voltava pelo mesmo fuso em que entrou e o teste passava em qualquer maquina,
  // inclusive na Vercel (UTC), que e onde o card e montado de verdade. Foi assim
  // que a call do Grupo Makron, marcada para 12:00, virou "15:00" no card.

  it("escreve o horario no fuso de SP, nao no do processo", () => {
    // 15:00Z = 12:00 em Sao Paulo, que e a hora que o lead marcou.
    expect(quandoLegivel(new Date("2026-08-27T15:00:00.000Z"))).toBe("27/08 às 12:00");
  });

  it("usa o fuso de SP para a data, nao UTC", () => {
    // 21h em SP e 00:00Z do dia seguinte: a call continua sendo do dia 21.
    expect(dataIso(new Date("2026-08-22T00:00:00.000Z"))).toBe("2026-08-21");
  });

  it("nao adianta o dia numa call do comeco da manha", () => {
    // 09:00 em SP = 12:00Z, mesmo dia dos dois lados. Guarda o caso trivial
    // para que uma correcao futura nao troque um off-by-one por outro.
    expect(dataIso(new Date("2026-08-05T12:00:00.000Z"))).toBe("2026-08-05");
    expect(quandoLegivel(new Date("2026-08-05T12:00:00.000Z"))).toBe("05/08 às 09:00");
  });
});

describe("valorYaml", () => {
  it("aspas o valor, porque nome de empresa tem dois-pontos e #", () => {
    expect(valorYaml("Alfa: a #1")).toBe("'Alfa: a #1'");
  });

  it("escapa aspas simples do jeito do YAML", () => {
    expect(valorYaml("D'Angelo")).toBe("'D''Angelo'");
  });
});

describe("montarCard", () => {
  it("entra no funil em call-marcada", () => {
    expect(frontmatter(montarCard(BASE)).status).toBe(STATUS_ENTRADA);
    expect(ENUM_STATUS.has(STATUS_ENTRADA)).toBe(true);
  });

  it("tem todo campo que o schema do brain exige", () => {
    const campos = frontmatter(montarCard(BASE));
    for (const obrigatorio of REQUIRED_FIELDS) {
      expect(campos[obrigatorio], `faltou ${obrigatorio}`).toBeDefined();
    }
  });

  it("so grava origem que existe no enum do brain", () => {
    for (const doFormulario of ["instagram", "indicacao", "youtube", "linkedin", "google", "outro"]) {
      const origem = frontmatter(montarCard({ ...BASE, origem: doFormulario })).origem;
      expect(ENUM_ORIGEM.has(origem), `${doFormulario} virou "${origem}"`).toBe(true);
    }
  });

  it("cai em outro quando a origem e desconhecida, em vez de gravar lixo", () => {
    expect(frontmatter(montarCard({ ...BASE, origem: "tiktok" })).origem).toBe("outro");
  });

  it("preserva o texto do lead literalmente", () => {
    expect(montarCard(BASE)).toContain("Orçamento. A gente refaz três vezes até fechar.");
  });

  it("nao quebra o YAML quando a empresa tem caractere de estrutura", () => {
    const card = montarCard({ ...BASE, empresa: "Alfa: Beta 'Gama' #1" });
    expect(frontmatter(card).empresa).toBe("'Alfa: Beta ''Gama'' #1'");
  });

  it("da um nome honesto quando o lead nao informou empresa", () => {
    const card = montarCard({ ...BASE, empresa: null });
    expect(card).toContain("Ricardo Alves (empresa não informada)");
  });

  it("aponta o proximo passo para a data da call", () => {
    const campos = frontmatter(montarCard(BASE));
    expect(campos.data_proximo_passo).toBe("2026-08-21");
    expect(campos.proximo_passo).toContain("21/08 às 14:30");
  });

  it("abre a pendencia no formato do harness, com titulo acionavel", () => {
    const card = montarCard(BASE);
    const pendencia = card.split("\n").find((linha) => linha.startsWith("- [ ] (owner:Yan) (prio"));
    expect(pendencia).toBeDefined();
    expect(pendencia).toContain("(prazo:2026-08-21)");
    // O titulo (antes do ::) e o que o Yan le no painel: sem path, sem hash.
    const titulo = pendencia!.split("::")[0];
    expect(titulo).toContain("Conduzir a Call 1");
    expect(titulo).not.toMatch(/\.html|_pipeline|\//);
  });

  it("omite whatsapp e cargo quando nao existem, em vez de gravar vazio", () => {
    const campos = frontmatter(montarCard({ ...BASE, whatsapp: null, papel: null }));
    expect(campos.whatsapp).toBeUndefined();
    expect(campos.contato_cargo).toBeUndefined();
  });

  it("traduz o porte para frase", () => {
    expect(montarCard(BASE)).toContain("6 a 20 pessoas");
    expect(montarCard({ ...BASE, porte: null })).toContain("não informado");
  });

  it("nao inventa modelo comercial antes da call", () => {
    expect(frontmatter(montarCard(BASE)).modelo).toBe("indefinido");
  });

  it("registra a criacao no historico", () => {
    expect(montarCard(BASE)).toContain("- **2026-08-17** — Preencheu o formulário");
  });
});

describe("indicado_por (2026-09-03)", () => {
  it("grava quem indicou quando a origem e indicacao", () => {
    const card = montarCard({ ...BASE, origem: "indicacao", indicadoPor: "Thiago Nigro" });
    expect(frontmatter(card).indicado_por).toBe("'Thiago Nigro'");
    expect(card).toContain("| Indicado por | Thiago Nigro |");
  });

  it("descarta o nome quando a origem nao e indicacao, mesmo que venha preenchido", () => {
    const card = montarCard({ ...BASE, origem: "instagram", indicadoPor: "Fulano" });
    expect(frontmatter(card).indicado_por).toBeUndefined();
    expect(card).not.toContain("Indicado por");
  });

  it("nao escreve o campo quando veio vazio", () => {
    const card = montarCard({ ...BASE, origem: "indicacao", indicadoPor: "   " });
    expect(frontmatter(card).indicado_por).toBeUndefined();
  });

  it("card antigo, sem o campo, continua igual", () => {
    expect(montarCard(BASE)).not.toContain("indicado_por");
  });
});
