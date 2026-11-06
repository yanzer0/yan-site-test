import { readFileSync } from "fs";
import { join } from "path";

// Alias curto /setup do guia "Ligue o Claude ao seu Instagram"
// (palavra-chave SETUP do Reel 8).
// force-static: o HTML é lido no build e servido como resposta estática.
export const dynamic = "force-static";

export function GET() {
  const html = readFileSync(
    join(process.cwd(), "public", "guia-claude-instagram.html"),
    "utf-8"
  );
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
