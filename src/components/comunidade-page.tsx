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
            Lista de espera
          </span>
          <span className="h-px w-5 bg-green-400" />
        </div>

        <h1 className="animate-fade-in-up delay-100 font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
          As 50 vagas fecharam. Mas a próxima fila começou agora. E quem entrar
          hoje,{" "}
          <span className="font-punch text-gradient-green">
            acessa o grupo antes
          </span>
          .
        </h1>

        <p className="animate-fade-in-up delay-200 mt-6 max-w-2xl mx-auto text-base sm:text-lg text-zinc-400 leading-relaxed">
          Não é lista de espera comum. É a ordem exata em que as próximas vagas
          serão liberadas, sem aviso público.
        </p>

        <div className="animate-fade-in-up delay-300 mt-10 flex justify-center">
          <a
            href="#formulario"
            className="group inline-flex items-center gap-2 rounded-lg bg-green-500 px-10 py-4 text-base font-bold text-black transition-all duration-200 hover:bg-green-400 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(168,232,76,0.3)] cursor-pointer green-glow"
          >
            Entrar na lista de espera{" "}
            <span className="transition-transform duration-200 group-hover:translate-x-1">
              &rarr;
            </span>
          </a>
        </div>

        <p className="animate-fade-in-up delay-400 mt-4 font-mono text-[12px] text-green-300/60">
          Gratuito &middot; Leva 90 segundos &middot; Aviso 24h antes do público
        </p>
      </div>
    </section>
  );
}

