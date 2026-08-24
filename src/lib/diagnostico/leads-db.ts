/**
 * Leitura da base de leads para o painel do time.
 *
 * Só consulta: este módulo não escreve nada. O painel é uma janela para o que o
 * formulário já gravou, e manter a escrita fora daqui é o que garante que abrir
 * o painel nunca altera o funil.
 *
 * 🔴 Nada aqui pode ir para log. Todo campo devolvido é dado pessoal de um
 * prospect (FR-026). Em erro, propaga-se `ErroPersistencia` sem o conteúdo.
 */

import { sql } from "@vercel/postgres";

import { ErroPersistencia } from "./db";
import type { Faixa } from "./tipos";

export const FILTROS_AGENDA = ["todos", "agendou", "nao_agendou"] as const;

export type FiltroAgenda = (typeof FILTROS_AGENDA)[number];

export interface FiltroLeads {
  /** `null` = todas as faixas. */
  readonly faixa: Faixa | null;
  readonly agenda: FiltroAgenda;
}

export interface LeadNaLista {
  readonly id: string;
  readonly nome: string;
  readonly empresa: string | null;
  readonly papel: string | null;
  readonly porte: string | null;
  readonly email: string;
  readonly whatsapp: string | null;
  readonly origem: string;
  readonly tipo: string;
  readonly criadoEm: Date;
  readonly score: number | null;
  readonly faixa: Faixa | null;
  readonly motivoCorte: string | null;
  /** `null` quando nunca agendou. */
  readonly agendaEstado: string | null;
  readonly agendaInicio: Date | null;
}

export interface RespostaDoLead {
  readonly leadId: string;
  readonly perguntaId: string;
  readonly valor: unknown;
}

/**
 * O que a lista mostra por linha.
 *
 * `DISTINCT ON` e não `GROUP BY` porque avaliação é uma por SUBMISSÃO, não uma
 * por lead: quem reenvia o formulário ganha avaliação nova, e a que vale é a
 * última. Mesma lógica para o agendamento, onde remarcação cria linha nova.
 */
const SELECT_BASE = `
  SELECT l.id, l.nome, l.empresa, l.papel, l.porte, l.email, l.whatsapp,
         l.origem, l.tipo, l.criado_em,
         a.score, a.faixa, a.motivo_corte,
         g.estado AS agenda_estado, g.inicio_em AS agenda_inicio
    FROM leads l
    LEFT JOIN LATERAL (
      SELECT score, faixa, motivo_corte FROM avaliacoes
       WHERE lead_id = l.id ORDER BY criado_em DESC LIMIT 1
    ) a ON true
    LEFT JOIN LATERAL (
      SELECT estado, inicio_em FROM agendamentos
       WHERE lead_id = l.id ORDER BY criado_em DESC LIMIT 1
    ) g ON true
`;

/**
 * Traduz o filtro em `WHERE` parametrizado.
 *
 * Query separada do modificador e valores sempre por placeholder: nenhum texto
 * vindo da URL entra na string do SQL. A faixa é validada contra o enum antes
 * de chegar aqui, então mesmo o nome da coluna nunca vem de fora.
 */
function condicoes(filtro: FiltroLeads): { sqlWhere: string; valores: unknown[] } {
  const partes: string[] = [];
  const valores: unknown[] = [];

  if (filtro.faixa) {
    valores.push(filtro.faixa);
    partes.push(`a.faixa = $${valores.length}`);
  }

  // Cancelado não conta como agendado: para o time, o lead que cancelou está
  // tão em aberto quanto quem nunca marcou, e é justamente quem precisa de
  // contato. Sem esta regra o painel esconderia o caso mais urgente.
  if (filtro.agenda === "agendou") {
    partes.push(`g.estado IS NOT NULL AND g.estado <> 'cancelado'`);
  } else if (filtro.agenda === "nao_agendou") {
    partes.push(`(g.estado IS NULL OR g.estado = 'cancelado')`);
  }

  return {
    sqlWhere: partes.length ? `WHERE ${partes.join(" AND ")}` : "",
    valores,
  };
}

