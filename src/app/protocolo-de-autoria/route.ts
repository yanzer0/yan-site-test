import { readFileSync } from "fs";
import { join } from "path";

// Serve o guia estático (self-contained) "Protocolo de autoria: como usar IA no
// seu texto sem perder a prova de que ele é seu" em /protocolo-de-autoria.
// Isca do carrossel sobre a marca d'água do Claude.
// force-static: o HTML é lido no build e servido como resposta estática.
export const dynamic = "force-static";

export function GET() {
  const html = readFileSync(
    join(process.cwd(), "public", "protocolo-de-autoria.html"),
    "utf-8"
  );
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
