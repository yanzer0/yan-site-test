"use client";

import { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  ArrowLeft,
  Eye,
  MousePointerClick,
  GripVertical,
  Undo2,
  Columns3,
  Search,
  Play,
  MonitorPlay,
  ChevronDown,
  ExternalLink,
  Brain,
  BookOpen,
  Layers,
  Zap,
  ListChecks,
} from "lucide-react";
import { useScrollReveal } from "@/lib/use-scroll-reveal";
import { FallingPattern } from "@/components/ui/falling-pattern";
import Image from "next/image";
import Link from "next/link";

/* ─── Navbar ─── */
function VSCodeNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const NAV_LINKS = [
    { label: "Vantagens", href: "#vantagens" },
    { label: "O Kit", href: "#kit" },
    { label: "Tutorial", href: "#kit" },
  ];

  return (
    <header className="fixed top-4 left-4 right-4 z-50">
      <nav
        className={`mx-auto max-w-3xl glass rounded-lg px-6 py-3 flex items-center justify-between transition-all duration-300 ${scrolled ? "navbar-scrolled" : ""}`}
      >
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer mr-1"
            aria-label="Voltar ao início"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Início</span>
          </Link>
          <Link href="/" className="flex items-center cursor-pointer">
            <Image
              src="/lockup-sem-fundo.svg"
              alt="Infuser"
              width={120}
              height={32}
              className="h-8 w-auto"
            />
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="relative text-sm text-zinc-400 hover:text-white transition-colors duration-200 cursor-pointer after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-green-400 after:transition-all after:duration-300 hover:after:w-full"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <a
            href="#cta"
            className="inline-flex items-center gap-2 rounded-full bg-green-500 px-4 py-2 text-xs sm:text-sm font-semibold text-black transition-all duration-200 hover:bg-green-400 hover:shadow-[0_0_20px_rgba(168,232,76,0.3)] cursor-pointer green-glow-sm"
          >
            Acessar Kit
          </a>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-white cursor-pointer p-2"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </nav>

      <div
        className={`md:hidden mt-2 mx-auto max-w-3xl rounded-lg border border-white/10 bg-[#0A0A0A]/90 backdrop-blur-xl p-6 flex flex-col gap-4 transition-all duration-300 origin-top ${
          mobileOpen
            ? "opacity-100 scale-y-100 translate-y-0"
            : "opacity-0 scale-y-95 -translate-y-2 pointer-events-none"
        }`}
      >
        {NAV_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            onClick={() => setMobileOpen(false)}
            className="text-sm text-zinc-400 hover:text-white transition-colors duration-200 cursor-pointer"
          >
            {link.label}
          </a>
        ))}
        <a
          href="#cta"
          onClick={() => setMobileOpen(false)}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-green-500 px-5 py-2.5 text-sm font-semibold text-black cursor-pointer"
        >
          Acessar Kit
        </a>
      </div>
    </header>
  );
}

/* ─── Hero ─── */
function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-28 pb-16">
      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 text-center">
        {/* Badge */}
        <div className="animate-fade-in-up inline-flex items-center gap-3 mb-8">
          <span className="h-px w-5 bg-green-400" />
          <span className="font-mono text-xs uppercase tracking-[0.15em] text-green-400">
            Kit Gratuito
          </span>
          <span className="h-px w-5 bg-green-400" />
        </div>

        {/* Headline */}
        <h1 className="animate-fade-in-up delay-100 font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
          Para de usar o Claude Code
          <br />
          <span className="font-punch text-gradient-green">no terminal.</span>
        </h1>

        {/* Subheadline */}
        <p className="animate-fade-in-up delay-200 mt-6 max-w-2xl mx-auto text-lg sm:text-xl md:text-2xl text-zinc-400 leading-relaxed">
          Existe uma forma mais rápida, mais visual e mais inteligente de usar o
          Claude Code, e a maioria das pessoas não sabe que ela&nbsp;existe.
        </p>

        {/* Cover image */}
        <div className="animate-fade-in-up delay-300 mt-10 max-w-3xl mx-auto rounded-lg overflow-hidden border border-green-500/10">
          <Image
            src="/capa-kit-vscode.webp"
            alt="Kit Claude Code no VS Code - INFUSER"
            width={1500}
            height={400}
            className="w-full h-auto"
            priority
          />
        </div>

        {/* CTA arrow */}
        <div className="animate-fade-in-up delay-400 mt-8">
          <a
            href="#abertura"
            className="inline-flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition-colors"
          >
            Descubra como
            <ChevronDown className="h-4 w-4 animate-bounce" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─── Section 1: Abertura ─── */
