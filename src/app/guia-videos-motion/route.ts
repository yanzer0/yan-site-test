import { readFileSync } from "fs";
import { join } from "path";

// Serve o guia estático (self-contained) "Uma semana de vídeos em motion com o
// Claude" em /guia-videos-motion. Isca do Reel em motion (comenta QUERO); o CTA
// logo depois do hero e no fim aponta pro formulário da call de diagnóstico.
// force-static: o HTML é lido no build e servido como resposta estática.
export const dynamic = "force-static";

export function GET() {
  const html = readFileSync(
    join(process.cwd(), "public", "guia-videos-motion.html"),
    "utf-8"
  );
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}