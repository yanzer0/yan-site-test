/**
 * Serve o PDF do roteiro da Call 1.
 *
 * 🔴 Este endereço vai como ANEXO no evento da call, e o lead é convidado do
 * evento. Ele vê o anexo e pode clicar. Quem decide o que ele recebe é esta
 * rota: com o cookie do time, o PDF; sem ele, uma página neutra que não conta
 * nada sobre a conversa.
 *
 * Route handler e não página porque a resposta normal é um binário.
 */

import { NextRequest, NextResponse } from "next/server";

import { COOKIE_ACESSO, cookieAutoriza } from "@/lib/diagnostico/acesso-roteiro";
import { abrirRoteiroPorToken, registrarAberturaDoRoteiro } from "@/lib/diagnostico/roteiro-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Token é hex de 32 caracteres. Qualquer outra coisa nem chega ao banco. */
const TOKEN = /^[0-9a-f]{32}$/;

/**
 * O que o lead vê ao clicar no anexo.
 *
 * Não diz "acesso negado" nem "roteiro de vendas". Um cliente descobrir que a
 * Infuser preparou a conversa dele é bom sinal; o que não pode é ele ler as
 * falas, nem sentir que bateu numa porta trancada com o nome dele na frente.
 */
const PAGINA_NEUTRA = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Preparo interno | Infuser</title>
<style>
  :root { color-scheme: dark }
  body { margin:0; min-height:100dvh; display:grid; place-items:center;
         background:#020202; color:#f0f0e4;
         font:400 16px/1.6 system-ui,-apple-system,sans-serif; padding:24px }
  main { max-width:420px; text-align:center }
  h1 { font-size:22px; letter-spacing:-.02em; margin:0 0 12px }
  p { color:rgba(240,240,228,.66); margin:0 }
  .marca { color:#c6ff34; font:500 11px/1 ui-monospace,monospace;
           letter-spacing:.16em; text-transform:uppercase; margin-bottom:20px }
</style></head>
<body><main>
  <div class="marca">Infuser</div>
  <h1>Este é um documento de preparo interno</h1>
  <p>É o material que o time usa para conduzir a conversa. Se você é do time,
     entre pelo link de acesso uma vez neste aparelho.</p>
</main></body></html>`;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
): Promise<NextResponse | Response> {
  const { token } = await params;

  if (!TOKEN.test(token)) {
    return new NextResponse("Não encontrado", { status: 404 });
  }

  // A checagem de acesso vem ANTES da consulta: sem cookie, o banco nem é
  // tocado, então nem a existência do documento é revelada pelo tempo de
  // resposta ou por um erro diferente.
  if (!cookieAutoriza(req.cookies.get(COOKIE_ACESSO)?.value)) {
    return new NextResponse(PAGINA_NEUTRA, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8", "X-Robots-Tag": "noindex, nofollow" },
    });
  }

  let roteiro;
  try {
    roteiro = await abrirRoteiroPorToken(token);
  } catch {
    // Sem detalhe e sem token no log: o token é a coordenada do documento.
    console.error("[roteiro] falha ao consultar");
    return new NextResponse("Erro ao abrir", { status: 500 });
  }

  if (!roteiro) return new NextResponse("Não encontrado", { status: 404 });

  // A abertura é sinal útil (o time leu antes da call?) e não bloqueia a
  // entrega se falhar.
  void registrarAberturaDoRoteiro(token).catch(() => {});

  return new Response(new Uint8Array(roteiro.pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      // `inline` para abrir no visualizador do celular em vez de baixar.
      "Content-Disposition": `inline; filename="${roteiro.nomeArquivo.replace(/"/g, "")}"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
