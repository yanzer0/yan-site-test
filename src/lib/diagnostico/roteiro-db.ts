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

/** Quanto tempo um item entregue fica reservado antes de voltar para a fila. */
export const RESERVA_MINUTOS = 30;

/**
 * Entrega trabalho a UM consumidor e reserva o item para ele.
 *
 * 🔴 Isto NÃO é uma leitura: é um `UPDATE ... RETURNING`, e o nome diz isso de
 * propósito. Antes era um `SELECT`, e nada marcava "alguém já pegou": dois
 * consumidores recebiam o mesmo item e geravam o mesmo roteiro duas vezes.
 * Aconteceu em 17/08, quando a VPS e uma tarefa agendada no PC do Yan pegaram o
 * mesmo booking. O `flock` do supervisor protege contra dois processos no mesmo
 * host, e não contra dois hosts.
 *
 * `FOR UPDATE SKIP LOCKED` é o que torna isso seguro sob concorrência real: o
 * segundo consumidor PULA a linha que o primeiro travou, em vez de esperar por
 * ela e receber a mesma. Sem `SKIP LOCKED`, dois workers simultâneos ainda
 * serializariam e o segundo levaria o item assim que o primeiro soltasse.
 *
 * A reserva EXPIRA (`RESERVA_MINUTOS`) porque worker morre: se ficasse
 * `processando` para sempre, uma máquina desligada no meio do trabalho
 * prenderia a call para sempre, e ninguém receberia o roteiro.
 *
 * Traz as respostas já agregadas em um objeto: a alternativa seria o worker
 * fazer uma chamada por lead, e a fila existe justamente para ele processar em
 * lote quando a máquina volta de um período desligada.
 *
 * Cancelado não entra: card e roteiro de quem cancelou continuam valendo
 * (FR-022), mas gerar roteiro novo para uma call que não vai acontecer é
 * trabalho jogado fora.
 */
export async function reservarTrabalho(limite = 10): Promise<readonly TrabalhoDaFila[]> {
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
      WITH reservados AS (
        -- Reserva primeiro, com trava de linha. SKIP LOCKED faz o segundo
        -- consumidor pular o que o primeiro já pegou em vez de esperar por ele.
        UPDATE roteiros
           SET estado = 'processando',
               -- Conta a ENTREGA, não a falha registrada. Worker que morre sem
               -- chamar registrarFalha (crash, maquina desligada, SIGKILL)
               -- devolveria o item à fila com o contador intacto, e uma falha
               -- determinística viraria laço infinito que o teto nunca pega.
               tentativas = roteiros.tentativas + 1,
               entregue_em = now(),
               atualizado_em = now()
         WHERE id IN (
           SELECT r2.id
             FROM roteiros r2
             JOIN agendamentos a2 ON a2.cal_booking_id = r2.cal_booking_id
            WHERE a2.estado <> 'cancelado'
              AND r2.tentativas < ${MAX_TENTATIVAS}
              AND (
                r2.estado IN ('pendente', 'falhou')
                -- Reserva vencida: o worker que pegou morreu no meio.
                OR (r2.estado = 'processando'
                    AND r2.entregue_em < now() - (${RESERVA_MINUTOS} || ' minutes')::interval)
              )
            ORDER BY r2.enfileirado_em
            LIMIT ${limite}
            FOR UPDATE OF r2 SKIP LOCKED
         )
        RETURNING cal_booking_id, tentativas, google_event_id
      )
      SELECT r.cal_booking_id, r.tentativas, r.google_event_id,
             a.inicio_em,
             l.nome, l.empresa, l.papel, l.porte, l.email, l.whatsapp, l.origem,
             av.score, av.faixa,
             COALESCE(resp.mapa, '{}'::jsonb) AS respostas
        FROM reservados r
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
       ORDER BY a.inicio_em
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
 * Guarda o PDF e devolve o token pelo qual ele será servido.
 *
 * O token é estável por agendamento: reprocessar atualiza o documento no mesmo
 * endereço, e o anexo que já está no evento continua apontando para o certo.
 * Gerar token novo a cada execução deixaria anexos mortos na agenda.
 */
export async function guardarPdfDoRoteiro(
  calBookingId: string,
  pdf: Buffer,
  nomeArquivo: string,
): Promise<string> {
  try {
    const r = await sql<{ token: string }>`
      UPDATE roteiros
         SET pdf = ${`\\x${pdf.toString("hex")}`}::bytea,
             nome_arquivo = ${nomeArquivo},
             token = COALESCE(token, encode(gen_random_bytes(16), 'hex')),
             atualizado_em = now()
       WHERE cal_booking_id = ${calBookingId}
       RETURNING token
    `;
    const token = r.rows[0]?.token;
    if (!token) throw new Error("agendamento nao esta na fila de roteiros");
    return token;
  } catch (causa) {
    throw new ErroPersistencia("guardar pdf do roteiro", causa);
  }
}

export interface RoteiroServido {
  readonly pdf: Buffer;
  readonly nomeArquivo: string;
}

/** O documento por token. `null` quando não existe ou ainda não tem PDF. */
export async function abrirRoteiroPorToken(token: string): Promise<RoteiroServido | null> {
  try {
    const r = await sql<{ pdf: Buffer; nome_arquivo: string | null }>`
      SELECT pdf, nome_arquivo FROM roteiros
       WHERE token = ${token} AND pdf IS NOT NULL
       LIMIT 1
    `;
    const linha = r.rows[0];
    if (!linha) return null;
    return {
      pdf: Buffer.isBuffer(linha.pdf) ? linha.pdf : Buffer.from(linha.pdf),
      nomeArquivo: linha.nome_arquivo ?? "Preparo - Call 1.pdf",
    };
  } catch (causa) {
    throw new ErroPersistencia("abrir roteiro por token", causa);
  }
}

/** Conta a abertura. Sinal de que o time leu antes da call, não trava a entrega. */
export async function registrarAberturaDoRoteiro(token: string): Promise<void> {
  await sql`
    UPDATE roteiros
       SET aberturas = aberturas + 1, aberto_em = COALESCE(aberto_em, now())
     WHERE token = ${token}
  `;
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
             -- NÃO incrementa: quem conta é a reserva, para que entrega
             -- interrompida por morte do worker também conte.
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
 * Existe porque `reservarTrabalho` filtra `tentativas < MAX_TENTATIVAS`: ao estourar o
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
