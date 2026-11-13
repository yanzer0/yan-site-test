import { readFileSync } from "fs";
import { join } from "path";

// Serve o guia estático "Três processos no Claude que quase ninguém usa"
// em /guia-tres-processos-claude. Isca do Reel 15 (3 processos com Claude, comenta CLAUDE);
// o CTA aponta pra Central de guias.
// force-static: o HTML é lido no build e servido como resposta estática.
export const dynamic = "force-static";

export function GET() {
  const html = readFileSync(
    join(process.cwd(), "public", "guia-tres-processos-claude.html"),
    "utf-8"
  );
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}