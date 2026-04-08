"use client";

import Image from "next/image";
import { Brain } from "lucide-react";

interface ProductSelectorProps {
  onSelect: (kit: "jarvis" | "segundo-cerebro") => void;
}

const PRODUCTS = [
  {
    id: "jarvis" as const,
    icon: "/jarvis-product-mockup.png",
    title: "Kit Jarvis",
    subtitle: "Automação por palmas e voz",
    accent: "green",
    borderClass: "border-green-500/30 hover:border-green-400",
    glowClass: "green-glow-sm",
    titleClass: "text-green-400",
    bgGlow: "bg-green-500/5",
  },
  {
    id: "segundo-cerebro" as const,
    icon: null,
    title: "Kit Segundo Cérebro",
    subtitle: "Memória permanente pro Claude Code",
    accent: "green",
    borderClass: "border-green-500/30 hover:border-green-400",
    glowClass: "green-glow-sm",
    titleClass: "text-green-400",
    bgGlow: "bg-green-500/5",
  },
] as const;

export function ProductSelector({ onSelect }: ProductSelectorProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Dual glow orbs */}
      <div className="absolute top-1/3 left-1/3 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-green-500/8 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/3 translate-x-1/2 w-[400px] h-[400px] rounded-full bg-green-500/8 blur-[120px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 text-center">
        {/* Logo */}
        <div className="animate-fade-in-up mb-12">
          <Image
            src="/lockup-sem-fundo.png"
            alt="Infuser"
            width={140}
            height={36}
            className="h-9 w-auto mx-auto"
          />
        </div>

        {/* Eyebrow */}
        <div className="animate-fade-in-up inline-flex items-center gap-3 mb-6">
          <span className="h-px w-5 bg-zinc-600" />
          <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-zinc-500">
            Escolha seu kit
          </span>
          <span className="h-px w-5 bg-zinc-600" />
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
        <div className="animate-fade-in-up delay-300 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {PRODUCTS.map((product) => (
            <button
              key={product.id}
              onClick={() => onSelect(product.id)}
              className={`group relative rounded-lg border ${product.borderClass} bg-white/[0.02] p-8 sm:p-10 text-left transition-all duration-300 hover:scale-[1.02] hover:${product.bgGlow} cursor-pointer`}
            >
              {/* Icon area */}
              <div className="mb-6 flex items-center justify-center">
                {product.icon ? (
                  <div className="w-20 h-20 rounded-lg overflow-hidden border border-white/10">
                    <Image
                      src={product.icon}
                      alt={product.title}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                    <Brain className="h-8 w-8 text-green-400" />
                  </div>
                )}
              </div>

              {/* Title */}
              <h2 className={`font-heading text-xl sm:text-2xl font-bold ${product.titleClass} mb-2`}>
                {product.title}
              </h2>

              {/* Subtitle */}
              <p className="text-sm text-zinc-400">
                {product.subtitle}
              </p>

              {/* Arrow indicator */}
              <div className={`mt-6 inline-flex items-center gap-2 text-sm font-medium ${product.titleClass} opacity-60 group-hover:opacity-100 transition-opacity`}>
                Acessar <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
