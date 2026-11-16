import { readFileSync } from "fs";
import { join } from "path";

// Alias curto /reforma do guia "Reforma tributária: 4 prompts para preparar sua empresa"
// (palavra-chave REFORMA do Reel 18).
// force-static: o HTML é lido no build e servido como resposta estática.
export const dynamic = "force-static";

export function GET() {
  const html = readFileSync(
    join(process.cwd(), "public", "guia-reforma-com-ia.html"),
    "utf-8"
  );
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}