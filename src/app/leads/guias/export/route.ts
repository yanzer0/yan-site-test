import { NextRequest, NextResponse } from "next/server";
import { usuarioDaSessao } from "@/lib/diagnostico/auth-db";
import { COOKIE_SESSAO } from "@/lib/diagnostico/sessao";
import { csvLeadsGuias, listarLeadsGuias, modoExportacaoGuias } from "@/lib/guias/db";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!(await usuarioDaSessao(req.cookies.get(COOKIE_SESSAO)?.value))) return new NextResponse(null, { status: 404, headers: { "Cache-Control": "no-store" } });
  const pagina = Math.min(100000, Math.max(1, Number.parseInt(req.nextUrl.searchParams.get("pagina") ?? "1", 10) || 1));
  const modo = modoExportacaoGuias(req.nextUrl.searchParams.get("modo"));
  try {
    return new NextResponse(csvLeadsGuias(await listarLeadsGuias(200, pagina, modo), modo), { headers: {
      "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="leads-guias-${modo}-pagina-${pagina}.csv"`, "Cache-Control": "no-store, max-age=0", "X-Robots-Tag": "noindex, nofollow",
    } });
  } catch {
    console.error("[guias/export] read_failed");
    return new NextResponse("Não foi possível ler os cadastros. Tente novamente em instantes.", { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
