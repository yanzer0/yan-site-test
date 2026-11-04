import { readFileSync } from "fs";
import { join } from "path";

// Serves the static guide public/guia-clonar-sites.html (clone any site design with Claude).
// force-static: the HTML is read at build time.
export const dynamic = "force-static";

export function GET() {
  const html = readFileSync(
    join(process.cwd(), "public", "guia-clonar-sites.html"),
    "utf-8"
  );
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
