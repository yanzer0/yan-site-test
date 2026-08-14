#!/usr/bin/env node
/**
 * Aplica o schema do funil de diagnóstico no Postgres e PROVA que aplicou.
 *
 * Uso:
 *   node scripts/diagnostico/aplicar-schema.mjs
 *
 * Precisa de POSTGRES_URL (ou DATABASE_URL) no ambiente. O jeito mais direto de
 * ter isso localmente, com o projeto já linkado na Vercel:
 *
 *   vercel env pull .env.local
 *
 * Por que este script existe em vez de "cole o SQL no console do Neon": porque
 * ele confere o resultado. Rodar SQL e assumir que funcionou é a mesma classe de
 * erro de deployar e assumir que subiu. Aqui, no fim, ele consulta o
 * information_schema e diz o que existe de verdade.
 *
 * É seguro rodar mais de uma vez: todo statement do schema é idempotente.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const SCHEMA = join(AQUI, "..", "..", "src", "lib", "diagnostico", "schema.sql");

const TABELAS_ESPERADAS = [
  "leads",
  "respostas",
  "avaliacoes",
  "parciais",
  "agendamentos",
  "exclusoes",
];

/**
 * Divide o arquivo em statements.
 *
 * Remove comentários de linha antes de dividir, senão um `;` dentro de comentário
 * quebraria o statement no lugar errado.
 */
function statementsDe(sql) {
  return sql
    .split("\n")
    .filter((linha) => !linha.trim().startsWith("--"))
    .join("\n")
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

async function main() {
  const url = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!url) {
    console.error("\n  POSTGRES_URL nao esta no ambiente.\n");
    console.error("  Rode primeiro, na raiz do projeto:");
    console.error("    vercel env pull .env.local\n");
    console.error("  E rode este script com a variavel carregada:");
    console.error("    node --env-file=.env.local scripts/diagnostico/aplicar-schema.mjs\n");
    process.exit(1);
  }

  // Import dinâmico: sem a URL no ambiente o pacote nem precisa carregar.
  const { createClient } = await import("@vercel/postgres");
  const cliente = createClient({ connectionString: url });

  await cliente.connect();

  try {
    const statements = statementsDe(readFileSync(SCHEMA, "utf8"));
    console.log(`\n  Aplicando ${statements.length} statements...\n`);

    let aplicados = 0;
    for (const statement of statements) {
      const rotulo = statement.slice(0, 62).replace(/\s+/g, " ");
      try {
        await cliente.query(statement);
        aplicados += 1;
        console.log(`  ok    ${rotulo}`);
      } catch (erro) {
        console.error(`  FALHA ${rotulo}`);
        console.error(`        ${erro.message}`);
        throw erro;
      }
    }

    console.log(`\n  ${aplicados} statements aplicados.\n`);

    // A PROVA. Sem isto, o script só diz que os comandos não deram erro.
    const { rows } = await cliente.query(
      `SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = ANY($1)
        ORDER BY table_name`,
      [TABELAS_ESPERADAS],
    );

    const existem = rows.map((r) => r.table_name);
    const faltando = TABELAS_ESPERADAS.filter((t) => !existem.includes(t));

    console.log("  Tabelas no banco:");
    for (const tabela of TABELAS_ESPERADAS) {
      console.log(`    ${existem.includes(tabela) ? "[x]" : "[ ]"} ${tabela}`);
    }

    if (faltando.length > 0) {
      console.error(`\n  FALTANDO: ${faltando.join(", ")}\n`);
      process.exit(2);
    }

    // Confere também o índice de deduplicação, que é o que impede lead duplicado.
    const { rows: indices } = await cliente.query(
      `SELECT indexname FROM pg_indexes
        WHERE schemaname = 'public' AND indexname = 'leads_contato_unico'`,
    );
    if (indices.length === 0) {
      console.error("\n  O indice unico de deduplicacao (leads_contato_unico) NAO existe.\n");
      process.exit(2);
    }
    console.log("    [x] indice de deduplicacao leads_contato_unico");

    console.log("\n  Schema aplicado e verificado.\n");
  } finally {
    await cliente.end();
  }
}

main().catch((erro) => {
  console.error(`\n  Erro: ${erro.message}\n`);
  process.exit(1);
});
