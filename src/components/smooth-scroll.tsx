"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

// Smooth scroll global (inercia suave). Substitui o SmoothAnchorScroll:
// alem de suavizar a rolagem, trata clique em ancora same-page via lenis.scrollTo,
// pra nao ter dois sistemas brigando pelo scroll.
export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      // modo lerp: deslize continuo por frame (o mais macio). Menor = mais suave/flutuante.
      lerp: 0.075,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.6,
    });

    // util p/ debug/tuning
    (window as unknown as { lenis?: Lenis }).lenis = lenis;

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    // Ancoras same-page -> Lenis (mesmas guardas do SmoothAnchorScroll antigo)
    const onClick = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      )
        return;
      const a = (e.target as HTMLElement | null)?.closest?.("a[href]");
      if (!(a instanceof HTMLAnchorElement)) return;
      const raw = a.getAttribute("href");
      if (!raw || !raw.includes("#")) return;
      let url: URL;
      try {
        url = new URL(a.href, window.location.href);
      } catch {
        return;
      }
      if (
        url.origin !== window.location.origin ||
        url.pathname !== window.location.pathname
      )
        return;
      if (!url.hash || url.hash === "#") return;
      const target = document.getElementById(
        decodeURIComponent(url.hash.slice(1))
      );
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement);
      if (window.history.replaceState) {
        window.history.replaceState(null, "", url.hash);
      }
    };
    document.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("click", onClick);
      lenis.destroy();
    };
  }, []);

  return null;
}
