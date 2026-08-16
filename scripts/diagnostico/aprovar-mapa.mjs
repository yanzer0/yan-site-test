#!/usr/bin/env node
/**
 * Aprova um mapa, liberando a página para o lead.
 *
 * Uso:
 *   node --env-file=.env.local scripts/diagnostico/aprovar-mapa.mjs <token>
 *   node --env-file=.env.local scripts/diagnostico/aprovar-mapa.mjs <token> --corrigi
 *   node --env-file=.env.local scripts/diagnostico/aprovar-mapa.mjs --listar
 *
 * FR-016 pede ação única, não interface. Um comando é a ação única mais barata
 * que existe, e enquanto for um clique por semana não vale construir tela.
 *
 * A flag `--corrigi` alimenta FR-018: é a taxa de correção que decide, com
 * dado, se este gate de aprovação continua fazendo sentido ou se o gerador já
 * é confiável o suficiente para entregar direto.
 */

import { createClient } from "@vercel/postgres";

const url = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
if (!url) {
  console.error("\n  POSTGRES_URL nao esta no ambiente.\n");
  process.exit(1);
}

const args = process.argv.slice(2);
const listar = args.includes("--listar");
const houveCorrecao = args.includes("--corrigi");
const token = args.find((a) => !a.startsWith("--"));
const quem = process.env.USERNAME || process.env.USER || "desconhecido";

const cliente = createClient({ connectionString: url });
await cliente.connect();

try {
  if (listar) {
    const { rows } = await cliente.query(
      `SELECT m.token, m.estado, COALESCE(l.empresa, l.nome) AS cliente,
              m.aberturas, m.criado_em
         FROM mapas m JOIN leads l ON l.id = m.lead_id
        ORDER BY m.criado_em DESC LIMIT 30`,
    );

    if (rows.length === 0) {
      console.log("\n  Nenhum mapa ainda.\n");
    } else {
      console.log("\n  ESTADO      ABERTURAS  CLIENTE                    TOKEN\n");
      for (const r of rows) {
        console.log(
          `  ${r.estado.padEnd(11)} ${String(r.aberturas).padEnd(10)} ${String(r.cliente).slice(0, 25).padEnd(26)} ${r.token}`,
        );
      }
      console.log("");
    }

    const { rows: taxa } = await cliente.query(
      `SELECT count(*)::int AS total,
              count(*) FILTER (WHERE houve_correcao)::int AS com_correcao
         FROM mapas WHERE aprovado_em IS NOT NULL`,
    );
    const { total, com_correcao } = taxa[0];
    if (total > 0) {
      const pct = Math.round((com_correcao / total) * 100);
      console.log(`  Taxa de correcao: ${com_correcao} de ${total} aprovados (${pct}%)`);
      console.log(`  E este numero que decide se o gate de aprovacao continua valendo.\n`);
    }
    process.exit(0);
  }

  if (!token) {
    console.error("\n  Falta o token.\n");
    console.error("    node --env-file=.env.local scripts/diagnostico/aprovar-mapa.mjs <token>");
    console.error("    node --env-file=.env.local scripts/diagnostico/aprovar-mapa.mjs --listar\n");
    process.exit(1);
  }

  const { rowCount } = await cliente.query(
    `UPDATE mapas
        SET estado = 'aprovado', aprovado_por = $2, aprovado_em = now(),
            houve_correcao = $3, atualizado_em = now()
      WHERE token = $1 AND estado = 'gerado'`,
    [token, quem, houveCorrecao],
  );

  if (rowCount === 0) {
    // Ou o token nao existe, ou ja foi aprovado. Os dois casos sao "nao ha o
    // que fazer aqui", e o comando nao deve fingir que fez.
    const { rows } = await cliente.query("SELECT estado FROM mapas WHERE token = $1", [token]);
    if (rows.length === 0) {
      console.error(`\n  Nenhum mapa com esse token.\n`);
    } else {
      console.error(`\n  Esse mapa ja esta no estado "${rows[0].estado}". Nada mudou.\n`);
    }
    process.exit(2);
  }

  console.log(`\n  Aprovado por ${quem}${houveCorrecao ? " (com correcao)" : ""}.`);
  console.log(`  A pagina esta no ar: /mapa/${token}\n`);
} finally {
  await cliente.end();
}
