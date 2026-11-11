import { readFileSync } from "fs";
import { join } from "path";

// Serves the static guide public/guia-efeitos-ia.html (four AI video editing effects).
// force-static: the HTML is read at build time.
export const dynamic = "force-static";

export function GET() {
  const html = readFileSync(
    join(process.cwd(), "public", "guia-efeitos-ia.html"),
    "utf-8"
  );
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
