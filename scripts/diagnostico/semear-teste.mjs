#!/usr/bin/env node
/**
 * Semeia um lead, um agendamento e um item de fila para exercitar a 003.
 *
 * Uso:
 *   node --env-file=.env.local scripts/diagnostico/semear-teste.mjs
 *   node --env-file=.env.local scripts/diagnostico/semear-teste.mjs --limpar
 *
 * Por que existe: sem isto, provar o fluxo exigiria marcar uma call de verdade
 * no Cal.com e esperar o webhook, e cada iteração de conserto custaria um
 * agendamento real na agenda da Infuser.
 *
 * O lead semeado tem e-mail em `@exemplo-infuser.test`, domínio reservado para
 * teste pela RFC 2606, para nunca colidir com lead real nem sair alcançando
 * ninguém por engano.
 */

import { createClient } from "@vercel/postgres";

const EMAIL = process.env.SEED_EMAIL ?? "ricardo@exemplo-infuser.test";
const BOOKING = process.env.SEED_BOOKING ?? "teste-003-local";

const url = process.env.POSTGRES_URL_NON_POOLING ?? process.env.POSTGRES_URL;
if (!url) {
  console.error("\n  POSTGRES_URL nao esta no ambiente.\n");
  process.exit(1);
}

const cliente = createClient({ connectionString: url });
await cliente.connect();

async function limpar() {
  // A cascata de `leads` leva respostas, avaliacoes, agendamentos e roteiros.
  const { rowCount } = await cliente.query(`DELETE FROM leads WHERE email = $1`, [EMAIL]);
  console.log(`\n  ${rowCount} lead(s) de teste removido(s).\n`);
}

async function semear() {
  await limpar();

  const { rows } = await cliente.query(
    `INSERT INTO leads (nome, empresa, papel, porte, email, email_norm, whatsapp, whatsapp_norm,
                        origem, tipo, consentimento_em)
     VALUES ($1,$2,$3,$4,$5,$5,$6,$6,$7,'empresa', now())
     RETURNING id`,
    [
      "Ricardo Alves",
      "Vertex Componentes",
      "dono",
      "6_20",
      EMAIL,
      "+5511977776666",
      "instagram",
    ],
  );
  const leadId = rows[0].id;

  const respostas = {
    nome: "Ricardo Alves",
    tipo_uso: "empresa",
    empresa: { empresa: "Vertex Componentes", papel: "dono" },
    porte: "6_20",
    processo: "Orçamento para cliente novo",
    como_funciona:
      "Chega pedido por WhatsApp ou e-mail. O vendedor abre a planilha de preço, procura o item, " +
      "monta o orçamento no Word e manda de volta. Se o cliente pede alteração, refaz tudo do zero. " +
      "Quase sempre passa por três versões antes de fechar.",
    frequencia: "varias_dia",
    consequencia: ["refazer", "perde_prazo", "cliente_reclama"],
    onde_informacao: ["planilha", "email", "whatsapp"],
    responsavel: "alguem_do_time",
    decisao: "eu_e_socio",
    tentativas: ["chatgpt", "time_tentou"],
    acesso: "sim_sem_problema",
    contato: { email: EMAIL, whatsapp: "+5511977776666", origem: "instagram" },
  };

  for (const [perguntaId, valor] of Object.entries(respostas)) {
    await cliente.query(
      `INSERT INTO respostas (lead_id, pergunta_id, valor, versao_perguntas)
       VALUES ($1,$2,$3::jsonb,'2026-08-14.1')`,
      [leadId, perguntaId, JSON.stringify(valor)],
    );
  }

  await cliente.query(
    `INSERT INTO avaliacoes (lead_id, score, faixa, pontos_por_criterio, versao_score)
     VALUES ($1, 13, 'qualificado', '{}'::jsonb, 'teste')`,
    [leadId],
  );

  // Daqui a três dias: fora da janela de 24h, para não disparar o aviso de risco
  // e sujar a leitura do teste.
  const inicio = new Date(process.env.SEED_INICIO ?? Date.now() + 3 * 24 * 60 * 60 * 1000);
  await cliente.query(
    `INSERT INTO agendamentos (lead_id, cal_booking_id, inicio_em) VALUES ($1,$2,$3)`,
    [leadId, BOOKING, inicio.toISOString()],
  );
  await cliente.query(`INSERT INTO roteiros (cal_booking_id) VALUES ($1)`, [BOOKING]);

  console.log(`\n  Semeado.`);
  console.log(`    lead      ${leadId}`);
  console.log(`    booking   ${BOOKING}`);
  console.log(`    call em   ${inicio.toISOString()}\n`);
}

try {
  await (process.argv.includes("--limpar") ? limpar() : semear());
} finally {
  await cliente.end();
}
