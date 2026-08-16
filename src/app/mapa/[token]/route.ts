/**
 * Entrega do mapa de diagnóstico ao lead.
 *
 * `/mapa/<token>` serve o documento e conta a abertura.
 *
 * Route handler em vez de página: o mapa é um documento HTML completo, com
 * `<html>` e `<head>` próprios, e não um componente para embutir no layout do
 * site. Servir como resposta crua é o que preserva o template canônico intacto.
 *
 * Três garantias que moram aqui:
 *   - documento não aprovado não existe para o mundo, devolve 404 (FR-015)
 *   - a abertura é contada, porque é sinal de temperatura antes da Call 2
 *   - a página não é indexável, por header e por meta no próprio documento
 */

import { NextRequest, NextResponse } from "next/server";

import { abrirMapaPorToken } from "@/lib/diagnostico/mapa-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Token é hex de 32 caracteres. Qualquer outra coisa nem chega ao banco. */
const TOKEN = /^[0-9a-f]{32}$/;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
): Promise<NextResponse | Response> {
  const { token } = await params;

  if (!TOKEN.test(token)) {
    return new NextResponse("Não encontrado", { status: 404 });
  }

  let mapa;
  try {
    mapa = await abrirMapaPorToken(token);
  } catch {
    // Sem detalhe e sem token no log: o token é a credencial de acesso ao
    // documento, então ele é segredo, não identificador inócuo.
    console.error("[mapa] falha ao abrir documento");
    return new NextResponse("Erro ao carregar", { status: 500 });
  }

  if (!mapa) {
    // Mesma resposta para token inexistente e para mapa ainda não aprovado.
    // Distinguir os dois contaria a quem tenta adivinhar que aquele token existe.
    return new NextResponse("Não encontrado", { status: 404 });
  }

  return new Response(mapa.html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "x-robots-tag": "noindex, nofollow",
      "cache-control": "private, no-store",
      "referrer-policy": "no-referrer",
    },
  });
}
