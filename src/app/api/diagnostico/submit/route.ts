/**
 * Submissão do formulário de diagnóstico.
 *
 * Fluxo:
 *   1. Valida consentimento NO SERVIDOR. Sem ele, nada é persistido (FR-023).
 *   2. Sanitiza as respostas contra o contrato de perguntas: o que não está
 *      declarado é descartado, e opção inexistente não entra.
 *   3. Pontua com a função pura e roteia em faixa.
 *   4. Persiste lead, respostas e avaliação, deduplicando por contato.
 *   5. Devolve a faixa. NUNCA o score: é informação interna (FR-013).
 *
 * Envs:
 *   POSTGRES_URL   (sensível, injetada pela integração Vercel Postgres)
 *
 * Teste local (PowerShell):
 *   $body = '{"consentimento":true,"origem":"instagram","contato":{"nome":"Teste","email":"t@t.com","whatsapp":"11999999999","empresa":"ACME"},"respostas":{"tipo_uso":"empresa","frequencia":"todo_dia"}}'
 *   curl -X POST http://localhost:3000/api/diagnostico/submit -H "Content-Type: application/json" --data $body
 */

import { NextRequest, NextResponse } from "next/server";

import { avaliar } from "@/lib/diagnostico/score";
import { apagarParcial, gravarLead, ErroPersistencia } from "@/lib/diagnostico/db";
import { validarSubmissao } from "@/lib/diagnostico/submissao";
import { P, VERSAO_PERGUNTAS } from "@/lib/diagnostico/perguntas";
import configBruto from "@/lib/diagnostico/score-config.json";
import type { ConfigScore, ResultadoSubmissao } from "@/lib/diagnostico/tipos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CONFIG = configBruto as unknown as ConfigScore;

interface CorpoSubmissao {
  readonly sessaoId?: unknown;
  readonly respostas?: unknown;
  readonly origem?: unknown;
  readonly consentimento?: unknown;
  readonly contato?: Record<string, unknown>;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let corpo: CorpoSubmissao;
  try {
    corpo = (await req.json()) as CorpoSubmissao;
  } catch {
    return NextResponse.json({ erro: "invalid_payload" }, { status: 400 });
  }

  const validacao = validarSubmissao(
    corpo.respostas,
    corpo.origem,
    corpo.consentimento,
    corpo.contato ?? {},
  );

  if (!validacao.ok) {
    return NextResponse.json({ erro: validacao.erro }, { status: 400 });
  }

  const avaliacao = avaliar(validacao.respostas, CONFIG);

  try {
    await gravarLead(validacao.dados, validacao.respostas, avaliacao, VERSAO_PERGUNTAS);

    const sessaoId = typeof corpo.sessaoId === "string" ? corpo.sessaoId : null;
    if (sessaoId) await apagarParcial(sessaoId);
  } catch (erro) {
    // Log sem dado pessoal: só a operação que falhou (FR-026).
    const detalhe = erro instanceof ErroPersistencia ? erro.operacao : "desconhecida";
    console.error(`[diagnostico/submit] falha de persistencia: ${detalhe}`);
    return NextResponse.json({ erro: "storage_failed" }, { status: 500 });
  }

  const resposta: ResultadoSubmissao = {
    faixa: avaliacao.faixa,
    nome: validacao.dados.nome,
    ...(avaliacao.faixa === "qualificado"
      ? {
          agendamento: {
            nome: validacao.dados.nome,
            email: validacao.dados.email,
            processo:
              typeof validacao.respostas[P.PROCESSO] === "string"
                ? (validacao.respostas[P.PROCESSO] as string)
                : "",
          },
        }
      : {}),
  };

  return NextResponse.json(resposta);
}
