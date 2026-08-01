"use client";

import { SegundoCerebro } from "@/components/segundo-cerebro";

// Fundo preto liso: saiu o FallingPattern (as bolinhas verdes animadas) e a
// camada de escurecimento que vinha junto. O body ja e #000000 (--background
// no globals.css), entao nao e preciso nenhuma camada de fundo aqui.
// O FallingPattern continua em uso em /kit-jarvis, /kit-skills, /comunidade e
// /kit-vscode -- o componente nao foi tocado.
export function KitSegundoCerebroPage() {
  return (
    <div className="relative">
      <SegundoCerebro />
    </div>
  );
}
