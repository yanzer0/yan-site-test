/**
 * O módulo de banco contra um Postgres DE VERDADE.
 *
 * Três coisas só se provam com servidor: que o aplicador de schema cria o banco
 * inteiro num ambiente novo, que rodá-lo de novo não estraga nada, e que a
 * reserva da fila com `SKIP LOCKED` entrega itens DIFERENTES a dois
 * consumidores simultâneos. Nenhuma delas aparece num teste com driver dublado:
 * `SKIP LOCKED` é comportamento do servidor, não do cliente.
 *
 * 🔴 O banco apontado por `TEST_POSTGRES_URL` é APAGADO (`DROP SCHEMA public`).
 * Use um Postgres descartável. O caso se recusa a rodar se encontrar qualquer
 * linha de dado no `public`, que é a trava contra apontar para o banco errado.
 *
 * Para ligar:
 *   TEST_POSTGRES_URL=postgresql://postgres:senha@localhost:5432/teste npm test
 *
 * Sem a variável o bloco inteiro é pulado, de propósito: a suíte continua
 * rodando na máquina de quem não tem Postgres à mão.
 */

import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

import { beforeAll, afterAll, describe, expect, it } from "vitest";

const CONEXAO = process.env.TEST_POSTGRES_URL;

const COMO_LIGAR =
  "defina TEST_POSTGRES_URL apontando para um Postgres DESCARTAVEL (o bloco apaga o schema public)";

if (!CONEXAO) {
  console.warn(`\n  [banco-integracao] PULADO: ${COMO_LIGAR}\n`);
} else {
  // O módulo lê a URL no carregamento, então ela precisa estar no lugar antes
  // do primeiro import dele.
  process.env.POSTGRES_URL = CONEXAO;
}

/** As 14 tabelas do inventário da F0. É a lista que o restore tem que reproduzir. */
const TABELAS_ESPERADAS = [
  "agendamentos",
  "avaliacoes",
  "exclusoes",
  "leads",
  "mapa_achados",
  "mapas",
  "painel_config",
  "parciais",
  "pedidos_mapa",
  "respostas",
  "roteiros",
  "sessoes_painel",
  "tentativas_acesso",
  "usuarios_painel",
];

function rodarScript(arquivo: string, argumentos: string[] = []) {
  return spawnSync(process.execPath, [resolve("scripts/diagnostico", arquivo), ...argumentos], {
    encoding: "utf8",
    env: { ...process.env, POSTGRES_URL: CONEXAO, POSTGRES_URL_NON_POOLING: CONEXAO },
  });
}

type ModuloBanco = typeof import("@/lib/diagnostico/banco");
type ModuloRoteiro = typeof import("@/lib/diagnostico/roteiro-db");

let banco: ModuloBanco;
let roteiro: ModuloRoteiro;

async function tabelasDoPublic(): Promise<string[]> {
  const { rows } = await banco.sql<{ table_name: string }>`
    SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
     ORDER BY table_name
  `;
  return rows.map((linha) => linha.table_name);
}

describe.skipIf(!CONEXAO)(`banco real (${COMO_LIGAR})`, () => {
  beforeAll(async () => {
    banco = await import("@/lib/diagnostico/banco");
    roteiro = await import("@/lib/diagnostico/roteiro-db");

    // Trava contra apontar para um banco com dado dentro. Um banco descartável
    // está vazio; o de produção tem centenas de linhas e para aqui.
    for (const tabela of await tabelasDoPublic()) {
      // Nome de objeto não vai por parâmetro; ele vem do catálogo, não de fora,
      // e é citado com aspas duplas para não virar SQL.
      const { rows } = await banco.sql.query<{ linhas: string }>(
        `SELECT count(*)::bigint AS linhas FROM public."${tabela.replace(/"/g, '""')}"`,
      );
      if (Number(rows[0].linhas) > 0) {
        throw new Error(
          `TEST_POSTGRES_URL aponta para um banco COM DADO (tabela ${tabela}); use um descartavel`,
        );
      }
    }

    await banco.sql`DROP SCHEMA IF EXISTS public CASCADE`;
    await banco.sql`CREATE SCHEMA public`;
  }, 60_000);

  afterAll(async () => {
    if (banco) await banco.encerrarPool();
  });

  it(
    "aplicar-schema cria as 14 tabelas num banco vazio",
    async () => {
      const execucao = rodarScript("aplicar-schema.mjs");

      expect(`${execucao.stdout}${execucao.stderr}`).not.toContain("FALHA");
      expect(execucao.status).toBe(0);
      expect(await tabelasDoPublic()).toEqual(TABELAS_ESPERADAS);
    },
    60_000,
  );

  it(
    "aplicar-schema rodado de novo e no-op",
    async () => {
      const execucao = rodarScript("aplicar-schema.mjs");

      expect(`${execucao.stdout}${execucao.stderr}`).not.toContain("FALHA");
      expect(execucao.status).toBe(0);
      expect(await tabelasDoPublic()).toEqual(TABELAS_ESPERADAS);
    },
    60_000,
  );

  it(
    "reserva concorrente entrega itens DIFERENTES aos dois consumidores",
    async () => {
      // Dados sinteticos. Dois agendamentos, dois itens na fila.
      for (const marca of ["um", "dois"]) {
        const { rows } = await banco.sql<{ id: string }>`
          INSERT INTO leads (nome, email, email_norm, origem, tipo, consentimento_em)
          VALUES (${`Teste ${marca}`}, ${`teste-${marca}@exemplo.invalid`},
                  ${`teste-${marca}@exemplo.invalid`}, 'teste', 'empresa', now())
          RETURNING id
        `;
        const leadId = rows[0].id;

        await banco.sql`
          INSERT INTO avaliacoes (lead_id, score, faixa, pontos_por_criterio, versao_score)
          VALUES (${leadId}, 10, 'qualificado', '{}'::jsonb, 'teste')
        `;
        await banco.sql`
          INSERT INTO agendamentos (lead_id, cal_booking_id, inicio_em)
          VALUES (${leadId}, ${`booking-${marca}`}, now() + interval '2 days')
        `;
        await roteiro.enfileirarRoteiro(`booking-${marca}`);
      }

      const [primeiro, segundo] = await Promise.all([
        roteiro.reservarTrabalho(1),
        roteiro.reservarTrabalho(1),
      ]);

      expect(primeiro).toHaveLength(1);
      expect(segundo).toHaveLength(1);
      expect(primeiro[0].calBookingId).not.toBe(segundo[0].calBookingId);
    },
    60_000,
  );

  it(
    "inventariar-banco --resumo devolve uma linha por tabela",
    () => {
      const execucao = rodarScript("inventariar-banco.mjs", ["--resumo"]);

      expect(execucao.stderr).toBe("");
      expect(execucao.status).toBe(0);

      const linhas = execucao.stdout.trim().split(/\r?\n/);
      expect(linhas).toHaveLength(TABELAS_ESPERADAS.length);
      expect(linhas.map((linha) => linha.split(",")[0])).toEqual(
        TABELAS_ESPERADAS.map((tabela) => `public.${tabela}`),
      );
    },
    60_000,
  );
});
