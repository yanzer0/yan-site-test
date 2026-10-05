import { readFileSync } from "fs";
import { join } from "path";

// Serve o guia estático (self-contained) "99 comandos que valem a pena testar
// no ChatGPT" em /99comandos (URL do carrossel; /guia-99-comandos serve o mesmo). Isca do carrossel dos 99 pedidos (comenta
// CÓDIGOS); o CTA logo depois do "como usar" e no fim aponta pro Segundo Cérebro.
// force-static: o HTML é lido no build e servido como resposta estática.
export const dynamic = "force-static";

export function GET() {
  const html = readFileSync(
    join(process.cwd(), "public", "guia-99-comandos.html"),
    "utf-8"
  );
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
