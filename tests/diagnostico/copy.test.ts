import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { PERGUNTAS } from "@/lib/diagnostico/perguntas";

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

  it("o texto de nao-ICP oferece caminho, nao veredito", () => {
    // A frase que abre a recusa precisa continuar existindo: ela é o contrato de
    // honestidade da faixa. Se sumir, alguém trocou por um "não se encaixa".
    expect(desfecho).toContain("não vai te servir");
    // E a recusa vem acompanhada de um destino, nunca sozinha.
    expect(desfecho).toContain("Mapa de IA");
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
  it("o formulario nao menciona valor em nenhuma pergunta", () => {
    const enunciados = PERGUNTAS.map((p) => p.enunciado.toLowerCase()).join(" ");
    for (const proibido of ["r$", "reais", "valor do investimento", "quanto custa"]) {
      expect(enunciados).not.toContain(proibido);
    }
  });

  it("a tela de abertura promete diagnostico e nega proposta e preco", () => {
    const abertura = ler("src/app/diagnostico/page.tsx");
    expect(abertura).toContain("Não tem proposta nem preço");
  });

  it("preco so aparece no desfecho, e so nas faixas de nao-ICP", () => {
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
