import { readFileSync } from "fs";
import { join } from "path";

// Alias curto /final do guia "R$ 1 milhão por minuto. Sem programa de edição"
// (palavra-chave FINAL do Reels da final da Libertadores).
// force-static: o HTML é lido no build e servido como resposta estática.
export const dynamic = "force-static";

export function GET() {
  const html = readFileSync(
    join(process.cwd(), "public", "guia-motion-libertadores.html"),
    "utf-8"
  );
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
