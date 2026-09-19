/**
 * Guard estático: o driver do Neon não volta pelo caminho vivo.
 *
 * O banco do funil saiu do Neon para um Postgres em TCP na VPS, e todo acesso
 * passa por `src/lib/diagnostico/banco.ts` (ou `scripts/diagnostico/banco.mjs`
 * nos scripts). Um `import` do driver antigo em qualquer arquivo abriria uma
 * segunda porta para o banco: ela continuaria apontando para o Neon (que fica
 * read-only e depois some), e a falha só apareceria em produção, na rota que
 * ninguém exercita todo dia.
 *
 * Por isso a regra é mecânica em vez de combinada. O pacote segue no
 * `package.json` até a F7, para o rollback por env da F5 existir; o que não
 * pode é alguém importá-lo.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

const RAIZES = ["src", "scripts"];
const EXTENSOES = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"];
const PROIBIDOS = ["@vercel/postgres", "@neondatabase/serverless"];

/** Qualquer forma de trazer um módulo: `from "x"`, `import "x"`, `require("x")`. */
const REFERENCIA = /(?:\bfrom|\bimport|\brequire)\s*\(?\s*["']([^"']+)["']/g;

function arquivosDe(diretorio: string): string[] {
  const achados: string[] = [];
  for (const item of readdirSync(diretorio, { withFileTypes: true })) {
    const caminho = join(diretorio, item.name);
    if (item.isDirectory()) {
      if (item.name === "node_modules" || item.name.startsWith(".")) continue;
      achados.push(...arquivosDe(caminho));
    } else if (EXTENSOES.some((extensao) => item.name.endsWith(extensao))) {
      achados.push(caminho);
    }
  }
  return achados;
}

function importesProibidos(caminho: string): string[] {
  const fonte = readFileSync(caminho, "utf8");
  const encontrados: string[] = [];
  for (const [, modulo] of fonte.matchAll(REFERENCIA)) {
    if (PROIBIDOS.includes(modulo)) encontrados.push(modulo);
  }
  return encontrados;
}

describe("nenhum driver de Neon no caminho vivo", () => {
  const arquivos = RAIZES.flatMap(arquivosDe);

  it("varre um conjunto de arquivos que faz sentido", () => {
    // Sem isto, um erro no caminho das raízes deixaria o guard verde varrendo
    // zero arquivo - o modo de falha clássico de teste que lê o disco.
    expect(arquivos.length).toBeGreaterThan(50);
  });

  it("nao importa @vercel/postgres nem @neondatabase/serverless", () => {
    const culpados = arquivos
      .filter((caminho) => importesProibidos(caminho).length > 0)
      .map((caminho) => relative(process.cwd(), caminho).replace(/\\/g, "/"));

    expect(culpados).toEqual([]);
  });
});
