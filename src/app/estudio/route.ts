import { readFileSync } from "fs";
import { join } from "path";

// Serve a página de vendas estática (self-contained) do Estúdio de CrIAção em /estudio.
// Mesmo modelo do /legiao: o HTML é lido no build e servido como resposta estática.
export const dynamic = "force-static";

export function GET() {
  const html = readFileSync(
    join(process.cwd(), "public", "estudio.html"),
    "utf-8"
  );
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
