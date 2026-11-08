import { readFileSync } from "fs";
import { join } from "path";

// Serve o guia estático "Do vídeo bruto à edição com gráficos e animações"
// em /guia-edicao-com-ia. Isca do Reel 9 (Claude editando vídeos, comenta EDITAR);
// o CTA aponta pro Estúdio de CrIAção.
// force-static: o HTML é lido no build e servido como resposta estática.
export const dynamic = "force-static";

export function GET() {
  const html = readFileSync(
    join(process.cwd(), "public", "guia-edicao-com-ia.html"),
    "utf-8"
  );
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
