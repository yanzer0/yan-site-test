"use client";

import { useState } from "react";
import { Menu, X, ArrowLeft, Code2, Target, BookOpen, Video, BarChart3 } from "lucide-react";
import Image from "next/image";
import Script from "next/script";

interface SegundoCerebroProps {
  onBack: () => void;
}

const CHECKOUT_URL = "https://pay.kiwify.com.br/oT2C28S";

/* ─── Navbar ─── */
function SCNavbar({ onBack }: { onBack: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const NAV_LINKS = [
    { label: "O que vem no kit", href: "#kit" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header className="fixed top-4 left-4 right-4 z-50">
      <nav className="mx-auto max-w-3xl glass rounded-lg px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer mr-1"
            aria-label="Voltar aos kits"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Kits</span>
          </button>
          <a href="#" className="flex items-center cursor-pointer">
            <Image
              src="/lockup-sem-fundo.png"
              alt="Infuser"
              width={120}
              height={32}
              className="h-8 w-auto"
            />
          </a>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-zinc-400 hover:text-white transition-colors duration-200 cursor-pointer"
            >
              {link.label}
            </a>
          ))}
        </div>

        <a
          href="#comprar"
          className="hidden md:inline-flex items-center gap-2 rounded-full bg-green-500 px-5 py-2 text-sm font-semibold text-black transition-all duration-200 hover:bg-green-400 cursor-pointer green-glow-sm"
        >
          Quero o Kit
        </a>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-white cursor-pointer p-2"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="md:hidden mt-2 mx-auto max-w-3xl glass rounded-lg p-6 flex flex-col gap-4">
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
            href="#comprar"
            onClick={() => setMobileOpen(false)}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-green-500 px-5 py-2.5 text-sm font-semibold text-black cursor-pointer"
          >
            Quero o Kit
          </a>
        </div>
      )}
    </header>
  );
}

/* ─── Section 1: Hero ─── */
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-28 pb-16">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-green-500/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 text-center">
        {/* Badge */}
        <div className="animate-fade-in-up inline-flex items-center gap-3 mb-8">
          <span className="h-px w-5 bg-green-400" />
          <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-green-400">
            Kit Segundo Cérebro
          </span>
          <span className="h-px w-5 bg-green-400" />
        </div>

        {/* Headline */}
        <h1 className="animate-fade-in-up delay-100 font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
          Configura uma vez.
          <br />
          <span className="text-gradient-green">Ele nunca mais esquece.</span>
        </h1>

        {/* Subheadline */}
        <p className="animate-fade-in-up delay-200 mt-6 max-w-xl mx-auto text-base sm:text-lg text-zinc-400 leading-relaxed">
          O sistema completo pra dar <strong className="text-white">memória permanente</strong> pro seu Claude Code. Ele lembra quem você é, o que faz, e o que precisa — <strong className="text-white">sem você explicar de novo toda vez.</strong>
        </p>

        {/* Price + CTA */}
        <div className="animate-fade-in-up delay-300 mt-10">
          <div className="flex items-baseline justify-center gap-3 mb-6">
            <span className="font-mono text-lg text-zinc-500 line-through">R$67</span>
            <span className="font-heading text-5xl sm:text-6xl font-extrabold text-green-400">R$37</span>
          </div>
          <a
            href="#comprar"
            className="group inline-flex items-center gap-2 rounded-lg bg-green-500 px-10 py-4 text-base font-bold text-black transition-all duration-200 hover:bg-green-400 hover:-translate-y-0.5 cursor-pointer green-glow"
          >
            Quero o Kit — R$37 &rarr;
          </a>
          <p className="mt-4 font-mono text-[12px] text-green-300/70 font-medium">
            ⚡ Os 30 primeiros pagam R$37. Depois sobe pra R$67.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─── Section 2: A Dor ─── */
