import { readFileSync } from "node:fs";
import { join } from "node:path";
import { secondBrainSession } from "@/lib/instalar/upstream";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (await secondBrainSession(request) !== "active") {
    return new Response(null, { status: 401, headers: { "cache-control": "no-store" } });
  }
  const source = readFileSync(join(process.cwd(), "private", "instalar", "guide.js"), "utf-8");
  return new Response(source, {
    headers: {
      "cache-control": "private, no-store",
      "content-type": "application/javascript; charset=utf-8",
      "x-content-type-options": "nosniff",
    },
  });
}
