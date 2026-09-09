import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(): NextResponse {
  const release = process.env.APP_RELEASE?.trim() || "unknown";
  const ready = release !== "unknown";

  return NextResponse.json(
    {
      ok: ready,
      service: "useinfuser-site",
      release,
    },
    {
      status: ready ? 200 : 503,
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
