import { readFileSync } from "fs";
import { join } from "path";

// Serve o guia estático (self-contained) "10 comandos do ChatGPT que transformam
// uma foto comum em peça visual" em /guia-comandos-gpt. Isca do carrossel dos
// comandos de imagem; o CTA a ~25% da página aponta pro Segundo Cérebro.
// force-static: o HTML é lido no build e servido como resposta estática.
export const dynamic = "force-static";

export function GET() {
  const html = readFileSync(
    join(process.cwd(), "public", "guia-comandos-gpt.html"),
    "utf-8"
  );
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
