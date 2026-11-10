import { readFileSync } from "fs";
import { join } from "path";

// Serve o guia estático "Faça o ChatGPT parar de concordar com tudo"
// em /guia-chatgpt-critico. Isca do Reel 13 (ChatGPT que concorda até quando você erra, comenta CRÍTICO);
// o CTA aponta pra Central de guias.
// force-static: o HTML é lido no build e servido como resposta estática.
export const dynamic = "force-static";

export function GET() {
  const html = readFileSync(
    join(process.cwd(), "public", "guia-chatgpt-critico.html"),
    "utf-8"
  );
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
