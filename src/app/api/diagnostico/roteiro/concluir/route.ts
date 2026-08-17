/**
 * Recebe o roteiro pronto do worker, anexa no evento da call e fecha a fila.
 *
 * 🔴 O roteiro NUNCA vai como texto na descrição do evento. O lead é convidado,
 * e a documentação do Google é literal: `visibility: "private"` quer dizer
 * "only event attendees may view event details" — esconde de quem não é
 * convidado, e o convidado sempre lê a descrição. Não há campo que esconda dele.
 *
 * Vai como ANEXO, apontando para `/roteiro/<token>` no nosso domínio.
 *
 * Por que não o Google Drive, que seria o caminho óbvio: service account não
 * tem quota de armazenamento, nem mesmo criando dentro de pasta compartilhada
 * — o arquivo pertence a quem o cria. Verificado em 17/08:
 *
 *   403 Service Accounts do not have storage quota. Leverage shared drives,
 *       or use OAuth delegation instead.
 *
 * As duas saídas sugeridas exigem Google Workspace, e a conta é Gmail pessoal.
 * Então o documento é nosso, e quem barra o lead é o cookie da rota que o serve.
 *
 * Ordem deliberada: guarda o PDF → anexa → só então marca concluído. Falhou em
 * qualquer ponto, o item continua na fila e é tentado de novo. O inverso
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
import {
  acharEventoDaCall,
  convidadosSemOLead,
  ErroAgenda,
  idDoCalendario,
  lerEvento,
  obterToken,
} from "@/lib/diagnostico/agenda-google";
import { descricaoComContato } from "@/lib/diagnostico/contato-no-evento";
import { ErroDocumento, nomeDoDocumento, prepararEvento } from "@/lib/diagnostico/documento-roteiro";
import {
  concluirRoteiro,
  guardarPdfDoRoteiro,
  registrarFalha,
} from "@/lib/diagnostico/roteiro-db";
import { segredoConfere } from "@/lib/diagnostico/segredo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface CorpoDaConclusao {
  readonly calBookingId?: string;
  readonly inicioEm?: string;
  readonly email?: string;
  readonly nome?: string;
  readonly empresa?: string | null;
  readonly papel?: string | null;
  /** Vai para a descrição do evento, para quem conduz a call ter onde chamar. */
  readonly whatsapp?: string | null;
  /**
   * O PDF do roteiro, em base64.
   *
   * 🔴 Quem converte é o serviço na VPS, não esta rota. O Gotenberg vive na
   * rede `infuser-net` da VPS, sem porta pública — a Vercel simplesmente não o
   * alcança. Expor o Gotenberg para a internet só para esta chamada seria abrir
   * um conversor de documentos ao mundo por conveniência de arquitetura.
   */
  readonly pdfBase64?: string;
  readonly caminhoRoteiro?: string;
  /** Preenchido quando a quebra foi do lado do worker (modelo, validador, disco). */
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

  const { calBookingId, inicioEm, email, nome, pdfBase64, caminhoRoteiro } = corpo;

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

  if (!calBookingId || !inicioEm || !email || !nome || !pdfBase64 || !caminhoRoteiro) {
    return NextResponse.json({ erro: "campos_obrigatorios_ausentes" }, { status: 400 });
  }

  const inicio = new Date(inicioEm);
  if (Number.isNaN(inicio.getTime())) {
    return NextResponse.json({ erro: "inicioEm_invalido" }, { status: 400 });
  }

  const pdf = Buffer.from(pdfBase64, "base64");
  // `%PDF` é a assinatura do formato. Um base64 truncado ou de outro tipo
  // decodifica sem erro e viraria um anexo corrompido no evento — falha que só
  // apareceria quando alguém tentasse abrir, minutos antes da call.
  if (pdf.length < 1024 || pdf.subarray(0, 4).toString("latin1") !== "%PDF") {
    return NextResponse.json({ erro: "pdf_invalido" }, { status: 400 });
  }

  const titulo = nomeDoDocumento(corpo.empresa ?? null, nome);

  try {
    // O PDF fica conosco e é servido por `/roteiro/<token>`, porque service
    // account não tem quota de Drive nem dentro de pasta compartilhada (403
    // "Service Accounts do not have storage quota"), e as saídas que o Google
    // oferece exigem Workspace. Quem barra o lead é o cookie da rota, não a ACL
    // do Google.
    const token = await guardarPdfDoRoteiro(calBookingId, pdf, titulo);
    const url = new URL(`/roteiro/${token}`, req.nextUrl.origin).toString();

    const eventoId = await acharEventoDaCall(calBookingId, inicio, email);

    // Lê antes de escrever: a descrição do Cal.com é preservada e a lista de
    // convidados precisa ser conhecida para tirar o lead sem levar junto o
    // organizador.
    const evento = await lerEvento(eventoId);

    // 🔴 Só o que é DO LEAD entra na descrição. Score, faixa e motivo de corte
    // ficam de fora por regra, não por esquecimento: ver `contato-no-evento.ts`.
    const descricao = descricaoComContato(evento.descricao, {
      nome,
      email,
      whatsapp: corpo.whatsapp ?? null,
      empresa: corpo.empresa ?? null,
      papel: corpo.papel ?? null,
    });

    // O Cal.com não sabe criar o evento sem pôr o lead como convidado, então a
    // remoção é aqui. `null` quer dizer que ele já não estava na lista, e nesse
    // caso o campo nem entra no PATCH.
    const convidados = convidadosSemOLead(evento.convidados, email);

    await prepararEvento(
      eventoId,
      { anexo: { fileUrl: url, titulo }, descricao, convidados: convidados ?? undefined },
      await obterToken(),
      idDoCalendario(),
    );

    await concluirRoteiro(calBookingId, eventoId, caminhoRoteiro);
    return NextResponse.json({
      ok: true,
      eventoId,
      url,
      bytes: pdf.length,
      leadRemovidoDoEvento: convidados !== null,
    });
  } catch (causa) {
    const conhecido = causa instanceof ErroAgenda || causa instanceof ErroDocumento;
    const detalhe = causa instanceof Error ? `${causa.name}: ${causa.message}` : String(causa);
    const motivo = conhecido ? (causa as Error).message : `falha ao concluir: ${detalhe}`;

    // O identificador do booking pode ir para o log; nome e e-mail não (FR-021).
    console.error(`[roteiro/concluir] ${calBookingId}: ${motivo}`);
    await registrarFalha(calBookingId, motivo);
    return NextResponse.json({ ok: false, erro: motivo }, { status: 502 });
  }
}
