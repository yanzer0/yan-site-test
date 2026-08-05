"use client";

import { useEffect, useRef } from "react";
import { scrollToContact } from "@/lib/scroll-to-contact";

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Pausa o video quando ele sai da tela. Video em loop decodificando fora de
  // vista queima CPU/bateria a toa e e o que mais trava celular fraco.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-28 pb-16">
      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 text-center">

        {/* Headline */}
        <h1 className="animate-fade-in-up delay-100 font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
          Duas palmas.
          <br />
          <span className="font-punch text-gradient-green">Tudo liga sozinho.</span>
        </h1>

        {/* Subline */}
        <p className="animate-fade-in-up delay-200 mt-6 max-w-xl mx-auto text-base sm:text-lg text-zinc-400 leading-relaxed">
          O Jarvis do Tony Stark, em script pronto.
          Toca música, abre app, roda automação.
          Com duas palmas ou um comando de voz. <span className="text-gradient-green font-semibold">Instalado em 5 minutos, mesmo sem entender nada de programação.</span>
        </p>

        {/* Video */}
        <div className="animate-fade-in-up delay-300 mt-10 max-w-2xl mx-auto rounded-lg overflow-hidden border border-green-500/10">
          <video
            ref={videoRef}
            src="/video-site.mp4"
            poster="/video-site-poster.jpg"
            className="w-full aspect-video object-cover"
            autoPlay
            loop
            muted
            playsInline
            preload="none"
            disableRemotePlayback
          />
        </div>

        {/* CTAs */}
        <div className="animate-fade-in-up delay-400 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#contact"
            onClick={scrollToContact}
            className="group inline-flex items-center gap-2 rounded-lg bg-green-500 px-10 py-4 text-base font-bold text-black transition-all duration-200 hover:bg-green-400 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(168,232,76,0.3)] cursor-pointer green-glow"
          >
            QUERO O JARVIS KIT <span className="transition-transform duration-200 group-hover:translate-y-1">&darr;</span>
          </a>
        </div>
      </div>
    </section>
  );
}
