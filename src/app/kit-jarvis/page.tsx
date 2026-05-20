import type { Metadata } from "next";
import { KitJarvisPage } from "@/components/kit-jarvis-page";

export const metadata: Metadata = {
  title: "Kit Jarvis — Automação por Palmas e Voz | INFUSER",
  description:
    "Duas palmas e tudo abre: música, app, terminal. Script Python pronto (Win + Mac) + guias pra personalizar em 5 minutos. R$19,90, download imediato.",
};

export default function Page() {
  return <KitJarvisPage />;
}
