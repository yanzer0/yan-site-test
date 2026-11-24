import { readFileSync } from "fs";
import { join } from "path";

// Serve o guia estático "Quem pensa e quem executa no seu Claude Code"
// em /guia-modelo-por-agente. Isca do Reel 28 (o modelo mais caro no trabalho de estagiário, comenta MODELO);
// o CTA aponta pro diagnóstico.
// force-static: o HTML é lido no build e servido como resposta estática.
export const dynamic = "force-static";

export function GET() {
  const html = readFileSync(
    join(process.cwd(), "public", "guia-modelo-por-agente.html"),
    "utf-8"
  );
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}