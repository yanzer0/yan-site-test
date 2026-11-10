import { readFileSync } from "fs";
import { join } from "path";

// Alias curto /critico do guia "Faça o ChatGPT parar de concordar com tudo"
// (palavra-chave CRÍTICO do Reel 13).
// force-static: o HTML é lido no build e servido como resposta estática.
export const dynamic = "force-static";

export function GET() {
  const html = readFileSync(
    join(process.cwd(), "public", "guia-chatgpt-critico.html"),
    "utf-8"
  );
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