function ReframeFrustration() {
  const ref = useScrollReveal();
  return (
    <>
      <div className="section-divider" />
      <section className="py-20 sm:py-24 bg-black/80">
        <div ref={ref} className="scroll-reveal-stagger mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-8">
            Por que isso é{" "}
            <span className="font-punch text-gradient-green">boa notícia</span>,
            não má.
          </h2>

          <div className="space-y-5 text-[15px] text-zinc-400 leading-relaxed">
            <p>Seja sincero: você chegou aqui um pouco frustrado.</p>
            <p>Mas pensa um segundo.</p>
            <p>
              Se as 50 vagas tivessem demorado meses pra fechar, você ia querer
              entrar? Provavelmente não. Grupo que demora pra encher é grupo
              que ninguém quer.
            </p>
            <p>
              O fato de ter fechado rápido significa exatamente uma coisa:{" "}
              <strong className="text-gradient-green font-semibold">
                funcionou
              </strong>
              . A demanda é real, o grupo tá ativo, e a próxima leva vai abrir.
            </p>
            <p className="text-white font-semibold">
              Você não chegou atrasado. Chegou na hora exata pra ser o primeiro
              da fila. Antes de qualquer pessoa que assistir o vídeo daqui pra
              frente.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function InsideVsOutside() {
  const ref = useScrollReveal();
  const INSIDE = [
    "Recebe aviso por WhatsApp 24h antes da próxima abertura pública",
    "Tem prioridade absoluta na ordem de inscrição",
    "Ganha acesso ao primeiro resumo semanal já enviado",
  ];
  const OUTSIDE = [
    "Descobre a próxima abertura quando virar story ou Reels, junto com mais 10 mil pessoas",
    "Compete com todo mundo de novo",
    "Pode perder duas, três vezes seguidas",
  ];

  return (
    <>
      <div className="section-divider" />
      <section className="py-20 sm:py-24">
        <div ref={ref} className="scroll-reveal-stagger mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-10 text-center">
            O que muda entre{" "}
            <span className="font-punch text-gradient-green">estar</span> e não
            estar na lista.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-lg border border-green-500/30 bg-green-500/[0.04] p-6">
              <div className="inline-flex items-center gap-2 mb-5 px-2.5 py-1 rounded-full bg-green-500/15 border border-green-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-green-300">
                  Quem entra na lista hoje
                </span>
              </div>
              <ul className="space-y-3">
                {INSIDE.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                      <span className="text-green-400 text-xs font-bold">
                        &#10003;
                      </span>
                    </span>
                    <span className="text-[14px] text-zinc-300 leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-6">
              <div className="inline-flex items-center gap-2 mb-5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20">
                <span className="font-mono text-[10px] uppercase tracking-widest text-red-300/80">
                  Quem não entra
                </span>
              </div>
              <ul className="space-y-3">
                {OUTSIDE.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-red-500/15 flex items-center justify-center">
                      <span className="text-red-400 text-xs font-bold">
                        &times;
                      </span>
                    </span>
                    <span className="text-[14px] text-zinc-400 leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-8 text-center text-[15px] text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            A diferença entre estar e não estar na lista é a diferença entre
            ter prioridade e contar com a sorte.
          </p>
        </div>
      </section>
    </>
  );
}

function WhenNextBatch() {
  const ref = useScrollReveal();
  return (
    <>
      <div className="section-divider" />
      <section className="py-20 sm:py-24 bg-black/80">
        <div ref={ref} className="scroll-reveal-stagger mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-8">
            Quando abre a{" "}
            <span className="font-punch text-gradient-green">próxima leva</span>?
          </h2>

          <div className="space-y-5 text-[15px] text-zinc-400 leading-relaxed">
            <p>
              Honestidade total: eu não tenho data exata. Não vou inventar
              urgência falsa.
            </p>
            <p>Depende de duas coisas:</p>
          </div>

          <div className="mt-8 space-y-4">
            <div className="glass p-6 flex gap-5 card-hover">
              <span className="flex-shrink-0 font-punch text-3xl text-gradient-green leading-none">
                1
              </span>
              <div>
                <h3 className="font-heading text-lg font-bold text-white mb-2">
                  Ritmo do grupo atual
                </h3>
                <p className="text-[14px] text-zinc-400 leading-relaxed">
                  Quando os primeiros 50 estiverem em ritmo de cruzeiro,
                  provavelmente em 4 a 8 semanas, eu vejo se aguento mais gente
                  sem perder qualidade.
                </p>
              </div>
            </div>

            <div className="glass p-6 flex gap-5 card-hover">
              <span className="flex-shrink-0 font-punch text-3xl text-gradient-green leading-none">
                2
              </span>
              <div>
                <h3 className="font-heading text-lg font-bold text-white mb-2">
                  Saída natural
                </h3>
                <p className="text-[14px] text-zinc-400 leading-relaxed">
                  Se alguém sair (e sempre sai), abro 1 vaga e ela vai pra
                  próxima pessoa da lista.
                </p>
              </div>
            </div>
          </div>

          <p className="mt-8 text-[15px] text-white font-semibold leading-relaxed">
            Resumindo: pode abrir em semanas, pode abrir amanhã se sair alguém.
            Mas você só fica sabendo se estiver na lista.
          </p>
        </div>
      </section>
    </>
  );
}

function WhyNotMoreSlots() {
  const ref = useScrollReveal();
  return (
    <>
      <div className="section-divider" />
      <section className="py-20 sm:py-24">
        <div ref={ref} className="scroll-reveal-stagger mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-8">
            Por que não{" "}
            <span className="font-punch text-gradient-green">abrir mais</span>{" "}
            agora?
          </h2>

          <div className="space-y-5 text-[15px] text-zinc-400 leading-relaxed">
            <p>Porque o motivo das 50 vagas continua sendo verdade.</p>
            <p>
              Se eu dobrar pra 100 só pra atender a fila, viro o que eu mais
              critico: criador de grupo de WhatsApp morto.
            </p>
            <p className="text-white font-semibold">
              Você não quer entrar num grupo morto. Eu não quero criar um. A
              lista de espera é o que protege os dois lados.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function BeforeYouClose() {
  const ref = useScrollReveal();
  return (
    <>
      <div className="section-divider" />
      <section className="py-20 sm:py-24 bg-black/80">
        <div ref={ref} className="scroll-reveal-stagger mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-8 text-center">
            Antes de você fechar essa página
          </h2>

          <div className="space-y-5 text-[15px] text-zinc-400 leading-relaxed">
            <p>
              Pensa que estar nessa lista te custa{" "}
              <strong className="text-white">um formulário</strong> e{" "}
              <strong className="text-white">30 segundos</strong>. E te dá
              vantagem real na próxima vez que isso abrir.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-6">
              <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-3">
                Pior cenário
              </p>
              <p className="text-[14px] text-zinc-400 leading-relaxed">
                Você recebe um WhatsApp avisando, decide que não quer mais
                entrar, ignora. Acabou.
              </p>
            </div>
            <div className="rounded-lg border border-green-500/30 bg-green-500/[0.04] p-6">
              <p className="font-mono text-[10px] uppercase tracking-widest text-green-300 mb-3">
                Melhor cenário
              </p>
              <p className="text-[14px] text-zinc-300 leading-relaxed">
                Você é uma das primeiras pessoas dentro da próxima leva, sem
                precisar disputar com mais 5 mil pessoas que viram o vídeo
                depois.
              </p>
            </div>
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
            Entra na lista
          </h2>
          <p className="text-center text-[15px] text-zinc-400 mb-10">
            Leva menos de 90 segundos. Quando abrir a próxima leva, o aviso
            chega 24h antes do público.
          </p>

          <div className="rounded-lg border border-green-500/15 bg-[#0d0d0d] overflow-hidden">
            <iframe
              src={FORM_EMBED_URL}
              title="Lista de espera Comunidade Infuser"
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
                Tá na lista
              </span>
            </div>
            <p className="text-[15px] text-zinc-300 max-w-md mx-auto leading-relaxed">
              Quando abrir a próxima leva, o aviso chega no WhatsApp{" "}
              <strong className="text-white">24h antes do público</strong>. Pode
              fechar essa página.
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
      <section className="py-20 sm:py-24 bg-black/80">
        <div ref={ref} className="scroll-reveal-stagger mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <p className="font-mono text-[13px] uppercase tracking-[0.2em] text-green-400/70 mb-6">
            P.S.
          </p>
          <p className="text-lg sm:text-xl md:text-2xl text-zinc-300 leading-relaxed mb-6">
            Tem um detalhe que pouca gente percebe: a lista de espera é a forma
            mais barata que você tem de entrar nessa comunidade. Quem entrar a
            partir da terceira leva provavelmente vai pagar. Os 50 atuais e os
            próximos da lista entram de graça porque me ajudaram a validar o
            formato.
          </p>
          <p className="text-white font-bold text-xl sm:text-2xl">
            Não é promessa, é probabilidade. Mas pesa.
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
      <section className="py-20 sm:py-28">
        <div ref={ref} className="scroll-reveal-stagger mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-3 mb-6">
              <span className="h-px w-5 bg-green-400/40" />
              <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-green-400/70">
                Enquanto a fila não anda
              </span>
              <span className="h-px w-5 bg-green-400/40" />
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-5">
              Dá uma olhada{" "}
              <span className="font-punch text-gradient-green">nisso</span>.
            </h2>
            <p className="text-[15px] text-zinc-400 leading-relaxed">
              3 coisas que a galera da comunidade já tá usando. E que você pode
              começar HOJE, sem precisar esperar a próxima leva abrir.
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
            Você não precisa comprar nada disso pra ficar na lista. Sua posição
            tá garantida. Esses produtos existem porque a comunidade vai falar
            sobre eles inevitavelmente, e algumas pessoas vão querer pular o
            &ldquo;esperar pra ouvir falar&rdquo; e pegar logo. Tudo é
            pagamento único. Sem assinatura. Comprou, é seu.
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
          Lista de espera &middot; Aviso 24h antes do público &middot; Sem call
          de vendas
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
          <ReframeFrustration />
          <InsideVsOutside />
          <WhenNextBatch />
          <WhyNotMoreSlots />
          <BeforeYouClose />
          <FormSection />
          <PostScript />
          <ProductOffer />
        </main>
        <ComunidadeFooter />
      </div>
    </>
  );
}
