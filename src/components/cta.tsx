"use client";

import Image from "next/image";
import { ShieldCheck, Download, Lock } from "lucide-react";
import { useScrollReveal } from "@/lib/use-scroll-reveal";

const GUARANTEES = [
  {
    Icon: ShieldCheck,
    title: "7 dias de garantia incondicional",
    desc: "Não gostou? Devolve o dinheiro, sem pergunta.",
  },
  {
    Icon: Download,
    title: "Entrega imediata",
    desc: "Download direto, sem fila, sem login.",
  },
  {
    Icon: Lock,
    title: "Pagamento único",
    desc: "Sem assinatura, sem cobrança recorrente.",
  },
] as const;

export function CTA() {
  const ref = useScrollReveal();

  return (
    <>
      <div className="section-divider" />
      <section id="contact" className="py-24 sm:py-32 relative">
        {/* Glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-green-500/[0.06] blur-[180px] pointer-events-none" />

        <div ref={ref} className="scroll-reveal relative z-10 mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Seu Jarvis.
            <br />
            <span className="font-punch text-gradient-green">R$19,90.</span>
          </h2>

          <p className="text-[15px] text-zinc-400 max-w-md mx-auto mb-8">
            Código completo (Windows + Mac). Guias visuais. Guias de IA que te
            ensinam como um professor particular. <span className="text-gradient-green font-semibold">Personalize em 5 minutos.</span>
          </p>

          {/* Guarantee card — promoted from small grey line */}
          <div className="max-w-xl mx-auto mb-8 rounded-xl border border-white/8 bg-white/[0.02] p-5 sm:p-6 text-left">
            <ul className="flex flex-col gap-4">
              {GUARANTEES.map(({ Icon, title, desc }) => (
                <li key={title} className="flex items-start gap-3">
                  <span
                    className="flex-shrink-0 mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/8 border border-green-500/15"
                    aria-hidden="true"
                  >
                    <Icon className="h-4 w-4 text-green-400" />
                  </span>
                  <div>
                    <div className="font-heading text-[14px] font-semibold text-white leading-snug">
                      {title}
                    </div>
                    <div className="text-[13px] text-zinc-400 leading-snug mt-0.5">
                      {desc}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <a
            href="https://pay.wiapy.com/0O6xF70BVe"
            className="group inline-flex items-center gap-2 rounded-lg bg-green-500 px-12 py-5 text-lg font-bold text-black transition-all duration-200 hover:bg-green-400 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(168,232,76,0.3)] cursor-pointer"
          >
            QUERO O JARVIS KIT — R$19,90 <span className="transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
          </a>

          {/* Image 4 - Product mockup */}
          <div className="mt-10 max-w-lg mx-auto image-frame border border-white/8">
            <Image
              src="/jarvis-product-mockup.webp"
              alt="Mockup do JARVIS Kit"
              width={1400}
              height={788}
              sizes="(max-width: 768px) 100vw, 700px"
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>
    </>
  );
}
