import { proxySecondBrain } from "@/lib/instalar/upstream";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return proxySecondBrain(request, "/second-brain/download");
}
