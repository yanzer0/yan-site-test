import { NextRequest, NextResponse } from "next/server";
import { COOKIE_GUIAS, idSessaoGuias } from "@/lib/guias/sessao";
import { alterarPreferenciasGuias, atualizarMedicaoGuias, lerPreferenciasGuias } from "@/lib/guias/db";
import { AVISO_MARKETING_GUIAS, consentimentosGuias, cookiesPermitidos, navegadorPermitido } from "@/lib/guias/marketing";
import { COOKIES_PUBLICIDADE } from "@/lib/guias/atribuicao";
import { origemPublicaGuias } from "@/lib/guias/http";
import { lerCorpoLimitado } from "@/lib/guias/corpo";
export const dynamic = "force-dynamic";
const resposta = (dados: unknown, status = 200) => NextResponse.json(dados, { status, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } });
async function visitante(req: NextRequest): Promise<string | undefined> { return idSessaoGuias(req.cookies.get(COOKIE_GUIAS)?.value); }
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const id = await visitante(req); if (!id) return resposta({ publicidade: false }, 401);
    const preferencias = await lerPreferenciasGuias(id); if (!preferencias) return resposta({ publicidade: false }, 401);
    return resposta({ ...preferencias, id, versao: AVISO_MARKETING_GUIAS });
  } catch { return resposta({ publicidade: false, erro: "Preferências temporariamente indisponíveis." }, 503); }
}
export async function POST(req: NextRequest): Promise<NextResponse> {
  if (req.headers.get("origin") !== origemPublicaGuias(req)) return resposta({ erro: "Envie as preferências neste site." }, 403);
  if (Number(req.headers.get("content-length") ?? 0) > 8192) return resposta({ erro: "Envio muito grande." }, 413);
  try {
    const id = await visitante(req); if (!id) return resposta({ erro: "Abra a biblioteca para acessar suas preferências." }, 401);
    let corpo: Record<string, unknown>;
    try { corpo = JSON.parse(await lerCorpoLimitado(req, 8192)); if (!corpo || typeof corpo !== "object" || Array.isArray(corpo)) return resposta({ erro: "Envio inválido." }, 400); } catch (erro) { return resposta({ erro: "Envio inválido." }, erro instanceof Error && erro.message === "body_too_large" ? 413 : 400); }
    const atuais = await lerPreferenciasGuias(id); if (!atuais) return resposta({ erro: "Cadastro indisponível." }, 401);
    if (corpo.acao === "medicao") {
      if (!atuais.publicidade) return resposta({ erro: "Publicidade não autorizada." }, 403);
      await atualizarMedicaoGuias(id, navegadorPermitido(req, corpo.navegador), cookiesPermitidos(req));
      return resposta({ ok: true });
    }
    if (!corpo.consentimentos || typeof corpo.consentimentos !== "object" || typeof (corpo.consentimentos as Record<string,unknown>).comercial !== "boolean" || typeof (corpo.consentimentos as Record<string,unknown>).publicidade !== "boolean") return resposta({ erro: "Escolhas inválidas." }, 400);
    const preferencias = consentimentosGuias(corpo.consentimentos);
    await alterarPreferenciasGuias(id, preferencias);
    const r = resposta({ ok: true, ...preferencias, destino: "/guias/preferencias?salvo=1" });
    if (!preferencias.publicidade) for (const nome of COOKIES_PUBLICIDADE) {
      r.cookies.set(nome, "", { path: "/", maxAge: 0 });
      if (process.env.NODE_ENV === "production") r.cookies.set(nome, "", { path: "/", domain: ".useinfuser.com", maxAge: 0 });
    }
    return r;
  } catch { console.error("[guias/preferencias] storage_failed"); return resposta({ erro: "Não foi possível salvar agora. Tente novamente.", publicidade: false }, 503); }
}
