/**
 * O que estes testes protegem: o que chega no card do evento da agenda.
 *
 * É a única superfície da 003 que uma pessoa lê minutos antes de entrar numa
 * call com um lead. Erro aqui não dá erro em lugar nenhum, só aparece como
 * roteiro ilegível na frente do cliente.
 */

import { describe, expect, it } from "vitest";

import {
  escaparHtml,
  escaparTexto,
  extrairZonaAoVivo,
  lerEtapas,
  LIMITE_DESCRICAO,
  montarDescricao,
  RoteiroSemZonaAoVivo,
  textoVisivel,
} from "@/lib/diagnostico/andaime";

function roteiro(zona: string): string {
  return `<html><body><h1>PREP</h1><p>isto nao pode vazar para o card do evento</p>
<!-- CALL-ZONE:START -->${zona}<!-- CALL-ZONE:END -->
<footer>rodape</footer></body></html>`;
}

const ZONA_COMPLETA = `
<div data-call-format="diagnostic">
  <section data-stage="frame"><p>Essa conversa e pra entender a operacao de voces.</p></section>
  <section data-stage="diagnosis"><p>Me conta como funciona hoje, do comeco ao fim.</p></section>
  <section data-stage="decision"><p>Quem mais participa de uma decisao dessas?</p></section>
  <section data-stage="door-1"><p>Resolver isso e prioridade agora?</p></section>
  <section data-stage="advance"><p>Proximo passo: Call 2 na quinta, as 10h.</p></section>
</div>`;

describe("extrairZonaAoVivo", () => {
  it("recorta so o que esta entre os marcadores", () => {
    const zona = extrairZonaAoVivo(roteiro("<p>miolo</p>"));
    expect(zona).toContain("miolo");
  });

  it("nao deixa o PREP nem o rodape entrarem", () => {
    const zona = extrairZonaAoVivo(roteiro(ZONA_COMPLETA));
    expect(zona).not.toContain("nao pode vazar");
    expect(zona).not.toContain("rodape");
  });

  it("lanca quando o roteiro nao tem zona ao vivo", () => {
    expect(() => extrairZonaAoVivo("<html><body>sem marcador</body></html>")).toThrow(
      RoteiroSemZonaAoVivo,
    );
  });

  it("lanca quando os marcadores vem invertidos", () => {
    const invertido = "<!-- CALL-ZONE:END --><p>x</p><!-- CALL-ZONE:START -->";
    expect(() => extrairZonaAoVivo(invertido)).toThrow(RoteiroSemZonaAoVivo);
  });
});

describe("textoVisivel", () => {
  it("separa blocos vizinhos em vez de colar as palavras", () => {
    expect(textoVisivel("<p>um</p><p>dois</p>")).toBe("um\ndois");
  });

  it("marca item de lista com bullet", () => {
    expect(textoVisivel("<ul><li>a</li><li>b</li></ul>")).toBe("• a\n• b");
  });

  it("descarta script e style inteiros", () => {
    expect(textoVisivel("<style>p{color:red}</style><p>oi</p>")).toBe("oi");
    expect(textoVisivel("<script>alert(1)</script><p>oi</p>")).toBe("oi");
  });

  it("resolve entidade para caractere", () => {
    expect(textoVisivel("<p>R&amp;D &lt;b&gt; &quot;x&quot;</p>")).toBe('R&D <b> "x"');
  });

  it("nao deixa mais de uma linha em branco seguida", () => {
    expect(textoVisivel("<p>a</p><br><br><br><p>b</p>")).toBe("a\n\nb");
  });
});

describe("escaparHtml, para valor de atributo", () => {
  it("escapa aspas, que delimitam o atributo", () => {
    expect(escaparHtml('<b>&"')).toBe("&lt;b&gt;&amp;&quot;");
  });

  it("nao escapa duas vezes quando vem depois de textoVisivel", () => {
    // A ordem importa: `textoVisivel` desfaz entidade, `escaparHtml` refaz.
    // Invertida, um `&amp;` do roteiro viraria `&amp;amp;` na tela.
    expect(escaparHtml(textoVisivel("<p>R&amp;D</p>"))).toBe("R&amp;D");
  });
});

describe("escaparTexto, para conteudo", () => {
  it("neutraliza tag e ampersand", () => {
    expect(escaparTexto("<script>a & b")).toBe("&lt;script&gt;a &amp; b");
  });

  it("PRESERVA as aspas", () => {
    // O andaime e quase todo fala entre aspas. Escapando, o card do evento vira
    // uma parede de `&quot;` e fica ilegivel na tela do celular.
    expect(escaparTexto('"Ricardo, bom dia."')).toBe('"Ricardo, bom dia."');
  });
});

