import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HASH_KEYS = new Set(["em", "ph", "fn", "ln", "ct", "st", "zp", "country", "external_id"]);
const PASSTHROUGH_KEYS = new Set([
  "em",
  "ph",
  "fn",
  "ln",
  "ct",
  "st",
  "zp",
  "country",
  "external_id",
  "fbp",
  "fbc",
  "subscription_id",
]);

interface CapiRequestBody {
  event_name?: unknown;
  event_id?: unknown;
  event_source_url?: unknown;
  user_data?: unknown;
}

function sha256(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

function processUserData(input: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(input)) {
    if (typeof value !== "string" || !value || !PASSTHROUGH_KEYS.has(key)) continue;
    out[key] = HASH_KEYS.has(key) ? sha256(value) : value;
  }
  return out;
}

function pickIp(req: NextRequest): string | undefined {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip") ?? undefined;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const PIXEL_ID = process.env.META_PIXEL_ID;
  const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;

  if (!PIXEL_ID || !ACCESS_TOKEN) {
    return NextResponse.json({ error: "config_missing" }, { status: 500 });
  }

  let body: CapiRequestBody;
  try {
    body = (await req.json()) as CapiRequestBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (typeof body.event_name !== "string" || typeof body.event_id !== "string") {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const incomingUserData =
    body.user_data && typeof body.user_data === "object" && !Array.isArray(body.user_data)
      ? (body.user_data as Record<string, unknown>)
      : {};

  const ip = pickIp(req);
  const ua = req.headers.get("user-agent") ?? undefined;

  const user_data: Record<string, string> = {
    ...processUserData(incomingUserData),
    ...(ip ? { client_ip_address: ip } : {}),
    ...(ua ? { client_user_agent: ua } : {}),
  };

  const eventPayload: Record<string, unknown> = {
    event_name: body.event_name,
    event_time: Math.floor(Date.now() / 1000),
    event_id: body.event_id,
    action_source: "website",
    user_data,
  };
  if (typeof body.event_source_url === "string" && body.event_source_url) {
    eventPayload.event_source_url = body.event_source_url;
  }

  try {
    const upstream = await fetch(`https://graph.facebook.com/v21.0/${PIXEL_ID}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [eventPayload],
        // TODO: remover test_event_code apos validar no Test Events da Meta
        test_event_code: "TEST67483",
        access_token: ACCESS_TOKEN,
      }),
    });

    if (!upstream.ok) {
      console.error(
        `[meta-capi] upstream ${upstream.status} for event_id=${body.event_id} event_name=${body.event_name}`,
      );
      return NextResponse.json({ error: "upstream_failed" }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(
      `[meta-capi] fetch error for event_id=${body.event_id}:`,
      err instanceof Error ? err.message : "unknown",
    );
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
