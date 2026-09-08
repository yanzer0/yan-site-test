import { readFileSync } from "fs";
import { join } from "path";

// Serve o guia estatico (self-contained) "Como usar o GPT-6 Astra de verdade"
// em /guia-gpt6-astra. Isca do lancamento do Astra; o CTA do meio e o do fim
// apontam pro /kit-segundo-cerebro.
// force-static: o HTML e lido no build e servido como resposta estatica.
export const dynamic = "force-static";

export function GET() {
  const html = readFileSync(
    join(process.cwd(), "public", "guia-gpt6-astra.html"),
    "utf-8"
  );
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
