import { NextRequest } from "next/server";
import { baixarRecurso } from "@/lib/guias/recursos";
export const dynamic = "force-dynamic";
export function GET(req: NextRequest, context: { params: Promise<{ slug: string }> }): Promise<Response> {
  return context.params.then(({ slug }) => baixarRecurso(req, slug));
}
