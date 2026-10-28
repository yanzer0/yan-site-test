import { CABECALHOS_GUIAS, documentoBiblioteca } from "@/lib/guias/documentos";
export const dynamic = "force-dynamic";
export function GET(): Response {
  return new Response(documentoBiblioteca(), { headers: CABECALHOS_GUIAS });
}
