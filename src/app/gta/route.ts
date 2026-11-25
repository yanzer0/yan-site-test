import { readFileSync } from "fs";
import { join } from "path";

// Alias curto /gta do guia "Uma conta. 45 segundos. Nenhum programa de edição"
// (palavra-chave GTA do Reels do GTA VI).
// force-static: o HTML é lido no build e servido como resposta estática.
export const dynamic = "force-static";

export function GET() {
  const html = readFileSync(
    join(process.cwd(), "public", "guia-motion-numeros.html"),
    "utf-8"
  );
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
