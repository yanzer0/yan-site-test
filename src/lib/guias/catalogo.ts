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
  if (slug === "" || slug === undefined || slug === null) return "/central";
  return typeof slug === "string" ? alvoDeAcesso(slug)?.caminho : undefined;
}

export interface RecursoCentral {
  readonly slug: string;
  readonly titulo: string;
  readonly descricao: string;
  readonly tipo: "Agente" | "Kit" | "Skill";
  readonly arquivo: string;
  readonly requisitos: readonly string[];
  readonly instrucoes: readonly string[];
}
export const RECURSOS_CENTRAL: readonly RecursoCentral[] = [
  { slug: "pacote-agente-que-aprende", titulo: "Agente que Aprende: pacote para instalar", descricao: "Instalador, agente e harness para levar o método do guia ao seu projeto.", tipo: "Agente", arquivo: "agente-que-aprende.zip", requisitos: ["Node.js 18 ou superior instalado no computador.", "Um projeto local e um assistente de código compatível com as instruções do pacote."], instrucoes: ["Extraia o ZIP em uma pasta do seu computador.", "Abra o LEIA-ME.md da pasta agente-que-aprende e siga a instalação indicada.", "O pacote inclui os testes do ciclo. Confira as orientações antes de usar em um projeto real."] },
  { slug: "orquestra-claude-codex", titulo: "Orquestra Claude + Codex", descricao: "Pacote com instalador e skills para organizar o trabalho dos dois agentes em um projeto.", tipo: "Kit", arquivo: "orquestra-claude-codex.zip", requisitos: ["Node.js 18 ou superior, Claude Code e Codex instalados e configurados.", "Um projeto local no qual você possa instalar as skills do pacote."], instrucoes: ["Extraia o arquivo orquestra-claude-codex.zip.", "Leia o LEIA-ME.md e execute a instalação conforme o seu projeto.", "Siga o método e os comandos documentados no próprio pacote."] },
  { slug: "video-transcricao-gpu", titulo: "Vídeo: transcrição GPU e frames", descricao: "Skill para transcrever áudio e vídeo localmente e extrair frames com timestamps.", tipo: "Skill", arquivo: "video-transcricao-gpu.zip", requisitos: ["Windows, Python e ffmpeg para os scripts e a verificação do ambiente.", "GPU NVIDIA com CUDA e faster-whisper configurados para transcrição.", "A extração de frames com ffmpeg funciona sem GPU."], instrucoes: ["Extraia a pasta video-transcricao-gpu e abra o INSTALAR.md.", "Copie a pasta inteira para o diretório de skills do Codex ou do Claude Code, conforme as instruções.", "Antes de transcrever, rode a verificação check-gpu-transcription.ps1 indicada no pacote. Os modelos e dependências não estão incluídos no ZIP."] },
];
export interface ItemCentral {
  readonly slug: string;
  readonly titulo: string;
  readonly descricao: string;
  readonly categoria: string;
  readonly tipo: "Guia" | "Agente" | "Skill" | "Kit" | "SaaS";
  readonly estado: "Gratuito" | "Premium" | "Em breve";
  readonly grupo: "guias" | "recursos" | "premium" | "em-breve";
  readonly caminho?: string;
  readonly acao?: string;
  readonly relacao?: string;
}
export const KIT_VSCODE: ItemCentral & { caminho: string } = { slug: "kit-vscode", titulo: "Kit Prático Claude Code no VS Code", descricao: "Guia gratuito de instalação, funcionalidades, atalhos e referência para usar o Claude Code no VS Code.", tipo: "Kit", estado: "Gratuito", grupo: "guias", categoria: "Claude e agentes", caminho: "/kit-vscode", acao: "Abrir kit gratuito" };
export const CATALOGO_CENTRAL: readonly ItemCentral[] = [
  ...GUIAS.map((guia): ItemCentral => ({ ...guia, tipo: "Guia", estado: "Gratuito", grupo: "guias", caminho: `/guias/${guia.slug}`, acao: "Abrir guia" })),
  KIT_VSCODE,
  ...RECURSOS_CENTRAL.map((recurso): ItemCentral => ({ ...recurso, categoria: "Pacote para baixar", estado: "Gratuito", grupo: "recursos", caminho: `/central/recursos/${recurso.slug}`, acao: "Ver pacote" })),
  { slug: "legiao", titulo: "A Legião", descricao: "Especialistas de marketing e vendas para trabalhar com você no Claude.", categoria: "Produto Infuser", tipo: "Agente", estado: "Premium", grupo: "premium", caminho: "/legiao", acao: "Conhecer produto" },
  { slug: "kit-segundo-cerebro", titulo: "Kit Segundo Cérebro", descricao: "Organize contexto, conhecimento e decisões para trabalhar com IA no seu ambiente.", categoria: "Produto Infuser", tipo: "Kit", estado: "Premium", grupo: "premium", caminho: "/kit-segundo-cerebro", acao: "Conhecer produto" },
  { slug: "kit-skills", titulo: "Kit de Skills", descricao: "Skills prontas para estruturar tarefas e especialidades no Claude.", categoria: "Produto Infuser", tipo: "Kit", estado: "Premium", grupo: "premium", caminho: "/kit-skills", acao: "Conhecer produto" },
  { slug: "kit-jarvis", titulo: "Jarvis Kit", descricao: "Automações de computador por palmas e comandos de voz.", categoria: "Produto Infuser", tipo: "Kit", estado: "Premium", grupo: "premium", caminho: "/kit-jarvis", acao: "Conhecer produto" },
  { slug: "estudio-criacao", titulo: "Estúdio de CrIAção", descricao: "Seis agentes de vídeo em um estúdio de criação para Windows.", categoria: "Produto Infuser", tipo: "Agente", estado: "Premium", grupo: "premium", caminho: "https://pay.hotmart.com/A108157970A", acao: "Comprar Estúdio" },
  { slug: "segundo-cerebro-premium", titulo: "Segundo Cérebro Premium", descricao: "Instalação guiada e mecanismos de validação para o projeto, em um upgrade do Kit Segundo Cérebro.", categoria: "Produto Infuser", tipo: "Kit", estado: "Premium", grupo: "premium", caminho: "/kit-segundo-cerebro", acao: "Conhecer o Kit base", relacao: "Upgrade do Kit base" },
  { slug: "pergaminho", titulo: "O Pergaminho", descricao: "Sequência de prompts para pesquisar e validar uma oportunidade, vendida como complemento opcional da oferta do Kit.", categoria: "Produto Infuser", tipo: "Kit", estado: "Premium", grupo: "premium", caminho: "https://pay.hotmart.com/O108099140A?off=bmb50jm3&checkoutMode=10", acao: "Ver oferta com complementos", relacao: "Complemento opcional do Kit" },
  { slug: "painel-os", titulo: "Painel OS", descricao: "O SaaS da Infuser para reunir o cérebro da empresa, agentes e operação em um painel.", categoria: "SaaS da Infuser", tipo: "SaaS", estado: "Em breve", grupo: "em-breve" },
];
export function recursoPorSlug(slug: string): RecursoCentral | undefined { return RECURSOS_CENTRAL.find((recurso) => recurso.slug === slug); }
export function alvoDeAcesso(slug: string | null | undefined): { slug: string; titulo: string; caminho: string } | undefined {
  const guia = guiaPorSlug(slug); if (guia) return guia;
  if (slug === KIT_VSCODE.slug) return KIT_VSCODE;
  const recurso = RECURSOS_CENTRAL.find((item) => item.slug === slug);
  return recurso ? { ...recurso, caminho: `/central/recursos/${recurso.slug}` } : undefined;
}
export function alvoPorCaminho(caminho: string): { slug: string; titulo: string; caminho: string } | undefined {
  const guia = guiaPorCaminho(caminho); if (guia) return guia;
  let limpo: string; try { limpo = decodeURIComponent(caminho).replace(/\/$/, ""); } catch { return undefined; }
  if (limpo === KIT_VSCODE.caminho) return KIT_VSCODE;
  const recurso = RECURSOS_CENTRAL.find((item) => [`/central/recursos/${item.slug}`, `/central/baixar/${item.slug}`].includes(limpo));
  return recurso ? alvoDeAcesso(recurso.slug) : undefined;
}
