/**
 * Acesso ao Postgres do funil de diagnóstico.
 *
 * Toda query usa o tagged template `sql` do @vercel/postgres, que parametriza
 * os valores. Nunca montar SQL por concatenação de string.
 *
 * 🔴 Nada aqui pode logar dado pessoal. Em erro, registra-se o identificador da
 * sessão ou do lead, nunca nome, e-mail ou telefone (FR-026).
 */

import { sql } from "@vercel/postgres";

import { normalizarEmail, normalizarTelefone } from "./normalizar";
import type { Avaliacao, Faixa, Respostas } from "./tipos";

/** Falha de persistência. Erro específico, nunca catch genérico engolindo tudo. */
export class ErroPersistencia extends Error {
  constructor(
    readonly operacao: string,
    readonly causa: unknown,
  ) {
    super(`falha ao ${operacao}`);
    this.name = "ErroPersistencia";
  }
}

export interface DadosLead {
  readonly nome: string;
  readonly empresa: string | null;
  readonly papel: string | null;
  readonly porte: string | null;
  readonly email: string;
  readonly whatsapp: string | null;
  readonly origem: string;
  /** Quem indicou. Só existe quando `origem` é indicação; `null` no resto. */
  readonly indicadoPor: string | null;
  readonly tipo: "empresa" | "pessoal";
}

/**
 * Grava o lead, as respostas e a avaliação numa unidade.
 *
 * Reenvio do mesmo contato atualiza o lead e acrescenta as respostas novas sem
 * apagar as antigas, conforme FR-033: o que a pessoa disse da primeira vez
 * costuma ser o mais honesto e não pode ser perdido.
 */
export async function gravarLead(
  dados: DadosLead,
  respostas: Respostas,
  avaliacao: Avaliacao,
  versaoPerguntas: string,
): Promise<string> {
  const emailNorm = normalizarEmail(dados.email);
  const whatsappNorm = dados.whatsapp ? normalizarTelefone(dados.whatsapp) : null;

  try {
    const inserido = await sql<{ id: string }>`
      INSERT INTO leads (nome, empresa, papel, porte, email, email_norm,
                         whatsapp, whatsapp_norm, origem, indicado_por, tipo, consentimento_em)
      VALUES (${dados.nome}, ${dados.empresa}, ${dados.papel}, ${dados.porte},
              ${dados.email}, ${emailNorm}, ${dados.whatsapp}, ${whatsappNorm},
              ${dados.origem}, ${dados.indicadoPor}, ${dados.tipo}, now())
      ON CONFLICT (email_norm, COALESCE(whatsapp_norm, '')) DO UPDATE
        SET nome = EXCLUDED.nome,
            empresa = EXCLUDED.empresa,
            papel = EXCLUDED.papel,
            porte = EXCLUDED.porte,
            origem = EXCLUDED.origem,
            indicado_por = EXCLUDED.indicado_por,
            atualizado_em = now()
      RETURNING id
    `;

    const leadId = inserido.rows[0]?.id;
    if (!leadId) throw new Error("insert de lead nao devolveu id");

    for (const [perguntaId, valor] of Object.entries(respostas)) {
      await sql`
        INSERT INTO respostas (lead_id, pergunta_id, valor, versao_perguntas)
        VALUES (${leadId}, ${perguntaId}, ${JSON.stringify(valor)}::jsonb, ${versaoPerguntas})
      `;
    }

    await sql`
      INSERT INTO avaliacoes (lead_id, score, faixa, motivo_corte, pontos_por_criterio, versao_score)
      VALUES (${leadId}, ${avaliacao.score}, ${avaliacao.faixa}, ${avaliacao.motivoCorte},
              ${JSON.stringify(avaliacao.pontosPorCriterio)}::jsonb, ${avaliacao.versaoScore})
    `;

    return leadId;
  } catch (causa) {
    throw new ErroPersistencia("gravar lead", causa);
  }
}

/** Grava ou atualiza o preenchimento parcial. Separado de `leads` por FR-025. */
export async function gravarParcial(
  sessaoId: string,
  respostas: Respostas,
  ultimaPergunta: string,
  origem: string | null,
): Promise<void> {
  try {
    await sql`
      INSERT INTO parciais (sessao_id, respostas, ultima_pergunta, origem)
      VALUES (${sessaoId}, ${JSON.stringify(respostas)}::jsonb, ${ultimaPergunta}, ${origem})
      ON CONFLICT (sessao_id) DO UPDATE
        SET respostas = EXCLUDED.respostas,
            ultima_pergunta = EXCLUDED.ultima_pergunta,
            atualizado_em = now()
    `;
  } catch (causa) {
    throw new ErroPersistencia("gravar parcial", causa);
  }
}

/** O parcial some quando a submissão completa acontece. */
export async function apagarParcial(sessaoId: string): Promise<void> {
  try {
    await sql`DELETE FROM parciais WHERE sessao_id = ${sessaoId}`;
  } catch (causa) {
    throw new ErroPersistencia("apagar parcial", causa);
  }
}

