"use client";

import Image from "next/image";
import { useScrollReveal } from "@/lib/use-scroll-reveal";
import { SectionCta } from "@/components/section-cta";

export function AITeacher() {
  const ref = useScrollReveal();

  return (
    <>
      <div className="section-divider" />
      <section className="py-20 sm:py-28 bg-[#050505]/80">
        <div ref={ref} className="scroll-reveal mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-2">
            Nunca programou?
            <br />
            <span className="font-punch text-gradient-green">Perfeito.</span>
          </h2>
          <p className="text-[15px] text-zinc-400 mb-8">
            O JARVIS Kit vem com guias prontos pra IA — e o que torna ele
            diferente de qualquer código no GitHub.
          </p>

          {/* AI Teacher card */}
          <div className="rounded-xl border-l-[3px] border-green-500 bg-green-500/[0.06] p-8 mb-8">
            <h3 className="font-heading text-xl font-bold text-white mb-3">
              A IA vira seu professor particular
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed mb-3">
              Você pega o arquivo de guia, cola num chat de IA (Claude, ChatGPT,
              Gemini, Grok — qualquer um), e a IA se transforma no{" "}
              <strong className="text-white">Yan</strong> — o criador do JARVIS —
              te ensinando passo a passo como se estivesse do seu lado.
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed mb-6">
              Ela dá <strong className="text-white">um passo de cada vez</strong>.
              Espera você confirmar que funcionou. Se der erro, pede o print e
              resolve. Não avança até estar tudo certo. É como ter um professor
              particular que <span className="text-gradient-green font-semibold">não desiste de você.</span>
            </p>

            {/* Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { num: "1", text: "Cola o guia\nna IA" },
                { num: "2", text: "A IA te guia\npasso a passo" },
                { num: "3", text: "JARVIS\nfuncionando" },
              ].map((step) => (
                <div
                  key={step.num}
                  className="rounded-lg bg-black/30 p-4 text-center group hover:bg-green-500/10 transition-colors duration-300"
                >
                  <div className="font-punch text-4xl font-bold text-green-400 mb-1 group-hover:scale-110 transition-transform duration-300">
                    {step.num}
                  </div>
                  <div className="text-xs text-zinc-400 whitespace-pre-line">
                    {step.text}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Image 2 - AI guide */}
          <div className="image-frame border border-white/8">
            <Image
              src="/jarvis-ai-guide.webp"
              alt="Split screen: Claude guiando instalação + terminal com JARVIS"
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
