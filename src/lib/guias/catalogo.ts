export interface Guia {
  readonly slug: string;
  readonly titulo: string;
  readonly descricao: string;
  readonly categoria: string;
  readonly arquivo: string;
  readonly caminho: string;
  readonly aliases: readonly string[];
}

export const GUIAS: readonly Guia[] = [
  { slug: "mapeamento-processos", titulo: "Encontre o que automatizar na sua empresa", descricao: "Um passo a passo para mapear processos e escolher onde a IA pode ajudar primeiro.", categoria: "Operação e processos", arquivo: "guia-mapeamento-processos.html", caminho: "/guia-mapeamento-processos", aliases: [] },
  { slug: "agentes", titulo: "Coloque agentes de IA para trabalhar", descricao: "Entenda o papel dos agentes e como começar a usá-los na sua rotina.", categoria: "Claude e agentes", arquivo: "guia-agentes.html", caminho: "/guia-agentes", aliases: [] },
  { slug: "skills", titulo: "Crie skills que carregam o seu jeito de fazer", descricao: "Extraia o critério de quem faz e transforme esse conhecimento em uma skill para o Claude.", categoria: "Claude e agentes", arquivo: "guia-skill.html", caminho: "/guia-skill", aliases: [] },
  { slug: "agente-que-aprende", titulo: "Dê memória ao seu agente de código", descricao: "Conheça o pacote e as etapas para o agente preservar o que aprendeu com você.", categoria: "Claude e agentes", arquivo: "agente-que-aprende.html", caminho: "/agente-que-aprende", aliases: [] },
  { slug: "maestri", titulo: "Claude e Codex juntos no Maestri", descricao: "Configure o ambiente e acompanhe os dois agentes trabalhando no mesmo projeto.", categoria: "Claude e agentes", arquivo: "tutorial-maestri.html", caminho: "/tutorial-maestri", aliases: [] },
  { slug: "clickup", titulo: "A IA implementa. O ClickUp mostra onde está", descricao: "Organize uma implementação com tarefas, critérios de aceite e acompanhamento no ClickUp.", categoria: "Operação e processos", arquivo: "guia-clickup.html", caminho: "/guia-clickup", aliases: [] },
  { slug: "videos-motion", titulo: "Uma semana de vídeos em motion com o Claude", descricao: "Do roteiro à produção: monte uma sequência de vídeos em motion para o seu conteúdo.", categoria: "Conteúdo e criação", arquivo: "guia-videos-motion.html", caminho: "/guia-videos-motion", aliases: ["/guiamotion"] },
  { slug: "prompts-motion", titulo: "Mais de 50 prompts para vídeos em motion", descricao: "Pedidos para adaptar ao seu tema e explorar formatos de vídeo com o Claude.", categoria: "Conteúdo e criação", arquivo: "guia-prompts-motion.html", caminho: "/promptsmotion", aliases: [] },
  { slug: "carrossel-animado", titulo: "Carrosséis animados com o Claude", descricao: "Siga o processo para transformar o conteúdo de um carrossel em uma peça animada.", categoria: "Conteúdo e criação", arquivo: "guia-carrossel-animado.html", caminho: "/guiacarrossel", aliases: [] },
  { slug: "comandos-imagem", titulo: "10 comandos para transformar as suas fotos", descricao: "Crie peças visuais com o ChatGPT preservando o que importa na foto original.", categoria: "ChatGPT", arquivo: "guia-comandos-gpt.html", caminho: "/guia-comandos-gpt", aliases: [] },
  { slug: "99-comandos", titulo: "99 comandos para testar no ChatGPT", descricao: "Pedidos prontos para copiar, adaptar e experimentar em diferentes tarefas.", categoria: "ChatGPT", arquivo: "guia-99-comandos.html", caminho: "/guia-99-comandos", aliases: ["/99comandos"] },
  { slug: "gpt6-astra", titulo: "Como usar o GPT-6 Astra", descricao: "Explore os recursos e as formas de pedir do guia dedicado ao GPT-6 Astra.", categoria: "ChatGPT", arquivo: "guia-gpt6-astra.html", caminho: "/guia-gpt6-astra", aliases: [] },
  { slug: "ia-sem-bajulacao", titulo: "Faça a IA parar de concordar com tudo", descricao: "Ajuste as instruções para receber uma análise mais crítica das suas ideias.", categoria: "Claude e agentes", arquivo: "guia-ia-sem-bajulacao.html", caminho: "/guia-ia-sem-bajulacao", aliases: [] },
  { slug: "protocolo-autoria", titulo: "Use IA sem perder a prova da sua autoria", descricao: "Um protocolo para consultar, estruturar e documentar a participação da IA no seu texto.", categoria: "Conteúdo e criação", arquivo: "protocolo-de-autoria.html", caminho: "/protocolo-de-autoria", aliases: [] },
  { slug: "opus55", titulo: "Como usar o Claude Opus 5.5", descricao: "O guia de uso do Opus 5.5, com orientações e exemplos para aplicar nas suas tarefas.", categoria: "Claude e agentes", arquivo: "opus55.html", caminho: "/opus55", aliases: [] },
  { slug: "opus5", titulo: "Explore o potencial do Claude Opus 5", descricao: "Consulte o material dedicado ao Opus 5 e às formas de trabalhar com o modelo.", categoria: "Claude e agentes", arquivo: "opus5.html", caminho: "/opus5", aliases: [] },
];

export function guiaPorSlug(slug: string | null | undefined): Guia | undefined {
  return GUIAS.find((guia) => guia.slug === slug);
}

export function guiaPorCaminho(caminho: string): Guia | undefined {
  let limpo: string;
  try { limpo = decodeURIComponent(caminho).replace(/\/$/, ""); } catch { return undefined; }
  return GUIAS.find((guia) => [guia.caminho, ...guia.aliases, `/${guia.arquivo}`, `/guias/${guia.slug}`].includes(limpo));
}

export function destinoDoGuia(slug: unknown): string | undefined {
  if (slug === "" || slug === undefined || slug === null) return "/guias";
  return typeof slug === "string" ? guiaPorSlug(slug)?.caminho : undefined;
}
