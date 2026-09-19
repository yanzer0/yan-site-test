#!/usr/bin/env node
/**
 * Inventário do banco do funil, SÓ LEITURA, em JSON determinístico.
 *
 * Uso:
 *   node --env-file=.env.local scripts/diagnostico/inventariar-banco.mjs
 *   node --env-file=.env.local scripts/diagnostico/inventariar-banco.mjs --resumo
 *
 * Serve os dois lados da migração: rode contra a origem, rode contra o destino
 * e compare as duas saídas. Por isso tudo aqui é ordenado - diff de JSON só
 * vale se a ordem for estável entre execuções e entre servidores.
 *
 * `DATABASE_URL_INVENTARIO` aponta para outro banco sem mexer no ambiente, que
 * é o que permite inventariar origem e destino na mesma sessão.
 *
 * 🔴 NENHUM `SELECT` de coluna de dado. Só catálogo e `count(*)`. A saída deste
 * script é colada em documento e em chat, e não pode conter nome, e-mail ou
 * telefone de ninguém.
 */

import { abrirCliente } from "./banco.mjs";

const SCHEMAS_DO_SISTEMA = ["pg_catalog", "information_schema"];

/**
 * Nome de objeto não vai por parâmetro: `$1` é valor, e `count(*) FROM $1` não
 * existe. O nome vem do CATÁLOGO do próprio servidor, não de entrada de
 * usuário, e ainda assim é citado com aspas duplas (dobrando as internas), que
 * é o que impede um nome exótico de virar SQL.
 */
function citar(nome) {
  return `"${String(nome).replace(/"/g, '""')}"`;
}

function agrupar(linhas, chave) {
  const mapa = new Map();
  for (const linha of linhas) {
    const k = chave(linha);
    if (!mapa.has(k)) mapa.set(k, []);
    mapa.get(k).push(linha);
  }
  return mapa;
}

