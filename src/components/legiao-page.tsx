"use client";

import { useEffect } from "react";
import { legiaoHtml } from "@/app/legiao/legiao-html";
import { runLegiaoScripts } from "@/app/legiao/legiao-scripts";

// Mesmo padrao do /club (club-page.tsx): a pagina "A Legiao" e HTML/CSS reais
// (fonte no brain: _infoprodutos/esquadrao-agentes/pagina-vendas-legiao.html),
// injetados via dangerouslySetInnerHTML. Os <script> inline nao rodam por esse
// caminho, entao a logica (cmdbar, chat-demo, morph/orbita, faq, reveal) foi
// portada pra runLegiaoScripts() e disparada no efeito abaixo, apos o mount.
export function LegiaoPage() {
  useEffect(() => {
    runLegiaoScripts();
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: legiaoHtml }} />;
}
