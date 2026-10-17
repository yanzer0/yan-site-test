import { readFileSync } from "fs";
import { join } from "path";

// Serve o guia estático (self-contained) "Implementar com ClickUp" em
// /guia-clickup. Isca do vídeo da skill implementar-com-clickup; o ZIP da
// skill mora em public/downloads/implementar-com-clickup.zip.
// force-static: o HTML é lido no build e servido como resposta estática.
export const dynamic = "force-static";

export function GET() {
  const html = readFileSync(
    join(process.cwd(), "public", "guia-clickup.html"),
    "utf-8"
  );
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
