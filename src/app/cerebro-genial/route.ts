import { readFileSync } from "fs";
import { join } from "path";

// Serve a pagina de upsell do Kit Segundo Cerebro em /cerebro-genial (pos-compra na Hubla).
// O HTML vive em public/cerebro-genial.html e traz o loader do GTM no <head>, porque rota
// route.ts nao passa pelo src/app/layout.tsx.
// force-static: o HTML e lido no build e servido como resposta estatica.
export const dynamic = "force-static";

export function GET() {
  const html = readFileSync(
    join(process.cwd(), "public", "cerebro-genial.html"),
    "utf-8"
  );
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
