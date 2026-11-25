import { readFileSync } from "fs";
import { join } from "path";

// Serve o guia estático "Uma conta. 45 segundos. Nenhum programa de edição"
// em /guia-motion-numeros. Isca do Reels do GTA VI (comenta GTA);
// o CTA aponta pra página de vendas do Estúdio de CrIAção.
// force-static: o HTML é lido no build e servido como resposta estática.
export const dynamic = "force-static";

export function GET() {
  const html = readFileSync(
    join(process.cwd(), "public", "guia-motion-numeros.html"),
    "utf-8"
  );
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
