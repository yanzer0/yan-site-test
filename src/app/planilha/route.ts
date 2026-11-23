import { readFileSync } from "fs";
import { join } from "path";

// Alias curto /planilha do guia "5 planilhas que toda empresa usa, montadas pelo Claude"
// (palavra-chave PLANILHA do Reel 27).
// force-static: o HTML é lido no build e servido como resposta estática.
export const dynamic = "force-static";

export function GET() {
  const html = readFileSync(
    join(process.cwd(), "public", "guia-planilhas-com-claude.html"),
    "utf-8"
  );
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}