"use client";

import Image from "next/image";
import Link from "next/link";
import { Inter, Onest, Geist_Mono } from "next/font/google";
import { DottedSurface } from "@/components/ui/dotted-surface-lazy";

// Identidade v2 (Lime #C6FF34 + Inter/Onest/Geist Mono) escopada só a esta
// seção — o resto do site ainda está na identidade antiga (MASTER.md /
// Electric Green), então os tokens globais não são tocados aqui.
const v2Display = Inter({
  variable: "--v2-font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const v2Body = Onest({
  variable: "--v2-font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const v2Mono = Geist_Mono({
  variable: "--v2-font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const PRODUCTS = [
  {
    id: "segundo-cerebro",
    href: "/kit-segundo-cerebro",
    cover: "/capa-segundo-cerebro.webp",
    eyebrow: "Kit digital · Passo a passo completo",
    title: "Kit Segundo Cérebro",
    description:
      "Pare de repetir contexto toda vez que abre o Claude Code. Instale o kit e ele passa a lembrar seus projetos, decisões e preferências sozinho — sessão após sessão.",
    cta: "Acessar o kit",
  },
  {
    id: "club",
    href: "/club",
    cover: "/club/capa-infuser-club.webp",
    eyebrow: "Comunidade · Recorrente",
    title: "Infuser Club",
    description:
      "Calls ao vivo toda semana, desafio quinzenal com freelance real e 4 bônus pra quem quer viver de IA. A partir de R$57/mês no plano anual.",
    cta: "Entrar para o Club",
  },
  {
    id: "servico",
    href: "/diagnostico",
    cover: "/capa-servico-personalizado.webp",
    eyebrow: "Serviço personalizado · Sob aplicação",
    title:
      "Contrate meu serviço para criar seu segundo cérebro e automatizar seus processos",
    description:
      "São 14 perguntas e leva uns 3 minutos. Se fizer sentido pros dois lados, você escolhe na hora o horário de uma call de uma hora, e depois recebe o mapa da sua operação por escrito.",
    cta: "Fazer o diagnóstico",
  },
];

export function ProductSelector() {
  return (
    <section
      className={`${v2Display.variable} ${v2Body.variable} ${v2Mono.variable} relative min-h-screen flex items-center justify-center overflow-hidden py-16 sm:py-24`}
      style={{ fontFamily: "var(--v2-font-body)" }}
    >
      {/* 3D dotted surface background */}
      <DottedSurface />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 text-center">
        {/* Logo — v2 (lockup com acento Lime) */}
        <div className="animate-fade-in-up mb-12">
          <Image
            src="/lockup-v2-oficial.svg"
            alt="Infuser"
            width={280}
            height={72}
            className="h-16 sm:h-20 w-auto mx-auto"
          />
        </div>

        {/* Eyebrow */}
        <div className="animate-fade-in-up inline-flex items-center gap-3 mb-6">
          <span className="h-px w-5 bg-[#C6FF34]" />
          <span
            className="text-[11px] uppercase tracking-[0.15em] bg-gradient-to-r from-[#C6FF34] to-[#3BD0A0] bg-clip-text text-transparent"
            style={{ fontFamily: "var(--v2-font-mono)" }}
          >
            Escolha seu caminho
          </span>
          <span className="h-px w-5 bg-[#C6FF34]" />
        </div>

        {/* Headline — não fala mais em "kit" (agora tem produto + comunidade + serviço) */}
        <h1
          className="animate-fade-in-up delay-100 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] mb-4"
          style={{ fontFamily: "var(--v2-font-display)" }}
        >
          Como você quer começar?
        </h1>

        {/* Subline */}
        <p className="animate-fade-in-up delay-200 text-[15px] text-zinc-400 max-w-md mx-auto mb-12">
          Selecione a opção que vai transformar sua rotina.
        </p>

        {/* Product cards grid — mesma estrutura pros 3 itens, altura igualada por items-stretch + CTA fixado embaixo */}
        <div className="animate-fade-in-up delay-300 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 items-stretch">
          {PRODUCTS.map((product) => {
            const cardClassName =
              "group relative flex flex-col rounded-lg border border-white/10 bg-black/60 backdrop-blur shadow-lg overflow-hidden text-left transition-all duration-200 hover:scale-[1.02] hover:bg-black/50 cursor-pointer";

            const cardContent = (
              <>
                {/* Cover */}
                <div className="relative aspect-[16/9] flex items-center justify-center bg-gradient-to-br from-[#C6FF34]/15 via-[#C6FF34]/[0.04] to-transparent border-b border-white/10 overflow-hidden">
                  <Image
                    src={product.cover}
                    alt={product.title}
                    width={800}
                    height={450}
                    sizes="(max-width: 640px) 100vw, 320px"
                    quality={80}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-4 sm:p-6">
                  <div className="inline-flex items-center gap-2 mb-3 px-2.5 py-1 rounded-full bg-[#C6FF34]/15 border border-[#C6FF34]/30 self-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF34] animate-pulse" />
                    <span
                      className="text-[10px] uppercase tracking-widest text-[#3BD0A0]"
                      style={{ fontFamily: "var(--v2-font-mono)" }}
                    >
                      {product.eyebrow}
                    </span>
                  </div>
                  <h2
                    className="text-lg sm:text-xl font-bold text-[#C6FF34] mb-2 leading-snug"
                    style={{ fontFamily: "var(--v2-font-display)" }}
                  >
                    {product.title}
                  </h2>
                  <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                    {product.description}
                  </p>
                  <div className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-[#C6FF34] opacity-80 group-hover:opacity-100 transition-opacity self-start">
                    {product.cta}{" "}
                    <span className="transition-transform group-hover:translate-x-1">
                      &rarr;
                    </span>
                  </div>
                </div>
              </>
            );

            if (product.href.startsWith("http")) {
              return (
                <a
                  key={product.id}
                  href={product.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cardClassName}
                >
                  {cardContent}
                </a>
              );
            }

            return (
              <Link key={product.id} href={product.href} className={cardClassName}>
                {cardContent}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
