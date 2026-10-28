import { NextRequest, NextResponse } from "next/server";
import { alvoDeAcesso } from "@/lib/guias/catalogo";
import { origemSemDados } from "@/lib/guias/captura";
import { CABECALHOS_GUIAS, documentoAcesso } from "@/lib/guias/documentos";
export const dynamic = "force-dynamic";
export function GET(req: NextRequest): Response {
  const slug = req.nextUrl.searchParams.get("guia");
  const guia = alvoDeAcesso(slug);
  if (slug && !guia) return new NextResponse("Este guia não está no catálogo. Abra /guias para consultar os materiais.", { status: 404, headers: { "Cache-Control": "no-store", "Content-Type": "text/plain; charset=utf-8" } });
  return new Response(documentoAcesso(guia, origemSemDados(req.headers.get("referer"))), { headers: CABECALHOS_GUIAS });
}
