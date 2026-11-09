import { readFileSync } from "fs";
import { join } from "path";

// Serve o guia estático "Cinco pedidos para o Claude planejar o seu Instagram"
// em /guia-conteudo-com-claude. Isca do Reel 11 (conteúdo com IA, comenta CONTEÚDO);
// o CTA aponta pra Central de guias.
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
