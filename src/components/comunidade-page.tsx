"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FallingPattern } from "@/components/ui/falling-pattern-lazy";
import { useScrollReveal } from "@/lib/use-scroll-reveal";

const FORM_EMBED_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfIzCE99NYKhOgakUnY3qr_vjubCF4BqmAbhmk1SCHdUokTCw/viewform?embedded=true";

const WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/LyFtfKyNrnP9aA1JjzdMzr";

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
            Comunidade Infuser
          </span>
          <span className="h-px w-5 bg-green-400" />
        </div>

        <h1 className="animate-fade-in-up delay-100 font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
          50 vagas pra entrar no único grupo de IA onde a regra é{" "}
          <span className="font-punch text-gradient-green">aplicar</span>, não
          acumular link.
        </h1>

        <p className="animate-fade-in-up delay-200 mt-6 max-w-2xl mx-auto text-base sm:text-lg text-zinc-400 leading-relaxed">
          Toda semana, um resumo de 5 minutos com o que realmente importou. E o
          filtro que separa quem usa IA de quem só consome conteúdo sobre IA.
        </p>

        <div className="animate-fade-in-up delay-300 mt-10 flex justify-center">
          <a
            href="#formulario"
            className="group inline-flex items-center gap-2 rounded-lg bg-green-500 px-10 py-4 text-base font-bold text-black transition-all duration-200 hover:bg-green-400 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(168,232,76,0.3)] cursor-pointer green-glow"
          >
            Garantir minha vaga{" "}
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

