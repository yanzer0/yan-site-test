import type { Metadata } from "next";
import { ComunidadePage } from "@/components/comunidade-page";

export const metadata: Metadata = {
  title: "Comunidade Infuser — Lista de espera | Yan Galasso",
  description:
    "As 50 vagas fecharam. Entra na lista de espera e recebe aviso 24h antes da próxima abertura pública. Comunidade gratuita de IA por Yan Galasso.",
};

export default function Page() {
  return <ComunidadePage />;
}
