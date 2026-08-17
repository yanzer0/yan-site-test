import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * A abertura da página aparece na PRIMEIRA pergunta, e só nela.
 *
 * Por que virou teste: o texto que vende a call ("São 14 perguntas...", "Não é
 * apresentação comercial...") morava solto acima do formulário, então repetia
 * nas 14 perguntas. Da segunda em diante ele rouba a tela da pergunta e da
 * barra de progresso e, no celular, empurra o campo de resposta para baixo da
 * dobra: o lead tem que rolar para achar onde responder. Medido no print do
 * Yan em 17/08.
 *
 * O conserto é estrutural: a abertura vira `children` da Conversa, que só a
 * renderiza quando `indice === 0`. Este teste trava as duas metades, porque
 * qualquer uma sozinha reintroduz o problema:
 *
 *   1. a abertura está DENTRO de <Conversa>, não solta acima
 *   2. a Conversa condiciona o children ao primeiro passo
 *
 * Sem jsdom no projeto não dá para clicar "Continuar" e conferir a pergunta 2
 * renderizada. Então o que se prova aqui é a estrutura, não o pixel. A prova
 * visual foi feita no preview antes do commit.
 */

const RAIZ = process.cwd();
const PAGINA = join(RAIZ, "src/app/diagnostico/page.tsx");
const CONVERSA = join(RAIZ, "src/components/diagnostico/Conversa.tsx");

/** Trechos da abertura. Se a copy mudar, o teste falha e alguém relê a regra. */
const FRASES_DA_ABERTURA = [
  "São 14 perguntas",
  "Na call a gente mapeia",
  "Não é apresentação comercial",
];

function ler(caminho: string): string {
  return readFileSync(caminho, "utf8");
}

/**
 * O JSX, sem o bloco `metadata`.
 *
 * A description do SEO repete "São 14 perguntas" de propósito, e deve repetir:
 * é a `<meta>` que o Google e o preview de link leem. O que este teste cobra é
 * o que o lead vê NA TELA, e ninguém lê meta tag na tela.
 */
function apenasOQueOLeadVe(pagina: string): string {
  return pagina.replace(/export const metadata[\s\S]*?\n};\n/, " ");
}

/** O que está entre <Conversa ...> e </Conversa>. Vazio se as tags sumirem. */
function dentroDaConversa(pagina: string): string {
  const abre = pagina.indexOf("<Conversa");
  const fecha = pagina.indexOf("</Conversa>");
  if (abre === -1 || fecha === -1) return "";
  return pagina.slice(abre, fecha);
}

describe("abertura da pagina de diagnostico", () => {
  it("mora dentro da Conversa, e nao solta acima do formulario", () => {
    const pagina = ler(PAGINA);
    const dentro = dentroDaConversa(pagina);

    expect(dentro, "a page precisa usar <Conversa>...</Conversa> com children").not.toBe("");

    for (const frase of FRASES_DA_ABERTURA) {
      expect(dentro, `"${frase}" saiu de dentro da <Conversa> e vai repetir nas 14 perguntas`)
        .toContain(frase);
    }
  });

  it("nao sobrou copia da abertura fora da Conversa", () => {
    const pagina = apenasOQueOLeadVe(ler(PAGINA));
    const fora = pagina.replace(dentroDaConversa(pagina), "");

    for (const frase of FRASES_DA_ABERTURA) {
      expect(fora, `"${frase}" aparece DUAS vezes: dentro e fora da <Conversa>`).not.toContain(
        frase,
      );
    }
  });

  it("a Conversa so renderiza o children no primeiro passo", () => {
    const conversa = ler(CONVERSA);

    expect(
      conversa,
      "sem a guarda de indice === 0 o children volta a aparecer em toda pergunta",
    ).toContain("indice === 0 && children");
  });

  it("a Conversa aceita children", () => {
    const conversa = ler(CONVERSA);

    expect(conversa).toContain("children?: React.ReactNode");
    expect(conversa).toMatch(/function Conversa\(\{[^}]*children[^}]*\}/);
  });
});
