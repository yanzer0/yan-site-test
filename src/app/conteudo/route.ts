import { readFileSync } from "fs";
import { join } from "path";

// Alias curto /conteudo do guia "Cinco pedidos para o Claude planejar o seu Instagram"
// (palavra-chave CONTEÚDO do Reel 11).
// force-static: o HTML é lido no build e servido como resposta estática.
export const dynamic = "force-static";

export function GET() {
  const html = readFileSync(
    join(process.cwd(), "public", "guia-conteudo-com-claude.html"),
    "utf-8"
  );
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
