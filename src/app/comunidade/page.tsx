import type { Metadata } from "next";
import { ComunidadePage } from "@/components/comunidade-page";

export const metadata: Metadata = {
  title: "Comunidade Infuser — 50 vagas | Yan Galasso",
  description:
    "Grupo gratuito de IA onde a regra é aplicar, não acumular link. Resumo semanal, calls fechadas e gente testando IA de verdade. 50 vagas.",
};

export default function Page() {
  return <ComunidadePage />;
}
