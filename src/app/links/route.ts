import { readFileSync } from "fs";
import { join } from "path";

// Serve a página de links da bio do Instagram do Yan (@yangalasso) em /links.
// HTML self-contained na identidade v2 clara: quem é o Yan, diagnóstico, como a Infuser trabalha e os kits.
// force-static: o HTML é lido no build e servido como resposta estática.
export const dynamic = "force-static";

export function GET() {
  const html = readFileSync(
    join(process.cwd(), "public", "links.html"),
    "utf-8"
  );
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}