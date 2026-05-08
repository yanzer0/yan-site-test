import { createHash } from "node:crypto";

const HASH_KEYS = new Set([
  "em",
  "ph",
  "fn",
  "ln",
  "ct",
  "st",
  "zp",
  "country",
  "external_id",
]);

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

export function sha256(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

export function processUserData(input: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(input)) {
    if (typeof value !== "string" || !value || !PASSTHROUGH_KEYS.has(key)) continue;
    out[key] = HASH_KEYS.has(key) ? sha256(value) : value;
  }
  return out;
}

export function pickIp(headers: Headers): string | undefined {
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip") ?? undefined;
}

export interface MetaCapiEvent {
  event_name: string;
  event_id: string;
  event_time?: number;
  event_source_url?: string;
  action_source?: "website" | "system_generated";
  user_data: Record<string, string>;
  custom_data?: Record<string, unknown>;
}

export type MetaCapiResult =
  | { ok: true }
  | { ok: false; status: number; error: string };

export async function sendMetaCapiEvent(event: MetaCapiEvent): Promise<MetaCapiResult> {
  const PIXEL_ID = process.env.META_PIXEL_ID;
  const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;
  const TEST_CODE = process.env.META_TEST_EVENT_CODE;

  if (!PIXEL_ID || !ACCESS_TOKEN) {
    return { ok: false, status: 500, error: "config_missing" };
  }

  const eventEntry: Record<string, unknown> = {
    event_name: event.event_name,
    event_time: event.event_time ?? Math.floor(Date.now() / 1000),
    event_id: event.event_id,
    action_source: event.action_source ?? "website",
    user_data: event.user_data,
  };
  if (event.event_source_url) eventEntry.event_source_url = event.event_source_url;
  if (event.custom_data) eventEntry.custom_data = event.custom_data;

  const body: Record<string, unknown> = {
    data: [eventEntry],
    access_token: ACCESS_TOKEN,
  };
  if (TEST_CODE) body.test_event_code = TEST_CODE;

  try {
    const upstream = await fetch(`https://graph.facebook.com/v21.0/${PIXEL_ID}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => "");
      console.error(
        `[meta-capi] upstream ${upstream.status} for event_id=${event.event_id} event_name=${event.event_name} body=${text.slice(0, 500)}`,
      );
      return { ok: false, status: 502, error: "upstream_failed" };
    }

    return { ok: true };
  } catch (err) {
    console.error(
      `[meta-capi] fetch error for event_id=${event.event_id}:`,
      err instanceof Error ? err.message : "unknown",
    );
    return { ok: false, status: 500, error: "internal" };
  }
}
