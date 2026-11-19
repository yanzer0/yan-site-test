import Image from "next/image";
import Link from "next/link";
import { Inter, Onest, Geist_Mono } from "next/font/google";
import { DottedSurface } from "@/components/ui/dotted-surface-lazy";
import { CATALOGO_CENTRAL } from "@/lib/guias/catalogo";

const display = Inter({ variable: "--hv-display", subsets: ["latin"], weight: ["500", "600", "700", "800"] });
const body = Onest({ variable: "--hv-body", subsets: ["latin"], weight: ["400", "500", "600"] });
const mono = Geist_Mono({ variable: "--hv-mono", subsets: ["latin"], weight: ["400", "500"] });

// Teal 500 (#2FA084) normalizado; os pontos distantes somem no Paper (#EEF4EF).
const DOT_TEAL = [0.184, 0.627, 0.518] as const;
const FOG_PAPER = 0xeef4ef;

interface Produto {
  readonly id: string;
  readonly href: string;
  readonly capa: string;
  readonly etiqueta: string;
  readonly titulo: string;
  readonly descricao: string;
  readonly preco: string;
  readonly condicao?: string;
  readonly extra?: string;
  readonly acao: string;
}

// Precos e descricoes conferidos nas paginas de cada produto em 19/11/2026.
const PRODUTOS: readonly Produto[] = [
  {
    id: "kit-segundo-cerebro",
    href: "/kit-segundo-cerebro",
    capa: "/capa-segundo-cerebro.webp",
    etiqueta: "Kit · Claude Code + Obsidian",
    titulo: "Kit Segundo Cérebro",
    descricao:
      "Pare de repetir contexto toda vez que abre o Claude Code. Ele passa a lembrar seus projetos, decisões e preferências de uma sessão para a outra.",
    preco: "R$ 67",
    condicao: "pagamento único",
    extra: "Tem a versão Premium, com instalação guiada.",
    acao: "Conhecer o kit",
  },
  {
    id: "legiao",
    href: "/legiao",
    capa: "/legiao/predio-torre.webp",
    etiqueta: "Agentes · Claude ou Codex",
    titulo: "A Legião",
    descricao:
      "80 especialistas de copy, tráfego, vendas e oferta, com o método de quem é referência, trabalhando dentro do seu Claude ou do Codex.",
    preco: "R$ 97",
    condicao: "pagamento único",
    acao: "Conhecer a Legião",
  },
  {
    id: "estudio",
    href: "/estudio",
    capa: "/estudio/ui-agentes.webp",
    etiqueta: "Agentes de vídeo · Windows",
    titulo: "Estúdio de CrIAção",
    descricao:
      "Você grava, pede em português e o vídeo volta editado. 12 agentes de criação e edição de vídeo no Claude Code ou no Codex.",
    preco: "R$ 67",
    condicao: "pagamento único",
    acao: "Conhecer o Estúdio",
  },
  {
    id: "kit-skills",
    href: "/kit-skills",
    capa: "/capa-kit-skills.webp",
    etiqueta: "Kit · Claude Code",
    titulo: "Kit de Skills",
    descricao:
      "As 10 skills que uso todo dia para transformar o Claude Code num time: designer, copywriter, auditor de SEO, testador e mais.",
    preco: "R$ 29,90",
    acao: "Conhecer o kit",
  },
  {
    id: "kit-jarvis",
    href: "/kit-jarvis",
    capa: "/capa-jarvis.webp",
    etiqueta: "Kit · Automação no computador",
    titulo: "JARVIS Kit",
    descricao:
      "Duas palmas e tudo liga sozinho: música, apps e rotinas por palma ou comando de voz. Instala em 5 minutos, sem programar.",
    preco: "R$ 19,90",
    acao: "Conhecer o JARVIS",
  },
];

const AMOSTRA_CENTRAL = ["mapeamento-processos", "agentes", "skills", "kit-vscode"];

