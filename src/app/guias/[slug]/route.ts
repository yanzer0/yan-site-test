import { NextRequest, NextResponse } from "next/server";
import { guiaPorSlug } from "@/lib/guias/catalogo";
import { origemPublicaGuias } from "@/lib/guias/http";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest, context: { params: Promise<{ slug: string }> }): Promise<Response> {
  const guia = guiaPorSlug((await context.params).slug);
  if (!guia) return new NextResponse("Guia não encontrado.", { status: 404 });
  const resposta = NextResponse.redirect(new URL(guia.caminho, origemPublicaGuias(req)), 307);
  resposta.headers.set("Cache-Control", "no-store");
  return resposta;
}
