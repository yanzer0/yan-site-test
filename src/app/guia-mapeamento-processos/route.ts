import { readFileSync } from "fs";
import { join } from "path";

// Serve o guia estático (self-contained) "Como descobrir quais processos da sua
// empresa já dá pra automatizar" em /guia-mapeamento-processos. O CTA logo no
// começo aponta pro formulário de diagnóstico em /diagnostico.
// force-static: o HTML é lido no build e servido como resposta estática.
export const dynamic = "force-static";

export function GET() {
  const html = readFileSync(
    join(process.cwd(), "public", "guia-mapeamento-processos.html"),
    "utf-8"
  );
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
