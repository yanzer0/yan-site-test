"use client";

import Image from "next/image";
import { useScrollReveal } from "@/lib/use-scroll-reveal";
import { SectionCta } from "@/components/section-cta";

export function Technical() {
  const ref = useScrollReveal();

  return (
    <>
      <div className="section-divider" />
      <section className="py-20 sm:py-28">
        <div ref={ref} className="scroll-reveal mx-auto max-w-4xl px-4 sm:px-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-green-400 mb-4">
            Pra quem quer entender
          </p>
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-6">
            Não é volume.
            <br />
            É <span className="font-punch text-gradient-green">fingerprint espectral.</span>
          </h2>

          <p className="text-[15px] text-zinc-400 leading-relaxed mb-4">
            A maioria dos projetos de &quot;detecção de palma&quot; na internet usa
            amplitude — se o som é alto, conta. Isso detecta teclado, batida na
            mesa, porta fechando. Não funciona.
          </p>

          <p className="text-[15px] text-zinc-400 leading-relaxed mb-4">
            O JARVIS usa análise espectral. Na calibração, ele grava o{" "}
            <strong className="text-white">formato</strong> do som da sua palma —
            como uma impressao digital sonora. Depois, em tempo real, compara cada
            som contra esse perfil usando similaridade do cosseno.
          </p>

          {/* Impact numbers - visually prominent */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="rounded-lg bg-white/[0.03] border border-white/5 p-4 text-center">
              <div className="font-punch text-3xl sm:text-4xl text-zinc-500 mb-1">45%</div>
              <div className="text-[11px] text-zinc-600 uppercase tracking-wider">Batida na mesa</div>
              <div className="text-[10px] text-red-400/70 mt-1">Descartado</div>
            </div>
            <div className="rounded-lg bg-white/[0.03] border border-white/5 p-4 text-center">
              <div className="font-punch text-3xl sm:text-4xl text-zinc-500 mb-1">55%</div>
              <div className="text-[11px] text-zinc-600 uppercase tracking-wider">Estalo de dedo</div>
              <div className="text-[10px] text-red-400/70 mt-1">Descartado</div>
            </div>
            <div className="rounded-lg bg-green-500/[0.06] border border-green-500/20 p-4 text-center">
              <div className="font-punch text-3xl sm:text-4xl text-gradient-green mb-1">87%</div>
              <div className="text-[11px] text-green-400/70 uppercase tracking-wider">Sua palma</div>
              <div className="text-[10px] text-green-400 font-semibold mt-1">Ativado</div>
            </div>
          </div>

          {/* Image 3 - Spectrum */}
          <div className="image-frame border border-white/8">
            <Image
              src="/jarvis-spectrum.webp"
              alt="Comparação de espectros: batida na mesa vs estalo vs palma"
              width={1400}
              height={788}
              sizes="(max-width: 768px) 100vw, 700px"
              className="w-full h-auto"
            />
          </div>

          <SectionCta />
        </div>
      </section>
    </>
  );
}
