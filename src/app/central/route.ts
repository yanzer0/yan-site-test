import { cabecalhosBibliotecaGuias, documentoBiblioteca } from "@/lib/guias/documentos";
export const dynamic = "force-dynamic";
export function GET(): Response {
  const html = documentoBiblioteca();
  return new Response(html, { headers: cabecalhosBibliotecaGuias(html) });
}
