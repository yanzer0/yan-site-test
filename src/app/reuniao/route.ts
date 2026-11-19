import { readFileSync } from "fs";
import { join } from "path";

// Alias curto /reuniao do guia "Claude na reunião, mesmo sem plano Team"
// (palavra-chave REUNIÃO do Reel 26).
// force-static: o HTML é lido no build e servido como resposta estática.
export const dynamic = "force-static";

export function GET() {
  const html = readFileSync(
    join(process.cwd(), "public", "guia-claude-na-reuniao.html"),
    "utf-8"
  );
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}