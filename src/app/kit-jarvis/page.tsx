import type { Metadata } from "next";
import { KitJarvisPage } from "@/components/kit-jarvis-page";

export const metadata: Metadata = {
  title: "Kit Jarvis — Automação por Palmas e Voz | INFUSER",
  description:
    "Duas palmas. Tudo liga sozinho. Kit completo de automação por palmas e voz com IA integrada. Por Yan Galasso.",
};

export default function Page() {
  return <KitJarvisPage />;
}
