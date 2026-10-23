"use client";

import { useEffect, useRef, useState } from "react";
import { X, Code2, Target, BookOpen, Video, BarChart3, Expand, ChevronDown, ShoppingBag } from "lucide-react";
import { useScrollReveal } from "@/lib/use-scroll-reveal";
import Image from "next/image";

// TODO(Yan): confirmar checkout internacional
const CHECKOUT_URL = "https://pay.hotmart.com/T108161703R";

const PRICING = {
  price: "US$ 17",
  // US monthly billing: https://support.claude.com/en/articles/8325606-what-is-the-pro-plan
  claudeProMonthly: "US$ 20",
};

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
        aria-label="Close"
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
        {/* Hover overlay - bg covers full image, button pinned to top area so it's always visible */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 pointer-events-none" />
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
          <span className="flex items-center gap-2 rounded-full bg-black/70 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-sm border border-white/10">
            <Expand className="h-3 w-3" />
            View full image
          </span>
        </div>
      </div>
      {open && <ImageLightbox src={src} alt={alt} onClose={() => setOpen(false)} />}
    </>
  );
}

const FINAL_CTA_ID = "cta-comprar-final";

function scrollToFinalCta() {
  document
    .getElementById(FINAL_CTA_ID)
    ?.scrollIntoView({ behavior: "smooth", block: "center" });
}

/* ─── Reusable end-of-section CTA (scrolls to the pricing card) ───
   Plain anchor: the site's global SmoothAnchorScroll handles the
   animation for same-page "#" links, same as every other in-page
   link on the site (e.g. the hero's "See how it works" link). */
