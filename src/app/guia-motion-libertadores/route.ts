import { readFileSync } from "fs";
import { join } from "path";

// Serve o guia estático "R$ 1 milhão por minuto. Sem programa de edição"
// em /guia-motion-libertadores. Isca do Reels da final da Libertadores (comenta FINAL);
// o CTA aponta pra página de vendas do Estúdio de CrIAção.
// force-static: o HTML é lido no build e servido como resposta estática.
export const dynamic = "force-static";

export function GET() {
  const html = readFileSync(
    join(process.cwd(), "public", "guia-motion-libertadores.html"),
    "utf-8"
  );
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
