import { readFileSync } from "fs";
import { join } from "path";

// Serve o guia estático (self-contained) "Você grava uma vez. A IA edita o resto"
// em /guia-editar-videos. Isca do Reel do advogado (comenta EDITAR); o CTA aponta
// pro Estúdio de CrIAção.
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
