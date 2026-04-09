"use client";

import Image from "next/image";
import { DottedSurface } from "@/components/ui/dotted-surface";

interface ProductSelectorProps {
  onSelect: (kit: "jarvis" | "segundo-cerebro") => void;
}

const PRODUCTS = [
  {
    id: "jarvis" as const,
    cover: "/capa-jarvis.webp",
    title: "Kit Jarvis",
    subtitle: "Automação por palmas e voz",
    borderClass: "border-green-500/30 hover:border-green-400",
    titleClass: "text-green-400",
  },
  {
    id: "segundo-cerebro" as const,
    cover: "/capa-segundo-cerebro.webp",
    title: "Kit Segundo Cérebro",
    subtitle: "Memória permanente pro Claude Code",
    borderClass: "border-green-500/30 hover:border-green-400",
    titleClass: "text-green-400",
  },
] as const;

export function ProductSelector({ onSelect }: ProductSelectorProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* 3D dotted surface background */}
      <DottedSurface />

      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 text-center">
        {/* Logo */}
        <div className="animate-fade-in-up mb-12">
          <Image
            src="/lockup-sem-fundo.png"
            alt="Infuser"
            width={280}
            height={72}
            className="h-16 sm:h-20 w-auto mx-auto"
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

        {/* Product cards grid — always side by side */}
        <div className="animate-fade-in-up delay-300 grid grid-cols-2 gap-3 sm:gap-6">
          {PRODUCTS.map((product) => (
            <button
              key={product.id}
              onClick={() => onSelect(product.id)}
              className={`group relative rounded-lg border bg-black/60 backdrop-blur shadow-lg overflow-hidden text-left transition-all duration-300 hover:scale-[1.02] hover:bg-black/50 cursor-pointer ${
                product.id === "segundo-cerebro"
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
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Text content */}
              <div className="p-3 sm:p-6">
                <h2 className={`font-heading text-sm sm:text-2xl font-bold ${product.titleClass} mb-1 sm:mb-2`}>
                  {product.title}
                </h2>
                <p className="text-[11px] sm:text-sm text-zinc-400 leading-snug">
                  {product.subtitle}
                </p>
                <div className={`mt-2 sm:mt-4 inline-flex items-center gap-1 sm:gap-2 text-[11px] sm:text-sm font-medium ${product.titleClass} opacity-60 group-hover:opacity-100 transition-opacity`}>
                  Acessar <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
                </div>
              </div>

              {/* Destaque badge for Segundo Cérebro */}
              {product.id === "segundo-cerebro" && (
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 rounded-full bg-green-500 px-2 py-0.5 sm:px-3 sm:py-1 text-[9px] sm:text-[11px] font-bold text-black uppercase tracking-wider">
                  Novo
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
