import type { Metadata } from "next";
import { ComunidadePage } from "@/components/comunidade-page";

export const metadata: Metadata = {
  title: "Comunidade Gratuita Infuser | Yan Galasso",
  description:
    "A comunidade gratuita da Infuser, aberta a todo mundo. Troca de prompts, novidades de IA e gente construindo de verdade. Entra de graça, sem call de vendas.",
};

export default function Page() {
  return <ComunidadePage />;
}
