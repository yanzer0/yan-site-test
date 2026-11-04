import { readFileSync } from "fs";
import { join } from "path";

// Serves the static guide public/guia-videos-gemini.html (4 Gemini video prompts).
// force-static: the HTML is read at build time.
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
