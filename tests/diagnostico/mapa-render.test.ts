import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";

import {
  renderizarMapa,
  escaparHtml,
  tokensNaoPreenchidos,
  REPRESENTANTE,
} from "@/lib/diagnostico/mapa-render";
import type { MapaConteudo } from "@/lib/diagnostico/mapa-tipos";

/**
 * A cópia versionada do template, que é a que roda em produção.
 * O canônico vive no brain e é coberto pelo guard de lá; esta cópia existe
 * porque o brain não é deployado. O teste de sincronia abaixo prova que as
 * duas não divergiram.
 */
const TEMPLATE = "src/lib/diagnostico/mapa-template.html";
const temTemplate = existsSync(TEMPLATE);
const template = temTemplate ? readFileSync(TEMPLATE, "utf8") : "";

/** O canônico, no brain. Ausente em outra máquina, e aí o teste se pula. */
const CANONICO =
  process.env.MAPA_TEMPLATE_CANONICO ??
  "C:/Users/PC/Documents/INFUSER USE - CONSULTORIA DE IA/yangalasso-brain/_knowledge/templates/mapa-diagnostico/mapa-diagnostico.template.html";

describe("sincronia com o template canonico do brain", () => {
  it.skipIf(!existsSync(CANONICO))(
    "a copia do site e identica ao canonico, linha a linha",
    () => {
      // Se este teste falhar, alguem editou um dos dois lados sozinho. O certo
      // e sempre editar o canonico no brain, onde o guard cobre, e recopiar.
      //
      // Compara ignorando fim de linha, e nao byte a byte: os dois repos tem
      // configuracao de checkout diferente, entao no Windows o site vem em CRLF
      // e o brain em LF. A comparacao crua reprovava por isso desde sempre, sem
      // nenhuma divergencia de conteudo, e virou vermelho permanente que
      // ninguem lia. Diferenca que importa (uma linha trocada) continua pegando.
      const linhas = (caminho: string) => readFileSync(caminho, "utf8").split(/\r?\n/);
      expect(linhas(TEMPLATE)).toEqual(linhas(CANONICO));
    },
  );

  it("a copia existe no repo, senao a rota de publicar quebra em producao", () => {
    expect(temTemplate).toBe(true);
  });
});

const CONTEUDO: MapaConteudo = {
  cliente: "Metalurgica Vertex",
  contato: "Ricardo Menezes",
  processo: "orcamento de peca sob medida",
  segmento: "Metalurgia",
  resumo: "Hoje um orcamento passa por quatro maos e para quando o Douglas tira ferias.",
  etapas: [
    {
      ordem: 1,
      titulo: "O pedido chega",
      descricao: "Por e-mail ou WhatsApp, sem formato padrao.",
      responsavel: "os 3 vendedores",
      ferramenta: "Outlook",
      volume: "40 por semana",
    },
    {
      ordem: 2,
      titulo: "A engenharia calcula",
      descricao: "Numa planilha copiada de um modelo antigo.",
      responsavel: "Douglas",
      ferramenta: "Excel",
      volume: "40 min a 3 horas",
    },
  ],
  citacao: { texto: "O Douglas e o gargalo e ele sabe disso.", autor: "Ricardo Menezes" },
  achados: [
    {
      tipo: "atrito",
      classificacao: "fato",
      titulo: "Uma pessoa so sabe calcular",
      descricao: "A operacao para quando ele nao esta.",
      origem: "quando ele tira ferias a gente para",
    },
    {
      tipo: "atrito",
      classificacao: "leitura",
      titulo: "O retrabalho nasce na entrada",
      descricao: "O gargalo aparente parece ser problema de entrada.",
    },
    {
      tipo: "encaixe",
      classificacao: "leitura",
      titulo: "Na entrada do pedido",
      descricao: "Uma porta unica com os dados minimos.",
      oQueMuda: "O Douglas para de perseguir informacao.",
    },
    {
      tipo: "dependencia",
      classificacao: "fato",
      titulo: "Acesso de leitura",
      descricao: "Passa pelo TI terceirizado.",
      origem: "isso passa pelo nosso TI",
    },
    {
      tipo: "limite",
      classificacao: "limite",
      titulo: "Preco sem conferencia humana",
      descricao: "Risco de vender no prejuizo.",
    },
  ],
  lacunas: ["Quanto tempo leva um orcamento do pedido ate a resposta."],
  proximoPasso: {
    titulo: "Medir a entrada antes do calculo",
    descricao: "Olhar os ultimos 20 orcamentos.",
    passos: ["Contar os retornos ao vendedor", "Abrir a conversa com o TI"],
  },
};

const DADOS = {
  conteudo: CONTEUDO,
  representante: REPRESENTANTE,
  data: "14 de agosto de 2026",
  dataCurta: "14.08.2026",
};

