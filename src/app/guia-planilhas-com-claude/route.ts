import { readFileSync } from "fs";
import { join } from "path";

// Serve o guia estático "5 planilhas que toda empresa usa, montadas pelo Claude"
// em /guia-planilhas-com-claude. Isca do Reel 27 (Claude Sheets, comenta PLANILHA);
// o CTA aponta pro diagnóstico.
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