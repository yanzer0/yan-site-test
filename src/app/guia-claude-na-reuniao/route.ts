import { readFileSync } from "fs";
import { join } from "path";

// Serve o guia estático "Claude na reunião, mesmo sem plano Team"
// em /guia-claude-na-reuniao. Isca do Reel 26 (Claude Meetings, comenta REUNIÃO);
// o CTA aponta pro diagnóstico.
// force-static: o HTML é lido no build e servido como resposta estática.
export const dynamic = "force-static";

export function GET() {
  const html = readFileSync(
    join(process.cwd(), "public", "guia-claude-na-reuniao.html"),
    "utf-8"
  );
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}