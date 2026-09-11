import { proxySecondBrain } from "@/lib/instalar/upstream";

export const dynamic = "force-dynamic";

function activationSearch(request: Request): URLSearchParams {
  const code = new URL(request.url).searchParams.get("code") ?? "";
  return new URLSearchParams({ code });
}

export function GET(request: Request) {
  return proxySecondBrain(request, "/second-brain/activate", activationSearch(request));
}

export function POST(request: Request) {
  return proxySecondBrain(request, "/second-brain/activate");
}
