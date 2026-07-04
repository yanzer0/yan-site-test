import type { Metadata } from "next";
import { LegiaoPage } from "@/components/legiao-page";

export const metadata: Metadata = {
  title: "A Legião · 80 especialistas de IA dentro do seu Claude",
  description:
    "80 especialistas de IA que trabalham dentro do seu Claude: copy, tráfego, oferta, VSL, WhatsApp. O time completo, uma vez, e é seu pra sempre.",
  // Ainda nao lancada: mantem o noindex que a pagina tinha no HTML original.
  robots: { index: false, follow: false },
};

export default function Page() {
  return <LegiaoPage />;
}
