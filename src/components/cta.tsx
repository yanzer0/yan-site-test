import Image from "next/image";

export function CTA() {
  return (
    <section id="contact" className="py-24 sm:py-32 relative">
      {/* Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-green-500/[0.04] blur-[150px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          Duas palmas.
          <br />
          <span className="font-punch text-gradient-green">R$19,90.</span>
        </h2>

        <p className="text-[15px] text-zinc-400 max-w-md mx-auto mb-8">
          Código completo (Windows + Mac). Guias visuais. Guias de IA que te
          ensinam como um professor particular. <span className="text-gradient-green font-semibold">Personalize em 5 minutos.</span>
        </p>

        {/* Price */}
        <div className="flex items-baseline justify-center gap-2 mb-8">
          <span className="font-punch text-5xl sm:text-6xl font-extrabold text-gradient-green">
            R$19
          </span>
          <span className="font-punch text-2xl sm:text-3xl font-semibold text-gradient-green">
            ,90
          </span>
        </div>

        <a
          href="https://pay.kiwify.com.br/D3Ari3v"
          className="group inline-flex items-center gap-2 rounded-lg bg-green-500 px-12 py-5 text-lg font-bold text-black transition-all duration-200 hover:bg-green-400 hover:-translate-y-0.5 cursor-pointer animate-pulse-glow"
        >
          QUERO O JARVIS KIT &rarr;
        </a>

        <p className="font-mono text-[13px] text-zinc-500 mt-5">
          7 dias de garantia &middot; Entrega imediata &middot; Download direto
        </p>

        {/* Image 4 - Product mockup */}
        <div className="mt-10 max-w-lg mx-auto rounded-lg overflow-hidden border border-green-500/10">
          <Image
            src="/jarvis-product-mockup.png"
            alt="Mockup do JARVIS Kit"
            width={1400}
            height={788}
            className="w-full h-auto"
          />
        </div>
      </div>
    </section>
  );
}
