import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { Desfecho } from "@/components/diagnostico/Desfecho";

/**
 * O que cada faixa REALMENTE lê no fim do formulário.
 *
 * Os outros guards de copy leem o arquivo-fonte, e arquivo-fonte não distingue
 * o texto que o qualificado recebe do texto que o pagante recebe: os dois
 * moram no mesmo `.tsx`. Só montando dá para provar que a promessa é a mesma.
 *
 * A regra que isto protege (decisão do Yan, 17/08): a call é o produto e o Mapa
 * é o bônus que ela entrega. Quem não passa no corte não é informado disso, e
 * recebe o mesmo convite, com preço no lugar do calendário. A versão anterior
 * dizia a ele que "a call gratuita não é o melhor caminho agora" e cobrava
 * R$ 197 pela mesma call duas linhas abaixo.
 */

const LINK_STRIPE = "https://buy.stripe.com/exemplo";

/** O markup sem tags, que é o que o lead lê de fato. */
function textoDe(markup: string): string {
  return markup
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function renderizar(faixa: "qualificado" | "nao_icp_empresa" | "revisao" | "nao_icp_pessoal") {
  return textoDe(
    renderToStaticMarkup(
      <Desfecho
        faixa={faixa}
        nome="Yan Galasso"
        processo="a cobrança de inadimplentes"
        email="lead@exemplo.com"
        urlCal="https://cal.com/infuser/diagnostico"
        urlMapa={LINK_STRIPE}
      />,
    ),
  );
}

const QUALIFICADO = renderizar("qualificado");
const PAGANTE = renderizar("nao_icp_empresa");
const REVISAO = renderizar("revisao");

describe("as duas faixas recebem a MESMA promessa", () => {
  it("nenhuma das duas diz ao lead que ele nao se encaixa", () => {
    for (const texto of [QUALIFICADO, PAGANTE, REVISAO]) {
      expect(texto).not.toMatch(/não é o melhor caminho|não vai te servir|não se encaixa/i);
    }
  });

  it("as duas convidam para a call com o mesmo titulo", () => {
    expect(QUALIFICADO).toContain("Então vamos marcar");
    expect(PAGANTE).toContain("Então vamos marcar");
  });

  it("as duas descrevem o Mapa com a mesma lista", () => {
    const ITENS = [
      "etapa por etapa",
      "trecho da nossa conversa",
      "Onde a IA encaixa",
      "não dá para automatizar",
      "próximo passo",
    ];
    for (const item of ITENS) {
      expect(QUALIFICADO, `qualificado perdeu "${item}"`).toContain(item);
      expect(PAGANTE, `pagante perdeu "${item}"`).toContain(item);
    }
  });

  it("revisao cai no mesmo destino do nao_icp_empresa", () => {
    expect(REVISAO).toBe(PAGANTE);
  });
});

describe("a diferenca entre as faixas e so o preco", () => {
  it("so o pagante ve valor, e ele ve antes de clicar", () => {
    expect(PAGANTE).toContain("R$ 197");
    expect(QUALIFICADO, "o qualificado nao pode ver preco nenhum").not.toContain("R$");
  });

  it("o botao do pagante fala de agendar, nao de comprar documento", () => {
    // "Quero o mapa" vendia o entregável e escondia que a call vem junto.
    expect(PAGANTE).toContain("Agendar a call");
    expect(PAGANTE).not.toContain("Quero o mapa");
  });

  it("preco e botao andam juntos", () => {
    // Card que anuncia R$ 197 sem caminho de compra faz o lead decidir comprar
    // e bater numa parede. Foi o estado real do funil entre 16 e 17/08.
    const semLink = textoDe(
      renderToStaticMarkup(
        <Desfecho
          faixa="nao_icp_empresa"
          nome="Yan"
          processo="a cobrança"
          email="lead@exemplo.com"
          urlMapa={undefined}
        />,
      ),
    );
    expect(semLink).not.toContain("R$ 197");
    expect(semLink).toContain("entra em contato");
  });
});

describe("o que sustenta o preco e fato, nao adjetivo", () => {
  it("nao afirma que e barato nem que vale mais", () => {
    // A conclusão de valor é do lead. Afirmá-la ativa reatância e é o que
    // qualquer vendedor diria, então não prova nada.
    for (const adjetivo of [
      "barato",
      "vale mais",
      "menos do que",
      "por apenas",
      "imperdível",
      "oportunidade única",
    ]) {
      expect(PAGANTE.toLowerCase(), `voltou a afirmar valor: "${adjetivo}"`).not.toContain(
        adjetivo,
      );
    }
  });

  it("nao fabrica urgencia nem escassez", () => {
    // Palavra inteira, não substring: "corre" casava dentro de "percorre" e
    // reprovava uma frase perfeitamente honesta.
    for (const gatilho of ["últimas", "restam", "só hoje", "vagas", "corre", "agora ou"]) {
      expect(PAGANTE.toLowerCase(), `urgência fabricada: "${gatilho}"`).not.toMatch(
        new RegExp(`\\b${gatilho}\\b`),
      );
    }
  });

  it("declara o que o documento NAO faz, que e o que responde a objecao", () => {
    // O Mapa é proibido por validação de citar ferramenta nossa, prazo ou valor
    // (mapa-schema.ts). Dizer isso deixa o lead concluir sozinho que não é
    // orçamento disfarçado, sem que a página precise jurar que não é.
    expect(PAGANTE).toMatch(/não cita ferramenta nossa, prazo nem valor/i);
  });

  it("diz que o documento fica com o lead de qualquer forma", () => {
    expect(PAGANTE).toMatch(/se a gente não trabalhar junto/i);
  });
});

describe("uso pessoal continua com destino proprio", () => {
  it("nao recebe o convite da call de empresa", () => {
    const pessoal = renderizar("nao_icp_pessoal");
    expect(pessoal).toContain("Kit Segundo Cérebro");
    expect(pessoal).not.toContain("Agendar a call");
  });
});
