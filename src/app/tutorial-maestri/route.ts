import { readFileSync } from "fs";
import { join } from "path";

// Serve o tutorial estático (self-contained) "Claude + Codex juntos no Maestri" em /tutorial-maestri.
// Isca gratuita: passo a passo de instalação + CTA pro Kit Segundo Cérebro.
// force-static: o HTML é lido no build e servido como resposta estática.
export const dynamic = "force-static";

export function GET() {
  const html = readFileSync(
    join(process.cwd(), "public", "tutorial-maestri.html"),
    "utf-8"
  );
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
