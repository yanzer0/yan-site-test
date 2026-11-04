import { readFileSync } from "fs";
import { join } from "path";

// Serves the static guide public/guia-n8n-skills.html (day 15 of the "30 dias, 30 skills do Claude" series).
// force-static: the HTML is read at build time.
export const dynamic = "force-static";

export function GET() {
  const html = readFileSync(
    join(process.cwd(), "public", "guia-n8n-skills.html"),
    "utf-8"
  );
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
