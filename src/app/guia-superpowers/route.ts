import { readFileSync } from "fs";
import { join } from "path";

// Serves the static guide public/guia-superpowers.html (day 21 of the "30 dias, 30 skills do Claude" series).
// force-static: the HTML is read at build time.
export const dynamic = "force-static";

export function GET() {
  const html = readFileSync(
    join(process.cwd(), "public", "guia-superpowers.html"),
    "utf-8"
  );
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
