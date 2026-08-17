/**
 * Devolve ao worker local o que está na fila de roteiros da Call 1.
 *
 * Rota interna. O worker roda na máquina do Yan, onde o brain vive com acesso a
 * `_empresa/` — o `/call-roteiro` lê `pricing.md`, `services.md`, `icp.md` e
 * `positioning.md`, e essa pasta é confidencial e não está clonada em lugar
 * nenhum além da máquina dele.
 *
 * Por que a rota devolve tudo mastigado — enunciado em vez de id, rótulo em vez
 * de opção, e o markdown do card já montado: o dicionário de perguntas e o
 * formato do card moram neste repositório, testados aqui. Se o worker montasse,
 * seriam duas implementações da mesma regra divergindo em silêncio.
 *
 * Envs:
 *   ROTEIRO_WORKER_SECRET  (sensível)
 *   POSTGRES_URL           (sensível)
 */

import { NextRequest, NextResponse } from "next/server";

import { dataIso, montarCard, slugDaEmpresa } from "@/lib/diagnostico/card-lead";
import { PERGUNTAS, perguntaPorId } from "@/lib/diagnostico/perguntas";
import { callsEmRisco, lerFila } from "@/lib/diagnostico/roteiro-db";
import { segredoConfere } from "@/lib/diagnostico/segredo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Resolve o valor cru da resposta para o texto que uma pessoa lê.
 *
 * Escolha vira rótulo, múltipla escolha vira lista separada por vírgula, texto
 * aberto passa literal. O literal importa: é a fala do lead, e FR-007 diz que
 * ela não é reescrita.
 */
function respostaLegivel(perguntaId: string, valor: unknown): string {
  const pergunta = perguntaPorId(perguntaId);
  const rotuloDe = (id: string): string =>
    pergunta?.opcoes?.find((opcao) => opcao.id === id)?.rotulo ?? id;

  if (Array.isArray(valor)) return valor.map((item) => rotuloDe(String(item))).join(", ");
  if (valor === null || valor === undefined) return "(não respondeu)";

  if (typeof valor === "object") {
    // Pergunta do tipo `contato` guarda vários campos num objeto só.
    return Object.entries(valor as Record<string, unknown>)
      .filter(([, campo]) => campo !== null && campo !== undefined && campo !== "")
      .map(([chave, campo]) => `${chave}: ${rotuloDe(String(campo))}`)
      .join(" · ");
  }

  return rotuloDe(String(valor));
}

/**
 * Ordem em que a pergunta aparece no formulário.
 *
 * O `jsonb_object_agg` da consulta não preserva ordem nenhuma, e sem isto o
 * card e o prompt saem com as respostas embaralhadas: "onde eu te chamo" antes
 * de "qual processo consome mais tempo". O card fica difícil de ler, e o modelo
 * perde a sequência de raciocínio que a conversa do formulário monta.
 *
 * A posição no array é usada em vez do campo `ordem` porque `ordem` se repete
 * entre as duas trilhas.
 */
const POSICAO_DA_PERGUNTA = new Map(PERGUNTAS.map((pergunta, i) => [pergunta.id, i]));

function naOrdemDoFormulario<T extends { readonly perguntaId: string }>(
  respostas: readonly T[],
): readonly T[] {
  const posicao = (id: string): number => POSICAO_DA_PERGUNTA.get(id) ?? Number.MAX_SAFE_INTEGER;
  return [...respostas].sort((a, b) => posicao(a.perguntaId) - posicao(b.perguntaId));
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const esperado = process.env.ROTEIRO_WORKER_SECRET;
  if (!esperado) return NextResponse.json({ erro: "config_missing" }, { status: 500 });
  if (!segredoConfere(req.headers.get("x-roteiro-secret") ?? "", esperado)) {
    return NextResponse.json({ erro: "nao_autorizado" }, { status: 401 });
  }

  try {
    const [fila, emRisco] = await Promise.all([lerFila(), callsEmRisco()]);

    const hoje = dataIso(new Date());

    const trabalhos = fila.map((item) => {
      const respostas = naOrdemDoFormulario(
        Object.entries(item.respostas).map(([perguntaId, valor]) => ({
          perguntaId,
          enunciado: perguntaPorId(perguntaId)?.enunciado ?? perguntaId,
          resposta: respostaLegivel(perguntaId, valor),
        })),
      );

      return {
        calBookingId: item.calBookingId,
        inicioEm: item.inicioEm.toISOString(),
        tentativas: item.tentativas,
        googleEventId: item.googleEventId,
        slug: slugDaEmpresa(item.empresa ?? item.nome),
        // Já montado aqui: o worker só grava no disco do brain, que é a única
        // coisa que ele pode fazer e a rota não.
        cardMarkdown: montarCard({
          nome: item.nome,
          empresa: item.empresa,
          papel: item.papel,
          porte: item.porte,
          email: item.email,
          whatsapp: item.whatsapp,
          origem: item.origem,
          score: item.score,
          faixa: item.faixa,
          inicioDaCall: item.inicioEm,
          respostas,
          hoje,
        }),
        lead: {
          nome: item.nome,
          empresa: item.empresa,
          email: item.email,
        },
      };
    });

    return NextResponse.json({
      trabalhos,
      // Vai junto porque quem vê o resultado da rotina é quem precisa saber que
      // existe call chegando sem roteiro. Separar em outra rota só criaria uma
      // chamada que ninguém lembra de fazer.
      emRisco: emRisco.map((item) => ({
        calBookingId: item.calBookingId,
        inicioEm: item.inicioEm.toISOString(),
        tentativas: item.tentativas,
        ultimoErro: item.ultimoErro,
      })),
    });
  } catch {
    console.error("[roteiro/fila] falha ao consultar a fila");
    return NextResponse.json({ erro: "storage_failed" }, { status: 500 });
  }
}
