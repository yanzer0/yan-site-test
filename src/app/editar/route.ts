import { readFileSync } from "fs";
import { join } from "path";

// Alias curto /editar do guia "Você grava uma vez. A IA edita o resto"
// (palavra-chave EDITAR do Reel do advogado).
// force-static: o HTML é lido no build e servido como resposta estática.
export const dynamic = "force-static";

export function GET() {
  const html = readFileSync(
    join(process.cwd(), "public", "guia-editar-videos.html"),
    "utf-8"
  );
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
