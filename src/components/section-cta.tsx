"use client";

import { scrollToContact } from "@/lib/scroll-to-contact";

/**
 * CTA de fim de secao. Todos apontam pro #contact (bloco final de oferta).
 *
 * transition limitada a colors/transform de proposito — 'transition-all'
 * faz o browser observar toda propriedade animavel do elemento.
 */
export function SectionCta({ label = "QUERO O JARVIS KIT" }: { label?: string }) {
  return (
    <div className="mt-12 flex justify-center">
      <a
        href="#contact"
        onClick={scrollToContact}
        className="group inline-flex items-center gap-2 rounded-lg bg-green-500 px-10 py-4 text-base font-bold text-black transition-[background-color,transform] duration-200 hover:bg-green-400 hover:-translate-y-0.5 cursor-pointer green-glow"
      >
        {label}{" "}
        <span className="transition-transform duration-200 group-hover:translate-y-1">
          &darr;
        </span>
      </a>
    </div>
  );
}
