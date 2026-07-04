import type { Metadata } from "next";
import { ClubPage } from "@/components/club-page";

export const metadata: Metadata = {
  title:
    "Infuser Club — Automatize processos com IA e venda esses sistemas para outros negócios.",
  description:
    "A comunidade onde quem já fatura com IA te puxa junto. Aprenda a automatizar processos e vender esses sistemas, com o método Entrevista Invertida. Calls ao vivo toda semana, desafio quinzenal com freelance real, curso Claude do Zero + módulo avançado e 4 bônus. A partir de R$57/mês.",
};

export default function Page() {
  return <ClubPage />;
}
