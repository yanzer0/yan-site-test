import type { MouseEvent } from "react";

/** Duracao fixa do deslize, em ms.
 *
 * 240ms e o piso pratico: abaixo disso o olho le como corte seco, nao como
 * movimento, e nao vale o custo de renderizar quadro intermediario. Fixa de
 * proposito — o `behavior: "smooth"` nativo escala a duracao com a distancia,
 * e como daqui ate a oferta sao ~8900px isso dava ~1,3s (medido), com o scroll
 * travado em 1px por 1,6s antes de sair do lugar.
 */
const DURACAO_MS = 240;

/** easeOutCubic: arranca rapido e assenta no fim. Da sensacao de resposta
 *  imediata mesmo com a duracao curta. */
function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Leva pro bloco final de oferta (#contact) com deslize de duracao fixa.
 *
 * Anima na mao via requestAnimationFrame em vez de usar scroll-behavior:smooth
 * pra ter controle da duracao: sao ~15 quadros, independente da distancia.
 */
export function scrollToContact(e: MouseEvent<HTMLAnchorElement>) {
  const alvo = document.getElementById("contact");
  if (!alvo) return; // sem alvo, deixa o link se virar sozinho

  e.preventDefault();

  const inicio = window.scrollY;
  const fim = alvo.getBoundingClientRect().top + inicio;
  const distancia = fim - inicio;

  const marcarHash = () => history.replaceState(null, "", "#contact");

  // Quem pediu menos movimento no sistema nao leva deslize nenhum.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.scrollTo({ top: fim, behavior: "instant" as ScrollBehavior });
    marcarHash();
    return;
  }

  let frameId = 0;
  const t0 = performance.now();

  // Se a pessoa mexer no scroll no meio do caminho, a animacao sai da frente
  // em vez de brigar com o dedo dela.
  const cancelar = () => {
    cancelAnimationFrame(frameId);
    limpar();
  };
  const limpar = () => {
    window.removeEventListener("wheel", cancelar);
    window.removeEventListener("touchstart", cancelar);
  };
  window.addEventListener("wheel", cancelar, { passive: true, once: true });
  window.addEventListener("touchstart", cancelar, { passive: true, once: true });

  const passo = (agora: number) => {
    const t = Math.min((agora - t0) / DURACAO_MS, 1);
    window.scrollTo(0, inicio + distancia * easeOutCubic(t));

    if (t < 1) {
      frameId = requestAnimationFrame(passo);
      return;
    }
    limpar();
    marcarHash();
  };

  frameId = requestAnimationFrame(passo);
}
