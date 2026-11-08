import { readFileSync } from "fs";
import { join } from "path";

// Alias curto /edicao do guia "Do vídeo bruto à edição com gráficos e animações"
// (palavra-chave EDITAR do Reel 9; /editar continua no guia do Reel do advogado).
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
