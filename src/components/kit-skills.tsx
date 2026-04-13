"use client";

import { useState, useEffect } from "react";
import { Menu, X, ArrowLeft, ChevronDown } from "lucide-react";
import { useScrollReveal } from "@/lib/use-scroll-reveal";
import Image from "next/image";
import Link from "next/link";

const CHECKOUT_URL = "#"; // TODO: replace with Kiwify URL

/* ─── Navbar ─── */
function SKNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const NAV_LINKS = [
    { label: "O que fazem", href: "#skills" },
    { label: "O que vem", href: "#kit" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header className="fixed top-4 left-4 right-4 z-50">
      <nav className={`mx-auto max-w-3xl glass rounded-lg px-6 py-3 flex items-center justify-between transition-all duration-300 ${scrolled ? "navbar-scrolled" : ""}`}>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer mr-1"
            aria-label="Voltar aos kits"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Kits</span>
          </Link>
          <a href="#" className="flex items-center cursor-pointer">
            <Image
              src="/lockup-sem-fundo.svg"
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
              className="relative text-sm text-zinc-400 hover:text-white transition-colors duration-200 cursor-pointer after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-green-400 after:transition-all after:duration-300 hover:after:w-full"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <a
            href={CHECKOUT_URL}
            className="inline-flex items-center gap-2 rounded-full bg-green-500 px-4 py-2 text-xs sm:text-sm font-semibold text-black transition-all duration-200 hover:bg-green-400 hover:shadow-[0_0_20px_rgba(168,232,76,0.3)] cursor-pointer green-glow-sm"
          >
            Quero as Skills
          </a>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-white cursor-pointer p-2"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <div className={`md:hidden mt-2 mx-auto max-w-3xl rounded-lg border border-white/10 bg-[#0A0A0A]/90 backdrop-blur-xl p-6 flex flex-col gap-4 transition-all duration-300 origin-top ${
        mobileOpen ? "opacity-100 scale-y-100 translate-y-0" : "opacity-0 scale-y-95 -translate-y-2 pointer-events-none"
      }`}>
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
          href={CHECKOUT_URL}
          onClick={() => setMobileOpen(false)}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-green-500 px-5 py-2.5 text-sm font-semibold text-black cursor-pointer"
        >
          Quero as Skills
        </a>
      </div>
    </header>
  );
}

/* ─── Section 1: Hero ─── */
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-28 pb-16">
      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 text-center">
        {/* Badge */}
        <div className="animate-fade-in-up inline-flex items-center gap-3 mb-8">
          <span className="h-px w-5 bg-green-400" />
          <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-green-400">
            Pack de Skills
          </span>
          <span className="h-px w-5 bg-green-400" />
        </div>

        {/* Headline */}
        <h1 className="animate-fade-in-up delay-100 font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
          Se você usa o Claude Code sem Skills,
          <br />
          <span className="font-punch text-gradient-green">está usando 10% do que ele pode fazer.</span>
        </h1>

        {/* Subheadline */}
        <p className="animate-fade-in-up delay-200 mt-6 max-w-2xl mx-auto text-base sm:text-lg text-zinc-400 leading-relaxed">
          Esse é o kit com as 10 skills que eu uso todo dia pra transformar o Claude Code num time inteiro — designer, copywriter, auditor de SEO, testador e mais. Instale em 5 minutos. <strong className="text-white">Sem precisar ser técnico.</strong>
        </p>

        {/* CTA */}
        <div className="animate-fade-in-up delay-300 mt-10">
          <a
            href={CHECKOUT_URL}
            className="group inline-flex items-center gap-2 rounded-lg bg-green-500 px-10 py-4 text-base font-bold text-black transition-all duration-200 hover:bg-green-400 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(168,232,76,0.3)] cursor-pointer green-glow"
          >
            Quero as 10 Skills → R$47 <span className="transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
          </a>
          <p className="mt-4 font-mono text-[12px] text-zinc-500">
            Skills curadas entre 69.000+ disponíveis · Instalador visual incluso · Acesso imediato
          </p>
        </div>

        {/* Hero image placeholder */}
        <div className="animate-fade-in-up delay-400 mt-12 max-w-2xl mx-auto rounded-lg overflow-hidden border border-green-500/10">
          <div className="aspect-[16/9] bg-[#0d0d0d] flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                <span className="text-green-400 text-2xl">🎨</span>
              </div>
              <p className="text-zinc-600 text-sm font-mono">[HERO IMAGE PLACEHOLDER]</p>
              <p className="text-zinc-700 text-xs mt-1">Mockup do pack + instalador visual</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Section 2: Agitação da Dor ─── */
function PainSection() {
  const ref = useScrollReveal();

  return (
    <>
      <div className="section-divider" />
      <section className="py-20 sm:py-28 bg-black/80">
        <div ref={ref} className="scroll-reveal mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-8">
            Você reconhece isso?
          </h2>

          <div className="space-y-5">
            <p className="text-[15px] text-zinc-400 leading-relaxed">
              Você pede pro Claude criar uma landing page. Ele entrega. Funciona. Mas parece... <strong className="text-white">genérica.</strong> Fundo branco, gradiente roxo, fonte Inter. Igual a todas as outras que a IA gera.
            </p>
            <p className="text-[15px] text-zinc-400 leading-relaxed">
              Você termina o projeto, faz deploy, e manda o link pro cliente ou publica nas redes. Mas no fundo sabe que falta algo. A interface não parece profissional. A copy não converte. O SEO nem foi pensado. Os testes foram feitos no olho.
            </p>
            <p className="text-[15px] text-zinc-400 leading-relaxed">
              Aí você vê outros desenvolvedores — alguns com menos experiência que você — entregando projetos que parecem ter saído de um estúdio de design. Com landing pages que convertem. Com SEO configurado. Com tudo testado.
            </p>
            <p className="text-[15px] text-zinc-400 leading-relaxed">
              E pensa: <span className="text-white italic">&ldquo;o que esse cara tá fazendo de diferente?&rdquo;</span>
            </p>
            <p className="text-[15px] text-white font-semibold leading-relaxed">
              A resposta, em 90% dos casos, são <span className="font-punch text-gradient-green">skills</span>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

/* ─── Section 3: A Virada (Storytelling) ─── */
function StorySection() {
  const ref = useScrollReveal();

  return (
    <>
      <div className="section-divider" />
      <section className="py-20 sm:py-28">
        <div ref={ref} className="scroll-reveal mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-8">
            Como eu descobri que estava usando o Claude Code{" "}
            <span className="font-punch text-gradient-green">errado</span>
          </h2>

          <div className="space-y-5">
            <p className="text-[15px] text-zinc-400 leading-relaxed">
              Eu usava o Claude Code todo dia. Terminal, VS Code, projetos de cliente. Achava que estava tirando o máximo da ferramenta.
            </p>
            <p className="text-[15px] text-zinc-400 leading-relaxed">
              Até que descobri que existe um ecossistema com mais de <strong className="text-gradient-green font-semibold">69.000 skills</strong> disponíveis — arquivos que ensinam o Claude a fazer coisas que ele simplesmente não faz sozinho. Design com identidade visual real. Auditoria de SEO automática. Copy que converte usando frameworks de Ogilvy. Testes de interface sem abrir o navegador.
            </p>
            <p className="text-[15px] text-zinc-400 leading-relaxed">
              O problema? 99% dessas skills estão em inglês, espalhadas por centenas de repositórios no GitHub, sem nenhuma curadoria. Você não sabe quais funcionam, quais são confiáveis, quais fazem sentido pra quem constrói projetos completos — e não só pra quem quer brincar com código.
            </p>
            <p className="text-[15px] text-zinc-400 leading-relaxed">
              Passei semanas pesquisando, testando, quebrando e configurando. Filtrei entre milhares. Testei cada uma em projetos reais. Descartei as que eram hype e fiquei com as que de fato mudam o resultado.
            </p>
            <p className="text-[15px] text-white font-semibold leading-relaxed">
              Hoje, essas 10 skills são o que eu uso. <span className="text-gradient-green">Todo dia. Em todo projeto.</span>
            </p>
            <p className="text-[15px] text-zinc-400 leading-relaxed">
              E decidi empacotar exatamente o que eu uso pra você instalar em minutos — sem precisar passar pelas semanas de pesquisa que eu passei.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

/* ─── Section 4: O que são Skills ─── */
function WhatAreSkillsSection() {
  const ref = useScrollReveal();

  return (
    <>
      <div className="section-divider" />
      <section className="py-20 sm:py-28 bg-black/80">
        <div ref={ref} className="scroll-reveal mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-8">
            O que são Skills{" "}
            <span className="text-zinc-500">(e por que mudam tudo)</span>
          </h2>

          <div className="space-y-5">
            <p className="text-[15px] text-zinc-400 leading-relaxed">
              Pensa numa skill como um <strong className="text-gradient-green font-semibold">superpoder</strong> que você dá pro Claude Code.
            </p>
            <p className="text-[15px] text-zinc-400 leading-relaxed">
              Sem skills, o Claude é um assistente genérico. Inteligente, sim. Mas genérico. Ele não sabe que você quer design brutalista. Não sabe que sua landing page precisa de copy persuasiva. Não sabe que seu site precisa de schema markup pra SEO.
            </p>
            <p className="text-[15px] text-zinc-400 leading-relaxed">
              Com skills, o Claude vira um <strong className="text-gradient-green font-semibold">especialista</strong> naquela área. Uma skill de design faz ele pensar como um designer sênior antes de escrever qualquer código. Uma skill de SEO faz ele auditar seu site contra dezenas de critérios técnicos. Uma skill de copywriting faz ele aplicar frameworks que publicitários profissionais usam há décadas.
            </p>
            <p className="text-[15px] text-white font-semibold leading-relaxed">
              A diferença não é sutil. É brutal.
            </p>
            <p className="text-[15px] text-zinc-400 leading-relaxed">
              <strong className="text-gradient-green font-semibold">O mesmo prompt. O mesmo Claude. Resultados completamente diferentes.</strong>
            </p>
            <p className="text-[15px] text-zinc-400 leading-relaxed">
              E o melhor: você não precisa saber programar pra instalar. Skills são arquivos de texto que vão numa pasta do Claude Code. Instala uma vez, funciona pra sempre.
            </p>
          </div>

          {/* Before/After placeholder */}
          <div className="mt-10 grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-white/10 overflow-hidden">
              <div className="aspect-[4/3] bg-[#0d0d0d] flex items-center justify-center p-4">
                <div className="text-center">
                  <p className="text-red-400/60 text-xs font-mono mb-2">Sem Skill</p>
                  <p className="text-zinc-700 text-[11px]">[PLACEHOLDER]</p>
                  <p className="text-zinc-700 text-[10px] mt-1">Landing page genérica</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-green-500/20 overflow-hidden">
              <div className="aspect-[4/3] bg-[#0d0d0d] flex items-center justify-center p-4">
                <div className="text-center">
                  <p className="text-green-400/60 text-xs font-mono mb-2">Com Skill</p>
                  <p className="text-zinc-700 text-[11px]">[PLACEHOLDER]</p>
                  <p className="text-zinc-700 text-[10px] mt-1">Landing page profissional</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ─── Section 5: As 10 Skills ─── */
function SkillsSection() {
  const ref = useScrollReveal();

  const DESIGN_SKILLS = [
    {
      title: "Skill de Design Criativo",
      desc: "Força o Claude a escolher uma direção estética ousada antes de escrever qualquer código — brutalista, maximalista, editorial, retro-futurista, orgânico. Proíbe fontes genéricas (Inter, Roboto, Arial) e layouts previsíveis. O resultado parece ter saído de um estúdio de design, não de uma IA.",
      meta: "Criada pela Anthropic (criadores do Claude) · 277.000+ instalações",
    },
    {
      title: "Motor de Design Inteligente",
      desc: "Você descreve o projeto (\"dashboard fintech\", \"e-commerce de moda\") e a skill gera automaticamente um design system completo: estilo visual, paleta de cores e combinação de fontes — tudo personalizado pro tipo de produto. Funciona com React, Next.js, Vue, Svelte, Flutter, React Native e mais 4 stacks.",
      meta: "63.500+ estrelas no GitHub · 67 estilos de UI · 161 paletas · 57 combinações de fontes",
    },
    {
      title: "Revisor de Interface",
      desc: "Passa seu código por 100+ regras de acessibilidade e UX: labels corretos, tamanhos de toque, navegação por teclado, hierarquia de headings, suporte a reduced-motion. Tudo o que um designer sênior checaria num code review — só que automático.",
      meta: "Criada pela Vercel (criadores do Next.js)",
    },
    {
      title: "Corretor de Arquitetura de Componentes",
      desc: "Elimina o problema de componentes com dezenas de props impossíveis de manter. Ensina o Claude a usar padrões profissionais de composição — os mesmos que bibliotecas como Radix UI e shadcn/ui usam internamente.",
      meta: "Criada pela Vercel",
    },
  ];

  const DEPLOY_SKILLS = [
    {
      title: "Automação de Browser",
      desc: "Dá olhos e mãos ao Claude. Ele abre seu projeto no navegador, navega pelas páginas, clica nos botões, preenche formulários, tira screenshots e te diz se algo está quebrado — sem você precisar testar manualmente. Também faz testes exploratórios automáticos que encontram bugs como um QA profissional.",
      meta: "Criada pela Vercel · Consome 93% menos tokens que Playwright MCP · Detecta automaticamente 40+ frameworks",
    },
    {
      title: "Deploy com Um Comando",
      desc: "Você diz \"deploy\" e recebe a URL pública do seu projeto em segundos. Detecta automaticamente o framework, empacota tudo e publica. Sem configurar servidor, sem mexer em painel de hospedagem, sem terminal assustador.",
      meta: "Criada pela Vercel · Suporta 40+ frameworks",
    },
  ];

  const MARKETING_SKILLS = [
    {
      title: "Kit Completo de Marketing",
      desc: "34 sub-skills cobrindo tudo que um fundador solo precisa: otimização de conversão (CRO) pra landing pages, formulários e páginas de signup, copywriting persuasiva, sequências de email, estratégia de lançamento, psicologia de marketing, pesquisa de cliente, pricing, ads, analytics e mais. Não é teoria — cada skill atua diretamente no código do seu projeto.",
      meta: "34 sub-skills · Criada por Corey Haines (especialista em CRO e growth)",
    },
    {
      title: "Auditor de SEO Completo",
      desc: "Audita seu site inteiro com um comando. Encontra problemas técnicos, gera schema/JSON-LD correto, otimiza conteúdo pra rankear no Google E ser citado por IAs (ChatGPT, Perplexity, Google AI Overviews), analisa backlinks, e gera relatórios em PDF. Inclui 12 subagentes especializados.",
      meta: "19 sub-skills · 12 subagentes · Integra com Ahrefs e Semrush",
    },
    {
      title: "Copywriter de Frameworks Clássicos",
      desc: "Transforma o Claude num copywriter que aplica técnicas de David Ogilvy — o pai da propaganda moderna. Headlines com gancho emocional, body copy com storytelling, CTAs com urgência, e estrutura de página que guia o leitor da atenção até a compra. Inclui análise de conversão e criação de páginas comparativas.",
      meta: "Frameworks clássicos de publicidade aplicados automaticamente",
    },
  ];

  const DOCS_SKILLS = [
    {
      title: "Gerador de Documentos Profissionais",
      desc: "Cria documentos Word com formatação completa (índice, cabeçalhos, tabelas), apresentações PowerPoint com layouts profissionais, planilhas Excel com fórmulas e gráficos, e PDFs editáveis. São arquivos reais que você abre no Office ou Google Docs — não texto no terminal. Perfeito pra propostas comerciais, relatórios e apresentações.",
      meta: "Criada pela Anthropic (criadores do Claude) · 4 módulos: DOCX, PPTX, XLSX, PDF",
    },
  ];

  return (
    <>
      <div className="section-divider" />
      <section id="skills" className="py-20 sm:py-28">
        <div ref={ref} className="scroll-reveal mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-center mb-3">
            O que as 10 skills fazem por você
          </h2>
          <p className="text-center text-zinc-500 text-[15px] mb-14">
            Organizadas pelo resultado que entregam.
          </p>

          {/* BLOCO 1 — Design */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <span className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-lg">🎨</span>
              <div>
                <h3 className="font-heading text-xl font-bold text-white">Deixe Bonito</h3>
                <p className="text-zinc-500 text-sm">4 skills que transformam o visual dos seus projetos</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DESIGN_SKILLS.map((skill) => (
                <SkillCard key={skill.title} {...skill} />
              ))}
            </div>
          </div>

          {/* BLOCO 2 — Deploy */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <span className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-lg">🚀</span>
              <div>
                <h3 className="font-heading text-xl font-bold text-white">Coloque no Ar</h3>
                <p className="text-zinc-500 text-sm">2 skills que levam seu projeto do computador pro mundo</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DEPLOY_SKILLS.map((skill) => (
                <SkillCard key={skill.title} {...skill} />
              ))}
            </div>
          </div>

          {/* BLOCO 3 — Marketing */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <span className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-lg">💰</span>
              <div>
                <h3 className="font-heading text-xl font-bold text-white">Faça Vender</h3>
                <p className="text-zinc-500 text-sm">3 skills que fazem seu projeto gerar dinheiro, não só funcionar</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {MARKETING_SKILLS.map((skill) => (
                <SkillCard key={skill.title} {...skill} />
              ))}
            </div>
          </div>

          {/* BLOCO 4 — Documentos */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <span className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-lg">📄</span>
              <div>
                <h3 className="font-heading text-xl font-bold text-white">Documentos Prontos</h3>
                <p className="text-zinc-500 text-sm">1 skill (com 4 módulos) que cria documentos profissionais</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DOCS_SKILLS.map((skill) => (
                <SkillCard key={skill.title} {...skill} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function SkillCard({ title, desc, meta }: { title: string; desc: string; meta: string }) {
  return (
    <div className="glass border-green-500/10 rounded-lg p-5 card-hover">
      <h4 className="font-heading text-base font-bold text-white mb-3">{title}</h4>
      <p className="text-[13px] text-zinc-400 leading-relaxed mb-4">{desc}</p>
      <p className="font-mono text-[11px] text-green-400/60 leading-relaxed">{meta}</p>
    </div>
  );
}

/* ─── Section 6: O que vem no pack ─── */
function PackContentsSection() {
  const ref = useScrollReveal();

  const ITEMS = [
    { text: "10 skills premium curadas entre 69.000+ disponíveis — incluindo 80+ sub-skills", sub: "Skills criadas pela Anthropic, Vercel e especialistas reconhecidos" },
    { text: "Instalador Visual — um HTML que abre no navegador, sem instalar nada. Seleciona o sistema, escolhe as skills, copia os comandos e cola. Sem medo de terminal.", sub: null },
    { text: "Vídeo tutorial de instalação passo a passo mostrando a instalação completa no Windows.", sub: null },
    { text: "Guia manual completo — passo a passo individual de cada skill com comandos pra Windows e Mac, pra quem prefere ir no próprio ritmo.", sub: null },
    { text: "Descrição detalhada de cada skill — o que faz, quando usar, exemplo prático de uso e link do repositório original.", sub: null },
    { text: "Atualizações automáticas — o instalador baixa sempre a versão mais recente direto do GitHub dos criadores. Suas skills nunca ficam desatualizadas.", sub: null },
  ];

  const VALUE_TABLE = [
    { item: "Semanas de pesquisa entre 69.000+ skills", value: "Inestimável" },
    { item: "Curadoria das 10 melhores + 80 sub-skills", value: "R$200+" },
    { item: "Instalador visual que elimina fricção técnica", value: "R$50+" },
    { item: "Vídeo tutorial de instalação", value: "R$30+" },
    { item: "Guia manual completo em português", value: "R$30+" },
  ];

  return (
    <>
      <div className="section-divider" />
      <section id="kit" className="py-20 sm:py-28 bg-black/80">
        <div ref={ref} className="scroll-reveal mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-center mb-12">
            Tudo o que você recebe
          </h2>

          {/* Items */}
          <div className="space-y-5 mb-12">
            {ITEMS.map((item) => (
              <div key={item.text} className="flex items-start gap-3">
                <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-green-500/15 flex items-center justify-center">
                  <span className="text-green-400 text-xs font-bold">&#10003;</span>
                </span>
                <div>
                  <span className="text-[15px] text-zinc-300 leading-relaxed">{item.text}</span>
                  {item.sub && (
                    <span className="block text-[13px] text-zinc-500 mt-1">{item.sub}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Image placeholders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
            <div className="rounded-lg border border-green-500/10 overflow-hidden">
              <div className="aspect-[16/10] bg-[#0d0d0d] flex items-center justify-center p-4">
                <div className="text-center">
                  <p className="text-zinc-600 text-xs font-mono">[INSTALADOR VISUAL]</p>
                  <p className="text-zinc-700 text-[10px] mt-1">Screenshot do HTML</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-green-500/10 overflow-hidden">
              <div className="aspect-[16/10] bg-[#0d0d0d] flex items-center justify-center p-4">
                <div className="text-center">
                  <p className="text-zinc-600 text-xs font-mono">[VIDEO TUTORIAL]</p>
                  <p className="text-zinc-700 text-[10px] mt-1">Thumbnail do vídeo</p>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/5 my-10" />

          {/* Value table */}
          <div className="rounded-lg border border-white/10 overflow-hidden">
            <div className="divide-y divide-white/5">
              <div className="flex items-center justify-between px-5 py-3 bg-white/[0.02]">
                <span className="text-[13px] text-zinc-500 font-medium">O que levaria horas</span>
                <span className="text-[13px] text-zinc-500 font-medium">Valor real</span>
              </div>
              {VALUE_TABLE.map((row) => (
                <div key={row.item} className="flex items-center justify-between px-5 py-3">
                  <span className="text-[13px] text-zinc-400">{row.item}</span>
                  <span className="text-[13px] text-zinc-400 font-mono">{row.value}</span>
                </div>
              ))}
              <div className="flex items-center justify-between px-5 py-4 bg-green-500/5">
                <span className="text-[14px] text-white font-bold">Total real</span>
                <span className="text-[14px] text-zinc-400 font-mono font-bold">R$300+</span>
              </div>
              <div className="flex items-center justify-between px-5 py-4 bg-green-500/10">
                <span className="text-[14px] text-gradient-green font-bold">Você paga</span>
                <span className="text-[14px] text-gradient-green font-mono font-bold">R$47</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ─── Section 7: Pra quem é / não é ─── */
function ForWhoSection() {
  const ref = useScrollReveal();

  const FOR_YOU = [
    "Usa Claude Code e quer parar de ter resultados genéricos",
    "Constrói projetos (sites, apps, SaaS) e quer que pareçam profissionais",
    "Quer que seus projetos vendam — não só funcionem",
    "Valoriza tempo e prefere curadoria pronta a garimpar repositórios em inglês",
    "Sabe copiar e colar (sério, é só isso que precisa)",
  ];

  const NOT_FOR_YOU = [
    "Nunca usou Claude Code (precisa começar por ele primeiro)",
    "Quer um curso completo de programação (isso é um kit de ferramentas, não um curso)",
    "Não usa Claude Code — as skills são exclusivas pra ele, não funcionam no Cursor ou Copilot",
  ];

  return (
    <>
      <div className="section-divider" />
      <section className="py-20 sm:py-28">
        <div ref={ref} className="scroll-reveal mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-center mb-12">
            Pra quem é esse pack
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* For you */}
            <div className="glass border-green-500/10 rounded-lg p-6">
              <h3 className="font-heading text-lg font-bold text-green-400 mb-5">É pra você se:</h3>
              <div className="space-y-4">
                {FOR_YOU.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-green-500/15 flex items-center justify-center">
                      <span className="text-green-400 text-xs font-bold">&#10003;</span>
                    </span>
                    <span className="text-[13px] text-zinc-400 leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Not for you */}
            <div className="glass border-white/5 rounded-lg p-6">
              <h3 className="font-heading text-lg font-bold text-zinc-400 mb-5">NÃO é pra você se:</h3>
              <div className="space-y-4">
                {NOT_FOR_YOU.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-red-500/15 flex items-center justify-center">
                      <span className="text-red-400 text-xs font-bold">×</span>
                    </span>
                    <span className="text-[13px] text-zinc-400 leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ─── Section 8: FAQ ─── */
function FAQSection() {
  const ref = useScrollReveal();

  const FAQS = [
    {
      q: "Eu posso encontrar essas skills de graça no GitHub?",
      a: "Existem mais de 69.000 skills disponíveis, espalhadas por centenas de repositórios, todas em inglês, sem nenhuma curadoria. Você não sabe quais funcionam, quais são confiáveis, quais fazem sentido juntas, e quais são as melhores pra quem constrói projetos completos. Eu já fiz essa triagem — passei semanas testando pra você instalar em 5 minutos.",
    },
    {
      q: "Não sou técnico, vou conseguir instalar?",
      a: "O instalador visual é um arquivo HTML que abre no navegador. Você seleciona o que quer, clica em \"Copiar\", abre o terminal e cola. Tem vídeo tutorial mostrando cada passo no Windows. Se sabe copiar e colar, sabe instalar.",
    },
    {
      q: "Funciona no Mac?",
      a: "Sim. O instalador gera comandos tanto pra Windows quanto pra Mac. O guia manual também cobre os dois sistemas com comandos separados pra cada um.",
    },
    {
      q: "R$47 por arquivos de configuração?",
      a: "Você não está pagando por arquivos. Está pagando por semanas de pesquisa, testes e validação condensadas em 5 minutos de instalação. É o mesmo motivo pelo qual você compra um livro — o papel custa centavos, o conhecimento organizado é o que vale. O pack inclui skills de equipes como Anthropic (criadores do Claude) e Vercel (criadores do Next.js) que sozinhas já valem múltiplas vezes o investimento.",
    },
    {
      q: "E se as skills ficarem desatualizadas?",
      a: "O instalador não copia arquivos antigos — ele baixa diretamente do GitHub dos criadores originais toda vez que você instala. Se o autor atualiza a skill, você recebe a atualização automaticamente.",
    },
    {
      q: "Preciso pagar assinatura?",
      a: "Não. É pagamento único. Comprou, é seu pra sempre. Instale quantas vezes quiser, em quantos projetos quiser.",
    },
    {
      q: "Funciona com a extensão do Claude Code no VS Code?",
      a: "Sim. A extensão e o terminal usam a mesma pasta de skills. Instale uma vez e funciona nos dois.",
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <div className="section-divider" />
      <section id="faq" className="py-20 sm:py-28 bg-black/80">
        <div ref={ref} className="scroll-reveal mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-center mb-12">
            Perguntas frequentes
          </h2>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div
                key={faq.q}
                className="glass border-white/5 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer"
                >
                  <span className="text-[14px] text-zinc-200 font-medium pr-4">&ldquo;{faq.q}&rdquo;</span>
                  <ChevronDown className={`h-4 w-4 flex-shrink-0 text-zinc-500 transition-transform duration-300 ${openIndex === i ? "rotate-180" : ""}`} />
                </button>
                <div className={`faq-answer ${openIndex === i ? "open" : ""}`}>
                  <div>
                    <p className="px-5 pb-4 text-[13px] text-zinc-400 leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

/* ─── Section 9: Preço + CTA ─── */
function PricingSection() {
  const ref = useScrollReveal();

  return (
    <>
      <div className="section-divider" />
      <section className="py-20 sm:py-28">
        <div ref={ref} className="scroll-reveal mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-8">
            Transforme seu Claude Code{" "}
            <span className="font-punch text-gradient-green">agora</span>
          </h2>

          {/* Product image placeholder */}
          <div className="max-w-sm mx-auto rounded-lg border border-green-500/10 overflow-hidden mb-10">
            <div className="aspect-[4/3] bg-[#0d0d0d] flex items-center justify-center p-4">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                  <span className="text-green-400 text-2xl">📦</span>
                </div>
                <p className="text-zinc-600 text-xs font-mono">[PRODUTO PLACEHOLDER]</p>
                <p className="text-zinc-700 text-[10px] mt-1">Mockup 3D do pack</p>
              </div>
            </div>
          </div>

          {/* Price card */}
          <div className="glass border-green-500/20 rounded-xl p-8 sm:p-10 max-w-md mx-auto">
            <h3 className="font-heading text-xl font-bold text-white mb-3">Pack de Skills — INFUSER</h3>
            <p className="text-[14px] text-zinc-400 leading-relaxed mb-6">
              10 skills que eu uso todo dia pra criar, testar e vender projetos com Claude Code.
            </p>

            {/* Price */}
            <div className="flex items-baseline justify-center gap-3 mb-6">
              <span className="font-mono text-lg text-zinc-500 line-through">R$67</span>
              <span className="font-punch text-5xl sm:text-6xl font-extrabold text-gradient-green">R$47</span>
            </div>

            <p className="text-[13px] text-zinc-500 mb-6">
              Pagamento único · Acesso imediato · Sem assinatura
            </p>

            {/* CTA */}
            <a
              href={CHECKOUT_URL}
              className="group w-full inline-flex items-center justify-center gap-2 rounded-lg bg-green-500 px-10 py-4 text-base font-bold text-black transition-all duration-200 hover:bg-green-400 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(168,232,76,0.3)] cursor-pointer green-glow"
            >
              Quero instalar as 10 skills agora <span className="transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
            </a>

            <p className="mt-4 font-mono text-[11px] text-zinc-600">
              Acesso imediato após o pagamento. Instalação em 5 minutos.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

/* ─── Section 10: Reforço Final ─── */
function FinalSection() {
  const ref = useScrollReveal();

  return (
    <>
      <div className="section-divider" />
      <section className="py-20 sm:py-28 bg-black/80">
        <div ref={ref} className="scroll-reveal mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <div className="space-y-5 mb-10">
            <p className="text-[15px] text-zinc-400 leading-relaxed">
              Você pode continuar usando o Claude Code do jeito que usa hoje. Gerando interfaces genéricas. Testando no olho. Fazendo deploy com medo. Escrevendo copy no achismo.
            </p>
            <p className="text-[15px] text-zinc-400 leading-relaxed">
              Ou pode instalar as mesmas skills que eu uso — em 5 minutos — e ver a diferença no próximo projeto.
            </p>
            <p className="text-[15px] text-white font-semibold leading-relaxed">
              A escolha é sua. Mas o preço de <span className="text-gradient-green">R$47</span> pode não durar.
            </p>
          </div>

          <a
            href={CHECKOUT_URL}
            className="group inline-flex items-center gap-2 rounded-lg bg-green-500 px-10 py-4 text-base font-bold text-black transition-all duration-200 hover:bg-green-400 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(168,232,76,0.3)] cursor-pointer green-glow"
          >
            Quero as 10 Skills → R$47 <span className="transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
          </a>
        </div>
      </section>
    </>
  );
}

/* ─── Footer ─── */
function SKFooter() {
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
          Pack de Skills &middot; by Yan Galasso &middot; Infuser
        </p>
        <p className="font-mono text-[11px] text-zinc-600 mt-1">
          Produto digital &middot; Entrega imediata após pagamento
        </p>
      </div>
    </footer>
  );
}

/* ─── Main Export ─── */
export function KitSkills() {
  return (
    <>
      <SKNavbar />
      <main>
        <HeroSection />
        <PainSection />
        <StorySection />
        <WhatAreSkillsSection />
        <SkillsSection />
        <PackContentsSection />
        <ForWhoSection />
        <FAQSection />
        <PricingSection />
        <FinalSection />
      </main>
      <SKFooter />
    </>
  );
}
