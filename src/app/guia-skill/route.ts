import { readFileSync } from "fs";
import { join } from "path";

// Serve o guia estático (self-contained) "Como criar skills que transformam o
// Claude num especialista" em /guia-skill. Isca do post sobre skills.
// force-static: o HTML é lido no build e servido como resposta estática.
export const dynamic = "force-static";

export function GET() {
  const html = readFileSync(
    join(process.cwd(), "public", "guia-skill.html"),
    "utf-8"
  );
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