/** Uma linha do `SELECT_BASE` no formato que o painel consome. */
function paraLeadNaLista(x: Record<string, unknown>): LeadNaLista {
  return {
    id: String(x.id),
    nome: String(x.nome),
    empresa: (x.empresa as string) ?? null,
    papel: (x.papel as string) ?? null,
    porte: (x.porte as string) ?? null,
    email: String(x.email),
    whatsapp: (x.whatsapp as string) ?? null,
    origem: String(x.origem),
    tipo: String(x.tipo),
    criadoEm: new Date(x.criado_em as string),
    score: (x.score as number) ?? null,
    faixa: (x.faixa ?? null) as Faixa | null,
    motivoCorte: (x.motivo_corte as string) ?? null,
    agendaEstado: (x.agenda_estado as string) ?? null,
    agendaInicio: x.agenda_inicio ? new Date(x.agenda_inicio as string) : null,
  };
}

export async function listarLeads(filtro: FiltroLeads): Promise<readonly LeadNaLista[]> {
  const { sqlWhere, valores } = condicoes(filtro);

  try {
    const r = await sql.query(
      `${SELECT_BASE} ${sqlWhere} ORDER BY l.criado_em DESC LIMIT 500`,
      valores,
    );

    return r.rows.map(paraLeadNaLista);
  } catch (causa) {
    throw new ErroPersistencia("listar leads", causa);
  }
}

export async function lerLead(id: string): Promise<LeadNaLista | null> {
  try {
    const r = await sql.query(`${SELECT_BASE} WHERE l.id = $1`, [id]);
    if (r.rows.length === 0) return null;

    return paraLeadNaLista(r.rows[0]);
  } catch (causa) {
    throw new ErroPersistencia("ler lead", causa);
  }
}

/**
 * As respostas literais de um conjunto de leads.
 *
 * Em lote e não uma consulta por lead: o CSV exporta a lista inteira, e uma
 * consulta por linha seria o N+1 clássico contra um banco serverless que cobra
 * por conexão.
 */
export async function lerRespostas(leadIds: readonly string[]): Promise<readonly RespostaDoLead[]> {
  if (leadIds.length === 0) return [];

  try {
    const r = await sql.query(
      `SELECT DISTINCT ON (lead_id, pergunta_id) lead_id, pergunta_id, valor
         FROM respostas
        WHERE lead_id = ANY($1::uuid[])
        ORDER BY lead_id, pergunta_id, criado_em DESC`,
      [leadIds],
    );

    return r.rows.map((x) => ({
      leadId: String(x.lead_id),
      perguntaId: String(x.pergunta_id),
      valor: x.valor,
    }));
  } catch (causa) {
    throw new ErroPersistencia("ler respostas", causa);
  }
}

export interface ContagemPorFaixa {
  readonly faixa: Faixa;
  readonly total: number;
  readonly semAgendamento: number;
}

/** Os números do topo do painel, numa consulta só. */
export async function contarPorFaixa(): Promise<readonly ContagemPorFaixa[]> {
  try {
    const r = await sql.query(`
      SELECT a.faixa,
             COUNT(*)::int AS total,
             COUNT(*) FILTER (
               WHERE g.estado IS NULL OR g.estado = 'cancelado'
             )::int AS sem_agendamento
        FROM leads l
        LEFT JOIN LATERAL (
          SELECT faixa FROM avaliacoes WHERE lead_id = l.id ORDER BY criado_em DESC LIMIT 1
        ) a ON true
        LEFT JOIN LATERAL (
          SELECT estado FROM agendamentos WHERE lead_id = l.id ORDER BY criado_em DESC LIMIT 1
        ) g ON true
       WHERE a.faixa IS NOT NULL
       GROUP BY a.faixa
    `);

    return r.rows.map((x) => ({
      faixa: x.faixa as Faixa,
      total: Number(x.total),
      semAgendamento: Number(x.sem_agendamento),
    }));
  } catch (causa) {
    throw new ErroPersistencia("contar leads por faixa", causa);
  }
}
