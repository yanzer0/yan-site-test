/**
 * Devolve ao gerador local as respostas que o lead deu no formulário.
 *
 * Elas entram no prompt junto da transcrição: o formulário já traz processo,
 * fontes, decisor e tentativas anteriores, e o modelo não deveria redescobrir
 * na transcrição o que já foi respondido por escrito.
 *
 * Rota interna, autenticada pelo mesmo segredo do publicar. Nunca pública.
 *
 * Envs:
 *   MAPA_PUBLICAR_SECRET  (sensível)
 */

import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

import { normalizarEmail } from "@/lib/diagnostico/normalizar";
import { perguntaPorId } from "@/lib/diagnostico/perguntas";
import { segredoConfere } from "@/lib/diagnostico/segredo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const esperado = process.env.MAPA_PUBLICAR_SECRET;
  if (!esperado) {
    return NextResponse.json({ erro: "config_missing" }, { status: 500 });
  }
  if (!segredoConfere(req.headers.get("x-mapa-secret") ?? "", esperado)) {
    return NextResponse.json({ erro: "nao_autorizado" }, { status: 401 });
  }

  const email = req.nextUrl.searchParams.get("email") ?? "";
  if (!email) return NextResponse.json({ erro: "email_ausente" }, { status: 400 });

  try {
    const r = await sql<{ pergunta_id: string; valor: unknown }>`
      SELECT re.pergunta_id, re.valor
        FROM respostas re
        JOIN leads le ON le.id = re.lead_id
       WHERE le.email_norm = ${normalizarEmail(email)}
       ORDER BY re.criado_em ASC
    `;

    if (r.rows.length === 0) {
      return NextResponse.json({ erro: "lead_sem_respostas" }, { status: 404 });
    }

    // Devolve o ENUNCIADO junto do valor. O prompt lê melhor "Com que
    // frequência isso acontece: todo_dia" do que "frequencia: todo_dia".
    const respostas = r.rows.map((linha) => ({
      pergunta: perguntaPorId(linha.pergunta_id)?.enunciado ?? linha.pergunta_id,
      resposta: linha.valor,
    }));

    return NextResponse.json({ respostas });
  } catch {
    console.error("[mapa/respostas] falha ao consultar");
    return NextResponse.json({ erro: "storage_failed" }, { status: 500 });
  }
}
