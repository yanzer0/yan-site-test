import type { Metadata } from "next";
import { PremiumUpsellEs } from "@/components/premium-upsell-es";

export const metadata: Metadata = {
  title: "Segundo Cerebro Premium | INFUSER",
  description: "Mejora tu Kit Segundo Cerebro con mantenimiento automático de tus notas, tareas y aprendizajes guardados.",
  robots: { index: false },
};

export default function Page() {
  return <PremiumUpsellEs />;
}
