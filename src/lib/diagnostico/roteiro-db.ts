/**
 * Fila dos roteiros da Call 1 no Postgres.
 *
 * Mesmas regras do `db.ts`: tudo por tagged template, nada de concatenação, e
 * nenhum log com dado pessoal.
 */

import { sql } from "@vercel/postgres";

import { ErroPersistencia } from "./db";

/** Teto de tentativas. Acima disso o item para e vira alerta, não laço infinito. */
export const MAX_TENTATIVAS = 3;

export type EstadoRoteiro = "pendente" | "processando" | "concluido" | "falhou";

/** Coloca o agendamento na fila. Idempotente: reentrega do webhook não duplica. */
export async function enfileirarRoteiro(calBookingId: string): Promise<void> {
  try {
    await sql`
      INSERT INTO roteiros (cal_booking_id)
      VALUES (${calBookingId})
      ON CONFLICT (cal_booking_id) DO NOTHING
    `;
  } catch (causa) {
    throw new ErroPersistencia("enfileirar roteiro", causa);
  }
}

export interface TrabalhoDaFila {
  readonly calBookingId: string;
  readonly inicioEm: Date;
  readonly tentativas: number;
  readonly googleEventId: string | null;
  readonly nome: string;
  readonly empresa: string | null;
  readonly papel: string | null;
  readonly porte: string | null;
  readonly email: string;
  readonly whatsapp: string | null;
  readonly origem: string;
  readonly score: number;
  readonly faixa: string;
  readonly respostas: Readonly<Record<string, unknown>>;
}

/**
 * O que está aberto, mais antigo primeiro, com tudo que o worker precisa.
 *
 * Traz as respostas já agregadas em um objeto: a alternativa seria o worker
 * fazer uma chamada por lead, e a fila existe justamente para ele processar em
 * lote quando a máquina volta de um período desligada.
 *
 * Cancelado não entra: card e roteiro de quem cancelou continuam valendo
 * (FR-022), mas gerar roteiro novo para uma call que não vai acontecer é
 * trabalho jogado fora.
 */
export async function lerFila(limite = 10): Promise<readonly TrabalhoDaFila[]> {
  try {
    const resultado = await sql<{
      cal_booking_id: string;
      inicio_em: Date;
      tentativas: number;
      google_event_id: string | null;
      nome: string;
      empresa: string | null;
      papel: string | null;
      porte: string | null;
      email: string;
      whatsapp: string | null;
      origem: string;
      score: number;
      faixa: string;
      respostas: Record<string, unknown>;
    }>`
      SELECT r.cal_booking_id, r.tentativas, r.google_event_id,
             a.inicio_em,
             l.nome, l.empresa, l.papel, l.porte, l.email, l.whatsapp, l.origem,
             av.score, av.faixa,
             COALESCE(resp.mapa, '{}'::jsonb) AS respostas
        FROM roteiros r
        JOIN agendamentos a ON a.cal_booking_id = r.cal_booking_id
        JOIN leads l        ON l.id = a.lead_id
        JOIN LATERAL (
          SELECT score, faixa FROM avaliacoes
           WHERE lead_id = l.id ORDER BY criado_em DESC LIMIT 1
        ) av ON TRUE
        LEFT JOIN LATERAL (
          -- Uma linha por pergunta, a mais recente vencendo: reenvio do
          -- formulário acrescenta resposta sem apagar a antiga (FR-033 da 001),
          -- e o roteiro tem que usar o que a pessoa disse por último.
          SELECT jsonb_object_agg(pergunta_id, valor) AS mapa
            FROM (
              SELECT DISTINCT ON (pergunta_id) pergunta_id, valor
                FROM respostas
               WHERE lead_id = l.id
               ORDER BY pergunta_id, criado_em DESC
            ) ultima
        ) resp ON TRUE
       WHERE r.estado IN ('pendente', 'falhou')
         AND r.tentativas < ${MAX_TENTATIVAS}
         AND a.estado <> 'cancelado'
       ORDER BY r.enfileirado_em
       LIMIT ${limite}
    `;

    return resultado.rows.map((linha) => ({
      calBookingId: linha.cal_booking_id,
      inicioEm: linha.inicio_em,
      tentativas: linha.tentativas,
      googleEventId: linha.google_event_id,
      nome: linha.nome,
      empresa: linha.empresa,
      papel: linha.papel,
      porte: linha.porte,
      email: linha.email,
      whatsapp: linha.whatsapp,
      origem: linha.origem,
      score: linha.score,
      faixa: linha.faixa,
      respostas: linha.respostas,
    }));
  } catch (causa) {
    throw new ErroPersistencia("ler fila de roteiros", causa);
  }
}

