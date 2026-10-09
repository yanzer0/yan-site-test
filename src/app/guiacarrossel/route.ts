import { readFileSync } from "fs";
import { join } from "path";

// Serve o guia estático (self-contained) "Carrosséis animados com o Claude" em
// /guiacarrossel. Isca do carrossel animado (comenta QUERO); o CTA aponta pra call de diagnóstico.
// force-static: o HTML é lido no build e servido como resposta estática.
export const dynamic = "force-static";

export function GET() {
  const html = readFileSync(
    join(process.cwd(), "public", "guia-carrossel-animado.html"),
    "utf-8"
  );
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}