async function inventariar(cliente) {
  const naoSistema = `NOT IN ('${SCHEMAS_DO_SISTEMA.join("','")}')`;

  const { rows: versao } = await cliente.query(
    `SELECT current_setting('server_version') AS servidor,
            current_setting('TimeZone')       AS timezone,
            current_setting('server_encoding') AS encoding`,
  );

  const { rows: extensoes } = await cliente.query(
    `SELECT extname, extversion FROM pg_extension ORDER BY extname`,
  );

  const { rows: schemas } = await cliente.query(
    `SELECT nspname FROM pg_namespace
      WHERE nspname NOT LIKE 'pg\\_%' AND nspname <> 'information_schema'
      ORDER BY nspname`,
  );

  const { rows: tabelas } = await cliente.query(
    `SELECT table_schema, table_name FROM information_schema.tables
      WHERE table_type = 'BASE TABLE' AND table_schema ${naoSistema}
      ORDER BY table_schema, table_name`,
  );

  // Uma consulta para TODAS as colunas, índices e constraints: o agrupamento é
  // feito aqui. Uma consulta por tabela seria o N+1 e ainda arriscaria ordem
  // diferente entre execuções.
  const { rows: colunas } = await cliente.query(
    `SELECT n.nspname AS schema, c.relname AS tabela, a.attname AS coluna,
            format_type(a.atttypid, a.atttypmod) AS tipo,
            NOT a.attnotnull AS aceita_nulo, a.attnum
       FROM pg_attribute a
       JOIN pg_class c     ON c.oid = a.attrelid
       JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relkind = 'r' AND a.attnum > 0 AND NOT a.attisdropped
        AND n.nspname ${naoSistema}
      ORDER BY n.nspname, c.relname, a.attnum`,
  );

  const { rows: indices } = await cliente.query(
    `SELECT schemaname AS schema, tablename AS tabela, indexname AS nome, indexdef AS definicao
       FROM pg_indexes WHERE schemaname ${naoSistema}
      ORDER BY schemaname, tablename, indexname`,
  );

  const { rows: constraints } = await cliente.query(
    `SELECT n.nspname AS schema, c.relname AS tabela, k.conname AS nome,
            k.contype AS tipo, pg_get_constraintdef(k.oid) AS definicao
       FROM pg_constraint k
       JOIN pg_class c     ON c.oid = k.conrelid
       JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname ${naoSistema}
      ORDER BY n.nspname, c.relname, k.conname`,
  );

  const { rows: sequencias } = await cliente.query(
    `SELECT schemaname AS schema, sequencename AS nome, last_value
       FROM pg_sequences WHERE schemaname ${naoSistema}
      ORDER BY schemaname, sequencename`,
  );

  const { rows: views } = await cliente.query(
    `SELECT table_schema AS schema, table_name AS nome FROM information_schema.views
      WHERE table_schema ${naoSistema} ORDER BY table_schema, table_name`,
  );

  const { rows: gatilhos } = await cliente.query(
    `SELECT n.nspname AS schema, c.relname AS tabela, t.tgname AS nome
       FROM pg_trigger t
       JOIN pg_class c     ON c.oid = t.tgrelid
       JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE NOT t.tgisinternal AND n.nspname ${naoSistema}
      ORDER BY n.nspname, c.relname, t.tgname`,
  );

  // Os papéis embutidos (`pg_read_all_data` e companhia) são iguais em todo
  // servidor e só fariam barulho no diff.
  const { rows: papeis } = await cliente.query(
    `SELECT rolname, rolsuper, rolcreatedb, rolcreaterole FROM pg_roles
      WHERE rolname NOT LIKE 'pg\\_%' ORDER BY rolname`,
  );

  const porColuna = agrupar(colunas, (x) => `${x.schema}.${x.tabela}`);
  const porIndice = agrupar(indices, (x) => `${x.schema}.${x.tabela}`);
  const porConstraint = agrupar(constraints, (x) => `${x.schema}.${x.tabela}`);

  const detalhes = [];
  for (const { table_schema: schema, table_name: tabela } of tabelas) {
    const qualificado = `${citar(schema)}.${citar(tabela)}`;
    const { rows: contagem } = await cliente.query(
      `SELECT count(*)::bigint AS linhas, pg_total_relation_size($1::regclass) AS bytes
         FROM ${qualificado}`,
      [qualificado],
    );

    const chave = `${schema}.${tabela}`;
    detalhes.push({
      nome: chave,
      linhas: Number(contagem[0].linhas),
      bytes: Number(contagem[0].bytes),
      colunas: (porColuna.get(chave) ?? []).map((c) => ({
        nome: c.coluna,
        tipo: c.tipo,
        aceitaNulo: c.aceita_nulo,
      })),
      indices: (porIndice.get(chave) ?? []).map((i) => ({
        nome: i.nome,
        definicao: i.definicao,
      })),
      constraints: (porConstraint.get(chave) ?? []).map((k) => ({
        nome: k.nome,
        tipo: k.tipo,
        definicao: k.definicao,
      })),
    });
  }

  return {
    servidor: {
      versao: versao[0].servidor,
      timezone: versao[0].timezone,
      encoding: versao[0].encoding,
    },
    extensoes: extensoes.map((e) => ({ nome: e.extname, versao: e.extversion })),
    schemas: schemas.map((s) => s.nspname),
    tabelas: detalhes,
    sequencias: sequencias.map((s) => ({
      nome: `${s.schema}.${s.nome}`,
      ultimoValor: s.last_value === null ? null : Number(s.last_value),
    })),
    views: views.map((v) => `${v.schema}.${v.nome}`),
    gatilhos: gatilhos.map((g) => ({ tabela: `${g.schema}.${g.tabela}`, nome: g.nome })),
    papeis: papeis.map((p) => ({
      nome: p.rolname,
      superuser: p.rolsuper,
      criaBanco: p.rolcreatedb,
      criaPapel: p.rolcreaterole,
    })),
  };
}

let cliente;
try {
  cliente = abrirCliente(process.env.DATABASE_URL_INVENTARIO);
} catch (erro) {
  // Stack trace aqui não ajuda ninguém: o erro é sempre ambiente faltando.
  console.error(`\n  ${erro.message}\n`);
  console.error("  Rode com a variavel carregada:");
  console.error("    node --env-file=.env.local scripts/diagnostico/inventariar-banco.mjs\n");
  process.exit(1);
}

await cliente.connect();

try {
  const inventario = await inventariar(cliente);

  if (process.argv.includes("--resumo")) {
    // Uma linha por tabela, para `diff` de texto entre origem e destino. É a
    // prova de que o restore trouxe TUDO: contagem igual, tabela a tabela.
    for (const tabela of inventario.tabelas) {
      console.log(`${tabela.nome},${tabela.linhas}`);
    }
  } else {
    console.log(JSON.stringify(inventario, null, 2));
  }
} finally {
  await cliente.end();
}