/** Marca concluído e guarda o evento e o caminho, para remarcação não procurar de novo. */
export async function concluirRoteiro(
  calBookingId: string,
  googleEventId: string,
  caminhoRoteiro: string,
): Promise<void> {
  try {
    await sql`
      UPDATE roteiros
         SET estado = 'concluido',
             google_event_id = ${googleEventId},
             caminho_roteiro = ${caminhoRoteiro},
             ultimo_erro = NULL,
             concluido_em = now(),
             atualizado_em = now()
       WHERE cal_booking_id = ${calBookingId}
    `;
  } catch (causa) {
    throw new ErroPersistencia("concluir roteiro", causa);
  }
}

/**
 * Registra a falha e incrementa a tentativa.
 *
 * O motivo é truncado: mensagem de erro de terceiro pode ser enorme e não vale
 * inchar a linha. O que interessa é o começo, que é onde está a causa.
 */
export async function registrarFalha(calBookingId: string, motivo: string): Promise<void> {
  try {
    await sql`
      UPDATE roteiros
         SET estado = 'falhou',
             tentativas = tentativas + 1,
             ultimo_erro = ${motivo.slice(0, 500)},
             atualizado_em = now()
       WHERE cal_booking_id = ${calBookingId}
    `;
  } catch (causa) {
    throw new ErroPersistencia("registrar falha de roteiro", causa);
  }
}

export interface CallSemRoteiro {
  readonly calBookingId: string;
  readonly inicioEm: Date;
  readonly tentativas: number;
  readonly ultimoErro: string | null;
}

/**
 * Itens que ESGOTARAM as tentativas. A fila morta.
 *
 * Existe porque `lerFila` filtra `tentativas < MAX_TENTATIVAS`: ao estourar o
 * teto, o item simplesmente para de aparecer. Sem esta consulta ele some em
 * silêncio, que é o "DLQ como cemitério" — o pior estado possível, porque a
 * ausência de erro parece sucesso.
 *
 * Só interessa call que ainda vai acontecer: roteiro de call passada não tem
 * mais o que salvar, e alertar sobre ela seria barulho permanente.
 */
export async function filaMorta(): Promise<readonly CallSemRoteiro[]> {
  try {
    const resultado = await sql<{
      cal_booking_id: string;
      inicio_em: Date;
      tentativas: number;
      ultimo_erro: string | null;
    }>`
      SELECT r.cal_booking_id, a.inicio_em, r.tentativas, r.ultimo_erro
        FROM roteiros r
        JOIN agendamentos a ON a.cal_booking_id = r.cal_booking_id
       WHERE r.estado = 'falhou'
         AND r.tentativas >= ${MAX_TENTATIVAS}
         AND a.estado <> 'cancelado'
         AND a.inicio_em > now()
       ORDER BY a.inicio_em
    `;

    return resultado.rows.map((linha) => ({
      calBookingId: linha.cal_booking_id,
      inicioEm: linha.inicio_em,
      tentativas: linha.tentativas,
      ultimoErro: linha.ultimo_erro,
    }));
  } catch (causa) {
    throw new ErroPersistencia("consultar fila morta", causa);
  }
}

/**
 * FR-020: call em menos de 24 horas cujo roteiro ainda não saiu.
 *
 * Roteiro que chega depois da call não serve, então esta consulta é o que
 * transforma "a rotina está atrasada" em aviso antes de virar prejuízo.
 */
export async function callsEmRisco(): Promise<readonly CallSemRoteiro[]> {
  try {
    const resultado = await sql<{
      cal_booking_id: string;
      inicio_em: Date;
      tentativas: number;
      ultimo_erro: string | null;
    }>`
      SELECT r.cal_booking_id, a.inicio_em, r.tentativas, r.ultimo_erro
        FROM roteiros r
        JOIN agendamentos a ON a.cal_booking_id = r.cal_booking_id
       WHERE r.estado <> 'concluido'
         AND a.estado <> 'cancelado'
         AND a.inicio_em > now()
         AND a.inicio_em < now() + interval '24 hours'
       ORDER BY a.inicio_em
    `;

    return resultado.rows.map((linha) => ({
      calBookingId: linha.cal_booking_id,
      inicioEm: linha.inicio_em,
      tentativas: linha.tentativas,
      ultimoErro: linha.ultimo_erro,
    }));
  } catch (causa) {
    throw new ErroPersistencia("consultar calls em risco", causa);
  }
}