const FRENTES = [
  {
    publico: "Para empresas",
    texto:
      "Mapeamos a operação com você, montamos o segundo cérebro da empresa e automatizamos os processos que travam o time.",
    href: "#diagnostico",
    acao: "Como funciona",
  },
  {
    publico: "Para quem já usa IA",
    texto:
      "Kits e agentes prontos para instalar: memória entre sessões, especialistas de marketing e vendas, edição de vídeo.",
    href: "#produtos",
    acao: "Ver os produtos",
  },
  {
    publico: "Para quem está começando",
    texto:
      "Guias passo a passo e pacotes para baixar na Central, do primeiro prompt ao primeiro agente rodando.",
    href: "#central",
    acao: "Abrir a Central",
  },
] as const;

function Seta() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CartaoProduto({ produto, destaque }: { produto: Produto; destaque: boolean }) {
  return (
    <Link href={produto.href} className={`hv-prod${destaque ? " hv-prod--wide" : ""}`}>
      <div className="hv-prod-capa">
        <Image
          src={produto.capa}
          alt=""
          fill
          sizes={destaque ? "(max-width: 860px) 100vw, 560px" : "(max-width: 860px) 100vw, 360px"}
          quality={80}
        />
      </div>
      <div className="hv-prod-corpo">
        <span className="hv-mono hv-prod-tag">{produto.etiqueta}</span>
        <h3>{produto.titulo}</h3>
        <p>{produto.descricao}</p>
        {produto.extra ? <p className="hv-prod-extra">{produto.extra}</p> : null}
        <div className="hv-prod-pe">
          <span className="hv-preco">
            {produto.preco}
            {produto.condicao ? <small>{produto.condicao}</small> : null}
          </span>
          <span className="hv-prod-acao">
            {produto.acao} <Seta />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function HomeV2() {
  const gratuitos = CATALOGO_CENTRAL.filter((item) => item.estado === "Gratuito");
  const amostra = AMOSTRA_CENTRAL.flatMap((slug) => gratuitos.filter((item) => item.slug === slug));

  return (
    <div className={`hv ${display.variable} ${body.variable} ${mono.variable}`}>
      <div className="hv-field" aria-hidden="true">
        <DottedSurface dotColor={DOT_TEAL} fogColor={FOG_PAPER} dotOpacity={0.75} />
      </div>

      <header className="hv-nav">
        <div className="hv-wrap hv-nav-in">
          <Link href="/" className="hv-brand" aria-label="Infuser, início">
            <Image src="/guias/logo.svg" alt="Infuser" width={138} height={34} priority />
          </Link>
          <nav aria-label="Seções" className="hv-nav-links">
            <a href="#produtos">Produtos</a>
            <a href="#central">Central gratuita</a>
            <a href="#diagnostico">Para empresas</a>
          </nav>
          <Link href="/diagnostico" className="hv-btn hv-btn--ink hv-nav-cta">
            Fazer o diagnóstico
          </Link>
        </div>
      </header>

      <main>
        <section className="hv-hero">
          <div className="hv-wrap hv-hero-in">
            <p className="hv-mono hv-tag">
              <span className="hv-dot" /> IA aplicada à rotina e à operação
            </p>
            <h1>
              A gente coloca a IA para trabalhar <em>de verdade</em> no seu dia a dia.
            </h1>
            <p className="hv-sub">
              A Infuser monta segundos cérebros, agentes e automações para empresas. Os sistemas que usamos aqui dentro
              viram kits prontos para você instalar.
            </p>
            <div className="hv-ctas">
              <a href="#produtos" className="hv-btn hv-btn--lime">
                Ver os produtos <Seta />
              </a>
              <Link href="/diagnostico" className="hv-btn hv-btn--ghost">
                Quero isso na minha empresa
              </Link>
            </div>
            <p className="hv-free">
              Ou comece de graça: <Link href="/central">{gratuitos.length} materiais abertos na Central</Link>
            </p>
          </div>
        </section>

        <section className="hv-band" aria-labelledby="frentes-titulo">
          <div className="hv-wrap">
            <div className="hv-head">
              <span className="hv-mono hv-k">O que a gente faz</span>
              <h2 id="frentes-titulo">Três jeitos de trabalhar com a Infuser.</h2>
            </div>
            <div className="hv-frentes">
              {FRENTES.map((frente) => (
                <a key={frente.publico} href={frente.href} className="hv-frente">
                  <span className="hv-mono hv-k">{frente.publico}</span>
                  <p>{frente.texto}</p>
                  <span className="hv-link">
                    {frente.acao} <Seta />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="hv-band" id="produtos" aria-labelledby="produtos-titulo">
          <div className="hv-wrap">
            <div className="hv-head">
              <span className="hv-mono hv-k">Produtos</span>
              <h2 id="produtos-titulo">Tudo o que está à venda hoje.</h2>
              <p>Cada um tem uma página com o que vem, como instala e as perguntas mais comuns.</p>
            </div>
            <div className="hv-bento">
              {PRODUTOS.map((produto, i) => (
                <CartaoProduto key={produto.id} produto={produto} destaque={i === 0} />
              ))}
            </div>
          </div>
        </section>

        <section className="hv-band" id="central" aria-labelledby="central-titulo">
          <div className="hv-wrap">
            <div className="hv-central">
              <div className="hv-central-txt">
                <span className="hv-mono hv-k">Central Infuser · gratuito</span>
                <h2 id="central-titulo">
                  {gratuitos.length} guias e pacotes para aprender e <em>colocar em prática</em>.
                </h2>
                <p>
                  Prompts, skills, agentes e processos explicados passo a passo. Você preenche um cadastro rápido, sem
                  senha, e abre tudo.
                </p>
                <Link href="/central" className="hv-btn hv-btn--lime">
                  Abrir a Central <Seta />
                </Link>
              </div>
              <ul className="hv-central-lista">
                {amostra.map((item) => (
                  <li key={item.slug}>
                    <Link href={item.caminho ?? "/central"}>
                      <span className="hv-mono">{item.tipo}</span>
                      <strong>{item.titulo}</strong>
                      <Seta />
                    </Link>
                  </li>
                ))}
                <li className="hv-central-mais">
                  <Link href="/central">
                    <span className="hv-mono">E mais</span>
                    <strong>Ver todos os {gratuitos.length} materiais</strong>
                    <Seta />
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="hv-band" id="diagnostico" aria-labelledby="diag-titulo">
          <div className="hv-wrap">
            <div className="hv-diag">
              <div className="hv-diag-txt">
                <span className="hv-mono hv-k hv-k--lime">Serviço sob medida para empresas</span>
                <h2 id="diag-titulo">Quer isso rodando na sua empresa?</h2>
                <p>
                  Uma hora para mapear onde a IA encaixa de verdade na sua operação. Depois disso a gente monta o
                  segundo cérebro da empresa e as automações junto com o seu time.
                </p>
                <Link href="/diagnostico" className="hv-btn hv-btn--lime">
                  Fazer o diagnóstico <Seta />
                </Link>
              </div>
              <ol className="hv-passos">
                <li>
                  <span className="hv-n">1</span>
                  <div>
                    <strong>Responda 16 perguntas</strong>
                    <p>Leva uns 3 minutos e fala da sua operação, não de tecnologia.</p>
                  </div>
                </li>
                <li>
                  <span className="hv-n">2</span>
                  <div>
                    <strong>Escolha o horário</strong>
                    <p>Se fizer sentido pros dois lados, a agenda abre ali mesmo no final.</p>
                  </div>
                </li>
                <li>
                  <span className="hv-n">3</span>
                  <div>
                    <strong>Uma hora de diagnóstico</strong>
                    <p>Com o time da Infuser, para ver onde IA e automação entram primeiro.</p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </section>
      </main>

      <footer className="hv-foot">
        <div className="hv-wrap hv-foot-in">
          <Image src="/guias/logo.svg" alt="Infuser" width={110} height={27} />
          <nav aria-label="Rodapé">
            <Link href="/privacidade">Privacidade</Link>
            <Link href="/termos">Termos</Link>
            <a href="mailto:contato@useinfuser.com">contato@useinfuser.com</a>
          </nav>
          <span className="hv-mono">© 2026 Infuser</span>
        </div>
      </footer>
    </div>
  );
}