function PainSection() {
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
    <section className="py-20 sm:py-28 bg-black">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
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
          <p className="text-[15px] text-white font-semibold">
            Toda. Santa. Vez.
          </p>
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            Você digita um paragrafo inteiro de contexto antes de fazer a pergunta real. E mesmo assim, a resposta vem genérica porque o Claude não sabe o suficiente sobre você.
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/5 my-10" />

        {/* Pain list */}
        <div className="space-y-4 mb-10">
          {PAIN_ITEMS.map((item) => (
            <div key={item} className="flex items-start gap-3">
              <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-red-500/15 flex items-center justify-center">
                <span className="text-red-400 text-xs font-bold">&timês;</span>
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
            E o pior: quantas vezes você deixou de usar o Claude porque dava preguiça de explicar tudo de novo?
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─── Section 3: A Revelação ─── */
function RevelationSection() {
  const BENEFITS = [
    "Sabe quem você é e o que faz",
    "Lembra dos seus projetos, objetivos e decisões",
    "Se atualiza sozinho a cada sessão de trabalho",
    "Executa tarefas complexas com um único comando",
    "Fica mais inteligente quanto mais você usa",
    "Funciona como um sócio que nunca esquece nada",
  ];

  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-6">
          E se você configurasse{" "}
          <span className="text-gradient-green">uma vez</span>{" "}
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
          Sem você explicar nada. Porque ele já sabe tudo.
        </p>

        {/* Screenshot placeholder: /prospect-research */}
        <div className="rounded-lg overflow-hidden border border-green-500/10 mb-10 bg-zinc-900/50">
          <div className="aspect-vídeo flex items-center justify-center p-8">
            <div className="text-center">
              <div className="font-mono text-[10px] uppercase tracking-widest text-green-400/60 mb-2">screenshot</div>
              <p className="text-sm text-zinc-500">Output do /prospect-research — score de qualificação, análise completa</p>
            </div>
          </div>
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
            Isso não é ficção. Não é uma feature futura do Claude. <strong className="text-white">Isso funciona hoje.</strong>
          </p>
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            É um sistema de memória persistente que usa o Obsidian como vault e o Claude Code como cérebro. Você alimenta o sistema com o que ele precisa saber sobre você, e ele usa essa informação pra operar com contexto completo. Sempre.
          </p>
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            Eu construi esse sistema pra mim. Levei semanas refinando cada detalhe: as regras de operação, os guardrails, a lógica de memória, os comandos personalizados. E agora empacotei tudo num kit pronto pra você usar.
          </p>
        </div>

        {/* Screenshot placeholder: .claude/commands/ */}
        <div className="rounded-lg overflow-hidden border border-green-500/10 mt-8 bg-zinc-900/50">
          <div className="aspect-vídeo flex items-center justify-center p-8">
            <div className="text-center">
              <div className="font-mono text-[10px] uppercase tracking-widest text-green-400/60 mb-2">screenshot</div>
              <p className="text-sm text-zinc-500">Pasta .claude/commands/ — lista dos 8 arquivos de slash commands</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Section 4: Demo Visual ─── */
function DemoSection() {
  const DEMOS = [
    {
      title: "/daily-briefing",
      desc: "Um comando. Briefing completo do dia com tudo que você precisa saber.",
      placeholder: "Output do /daily-briefing no terminal",
    },
    {
      title: "/braindump",
      desc: "Teve uma ideia? Joga pro cérebro. Ele captura, conecta com o que já existe no vault, e arquiva.",
      placeholder: "Output do /braindump no terminal",
    },
    {
      title: "/end-session",
      desc: "Terminou de trabalhar? Um comando e ele consolida tudo que aconteceu, atualiza a memória, registra decisões e aprendizados.",
      descBold: "Amanhã quando você abrir, ele sabe exatamente onde vocês pararam.",
      placeholder: "Output do /end-session + current-state.md atualizado",
    },
    {
      title: "O vault no Obsidian",
      desc: "Tudo organizado. Memoria, knowledge base, learnings, decisions, pipeline. Cada arquivo se conecta ao outro.",
      placeholder: "Sidebar do Obsidian com a estrutura de pastas",
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-black">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-center mb-3">
          Olha o que ele faz com{" "}
          <span className="text-gradient-green">um comando</span>
        </h2>
        <p className="text-center text-zinc-500 text-[15px] mb-12">
          Screenshots reais do sistema funcionando.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {DEMOS.map((demo) => (
            <div
              key={demo.title}
              className="glass border-green-500/10 rounded-lg overflow-hidden"
            >
              {/* Screenshot placeholder */}
              <div className="aspect-vídeo bg-zinc-900/50 flex items-center justify-center p-6">
                <div className="text-center">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-green-400/60 mb-2">screenshot</div>
                  <p className="text-xs text-zinc-600">{demo.placeholder}</p>
                </div>
              </div>
              {/* Text */}
              <div className="p-6">
                <h3 className="font-mono text-green-400 text-sm font-bold mb-2">
                  {demo.title}
                </h3>
                <p className="text-[13px] text-zinc-500 leading-relaxed">
                  {demo.desc}
                  {demo.descBold && (
                    <>
                      {" "}
                      <strong className="text-white">{demo.descBold}</strong>
                    </>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
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

  return (
    <section id="kit" className="py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-center mb-3">
          O que vem no kit
        </h2>
        <p className="text-center text-[15px] text-zinc-400 mb-4">
          Não é um curso. Não é um ebook. É um{" "}
          <strong className="text-white">sistema pronto pra usar.</strong>{" "}
          Você descompacta, personaliza com os seus dados, e o cérebro já esta funcionando.
        </p>

        {/* Screenshots: vault structure + CLAUDE.md + template */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <div className="rounded-lg overflow-hidden border border-green-500/10 bg-zinc-900/50">
            <div className="aspect-[4/3] flex items-center justify-center p-4">
              <div className="text-center">
                <div className="font-mono text-[10px] uppercase tracking-widest text-green-400/60 mb-2">screenshot</div>
                <p className="text-xs text-zinc-600">Sidebar do Obsidian — estrutura do vault</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg overflow-hidden border border-green-500/10 bg-zinc-900/50">
            <div className="aspect-[4/3] flex items-center justify-center p-4">
              <div className="text-center">
                <div className="font-mono text-[10px] uppercase tracking-widest text-green-400/60 mb-2">screenshot</div>
                <p className="text-xs text-zinc-600">CLAUDE.md aberto — densidade do conteúdo</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg overflow-hidden border border-green-500/10 bg-zinc-900/50">
            <div className="aspect-[4/3] flex items-center justify-center p-4">
              <div className="text-center">
                <div className="font-mono text-[10px] uppercase tracking-widest text-green-400/60 mb-2">screenshot</div>
                <p className="text-xs text-zinc-600">Template about-me.md — perguntas-guia</p>
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-white/5 mb-12" />

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[2px]">
          {CARDS.map((card) => (
            <div
              key={card.title}
              className={`glass p-6 ${
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
      </div>
    </section>
  );
}

/* ─── Section 6: Pra Quem É ─── */
function AudienceSection() {
  const PROFILES: { icon: React.ReactNode; title: string; desc: string }[] = [
    { icon: <Code2 className="h-5 w-5 text-green-400" />, title: "Desenvolvedores", desc: "Gerencia sprints, documenta decisões técnicas, registra aprendizados de debugging. O daily-briefing vira seu standup pessoal. Renomeia _pipeline/ pra _projects/ e pronto." },
    { icon: <Target className="h-5 w-5 text-green-400" />, title: "Freelancers e Agencias", desc: "Pipeline de clientes, pesquisa de prospects, geracao de propostas, follow-ups. O módulo de negócios foi feito pra você. O Claude vira seu gerente comercial que nunca esquece um lead." },
    { icon: <BookOpen className="h-5 w-5 text-green-400" />, title: "Estudantes e Pesquisadores", desc: "Organiza TCC, mêstrado, projetos de pesquisa. Captura insights com braindump, registra referências, acompanha progresso. O weekly-review vira sua bússola acadêmica." },
    { icon: <Video className="h-5 w-5 text-green-400" />, title: "Criadores de Conteúdo", desc: "Calendário editorial, ideias de conteúdo, posicionamento, tom de voz. O /content-idea gera sugestões baseadas no que você já publicouu e nos seus objetivos." },
    { icon: <BarChart3 className="h-5 w-5 text-green-400" />, title: "Gestores e Líderes", desc: "Acompanha projetos da equipe, registra decisões estratégicas, revisão semanal de prioridades. O vault vira seu segundo cérebro gerencial." },
  ];

  return (
    <section className="py-20 sm:py-28 bg-black">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-4">
          Funciona pra você se você usa{" "}
          <span className="text-gradient-green">Claude Code</span>
        </h2>
        <p className="text-[15px] text-zinc-400 leading-relaxed mb-10">
          O kit é modular. Vem com um core universal que funciona pra qualquer pessoa + um módulo de negócios que é opcional. Você usa o que fizer sentido e adapta o resto.
        </p>

        <div className="space-y-4">
          {PROFILES.map((profile) => (
            <div
              key={profile.title}
              className="glass p-6 flex items-start gap-4"
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
      </div>
    </section>
  );
}

/* ─── Section 7: Pra Quem NÃO É ─── */
function NotForSection() {
  const WARNINGS = [
    { title: "Você não tem Claude Code.", desc: "O kit depende do Claude Code funcionando na sua máquina. Sem ele, os slash commands não rodam. Você precisa de um plano Pro, Max ou acesso via API." },
    { title: "Você quer mágica sem esforço.", desc: "O kit vem com templates e guias, mas você precisa preencher com os SEUS dados. São 30-60 minutos de setup inicial. Se não éstá disposto a investir esse tempo, não vai funcionar." },
    { title: "Você espera um curso com vídeo-aulas.", desc: "Isso não é um curso. É um sistema pronto. Tem guias escritos e suporte via IA, mas não tem vídeo-aula de 10 horas. É direto ao ponto." },
    { title: "Você nunca usou um terminal.", desc: "O Claude Code roda no terminal. Se você nunca abriu um terminal na vida e não tem interesse em aprender, esse kit não vai funcionar pra você." },
  ];

  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
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

        <p className="mt-8 text-sm text-zinc-600 text-center">
          Se nenhum desses se aplica, continua lendo. O que vem a seguir vai fazer R$37 parecer piada.
        </p>
      </div>
    </section>
  );
}

/* ─── Section 8: Comparação de Valor ─── */
function ValueComparisonSection() {
  const COMPARISONS = [
    { price: "R$38", label: "Um lanche no iFood", duration: "dura 20 minutos", highlight: false },
    { price: "R$45", label: "Uma pizza media", duration: "dura uma noite", highlight: false },
    { price: "R$35", label: "4 cafes na semana", duration: "dura 4 dias", highlight: false },
    { price: "R$37", label: "Kit Segundo Cérebro", duration: "funciona pra sempre", highlight: true },
  ];

  return (
    <section className="py-20 sm:py-28 bg-black">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-center mb-12">
          O que mais você compra com{" "}
          <span className="text-gradient-green">R$37</span>?
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
              <div className={`font-heading text-2xl font-extrabold mb-1 ${item.highlight ? "text-green-400" : "text-zinc-300"}`}>
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
            O lanche acaba em 20 minutos. A pizza acaba na mesma noite. O cafe acaba antes do almoço.
          </p>
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            O segundo cérebro <strong className="text-white">fica mais inteligente a cada dia que você usa.</strong> Acumula conhecimento, registra decisões, consolida aprendizados. Daqui a 6 mêses ele vai saber mais sobre o seu trabalho do que qualquer colega.
          </p>
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            E o preço de R$37 é só pros primeiros 30. Depois disso, sobe pra R$67 e não volta.
          </p>
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            Se você ganha R$50/hora e o kit te economiza 1 hora por semana (e vai economizar mais), ele se paga em menos de uma semana. Nas 51 semanas seguintes, é lucro puro — de tempo, não de dinheiro. <strong className="text-white">Tempo que você usa pra fazer o que importa em vez de ficar explicando contexto pra IA.</strong>
          </p>
        </div>
      </div>
    </section>
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
      q: "Funciona pro meu caso? Eu não sou empresario.",
      a: "O kit é modular. O core universal (daily-briefing, end-session, braindump, weekly-review, templates de identidade/objetivos/projetos) funciona pra qualquer pessoa. O módulo de negócios (prospect-research, pipeline, proposal-generator) é opcional — pode usar ou deletar. Tem exemplos de personalização pra dev, estudante, criador de conteúdo, gestor, freelancer.",
    },
    {
      q: "E se o Claude atualizar e o kit ficar desatualizado?",
      a: "O kit é feito de arquivos markdown. Markdown não tem versão, não tem dependência, não quebra com updates. O CLAUDE.md e os slash commands funcionam com qualquer versão do Claude Code. A estrutura é atemporal por design.",
    },
    {
      q: "\"São só arquivos de texto. Pagar por .md?\"",
      a: "Da mesma forma que um contrato de 2 páginas pode valer milhões e um livro pode mudar uma vida — o valor não éstá no formato, está no conteúdo. Você está pagando pelas semanas de refinamento condensadas em arquivos prontos pra usar. Pelo prompt engineering. Pela lógica dos comandos. Pelos guardrails. Pelo tempo que você NÃO vai gastar tentando fazer tudo do zero.",
    },
    {
      q: "E se eu não conseguir configurar?",
      a: "O kit vem com guia de instalação passo a passo, guia de personalização com exemplos, 4 prompts de setup que fazem o trabalho pesado, e um prompt de suporte via IA que você cola num chat e tem um assistente disponível 24h que conhece o kit inteiro. Se mesmo assim travar, me manda uma DM.",
    },
  ];

  return (
    <section id="faq" className="py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight mb-10">
          Perguntas que você
          <br />
          <span className="text-green-400">provavelmente tem.</span>
        </h2>

        <div className="divide-y divide-white/5">
          {QUESTIONS.map((item) => (
            <div key={item.q} className="py-6">
              <div className="flex items-start gap-3 mb-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-black text-[13px] font-bold">
                  ?
                </span>
                <h3 className="font-heading text-[15px] font-semibold text-white leading-snug">
                  {item.q}
                </h3>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed pl-9">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Section 10: Suporte Infinito ─── */
function SupportSection() {
  return (
    <section className="py-20 sm:py-28 bg-black">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-6">
          Compre uma vez. Tenha suporte{" "}
          <span className="text-gradient-green">pra sempre.</span>
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
            Ele tira dúvidas de instalação, ajuda a personalizar, resolve erros, ensina a criar novos comandos, e guia qualquer modificação que você quiser fazer. <strong className="text-white">Disponível 24h. Sem fila. Sem ticket. Sem prazo de expiração.</strong>
          </p>
        </div>

        <p className="text-[15px] text-zinc-400 leading-relaxed">
          Pensa nisso: você está pagando R$37 por um kit que vem com suporte técnico ilimitado e permanente. Qualquer SaaS cobra isso <em>por mês</em> só pelo suporte.
        </p>
      </div>
    </section>
  );
}

/* ─── Section 11: Preço + CTA ─── */
function PricingSection() {
  return (
    <section id="comprar" className="py-24 sm:py-32 relative">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-green-500/[0.04] blur-[150px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
          Pronto pra montar o seu?
        </h2>

        <div className="space-y-4 text-[15px] text-zinc-400 leading-relaxed max-w-lg mx-auto mb-10">
          <p>
            Se eu vendesse isso como consultoria de setup personalizado, cobraria R$3.000+ (e já vendi). Se vendesse como curso com vídeo-aulas, cobraria R$197. Se vendesse como assinatura mensal com suporte, cobraria R$97/mês.
          </p>
          <p>
            Mas não é nada disso. É um kit pronto. Você baixa, personaliza, e usa. Uma vez.
          </p>
        </div>

        {/* Price box */}
        <div className="mx-auto max-w-sm rounded-lg border-2 border-green-500/40 bg-green-500/[0.06] p-8 mb-6">
          <div className="font-mono text-lg text-zinc-500 line-through mb-1">R$67</div>
          <div className="font-heading text-5xl sm:text-6xl font-extrabold text-green-400 mb-2">R$37</div>
          <p className="text-sm text-green-300/70 mb-6">
            Preço de lançamento — só pros 30 primeiros. Depois sobe pra R$67.
          </p>
          <a
            href={CHECKOUT_URL}
            className="block w-full rounded-lg bg-green-500 px-8 py-4 text-lg font-bold text-black transition-all duration-200 hover:bg-green-400 hover:-translate-y-0.5 cursor-pointer animate-pulse-glow"
          >
            Quero o Kit Segundo Cérebro &rarr;
          </a>
          <p className="font-mono text-[11px] text-zinc-500 mt-4">
            Pagamento seguro via Kiwify &middot; Entrega instantânea &middot; Acesso imediato
          </p>
        </div>

        <p className="font-mono text-[12px] text-zinc-600 leading-relaxed">
          CLAUDE.md profissional &middot; 8 slash commands &middot; 4 prompts de setup &middot; 9 templates &middot; Guias completos &middot; Suporte via IA incluso
        </p>
      </div>
    </section>
  );
}

/* ─── Section 12: Último Empurrão ─── */
function FinalPushSection() {
  return (
    <section className="py-20 sm:py-28 bg-black">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="space-y-6 text-base sm:text-lg text-zinc-400 leading-relaxed">
          <p>Você tem duas opções agora.</p>
          <p>
            A primeira e fechar essa pagina. Abrir o Claude Code amanhã. Digitar aquele paragrafo de contexto que você sempre digita. Receber uma resposta genérica. Repetir isso na terça, na quarta, na semana que vem, no mês que vem. E cada vez que abrir um chat novo, começar do zero. De novo.
          </p>
          <p>
            A segunda e clicar no botao, baixar o kit, e gastar 30 minutos configurando o seu segundo cérebro.
          </p>
          <p className="text-white font-bold">
            Daqui a 30 minutos, você pode abrir o Claude Code, digitar{" "}
            <code className="text-green-400 bg-green-500/10 px-2 py-0.5 rounded">/daily-briefing</code>{" "}
            e receber um resumo personalizado do seu dia. Sem explicar nada. Sem contextualizar. Sem começar do zero.
          </p>
          <p>O cérebro vai estar te esperando.</p>
        </div>

        <div className="mt-10 text-center">
          <a
            href="#comprar"
            className="group inline-flex items-center gap-2 rounded-lg bg-green-500 px-10 py-4 text-base font-bold text-black transition-all duration-200 hover:bg-green-400 hover:-translate-y-0.5 cursor-pointer green-glow"
          >
            Montar meu Segundo Cérebro — R$37 &rarr;
          </a>
          <p className="mt-4 font-mono text-[12px] text-green-300/70">
            Os 30 primeiros pagam R$37. Depois sobe pra R$67 e não volta.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─── Section 13: Footer ─── */
function SCFooter() {
  return (
    <footer className="border-t border-white/5 py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <Image
            src="/lockup-sem-fundo.png"
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
          Produto digital &middot; Entrega instantânea via Kiwify &middot; Sem assinatura
        </p>
      </div>
    </footer>
  );
}

/* ─── Upsell: Jarvis Kit (cross-sell on Segundo Cérebro page) ─── */
function JarvisUpsell() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <div className="rounded-lg border border-green-500/20 bg-green-500/[0.04] p-8 sm:p-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="h-px w-5 bg-green-400/40" />
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-green-400/70">
              Oferta especial
            </span>
            <span className="h-px w-5 bg-green-400/40" />
          </div>

          <h3 className="font-heading text-xl sm:text-2xl font-bold text-white mb-3">
            Conhece o{" "}
            <span className="text-gradient-green">Jarvis Kit</span>?
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-md mx-auto mb-6">
            Automação por palmas e voz. Duas palmas e tudo liga sozinho. O companheiro perfeito pro seu Segundo Cérebro.
          </p>

          {/* Kiwify upsell widget */}
          <div
            id="kiwify-upsell-D3Ari3v"
            data-upsell-url=""
            data-downsell-url=""
            style={{ textAlign: "center" }}
          >
            <button
              id="kiwify-upsell-trigger-D3Ari3v"
              className="rounded-lg bg-green-500 px-8 py-3 text-base font-bold text-black transition-all duration-200 hover:bg-green-400 cursor-pointer green-glow"
            >
              Sim, eu aceito essa oferta especial!
            </button>
            <div
              id="kiwify-upsell-cancel-trigger-D3Ari3v"
              className="mt-4 cursor-pointer text-sm text-zinc-500 underline"
            >
              Não, eu gostaria de recusar essa oferta
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Main Component ─── */
export function SegundoCerebro({ onBack }: SegundoCerebroProps) {
  return (
    <>
      <SCNavbar onBack={onBack} />
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
        <JarvisUpsell />
      </main>
      <SCFooter />

      {/* Kiwify upsell script */}
      <Script src="https://snippets.kiwify.com/upsell/upsell.min.js" strategy="lazyOnload" />
    </>
  );
}
