"use client";

import { useEffect, useRef, useState } from "react";
import { X, Code2, Target, BookOpen, Video, BarChart3, Expand, ChevronDown, ShoppingBag } from "lucide-react";
import { useScrollReveal } from "@/lib/use-scroll-reveal";
import Image from "next/image";

/* ─── Lightbox Modal ─── */
function ImageLightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm cursor-zoom-out p-4 sm:p-8"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-[101] w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
        aria-label="Fechar"
      >
        <X className="h-5 w-5 text-white" />
      </button>
      <div className="relative max-h-[90vh] max-w-[90vw] overflow-auto rounded-lg" onClick={(e) => e.stopPropagation()}>
        <Image
          src={src}
          alt={alt}
          width={2560}
          height={2560}
          className="w-auto h-auto max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
          quality={95}
          priority
        />
      </div>
    </div>
  );
}

/* ─── Zoomable Image wrapper ─── */
function ZoomableImage({ src, alt, width, height, className, containerClassName, quality = 80, sizes = "(max-width: 768px) 100vw, 1024px", children }: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  containerClassName?: string;
  quality?: number;
  sizes?: string;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className={`group relative cursor-zoom-in ${containerClassName ?? ""}`} onClick={() => setOpen(true)}>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          className={className}
          quality={quality}
        />
        {children}
        {/* Hover overlay — bg covers full image, button pinned to top area so it's always visible */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 pointer-events-none" />
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
          <span className="flex items-center gap-2 rounded-full bg-black/70 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-sm border border-white/10">
            <Expand className="h-3 w-3" />
            Ver inteira
          </span>
        </div>
      </div>
      {open && <ImageLightbox src={src} alt={alt} onClose={() => setOpen(false)} />}
    </>
  );
}

const CHECKOUT_URL = "https://pay.hub.la/6VBtmQtyBG5lFjn12AFO";

const FINAL_CTA_ID = "cta-comprar-final";

function scrollToFinalCta() {
  document
    .getElementById(FINAL_CTA_ID)
    ?.scrollIntoView({ behavior: "smooth", block: "center" });
}

/* ─── Reusable end-of-section CTA (scrolls to the pricing card) ───
   Plain anchor: the site's global SmoothAnchorScroll handles the
   animation for same-page "#" links, same as every other in-page
   link on the site (e.g. the hero's "Entenda como funciona" link). */
function SectionCta() {
  return (
    <div className="mt-14 flex justify-center">
      <a
        href="#comprar"
        className="group inline-flex items-center gap-2 rounded-lg bg-green-500 px-8 py-4 text-base font-bold text-black transition-all duration-200 hover:bg-green-400 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(168,232,76,0.3)] cursor-pointer"
      >
        Quero o Kit Segundo Cérebro <span className="transition-transform duration-200 group-hover:translate-x-1 inline-block">&rarr;</span>
      </a>
    </div>
  );
}

const BUYER_NAMES = [
  "Amanda Pinto", "Henrique da Conceição", "Reginaldo de Melo", "Felipe Marques",
  "Adriano dos Reis", "Wilson de Andrade", "Renata Gomes", "Juliana Alves",
  "Márcio Leite", "Marco do Nascimento", "Diogo Amorim", "Wilson Fernandes",
  "Bruna Queiroz", "Luana Morais", "Thaís Nogueira", "Lara de Moraes",
  "Marcos Vieira", "Daniel Gonçalves", "Natália Cordeiro", "André Cavalcante",
  "Eliane de Carvalho", "Renato Henrique", "Nicolas Menezes", "Valdir de Jesus",
  "Alessandra Martins", "Rita Coelho", "Davi da Rosa", "Márcia Nogueira",
  "Rodrigo Farias", "Mariana de Almeida", "Willian Amaral", "Janaína de Jesus",
  "Tiago de Assis", "Douglas da Cruz", "Nelson de Souza", "Daniele Medeiros",
  "Gilberto Gonçalves", "Alex de Brito", "Diogo Marques", "Tiago Borges",
  "Felipe Filho", "Viviane Amorim", "Michele Silveira", "Raimundo de Lima",
  "Rita Silveira", "Marina Corrêa", "Simone Martins", "Renan Miranda",
  "Felipe Silveira", "Raimundo Alves", "Alex Neto", "Thiago Martins",
  "Ana Sales", "Leandro Filho", "Raimundo Lopes", "Victor Amorim",
  "Larissa Aguiar", "Antônio Maria", "Lucas Pinto", "André Fernandes",
  "Sebastião Teixeira", "Guilherme Correia", "Antônia Correia", "Emerson de Sousa",
  "Artur Amorim", "Renan da Costa", "Luana Maria", "Sara Machado",
  "Fernando da Silva", "Henrique Farias", "Artur da Conceição", "Nicolas Borges",
  "Luis Rodrigues", "Tiago Henrique", "Anderson de Brito", "Edson Morais",
  "Lúcia Farias", "Fabrício da Conceição", "Renato França", "Raimundo da Cruz",
  "Sebastião Batista", "Raquel Dias", "Fernando Machado", "Bruna Cavalcante",
  "Alexandre Henrique", "Daniel Aparecida", "Adriana Lopes", "Bruna Nogueira",
  "Sandra de Paula", "Antônia Bezerra", "Flávia de Jesus", "Murilo Ribeiro",
  "Gabriel de Carvalho", "Júlio Sales", "Sônia Pinto", "Janaína Dias",
  "Maria Sales", "Emerson Coelho", "Henrique de Araújo", "Eduardo de Oliveira",
];

