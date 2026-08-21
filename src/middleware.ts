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

export function middleware(request: NextRequest): NextResponse {
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

export const config = {
  matcher: ["/demomarja", "/demomarja.html"],
};