/** Vincula o agendamento do Cal.com ao lead. Idempotente por `cal_booking_id`. */
export async function vincularAgendamento(
  leadId: string,
  calBookingId: string,
  inicioEm: Date,
): Promise<void> {
  try {
    await sql`
      INSERT INTO agendamentos (lead_id, cal_booking_id, inicio_em)
      VALUES (${leadId}, ${calBookingId}, ${inicioEm.toISOString()})
      ON CONFLICT (cal_booking_id) DO UPDATE
        SET inicio_em = EXCLUDED.inicio_em,
            estado = 'agendado',
            atualizado_em = now()
    `;
  } catch (causa) {
    throw new ErroPersistencia("vincular agendamento", causa);
  }
}

export async function atualizarEstadoAgendamento(
  calBookingId: string,
  estado: "cancelado" | "remarcado" | "realizado" | "nao_compareceu",
): Promise<void> {
  try {
    await sql`
      UPDATE agendamentos
         SET estado = ${estado}, atualizado_em = now()
       WHERE cal_booking_id = ${calBookingId}
    `;
  } catch (causa) {
    throw new ErroPersistencia("atualizar agendamento", causa);
  }
}

/** Busca o lead pelo contato normalizado, para o webhook achar quem agendou. */
export async function buscarLeadPorContato(
  email: string,
  whatsapp: string | null,
): Promise<string | null> {
  try {
    const encontrado = await sql<{ id: string }>`
      SELECT id FROM leads
       WHERE email_norm = ${normalizarEmail(email)}
          OR (whatsapp_norm IS NOT NULL AND whatsapp_norm = ${whatsapp ? normalizarTelefone(whatsapp) : null})
       ORDER BY criado_em DESC
       LIMIT 1
    `;
    return encontrado.rows[0]?.id ?? null;
  } catch (causa) {
    throw new ErroPersistencia("buscar lead por contato", causa);
  }
}

export interface FiltroConsulta {
  readonly origem?: string;
  readonly faixa?: Faixa;
  readonly desde?: Date;
  readonly ate?: Date;
}

export interface LeadResumo {
  readonly id: string;
  readonly nome: string;
  readonly empresa: string | null;
  readonly origem: string;
  readonly faixa: Faixa;
  readonly motivoCorte: string | null;
  readonly criadoEm: Date;
}

/**
 * Consulta por origem, faixa e intervalo de data. É o que responde
 * "de onde vem lead bom", a lacuna que o direcionamento estratégico registra.
 *
 * Os filtros opcionais entram como parâmetro com fallback, e não por SQL
 * montado à mão, justamente para manter tudo parametrizado.
 */
export async function consultarLeads(filtro: FiltroConsulta = {}): Promise<readonly LeadResumo[]> {
  try {
    const resultado = await sql<{
      id: string;
      nome: string;
      empresa: string | null;
      origem: string;
      faixa: Faixa;
      motivo_corte: string | null;
      criado_em: Date;
    }>`
      SELECT l.id, l.nome, l.empresa, l.origem, a.faixa, a.motivo_corte, l.criado_em
        FROM leads l
        JOIN LATERAL (
          SELECT faixa, motivo_corte FROM avaliacoes
           WHERE lead_id = l.id ORDER BY criado_em DESC LIMIT 1
        ) a ON TRUE
       WHERE (${filtro.origem ?? null}::text IS NULL OR l.origem = ${filtro.origem ?? null})
         AND (${filtro.faixa ?? null}::text IS NULL OR a.faixa = ${filtro.faixa ?? null})
         AND (${filtro.desde?.toISOString() ?? null}::timestamptz IS NULL OR l.criado_em >= ${filtro.desde?.toISOString() ?? null})
         AND (${filtro.ate?.toISOString() ?? null}::timestamptz IS NULL OR l.criado_em <= ${filtro.ate?.toISOString() ?? null})
       ORDER BY l.criado_em DESC
       LIMIT 500
    `;

    return resultado.rows.map((linha) => ({
      id: linha.id,
      nome: linha.nome,
      empresa: linha.empresa,
      origem: linha.origem,
      faixa: linha.faixa,
      motivoCorte: linha.motivo_corte,
      criadoEm: linha.criado_em,
    }));
  } catch (causa) {
    throw new ErroPersistencia("consultar leads", causa);
  }
}

/**
 * Exclusão a pedido do titular (FR-028). As tabelas filhas caem em cascata.
 * O registro do pedido fica sem dado pessoal, só como prova de atendimento.
 */
export async function excluirLead(leadId: string, solicitadoEm: Date): Promise<void> {
  try {
    await sql`
      INSERT INTO exclusoes (lead_id, solicitado_em)
      VALUES (${leadId}, ${solicitadoEm.toISOString()})
    `;
    await sql`DELETE FROM leads WHERE id = ${leadId}`;
  } catch (causa) {
    throw new ErroPersistencia("excluir lead", causa);
  }
}
