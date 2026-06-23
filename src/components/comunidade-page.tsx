"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FallingPattern } from "@/components/ui/falling-pattern-lazy";
import { useScrollReveal } from "@/lib/use-scroll-reveal";

const FORM_EMBED_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfIzCE99NYKhOgakUnY3qr_vjubCF4BqmAbhmk1SCHdUokTCw/viewform?embedded=true";

const PRODUCTS = [
  {
    cover: "/capa-jarvis.webp",
    title: "Jarvis Kit",
    tagline: "Duas palmas. Tudo liga sozinho.",
    price: "R$19,90",
    priceLabel: "pagamento único",
    description:
      "Kit de automação por palmas e voz. Você bate palma, o computador toca música, abre app, executa o que você configurar. Instala em 5 minutos.",
    bullets: [
      "Curte tecnologia mas não vive programando",
      "Quer testar algo concreto e impressionante antes de ir fundo",
      "Quer mostrar pra família e amigos algo que parece ficção científica",
    ],
    href: "/kit-jarvis",
    cta: "Conhecer o Jarvis Kit",
  },
  {
    cover: "/capa-kit-skills.webp",
    title: "Pack de Skills",
    tagline: "10 skills curadas entre 69.000.",
    price: "R$29,90",
    priceLabel: "de R$67",
    description:
      "Skills são arquivos que transformam o Claude num especialista (designer, copywriter, auditor de SEO, testador). Passei semanas filtrando entre 69.000 pra montar as 10 que uso todo dia. Vem com instalador visual.",
    bullets: [
      "Já usa Claude Code (ou tá começando)",
      "Quer parar de entregar projeto que parece feito por IA",
      "Não quer perder semanas garimpando GitHub em inglês",
    ],
    href: "/kit-skills",
    cta: "Conhecer o Pack de Skills",
  },
  {
    cover: "/capa-segundo-cerebro.webp",
    title: "Kit Segundo Cérebro",
    tagline: "Configura uma vez. Nunca mais esquece.",
    price: "R$67",
    priceLabel: "antes R$127",
    description:
      "Sistema completo de memória permanente pro Claude Code. Ele passa a lembrar quem você é, o que faz, em quais projetos tá, e quais decisões já tomou. Sem você re-explicar nada.",
    bullets: [
      "Usa Claude Code todo dia e perde 5 a 10 minutos dando contexto",
      "Quer transformar o Claude num sócio que lembra tudo",
      "Tá disposto a investir 30 a 60 minutos de setup inicial",
    ],
    href: "/kit-segundo-cerebro",
    cta: "Conhecer o Segundo Cérebro",
  },
] as const;

function Hero() {
  return (
    <section className="relative pt-32 pb-12 sm:pt-40 sm:pb-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <div className="animate-fade-in-up inline-flex items-center gap-3 mb-8">
          <span className="h-px w-5 bg-green-400" />
          <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-green-400">
            Comunidade gratuita
          </span>
          <span className="h-px w-5 bg-green-400" />
        </div>

        <h1 className="animate-fade-in-up delay-100 font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
          A comunidade gratuita da Infuser.{" "}
          <span className="font-punch text-gradient-green">
            Aberta a todo mundo.
          </span>
        </h1>

        <p className="animate-fade-in-up delay-200 mt-6 max-w-2xl mx-auto text-base sm:text-lg text-zinc-400 leading-relaxed">
          O lugar pra ficar perto de quem está construindo com IA de verdade.
          Troca de resultados, prompts que funcionam, dúvidas respondidas e as
          novidades que importam, antes do mercado reagir. De graça.
        </p>

        <div className="animate-fade-in-up delay-300 mt-10 flex justify-center">
          <a
            href="#formulario"
            className="group inline-flex items-center gap-2 rounded-lg bg-green-500 px-10 py-4 text-base font-bold text-black transition-all duration-200 hover:bg-green-400 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(168,232,76,0.3)] cursor-pointer green-glow"
          >
            Entrar na comunidade{" "}
            <span className="transition-transform duration-200 group-hover:translate-x-1">
              &rarr;
            </span>
          </a>
        </div>

        <p className="animate-fade-in-up delay-400 mt-4 font-mono text-[12px] text-green-300/60">
          Gratuito &middot; Leva 90 segundos &middot; Sem call de vendas
        </p>
      </div>
    </section>
  );
}

