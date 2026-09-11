import { proxySecondBrain } from "@/lib/instalar/upstream";

export const dynamic = "force-dynamic";

export function POST(request: Request) {
  return proxySecondBrain(request, "/second-brain/resend");
}
