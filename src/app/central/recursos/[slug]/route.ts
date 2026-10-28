import { NextRequest, NextResponse } from "next/server";
import { recursoPorSlug } from "@/lib/guias/catalogo";
import { cabecalhosBibliotecaGuias, documentoRecurso } from "@/lib/guias/documentos";
import { CABECALHOS_RECURSO, exigirAcessoRecurso } from "@/lib/guias/recursos";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest, context: { params: Promise<{ slug: string }> }): Promise<Response> {
  const recurso = recursoPorSlug((await context.params).slug);
  if (!recurso) return new NextResponse("Material não encontrado.", { status: 404, headers: CABECALHOS_RECURSO });
  const bloqueio = await exigirAcessoRecurso(req, recurso); if (bloqueio) return bloqueio;
  const html = documentoRecurso(recurso);
  return new Response(html, { headers: cabecalhosBibliotecaGuias(html) });
}
