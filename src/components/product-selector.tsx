"use client";

import Image from "next/image";
import Link from "next/link";
import { DottedSurface } from "@/components/ui/dotted-surface-lazy";

const PRODUCTS = [
  {
    id: "jarvis" as const,
    href: "/kit-jarvis",
    cover: "/capa-jarvis.webp",
    title: "Kit Jarvis",
    subtitle: "Automação por palmas e voz",
    titleClass: "text-green-400",
    badge: null,
  },
  {
    id: "segundo-cerebro" as const,
    href: "/kit-segundo-cerebro",
    cover: "/capa-segundo-cerebro.webp",
    title: "Kit Segundo Cérebro",
    subtitle: "Memória permanente pro Claude Code",
    titleClass: "text-green-400",
    badge: null,
  },
  {
    id: "kit-skills" as const,
    href: "/kit-skills",
    cover: "/capa-kit-skills.webp",
    title: "Pack de Skills",
    subtitle: "10 superpoderes pro Claude Code",
    titleClass: "text-green-400",
    badge: "Novo",
  },
] as const;

export function ProductSelector() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* 3D dotted surface background */}
      <DottedSurface />

      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 text-center">
        {/* Logo */}
        <div className="animate-fade-in-up mb-12">
          <Image
            src="/lockup-sem-fundo.svg"
            alt="Infuser"
            width={280}
            height={72}
            className="h-16 sm:h-20 w-auto mx-auto"
          />
        </div>

        {/* Eyebrow */}
        <div className="animate-fade-in-up inline-flex items-center gap-3 mb-6">
          <span className="h-px w-5 bg-green-400" />
          <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-gradient-green">
            Escolha seu kit
          </span>
          <span className="h-px w-5 bg-green-400" />
        </div>

        {/* Headline */}
        <h1 className="animate-fade-in-up delay-100 font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] mb-4">
          Qual kit você quer?
        </h1>

        {/* Subline */}
        <p className="animate-fade-in-up delay-200 text-[15px] text-zinc-400 max-w-md mx-auto mb-12">
          Selecione o produto que vai transformar sua rotina.
        </p>

        {/* Product cards grid */}
        <div className="animate-fade-in-up delay-300 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
          {PRODUCTS.map((product) => (
            <Link
              key={product.id}
              href={product.href}
              className={`group relative rounded-lg border bg-black/60 backdrop-blur shadow-lg overflow-hidden text-left transition-all duration-200 hover:scale-[1.02] hover:bg-black/50 cursor-pointer ${
                product.badge
                  ? "border-green-500/40 ring-1 ring-green-500/20"
                  : "border-white/10"
              }`}
            >
              {/* Cover image */}
              <div className="aspect-[16/9] overflow-hidden">
                <Image
                  src={product.cover}
                  alt={product.title}
                  width={800}
                  height={450}
                  sizes="(max-width: 640px) 100vw, 300px"
                  quality={80}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Text content */}
              <div className="p-4 sm:p-6">
                <h2 className={`font-heading text-lg sm:text-2xl font-bold ${product.titleClass} mb-1 sm:mb-2`}>
                  {product.title}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 leading-snug">
                  {product.subtitle}
                </p>
                <div className={`mt-3 sm:mt-4 inline-flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium ${product.titleClass} opacity-60 group-hover:opacity-100 transition-opacity`}>
                  Acessar <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
                </div>
              </div>

              {/* Badge */}
              {product.badge && (
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 rounded-full bg-green-500 px-2 py-0.5 sm:px-3 sm:py-1 text-[9px] sm:text-[11px] font-bold text-black uppercase tracking-wider">
                  {product.badge}
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* Comunidade — horizontal card (desktop) / stacked (mobile) */}
        <Link
          href="/comunidade"
          className="animate-fade-in-up delay-400 group block mt-4 sm:mt-6 rounded-lg border border-green-500/30 bg-black/60 backdrop-blur shadow-lg overflow-hidden text-left transition-all duration-200 hover:scale-[1.01] hover:bg-black/50 ring-1 ring-green-500/15 cursor-pointer"
        >
          <div className="flex flex-col sm:flex-row sm:items-stretch">
            {/* Visual side */}
            <div className="relative flex items-center justify-center bg-gradient-to-br from-green-500/15 via-green-500/[0.04] to-transparent border-b sm:border-b-0 sm:border-r border-white/10 p-8 sm:p-10 sm:w-[38%] sm:flex-shrink-0">
              <div className="text-center">
                <div className="font-punch text-6xl sm:text-7xl font-extrabold text-gradient-green leading-none mb-2">
                  50
                </div>
                <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-green-300/80">
                  vagas abertas
                </div>
              </div>
              {/* Decorative dots */}
              <div className="absolute top-3 left-3 w-1.5 h-1.5 rounded-full bg-green-400/40" />
              <div className="absolute bottom-3 right-3 w-1.5 h-1.5 rounded-full bg-green-400/40" />
            </div>

            {/* Content side */}
            <div className="flex-1 p-5 sm:p-8">
              <div className="inline-flex items-center gap-2 mb-3 px-2.5 py-1 rounded-full bg-green-500/15 border border-green-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-green-300">
                  Gratuito &middot; Comunidade
                </span>
              </div>
              <h2 className="font-heading text-xl sm:text-2xl md:text-3xl font-bold text-green-400 mb-2 leading-tight">
                Comunidade Infuser
              </h2>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed mb-4">
                O único grupo de IA onde a regra é aplicar, não acumular link.
                Resumo semanal, calls fechadas e gente testando IA de verdade.
              </p>
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-green-400 opacity-80 group-hover:opacity-100 transition-opacity">
                Entrar na comunidade{" "}
                <span className="transition-transform group-hover:translate-x-1">
                  &rarr;
                </span>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
