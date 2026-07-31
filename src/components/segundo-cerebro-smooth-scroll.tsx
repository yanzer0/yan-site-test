"use client";

import { useEffect } from "react";

// Rolagem nativa para as ancoras da pagina do Segundo Cerebro.
//
// O SmoothAnchorScroll global anima por JS: um laco de requestAnimationFrame
// chamando window.scrollTo a cada quadro durante 1600ms. Nesta pagina isso
// pesa (documento longo) e a duracao fixa e sentida como atraso ao clicar num
// CTA. Aqui usamos scrollIntoView({behavior:"smooth"}), que o navegador executa
// no compositor: sem JS por quadro e sem duracao imposta.
//
// O listener roda na fase de CAPTURA para chegar antes do global, que desiste
// assim que ve defaultPrevented. Sem isso os dois competiriam pela rolagem.
export function SegundoCerebroSmoothScroll() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as HTMLElement | null)?.closest?.("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;

      const href = anchor.getAttribute("href") ?? "";
      const hashAt = href.indexOf("#");
      if (hashAt < 0 || href.length === hashAt + 1) return;

      const target = document.getElementById(decodeURIComponent(href.slice(hashAt + 1)));
      if (!target) return;

      event.preventDefault();

      const reduzMovimento = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      const antes = window.scrollY;
      target.scrollIntoView({ behavior: reduzMovimento ? "auto" : "smooth", block: "start" });

      // Rede de seguranca: em aba oculta, ou em navegador que suprime animacao,
      // o "smooth" simplesmente nao acontece e o visitante fica parado. Se em
      // 150ms nada saiu do lugar, pula direto pro alvo.
      if (!reduzMovimento) {
        window.setTimeout(() => {
          if (window.scrollY === antes) {
            target.scrollIntoView({ behavior: "auto", block: "start" });
          }
        }, 150);
      }

      window.history.replaceState?.(null, "", href.slice(hashAt));
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
