import { readFileSync } from "fs";
import { join } from "path";

// Serve o guia estático (self-contained) da isca "Coloca a IA pra trabalhar" em /guia-agentes.
// force-static: o HTML é lido no build e servido como resposta estática.
export const dynamic = "force-static";

export function GET() {
  const html = readFileSync(
    join(process.cwd(), "public", "guia-agentes.html"),
    "utf-8"
  );
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
