import { readFileSync } from "fs";
import { join } from "path";

// Alias curto /scanner do guia "Antes de instalar uma skill, confira estas 7 coisas"
// (palavra-chave SCANNER do Reel 29).
// force-static: o HTML é lido no build e servido como resposta estática.
export const dynamic = "force-static";

export function GET() {
  const html = readFileSync(
    join(process.cwd(), "public", "guia-scanner-de-skills.html"),
    "utf-8"
  );
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}