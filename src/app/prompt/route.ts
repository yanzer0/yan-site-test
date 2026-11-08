import { readFileSync } from "fs";
import { join } from "path";

// Alias curto /prompt do guia "Uma foto do celular vira três versões de campanha"
// (palavra-chave PROMPT do Reel 10).
// force-static: o HTML é lido no build e servido como resposta estática.
export const dynamic = "force-static";

export function GET() {
  const html = readFileSync(
    join(process.cwd(), "public", "guia-foto-anuncio.html"),
    "utf-8"
  );
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