function AberturaSection() {
  const ref = useScrollReveal();

  return (
    <>
      <div className="section-divider" />
      <section id="abertura" className="py-20 sm:py-28 bg-black/95">
        <div ref={ref} className="scroll-reveal mx-auto max-w-3xl px-4 sm:px-6">
          <div className="space-y-5">
            <p className="text-base md:text-lg text-zinc-400 leading-relaxed">
              Eu vou te contar uma coisa que eu queria que alguém tivesse me
              contado&nbsp;antes.
            </p>
            <p className="text-base md:text-lg text-zinc-400 leading-relaxed">
              Durante semanas, eu usei o Claude Code no terminal achando que era
              o máximo que dava pra fazer.{" "}
              <strong className="text-white font-semibold">
                Funcionava? Funcionava.
              </strong>{" "}
              Mas toda vez que ele sugeria uma mudança, eu ficava{" "}
              <strong className="text-white font-semibold">
                lendo o diff no terminal
              </strong>{" "}
              tentando entender o que tinha mudado em cada arquivo. Toda
              vez que eu queria analisar um trecho específico,{" "}
              <strong className="text-white font-semibold">
                eu não conseguia apontar pras linhas&nbsp;exatas.
              </strong>{" "}
              Referenciava o arquivo inteiro e torcia
              pro Claude encontrar o ponto certo. E toda vez que ele fazia algo
              errado, eu pedia pra ele mesmo desfazer.{" "}
              <strong className="text-white font-semibold">
                Às vezes funcionava, e às vezes criava mais&nbsp;problema.
              </strong>
            </p>
            <p className="text-base md:text-lg text-zinc-400 leading-relaxed">
              Eu achava que era assim que todo mundo&nbsp;usava.
            </p>
            <p className="text-base md:text-xl text-white font-semibold leading-relaxed">
              <span className="text-gradient-green">
                Até que eu descobri que eu estava usando&nbsp;errado.
              </span>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

/* ─── Section 2: A Descoberta ─── */
function DescobertaSection() {
  const ref = useScrollReveal();

  return (
    <>
      <div className="section-divider" />
      <section className="py-20 sm:py-28">
        <div ref={ref} className="scroll-reveal mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-6">
            A extensão que muda{" "}
            <span className="font-punch text-gradient-green">tudo.</span>
          </h2>

          <div className="space-y-5">
            <p className="text-base md:text-lg text-zinc-400 leading-relaxed">
              O Claude Code tem uma{" "}
              <strong className="text-white font-semibold">
                extensão oficial da Anthropic
              </strong>{" "}
              que funciona direto dentro do VS Code. Não é um wrapper de
              terceiros. Não é uma gambiarra. É a interface que a própria
              Anthropic construiu pra você usar o Claude Code do jeito&nbsp;certo.
            </p>

            <p className="text-base md:text-lg text-zinc-400 leading-relaxed">
              E ela não é só uma interface&nbsp;bonita.
            </p>

            <p className="text-base md:text-xl text-white font-semibold leading-relaxed">
              <span className="text-gradient-green">
                São funcionalidades que o terminal simplesmente não tem.
              </span>{" "}
              Funcionalidades que mudaram completamente a forma como eu
              trabalho. Funcionalidades que, quando você conhece, não tem como
              voltar&nbsp;atrás.
            </p>

            <p className="text-base md:text-lg text-zinc-400 leading-relaxed">
              Deixa eu te&nbsp;mostrar.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

/* ─── Section 3: As 6 Vantagens ─── */
const VANTAGENS = [
  {
    icon: Eye,
    title: "Você vê as mudanças antes de aceitar",
    body: (
      <>
        O terminal mostra diffs com cores, sim. Mas na extensão,{" "}
        <strong className="text-white font-semibold">
          as mudanças aparecem direto no editor, dentro do próprio arquivo
        </strong>
        , com botões de aceitar ou rejeitar cada bloco individualmente. Você não
        lê o diff num painel separado. Você vê a mudança exatamente onde ela vai
        acontecer no código. Um clique pra aceitar, um clique pra rejeitar.
      </>
    ),
    example:
      "Você pede pro Claude adicionar validação de email. O diff mostra exatamente as 3 linhas que serão adicionadas. Você aceita com um clique. Sem copiar. Sem colar. Sem risco.",
  },
  {
    icon: MousePointerClick,
    title: "Seleciona o código e o Claude já entende",
    body: (
      <>
        Sabe quando você quer que o Claude analise um trecho específico do
        código? No terminal, você pode usar @ pra referenciar arquivos, mas
        precisa digitar.{" "}
        <strong className="text-white font-semibold">
          Na extensão, você seleciona as linhas no editor e ele já detecta
          automaticamente.
        </strong>{" "}
        Aparece ali embaixo: &ldquo;25 lines selected&rdquo;. Você nem precisa
        mencionar o arquivo. Só escreve a pergunta.
      </>
    ),
    example:
      'Você seleciona uma função com bug e pergunta: "por que isso retorna undefined?" O Claude analisa exatamente aquelas linhas, sem você precisar explicar nada.',
  },
  {
    icon: GripVertical,
    title: "Arrasta o arquivo e pronto",
    body: (
      <>
        Precisa que o Claude analise um arquivo inteiro?{" "}
        <strong className="text-white font-semibold">
          Segura Shift, arrasta o arquivo pro chat.
        </strong>{" "}
        Pronto. Sem digitar nada. É a forma mais rápida e visual de dar
        contexto ao Claude. Você literalmente aponta pra o que quer.
      </>
    ),
    example:
      'Você arrasta o package.json pro chat e pergunta: "quais dependências estão desatualizadas?" O Claude lê o arquivo completo em um segundo.',
  },
  {
    icon: Undo2,
    title: "Fez besteira? Volta no tempo",
    body: (
      <>
        Sabe quando o Claude faz algo errado e você pede pra ele desfazer, e
        ele desfaz mas muda outra coisa junto, e aí você pede de novo, e vira
        uma bola de neve?{" "}
        <strong className="text-white font-semibold">
          Na extensão, cada mudança cria um checkpoint automático.
        </strong>{" "}
        Passou o mouse, clicou em rewind, e o código volta ao estado exato de
        antes. Sem pedir nada. Sem risco. Três opções: voltar só o código, criar
        um fork da conversa, ou ambos.
      </>
    ),
    example:
      "O Claude refatorou 5 arquivos mas quebrou um teste. Um clique. Tudo volta. Você tenta de novo com outra abordagem.",
  },
  {
    icon: Columns3,
    title: "Várias conversas ao mesmo tempo",
    body: (
      <>
        <strong className="text-white font-semibold">
          Cada conversa abre em uma aba separada.
        </strong>{" "}
        Uma pro backend, outra pro frontend, outra pros testes. Cada uma com
        seu próprio contexto, rodando em paralelo, sem interferir uma na outra.
        Um pontinho colorido na aba te avisa quando o Claude terminou ou quando
        precisa de permissão.
      </>
    ),
    example:
      "Aba 1 criando a API. Aba 2 escrevendo os testes. Você alterna entre elas como alterna entre abas do navegador.",
  },
  {
    icon: Search,
    title: "Nunca mais perde uma conversa",
    body: (
      <>
        <strong className="text-white font-semibold">
          Toda conversa fica salva automaticamente.
        </strong>{" "}
        Busca por palavra-chave, navega por data, retoma de onde parou. Aquela
        solução que o Claude te deu semana passada? Busca
        &ldquo;autenticação&rdquo; e ela está lá.
      </>
    ),
    example:
      'Você busca "database" no histórico e encontra a conversa onde o Claude te ajudou a configurar o banco. Retoma com todo o contexto preservado.',
  },
];

function VantagensSection() {
  const ref = useScrollReveal();

  return (
    <>
      <div className="section-divider" />
      <section id="vantagens" className="py-20 sm:py-28 bg-black/95">
        <div
          ref={ref}
          className="scroll-reveal mx-auto max-w-3xl px-4 sm:px-6"
        >
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-4">
            6 funcionalidades que o terminal{" "}
            <span className="font-punch text-gradient-green">
              não tem.
            </span>
          </h2>
          <p className="text-base md:text-lg text-zinc-400 leading-relaxed mb-14">
            Cada uma delas, sozinha, já justifica a mudança. Juntas, elas
            transformam completamente a forma como você&nbsp;trabalha.
          </p>

          <div className="space-y-12">
            {VANTAGENS.map((v, i) => {
              const Icon = v.icon;
              return (
                <div key={i} className="group">
                  {/* Number + icon + title */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center group-hover:bg-green-500/20 transition-colors duration-200">
                      <Icon className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <span className="font-mono text-xs text-green-400/60 uppercase tracking-widest">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="font-heading text-lg sm:text-xl md:text-2xl font-bold text-white leading-snug mt-0.5">
                        {v.title}
                      </h3>
                    </div>
                  </div>

                  {/* Body */}
                  <p className="text-base md:text-lg text-zinc-400 leading-relaxed ml-14 md:ml-16">
                    {v.body}
                  </p>

                  {/* Practical example */}
                  <div className="ml-14 mt-4 rounded-lg bg-[#0d0d0d] border border-green-500/10 p-4">
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 mt-0.5 font-mono text-xs text-green-400 font-bold uppercase tracking-widest">
                        Na prática:
                      </span>
                    </div>
                    <p className="text-sm md:text-base text-zinc-500 leading-relaxed mt-1.5">
                      {v.example}
                    </p>
                  </div>

                  {/* Separator */}
                  {i < VANTAGENS.length - 1 && (
                    <div className="h-px bg-white/5 mt-12" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

/* ─── Section 4: A Realidade ─── */
function RealidadeSection() {
  const ref = useScrollReveal();

  const EXTRAS = [
    "Plan Mode com interface visual pra revisar e editar planos antes de executar",
    "Extended Thinking com toggle pra ver o raciocínio em tempo real",
    "Mais de 20 slash commands nativos pra controlar modelo, velocidade, contexto e sessões",
    "Suporte a MCP servers que conectam o Claude a ferramentas externas",
  ];

  return (
    <>
      <div className="section-divider" />
      <section className="py-20 sm:py-28 bg-black/95">
        <div ref={ref} className="scroll-reveal mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-6">
            Essas 6 funcionalidades são{" "}
            <span className="font-punch text-gradient-green">
              apenas o começo.
            </span>
          </h2>

          <p className="text-base md:text-lg text-zinc-400 leading-relaxed mb-8">
            A extensão ainda tem:
          </p>

          <div className="space-y-4">
            {EXTRAS.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-green-500/15 flex items-center justify-center">
                  <span className="text-green-400 text-xs font-bold">+</span>
                </span>
                <span className="text-base md:text-lg text-zinc-400 leading-relaxed">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

/* ─── Section 5: O Kit ─── */
const MODULOS = [
  {
    icon: BookOpen,
    num: "01",
    title: "Instalação do Zero",
    desc: "Baixar o VS Code e instalar a extensão. Passo a passo. Mesmo que você nunca tenha aberto o VS Code na vida.",
  },
  {
    icon: Layers,
    num: "02",
    title: "Interface e Navegação",
    desc: "Onde fica cada coisa, como abrir o Claude de 4 formas diferentes, os atalhos essenciais que economizam horas.",
  },
  {
    icon: Zap,
    num: "03",
    title: "Vantagens sobre o Terminal",
    desc: "As 9 funcionalidades exclusivas da extensão, cada uma com explicação, exemplo prático e o \"como usar\" direto ao ponto.",
  },
  {
    icon: Brain,
    num: "04",
    title: "Funcionalidades Avançadas",
    desc: "Extended Thinking, Plan Mode na prática, como usar o CLI dentro do VS Code, e como continuar conversas entre extensão e terminal.",
  },
  {
    icon: ListChecks,
    num: "05",
    title: "Referência Rápida",
    desc: "Cheat sheet completo de atalhos, todos os slash commands organizados por categoria, e truques do dia a dia.",
  },
];

function KitSection() {
  const ref = useScrollReveal();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  function handlePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play();
      setIsPlaying(true);
    }
  }

  return (
    <>
      <div className="section-divider" />
      <section id="kit" className="py-20 sm:py-28 bg-black/95">
        <div ref={ref} className="scroll-reveal mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-4">
            Eu organizei{" "}
            <span className="font-punch text-gradient-green">tudo</span> num
            único&nbsp;lugar.
          </h2>
          <p className="text-base md:text-lg text-zinc-400 leading-relaxed mb-10">
            <strong className="text-white font-semibold">
              O Kit Prático - Claude Code no VS Code
            </strong>{" "}
            é um guia completo com 5 módulos que te levam do zero absoluto ao
            uso avançado da&nbsp;extensão:
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
            {/* Video - left side */}
            <div className="order-2 lg:order-1 lg:sticky lg:top-28">
              <div className="rounded-lg overflow-hidden border border-green-500/10 relative group">
                <video
                  ref={videoRef}
                  src="/video-tutorial-vscode.mp4"
                  className="w-full h-auto"
                  playsInline
                  preload="metadata"
                  controls={isPlaying}
                  onEnded={() => setIsPlaying(false)}
                  onClick={handlePlay}
                />
                {/* Play overlay */}
                <button
                  onClick={handlePlay}
                  className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity duration-300 cursor-pointer ${
                    isPlaying
                      ? "opacity-0 hover:opacity-100"
                      : "opacity-100"
                  }`}
                  aria-label={isPlaying ? "Pausar vídeo" : "Reproduzir vídeo"}
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-500/90 flex items-center justify-center backdrop-blur-sm transition-transform duration-200 hover:scale-110 green-glow">
                    {isPlaying ? (
                      <div className="flex gap-1.5">
                        <span className="w-1.5 h-6 bg-black rounded-full" />
                        <span className="w-1.5 h-6 bg-black rounded-full" />
                      </div>
                    ) : (
                      <Play className="h-7 w-7 sm:h-8 sm:w-8 text-black ml-1" fill="black" />
                    )}
                  </div>
                </button>
                {/* Tutorial badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 backdrop-blur-sm border border-white/10">
                  <MonitorPlay className="h-3.5 w-3.5 text-green-400" />
                  <span className="text-xs font-medium text-white">
                    Tutorial completo - clique para&nbsp;assistir
                  </span>
                </div>
              </div>
            </div>

            {/* Módulos - right side */}
            <div className="order-1 lg:order-2 space-y-4">
              {MODULOS.map((m) => {
                const Icon = m.icon;
                return (
                  <div
                    key={m.num}
                    className="group rounded-lg border border-white/5 bg-white/[0.02] p-5 hover:border-green-500/20 hover:bg-green-500/[0.03] transition-all duration-200"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/15 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-green-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs text-green-400/50 tracking-widest">
                            MÓDULO {m.num}
                          </span>
                        </div>
                        <h3 className="font-heading text-lg sm:text-xl md:text-2xl font-bold text-white leading-snug">
                          {m.title}
                        </h3>
                        <p className="text-sm md:text-base text-zinc-500 leading-relaxed mt-1.5">
                          {m.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-10 rounded-lg border border-green-500/20 bg-green-500/[0.04] p-6 text-center">
            <p className="text-base text-white font-semibold">
              <span className="text-gradient-green">O kit é gratuito.</span>
            </p>
            <p className="text-sm text-zinc-500 mt-1">
              Minha forma de devolver valor pra essa comunidade que me acompanha
              todo&nbsp;dia.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

/* ─── Section 6: Ponte para o Upsell ─── */
function PonteSection() {
  const ref = useScrollReveal();

  return (
    <>
      <div className="section-divider" />
      <section className="py-20 sm:py-28">
        <div ref={ref} className="scroll-reveal mx-auto max-w-3xl px-4 sm:px-6">
          <div className="space-y-5">
            <p className="text-base md:text-lg text-zinc-400 leading-relaxed">
              Mas eu preciso ser honesto com você.
            </p>
            <p className="text-base md:text-lg text-zinc-400 leading-relaxed">
              <strong className="text-white font-semibold">
                O kit te ensina a usar a ferramenta.
              </strong>{" "}
              Instalar, configurar, navegar, conhecer as funcionalidades. E isso
              já vai mudar a forma como você trabalha.
            </p>
            <p className="text-base md:text-lg text-zinc-400 leading-relaxed">
              Só que existe uma diferença enorme entre{" "}
              <strong className="text-white font-semibold">
                saber usar uma ferramenta
              </strong>{" "}
              e{" "}
              <strong className="text-white font-semibold">
                transformar ela num assistente inteligente que trabalha pra&nbsp;você.
              </strong>
            </p>
            <p className="text-base md:text-lg text-zinc-400 leading-relaxed">
              Pensa comigo: você pode saber dirigir um carro perfeitamente. Mas
              se você não sabe pra onde ir, o carro não te leva a lugar&nbsp;nenhum.
            </p>

            {/* Highlight box */}
            <div className="rounded-lg bg-[#0d0d0d] border border-green-500/15 p-6 mt-6">
              <p className="text-base md:text-xl text-white font-semibold leading-relaxed">
                <span className="text-gradient-green">
                  O Claude Code sem contexto é um carro sem GPS.
                </span>
              </p>
              <p className="text-sm md:text-base text-zinc-500 leading-relaxed mt-3">
                Ele não sabe o que é seu projeto. Não sabe seus padrões de
                código. Não sabe suas preferências. Não lembra do que vocês
                fizeram ontem. Toda conversa começa do zero, e você precisa
                explicar tudo de novo, toda&nbsp;vez.
              </p>
              <p className="text-sm md:text-base text-zinc-400 leading-relaxed mt-3 font-medium">
                A não ser que você dê um cérebro pra&nbsp;ele.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ─── Section 7: Segundo Cérebro Upsell ─── */
function SegundoCerebroSection() {
  const ref = useScrollReveal();

  const FEATURES = [
    "CLAUDE.md configurado com regras de operação",
    "Slash commands customizados prontos pra usar",
    "Memory files pra contexto permanente",
    "Templates testados em produção",
  ];

  return (
    <>
      <div className="section-divider" />
      <section className="py-20 sm:py-28 bg-black/95">
        <div ref={ref} className="scroll-reveal mx-auto max-w-3xl px-4 sm:px-6">
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="h-px w-5 bg-green-400/40" />
            <span className="font-mono text-xs uppercase tracking-[0.15em] text-green-400/70">
              Indo além
            </span>
            <span className="h-px w-5 bg-green-400/40" />
          </div>

          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-6">
            O{" "}
            <span className="font-punch text-gradient-green">
              Kit Segundo Cérebro
            </span>
          </h2>

          <div className="space-y-5 mb-8">
            <p className="text-base md:text-lg text-zinc-400 leading-relaxed">
              O sistema que transforma o Claude Code num assistente pessoal que
              conhece você, seu projeto e a forma como você trabalha.
            </p>
            <p className="text-base md:text-lg text-zinc-400 leading-relaxed">
              É uma{" "}
              <strong className="text-white font-semibold">
                estrutura completa de arquivos
              </strong>{" "}
              - CLAUDE.md, slash commands customizados, memory files, templates -
              que você cola no seu projeto e o Claude imediatamente passa a
              trabalhar como se te conhecesse há&nbsp;meses.
            </p>
            <p className="text-base md:text-lg text-zinc-400 leading-relaxed">
              <strong className="text-white font-semibold">
                Não é um curso. Não é um PDF.
              </strong>{" "}
              É um sistema pronto, testado, que funciona no momento em que você
              você&nbsp;instala.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-8">
            {FEATURES.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-green-500/15 flex items-center justify-center">
                  <span className="text-green-400 text-xs font-bold">
                    &#10003;
                  </span>
                </span>
                <span className="text-base md:text-lg text-zinc-400 leading-relaxed">
                  {item}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-5">
            <p className="text-base md:text-lg text-zinc-400 leading-relaxed">
              É o que gerou{" "}
              <strong className="text-white font-semibold">
                mais de 700 mil visualizações
              </strong>{" "}
              no meu perfil. É o que meus seguidores mais me pedem. E é o
              complemento natural do kit que você acabou de ver.
            </p>
            <p className="text-base md:text-xl text-white font-semibold leading-relaxed">
              O Kit Prático te ensina a usar o carro.{" "}
              <span className="text-gradient-green">
                O Segundo Cérebro te dá o GPS, o destino e o copiloto.
              </span>
            </p>

            <Link
              href="/"
              className="group inline-flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-8 py-4 text-base font-bold text-green-400 transition-all duration-200 hover:bg-green-500/20 hover:-translate-y-1 cursor-pointer"
            >
              Quero dar um cérebro pro meu Claude Code
              <span className="transition-transform duration-200 group-hover:translate-x-1">
                &rarr;
              </span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

/* ─── Section 8: Duplo CTA ─── */
function DuploCTASection() {
  const ref = useScrollReveal();

  return (
    <>
      <div className="section-divider" />
      <section id="cta" className="py-20 sm:py-28 bg-black/95">
        <div ref={ref} className="scroll-reveal mx-auto max-w-3xl px-4 sm:px-6">
          {/* CTA 1: Kit gratuito */}
          <div className="rounded-lg border border-green-500/20 bg-green-500/[0.04] p-8 sm:p-10 text-center mb-10">
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="h-px w-5 bg-green-400/40" />
              <span className="font-mono text-xs uppercase tracking-[0.15em] text-green-400/70">
                Kit Gratuito
              </span>
              <span className="h-px w-5 bg-green-400/40" />
            </div>

            <h3 className="font-heading text-xl sm:text-2xl font-bold text-white mb-3">
              Acesse o Kit Prático gratuito
            </h3>
            <p className="text-sm md:text-base text-zinc-400 leading-relaxed max-w-md mx-auto mb-6">
              Instalação, funcionalidades, atalhos e referência completa.
              Gratuito. Sem cadastro.
            </p>

            <a
              href="https://volcano-attempt-da3.notion.site/Kit-Pr-tico-Claude-Code-no-VS-Code-INFUSER-33ec361a978b8162ab2bc022ab34473a"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-lg bg-green-500 px-8 py-4 text-base font-bold text-black transition-all duration-200 hover:bg-green-400 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(168,232,76,0.3)] cursor-pointer green-glow"
            >
              Acessar o Kit Prático
              <ExternalLink className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </a>
          </div>

          {/* CTA 2: Segundo Cérebro */}
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-8 sm:p-10 text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="h-px w-5 bg-green-400/40" />
              <span className="font-mono text-xs uppercase tracking-[0.15em] text-green-400/70">
                Quer ir além?
              </span>
              <span className="h-px w-5 bg-green-400/40" />
            </div>

            <h3 className="font-heading text-xl sm:text-2xl font-bold text-white mb-3">
              Conheça o Kit{" "}
              <span className="font-punch text-gradient-green">
                Segundo Cérebro
              </span>
            </h3>
            <p className="text-sm md:text-base text-zinc-400 leading-relaxed max-w-md mx-auto mb-6">
              O sistema completo que transforma o Claude Code num assistente
              inteligente que conhece você e seu projeto.
            </p>

            <Link
              href="/"
              className="group inline-flex items-center gap-2 rounded-lg border border-green-500/30 bg-transparent px-8 py-4 text-base font-bold text-green-400 transition-all duration-200 hover:bg-green-500/10 hover:-translate-y-1 cursor-pointer"
            >
              Quero dar um cérebro pro meu Claude Code
              <span className="transition-transform duration-200 group-hover:translate-x-1">
                &rarr;
              </span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

/* ─── Footer ─── */
function VSCodeFooter() {
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
        <p className="font-mono text-xs text-zinc-600 leading-relaxed">
          Kit Claude Code no VS Code - por{" "}
          <a
            href="https://instagram.com/yangalasso"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-400/70 hover:text-green-300 transition-colors"
          >
            @yangalasso
          </a>
        </p>
        <p className="font-mono text-xs text-zinc-600 mt-1">
          Conteúdo gratuito &middot; INFUSER
        </p>
      </div>
    </footer>
  );
}

/* ─── Main Component ─── */
export function KitVSCode() {
  return (
    <>
      {/* Full-page background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <FallingPattern
          className="h-full"
          color="#A8E84C"
          backgroundColor="#000000"
          duration={80}
          blurIntensity="0.4rem"
          density={2}
        />
      </div>
      <div className="relative z-10 bg-black/80">
        <VSCodeNavbar />
        <main>
          <HeroSection />
          <AberturaSection />
          <DescobertaSection />
          <VantagensSection />
          <RealidadeSection />
          <KitSection />
          <PonteSection />
          <SegundoCerebroSection />
          <DuploCTASection />
        </main>
        <VSCodeFooter />
      </div>
    </>
  );
}
