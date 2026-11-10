import { readFileSync } from "fs";
import { join } from "path";

// Serve o guia estático "O que da sua operação já vale trocar pro Fable 5.2"
// em /guia-fable-52. Isca do carrossel do lançamento do Fable 5.2 (comenta FABLE);
// o CTA aponta pro /diagnostico.
// force-static: o HTML é lido no build e servido como resposta estática.
export const dynamic = "force-static";

export function GET() {
  const html = readFileSync(
    join(process.cwd(), "public", "guia-fable-52.html"),
    "utf-8"
  );
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
