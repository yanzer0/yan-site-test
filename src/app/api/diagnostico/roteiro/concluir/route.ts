/**
 * Recebe o roteiro pronto do worker, publica na agenda e fecha a fila.
 *
 * 🔴 O roteiro vai num evento PRÓPRIO no calendário INFUSER, sem convidados, e
 * NUNCA na descrição do evento da call. O lead é convidado daquele evento, e a
 * documentação do Google é explícita: `visibility: "private"` quer dizer "only
 * event attendees may view event details" — esconde de quem não é convidado, e
 * o convidado sempre vê. Não existe campo que esconda a descrição dele.
 *
 * Por que a escrita no Google acontece AQUI e não no worker: a credencial da
 * service account é a mesma em produção e no ambiente local, e ter dois lugares
 * escrevendo no calendário significa dois lugares para consertar quando o
 * formato mudar. O worker faz o que só ele pode fazer, que é rodar o
 * `/call-roteiro` dentro do brain; o resto é desta rota.
 *
 * Ordem deliberada: publica no Google PRIMEIRO, marca concluído depois. Se a
 * publicação falhar, o item continua na fila e é tentado de novo. O inverso
 * deixaria a fila dizendo "pronto" sem roteiro em lugar nenhum, que é o tipo de
 * mentira que só aparece cinco minutos antes da call.
 *
 * Envs:
 *   ROTEIRO_WORKER_SECRET       (sensível)
 *   GOOGLE_SERVICE_ACCOUNT_B64  (sensível)
 *   GOOGLE_CALENDAR_ID
 *   POSTGRES_URL                (sensível)
 */

import { NextRequest, NextResponse } from "next/server";

import { alertar } from "@/lib/diagnostico/alerta";
import { montarDescricao, RoteiroSemZonaAoVivo } from "@/lib/diagnostico/andaime";
import { ErroAgenda, publicarRoteiro } from "@/lib/diagnostico/agenda-google";
import { concluirRoteiro, registrarFalha } from "@/lib/diagnostico/roteiro-db";
import { segredoConfere } from "@/lib/diagnostico/segredo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CorpoDaConclusao {
  readonly calBookingId?: string;
  readonly inicioEm?: string;
  readonly nome?: string;
  readonly empresa?: string | null;
  /** O HTML do call-card já aprovado pelo `validate-call-card.mjs` no worker. */
  readonly roteiroHtml?: string;
  readonly caminhoRoteiro?: string;
  /**
   * Preenchido quando a quebra foi do lado do worker (modelo, validador, disco).
   * Sem este caminho a tentativa não seria contada, e o item voltaria amanhã com
   * o mesmo problema, para sempre.
   */
  readonly falha?: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const esperado = process.env.ROTEIRO_WORKER_SECRET;
  if (!esperado) return NextResponse.json({ erro: "config_missing" }, { status: 500 });
  if (!segredoConfere(req.headers.get("x-roteiro-secret") ?? "", esperado)) {
    return NextResponse.json({ erro: "nao_autorizado" }, { status: 401 });
  }

  let corpo: CorpoDaConclusao;
  try {
    corpo = (await req.json()) as CorpoDaConclusao;
  } catch {
    return NextResponse.json({ erro: "invalid_json" }, { status: 400 });
  }

  // O e-mail do lead não entra mais: era usado para localizar o evento da call,
  // e o roteiro deixou de ser escrito nele. Menos PII trafegando (FR-021).
  const { calBookingId, inicioEm, nome, roteiroHtml, caminhoRoteiro } = corpo;

  if (corpo.falha) {
    if (!calBookingId) return NextResponse.json({ erro: "calBookingId_ausente" }, { status: 400 });
    await registrarFalha(calBookingId, corpo.falha);
    await alertar({
      source: "funil-diagnostico/roteiro",
      severity: "error",
      message: `Roteiro da Call 1 falhou. booking=${calBookingId} motivo=${corpo.falha.slice(0, 300)}`,
    });
    return NextResponse.json({ ok: true, registrado: "falha" });
  }
  if (!calBookingId || !inicioEm || !nome || !roteiroHtml || !caminhoRoteiro) {
    return NextResponse.json({ erro: "campos_obrigatorios_ausentes" }, { status: 400 });
  }

  const inicio = new Date(inicioEm);
  if (Number.isNaN(inicio.getTime())) {
    return NextResponse.json({ erro: "inicioEm_invalido" }, { status: 400 });
  }

  let descricao: string;
  try {
    descricao = montarDescricao({
      html: roteiroHtml,
      nomeDoLead: nome,
      empresa: corpo.empresa ?? null,
    });
  } catch (causa) {
    if (causa instanceof RoteiroSemZonaAoVivo) {
      // Não é falha de infraestrutura, é roteiro malformado. Retentar não
      // conserta, então diz o que houve e devolve 422 em vez de 500.
      await registrarFalha(calBookingId, "roteiro sem CALL-ZONE");
      return NextResponse.json({ erro: "roteiro_sem_zona_ao_vivo" }, { status: 422 });
    }
    throw causa;
  }

  try {
    // `publicarRoteiro` é idempotente pelo booking: reprocessar atualiza o
    // mesmo evento em vez de encher a agenda de duplicatas.
    const eventoId = await publicarRoteiro({
      bookingId: calBookingId,
      nomeDoLead: nome,
      inicioEm: inicio,
      descricao,
    });
    await concluirRoteiro(calBookingId, eventoId, caminhoRoteiro);

    return NextResponse.json({ ok: true, eventoId, caracteres: descricao.length });
  } catch (causa) {
    // A mensagem real vai junto mesmo quando não é ErroAgenda. Trocar por um
    // texto genérico já custou uma rodada de depuração às cegas: o log dizia
    // "falha ao concluir roteiro" e não dizia por quê.
    const detalhe = causa instanceof Error ? `${causa.name}: ${causa.message}` : String(causa);
    const motivo = causa instanceof ErroAgenda ? causa.message : `falha ao concluir: ${detalhe}`;
    // O identificador do booking pode ir para o log; nome e e-mail não (FR-021).
    console.error(`[roteiro/concluir] ${calBookingId}: ${motivo}`);
    await registrarFalha(calBookingId, motivo);
    return NextResponse.json({ ok: false, erro: motivo }, { status: 502 });
  }
}
