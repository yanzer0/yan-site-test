"use client";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-28 pb-16">
      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 text-center">
        {/* Eyebrow */}
        <div className="animate-fade-in-up inline-flex items-center gap-3 mb-8">
          <span className="h-px w-5 bg-green-400" />
          <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-green-400">
            Mais de 50 mil views no Instagram
          </span>
          <span className="h-px w-5 bg-green-400" />
        </div>

        {/* Headline */}
        <h1 className="animate-fade-in-up delay-100 font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
          Duas palmas.
          <br />
          <span className="font-punch text-gradient-green">Tudo liga sozinho.</span>
        </h1>

        {/* Subline */}
        <p className="animate-fade-in-up delay-200 mt-6 max-w-xl mx-auto text-base sm:text-lg text-zinc-400 leading-relaxed">
          O kit completo pra transformar seu computador no Jarvis do Tony Stark.
          Automação por palmas e voz, pronta pra rodar <span className="text-gradient-green font-semibold">em 5 minutos.</span>
        </p>

        {/* Video */}
        <div className="animate-fade-in-up delay-300 mt-10 max-w-2xl mx-auto rounded-lg overflow-hidden border border-green-500/10">
          <video
            src="/video-site.mp4"
            poster="/video-site-poster.jpg"
            className="w-full aspect-video object-cover"
            autoPlay
            loop
            muted
            playsInline
            preload="none"
          />
        </div>

        {/* CTAs */}
        <div className="animate-fade-in-up delay-400 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="https://pay.wiapy.com/0O6xF70BVe"
            className="group inline-flex items-center gap-2 rounded-lg bg-green-500 px-10 py-4 text-base font-bold text-black transition-all duration-200 hover:bg-green-400 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(168,232,76,0.3)] cursor-pointer green-glow"
          >
            QUERO O JARVIS KIT <span className="transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
          </a>
          <a
            href="#como-funciona"
            className="inline-flex items-center gap-2 rounded-lg border border-green-500/30 bg-transparent px-6 py-4 text-sm font-medium text-green-400 transition-all duration-200 hover:border-green-400 hover:bg-green-500/5 cursor-pointer"
          >
            &darr; Como funciona
          </a>
        </div>
      </div>
    </section>
  );
}
