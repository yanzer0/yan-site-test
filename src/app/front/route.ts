import { readFileSync } from "fs";
import { join } from "path";

// Alias curto /front do guia "Dia 08: frontend-design"
// (palavra-chave FRONT do reel do Dia 8 da série 30 skills do Claude).
// force-static: o HTML é lido no build e servido como resposta estática.
export const dynamic = "force-static";

export function GET() {
  const html = readFileSync(
    join(process.cwd(), "public", "guia-frontend-design.html"),
    "utf-8"
  );
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}