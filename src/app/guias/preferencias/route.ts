import { NextRequest, NextResponse } from "next/server";
import { COOKIE_GUIAS, idSessaoGuias } from "@/lib/guias/sessao";
import { lerPreferenciasGuias } from "@/lib/guias/db";
import { CABECALHOS_GUIAS, documentoPreferencias } from "@/lib/guias/documentos";
import { origemPublicaGuias } from "@/lib/guias/http";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest): Promise<Response> {
  try {
    const id = await idSessaoGuias(req.cookies.get(COOKIE_GUIAS)?.value);
    if (!id) return NextResponse.redirect(new URL("/guias/acesso", origemPublicaGuias(req)));
    const preferencias = await lerPreferenciasGuias(id);
    if (!preferencias) return new Response("Cadastro indisponível.", { status: 401, headers: CABECALHOS_GUIAS });
    return new Response(documentoPreferencias(preferencias, req.nextUrl.searchParams.get("salvo") === "1"), { headers: CABECALHOS_GUIAS });
  } catch { return new Response("Preferências temporariamente indisponíveis. Tente novamente.", { status: 503, headers: CABECALHOS_GUIAS }); }
}