function DecisionReinforcement() {
  const ref = useScrollReveal();
  return (
    <>
      <div className="section-divider" />
      <section className="py-20 sm:py-24 bg-black/80">
        <div ref={ref} className="scroll-reveal mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-8">
            Você acabou de tomar uma decisão que{" "}
            <span className="font-punch text-gradient-green">
              9 em cada 10 pessoas
            </span>{" "}
            não tomaram.
          </h2>

          <div className="space-y-5 text-[15px] text-zinc-400 leading-relaxed">
            <p>
              A maioria viu, concordou, deu like e voltou pro feed.
            </p>
            <p>Você clicou.</p>
            <p className="text-white font-semibold">
              Isso já te coloca num grupo diferente. É exatamente o tipo de
              gente que eu quero comigo.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function WhatYouGet() {
  const ref = useScrollReveal();
  const ITEMS = [
    {
      n: "1",
      title: "O resumo da semana",
      desc: "Toda quinta, um e-mail ou mensagem com o que apareceu de IA na semana. E mais importante: o que ignorar. 5 minutos de leitura. Sem hype, sem '10 ferramentas que vão mudar tudo'. Só o que vale o seu tempo.",
    },
    {
      n: "2",
      title: "O grupo onde gente testa de verdade",
      desc: "Membros aplicando IA no trabalho real e mostrando o que funcionou (e o que foi perda de tempo). Você economiza semanas vendo os erros dos outros antes de cometer.",
    },
    {
      n: "3",
      title: "Encontros internos",
      desc: "Calls fechadas, só pra comunidade, onde a gente abre o capô de automações reais que tão rodando. Minhas e dos membros.",
    },
  ];

  return (
    <>
      <div className="section-divider" />
      <section className="py-20 sm:py-24">
        <div ref={ref} className="scroll-reveal mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-10 text-center">
            O que vem com a sua vaga
          </h2>

          <div className="space-y-4">
            {ITEMS.map((item) => (
              <div key={item.n} className="glass p-6 card-hover flex gap-5">
                <span className="flex-shrink-0 font-punch text-3xl text-gradient-green leading-none">
                  {item.n}
                </span>
                <div>
                  <h3 className="font-heading text-lg font-bold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-[14px] text-zinc-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function WhyFifty() {
  const ref = useScrollReveal();
  return (
    <>
      <div className="section-divider" />
      <section className="py-20 sm:py-24 bg-black/80">
        <div ref={ref} className="scroll-reveal mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-8">
            Por que só{" "}
            <span className="font-punch text-gradient-green">50</span>?
          </h2>

          <div className="space-y-5 text-[15px] text-zinc-400 leading-relaxed">
            <p>Eu já tô em grupo de 5 mil pessoas. Sei como termina.</p>
            <p>
              Ninguém fala. Ninguém aplica. Vira mais um canal silenciado na
              sua tela.
            </p>
            <p>
              50 é o número que cabe numa conversa real. Onde eu consigo
              lembrar o nome de quem tá dentro, responder pergunta, puxar gente
              que sumiu.
            </p>
            <p className="text-white font-semibold">
              Quando bater 50, fecha. Quem vier depois entra na lista de
              espera.
            </p>
            <p>
              Não é gatilho de marketing. É o limite real do que eu consigo
              manter funcionando.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function FAQ() {
  const ref = useScrollReveal();
  const QA = [
    {
      q: "Vai me custar quanto?",
      a: "Nada. A comunidade é gratuita.",
    },
    {
      q: "Vai dar muito trabalho?",
      a: "Você pode só ler. Quem aplica e compartilha aprende mais rápido, mas ninguém é cobrado por nada.",
    },
    {
      q: "Vou receber spam?",
      a: "Não. Um resumo por semana e o que rolar no grupo. Pode sair quando quiser.",
    },
    {
      q: "Preciso ser dev?",
      a: "Não. Precisa ser alguém que quer usar IA na prática, não só falar sobre ela.",
    },
  ];

  return (
    <>
      <div className="section-divider" />
      <section className="py-20 sm:py-24">
        <div ref={ref} className="scroll-reveal mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-10 text-center">
            Antes de você preencher
          </h2>

          <div className="space-y-4">
            {QA.map((item) => (
              <div key={item.q} className="glass p-6">
                <h3 className="font-heading text-base font-bold text-white mb-2">
                  {item.q}
                </h3>
                <p className="text-[14px] text-zinc-400 leading-relaxed">
                  {item.a}
                </p>
              </div>
            ))}
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
    // First load = form render. Subsequent loads = navigation after submit.
    if (loadCount.current > 1) {
      setSubmitted(true);
    }
  };

  return (
    <>
      <div className="section-divider" />
      <section id="formulario" className="py-20 sm:py-24 bg-black/80">
        <div ref={ref} className="scroll-reveal mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-center mb-3">
            Pra fechar sua vaga, responde rápido
          </h2>
          <p className="text-center text-[15px] text-zinc-400 mb-10">
            Leva menos de 90 segundos.
          </p>

          <div className="rounded-lg border border-green-500/15 bg-[#0d0d0d] overflow-hidden">
            <iframe
              src={FORM_EMBED_URL}
              title="Formulário Comunidade Infuser"
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
                Vaga registrada
              </span>
            </div>
            <p className="text-[15px] text-zinc-400 mb-6 max-w-md mx-auto">
              Agora é só entrar no grupo. Você não vai receber nenhum outro
              e-mail antes disso.
            </p>
            <a
              href={WHATSAPP_GROUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-lg bg-green-500 px-10 py-4 text-base font-bold text-black transition-all duration-200 hover:bg-green-400 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(168,232,76,0.3)] cursor-pointer green-glow"
            >
              Garantir minha vaga{" "}
              <span className="transition-transform duration-200 group-hover:translate-x-1">
                &rarr;
              </span>
            </a>
            <p className="mt-4 text-[13px] text-zinc-500 italic">
              Você cai direto no grupo no WhatsApp. Sem onboarding, sem espera,
              sem call de vendas.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function PostScript() {
  const ref = useScrollReveal();
  return (
    <>
      <div className="section-divider" />
      <section className="py-20 sm:py-24">
        <div ref={ref} className="scroll-reveal mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <p className="font-mono text-[13px] uppercase tracking-[0.2em] text-green-400/70 mb-6">
            P.S.
          </p>
          <p className="text-lg sm:text-xl md:text-2xl text-zinc-300 leading-relaxed mb-6">
            Se você tá lendo até aqui e ainda não preencheu, provavelmente tá
            pensando &ldquo;deixa eu fazer depois&rdquo;. Eu também faria. Mas
            se as 50 fecharem antes, essa página vira lista de espera e pode
            ser que demore semanas pra abrir de novo.
          </p>
          <p className="text-white font-bold text-xl sm:text-2xl">
            Leva 90 segundos.
          </p>
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
      <section className="py-20 sm:py-28 bg-black/80">
        <div ref={ref} className="scroll-reveal mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-3 mb-6">
              <span className="h-px w-5 bg-green-400/40" />
              <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-green-400/70">
                Enquanto seu acesso é processado
              </span>
              <span className="h-px w-5 bg-green-400/40" />
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-5">
              Dá uma olhada{" "}
              <span className="font-punch text-gradient-green">nisso</span>.
            </h2>
            <p className="text-[15px] text-zinc-400 leading-relaxed">
              3 coisas que a galera da comunidade já tá usando. E que você pode
              começar HOJE, antes mesmo do primeiro resumo semanal cair na sua
              caixa.
            </p>
            <p className="mt-4 text-[13px] text-zinc-500 italic">
              Não é amarrado à comunidade. Mas se você quer aplicar IA agora, é
              o caminho mais curto que eu conheço.
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
            vaga que você acabou de garantir tá garantida. Esses produtos
            existem porque a comunidade vai falar sobre eles inevitavelmente,
            e algumas pessoas vão querer pular o &ldquo;esperar pra ouvir
            falar&rdquo; e pegar logo. Tudo é pagamento único. Sem assinatura.
            Comprou, é seu.
          </p>
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
          Comunidade Infuser &middot; por{" "}
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
          Comunidade gratuita &middot; 50 vagas &middot; Sem call de vendas
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
          <DecisionReinforcement />
          <WhatYouGet />
          <WhyFifty />
          <FAQ />
          <FormSection />
          <PostScript />
          <ProductOffer />
        </main>
        <ComunidadeFooter />
      </div>
    </>
  );
}