describe("lerEtapas", () => {
  it("le as cinco etapas do diagnostico na ordem do documento", () => {
    const etapas = lerEtapas(extrairZonaAoVivo(roteiro(ZONA_COMPLETA)));
    expect(etapas.map((e) => e.estagio)).toEqual([
      "frame",
      "diagnosis",
      "decision",
      "door-1",
      "advance",
    ]);
  });

  it("traduz o estagio para o rotulo que a pessoa le", () => {
    const etapas = lerEtapas(extrairZonaAoVivo(roteiro(ZONA_COMPLETA)));
    expect(etapas.map((e) => e.rotulo)).toEqual([
      "ABERTURA",
      "DIAGNÓSTICO",
      "DECISÃO",
      "PORTA 1",
      "PRÓXIMO PASSO",
    ]);
  });

  it("nao mistura o corpo de uma etapa com o da seguinte", () => {
    const etapas = lerEtapas(extrairZonaAoVivo(roteiro(ZONA_COMPLETA)));
    expect(etapas[0].texto).toContain("entender a operacao");
    expect(etapas[0].texto).not.toContain("do comeco ao fim");
  });

  it("descarta etapa vazia em vez de imprimir um titulo solto", () => {
    const zona = `<section data-stage="frame"><p>tem texto</p></section>
                  <section data-stage="advance"></section>`;
    expect(lerEtapas(zona)).toHaveLength(1);
  });

  it("usa o proprio nome quando o estagio nao tem rotulo mapeado", () => {
    const zona = `<section data-stage="recap"><p>x</p></section>`;
    expect(lerEtapas(zona)[0].rotulo).toBe("RECAP");
  });
});

describe("montarDescricao", () => {
  const base = { html: roteiro(ZONA_COMPLETA), nomeDoLead: "Ricardo", empresa: "Vertex" };

  it("abre com quem e a call", () => {
    expect(montarDescricao(base)).toMatch(/^<b>Ricardo · Vertex<\/b>/);
  });

  it("omite a empresa quando o lead nao informou", () => {
    const so = montarDescricao({ ...base, empresa: null });
    expect(so).toMatch(/^<b>Ricardo<\/b>/);
    expect(so).not.toContain("·");
  });

  it("leva as cinco etapas do andaime", () => {
    const descricao = montarDescricao(base);
    for (const rotulo of ["ABERTURA", "DIAGNÓSTICO", "DECISÃO", "PORTA 1", "PRÓXIMO PASSO"]) {
      expect(descricao).toContain(`<b>${rotulo}</b>`);
    }
  });

  it("nao leva o PREP", () => {
    expect(montarDescricao(base)).not.toContain("nao pode vazar");
  });

  it("diz na cara que e diagnostico, sem oferta e sem preco", () => {
    expect(montarDescricao(base)).toContain("sem oferta, sem preço");
  });

  it("so usa as tags que o Google Agenda renderiza", () => {
    // `<ul>`, `<table>`, `<div>` e estilo aparecem como texto cru no app.
    const tags = [...montarDescricao(base).matchAll(/<(\/?[a-z]+)[^>]*>/g)].map((m) =>
      m[1].replace("/", ""),
    );
    expect([...new Set(tags)].sort()).toEqual(["b", "br"]);
  });

  it("inclui o link do documento completo quando ele existe", () => {
    const com = montarDescricao({ ...base, urlDoRoteiroCompleto: "https://x.com/a?b=1&c=2" });
    expect(com).toContain('<a href="https://x.com/a?b=1&amp;c=2">abrir</a>');
  });

  it("escapa o nome do lead, que e texto de terceiro", () => {
    const perigoso = montarDescricao({ ...base, nomeDoLead: '<img src=x onerror="alert(1)">' });
    expect(perigoso).toContain("&lt;img");
    expect(perigoso).not.toContain("<img");
  });

  it("lanca quando o roteiro nao tem zona ao vivo", () => {
    expect(() => montarDescricao({ ...base, html: "<p>nada</p>" })).toThrow(RoteiroSemZonaAoVivo);
  });

  it("respeita o limite do Google e avisa quando cortou", () => {
    const gigante = roteiro(
      `<section data-stage="frame"><p>${"palavra ".repeat(4000)}</p></section>`,
    );
    const descricao = montarDescricao({ ...base, html: gigante });
    expect(descricao.length).toBeLessThanOrEqual(LIMITE_DESCRICAO);
    expect(descricao).toContain("roteiro cortado por tamanho");
  });

  it("nao corta o que cabe", () => {
    expect(montarDescricao(base)).not.toContain("roteiro cortado");
  });
});
