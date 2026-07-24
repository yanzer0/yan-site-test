import { readFileSync } from "fs";
import { join } from "path";

// Serve o guia estático (self-contained) "Como extrair todo o potencial do Claude Opus 5" em /opus5.
// Isca do carrossel de lançamento do Opus 5 (comenta OPUS -> DM com este link).
// force-static: o HTML é lido no build e servido como resposta estática.
export const dynamic = "force-static";

export function GET() {
  const html = readFileSync(
    join(process.cwd(), "public", "opus5.html"),
    "utf-8"
  );
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
