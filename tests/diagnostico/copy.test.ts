import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { P, PERGUNTAS } from "@/lib/diagnostico/perguntas";

/**
 * Guard executável das regras de copy da casa.
 *
 * Isto existe porque "revisar a copy antes de entregar" é regra de conduta, e
 * regra de conduta depende de alguém lembrar. Aqui vira teste: se alguém
 * escrever um em-dash ou dizer ao lead que ele foi desqualificado, o CI reprova.
 *
 * Fonte das regras: tone-of-voice da Infuser, FR-017 da spec 001 e o princípio
 * VI da constitution.
 */

const RAIZ = process.cwd();

const ARQUIVOS_CLIENT_FACING = [
  "src/components/diagnostico/Desfecho.tsx",
  "src/components/diagnostico/Conversa.tsx",
  "src/components/diagnostico/Campo.tsx",
  "src/app/diagnostico/page.tsx",
  "src/lib/diagnostico/perguntas.ts",
];

/**
 * Lê o arquivo SEM comentários.
 *
 * Sem isso o teste se autossabota: o cabeçalho do Desfecho.tsx documenta a
 * proibição escrevendo "desqualificado, reprovado", e o teste reprovaria a
 * própria documentação da regra que ele existe para cobrar. O que vale é o que
 * o lead lê, e o lead não lê comentário.
 */