function NotDeadGroup() {
  const ref = useScrollReveal();
  return (
    <>
      <div className="section-divider" />
      <section className="py-20 sm:py-24 bg-black/80">
        <div ref={ref} className="scroll-reveal-stagger mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-8">
            Não é mais um{" "}
            <span className="font-punch text-gradient-green">
              grupo morto
            </span>{" "}
            de WhatsApp.
          </h2>

          <div className="space-y-5 text-[15px] text-zinc-400 leading-relaxed">
            <p>
              Você já entrou em dezenas de grupos que viraram cemitério de bom
              dia e link de divulgação. Esse não é o caso.
            </p>
            <p>
              Aqui a conversa é sobre construir: o que funcionou essa semana,
              qual prompt destravou, onde travou e como resolveu. Gente aplicando
              IA, não só falando sobre.
            </p>
            <p className="text-white font-semibold">
              É de graça e é aberta a todo mundo. Mas é feita pra quem quer
              colocar a mão na massa, não pra quem só quer mais um grupo no
              celular.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function WhatsInside() {
  const ref = useScrollReveal();
  const ITEMS = [
    {
      title: "Troca que vale",
      text: "Prompts que funcionam, o que está dando certo, o que não vale a pena e dúvidas respondidas por quem já passou por isso.",
    },
    {
      title: "Novidades sem ruído",
      text: "As novidades de IA que importam, filtradas. Você não precisa acompanhar 50 perfis pra saber o que mudou.",
    },
    {
      title: "Gente construindo de verdade",
      text: "De iniciante a quem já vive disso. O ambiente certo pra você não travar sozinho e ver como os outros estão resolvendo.",
    },
    {
      title: "Por dentro da operação",
      text: "Um canal direto pra acompanhar o que a Infuser está fazendo na prática, não só o que dá pra mostrar publicamente.",
    },
  ];
  return (
    <>
      <div className="section-divider" />
      <section className="py-20 sm:py-24">
        <div ref={ref} className="scroll-reveal-stagger mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-10 text-center">
            O que você encontra{" "}
            <span className="font-punch text-gradient-green">lá dentro</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ITEMS.map((item) => (
              <div key={item.title} className="glass p-6 card-hover">
                <h3 className="font-heading text-lg font-bold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-[14px] text-zinc-400 leading-relaxed">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function WhyFree() {
  const ref = useScrollReveal();
  return (
    <>
      <div className="section-divider" />
      <section className="py-20 sm:py-24 bg-black/80">
        <div ref={ref} className="scroll-reveal-stagger mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-8">
            Por que é{" "}
            <span className="font-punch text-gradient-green">de graça</span>?
          </h2>

          <div className="space-y-5 text-[15px] text-zinc-400 leading-relaxed">
            <p>
              Honestidade total: a comunidade gratuita existe pra reunir quem
              constrói com IA e fortalecer esse ambiente. Sem custo, sem call de
              vendas escondida.
            </p>
            <p>
              Se um dia você quiser ir mais fundo (calls ao vivo toda semana,
              desafios pagos com a Infuser, curso do Claude do zero), existe o{" "}
              <a
                href="https://club.useinfuser.com"
                className="text-gradient-green font-semibold hover:underline"
              >
                Infuser Club
              </a>
              . Mas isso é totalmente opcional.
            </p>
            <p className="text-white font-semibold">
              A comunidade gratuita continua sendo gratuita. Você entra, troca e
              constrói sem pagar nada.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function FormSection() {
  const ref = useScrollReveal();
  const loadCount = useRef(0);
  const [submitted, setSubmitted] = useState(false);

  const handleIframeLoad = () => {
    loadCount.current += 1;
    if (loadCount.current > 1) {
      setSubmitted(true);
    }
  };

  return (
    <>
      <div className="section-divider" />
      <section id="formulario" className="py-20 sm:py-24">
        <div ref={ref} className="scroll-reveal-stagger mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-center mb-3">
            Entra na comunidade
          </h2>
          <p className="text-center text-[15px] text-zinc-400 mb-10">
            Preenche o cadastro abaixo (leva menos de 90 segundos) e você recebe
            o acesso. De graça, sem call de vendas.
          </p>

          <div className="rounded-lg border border-green-500/15 bg-[#0d0d0d] overflow-hidden">
            <iframe
              src={FORM_EMBED_URL}
              title="Cadastro Comunidade Gratuita Infuser"
              className="w-full"
              style={{ height: "1200px", border: 0 }}
              loading="lazy"
              onLoad={handleIframeLoad}
            >
              Carregando formulário...
            </iframe>
          </div>

          <div
            className={`mt-10 text-center transition-all duration-500 ${
              submitted
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4 pointer-events-none h-0 overflow-hidden mt-0"
            }`}
            aria-hidden={!submitted}
          >
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30">
              <span className="text-green-400 text-sm">&#10003;</span>
              <span className="font-mono text-[12px] uppercase tracking-widest text-green-300">
                Tá dentro
              </span>
            </div>
            <p className="text-[15px] text-zinc-300 max-w-md mx-auto leading-relaxed">
              Pronto. Você recebe o acesso à comunidade no contato que cadastrou.
              Pode fechar essa página.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function ProductOffer() {
  const ref = useScrollReveal();
  return (
    <>
      <div className="section-divider" />
      <section className="py-20 sm:py-28">
        <div ref={ref} className="scroll-reveal-stagger mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-3 mb-6">
              <span className="h-px w-5 bg-green-400/40" />
              <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-green-400/70">
                Pra ir começando
              </span>
              <span className="h-px w-5 bg-green-400/40" />
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-5">
              Dá uma olhada{" "}
              <span className="font-punch text-gradient-green">nisso</span>.
            </h2>
            <p className="text-[15px] text-zinc-400 leading-relaxed">
              3 coisas que a galera da comunidade já está usando. E que você pode
              começar a aplicar HOJE.
            </p>
            <p className="mt-4 text-[13px] text-zinc-500 italic">
              Não é amarrado à comunidade. Mas se você quer aplicar IA agora, é o
              caminho mais curto que eu conheço.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PRODUCTS.map((product) => (
              <Link
                key={product.title}
                href={product.href}
                className="group flex flex-col rounded-lg border border-white/10 bg-black/60 backdrop-blur overflow-hidden card-hover cursor-pointer"
              >
                <div className="aspect-[16/10] overflow-hidden border-b border-white/5">
                  <Image
                    src={product.cover}
                    alt={product.title}
                    width={800}
                    height={500}
                    sizes="(max-width: 768px) 100vw, 400px"
                    quality={85}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                <div className="flex-1 flex flex-col p-6">
                  <h3 className="font-heading text-xl font-bold text-white mb-1">
                    {product.title}
                  </h3>
                  <p className="font-mono text-[11px] uppercase tracking-widest text-green-400/70 mb-4">
                    {product.tagline}
                  </p>

                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="font-punch text-3xl font-extrabold text-gradient-green">
                      {product.price}
                    </span>
                    <span className="text-[12px] text-zinc-500">
                      {product.priceLabel}
                    </span>
                  </div>

                  <p className="text-[13px] text-zinc-400 leading-relaxed mb-5">
                    {product.description}
                  </p>

                  <ul className="space-y-2 mb-6">
                    {product.bullets.map((b) => (
                      <li
                        key={b}
                        className="flex items-start gap-2 text-[12px] text-zinc-500 leading-relaxed"
                      >
                        <span className="flex-shrink-0 mt-0.5 w-4 h-4 rounded-full bg-green-500/15 flex items-center justify-center">
                          <span className="text-green-400 text-[10px] font-bold">
                            &#10003;
                          </span>
                        </span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto inline-flex items-center justify-center gap-2 rounded-lg bg-green-500 px-5 py-3 text-sm font-bold text-black transition-all duration-200 group-hover:bg-green-400 group-hover:shadow-[0_0_20px_rgba(168,232,76,0.25)]">
                    {product.cta}{" "}
                    <span className="transition-transform duration-200 group-hover:translate-x-1">
                      &rarr;
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <p className="mt-10 text-center text-[13px] text-zinc-500 italic max-w-2xl mx-auto leading-relaxed">
            Você não precisa comprar nada disso pra entrar na comunidade. A
            entrada é e continua gratuita. Esses produtos existem porque a galera
            vai falar deles inevitavelmente, e algumas pessoas vão querer pegar
            logo. Tudo é pagamento único. Sem assinatura. Comprou, é seu.
          </p>
        </div>
      </section>
    </>
  );
}

function ClubCta() {
  const ref = useScrollReveal();
  return (
    <>
      <div className="section-divider" />
      <section className="py-16 sm:py-20">
        <div ref={ref} className="scroll-reveal mx-auto max-w-4xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-2xl border border-green-500/40 bg-gradient-to-br from-green-500/[0.10] via-black/60 to-black/70 ring-1 ring-green-500/20 green-glow">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 p-7 sm:p-10">
              <div className="flex-shrink-0 flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/club/infuser-club.webp"
                  alt="Infuser Club"
                  width={220}
                  height={220}
                  className="h-28 sm:h-36 w-auto"
                  decoding="async"
                />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-green-300/80 mb-2">
                  O próximo nível
                </div>
                <h3 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-3 leading-tight">
                  Quer ir além da troca? Entra pro{" "}
                  <span className="text-gradient-green">Infuser Club</span>.
                </h3>
                <p className="text-[14px] sm:text-[15px] text-zinc-400 leading-relaxed mb-6 max-w-2xl">
                  A comunidade gratuita é o ambiente. O Club é onde você constrói
                  com a gente: call ao vivo toda semana, desafio quinzenal onde a
                  Infuser vende o que você cria em parceria, curso do Claude do
                  zero e bônus. A partir de R$57/mês.
                </p>
                <a
                  href="https://club.useinfuser.com"
                  className="group inline-flex items-center justify-center gap-2 rounded-lg bg-green-500 px-8 py-4 text-base font-bold text-black transition-all duration-200 hover:bg-green-400 hover:-translate-y-1 cursor-pointer green-glow"
                >
                  Conhecer o Infuser Club{" "}
                  <span className="transition-transform duration-200 group-hover:translate-x-1">
                    &rarr;
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function ComunidadeFooter() {
  return (
    <footer className="border-t border-white/5 py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <Image
            src="/lockup-sem-fundo.svg"
            alt="Infuser"
            width={100}
            height={28}
            className="h-7 w-auto"
          />
        </div>
        <p className="font-mono text-[11px] text-zinc-600 leading-relaxed">
          Comunidade gratuita Infuser &middot; por{" "}
          <a
            href="https://instagram.com/yangalasso"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-400/70 hover:text-green-300 transition-colors"
          >
            @yangalasso
          </a>
        </p>
        <p className="font-mono text-[11px] text-zinc-600 mt-1">
          Aberta a todos &middot; De graça &middot; Sem call de vendas
        </p>
      </div>
    </footer>
  );
}

export function ComunidadePage() {
  return (
    <>
      <div className="fixed inset-0 z-0 pointer-events-none">
        <FallingPattern
          className="h-full"
          color="#A8E84C"
          backgroundColor="#000000"
          duration={80}
          blurIntensity="0.5rem"
          density={2}
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>
      <div className="relative z-10">
        <main>
          <Hero />
          <NotDeadGroup />
          <WhatsInside />
          <WhyFree />
          <FormSection />
          <ProductOffer />
          <ClubCta />
        </main>
        <ComunidadeFooter />
      </div>
    </>
  );
}
