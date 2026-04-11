import type { Metadata } from "next";
import { KitVSCode } from "@/components/kit-vscode";

export const metadata: Metadata = {
  title: "Kit Claude Code no VS Code | INFUSER",
  description:
    "Guia completo para usar o Claude Code dentro do VS Code. Instalação, funcionalidades exclusivas, atalhos e referência rápida. Gratuito.",
};

export default function KitVSCodePage() {
  return <KitVSCode />;
}
