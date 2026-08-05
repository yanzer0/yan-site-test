"use client";

import Image from "next/image";
import { useScrollReveal } from "@/lib/use-scroll-reveal";
import { SectionCta } from "@/components/section-cta";

export function Problem() {
  const ref = useScrollReveal();

  return (
    <>
      <div className="section-divider" />
      <section id="como-funciona" className="py-20 sm:py-28" style={{ background: '#000000' }}>
        <div ref={ref} className="scroll-reveal mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-6">
            Duas palmas. A música toca, o Notion abre,
            <br />
            <span className="font-punch text-gradient-green">o app que você quiser entra.</span>
          </h2>

          <p className="text-[15px] text-zinc-200 font-semibold mb-4">
            Parece simples — até você tentar.
          </p>

          <p className="text-[15px] text-zinc-300 leading-relaxed mb-4">
            Aí descobre que precisa de Python. De bibliotecas. De entender FFT,
            transformada de Fourier, análise espectral, similaridade do cosseno.
            Que o microfone do Mac se comporta diferente do Windows. Que tem
            conflito de áudio, problema de permissão, threshold de amplitude...
          </p>

          <p className="font-heading text-xl sm:text-2xl md:text-[28px] text-white font-bold leading-snug mb-6">
            Eu levei dias pra fazer funcionar. <span className="text-gradient-green">Você não precisa.</span>
          </p>

          <p className="text-[15px] text-zinc-300 leading-relaxed mb-8">
            O JARVIS Kit é um arquivo <span className="text-gradient-green font-semibold">.zip</span> com o
            código pronto (Windows e Mac), dois PDFs passo a passo &mdash;
            instalação e personalização &mdash; e um prompt pra colar no ChatGPT,
            Claude ou Gemini que vira seu professor particular. Testado nos dois
            sistemas, pronto pra rodar em 5 minutos.
          </p>

          <div className="image-frame border border-white/8">
            <Image
              src="/jarvis-terminal.webp"
              alt="Terminal macOS com JARVIS rodando"
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
