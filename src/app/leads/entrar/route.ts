/**
 * A porta de entrada do time, usada uma vez por aparelho.
 *
 * `/leads/entrar?k=<chave>` troca a chave por um cookie de 90 dias. Depois
 * disso o painel abre direto, no celular e no computador.
 *
 * A chave nunca vira o cookie: o cookie é um HMAC dela. Copiar o cookie de um
 * aparelho dá leitura, não dá a chave. Trocar a chave derruba todos os cookies
 * de uma vez, que é o botão de pânico se um aparelho se perder.
 */

import { NextRequest, NextResponse } from "next/server";

import {
  chaveConfere,
  COOKIE_LEADS,
  VALIDADE_SEGUNDOS,
  valorDoCookie,
} from "@/lib/diagnostico/acesso-leads";

// debt: sem rate limit nesta porta. A chave tem 192 bits, então força bruta por
// HTTP é inviável na prática, e limite correto em serverless exige estado
// compartilhado (Redis), que não existe no projeto hoje. Gatilho para pagar:
// no dia em que a chave virar algo curto ou memorizável, ou em que qualquer
// outra rota deste site precisar de rate limit e o Redis entrar por isso.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function pagina(titulo: string, texto: string): NextResponse {
  return new NextResponse(
    `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>${titulo} | Infuser</title>
<style>
  :root { color-scheme: dark }
  body { margin:0; min-height:100dvh; display:grid; place-items:center;
         background:#020202; color:#f0f0e4;
         font:400 16px/1.6 system-ui,-apple-system,sans-serif; padding:24px }
  main { max-width:420px; text-align:center }
  h1 { font-size:22px; letter-spacing:-.02em; margin:0 0 12px }
  p { color:rgba(240,240,228,.66); margin:0 0 20px }
  a { color:#c6ff34 }
  .marca { color:#c6ff34; font:500 11px/1 ui-monospace,monospace;
           letter-spacing:.16em; text-transform:uppercase; margin-bottom:20px }
</style></head>
<body><main>
  <div class="marca">Infuser</div>
  <h1>${titulo}</h1>
  <p>${texto}</p>
</main></body></html>`,
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const chave = req.nextUrl.searchParams.get("k") ?? "";

  if (!chaveConfere(chave)) {
    // Mesma resposta para chave errada e chave ausente: nada aqui confirma se
    // uma tentativa chegou perto.
    return pagina("Link de acesso inválido", "Confira o link com o time.");
  }

  const resposta = pagina(
    "Aparelho liberado",
    'Os leads já abrem neste aparelho. <a href="/leads">Ir para o painel</a>',
  );

  resposta.cookies.set(COOKIE_LEADS, valorDoCookie(chave), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: VALIDADE_SEGUNDOS,
  });

  return resposta;
}
