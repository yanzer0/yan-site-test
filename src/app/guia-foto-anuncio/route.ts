import { readFileSync } from "fs";
import { join } from "path";

// Serve o guia estático "Uma foto do celular vira três versões de campanha"
// em /guia-foto-anuncio. Isca do Reel 10 (foto de produto vira anúncio, comenta PROMPT);
// o CTA aponta pra Central de guias.
// force-static: o HTML é lido no build e servido como resposta estática.
export const dynamic = "force-static";

export function GET() {
  const html = readFileSync(
    join(process.cwd(), "public", "guia-foto-anuncio.html"),
    "utf-8"
  );
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
