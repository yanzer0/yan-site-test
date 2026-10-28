import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { COOKIE_GUIAS, sessaoGuiasValida } from "./sessao";
import { origemPublicaGuias } from "./http";
import { recursoPorSlug, type RecursoCentral } from "./catalogo";

export const CABECALHOS_RECURSO = { "Cache-Control": "no-store, max-age=0", "X-Content-Type-Options": "nosniff", "X-Robots-Tag": "noindex, nofollow" };
export async function exigirAcessoRecurso(req: NextRequest, recurso: RecursoCentral): Promise<NextResponse | undefined> {
  try {
    if (await sessaoGuiasValida(req.cookies.get(COOKIE_GUIAS)?.value)) return undefined;
    const destino = new URL("/guias/acesso", origemPublicaGuias(req)); destino.searchParams.set("guia", recurso.slug);
    const r = NextResponse.redirect(destino, 307); for (const [nome, valor] of Object.entries(CABECALHOS_RECURSO)) r.headers.set(nome, valor); return r;
  } catch { return new NextResponse("O acesso aos materiais está temporariamente indisponível.", { status: 503, headers: CABECALHOS_RECURSO }); }
}
export async function baixarRecurso(req: NextRequest, slug: string): Promise<Response> {
  const recurso = recursoPorSlug(slug);
  if (!recurso) return new NextResponse("Material não encontrado.", { status: 404, headers: CABECALHOS_RECURSO });
  const bloqueio = await exigirAcessoRecurso(req, recurso); if (bloqueio) return bloqueio;
  try {
    const arquivo = await readFile(join(process.cwd(), "private", "central", recurso.arquivo));
    if (arquivo.length > 2 * 1024 * 1024 || arquivo.readUInt32LE(0) !== 0x04034b50) throw new Error("invalid_asset");
    return new Response(new Uint8Array(arquivo), { headers: { ...CABECALHOS_RECURSO, "Content-Type": "application/zip", "Content-Disposition": `attachment; filename="${recurso.arquivo}"`, "Content-Length": String(arquivo.length) } });
  } catch { console.error("[central/download] asset_unavailable"); return new NextResponse("O download está temporariamente indisponível. Tente novamente em instantes.", { status: 503, headers: CABECALHOS_RECURSO }); }
}
