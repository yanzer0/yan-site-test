import { readFileSync } from "fs";
import { join } from "path";

// Serve o guia estático (self-contained) "+50 prompts de vídeos motion com o Claude" em
// /promptsmotion. Isca do vídeo motion do Opus (comenta MOTION); o CTA aponta pra call de diagnóstico.
// force-static: o HTML é lido no build e servido como resposta estática.
export const dynamic = "force-static";

export function GET() {
  const html = readFileSync(
    join(process.cwd(), "public", "guia-prompts-motion.html"),
    "utf-8"
  );
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}