/* ─── Social Proof Toast ─── */
function SocialProofToast() {
  const [current, setCurrent] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const lastIndex = useRef<number>(-1);

  useEffect(() => {
    const mountId = setTimeout(() => setMounted(true), 0);
    let showTimeout: ReturnType<typeof setTimeout>;
    let hideTimeout: ReturnType<typeof setTimeout>;

    const pickName = () => {
      let idx = Math.floor(Math.random() * BUYER_NAMES.length);
      if (idx === lastIndex.current) idx = (idx + 1) % BUYER_NAMES.length;
      lastIndex.current = idx;
      return BUYER_NAMES[idx];
    };

    const scheduleNext = () => {
      const delay = 10_000 + Math.random() * 15_000; // 10-25s
      showTimeout = setTimeout(() => {
        setCurrent(pickName());
        hideTimeout = setTimeout(() => {
          setCurrent(null);
          scheduleNext();
        }, 5000);
      }, delay);
    };

    scheduleNext();
    return () => {
      clearTimeout(mountId);
      clearTimeout(showTimeout);
      clearTimeout(hideTimeout);
    };
  }, []);

  if (!mounted) return null;

  const initials = (name: string) =>
    name
      .split(/\s+/)
      .filter((p) => p.length > 2)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase();

  return (
    <div
      className={`fixed bottom-4 left-4 z-50 max-w-[280px] sm:max-w-xs transition-all duration-500 motion-reduce:transition-none ${
        current ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      {current && (
        <div className="flex items-center gap-3 rounded-lg border border-green-500/30 bg-black/90 backdrop-blur-md px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
          <span className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-[11px] font-bold text-black">
            {initials(current)}
          </span>
          <div className="flex-1 min-w-0 text-[13px] leading-tight">
            <div className="font-semibold text-white truncate">{current}</div>
            <div className="text-[11px] text-green-300">acabou de adquirir o Kit Segundo Cérebro!</div>
          </div>
          <ShoppingBag className="h-4 w-4 text-green-400 flex-shrink-0" />
        </div>
      )}
    </div>
  );
}

/* ─── Section 1: Hero ─── */
function HeroSection() {

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-28 pb-16">
      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 text-center">
        {/* Headline */}
        <h1 className="animate-fade-in-up delay-100 font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
          Configura uma vez.
          <br />
          <span className="font-punch text-gradient-green">Ele nunca mais esquece.</span>
        </h1>

        {/* Subheadline */}
        <p className="animate-fade-in-up delay-200 mt-6 max-w-2xl mx-auto text-base sm:text-lg text-zinc-400 leading-relaxed">
          O sistema completo pra dar <strong className="text-gradient-green font-semibold">memória permanente</strong> pro seu Claude Code. Ele lembra quem você é, o que faz, e o que precisa — <strong className="text-white">sem você explicar de novo toda vez.</strong>
        </p>

        {/* Video */}
        <div className="animate-fade-in-up delay-300 mt-10 max-w-2xl mx-auto rounded-lg overflow-hidden border border-green-500/10">
          <video
            src="/video-segundo-cerebro.mp4"
            className="w-full aspect-video object-cover"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
          />
        </div>

        {/* CTA */}
        <div className="animate-fade-in-up delay-400 mt-10 flex flex-col items-center">
          <a
            href="#comprar"
            className="group inline-flex items-center gap-2 rounded-lg bg-green-500 px-10 py-4 text-base font-bold text-black transition-all duration-200 hover:bg-green-400 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(168,232,76,0.3)] cursor-pointer green-glow"
          >
            Quero o Segundo Cérebro! <span className="transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
          </a>
          <a
            href="#como-funciona"
            className="group/scroll mt-5 inline-flex flex-col items-center gap-1 text-green-300/60 hover:text-green-300 transition-colors duration-200 cursor-pointer"
          >
            <span className="font-mono text-[13px] font-medium tracking-wide">Entenda como funciona</span>
            <span className="animate-bounce text-lg">↓</span>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─── Section 2: A Dor ─── */
function PainSection() {
  const ref = useScrollReveal();
  const PAIN_ITEMS = [
    "Abre um chat novo e precisa explicar tudo do zero",
    "Perde 5 minutos dando contexto antes de cada tarefa",
    "A resposta sai genérica porque ele não te conhece",
    "Não lembra o que vocês fizeram ontem",
    "Não sabe quais decisões você já tomou",
    "Repete sugestões que você já descartou semanas atrás",
    "Cada sessão começa do zero, como se vocês nunca tivessem conversado",
  ];

  return (
    <>
    <div className="section-divider" />
    <section id="como-funciona" className="py-20 sm:py-28 bg-black/80">
      <div ref={ref} className="scroll-reveal mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-8">
          Isso aqui te parece familiar?
        </h2>

        <div className="space-y-5 mb-10">
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            Você abre o Claude Code. Tem uma tarefa pra fazer. Mas antes de começar, precisa explicar tudo de novo.
          </p>
          <p className="text-[15px] text-zinc-300 italic leading-relaxed">
            &ldquo;Eu sou freelancer, trabalho com design, meu público é tal, meu preço é tal, o projeto atual é esse, o cliente pediu aquilo...&rdquo;
          </p>
          <p className="text-[15px] font-semibold">
            <span className="text-gradient-green">Toda. Santa. Vez.</span>
          </p>
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            Você digita um parágrafo inteiro de contexto antes de fazer a pergunta real. E mesmo assim, a resposta vem genérica porque o Claude não sabe o suficiente sobre você.
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/5 my-10" />

        {/* Pain list */}
        <div className="space-y-4 mb-10">
          {PAIN_ITEMS.map((item) => (
            <div key={item} className="flex items-start gap-3">
              <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-red-500/15 flex items-center justify-center">
                <span className="text-red-400 text-xs font-bold">×</span>
              </span>
              <span className="text-[15px] text-zinc-400 leading-relaxed">{item}</span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-white/5 my-10" />

        {/* Closing paragraphs */}
        <div className="space-y-5">
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            E a pior parte? Você sabe que o Claude é capaz de muito mais. Você vê o potencial. Mas ele está operando com amnésia permanente. É como ter um sócio brilhante que acorda toda manhã sem nenhuma lembrança do dia anterior.
          </p>
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            Agora multiplica isso por semanas. Meses. Quantas horas você já perdeu re-explicando as mesmas coisas?
          </p>
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            Quantas respostas genéricas você aceitou porque não tinha paciência de contextualizar tudo de novo?
          </p>
          <p className="text-[15px] text-white font-semibold leading-relaxed">
            E o pior: quantas vezes você <span className="text-gradient-green">deixou de usar o Claude</span> porque dava preguiça de explicar tudo de novo?
          </p>
        </div>
        <SectionCta />
      </div>
    </section>
    </>
  );
}

/* ─── Section 3: A Revelação ─── */
function RevelationSection() {
  const ref = useScrollReveal();
  const BENEFITS = [
    "Sabe quem você é e o que faz",
    "Lembra dos seus projetos, objetivos e decisões",
    "Se atualiza sozinho a cada sessão de trabalho",
    "Executa tarefas complexas com um único comando",
    "Fica mais inteligente quanto mais você usa",
    "Funciona como um sócio que nunca esquece nada",
  ];

  return (
    <>
    <div className="section-divider" />
    <section className="py-20 sm:py-28">
      <div ref={ref} className="scroll-reveal mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-6">
          E se você configurasse{" "}
          <span className="font-punch text-gradient-green">uma vez</span>{" "}
          e ele nunca mais esquecesse?
        </h2>

        <p className="text-[15px] text-zinc-400 leading-relaxed mb-6">
          Imagina abrir o Claude Code numa segunda-feira de manhã e, em vez de gastar 10 minutos explicando contexto, você digita uma linha:
        </p>

        {/* Terminal block */}
        <div className="rounded-lg bg-[#0d0d0d] border border-green-500/15 p-5 mb-6 font-mono">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-3 h-3 rounded-full bg-red-500/60" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <span className="w-3 h-3 rounded-full bg-green-500/60" />
          </div>
          <p className="text-green-400 text-sm">
            <span className="text-zinc-500">$</span> /daily-briefing
          </p>
        </div>

        <p className="text-[15px] text-zinc-400 leading-relaxed mb-2">
          E ele te responde com um briefing completo do seu dia: o que ficou pendente da semana passada, quais projetos estão ativos, quais decisões você tomou recentemente, o que precisa de atenção urgente, e o que fazer primeiro.
        </p>
        <p className="text-[15px] text-white font-semibold mb-4">
          Sem você explicar nada. Porque <span className="text-gradient-green">ele já sabe tudo.</span>
        </p>

        {/* Screenshot: /daily-briefing output */}
        <div className="rounded-lg overflow-hidden border border-green-500/10 mb-10 image-frame">
          <ZoomableImage
            src="/segundo-cerebro/daily-briefing.webp"
            alt="Output do /daily-briefing — briefing completo do dia com pipeline e prioridades"
            width={1065}
            height={1398}
            className="w-full h-auto"
            quality={90}
          />
        </div>

        {/* Divider */}
        <div className="h-px bg-white/5 my-10" />

        {/* Benefits */}
        <div className="space-y-4 mb-10">
          {BENEFITS.map((item) => (
            <div key={item} className="flex items-start gap-3">
              <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-green-500/15 flex items-center justify-center">
                <span className="text-green-400 text-xs font-bold">&#10003;</span>
              </span>
              <span className="text-[15px] text-zinc-400 leading-relaxed">{item}</span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-white/5 my-10" />

        {/* Closing */}
        <div className="space-y-5">
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            Isso não é ficção. Não é uma feature futura do Claude. <strong className="text-gradient-green font-semibold">Isso funciona hoje.</strong>
          </p>
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            É um sistema de memória persistente que usa o Obsidian como vault e o Claude Code como cérebro. Você alimenta o sistema com o que ele precisa saber sobre você, e ele usa essa informação pra operar com contexto completo. Sempre.
          </p>
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            Eu construi esse sistema pra mim. Levei semanas refinando cada detalhe: as regras de operação, os guardrails, a lógica de memória, os comandos personalizados. E agora empacotei tudo num kit pronto pra você usar.
          </p>
        </div>

        {/* Screenshot: .claude/commands/ */}
        <div className="rounded-lg overflow-hidden border border-green-500/10 mt-8 image-frame">
          <ZoomableImage
            src="/segundo-cerebro/8-comandos.webp"
            alt="Pasta .claude/commands/ — 8 slash commands prontos"
            width={939}
            height={374}
            className="w-full h-auto"
            quality={90}
          />
        </div>
        <SectionCta />
      </div>
    </section>
    </>
  );
}

/* ─── Daily Briefing Card (special: image covers full height) ─── */
function DailyBriefingCard() {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <div className="md:col-span-5 glass border-green-500/10 rounded-lg overflow-hidden flex flex-col group">
      <div className="flex-1 relative min-h-[400px] cursor-zoom-in" onClick={() => setLightboxOpen(true)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/segundo-cerebro/daily-briefing.webp"
          alt="Output do /daily-briefing no terminal"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#0d0f0d] to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 pointer-events-none" />
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
          <span className="flex items-center gap-2 rounded-full bg-black/70 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-sm border border-white/10">
            <Expand className="h-3 w-3" />
            Ver inteira
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-mono text-green-400 text-sm font-bold mb-2">/daily-briefing</h3>
        <p className="text-[13px] text-zinc-500 leading-relaxed">
          Um comando. Briefing completo do dia com tudo que você precisa saber.
        </p>
      </div>
      {lightboxOpen && (
        <ImageLightbox
          src="/segundo-cerebro/daily-briefing.webp"
          alt="Output do /daily-briefing no terminal"
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}

/* ─── Section 4: Demo Visual (Bento Grid) ─── */
function DemoSection() {
  const ref = useScrollReveal();
  return (
    <>
    <div className="section-divider" />
    <section className="py-20 sm:py-28 bg-black/80">
      <div ref={ref} className="scroll-reveal mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-center mb-3">
          Olha o que ele faz com{" "}
          <span className="font-punch text-gradient-green">um comando</span>
        </h2>
        <p className="text-center text-zinc-500 text-[15px] mb-12">
          Screenshots reais do sistema funcionando.
        </p>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:items-stretch">

          {/* Row 1: daily-briefing stretches full height, image covers */}
          <DailyBriefingCard />

          <div className="md:col-span-7 flex flex-col gap-4">
            {/* braindump */}
            <div className="glass border-green-500/10 rounded-lg overflow-hidden image-frame">
              <div className="overflow-hidden rounded-t-lg">
                <ZoomableImage
                  src="/segundo-cerebro/braindump.webp"
                  alt="Output do /braindump no terminal"
                  width={1065}
                  height={748}
                  className="w-full h-auto"
                />
              </div>
              <div className="p-5">
                <h3 className="font-mono text-green-400 text-sm font-bold mb-2">/braindump</h3>
                <p className="text-[13px] text-zinc-500 leading-relaxed">
                  Teve uma ideia? Joga pro cérebro. Ele captura, conecta com o que já existe no vault, e arquiva.
                </p>
              </div>
            </div>

            {/* end-session */}
            <div className="glass border-green-500/10 rounded-lg overflow-hidden image-frame">
              <div className="overflow-hidden rounded-t-lg max-h-[400px] relative">
                <ZoomableImage
                  src="/segundo-cerebro/end-session.webp"
                  alt="Output do /end-session — fechamento de sessão completo"
                  width={1070}
                  height={1559}
                  className="w-full h-auto"
                >
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0d0f0d] to-transparent pointer-events-none" />
                </ZoomableImage>
              </div>
              <div className="p-5">
                <h3 className="font-mono text-green-400 text-sm font-bold mb-2">/end-session</h3>
                <p className="text-[13px] text-zinc-500 leading-relaxed">
                  Terminou de trabalhar? Um comando e ele consolida tudo que aconteceu, atualiza a memória, registra decisões e aprendizados.{" "}
                  <strong className="text-gradient-green">Amanhã quando você abrir, ele sabe exatamente onde vocês pararam.</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Row 2: Obsidian full-width */}
          <div className="md:col-span-12 glass border-green-500/10 rounded-lg overflow-hidden image-frame">
            <div className="overflow-hidden rounded-t-lg">
              <ZoomableImage
                src="/segundo-cerebro/obsidian-full.webp"
                alt="Vault completo no Obsidian — sidebar com estrutura de pastas e current-state aberto"
                width={2559}
                height={1379}
                className="w-full h-auto"
              />
            </div>
            <div className="p-5">
              <h3 className="font-mono text-green-400 text-sm font-bold mb-2">O vault no Obsidian</h3>
              <p className="text-[13px] text-zinc-500 leading-relaxed">
                Tudo organizado. Memória, knowledge base, learnings, decisions, pipeline. Cada arquivo se conecta ao outro.
              </p>
            </div>
          </div>

        </div>
        <SectionCta />
      </div>
    </section>
    </>
  );
}

/* ─── Section 5: O Que Vem no Kit ─── */
function KitContentsSection() {
  const CARDS = [
    {
      title: "CLAUDE.md — A alma do cérebro",
      desc: "Centenas de linhas de prompt engineering refinado: identidade personalizável, regras de memória, guardrails de escrita, proteção contra prompt injection, lógica de auto-atualização, módulo de negócios ativável, e tabela de comandos. E o que faz o sistema funcionar. Levei semanas refinando esse arquivo.",
      highlight: true,
    },
    {
      title: "8 Slash Commands prontos",
      desc: "4 comandos universais (daily-briefing, end-session, braindump, weekly-review) + 1 semi-universal (content-idea) + 3 do módulo de negócios (prospect-research, pipeline, proposal-generator). Cada um é um mini-sistema com lógica condicional e formatação profissional.",
      highlight: true,
    },
    {
      title: "4 Prompts de Setup",
      desc: "Os mesmos prompts que eu mostro no vídeo. Criam a estrutura do vault, geram os templates de knowledge, inicializam a memória, e validam que tudo funciona. Você não precisa lembrar de cor — está tudo pronto pra copiar e colar.",
      highlight: false,
    },
    {
      title: "9 Templates de Knowledge",
      desc: "4 universais (about-me, goals, projects, references) + 5 do módulo de negócios (positioning, icp, services, tone-of-voice, pricing). Cada template tem perguntas-guia que te ajudam a preencher sem ficar olhando pra tela em branco.",
      highlight: false,
    },
    {
      title: "Guia de Instalação",
      desc: "Do zero ao vault funcionando. Passo a passo com screenshots: instalar Obsidian, instalar Claude Code, configurar, testar. Inclui setup de Git sync pra backup automático.",
      highlight: false,
    },
    {
      title: "Guia de Personalização",
      desc: "Como transformar o template generico no SEU cérebro. Com exemplos pra diferentes perfis: freelancer, dev, estudante, criador de conteúdo, gestor. Inclui dicas avançadas pra criar novos comandos.",
      highlight: false,
    },
    {
      title: "Suporte Infinito via IA",
      desc: "Um prompt que você cola num chat novo e ganha um assistente que conhece o kit inteiro. Tira dúvidas, ajuda a personalizar, resolve erros, guia criação de novos comandos. Disponível 24h, sem fila, sem ticket. Pra sempre.",
      highlight: true,
    },
    {
      title: "Vault completo com estrutura pronta",
      desc: "Não precisa criar nada do zero. O vault já vem montado com todas as pastas organizadas (_memory, _knowledge, _learnings, _decisions, _sessions, _pipeline), onboarding (START-HERE.md), exemplo preenchido de pipeline, e .gitignore configurado. Descompacta e já está rodando.",
      highlight: false,
    },
  ];

  const ref = useScrollReveal();
  return (
    <>
    <div className="section-divider" />
    <section id="kit" className="py-20 sm:py-28">
      <div ref={ref} className="scroll-reveal mx-auto max-w-4xl px-4 sm:px-6">
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-center mb-3">
          O que vem no kit
        </h2>
        <p className="text-center text-[15px] text-zinc-400 mb-4">
          Não é um curso. Não é um ebook. É um{" "}
          <strong className="text-gradient-green font-semibold">sistema pronto pra usar.</strong>{" "}
          Você descompacta, personaliza com os seus dados, e o cérebro já está funcionando.
        </p>

        {/* Screenshots: CLAUDE.md hero + vault structure & about-me side by side */}
        <div className="space-y-4 mb-12">
          {/* CLAUDE.md — full width hero shot */}
          <div className="rounded-lg overflow-hidden border border-green-500/10 image-frame">
            <ZoomableImage
              src="/segundo-cerebro/claude-md.webp"
              alt="CLAUDE.md aberto — centenas de linhas de prompt engineering"
              width={2123}
              height={1327}
              className="w-full h-auto"
            />
            <div className="px-4 py-3 bg-zinc-900/50">
              <p className="font-mono text-[10px] uppercase tracking-widest text-green-400/60">CLAUDE.md — a alma do cérebro</p>
            </div>
          </div>

          {/* Row 2: estrutura do vault + about-me */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Estrutura do vault — image dictates height */}
            <div className="rounded-lg overflow-hidden border border-green-500/10 image-frame">
              <ZoomableImage
                src="/segundo-cerebro/estrutura-do-vault.webp"
                alt="Sidebar do Obsidian — estrutura do vault"
                width={935}
                height={591}
                className="w-full h-auto"
              />
              <div className="px-4 py-3 bg-zinc-900/50">
                <p className="font-mono text-[10px] uppercase tracking-widest text-green-400/60">Estrutura do vault</p>
              </div>
            </div>
            {/* About-me — aspect ratio matched to vault image, cropped with fade */}
            <div className="rounded-lg overflow-hidden border border-green-500/10 image-frame">
              <div className="aspect-[935/591] overflow-hidden relative">
                <ZoomableImage
                  src="/segundo-cerebro/about-me.webp"
                  alt="Template about-me.md — perguntas-guia para personalização"
                  width={716}
                  height={1763}
                  className="w-full h-auto"
                >
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0d0f0d] to-transparent pointer-events-none" />
                </ZoomableImage>
              </div>
              <div className="px-4 py-3 bg-zinc-900/50">
                <p className="font-mono text-[10px] uppercase tracking-widest text-green-400/60">Template about-me.md</p>
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-white/5 mb-12" />

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CARDS.map((card) => (
            <div
              key={card.title}
              className={`glass p-6 card-hover ${
                card.highlight
                  ? "border-green-500/15 bg-gradient-to-br from-white/5 to-green-500/[0.03]"
                  : ""
              }`}
            >
              <h3 className={`font-mono text-sm font-bold mb-2 ${card.highlight ? "text-green-400" : "text-green-400/70"}`}>
                {card.highlight && "* "}
                {card.title}
              </h3>
              <p className="text-[13px] text-zinc-500 leading-relaxed">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
        <SectionCta />
      </div>
    </section>
    </>
  );
}

/* ─── Section 6: Pra Quem É ─── */
function AudienceSection() {
  const PROFILES: { icon: React.ReactNode; title: string; desc: string }[] = [
    { icon: <Code2 className="h-5 w-5 text-green-400" />, title: "Desenvolvedores", desc: "Gerencia sprints, documenta decisões técnicas, registra aprendizados de debugging. O daily-briefing vira seu standup pessoal. Renomeia _pipeline/ pra _projects/ e pronto." },
    { icon: <Target className="h-5 w-5 text-green-400" />, title: "Freelancers e Agencias", desc: "Pipeline de clientes, pesquisa de prospects, geracao de propostas, follow-ups. O módulo de negócios foi feito pra você. O Claude vira seu gerente comercial que nunca esquece um lead." },
    { icon: <BookOpen className="h-5 w-5 text-green-400" />, title: "Estudantes e Pesquisadores", desc: "Organiza TCC, mestrado, projetos de pesquisa. Captura insights com braindump, registra referências, acompanha progresso. O weekly-review vira sua bússola acadêmica." },
    { icon: <Video className="h-5 w-5 text-green-400" />, title: "Criadores de Conteúdo", desc: "Calendário editorial, ideias de conteúdo, posicionamento, tom de voz. O /content-idea gera sugestões baseadas no que você já publicou e nos seus objetivos." },
    { icon: <BarChart3 className="h-5 w-5 text-green-400" />, title: "Gestores e Líderes", desc: "Acompanha projetos da equipe, registra decisões estratégicas, revisão semanal de prioridades. O vault vira seu segundo cérebro gerencial." },
  ];

  const ref = useScrollReveal();
  return (
    <>
    <div className="section-divider" />
    <section className="py-20 sm:py-28 bg-black/80">
      <div ref={ref} className="scroll-reveal mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-4">
          Funciona pra você se você usa{" "}
          <span className="font-punch text-gradient-green">Claude Code</span>
        </h2>
        <p className="text-[15px] text-zinc-400 leading-relaxed mb-10">
          O kit é modular. Vem com um core universal que funciona pra qualquer pessoa + um módulo de negócios que é opcional. Você usa o que fizer sentido e adapta o resto.
        </p>

        <div className="space-y-4">
          {PROFILES.map((profile) => (
            <div
              key={profile.title}
              className="glass p-6 flex items-start gap-4 card-hover"
            >
              <span className="flex-shrink-0 w-8 h-8 rounded-md bg-green-500/10 flex items-center justify-center">{profile.icon}</span>
              <div>
                <h3 className="font-heading text-[15px] font-bold text-white mb-1">
                  {profile.title}
                </h3>
                <p className="text-[13px] text-zinc-500 leading-relaxed">
                  {profile.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
        <SectionCta />
      </div>
    </section>
    </>
  );
}

/* ─── Section 7: Pra Quem NÃO É ─── */
function NotForSection() {
  const WARNINGS = [
    { title: "Você não tem Claude Code.", desc: "O kit depende do Claude Code funcionando na sua máquina. Sem ele, os slash commands não rodam." },
    { title: "Você quer mágica sem esforço.", desc: "O kit vem com templates e guias, mas você precisa preencher com os SEUS dados. São 30-60 minutos de setup inicial. Se não está disposto a investir esse tempo, não vai funcionar." },
    { title: "Você espera um curso com vídeo-aulas.", desc: "Isso não é um curso. É um sistema pronto. Tem guias escritos e suporte via IA, mas não tem vídeo-aula de 10 horas. É direto ao ponto." },
  ];

  const ref = useScrollReveal();
  return (
    <>
    <div className="section-divider" />
    <section className="py-20 sm:py-28">
      <div ref={ref} className="scroll-reveal mx-auto max-w-4xl px-4 sm:px-6">
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-4">
          Honestidade: esse kit{" "}
          <strong>não é</strong>{" "}
          pra todo mundo
        </h2>
        <p className="text-[15px] text-zinc-400 leading-relaxed mb-10">
          Eu prefiro te dizer agora do que você descobrir depois. Se algum desses se aplica, esse kit não é pra você:
        </p>

        <div className="space-y-4">
          {WARNINGS.map((warning) => (
            <div
              key={warning.title}
              className="glass border-amber-500/10 p-6 flex items-start gap-4"
            >
              <span className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full bg-amber-500/15 flex items-center justify-center">
                <span className="text-amber-400 text-xs font-bold">⚠</span>
              </span>
              <div>
                <h3 className="font-heading text-[15px] font-bold text-white mb-1">
                  {warning.title}
                </h3>
                <p className="text-[13px] text-zinc-500 leading-relaxed">
                  {warning.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-base sm:text-lg text-zinc-400 text-center font-medium">
          Se nenhum desses se aplica, continua lendo. O que vem a seguir vai fazer <span className="text-gradient-green font-semibold">R$67 parecer piada.</span>
        </p>
        <SectionCta />
      </div>
    </section>
    </>
  );
}

/* ─── Section 8: Comparação de Valor ─── */
function ValueComparisonSection() {
  const COMPARISONS = [
    { price: "R$70", label: "Um rodízio japonês", duration: "dura 2 horas", highlight: false },
    { price: "R$65", label: "Netflix + Spotify por 1 mês", duration: "dura 30 dias", highlight: false },
    { price: "R$60", label: "Um corte de cabelo no salão", duration: "dura 3 semanas", highlight: false },
    { price: "R$67", label: "Kit Segundo Cérebro", duration: "funciona pra sempre", highlight: true },
  ];

  const ref = useScrollReveal();
  return (
    <>
    <div className="section-divider" />
    <section className="py-20 sm:py-28 bg-black/80">
      <div ref={ref} className="scroll-reveal mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-center mb-12">
          O que mais você compra com{" "}
          <span className="font-punch text-gradient-green">R$67</span>?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          {COMPARISONS.map((item) => (
            <div
              key={item.label}
              className={`rounded-lg p-6 text-center transition-all ${
                item.highlight
                  ? "border-2 border-green-500/40 bg-green-500/[0.06] green-glow-sm"
                  : "glass"
              }`}
            >
              <div className={`font-punch text-2xl font-extrabold mb-1 ${item.highlight ? "text-gradient-green" : "text-zinc-300"}`}>
                {item.price}
              </div>
              <div className={`text-sm font-semibold mb-2 ${item.highlight ? "text-white" : "text-zinc-400"}`}>
                {item.label}
              </div>
              <div className={`font-mono text-[11px] uppercase tracking-widest ${item.highlight ? "text-green-300" : "text-zinc-600"}`}>
                {item.duration}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-5">
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            O rodízio acaba em 2 horas. O streaming reseta no mês seguinte. O cabelo cresce de volta.
          </p>
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            O segundo cérebro <strong className="text-gradient-green font-semibold">fica mais inteligente a cada dia que você usa.</strong> Acumula conhecimento, registra decisões, consolida aprendizados. Daqui a 6 meses ele vai saber mais sobre o seu trabalho do que qualquer colega.
          </p>
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            R$67 é menos do que você gasta num jantar fora. Só que o jantar acaba na mesma noite — e o segundo cérebro fica melhor a cada semana.
          </p>
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            Se você ganha R$50/hora e o kit te economiza 1 hora por semana (e vai economizar mais), ele se paga em menos de duas semanas. Nas 50 semanas seguintes, é lucro puro — de tempo, não de dinheiro. <strong className="text-white">Tempo que você usa pra fazer o que importa em vez de ficar explicando contexto pra IA.</strong>
          </p>
        </div>
        <SectionCta />
      </div>
    </section>
    </>
  );
}

/* ─── FAQ Accordion Item ─── */
function SCFAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/5 last:border-b-0">
      <button onClick={() => setOpen(!open)} className="w-full py-6 flex items-start gap-3 text-left cursor-pointer group">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-zinc-300 text-[13px] font-bold group-hover:bg-green-500/20 group-hover:text-green-400 transition-colors duration-200">?</span>
        <h3 className="font-heading text-[15px] font-semibold text-white leading-snug flex-1 group-hover:text-green-300 transition-colors duration-200">{q}</h3>
        <ChevronDown className={`h-4 w-4 text-zinc-500 flex-shrink-0 mt-0.5 transition-transform duration-300 ${open ? "rotate-180 text-green-400" : ""}`} />
      </button>
      <div className={`faq-answer ${open ? "open" : ""}`}>
        <div><p className="text-sm text-zinc-400 leading-relaxed pl-9 pb-6">{a}</p></div>
      </div>
    </div>
  );
}

/* ─── Section 9: FAQ ─── */
function FAQSection() {
  const QUESTIONS = [
    {
      q: "\"Eu consigo fazer isso sozinho.\"",
      a: "A estrutura de pastas? Sim. Mas o CLAUDE.md com centenas de linhas de prompt engineering refinado, guardrails de proteção, lógica de memória auto-atualizável, e 8 slash commands com lógica condicional encadeada? Esse é o trabalho de semanas que você recebe pronto. O setup que você vê no vídeo é a parte fácil. A alma que faz funcionar é o que está no kit.",
    },
    {
      q: "Preciso de qual plano do Claude?",
      a: "Qualquer plano que dê acesso ao Claude Code: Pro, Max ou API. O kit não requer nenhuma feature especial. Se você já usa Claude Code, tem tudo que precisa.",
    },
    {
      q: "Funciona pro meu caso? Eu não sou empresário.",
      a: "O kit é modular. O core universal (daily-briefing, end-session, braindump, weekly-review, templates de identidade/objetivos/projetos) funciona pra qualquer pessoa. O módulo de negócios (prospect-research, pipeline, proposal-generator) é opcional — pode usar ou deletar. Tem exemplos de personalização pra dev, estudante, criador de conteúdo, gestor, freelancer.",
    },
    {
      q: "E se o Claude atualizar e o kit ficar desatualizado?",
      a: "O kit é feito de arquivos markdown. Markdown não tem versão, não tem dependência, não quebra com updates. O CLAUDE.md e os slash commands funcionam com qualquer versão do Claude Code. A estrutura é atemporal por design.",
    },
    {
      q: "\"São só arquivos de texto. Pagar por .md?\"",
      a: "Da mesma forma que um contrato de 2 páginas pode valer milhões e um livro pode mudar uma vida — o valor não está no formato, está no conteúdo. Você está pagando pelas semanas de refinamento condensadas em arquivos prontos pra usar. Pelo prompt engineering. Pela lógica dos comandos. Pelos guardrails. Pelo tempo que você NÃO vai gastar tentando fazer tudo do zero.",
    },
    {
      q: "E se eu não conseguir configurar?",
      a: "O kit vem com guia de instalação passo a passo, guia de personalização com exemplos, 4 prompts de setup que fazem o trabalho pesado, e um prompt de suporte via IA que você cola num chat e tem um assistente disponível 24h que conhece o kit inteiro. Se mesmo assim travar, me manda uma DM.",
    },
  ];

  const ref = useScrollReveal();
  return (
    <>
    <div className="section-divider" />
    <section id="faq" className="py-20 sm:py-28">
      <div ref={ref} className="scroll-reveal mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight mb-10">
          Perguntas que você
          <br />
          <span className="font-punch text-gradient-green">provavelmente tem.</span>
        </h2>

        <div>
          {QUESTIONS.map((item) => (
            <SCFAQItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
        <SectionCta />
      </div>
    </section>
    </>
  );
}

/* ─── Section 10: Suporte Infinito ─── */
function SupportSection() {
  const ref = useScrollReveal();
  return (
    <>
    <div className="section-divider" />
    <section className="py-20 sm:py-28 bg-black/80">
      <div ref={ref} className="scroll-reveal mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-6">
          Compre uma vez. Tenha suporte{" "}
          <span className="font-punch text-gradient-green">pra sempre.</span>
        </h2>

        <p className="text-[15px] text-zinc-400 leading-relaxed mb-8">
          Eu não tenho uma equipe de suporte. Mas você não precisa de uma.
        </p>

        {/* Highlighted box */}
        <div className="rounded-lg border border-green-500/20 bg-green-500/[0.06] p-8 mb-8">
          <h3 className="font-heading text-xl font-bold text-white mb-4">
            Suporte Infinito via IA
          </h3>
          <p className="text-[15px] text-zinc-400 leading-relaxed mb-3">
            Dentro do kit tem um arquivo chamado <strong className="text-white">prompt-suporte-llm.md</strong>. Você copia o conteúdo, cola num chat novo do Claude ou ChatGPT, e ganha um assistente que conhece o kit inteiro.
          </p>
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            Ele tira dúvidas de instalação, ajuda a personalizar, resolve erros, ensina a criar novos comandos, e guia qualquer modificação que você quiser fazer. <strong className="text-gradient-green font-semibold">Disponível 24h. Sem fila. Sem ticket. Sem prazo de expiração.</strong>
          </p>
        </div>

        <p className="text-[15px] text-zinc-400 leading-relaxed">
          Pensa nisso: você está pagando R$67 por um kit que vem com suporte técnico ilimitado e permanente. Qualquer SaaS cobra isso <em>por mês</em> só pelo suporte.
        </p>
        <SectionCta />
      </div>
    </section>
    </>
  );
}

/* ─── Section 11: Preço + CTA ─── */
function PricingSection() {
  const ref = useScrollReveal();
  return (
    <>
    <div className="section-divider" />
    <section id="comprar" className="py-24 sm:py-32 relative">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-green-500/[0.04] blur-[150px] pointer-events-none" />

      <div ref={ref} className="scroll-reveal relative z-10 mx-auto max-w-4xl px-4 sm:px-6 text-center">
        <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
          Pronto pra montar o seu?
        </h2>

        <div className="space-y-4 text-[15px] text-zinc-400 leading-relaxed max-w-2xl mx-auto mb-10">
          <p>
            Se eu vendesse isso como consultoria de setup personalizado, cobraria R$3.000+ (e já vendi). Se vendesse como curso com vídeo-aulas, cobraria R$197. Se vendesse como assinatura mensal com suporte, cobraria R$97/mês.
          </p>
          <p>
            Mas não é nada disso. É um kit pronto. Você baixa, personaliza, e usa. Uma vez.
          </p>
        </div>

        {/* Price box */}
        <div className="mx-auto max-w-sm rounded-lg border-2 border-green-500/40 bg-green-500/[0.06] p-8 mb-6">
          <div className="font-mono text-lg text-zinc-500 line-through mb-1">R$127</div>
          <div className="font-punch text-5xl sm:text-6xl font-extrabold text-gradient-green mb-2">R$67</div>
          <p className="text-sm text-green-300/70 mb-6">
            Pagamento único. Sem assinatura. Sem renovação.
          </p>
          <a
            href={CHECKOUT_URL}
            className="group block w-full rounded-lg bg-green-500 px-8 py-4 text-lg font-bold text-black transition-all duration-200 hover:bg-green-400 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(168,232,76,0.3)] cursor-pointer"
          >
            Quero o Kit Segundo Cérebro <span className="transition-transform duration-200 group-hover:translate-x-1 inline-block">&rarr;</span>
          </a>
          <p className="font-mono text-[11px] text-zinc-500 mt-4">
            Pagamento seguro via Hubla &middot; Entrega instantânea &middot; Acesso imediato
          </p>
        </div>

        <p className="font-mono text-[12px] text-zinc-600 leading-relaxed">
          CLAUDE.md profissional &middot; 8 slash commands &middot; 4 prompts de setup &middot; 9 templates &middot; Guias completos &middot; Suporte via IA incluso
        </p>
      </div>
    </section>
    </>
  );
}

/* ─── Section 12: Último Empurrão ─── */
function FinalPushSection() {
  const ref = useScrollReveal();
  return (
    <>
    <div className="section-divider" />
    <section className="py-20 sm:py-28 bg-black/80">
      <div ref={ref} className="scroll-reveal mx-auto max-w-2xl px-4 sm:px-6">
        <div className="space-y-6 text-base sm:text-lg text-zinc-400 leading-relaxed">
          <p>Você tem duas opções agora.</p>
          <p>
            A primeira é fechar essa página. Abrir o Claude Code amanhã. Digitar aquele parágrafo de contexto que você sempre digita. Receber uma resposta genérica. Repetir isso na terça, na quarta, na semana que vem, no mês que vem. E cada vez que abrir um chat novo, começar do zero. De novo.
          </p>
          <p>
            A segunda é clicar no botão, baixar o kit, e gastar 30 minutos configurando o seu segundo cérebro.
          </p>
          <p className="text-white font-bold">
            Daqui a 30 minutos, você pode abrir o Claude Code, digitar{" "}
            <code className="text-green-400 bg-green-500/10 px-2 py-0.5 rounded">/daily-briefing</code>{" "}
            e receber um resumo personalizado do seu dia. Sem explicar nada. Sem contextualizar. Sem começar do zero.
          </p>
          <p><span className="text-gradient-green font-semibold">O cérebro vai estar te esperando.</span></p>
        </div>

        <div className="mt-10 text-center">
          <a
            id={FINAL_CTA_ID}
            href={CHECKOUT_URL}
            className="group inline-flex items-center gap-2 rounded-lg bg-green-500 px-10 py-4 text-base font-bold text-black transition-all duration-200 hover:bg-green-400 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(168,232,76,0.3)] cursor-pointer green-glow"
          >
            Montar meu Segundo Cérebro — R$67 <span className="transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
          </a>
          <p className="mt-4 font-mono text-[12px] text-green-300/70">
            Pagamento único. Acesso vitalício. Atualizações incluídas.
          </p>
        </div>
      </div>
    </section>
    </>
  );
}

/* ─── Section 13: Footer ─── */
function SCFooter() {
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
          Kit Segundo Cérebro — por{" "}
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
          Produto digital &middot; Entrega instantânea via Hubla &middot; Sem assinatura
        </p>
      </div>
    </footer>
  );
}

/* ─── Main Component ─── */
export function SegundoCerebro() {
  return (
    <>
      <main>
        <HeroSection />
        <PainSection />
        <RevelationSection />
        <DemoSection />
        <KitContentsSection />
        <AudienceSection />
        <NotForSection />
        <ValueComparisonSection />
        <FAQSection />
        <SupportSection />
        <PricingSection />
        <FinalPushSection />
      </main>
      <SocialProofToast />
      <SCFooter />
    </>
  );
}
