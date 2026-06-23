import type { Metadata } from "next";
import { ClubPage } from "@/components/club-page";

export const metadata: Metadata = {
  title:
    "Infuser Club — Pare de aprender sobre IA. Comece a construir com ela.",
  description:
    "A comunidade onde quem já fatura com IA te puxa junto. Calls ao vivo toda semana, desafio quinzenal com freelance real, curso Claude do Zero + módulo avançado e 4 bônus. A partir de R$57/mês.",
};

export default function Page() {
  return <ClubPage />;
}
