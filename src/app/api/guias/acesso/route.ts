import { createHash, randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { permitirEnvio, validarCadastroGuia } from "@/lib/guias/captura";
import { gravarCadastroGuia } from "@/lib/guias/db";
import { COOKIE_GUIAS, criarSessaoGuias, segredoGuias, VALIDADE_GUIAS_SEGUNDOS } from "@/lib/guias/sessao";
import { origemPublicaGuias } from "@/lib/guias/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const LIMITE_CORPO = 12 * 1024;

function erro(status: number, mensagem: string, campos?: unknown): NextResponse {
  return NextResponse.json({ erro: mensagem, ...(campos ? { campos } : {}) }, { status, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } });
}

async function lerCorpo(req: NextRequest): Promise<string> {
  if (Number(req.headers.get("content-length") ?? 0) > LIMITE_CORPO) throw new Error("body_too_large");
  const leitor = req.body?.getReader();
  if (!leitor) throw new Error("invalid_body");
  const decoder = new TextDecoder();
  let tamanho = 0, texto = "";
  while (true) {
    const parte = await leitor.read();
    if (parte.done) break;
    tamanho += parte.value.byteLength;
    if (tamanho > LIMITE_CORPO) { await leitor.cancel(); throw new Error("body_too_large"); }
    texto += decoder.decode(parte.value, { stream: true });
  }
  return texto + decoder.decode();
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
  try { bruto = JSON.parse(await lerCorpo(req)); } catch (falha) {
    return erro(falha instanceof Error && falha.message === "body_too_large" ? 413 : 400, "Não foi possível ler o envio. Confira os campos e tente novamente.");
  }
  const resultado = validarCadastroGuia(bruto);
  if (!resultado.ok) return erro(400, "Confira os campos indicados para abrir o material.", resultado.campos);
  const requestId = randomUUID();
  try {
    segredoGuias();
    const token = await criarSessaoGuias(requestId);
    await gravarCadastroGuia(requestId, resultado.cadastro);
    const resposta = NextResponse.json({ destino: resultado.destino }, { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } });
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
