"use client";

import { useScrollReveal } from "@/lib/use-scroll-reveal";

export function TrustBar() {
  const ref = useScrollReveal();

  return (
    <section className="py-8 bg-[#0A0A0A]/80 relative overflow-hidden">
      {/* Subtle gradient line top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/20 to-transparent" />
      {/* Subtle gradient line bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/20 to-transparent" />

      <div ref={ref} className="scroll-reveal mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <p className="font-mono text-[13px] leading-relaxed text-zinc-500">
          O vídeo de demonstração atingiu{" "}
          <strong className="text-green-400">50 mil visualizações</strong> em{" "}
          <span className="text-gradient-green font-semibold">menos de 24 horas.</span>
          <br />
          Centenas de comentários pedindo o código.
          <br />
          <span className="text-zinc-300">Aqui está.</span>
        </p>
      </div>
    </section>
  );
}
