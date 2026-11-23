import { readFileSync } from "fs";
import { join } from "path";

// Alias curto /paleta do guia "Dia 09: ui-ux-pro-max"
// (palavra-chave PALETA do reel do Dia 9 da série 30 skills do Claude).
// force-static: o HTML é lido no build e servido como resposta estática.
export const dynamic = "force-static";

export function GET() {
  const html = readFileSync(
    join(process.cwd(), "public", "guia-ui-ux-pro-max.html"),
    "utf-8"
  );
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}