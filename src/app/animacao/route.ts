import { readFileSync } from "fs";
import { join } from "path";

// Alias curto /animacao do guia "Dez estilos de animação no Claude"
// (palavra-chave ANIMAÇÃO do reel dos 10 estilos de animação).
// force-static: o HTML é lido no build e servido como resposta estática.
export const dynamic = "force-static";

export function GET() {
  const html = readFileSync(
    join(process.cwd(), "public", "guia-animacoes-claude.html"),
    "utf-8"
  );
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
