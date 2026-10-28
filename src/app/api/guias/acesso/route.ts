import { createHash, randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { permitirEnvio, validarCadastroGuia } from "@/lib/guias/captura";
import { gravarCadastroGuia } from "@/lib/guias/db";
import { COOKIE_GUIAS, criarSessaoGuias, segredoGuias, VALIDADE_GUIAS_SEGUNDOS } from "@/lib/guias/sessao";
import { origemPublicaGuias } from "@/lib/guias/http";
import { coletarMetadados, consentimentosGuias } from "@/lib/guias/marketing";
import { lerCorpoLimitado } from "@/lib/guias/corpo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const LIMITE_CORPO = 32 * 1024;

function erro(status: number, mensagem: string, campos?: unknown): NextResponse {
  return NextResponse.json({ erro: mensagem, ...(campos ? { campos } : {}) }, { status, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const origem = req.headers.get("origin");
  const origemEsperada = process.env.NODE_ENV === "production"
    ? ["useinfuser.com", "www.useinfuser.com"].includes(req.headers.get("host") ?? "") ? `https://${req.headers.get("host")}` : undefined
    : origemPublicaGuias(req);
  if (!origem || origem !== origemEsperada) {
    return erro(403, "Abra o formulário neste site e envie novamente.");
  }
  if (req.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") return erro(400, "Não foi possível ler o envio. Atualize a página e tente novamente.");
  const rede = (req.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() ?? "local").slice(0, 120);
  if (!permitirEnvio(createHash("sha256").update(rede).digest("hex"))) {
    const resposta = erro(429, "Muitos envios em pouco tempo. Aguarde 15 minutos e tente novamente.");
    resposta.headers.set("Retry-After", "900");
    return resposta;
  }
  let bruto: unknown;
  try { bruto = JSON.parse(await lerCorpoLimitado(req, LIMITE_CORPO)); } catch (falha) {
    return erro(falha instanceof Error && falha.message === "body_too_large" ? 413 : 400, "Não foi possível ler o envio. Confira os campos e tente novamente.");
  }
  const resultado = validarCadastroGuia(bruto);
  if (!resultado.ok) return erro(400, "Confira os campos indicados para abrir o material.", resultado.campos);
  const requestId = randomUUID();
  try {
    segredoGuias();
    const token = await criarSessaoGuias(requestId);
    const extras = bruto as Record<string, unknown>;
    const consentimentos = consentimentosGuias(extras.consentimentos);
    const metadados = await coletarMetadados(req, extras.marketing, resultado.cadastro.guia, consentimentos);
    await gravarCadastroGuia(requestId, resultado.cadastro, consentimentos, metadados);
    const destino = new URL(resultado.destino, origemPublicaGuias(req));
    if (consentimentos.publicidade) for (const [nome, valor] of Object.entries(metadados.publicidade.campanha ?? {})) destino.searchParams.set(nome, valor);
    const resposta = NextResponse.json({ destino: `${destino.pathname}${destino.search}` }, { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } });
    resposta.cookies.set(COOKIE_GUIAS, token, {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: VALIDADE_GUIAS_SEGUNDOS,
      ...(process.env.NODE_ENV === "production" ? { domain: ".useinfuser.com" } : {}),
    });
    return resposta;
  } catch {
    console.error(`[guias/acesso] capture_failed requestId=${requestId}`);
    return erro(503, "Não foi possível salvar o cadastro agora. Seus campos continuam aqui. Tente novamente em instantes.");
  }
}
