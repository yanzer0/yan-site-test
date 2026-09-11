const DEFAULT_ORIGIN = "https://mcp.useinfuser.com";
const BODY_LIMIT = 16 * 1024;
const UPSTREAM_TIMEOUT_MS = 5_000;
const FORWARDED_RESPONSE_HEADERS = [
  "cache-control",
  "content-disposition",
  "content-length",
  "content-type",
  "location",
  "retry-after",
  "set-cookie",
] as const;

export type SessionState = "active" | "denied" | "unavailable";

function upstreamOrigin(): string {
  const parsed = new URL(process.env.SECOND_BRAIN_ACCESS_ORIGIN || DEFAULT_ORIGIN);
  const localHttp = parsed.protocol === "http:" && ["127.0.0.1", "localhost"].includes(parsed.hostname);
  if (parsed.protocol !== "https:" && !localHttp) throw new Error("invalid second brain upstream protocol");
  if (parsed.username || parsed.password || parsed.pathname !== "/" || parsed.search || parsed.hash) {
    throw new Error("invalid second brain upstream origin");
  }
  return parsed.origin;
}

function forwardedHeaders(request: Request): Headers {
  const headers = new Headers();
  const cookie = request.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",", 1)[0]?.trim();
  if (forwardedFor && /^[0-9a-f:.]{3,64}$/i.test(forwardedFor)) headers.set("x-forwarded-for", forwardedFor);
  return headers;
}

async function limitedBody(request: Request): Promise<ArrayBuffer | undefined> {
  if (request.method === "GET" || request.method === "HEAD") return undefined;
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > BODY_LIMIT) throw new RangeError("request body too large");
  const body = await request.arrayBuffer();
  if (body.byteLength > BODY_LIMIT) throw new RangeError("request body too large");
  return body;
}

export async function secondBrainSession(request: Request): Promise<SessionState> {
  try {
    const response = await fetch(`${upstreamOrigin()}/second-brain/session`, {
      headers: forwardedHeaders(request),
      redirect: "manual",
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
    if (response.status === 204) return "active";
    if (response.status === 401) return "denied";
    return "unavailable";
  } catch {
    return "unavailable";
  }
}

export async function proxySecondBrain(
  request: Request,
  upstreamPath: string,
  searchParams?: URLSearchParams,
): Promise<Response> {
  let body: ArrayBuffer | undefined;
  try {
    body = await limitedBody(request);
  } catch (error) {
    if (error instanceof RangeError) return new Response("Request too large", { status: 413 });
    return new Response("Invalid request", { status: 400 });
  }
  try {
    const url = new URL(upstreamPath, `${upstreamOrigin()}/`);
    if (searchParams) url.search = searchParams.toString();
    const upstream = await fetch(url, {
      method: request.method,
      headers: forwardedHeaders(request),
      body,
      redirect: "manual",
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
    const headers = new Headers();
    for (const name of FORWARDED_RESPONSE_HEADERS) {
      const value = upstream.headers.get(name);
      if (value) headers.set(name, value);
    }
    const location = headers.get("location");
    if (location?.startsWith("/second-brain")) {
      headers.set("location", location.replace(/^\/second-brain/, "/instalar"));
    }
    return new Response(await upstream.arrayBuffer(), { status: upstream.status, headers });
  } catch {
    return new Response("Serviço de acesso temporariamente indisponível", {
      status: 503,
      headers: { "cache-control": "no-store", "content-type": "text/plain; charset=utf-8" },
    });
  }
}
