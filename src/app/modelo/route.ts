import { readFileSync } from "fs";
import { join } from "path";

// Alias curto /modelo do guia "Quem pensa e quem executa no seu Claude Code"
// (palavra-chave MODELO do Reel 28).
// force-static: o HTML é lido no build e servido como resposta estática.
export const dynamic = "force-static";

export function GET() {
  const html = readFileSync(
    join(process.cwd(), "public", "guia-modelo-por-agente.html"),
    "utf-8"
  );
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}