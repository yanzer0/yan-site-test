import { readFileSync } from "fs";
import { join } from "path";

// Serve o guia estático (self-contained) "O agente que guarda o que você ensina" em /agente-que-aprende.
// Isca do carrossel do Agente que Aprende (comenta MEMÓRIA -> DM com este link).
// force-static: o HTML é lido no build e servido como resposta estática.
export const dynamic = "force-static";

export function GET() {
  const html = readFileSync(
    join(process.cwd(), "public", "agente-que-aprende.html"),
    "utf-8"
  );
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
