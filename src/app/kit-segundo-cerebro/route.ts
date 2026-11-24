import { readFileSync } from "fs";
import { join } from "path";

// Serve a pagina de vendas estatica do Kit Segundo Cerebro em /kit-segundo-cerebro.
// Rota canonica dos anuncios. O HTML vive em public/kit-segundo-cerebro.html e traz
// o loader do GTM e o encaminhamento de utm_* no proprio <head>/<body>, porque rota
// route.ts nao passa pelo src/app/layout.tsx.
// force-static: o HTML e lido no build e servido como resposta estatica.
export const dynamic = "force-static";

export function GET() {
  const html = readFileSync(
    join(process.cwd(), "public", "kit-segundo-cerebro.html"),
    "utf-8"
  );
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
