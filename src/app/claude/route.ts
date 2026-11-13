import { readFileSync } from "fs";
import { join } from "path";

// Alias curto /claude do guia "Três processos no Claude que quase ninguém usa"
// (palavra-chave CLAUDE do Reel 15).
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