describe.skipIf(!temTemplate)("renderizacao do mapa", () => {
  const html = temTemplate ? renderizarMapa(template, DADOS) : "";

  it("nao deixa nenhum token por preencher", () => {
    expect(tokensNaoPreenchidos(html)).toEqual([]);
  });

  it("repete o bloco de etapa uma vez por etapa", () => {
    expect((html.match(/class="phase"/g) ?? []).length).toBe(CONTEUDO.etapas.length);
  });

  it("tira a linha de conexao so da ultima etapa", () => {
    // Conta a TAG, nao a string: `phase-connector` tambem aparece na regra CSS.
    expect((html.match(/class="phase-connector"/g) ?? []).length).toBe(
      CONTEUDO.etapas.length - 1,
    );
  });

  it("nao vaza comentario interno do template para o cliente", () => {
    // O template canonico e cheio de instrucao de manutencao ("REPETIR .phase
    // por etapa", as regras de conteudo). Isso nao vai no documento entregue.
    expect(html).not.toContain("REPETIR");
    expect(html).not.toContain("TEMPLATE CANÔNICO");
    expect(html).not.toContain("REGRAS DE CONTEÚDO");
  });

  it("repete um card por atrito, com o selo da classificacao de cada um", () => {
    expect((html.match(/class="pain-card"/g) ?? []).length).toBe(2);
    expect(html).toContain("seal-fato");
    expect(html).toContain("seal-leitura");
  });

  it("nao sobra marcador de bloco no documento entregue", () => {
    expect(html).not.toContain("@bloco:");
    expect(html).not.toContain("@/bloco:");
  });

  it("mantem a identidade v2 e nao traz a v1.1", () => {
    expect(html).toContain("#C6FF34");
    expect(html).toContain("Onest");
    expect(html).toContain("Inter");
    for (const legado of ["Fraunces", "JetBrains Mono", "Cabinet Grotesk"]) {
      expect(html).not.toContain(legado);
    }
    expect(html).not.toMatch(/--green:\s*#A8E84C/);
  });

  it("mantem o logo embutido, para o documento ser self-contained", () => {
    expect(html).toContain("data:image/svg+xml;base64,");
  });

  it("continua no-JS-safe: nenhum script no documento", () => {
    expect(html).not.toMatch(/<script/i);
  });

  it("nao e indexavel", () => {
    expect(html).toContain('name="robots"');
    expect(html).toContain("noindex");
  });

  it("nao contem em-dash", () => {
    expect(html).not.toContain("—");
  });

  it("o campo DE traz so a empresa, nunca o nome de quem conduziu", () => {
    // O documento e da Infuser. A Call 1 pode ser conduzida por qualquer um do
    // time, entao assinar com nome individual cria um vinculo que o processo
    // nao tem, e envelhece mal quando a pessoa sai ou troca.
    const html = renderizarMapa(template, { ...DADOS, representante: REPRESENTANTE });
    expect(html).toContain(">Infuser<");
    for (const pessoa of ["Yan", "Galasso", "Iago", "Soares", "Pedro"]) {
      expect(html, `nome de pessoa vazou: ${pessoa}`).not.toContain(pessoa);
    }
  });

  it("nao contem preco em lugar nenhum", () => {
    expect(html).not.toContain("R$");
  });

  it("mostra a lacuna declarada", () => {
    expect(html).toContain("Ficou em aberto");
    expect(html).toContain("Quanto tempo leva um orcamento");
  });

  it("mostra a citacao do cliente", () => {
    expect(html).toContain("O Douglas e o gargalo");
  });
});

describe.skipIf(!temTemplate)("blocos condicionais", () => {
  it("sem citacao, o bloco inteiro sai em vez de ficar vazio", () => {
    const html = renderizarMapa(template, {
      ...DADOS,
      conteudo: { ...CONTEUDO, citacao: null },
    });
    expect(html).not.toContain('class="quote"');
  });

  it("sem lacuna, o bloco de lacuna nao aparece", () => {
    const html = renderizarMapa(template, {
      ...DADOS,
      conteudo: { ...CONTEUDO, lacunas: [] },
    });
    expect(html).not.toContain("Ficou em aberto");
  });

  it("limita o proximo passo a 3 itens", () => {
    const html = renderizarMapa(template, {
      ...DADOS,
      conteudo: {
        ...CONTEUDO,
        proximoPasso: { ...CONTEUDO.proximoPasso, passos: ["a", "b", "c", "d", "e"] },
      },
    });
    expect((html.match(/class="step-card"/g) ?? []).length).toBe(3);
  });
});

describe("escape de HTML", () => {
  it("neutraliza markup vindo da transcricao", () => {
    expect(escaparHtml('<script>alert("x")</script>')).toBe(
      "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;",
    );
  });

  it.skipIf(!temTemplate)("conteudo malicioso nao vira tag no documento", () => {
    const html = renderizarMapa(template, {
      ...DADOS,
      conteudo: {
        ...CONTEUDO,
        cliente: '<img src=x onerror="alert(1)">',
        resumo: "<script>roubar()</script>",
      },
    });
    // O que importa nao e a string sumir, e ela nao virar TAG. Escapado, o
    // texto `onerror=` continua legivel no documento, e isso esta certo:
    // ele e conteudo, nao atributo.
    expect(html).not.toContain("<script>roubar()");
    expect(html).not.toMatch(/<img[^>]*onerror/i);
    expect(html).toContain("&lt;script&gt;roubar()");
    expect(html).toContain("&lt;img src=x");
  });
});

describe("falha alto quando o template nao serve", () => {
  it("lanca se faltar um bloco esperado, em vez de entregar documento com buraco", () => {
    expect(() => renderizarMapa("<html><body>sem blocos</body></html>", DADOS)).toThrow(
      /bloco "etapa" nao existe/,
    );
  });
});
