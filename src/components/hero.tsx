"use client";

import { useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  function toggleVideo() {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setPlaying(true);
    } else {
      videoRef.current.pause();
      setPlaying(false);
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-28 pb-16">
      {/* Green glow orb */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-green-500/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 text-center">
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
          <span className="text-gradient-green">Tudo liga sozinho.</span>
        </h1>

        {/* Subline */}
        <p className="animate-fade-in-up delay-200 mt-6 max-w-xl mx-auto text-base sm:text-lg text-zinc-400 leading-relaxed">
          O kit completo pra transformar seu computador no Jarvis do Tony Stark.
          Automação por palmas e voz, pronta pra rodar em 5 minutos.
        </p>

        {/* Video */}
        <div className="animate-fade-in-up delay-300 mt-10 max-w-2xl mx-auto rounded-2xl overflow-hidden border border-green-500/10 relative group cursor-pointer" onClick={toggleVideo}>
          <video
            ref={videoRef}
            src="/video-site.mp4"
            className="w-full aspect-video object-cover"
            playsInline
            onEnded={() => setPlaying(false)}
          />
          <div className={`absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity duration-300 ${playing ? "opacity-0 group-hover:opacity-100" : "opacity-100"}`}>
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-500 flex items-center justify-center green-glow">
              {playing ? (
                <Pause className="h-6 w-6 sm:h-7 sm:w-7 text-black" />
              ) : (
                <Play className="h-6 w-6 sm:h-7 sm:w-7 text-black ml-1" />
              )}
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="animate-fade-in-up delay-400 mt-10 flex items-baseline justify-center gap-2">
          <span className="font-heading text-5xl sm:text-6xl font-extrabold text-green-400">R$19</span>
          <span className="font-heading text-2xl sm:text-3xl font-semibold text-green-400">,90</span>
        </div>

        {/* CTAs */}
        <div className="animate-fade-in-up delay-500 mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="https://pay.kiwify.com.br/D3Ari3v"
            className="group inline-flex items-center gap-2 rounded-xl bg-green-500 px-10 py-4 text-base font-bold text-black transition-all duration-200 hover:bg-green-400 hover:-translate-y-0.5 cursor-pointer green-glow"
          >
            QUERO O JARVIS KIT &rarr;
          </a>
          <a
            href="#como-funciona"
            className="inline-flex items-center gap-2 rounded-xl border border-green-500/30 bg-transparent px-6 py-4 text-sm font-medium text-green-400 transition-all duration-200 hover:border-green-400 hover:bg-green-500/5 cursor-pointer"
          >
            &darr; Como funciona
          </a>
        </div>
      </div>
    </section>
  );
}