function ler(caminho: string): string {
  const bruto = readFileSync(join(RAIZ, caminho), "utf8");
  return bruto
    .replace(/\/\*[\s\S]*?\*\//g, " ") // blocos /* ... */
    .replace(/^\s*\/\/.*$/gm, " "); // linhas que são só //
}

const TUDO = ARQUIVOS_CLIENT_FACING.map(ler).join("\n");

describe("em-dash (regra de marca, sem excecao)", () => {
  it.each(ARQUIVOS_CLIENT_FACING)("%s nao tem em-dash nem en-dash", (arquivo) => {
    const conteudo = ler(arquivo);
    expect(conteudo).not.toContain("—");
    expect(conteudo).not.toContain("–");
  });
});

describe("FR-017: nenhuma faixa comunica desqualificacao", () => {
  const desfecho = ler("src/components/diagnostico/Desfecho.tsx");

  const PROIBIDAS = [
    "desqualific",
    "reprovad",
    "nao atende aos criterios",
    "não atende aos critérios",
    "perfil nao",
    "perfil não",
    "infelizmente",
    "nao foi selecionado",
    "não foi selecionado",
    "nao passou",
    "não passou",
    "sem vagas",
    "vagas limitadas",
    "ultimas vagas",
    "últimas vagas",
  ];

  it.each(PROIBIDAS)("nao usa a expressao '%s'", (proibida) => {
    expect(desfecho.toLowerCase()).not.toContain(proibida);
  });

  it("nao-ICP recebe o MESMO convite do qualificado, nao uma recusa", () => {
    // Este teste já exigiu a frase "não vai te servir", que abria a recusa. Ela
    // era lida aqui como contrato de honestidade e era, na prática, o problema:
    // o lead lia que a call não servia para ele e logo abaixo era cobrado
    // R$ 197 pela mesma call. Desqualificar e cobrar na mesma tela derruba a
    // venda, e a call é o produto (decisão do Yan, 17/08).
    //
    // O que se cobra agora é o inverso: nenhuma faixa recebe veredito sobre o
    // próprio encaixe.
    for (const veredito of [
      "não é o melhor caminho",
      "não vai te servir",
      "não se encaixa",
      "não é para você",
    ]) {
      expect(desfecho, `voltou a dar veredito ao lead: "${veredito}"`).not.toContain(veredito);
    }
  });

  it("as duas faixas compartilham o convite, em vez de textos paralelos", () => {
    // Um componente só para os dois desfechos. Se alguém duplicar o texto por
    // faixa, elas voltam a divergir com o tempo sem ninguém perceber, que é
    // exatamente como a recusa nasceu.
    expect(desfecho).toContain("ConviteDaCall");
    expect(desfecho).toContain("Agendar a call");
  });
});

describe("exclusividade e urgencia fabricadas (anti-padrao banido 5 a 5 em 12/06)", () => {
  const EXPRESSOES = [
    "vaga",
    "exclusiv",
    "ultima chance",
    "última chance",
    "so hoje",
    "só hoje",
    "corre que",
    "restam apenas",
  ];

  it.each(EXPRESSOES)("nenhum texto usa '%s'", (expressao) => {
    expect(TUDO.toLowerCase()).not.toContain(expressao);
  });
});

describe("palavras banidas do tone-of-voice", () => {
  const BANIDAS = [
    "transforme sua vida",
    "solucao inovadora",
    "solução inovadora",
    "otima pergunta",
    "ótima pergunta",
    "revolucionari",
    "revolucionári",
  ];

  it.each(BANIDAS)("nenhum texto usa '%s'", (banida) => {
    expect(TUDO.toLowerCase()).not.toContain(banida);
  });
});

describe("nunca dizer que o material foi gerado por IA", () => {
  const VAZAMENTOS = [
    "gerado por ia",
    "gerado automaticamente",
    "nossa inteligencia artificial analisou",
    "nossa inteligência artificial analisou",
  ];

  it.each(VAZAMENTOS)("nao contem '%s'", (vazamento) => {
    expect(TUDO.toLowerCase()).not.toContain(vazamento);
  });
});

describe("principio I: nenhum preco antes do diagnostico", () => {
  /**
   * 🔴 Regra amendada em 30/08 (constitution 1.1.0, decisão do Yan).
   *
   * Antes: nenhuma pergunta podia citar valor. Agora: UMA pode, e só ela, e só
   * o piso verificado. O guard ficou mais apertado do lado que importa, porque
   * agora ele também prende o NÚMERO: mudar o piso sem passar pela tabela viva
   * reprova aqui.
   */
  it("so a pergunta-gate de investimento cita valor", () => {
    const comValor = PERGUNTAS.filter((p) => /r\$|reais/i.test(p.enunciado));
    expect(comValor.map((p) => p.id)).toEqual([P.INVESTIMENTO]);
  });

  it("o gate cita UM numero, e ele e o piso: limiar, nunca cotacao", () => {
    // Regra do Yan, 30/08: a pergunta mostra que existe custo e onde está o
    // chão, e não quanto o projeto custa. Um segundo número transforma limiar
    // em cotação, porque passa a descrever a ESTRUTURA do que se cobra. Foi
    // exatamente o que a primeira versão fez ao dizer "R$ 3 mil de implantação
    // e R$ 500 por mês", que é a Fundação Essencial exposta antes da Call 1.
    //
    // Lista fechada, e não busca por proibido: assim reprova QUALQUER número
    // novo ou alterado, inclusive um que ninguém pensou em proibir.
    const gate = PERGUNTAS.find((p) => p.id === P.INVESTIMENTO)?.enunciado ?? "";
    const valores = gate.match(/R\$\s?[\d.,]+(?:\s?mil)?/g) ?? [];
    expect(valores).toEqual(["R$ 3 mil"]);
  });

  it("o gate nao descreve estrutura de cobranca", () => {
    // Mensalidade, setup, nome de plano e degrau continuam banidos da
    // superfície inteira: é o princípio I, e a emenda 1.1.0 abriu exceção
    // só para o piso.
    const gate = (PERGUNTAS.find((p) => p.id === P.INVESTIMENTO)?.enunciado ?? "").toLowerCase();
    for (const estrutura of [
      "por mês",
      "mensal",
      "mensalidade",
      "implantação",
      "setup",
      "plano",
      "fundação",
      "recorrência",
    ]) {
      expect(gate, `o gate virou cotação ao citar "${estrutura}"`).not.toContain(estrutura);
    }
  });

  it("nenhuma pergunta pergunta quanto custa a dor nem quanto o lead pagaria", () => {
    const enunciados = PERGUNTAS.map((p) => p.enunciado.toLowerCase()).join(" ");
    for (const proibido of ["valor do investimento", "quanto custa", "quanto voce pagaria", "quanto você pagaria"]) {
      expect(enunciados).not.toContain(proibido);
    }
  });

  it("a abertura promete que a call nao e pitch", () => {
    // Dizia "não tem proposta nem preço nessa conversa", o que virou contradição
    // quando a call passou a ser paga para parte dos leads. A promessa que
    // continua de pé, e que é a que importa, é sobre o que acontece DENTRO da
    // hora: ninguém empurra orçamento.
    const abertura = ler("src/app/diagnostico/page.tsx");
    expect(abertura).toMatch(/não tem pitch nem orçamento/i);
  });

  it("a abertura nao promete gratuidade que o desfecho vai desmentir", () => {
    // Metade dos leads paga R$ 197 no fim. Anunciar "sem custo" na entrada é
    // isca, e queima mais confiança do que o gancho de gratuidade compra.
    const abertura = ler("src/app/diagnostico/page.tsx");
    for (const promessa of ["sem custo", "gratuito", "gratuita", "de graça"]) {
      expect(abertura.toLowerCase(), `a abertura voltou a prometer "${promessa}"`).not.toContain(
        promessa,
      );
    }
  });

  it("fora da pergunta-gate, preco so existe no desfecho", () => {
    // A abertura e o motor da conversa continuam sem nenhum valor: quem entra
    // na página não vê preço, e quem chega ao gate já descreveu a operação.
    const conversa = ler("src/components/diagnostico/Conversa.tsx");
    const abertura = ler("src/app/diagnostico/page.tsx");
    expect(conversa).not.toContain("R$");
    expect(abertura).not.toContain("R$");
  });
});

describe("acentuacao do que o cliente le", () => {
  it("os enunciados nao tem mojibake", () => {
    for (const pergunta of PERGUNTAS) {
      expect(pergunta.enunciado).not.toMatch(/Ã[§µ£¡©âª]|â€/);
    }
  });

  it("as opcoes nao tem mojibake", () => {
    for (const pergunta of PERGUNTAS) {
      for (const opcao of pergunta.opcoes ?? []) {
        expect(opcao.rotulo).not.toMatch(/Ã[§µ£¡©âª]|â€/);
      }
    }
  });
});
