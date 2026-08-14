/**
 * Preenchimento parcial: quem começou e ainda não terminou.
 *
 * Existe por FR-025, e a razão é de negócio, não de conveniência: sem isto não
 * dá para saber EM QUAL PERGUNTA as pessoas desistem, que é o dado que diz se o
 * formulário está longo demais ou se alguma pergunta específica espanta.
 *
 * 🔴 Parcial NÃO é lead e NÃO é base para contato. Ainda não houve consentimento,
 * então este registro serve só para análise de abandono. Quem tratar isso como
 * lista de contatos quebra a promessa feita na tela de envio.
 *
 * Env:
 *   POSTGRES_URL  (sensível)
 */

import { NextRequest, NextResponse } from "next/server";

import { gravarParcial, ErroPersistencia } from "@/lib/diagnostico/db";
import { sanitizarRespostas } from "@/lib/diagnostico/submissao";
import { perguntaPorId } from "@/lib/diagnostico/perguntas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Formato de UUID. Sessão fora disso não entra no banco. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface CorpoParcial {
  readonly sessaoId?: unknown;
  readonly respostas?: unknown;
  readonly ultimaPergunta?: unknown;
  readonly origem?: unknown;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let corpo: CorpoParcial;
  try {
    corpo = (await req.json()) as CorpoParcial;
  } catch {
    return NextResponse.json({ erro: "invalid_payload" }, { status: 400 });
  }

  const sessaoId = typeof corpo.sessaoId === "string" ? corpo.sessaoId : "";
  if (!UUID.test(sessaoId)) {
    return NextResponse.json({ erro: "sessao_invalida" }, { status: 400 });
  }

  // Mesma sanitização do envio completo: só pergunta declarada e opção que existe.
  const respostas = sanitizarRespostas(corpo.respostas);

  const ultima = typeof corpo.ultimaPergunta === "string" ? corpo.ultimaPergunta : "";
  const ultimaValida = perguntaPorId(ultima) ? ultima : "";

  const origem =
    typeof corpo.origem === "string" && corpo.origem.length > 0
      ? corpo.origem.slice(0, 60)
      : null;

  try {
    await gravarParcial(sessaoId, respostas, ultimaValida, origem);
  } catch (erro) {
    // Parcial que falha não pode atrapalhar quem está preenchendo: é telemetria,
    // não o caminho crítico. Registra e devolve 204 assim mesmo.
    const detalhe = erro instanceof ErroPersistencia ? erro.operacao : "desconhecida";
    console.error(`[diagnostico/parcial] falha: ${detalhe} sessao=${sessaoId}`);
  }

  return new NextResponse(null, { status: 204 });
}