function SectionCta() {
  return (
    <div className="mt-14 flex justify-center">
      <a
        href="#comprar"
        className="group inline-flex items-center gap-2 rounded-lg bg-green-500 px-8 py-4 text-base font-bold text-black transition-all duration-200 hover:bg-green-400 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(168,232,76,0.3)] cursor-pointer"
      >
        Get the Second Brain Kit <span className="transition-transform duration-200 group-hover:translate-x-1 inline-block">&rarr;</span>
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
            <div className="text-[11px] text-green-300">just purchased the Second Brain Kit!</div>
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
          Set it up once.
          <br />
          <span className="font-punch text-gradient-green">Keep your context for good.</span>
        </h1>

        {/* Subheadline */}
        <p className="animate-fade-in-up delay-200 mt-6 max-w-2xl mx-auto text-base sm:text-lg text-zinc-400 leading-relaxed">
          The complete system that gives <strong className="text-gradient-green font-semibold">persistent memory</strong> to Claude Code. Your work, your goals, your decisions, all within reach. <strong className="text-white">Stop explaining yourself every time.</strong>
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
            Build my Second Brain <span className="transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
          </a>
          <a
            href="#como-funciona"
            className="group/scroll mt-5 inline-flex flex-col items-center gap-1 text-green-300/60 hover:text-green-300 transition-colors duration-200 cursor-pointer"
          >
            <span className="font-mono text-[13px] font-medium tracking-wide">See how it works</span>
            <span className="animate-bounce text-lg">↓</span>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─── Section 2: The Pain ─── */
function PainSection() {
  const ref = useScrollReveal();
  const PAIN_ITEMS = [
    "You open a new chat and explain everything from scratch",
    "You spend 5 minutes giving context before every task",
    "You get a generic answer because it does not know your work",
    "It cannot remember what you worked on yesterday",
    "It has no record of the decisions you have already made",
    "It repeats suggestions you ruled out weeks ago",
    "Every session starts from zero, as if you had never worked together",
  ];

  return (
    <>
    <div className="section-divider" />
    <section id="como-funciona" className="py-20 sm:py-28 bg-black/80">
      <div ref={ref} className="scroll-reveal mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-8">
          Sound familiar?
        </h2>

        <div className="space-y-5 mb-10">
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            You open Claude Code with a task in mind. Before you can start, you have to explain everything again.
          </p>
          <p className="text-[15px] text-zinc-300 italic leading-relaxed">
            &ldquo;I am a freelance designer. Here is my audience, here is my pricing, here is the project, and here is what the client asked for...&rdquo;
          </p>
          <p className="text-[15px] font-semibold">
            <span className="text-gradient-green">Every. Single. Time.</span>
          </p>
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            You type a whole paragraph of background before asking the actual question. The answer still feels generic. Claude simply does not have enough context about your work.
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
            You know Claude can do more. You have seen the potential. But without persistent context, it is like working with a brilliant partner who wakes up every morning with no memory of yesterday.
          </p>
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            Now multiply that by weeks. Months. How many hours have you spent explaining the same things?
          </p>
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            How many generic answers have you settled for because you could not face typing all that context again?
          </p>
          <p className="text-[15px] text-white font-semibold leading-relaxed">
            And how often have you <span className="text-gradient-green">skipped using Claude</span> because explaining everything felt like more work than doing the task yourself?
          </p>
        </div>
        <SectionCta />
      </div>
    </section>
    </>
  );
}

/* ─── Section 3: The Reveal ─── */
function RevelationSection() {
  const ref = useScrollReveal();
  const BENEFITS = [
    "Knows who you are and what you do",
    "Remembers your projects, goals, and decisions",
    "Updates its memory with each work session",
    "Handles complex tasks with a single command",
    "Builds more context the more you use it",
    "Works like a partner with a record of your work",
  ];

  return (
    <>
    <div className="section-divider" />
    <section className="py-20 sm:py-28">
      <div ref={ref} className="scroll-reveal mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-6">
          What if you set it up{" "}
          <span className="font-punch text-gradient-green">once</span>{" "}
          and kept that context for the next session?
        </h2>

        <p className="text-[15px] text-zinc-400 leading-relaxed mb-6">
          Picture opening Claude Code on Monday morning. Instead of spending 10 minutes explaining your situation, you type one line:
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
          You get a full briefing for your day. Unfinished work from last week. Active projects. Recent decisions. What needs attention now, and what to do first.
        </p>
        <p className="text-[15px] text-white font-semibold mb-4">
          No repeat introductions. Because <span className="text-gradient-green">it already has the context.</span>
        </p>

        {/* Screenshot: /daily-briefing output */}
        <div className="rounded-lg overflow-hidden border border-green-500/10 mb-10 image-frame">
          <ZoomableImage
            src="/segundo-cerebro/daily-briefing.webp"
            alt="Output from /daily-briefing showing the daily briefing, pipeline, and priorities"
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
            This is a working system you can use with Claude Code. <strong className="text-gradient-green font-semibold">You can use it today.</strong>
          </p>
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            Obsidian holds your notes in a vault. Claude Code uses them as persistent memory. You add the information it needs about your work, and it draws on that context when you need it.
          </p>
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            I built this for my own work. I spent weeks refining the operating rules, guardrails, memory logic, and custom commands. Now that work is packaged into a kit you can make your own.
          </p>
        </div>

        {/* Screenshot: .claude/commands/ */}
        <div className="rounded-lg overflow-hidden border border-green-500/10 mt-8 image-frame">
          <ZoomableImage
            src="/segundo-cerebro/8-comandos.webp"
            alt="The .claude/commands/ folder with 8 ready-to-use slash commands"
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
          alt="Terminal output from /daily-briefing"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#0d0f0d] to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 pointer-events-none" />
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
          <span className="flex items-center gap-2 rounded-full bg-black/70 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-sm border border-white/10">
            <Expand className="h-3 w-3" />
            View full image
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-mono text-green-400 text-sm font-bold mb-2">/daily-briefing</h3>
        <p className="text-[13px] text-zinc-500 leading-relaxed">
          One command. A complete daily briefing with the context you need.
        </p>
      </div>
      {lightboxOpen && (
        <ImageLightbox
          src="/segundo-cerebro/daily-briefing.webp"
          alt="Terminal output from /daily-briefing"
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}

/* ─── Section 4: Visual Demo (Bento Grid) ─── */
function DemoSection() {
  const ref = useScrollReveal();
  return (
    <>
    <div className="section-divider" />
    <section className="py-20 sm:py-28 bg-black/80">
      <div ref={ref} className="scroll-reveal mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-center mb-3">
          See what you can do with{" "}
          <span className="font-punch text-gradient-green">one command</span>
        </h2>
        <p className="text-center text-zinc-500 text-[15px] mb-12">
          Real screenshots of the system in use. Examples shown in Portuguese.
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
                  alt="Terminal output from /braindump"
                  width={1065}
                  height={748}
                  className="w-full h-auto"
                />
              </div>
              <div className="p-5">
                <h3 className="font-mono text-green-400 text-sm font-bold mb-2">/braindump</h3>
                <p className="text-[13px] text-zinc-500 leading-relaxed">
                  Have an idea? Capture it with a braindump. The system connects it to existing notes in your vault and files it away.
                </p>
              </div>
            </div>

            {/* end-session */}
            <div className="glass border-green-500/10 rounded-lg overflow-hidden image-frame">
              <div className="overflow-hidden rounded-t-lg max-h-[400px] relative">
                <ZoomableImage
                  src="/segundo-cerebro/end-session.webp"
                  alt="Output from /end-session showing a complete session wrap-up"
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
                  Done for the day? One command wraps up your work, updates memory, and records decisions and lessons.{" "}
                  <strong className="text-gradient-green">Open it tomorrow and pick up where you left off.</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Row 2: Obsidian full-width */}
          <div className="md:col-span-12 glass border-green-500/10 rounded-lg overflow-hidden image-frame">
            <div className="overflow-hidden rounded-t-lg">
              <ZoomableImage
                src="/segundo-cerebro/obsidian-full.webp"
                alt="The full Obsidian vault with the folder sidebar and current-state note open"
                width={2559}
                height={1379}
                className="w-full h-auto"
              />
            </div>
            <div className="p-5">
              <h3 className="font-mono text-green-400 text-sm font-bold mb-2">Your Obsidian vault</h3>
              <p className="text-[13px] text-zinc-500 leading-relaxed">
                Everything in its place. Memory, knowledge, lessons, decisions, and your pipeline. Connected notes you can actually use.
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

/* ─── Section 5: Kit Contents ─── */
function KitContentsSection() {
  const CARDS = [
    {
      title: "CLAUDE.md - The core of your Second Brain",
      desc: "Hundreds of lines of refined prompt engineering: a customizable identity, memory rules, writing guardrails, prompt injection safeguards, memory update logic, an optional business module, and a command reference. This file makes the system work. I spent weeks refining it.",
      highlight: true,
    },
    {
      title: "8 Ready-to-Use Slash Commands",
      desc: "4 core commands (daily-briefing, end-session, braindump, weekly-review), 1 for content ideas (content-idea), and 3 optional business commands (prospect-research, pipeline, proposal-generator). Each includes conditional logic and structured output.",
      highlight: true,
    },
    {
      title: "4 Setup Prompts",
      desc: "Create the vault structure, generate knowledge templates, initialize memory, and check that everything works. The prompts are ready to copy and paste, so you can follow the setup without memorizing the steps.",
      highlight: false,
    },
    {
      title: "9 Knowledge Templates",
      desc: "4 core templates (about-me, goals, projects, references) and 5 for business (positioning, icp, services, tone-of-voice, pricing). Guided questions help you fill them in without staring at a blank page.",
      highlight: false,
    },
    {
      title: "Installation Guide",
      desc: "Go from a blank folder to a working vault. Follow the screenshots to install Obsidian and Claude Code, configure your system, and test it. Includes Git sync setup for automatic backups.",
      highlight: false,
    },
    {
      title: "Customization Guide",
      desc: "Make the templates fit your work. Includes examples for freelancers, developers, students, content creators, and managers, plus advanced tips for creating your own commands.",
      highlight: false,
    },
    {
      title: "Ongoing AI Support",
      desc: "Paste the included prompt into a new chat to get an assistant with the full kit as context. Ask setup questions, customize your system, troubleshoot errors, or create new commands. Available around the clock, without a support queue or an expiration date.",
      highlight: true,
    },
    {
      title: "A Complete, Organized Vault",
      desc: "Start with an organized vault: _memory, _knowledge, _learnings, _decisions, _sessions, and _pipeline folders, START-HERE.md onboarding, a filled-in pipeline example, and a configured .gitignore. Unzip it and start making it yours.",
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
          What is inside the kit
        </h2>
        <p className="text-center text-[15px] text-zinc-400 mb-4">
          Open the kit and get a{" "}
          <strong className="text-gradient-green font-semibold">ready-to-use system.</strong>{" "}
          Unzip it, add your own information, and put your Second Brain to work.
        </p>

        {/* Screenshots: CLAUDE.md hero + vault structure & about-me side by side */}
        <div className="space-y-4 mb-12">
          {/* CLAUDE.md - full width hero shot */}
          <div className="rounded-lg overflow-hidden border border-green-500/10 image-frame">
            <ZoomableImage
              src="/segundo-cerebro/claude-md.webp"
              alt="CLAUDE.md with hundreds of lines of prompt engineering"
              width={2123}
              height={1327}
              className="w-full h-auto"
            />
            <div className="px-4 py-3 bg-zinc-900/50">
              <p className="font-mono text-[10px] uppercase tracking-widest text-green-400/60">CLAUDE.md - the core of your Second Brain</p>
            </div>
          </div>

          {/* Row 2: vault structure + about-me */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Vault structure - image dictates height */}
            <div className="rounded-lg overflow-hidden border border-green-500/10 image-frame">
              <ZoomableImage
                src="/segundo-cerebro/estrutura-do-vault.webp"
                alt="Obsidian sidebar showing the vault folder structure"
                width={935}
                height={591}
                className="w-full h-auto"
              />
              <div className="px-4 py-3 bg-zinc-900/50">
                <p className="font-mono text-[10px] uppercase tracking-widest text-green-400/60">Vault structure</p>
              </div>
            </div>
            {/* About-me - aspect ratio matched to vault image, cropped with fade */}
            <div className="rounded-lg overflow-hidden border border-green-500/10 image-frame">
              <div className="aspect-[935/591] overflow-hidden relative">
                <ZoomableImage
                  src="/segundo-cerebro/about-me.webp"
                  alt="The about-me.md template with guided customization questions"
                  width={716}
                  height={1763}
                  className="w-full h-auto"
                >
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0d0f0d] to-transparent pointer-events-none" />
                </ZoomableImage>
              </div>
              <div className="px-4 py-3 bg-zinc-900/50">
                <p className="font-mono text-[10px] uppercase tracking-widest text-green-400/60">The about-me.md template</p>
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

/* ─── Section 6: Who It Is For ─── */
function AudienceSection() {
  const PROFILES: { icon: React.ReactNode; title: string; desc: string }[] = [
    { icon: <Code2 className="h-5 w-5 text-green-400" />, title: "Developers", desc: "Manage sprints, document technical decisions, and save debugging lessons. Use daily-briefing as your personal standup. Rename _pipeline/ to _projects/ to fit your workflow." },
    { icon: <Target className="h-5 w-5 text-green-400" />, title: "Freelancers and Agencies", desc: "Client pipelines, prospect research, proposals, and follow-ups. The optional business module keeps your sales context together, so Claude can help you stay on top of every lead." },
    { icon: <BookOpen className="h-5 w-5 text-green-400" />, title: "Students and Researchers", desc: "Organize your thesis, dissertation, or research projects. Capture insights with braindump, save references, and track progress. Use weekly-review to stay focused on your academic goals." },
    { icon: <Video className="h-5 w-5 text-green-400" />, title: "Content Creators", desc: "Keep your editorial calendar, ideas, positioning, and voice in one place. Use /content-idea for suggestions based on your goals and what you have already published." },
    { icon: <BarChart3 className="h-5 w-5 text-green-400" />, title: "Managers and Team Leaders", desc: "Track team projects, record strategic decisions, and review priorities each week. Turn your vault into a Second Brain for your management work." },
  ];

  const ref = useScrollReveal();
  return (
    <>
    <div className="section-divider" />
    <section className="py-20 sm:py-28 bg-black/80">
      <div ref={ref} className="scroll-reveal mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-4">
          Built for people who use{" "}
          <span className="font-punch text-gradient-green">Claude Code</span>
        </h2>
        <p className="text-[15px] text-zinc-400 leading-relaxed mb-10">
          The kit is modular. Start with the core system and add the optional business module if it fits your work. Keep what you need and adapt the rest.
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

/* ─── Section 7: Who It Is Not For ─── */
function NotForSection() {
  const WARNINGS = [
    { title: "You do not have Claude Code.", desc: "You need Claude Code running on your computer. The slash commands depend on it." },
    { title: "You want results without doing the setup.", desc: "The templates and guides are ready, but you need to add your own information. Allow 30-60 minutes for the initial setup. You have to put that time in to make it useful." },
    { title: "You are looking for a video course.", desc: "You get a working system, written guides, and AI support. There is no 10-hour video course to sit through. The kit gets straight to the setup." },
  ];

  const ref = useScrollReveal();
  return (
    <>
    <div className="section-divider" />
    <section className="py-20 sm:py-28">
      <div ref={ref} className="scroll-reveal mx-auto max-w-4xl px-4 sm:px-6">
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-4">
          Before you buy, this kit{" "}
          <strong>is not</strong>{" "}
          for everyone
        </h2>
        <p className="text-[15px] text-zinc-400 leading-relaxed mb-10">
          I want you to know what you are getting. If any of these describe you, the kit will not be a good fit:
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
          If you are ready to set it up, keep reading. Here is what you get for <span className="text-gradient-green font-semibold">{PRICING.price}.</span>
        </p>
        <SectionCta />
      </div>
    </section>
    </>
  );
}

/* ─── Section 8: Value Comparison ─── */
function ValueComparisonSection() {
  const COMPARISONS = [
    { price: PRICING.claudeProMonthly, label: "Claude Pro (US monthly billing)", duration: "per month", highlight: false },
    { price: PRICING.price, label: "Second Brain Kit", duration: "one-time payment", highlight: true },
  ];

  const ref = useScrollReveal();
  return (
    <>
    <div className="section-divider" />
    <section className="py-20 sm:py-28 bg-black/80">
      <div ref={ref} className="scroll-reveal mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-center mb-12">
          A monthly subscription.{" "}
          <span className="font-punch text-gradient-green">A one-time kit.</span>
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
            Claude Pro costs {PRICING.claudeProMonthly} per month with US monthly billing. Regional prices and taxes vary.{" "}
            <a href="https://support.claude.com/en/articles/8325606-what-is-the-pro-plan" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 underline">Check Claude pricing.</a>
          </p>
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            Your Second Brain <strong className="text-gradient-green font-semibold">builds more context every day you use it.</strong> It collects knowledge, records decisions, and saves lessons. Six months from now, you will have a record of your work you can keep building on.
          </p>
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            The kit is {PRICING.price}, paid once. Your Claude plan is separate. The kit gives you a reusable system for your context, with no recurring kit fee.
          </p>
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            If the kit saves you 1 hour a week, that is time you get back each week. Think about what that hour is worth to you. <strong className="text-white">Time for the work that matters, instead of repeating your background to AI.</strong>
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
      q: "\"I could build this myself.\"",
      a: "You can create the folders yourself. The kit gives you the work behind them: hundreds of lines in CLAUDE.md, safeguards, memory update logic, and 8 slash commands with conditional workflows. You are buying weeks of refinement, ready to use.",
    },
    {
      q: "Which Claude plan do I need?",
      a: "You need access to Claude Code through Pro, Max, or the API. The kit does not require special features beyond Claude Code access. Your Claude access is separate from the kit.",
    },
    {
      q: "Will it work for me if I do not run a business?",
      a: "Yes. The core commands (daily-briefing, end-session, braindump, weekly-review) and identity, goals, and project templates work across different roles. The business module (prospect-research, pipeline, proposal-generator) is optional. Keep it or remove it. Customization examples cover developers, students, creators, managers, and freelancers.",
    },
    {
      q: "What happens when Claude Code changes?",
      a: "The kit uses plain Markdown files. Your notes remain readable and editable without a special app or file format. It uses CLAUDE.md and slash commands rather than custom software dependencies. If Claude Code changes how those features work, the setup may need an adjustment.",
    },
    {
      q: "\"Why pay for Markdown files?\"",
      a: "The value is in what the files do. You get weeks of refinement in a ready-to-use format: prompt engineering, command logic, and guardrails. The point is to save you the time it would take to build and refine the system yourself.",
    },
    {
      q: "What if I get stuck during setup?",
      a: "You get a step-by-step installation guide, customization examples, 4 setup prompts, and an AI support prompt. Paste it into a chat to get help with the full kit as context, any time of day. If you are still stuck, send me a direct message.",
    },
  ];

  const ref = useScrollReveal();
  return (
    <>
    <div className="section-divider" />
    <section id="faq" className="py-20 sm:py-28">
      <div ref={ref} className="scroll-reveal mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight mb-10">
          Questions you
          <br />
          <span className="font-punch text-gradient-green">may be asking.</span>
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

/* ─── Section 10: Ongoing Support ─── */
function SupportSection() {
  const ref = useScrollReveal();
  return (
    <>
    <div className="section-divider" />
    <section className="py-20 sm:py-28 bg-black/80">
      <div ref={ref} className="scroll-reveal mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-6">
          Buy once. Get help{" "}
          <span className="font-punch text-gradient-green">whenever you need it.</span>
        </h2>

        <p className="text-[15px] text-zinc-400 leading-relaxed mb-8">
          I built AI support into the kit so you can get help as you work.
        </p>

        {/* Highlighted box */}
        <div className="rounded-lg border border-green-500/20 bg-green-500/[0.06] p-8 mb-8">
          <h3 className="font-heading text-xl font-bold text-white mb-4">
            Ongoing AI Support
          </h3>
          <p className="text-[15px] text-zinc-400 leading-relaxed mb-3">
            The kit includes <strong className="text-white">an AI support prompt</strong>. Copy its contents into a new Claude or ChatGPT chat to get an assistant with the whole kit as context.
          </p>
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            Ask installation questions, get help customizing your setup, troubleshoot errors, or learn to create new commands. <strong className="text-gradient-green font-semibold">Available around the clock. No queue. No ticket. No expiration date.</strong>
          </p>
        </div>

        <p className="text-[15px] text-zinc-400 leading-relaxed">
          For {PRICING.price}, you get the kit and a reusable AI support prompt. You can return to it <em>whenever you need help</em> with your setup.
        </p>
        <SectionCta />
      </div>
    </section>
    </>
  );
}

/* ─── Section 11: Price + CTA ─── */
function PricingSection() {
  const ref = useScrollReveal();
  return (
    <>
    <div className="section-divider" />
    <section id="comprar" className="py-24 sm:py-32 relative">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-green-500/[0.04] blur-[150px] pointer-events-none" />

      <div ref={ref} className="scroll-reveal relative z-10 mx-auto max-w-4xl px-4 sm:px-6 text-center">
        <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
          Ready to build your Second Brain?
        </h2>

        <div className="space-y-4 text-[15px] text-zinc-400 leading-relaxed max-w-2xl mx-auto mb-10">
          <p>
            I have sold this as a done-for-you setup for much more. With this kit, you get the system to set up yourself.
          </p>
          <p>
            Here, you get a ready-to-use kit. Download it, make it yours, and use it. One purchase.
          </p>
        </div>

        {/* Price box */}
        <div className="mx-auto max-w-sm rounded-lg border-2 border-green-500/40 bg-green-500/[0.06] p-8 mb-6">
          <div className="font-punch text-5xl sm:text-6xl font-extrabold text-gradient-green mb-2">{PRICING.price}</div>
          <p className="text-sm text-green-300/70 mb-6">
            One payment. No subscription. No renewal.
          </p>
          <a
            href={CHECKOUT_URL}
            className="group block w-full rounded-lg bg-green-500 px-8 py-4 text-lg font-bold text-black transition-all duration-200 hover:bg-green-400 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(168,232,76,0.3)] cursor-pointer"
          >
            Get the Second Brain Kit <span className="transition-transform duration-200 group-hover:translate-x-1 inline-block">&rarr;</span>
          </a>
          <p className="font-mono text-[11px] text-zinc-500 mt-4">
            Secure payment through Hotmart &middot; Instant delivery &middot; Immediate access
          </p>
        </div>

        <p className="font-mono text-[12px] text-zinc-600 leading-relaxed">
          Refined CLAUDE.md &middot; 8 slash commands &middot; 4 setup prompts &middot; 9 templates &middot; Complete guides &middot; AI support included
        </p>
      </div>
    </section>
    </>
  );
}

/* ─── Section 12: Final CTA ─── */
function FinalPushSection() {
  const ref = useScrollReveal();
  return (
    <>
    <div className="section-divider" />
    <section className="py-20 sm:py-28 bg-black/80">
      <div ref={ref} className="scroll-reveal mx-auto max-w-2xl px-4 sm:px-6">
        <div className="space-y-6 text-base sm:text-lg text-zinc-400 leading-relaxed">
          <p>You have two options.</p>
          <p>
            Close this page. Open Claude Code tomorrow. Type the same background paragraph. Get another generic answer. Repeat it on Tuesday, on Wednesday, next week, next month. Start over every time you open a new chat.
          </p>
          <p>
            Or get the kit, download it, and spend 30-60 minutes setting up your Second Brain.
          </p>
          <p className="text-white font-bold">
            After setup, you can open Claude Code, type{" "}
            <code className="text-green-400 bg-green-500/10 px-2 py-0.5 rounded">/daily-briefing</code>{" "}
            and get a briefing based on your own work. Without repeating your background. Without starting from zero.
          </p>
          <p><span className="text-gradient-green font-semibold">Your context will be there, ready for your next session.</span></p>
        </div>

        <div className="mt-10 text-center">
          <a
            id={FINAL_CTA_ID}
            href={CHECKOUT_URL}
            className="group inline-flex items-center gap-2 rounded-lg bg-green-500 px-10 py-4 text-base font-bold text-black transition-all duration-200 hover:bg-green-400 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(168,232,76,0.3)] cursor-pointer green-glow"
          >
            Build my Second Brain - {PRICING.price} <span className="transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
          </a>
          <p className="mt-4 font-mono text-[12px] text-green-300/70">
            One payment. Lifetime access. Updates included.
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
          Second Brain Kit - by{" "}
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
          Digital product &middot; Instant delivery through Hotmart &middot; No subscription
        </p>
      </div>
    </footer>
  );
}

/* ─── Main Component ─── */
export function SegundoCerebroEn() {
  return (
    <div lang="en" className="relative">
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
    </div>
  );
}
