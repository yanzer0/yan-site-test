import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderAccessPage } from "@/lib/instalar/access-page";
import { secondBrainSession } from "@/lib/instalar/upstream";

export const dynamic = "force-dynamic";

const PAGE_HEADERS = {
  "cache-control": "private, no-store",
  "content-type": "text/html; charset=utf-8",
  "x-content-type-options": "nosniff",
  "x-robots-tag": "noindex, nofollow",
};
const ACCESS_HEADERS = {
  ...PAGE_HEADERS,
  "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; img-src 'self'; font-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
};

export async function GET(request: Request) {
  const session = await secondBrainSession(request);
  if (session === "active") {
    const html = readFileSync(join(process.cwd(), "private", "instalar", "index.html"), "utf-8");
    return new Response(html, { headers: PAGE_HEADERS });
  }
  if (session === "unavailable") {
    return new Response(renderAccessPage("unavailable"), { status: 503, headers: ACCESS_HEADERS });
  }
  return new Response(renderAccessPage(), { headers: ACCESS_HEADERS });
}
