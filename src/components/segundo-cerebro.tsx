"use client";

import { useState } from "react";
import { Menu, X, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Script from "next/script";

interface SegundoCerebroProps {
  onBack: () => void;
}

const CHECKOUT_URL = "SEU_LINK_KIWIFY_AQUI";

/* ─── Navbar ─── */
function SCNavbar({ onBack }: { onBack: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const NAV_LINKS = [
    { label: "O que vem no kit", href: "#kit" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header className="fixed top-4 left-4 right-4 z-50">
      <nav className="mx-auto max-w-3xl glass rounded-2xl px-6 py-3 flex items-center justify-between">
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
          className="hidden md:inline-flex items-center gap-2 rounded-full bg-purple-500 px-5 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-purple-400 cursor-pointer purple-glow-sm"
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
        <div className="md:hidden mt-2 mx-auto max-w-3xl glass rounded-2xl p-6 flex flex-col gap-4">
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
            className="inline-flex items-center justify-center gap-2 rounded-full bg-purple-500 px-5 py-2.5 text-sm font-semibold text-white cursor-pointer"
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
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 text-center">
        {/* Badge */}
        <div className="animate-fade-in-up inline-flex items-center gap-3 mb-8">
          <span className="h-px w-5 bg-purple-400" />
          <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-purple-400">
            Kit Segundo Cerebro
          </span>
          <span className="h-px w-5 bg-purple-400" />
        </div>

        {/* Headline */}
        <h1 className="animate-fade-in-up delay-100 font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
          Configura uma vez.
          <br />
          <span className="text-gradient-purple">Ele nunca mais esquece.</span>
        </h1>

        {/* Subheadline */}
        <p className="animate-fade-in-up delay-200 mt-6 max-w-xl mx-auto text-base sm:text-lg text-zinc-400 leading-relaxed">
          O sistema completo pra dar <strong className="text-white">memoria permanente</strong> pro seu Claude Code. Ele lembra quem voce e, o que faz, e o que precisa — <strong className="text-white">sem voce explicar de novo toda vez.</strong>
        </p>

        {/* Price + CTA */}
        <div className="animate-fade-in-up delay-300 mt-10">
          <div className="flex items-baseline justify-center gap-3 mb-6">
            <span className="font-mono text-lg text-zinc-500 line-through">R$67</span>
            <span className="font-heading text-5xl sm:text-6xl font-extrabold text-purple-400">R$37</span>
          </div>
          <a
            href="#comprar"
            className="group inline-flex items-center gap-2 rounded-xl bg-purple-500 px-10 py-4 text-base font-bold text-white transition-all duration-200 hover:bg-purple-400 hover:-translate-y-0.5 cursor-pointer purple-glow"
          >
            Quero o Kit — R$37 &rarr;
          </a>
          <p className="mt-4 font-mono text-[12px] text-purple-300/70 font-medium">
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
    "A resposta sai generica porque ele nao te conhece",
    "Nao lembra o que voces fizeram ontem",
    "Nao sabe quais decisoes voce ja tomou",
    "Repete sugestoes que voce ja descartou semanas atras",
    "Cada sessao comeca do zero, como se voces nunca tivessem conversado",
  ];

  return (
    <section className="py-20 sm:py-28 bg-black">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-8">
          Isso aqui te parece familiar?
        </h2>

        <div className="space-y-5 mb-10">
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            Voce abre o Claude Code. Tem uma tarefa pra fazer. Mas antes de comecar, precisa explicar tudo de novo.
          </p>
          <p className="text-[15px] text-zinc-300 italic leading-relaxed">
            &ldquo;Eu sou freelancer, trabalho com design, meu publico e tal, meu preco e tal, o projeto atual e esse, o cliente pediu aquilo...&rdquo;
          </p>
          <p className="text-[15px] text-white font-semibold">
            Toda. Santa. Vez.
          </p>
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            Voce digita um paragrafo inteiro de contexto antes de fazer a pergunta real. E mesmo assim, a resposta vem generica porque o Claude nao sabe o suficiente sobre voce.
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/5 my-10" />

        {/* Pain list */}
        <div className="space-y-4 mb-10">
          {PAIN_ITEMS.map((item) => (
            <div key={item} className="flex items-start gap-3">
              <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-red-500/15 flex items-center justify-center">
                <span className="text-red-400 text-xs font-bold">&times;</span>
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
            E a pior parte? Voce sabe que o Claude e capaz de muito mais. Voce ve o potencial. Mas ele esta operando com amnesia permanente. E como ter um socio brilhante que acorda toda manha sem nenhuma lembranca do dia anterior.
          </p>
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            Agora multiplica isso por semanas. Meses. Quantas horas voce ja perdeu re-explicando as mesmas coisas?
          </p>
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            Quantas respostas genericas voce aceitou porque nao tinha paciencia de contextualizar tudo de novo?
          </p>
          <p className="text-[15px] text-white font-semibold leading-relaxed">
            E o pior: quantas vezes voce deixou de usar o Claude porque dava preguica de explicar tudo de novo?
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─── Section 3: A Revelacao ─── */
function RevelationSection() {
  const BENEFITS = [
    "Sabe quem voce e e o que faz",
    "Lembra dos seus projetos, objetivos e decisoes",
    "Se atualiza sozinho a cada sessao de trabalho",
    "Executa tarefas complexas com um unico comando",
    "Fica mais inteligente quanto mais voce usa",
    "Funciona como um socio que nunca esquece nada",
  ];

  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-6">
          E se voce configurasse{" "}
          <span className="text-gradient-purple">uma vez</span>{" "}
          e ele nunca mais esquecesse?
        </h2>

        <p className="text-[15px] text-zinc-400 leading-relaxed mb-6">
          Imagina abrir o Claude Code numa segunda-feira de manha e, em vez de gastar 10 minutos explicando contexto, voce digita uma linha:
        </p>

        {/* Terminal block */}
        <div className="rounded-xl bg-[#0d0d0d] border border-purple-500/15 p-5 mb-6 font-mono">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-3 h-3 rounded-full bg-red-500/60" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <span className="w-3 h-3 rounded-full bg-green-500/60" />
          </div>
          <p className="text-purple-400 text-sm">
            <span className="text-zinc-500">$</span> /daily-briefing
          </p>
        </div>

        <p className="text-[15px] text-zinc-400 leading-relaxed mb-2">
          E ele te responde com um briefing completo do seu dia: o que ficou pendente da semana passada, quais projetos estao ativos, quais decisoes voce tomou recentemente, o que precisa de atencao urgente, e o que fazer primeiro.
        </p>
        <p className="text-[15px] text-white font-semibold mb-4">
          Sem voce explicar nada. Porque ele ja sabe tudo.
        </p>

        {/* Screenshot placeholder: /prospect-research */}
        <div className="rounded-2xl overflow-hidden border border-purple-500/10 mb-10 bg-zinc-900/50">
          <div className="aspect-video flex items-center justify-center p-8">
            <div className="text-center">
              <div className="font-mono text-[10px] uppercase tracking-widest text-purple-400/60 mb-2">screenshot</div>
              <p className="text-sm text-zinc-500">Output do /prospect-research — score de qualificacao, analise completa</p>
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
            Isso nao e ficcao. Nao e uma feature futura do Claude. <strong className="text-white">Isso funciona hoje.</strong>
          </p>
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            E um sistema de memoria persistente que usa o Obsidian como vault e o Claude Code como cerebro. Voce alimenta o sistema com o que ele precisa saber sobre voce, e ele usa essa informacao pra operar com contexto completo. Sempre.
          </p>
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            Eu construi esse sistema pra mim. Levei semanas refinando cada detalhe: as regras de operacao, os guardrails, a logica de memoria, os comandos personalizados. E agora empacotei tudo num kit pronto pra voce usar.
          </p>
        </div>

        {/* Screenshot placeholder: .claude/commands/ */}
        <div className="rounded-2xl overflow-hidden border border-purple-500/10 mt-8 bg-zinc-900/50">
          <div className="aspect-video flex items-center justify-center p-8">
            <div className="text-center">
              <div className="font-mono text-[10px] uppercase tracking-widest text-purple-400/60 mb-2">screenshot</div>
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
      desc: "Um comando. Briefing completo do dia com tudo que voce precisa saber.",
      placeholder: "Output do /daily-briefing no terminal",
    },
    {
      title: "/braindump",
      desc: "Teve uma ideia? Joga pro cerebro. Ele captura, conecta com o que ja existe no vault, e arquiva.",
      placeholder: "Output do /braindump no terminal",
    },
    {
      title: "/end-session",
      desc: "Terminou de trabalhar? Um comando e ele consolida tudo que aconteceu, atualiza a memoria, registra decisoes e aprendizados.",
      descBold: "Amanha quando voce abrir, ele sabe exatamente onde voces pararam.",
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
          <span className="text-gradient-purple">um comando</span>
        </h2>
        <p className="text-center text-zinc-500 text-[15px] mb-12">
          Screenshots reais do sistema funcionando.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {DEMOS.map((demo) => (
            <div
              key={demo.title}
              className="glass border-purple-500/10 rounded-2xl overflow-hidden"
            >
              {/* Screenshot placeholder */}
              <div className="aspect-video bg-zinc-900/50 flex items-center justify-center p-6">
                <div className="text-center">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-purple-400/60 mb-2">screenshot</div>
                  <p className="text-xs text-zinc-600">{demo.placeholder}</p>
                </div>
              </div>
              {/* Text */}
              <div className="p-6">
                <h3 className="font-mono text-purple-400 text-sm font-bold mb-2">
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
      title: "CLAUDE.md — A alma do cerebro",
      desc: "Centenas de linhas de prompt engineering refinado: identidade personalizavel, regras de memoria, guardrails de escrita, protecao contra prompt injection, logica de auto-atualizacao, modulo de negocios ativavel, e tabela de comandos. E o que faz o sistema funcionar. Levei semanas refinando esse arquivo.",
      highlight: true,
    },
    {
      title: "8 Slash Commands prontos",
      desc: "4 comandos universais (daily-briefing, end-session, braindump, weekly-review) + 1 semi-universal (content-idea) + 3 do modulo de negocios (prospect-research, pipeline, proposal-generator). Cada um e um mini-sistema com logica condicional e formatacao profissional.",
      highlight: true,
    },
    {
      title: "4 Prompts de Setup",
      desc: "Os mesmos prompts que eu mostro no video. Criam a estrutura do vault, geram os templates de knowledge, inicializam a memoria, e validam que tudo funciona. Voce nao precisa lembrar de cor — esta tudo pronto pra copiar e colar.",
      highlight: false,
    },
    {
      title: "9 Templates de Knowledge",
      desc: "4 universais (about-me, goals, projects, references) + 5 do modulo de negocios (positioning, icp, services, tone-of-voice, pricing). Cada template tem perguntas-guia que te ajudam a preencher sem ficar olhando pra tela em branco.",
      highlight: false,
    },
    {
      title: "Guia de Instalacao",
      desc: "Do zero ao vault funcionando. Passo a passo com screenshots: instalar Obsidian, instalar Claude Code, configurar, testar. Inclui setup de Git sync pra backup automatico.",
      highlight: false,
    },
    {
      title: "Guia de Personalizacao",
      desc: "Como transformar o template generico no SEU cerebro. Com exemplos pra diferentes perfis: freelancer, dev, estudante, criador de conteudo, gestor. Inclui dicas avancadas pra criar novos comandos.",
      highlight: false,
    },
    {
      title: "Suporte Infinito via IA",
      desc: "Um prompt que voce cola num chat novo e ganha um assistente que conhece o kit inteiro. Tira duvidas, ajuda a personalizar, resolve erros, guia criacao de novos comandos. Disponivel 24h, sem fila, sem ticket. Pra sempre.",
      highlight: true,
    },
    {
      title: "Vault completo com estrutura pronta",
      desc: "Nao precisa criar nada do zero. O vault ja vem montado com todas as pastas organizadas (_memory, _knowledge, _learnings, _decisions, _sessions, _pipeline), onboarding (START-HERE.md), exemplo preenchido de pipeline, e .gitignore configurado. Descompacta e ja esta rodando.",
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
          Nao e um curso. Nao e um ebook. E um{" "}
          <strong className="text-white">sistema pronto pra usar.</strong>{" "}
          Voce descompacta, personaliza com os seus dados, e o cerebro ja esta funcionando.
        </p>

        {/* Screenshots: vault structure + CLAUDE.md + template */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <div className="rounded-2xl overflow-hidden border border-purple-500/10 bg-zinc-900/50">
            <div className="aspect-[4/3] flex items-center justify-center p-4">
              <div className="text-center">
                <div className="font-mono text-[10px] uppercase tracking-widest text-purple-400/60 mb-2">screenshot</div>
                <p className="text-xs text-zinc-600">Sidebar do Obsidian — estrutura do vault</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden border border-purple-500/10 bg-zinc-900/50">
            <div className="aspect-[4/3] flex items-center justify-center p-4">
              <div className="text-center">
                <div className="font-mono text-[10px] uppercase tracking-widest text-purple-400/60 mb-2">screenshot</div>
                <p className="text-xs text-zinc-600">CLAUDE.md aberto — densidade do conteudo</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden border border-purple-500/10 bg-zinc-900/50">
            <div className="aspect-[4/3] flex items-center justify-center p-4">
              <div className="text-center">
                <div className="font-mono text-[10px] uppercase tracking-widest text-purple-400/60 mb-2">screenshot</div>
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
                  ? "border-purple-500/15 bg-gradient-to-br from-white/5 to-purple-500/[0.03]"
                  : ""
              }`}
            >
              <h3 className={`font-mono text-sm font-bold mb-2 ${card.highlight ? "text-purple-400" : "text-purple-400/70"}`}>
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

/* ─── Section 6: Pra Quem E ─── */
function AudienceSection() {
  const PROFILES = [
    { icon: "💻", title: "Desenvolvedores", desc: "Gerencia sprints, documenta decisoes tecnicas, registra aprendizados de debugging. O daily-briefing vira seu standup pessoal. Renomeia _pipeline/ pra _projects/ e pronto." },
    { icon: "🎯", title: "Freelancers e Agencias", desc: "Pipeline de clientes, pesquisa de prospects, geracao de propostas, follow-ups. O modulo de negocios foi feito pra voce. O Claude vira seu gerente comercial que nunca esquece um lead." },
    { icon: "📚", title: "Estudantes e Pesquisadores", desc: "Organiza TCC, mestrado, projetos de pesquisa. Captura insights com braindump, registra referencias, acompanha progresso. O weekly-review vira sua bussola academica." },
    { icon: "🎬", title: "Criadores de Conteudo", desc: "Calendario editorial, ideias de conteudo, posicionamento, tom de voz. O /content-idea gera sugestoes baseadas no que voce ja publicou e nos seus objetivos." },
    { icon: "📊", title: "Gestores e Lideres", desc: "Acompanha projetos da equipe, registra decisoes estrategicas, revisao semanal de prioridades. O vault vira seu segundo cerebro gerencial." },
  ];

  return (
    <section className="py-20 sm:py-28 bg-black">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-4">
          Funciona pra voce se voce usa{" "}
          <span className="text-gradient-purple">Claude Code</span>
        </h2>
        <p className="text-[15px] text-zinc-400 leading-relaxed mb-10">
          O kit e modular. Vem com um core universal que funciona pra qualquer pessoa + um modulo de negocios que e opcional. Voce usa o que fizer sentido e adapta o resto.
        </p>

        <div className="space-y-4">
          {PROFILES.map((profile) => (
            <div
              key={profile.title}
              className="glass p-6 flex items-start gap-4"
            >
              <span className="text-2xl flex-shrink-0">{profile.icon}</span>
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

/* ─── Section 7: Pra Quem NAO E ─── */
function NotForSection() {
  const WARNINGS = [
    { title: "Voce nao tem Claude Code.", desc: "O kit depende do Claude Code funcionando na sua maquina. Sem ele, os slash commands nao rodam. Voce precisa de um plano Pro, Max ou acesso via API." },
    { title: "Voce quer magica sem esforco.", desc: "O kit vem com templates e guias, mas voce precisa preencher com os SEUS dados. Sao 30-60 minutos de setup inicial. Se nao esta disposto a investir esse tempo, nao vai funcionar." },
    { title: "Voce espera um curso com video-aulas.", desc: "Isso nao e um curso. E um sistema pronto. Tem guias escritos e suporte via IA, mas nao tem video-aula de 10 horas. E direto ao ponto." },
    { title: "Voce nunca usou um terminal.", desc: "O Claude Code roda no terminal. Se voce nunca abriu um terminal na vida e nao tem interesse em aprender, esse kit nao vai funcionar pra voce." },
  ];

  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-4">
          Honestidade: esse kit{" "}
          <strong>nao e</strong>{" "}
          pra todo mundo
        </h2>
        <p className="text-[15px] text-zinc-400 leading-relaxed mb-10">
          Eu prefiro te dizer agora do que voce descobrir depois. Se algum desses se aplica, esse kit nao e pra voce:
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

/* ─── Section 8: Comparacao de Valor ─── */
function ValueComparisonSection() {
  const COMPARISONS = [
    { price: "R$38", label: "Um lanche no iFood", duration: "dura 20 minutos", highlight: false },
    { price: "R$45", label: "Uma pizza media", duration: "dura uma noite", highlight: false },
    { price: "R$35", label: "4 cafes na semana", duration: "dura 4 dias", highlight: false },
    { price: "R$37", label: "Kit Segundo Cerebro", duration: "funciona pra sempre", highlight: true },
  ];

  return (
    <section className="py-20 sm:py-28 bg-black">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-center mb-12">
          O que mais voce compra com{" "}
          <span className="text-gradient-purple">R$37</span>?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          {COMPARISONS.map((item) => (
            <div
              key={item.label}
              className={`rounded-2xl p-6 text-center transition-all ${
                item.highlight
                  ? "border-2 border-purple-500/40 bg-purple-500/[0.06] purple-glow-sm"
                  : "glass"
              }`}
            >
              <div className={`font-heading text-2xl font-extrabold mb-1 ${item.highlight ? "text-purple-400" : "text-zinc-300"}`}>
                {item.price}
              </div>
              <div className={`text-sm font-semibold mb-2 ${item.highlight ? "text-white" : "text-zinc-400"}`}>
                {item.label}
              </div>
              <div className={`font-mono text-[11px] uppercase tracking-widest ${item.highlight ? "text-purple-300" : "text-zinc-600"}`}>
                {item.duration}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-5">
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            O lanche acaba em 20 minutos. A pizza acaba na mesma noite. O cafe acaba antes do almoco.
          </p>
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            O segundo cerebro <strong className="text-white">fica mais inteligente a cada dia que voce usa.</strong> Acumula conhecimento, registra decisoes, consolida aprendizados. Daqui a 6 meses ele vai saber mais sobre o seu trabalho do que qualquer colega.
          </p>
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            E o preco de R$37 e so pros primeiros 30. Depois disso, sobe pra R$67 e nao volta.
          </p>
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            Se voce ganha R$50/hora e o kit te economiza 1 hora por semana (e vai economizar mais), ele se paga em menos de uma semana. Nas 51 semanas seguintes, e lucro puro — de tempo, nao de dinheiro. <strong className="text-white">Tempo que voce usa pra fazer o que importa em vez de ficar explicando contexto pra IA.</strong>
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
      a: "A estrutura de pastas? Sim. Mas o CLAUDE.md com centenas de linhas de prompt engineering refinado, guardrails de protecao, logica de memoria auto-atualizavel, e 8 slash commands com logica condicional encadeada? Esse e o trabalho de semanas que voce recebe pronto. O setup que voce ve no video e a parte facil. A alma que faz funcionar e o que esta no kit.",
    },
    {
      q: "Preciso de qual plano do Claude?",
      a: "Qualquer plano que de acesso ao Claude Code: Pro, Max ou API. O kit nao requer nenhuma feature especial. Se voce ja usa Claude Code, tem tudo que precisa.",
    },
    {
      q: "Funciona pro meu caso? Eu nao sou empresario.",
      a: "O kit e modular. O core universal (daily-briefing, end-session, braindump, weekly-review, templates de identidade/objetivos/projetos) funciona pra qualquer pessoa. O modulo de negocios (prospect-research, pipeline, proposal-generator) e opcional — pode usar ou deletar. Tem exemplos de personalizacao pra dev, estudante, criador de conteudo, gestor, freelancer.",
    },
    {
      q: "E se o Claude atualizar e o kit ficar desatualizado?",
      a: "O kit e feito de arquivos markdown. Markdown nao tem versao, nao tem dependencia, nao quebra com updates. O CLAUDE.md e os slash commands funcionam com qualquer versao do Claude Code. A estrutura e atemporal por design.",
    },
    {
      q: "\"Sao so arquivos de texto. Pagar por .md?\"",
      a: "Da mesma forma que um contrato de 2 paginas pode valer milhoes e um livro pode mudar uma vida — o valor nao esta no formato, esta no conteudo. Voce esta pagando pelas semanas de refinamento condensadas em arquivos prontos pra usar. Pelo prompt engineering. Pela logica dos comandos. Pelos guardrails. Pelo tempo que voce NAO vai gastar tentando fazer tudo do zero.",
    },
    {
      q: "E se eu nao conseguir configurar?",
      a: "O kit vem com guia de instalacao passo a passo, guia de personalizacao com exemplos, 4 prompts de setup que fazem o trabalho pesado, e um prompt de suporte via IA que voce cola num chat e tem um assistente disponivel 24h que conhece o kit inteiro. Se mesmo assim travar, me manda uma DM.",
    },
  ];

  return (
    <section id="faq" className="py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight mb-10">
          Perguntas que voce
          <br />
          <span className="text-purple-400">provavelmente tem.</span>
        </h2>

        <div className="divide-y divide-white/5">
          {QUESTIONS.map((item) => (
            <div key={item.q} className="py-6">
              <div className="flex items-start gap-3 mb-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-[13px] font-bold">
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
          <span className="text-gradient-purple">pra sempre.</span>
        </h2>

        <p className="text-[15px] text-zinc-400 leading-relaxed mb-8">
          Eu nao tenho uma equipe de suporte. Mas voce nao precisa de uma.
        </p>

        {/* Highlighted box */}
        <div className="rounded-xl border border-purple-500/20 bg-purple-500/[0.06] p-8 mb-8">
          <h3 className="font-heading text-xl font-bold text-white mb-4">
            Suporte Infinito via IA
          </h3>
          <p className="text-[15px] text-zinc-400 leading-relaxed mb-3">
            Dentro do kit tem um arquivo chamado <strong className="text-white">prompt-suporte-llm.md</strong>. Voce copia o conteudo, cola num chat novo do Claude ou ChatGPT, e ganha um assistente que conhece o kit inteiro.
          </p>
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            Ele tira duvidas de instalacao, ajuda a personalizar, resolve erros, ensina a criar novos comandos, e guia qualquer modificacao que voce quiser fazer. <strong className="text-white">Disponivel 24h. Sem fila. Sem ticket. Sem prazo de expiracao.</strong>
          </p>
        </div>

        <p className="text-[15px] text-zinc-400 leading-relaxed">
          Pensa nisso: voce esta pagando R$37 por um kit que vem com suporte tecnico ilimitado e permanente. Qualquer SaaS cobra isso <em>por mes</em> so pelo suporte.
        </p>
      </div>
    </section>
  );
}

/* ─── Section 11: Preco + CTA ─── */
function PricingSection() {
  return (
    <section id="comprar" className="py-24 sm:py-32 relative">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-purple-500/[0.04] blur-[150px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
          Pronto pra montar o seu?
        </h2>

        <div className="space-y-4 text-[15px] text-zinc-400 leading-relaxed max-w-lg mx-auto mb-10">
          <p>
            Se eu vendesse isso como consultoria de setup personalizado, cobraria R$3.000+ (e ja vendi). Se vendesse como curso com video-aulas, cobraria R$197. Se vendesse como assinatura mensal com suporte, cobraria R$97/mes.
          </p>
          <p>
            Mas nao e nada disso. E um kit pronto. Voce baixa, personaliza, e usa. Uma vez.
          </p>
        </div>

        {/* Price box */}
        <div className="mx-auto max-w-sm rounded-2xl border-2 border-purple-500/40 bg-purple-500/[0.06] p-8 mb-6">
          <div className="font-mono text-lg text-zinc-500 line-through mb-1">R$67</div>
          <div className="font-heading text-5xl sm:text-6xl font-extrabold text-purple-400 mb-2">R$37</div>
          <p className="text-sm text-purple-300/70 mb-6">
            Preco de lancamento — so pros 30 primeiros. Depois sobe pra R$67.
          </p>
          <a
            href={CHECKOUT_URL}
            className="block w-full rounded-xl bg-purple-500 px-8 py-4 text-lg font-bold text-white transition-all duration-200 hover:bg-purple-400 hover:-translate-y-0.5 cursor-pointer animate-pulse-glow-purple"
          >
            Quero o Kit Segundo Cerebro &rarr;
          </a>
          <p className="font-mono text-[11px] text-zinc-500 mt-4">
            Pagamento seguro via Kiwify &middot; Entrega instantanea &middot; Acesso imediato
          </p>
        </div>

        <p className="font-mono text-[12px] text-zinc-600 leading-relaxed">
          CLAUDE.md profissional &middot; 8 slash commands &middot; 4 prompts de setup &middot; 9 templates &middot; Guias completos &middot; Suporte via IA incluso
        </p>
      </div>
    </section>
  );
}

/* ─── Section 12: Ultimo Empurrao ─── */
function FinalPushSection() {
  return (
    <section className="py-20 sm:py-28 bg-black">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="space-y-6 text-base sm:text-lg text-zinc-400 leading-relaxed">
          <p>Voce tem duas opcoes agora.</p>
          <p>
            A primeira e fechar essa pagina. Abrir o Claude Code amanha. Digitar aquele paragrafo de contexto que voce sempre digita. Receber uma resposta generica. Repetir isso na terca, na quarta, na semana que vem, no mes que vem. E cada vez que abrir um chat novo, comecar do zero. De novo.
          </p>
          <p>
            A segunda e clicar no botao, baixar o kit, e gastar 30 minutos configurando o seu segundo cerebro.
          </p>
          <p className="text-white font-bold">
            Daqui a 30 minutos, voce pode abrir o Claude Code, digitar{" "}
            <code className="text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">/daily-briefing</code>{" "}
            e receber um resumo personalizado do seu dia. Sem explicar nada. Sem contextualizar. Sem comecar do zero.
          </p>
          <p>O cerebro vai estar te esperando.</p>
        </div>

        <div className="mt-10 text-center">
          <a
            href="#comprar"
            className="group inline-flex items-center gap-2 rounded-xl bg-purple-500 px-10 py-4 text-base font-bold text-white transition-all duration-200 hover:bg-purple-400 hover:-translate-y-0.5 cursor-pointer purple-glow"
          >
            Montar meu Segundo Cerebro — R$37 &rarr;
          </a>
          <p className="mt-4 font-mono text-[12px] text-purple-300/70">
            Os 30 primeiros pagam R$37. Depois sobe pra R$67 e nao volta.
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
          Kit Segundo Cerebro — por{" "}
          <a
            href="https://instagram.com/yangalasso"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400/70 hover:text-purple-300 transition-colors"
          >
            @yangalasso
          </a>
        </p>
        <p className="font-mono text-[11px] text-zinc-600 mt-1">
          Produto digital &middot; Entrega instantanea via Kiwify &middot; Sem assinatura
        </p>
      </div>
    </footer>
  );
}

/* ─── Upsell: Jarvis Kit (cross-sell on Segundo Cerebro page) ─── */
function JarvisUpsell() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <div className="rounded-2xl border border-green-500/20 bg-green-500/[0.04] p-8 sm:p-10">
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
            Automacao por palmas e voz. Duas palmas e tudo liga sozinho. O companheiro perfeito pro seu Segundo Cerebro.
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
              className="rounded-xl bg-green-500 px-8 py-3 text-base font-bold text-black transition-all duration-200 hover:bg-green-400 cursor-pointer green-glow"
            >
              Sim, eu aceito essa oferta especial!
            </button>
            <div
              id="kiwify-upsell-cancel-trigger-D3Ari3v"
              className="mt-4 cursor-pointer text-sm text-zinc-500 underline"
            >
              Nao, eu gostaria de recusar essa oferta
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
