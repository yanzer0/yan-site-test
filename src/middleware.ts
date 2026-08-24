import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Basic auth da demo do Marja App (/demomarja), entregue a um prospect por WhatsApp.
// O matcher no fim do arquivo limita este middleware AS DUAS rotas da demo -- o resto
// do site nao passa por aqui. Proteger tambem o .html e obrigatorio: o rewrite de
// /demomarja aponta pra ele, entao sem isso bastaria pedir o arquivo direto pra pular
// a senha.
//
// Credencial vem do ambiente (DEMO_MARJA_USER / DEMO_MARJA_PASS). Sem as duas variaveis
// a rota responde 503 em vez de abrir: uma demo de cliente nunca deve cair pra publica
// por variavel faltando num deploy.

const REALM = "Demo Marja App - Infuser";

/** Compara dois textos sempre percorrendo o mesmo numero de bytes. */
function equals(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const x = enc.encode(a);
  const y = enc.encode(b);
  let diff = x.length ^ y.length;
  const max = Math.max(x.length, y.length);
  for (let i = 0; i < max; i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

function challenge(): NextResponse {
  return new NextResponse("Acesso restrito.", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${REALM}", charset="UTF-8"`,
      "Cache-Control": "no-store",
    },
  });
}

function demoMarja(request: NextRequest): NextResponse {
  const user = process.env.DEMO_MARJA_USER;
  const pass = process.env.DEMO_MARJA_PASS;

  if (!user || !pass) {
    return new NextResponse("Demo indisponivel.", {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const header = request.headers.get("authorization");
  if (!header?.startsWith("Basic ")) return challenge();

  let decoded: string;
  try {
    decoded = atob(header.slice(6));
  } catch {
    return challenge();
  }

  const separator = decoded.indexOf(":");
  if (separator < 0) return challenge();

  const okUser = equals(decoded.slice(0, separator), user);
  const okPass = equals(decoded.slice(separator + 1), pass);
  if (!okUser || !okPass) return challenge();

  const response = NextResponse.next();
  // Demo de prospect nao entra em cache de CDN nem de browser compartilhado.
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

/**
 * A CSP do painel, com nonce por requisicao.
 *
 * 🔴 Nonce e nao `unsafe-inline`, e a diferenca aqui e a razao de este bloco
 * existir: o Next entrega o payload dos Server Components em scripts INLINE
 * (`self.__next_f.push`). Uma CSP com `script-src 'self'` bloqueia esses
 * scripts, o stream nunca completa, o React derruba a arvore inteira e a
 * pagina fica PRETA depois de aparecer por um segundo. Aconteceu em producao.
 *
 * `unsafe-inline` consertaria e destruiria a protecao junto. O nonce muda a
 * cada resposta, o Next carimba os scripts dele com esse nonce, e script
 * injetado por terceiro continua sem rodar.
 *
 * `strict-dynamic` e necessario porque o Next carrega os chunks a partir do
 * script que ja tem nonce; sem ele, cada chunk precisaria do seu.
 */
function painelComCsp(request: NextRequest): NextResponse {
  const nonce = crypto.randomUUID().replace(/-/g, "");

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    // 'unsafe-inline' em estilo continua: o Next injeta CSS inline no SSR e nao
    // ha nonce para folha de estilo no caminho dele. Estilo injetado faz muito
    // menos estrago que script injetado.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "base-uri 'none'",
    "object-src 'none'",
  ].join("; ");

  // O Next descobre o nonce lendo a CSP da REQUISICAO, e so entao carimba os
  // scripts que ele mesmo injeta. Sem repassar nos headers da request, o nonce
  // existiria so na resposta e nada seria carimbado.
  const cabecalhos = new Headers(request.headers);
  cabecalhos.set("x-nonce", nonce);
  cabecalhos.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: cabecalhos } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export function middleware(request: NextRequest): NextResponse {
  // 🔴 A separacao e por caminho e vem PRIMEIRO. O handler da demo devolve 503
  // quando as credenciais dela faltam no ambiente, e sem esta linha o painel
  // herdaria esse 503 por uma variavel que nao tem nada a ver com ele.
  if (request.nextUrl.pathname.startsWith("/leads")) return painelComCsp(request);
  return demoMarja(request);
}

export const config = {
  matcher: ["/demomarja", "/demomarja.html", "/leads/:path*"],
};
