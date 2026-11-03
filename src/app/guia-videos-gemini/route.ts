import { readFileSync } from "fs";
import { join } from "path";

// Serve o guia estático "Parece comando secreto. É prompt bem escrito"
// em /guia-videos-gemini. Isca do Reel dos 4 prompts de vídeo do Gemini
// (comenta PROMPT); o CTA aponta pra Central.
// force-static: o HTML é lido no build e servido como resposta estática.
export const dynamic = "force-static";

export function GET() {
  const html = readFileSync(
    join(process.cwd(), "public", "guia-videos-gemini.html"),
    "utf-8"
  );
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
