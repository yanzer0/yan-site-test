import { NextRequest, NextResponse } from "next/server";

import { pickIp, processUserData, sendMetaCapiEvent } from "@/lib/meta-capi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CapiRequestBody {
  event_name?: unknown;
  event_id?: unknown;
  event_source_url?: unknown;
  user_data?: unknown;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
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

  const ip = pickIp(req.headers);
  const ua = req.headers.get("user-agent") ?? undefined;

  const user_data: Record<string, string> = {
    ...processUserData(incomingUserData),
    ...(ip ? { client_ip_address: ip } : {}),
    ...(ua ? { client_user_agent: ua } : {}),
  };

  const result = await sendMetaCapiEvent({
    event_name: body.event_name,
    event_id: body.event_id,
    event_source_url:
      typeof body.event_source_url === "string" && body.event_source_url
        ? body.event_source_url
        : undefined,
    user_data,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true });
}
