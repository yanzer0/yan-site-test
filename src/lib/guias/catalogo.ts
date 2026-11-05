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
  { slug: "reforma-tributaria", titulo: "Reforma tributária: sua operação está preparada?", descricao: "Entenda a transição e confira 24 perguntas sobre contabilidade, cadastros, sistemas, financeiro e processos da empresa.", categoria: "Operação e processos", arquivo: "guia-reforma-tributaria.html", caminho: "/reforma-tributaria", aliases: [] },
  { slug: "mapeamento-processos", titulo: "Encontre o que automatizar na sua empresa", descricao: "Um passo a passo para mapear processos e escolher onde a IA pode ajudar primeiro.", categoria: "Operação e processos", arquivo: "guia-mapeamento-processos.html", caminho: "/guia-mapeamento-processos", aliases: [] },
  { slug: "agentes", titulo: "Coloque agentes de IA para trabalhar", descricao: "Entenda o papel dos agentes e como começar a usá-los na sua rotina.", categoria: "Claude e agentes", arquivo: "guia-agentes.html", caminho: "/guia-agentes", aliases: [] },
  { slug: "skills", titulo: "Crie skills que carregam o seu jeito de fazer", descricao: "Extraia o critério de quem faz e transforme esse conhecimento em uma skill para o Claude.", categoria: "Claude e agentes", arquivo: "guia-skill.html", caminho: "/guia-skill", aliases: [] },
  { slug: "agente-que-aprende", titulo: "Dê memória ao seu agente de código", descricao: "Conheça o pacote e as etapas para o agente preservar o que aprendeu com você.", categoria: "Claude e agentes", arquivo: "agente-que-aprende.html", caminho: "/agente-que-aprende", aliases: [] },
  { slug: "maestri", titulo: "Claude e Codex juntos no Maestri", descricao: "Configure o ambiente e acompanhe os dois agentes trabalhando no mesmo projeto.", categoria: "Claude e agentes", arquivo: "tutorial-maestri.html", caminho: "/tutorial-maestri", aliases: [] },
  { slug: "clickup", titulo: "A IA implementa. O ClickUp mostra onde está", descricao: "Organize uma implementação com tarefas, critérios de aceite e acompanhamento no ClickUp.", categoria: "Operação e processos", arquivo: "guia-clickup.html", caminho: "/guia-clickup", aliases: [] },
  { slug: "videos-motion", titulo: "Uma semana de vídeos em motion com o Claude", descricao: "Do roteiro à produção: monte uma sequência de vídeos em motion para o seu conteúdo.", categoria: "Conteúdo e criação", arquivo: "guia-videos-motion.html", caminho: "/guia-videos-motion", aliases: ["/guiamotion"] },
  { slug: "editar-videos", titulo: "Você grava uma vez. A IA edita o resto", descricao: "Grave falando para a câmera num take só e explique para a IA o que deve aparecer em cada frase.", categoria: "Conteúdo e criação", arquivo: "guia-editar-videos.html", caminho: "/guia-editar-videos", aliases: ["/editar"] },
  { slug: "prompts-motion", titulo: "Mais de 50 prompts para vídeos em motion", descricao: "Pedidos para adaptar ao seu tema e explorar formatos de vídeo com o Claude.", categoria: "Conteúdo e criação", arquivo: "guia-prompts-motion.html", caminho: "/promptsmotion", aliases: [] },
  { slug: "carrossel-animado", titulo: "Carrosséis animados com o Claude", descricao: "Siga o processo para transformar o conteúdo de um carrossel em uma peça animada.", categoria: "Conteúdo e criação", arquivo: "guia-carrossel-animado.html", caminho: "/guiacarrossel", aliases: [] },
  { slug: "comandos-imagem", titulo: "10 comandos para transformar as suas fotos", descricao: "Crie peças visuais com o ChatGPT preservando o que importa na foto original.", categoria: "ChatGPT", arquivo: "guia-comandos-gpt.html", caminho: "/guia-comandos-gpt", aliases: [] },
  { slug: "99-comandos", titulo: "99 comandos para testar no ChatGPT", descricao: "Pedidos prontos para copiar, adaptar e experimentar em diferentes tarefas.", categoria: "ChatGPT", arquivo: "guia-99-comandos.html", caminho: "/guia-99-comandos", aliases: ["/99comandos"] },
  { slug: "gpt6-astra", titulo: "Como usar o GPT-6 Astra", descricao: "Explore os recursos e as formas de pedir do guia dedicado ao GPT-6 Astra.", categoria: "ChatGPT", arquivo: "guia-gpt6-astra.html", caminho: "/guia-gpt6-astra", aliases: [] },
  { slug: "estudar-livros", titulo: "Estude qualquer livro com o ChatGPT", descricao: "Tire uma foto da capa e transforme o livro em mapa mental, sketchnote ou história em quadrinhos.", categoria: "ChatGPT", arquivo: "guia-estudos.html", caminho: "/guia-estudos", aliases: [] },
  { slug: "fotos-profissionais", titulo: "12 prompts de foto profissional no ChatGPT", descricao: "Pedidos prontos para deixar a foto do celular com cara de fotógrafo profissional, mantendo o seu rosto.", categoria: "ChatGPT", arquivo: "guia-fotos.html", caminho: "/guia-fotos", aliases: [] },
  { slug: "videos-gemini", titulo: "4 prompts de vídeo no Gemini", descricao: "Prompts completos de unboxing, zoom de satélite, comercial de produto e revelação de logo, com o que trocar em cada um.", categoria: "Conteúdo e criação", arquivo: "guia-videos-gemini.html", caminho: "/guia-videos-gemini", aliases: [] },
  { slug: "clonar-sites", titulo: "Clone o design de qualquer site com o Claude", descricao: "Tire um print de um site que você gosta e monte uma página igual na estrutura, com o seu conteúdo, a sua cor e o seu texto.", categoria: "Claude e agentes", arquivo: "guia-clonar-sites.html", caminho: "/guia-clonar-sites", aliases: [] },
  { slug: "ia-sem-bajulacao", titulo: "Faça a IA parar de concordar com tudo", descricao: "Ajuste as instruções para receber uma análise mais crítica das suas ideias.", categoria: "Claude e agentes", arquivo: "guia-ia-sem-bajulacao.html", caminho: "/guia-ia-sem-bajulacao", aliases: [] },
  { slug: "protocolo-autoria", titulo: "Use IA sem perder a prova da sua autoria", descricao: "Um protocolo para consultar, estruturar e documentar a participação da IA no seu texto.", categoria: "Conteúdo e criação", arquivo: "protocolo-de-autoria.html", caminho: "/protocolo-de-autoria", aliases: [] },
  { slug: "opus55", titulo: "Como usar o Claude Opus 5.5", descricao: "O guia de uso do Opus 5.5, com orientações e exemplos para aplicar nas suas tarefas.", categoria: "Claude e agentes", arquivo: "opus55.html", caminho: "/opus55", aliases: [] },
  { slug: "opus5", titulo: "Explore o potencial do Claude Opus 5", descricao: "Consulte o material dedicado ao Opus 5 e às formas de trabalhar com o modelo.", categoria: "Claude e agentes", arquivo: "opus5.html", caminho: "/opus5", aliases: [] },
  { slug: "skill-creator", titulo: "Dia 01: skill-creator", descricao: "A skill que cria todas as outras. Comandos conferidos no repositório, pedidos prontos e cuidados.", categoria: "30 skills do Claude", arquivo: "guia-skill-creator.html", caminho: "/guia-skill-creator", aliases: [] },
  { slug: "humanizer", titulo: "Dia 02: humanizer", descricao: "Tira o cheiro de IA do seu texto. Comandos conferidos no repositório, pedidos prontos e cuidados.", categoria: "30 skills do Claude", arquivo: "guia-humanizer.html", caminho: "/guia-humanizer", aliases: [] },
  { slug: "taste-skill", titulo: "Dia 03: taste-skill", descricao: "Design com gosto, não com cara de IA. Comandos conferidos no repositório, pedidos prontos e cuidados.", categoria: "30 skills do Claude", arquivo: "guia-taste-skill.html", caminho: "/guia-taste-skill", aliases: [] },
  { slug: "i-have-adhd", titulo: "Dia 04: i-have-adhd", descricao: "Resposta com a ação primeiro. Comandos conferidos no repositório, pedidos prontos e cuidados.", categoria: "30 skills do Claude", arquivo: "guia-i-have-adhd.html", caminho: "/guia-i-have-adhd", aliases: [] },
  { slug: "ponytail", titulo: "Dia 05: ponytail", descricao: "Só o código que precisa existir. Comandos conferidos no repositório, pedidos prontos e cuidados.", categoria: "30 skills do Claude", arquivo: "guia-ponytail.html", caminho: "/guia-ponytail", aliases: [] },
  { slug: "caveman", titulo: "Dia 06: caveman", descricao: "Menos palavra, menos token. Comandos conferidos no repositório, pedidos prontos e cuidados.", categoria: "30 skills do Claude", arquivo: "guia-caveman.html", caminho: "/guia-caveman", aliases: [] },
  { slug: "planning-with-files", titulo: "Dia 07: planning-with-files", descricao: "Plano e progresso que sobrevivem ao /clear. Comandos conferidos no repositório, pedidos prontos e cuidados.", categoria: "30 skills do Claude", arquivo: "guia-planning-with-files.html", caminho: "/guia-planning-with-files", aliases: [] },
  { slug: "frontend-design", titulo: "Dia 08: frontend-design", descricao: "A skill oficial de design da Anthropic. Comandos conferidos no repositório, pedidos prontos e cuidados.", categoria: "30 skills do Claude", arquivo: "guia-frontend-design.html", caminho: "/guia-frontend-design", aliases: [] },
  { slug: "ui-ux-pro-max", titulo: "Dia 09: ui-ux-pro-max", descricao: "Um design system inteiro a partir de uma frase. Comandos conferidos no repositório, pedidos prontos e cuidados.", categoria: "30 skills do Claude", arquivo: "guia-ui-ux-pro-max.html", caminho: "/guia-ui-ux-pro-max", aliases: [] },
  { slug: "impeccable", titulo: "Dia 10: impeccable", descricao: "Polish, bolder, critique: design no comando. Comandos conferidos no repositório, pedidos prontos e cuidados.", categoria: "30 skills do Claude", arquivo: "guia-impeccable.html", caminho: "/guia-impeccable", aliases: [] },
  { slug: "huashu-design", titulo: "Dia 11: huashu-design", descricao: "Protótipo, deck e infográfico com 92 estilos. Comandos conferidos no repositório, pedidos prontos e cuidados.", categoria: "30 skills do Claude", arquivo: "guia-huashu-design.html", caminho: "/guia-huashu-design", aliases: [] },
  { slug: "archify", titulo: "Dia 12: archify", descricao: "Sua ideia vira diagrama interativo. Comandos conferidos no repositório, pedidos prontos e cuidados.", categoria: "30 skills do Claude", arquivo: "guia-archify.html", caminho: "/guia-archify", aliases: [] },
  { slug: "excalidraw-diagram", titulo: "Dia 13: excalidraw-diagram", descricao: "Quadro branco a partir de texto. Comandos conferidos no repositório, pedidos prontos e cuidados.", categoria: "30 skills do Claude", arquivo: "guia-excalidraw-diagram.html", caminho: "/guia-excalidraw-diagram", aliases: [] },
  { slug: "remotion-skills", titulo: "Dia 14: remotion skills", descricao: "O Claude faz vídeo com código. Comandos conferidos no repositório, pedidos prontos e cuidados.", categoria: "30 skills do Claude", arquivo: "guia-remotion-skills.html", caminho: "/guia-remotion-skills", aliases: [] },
  { slug: "n8n-skills", titulo: "Dia 15: n8n-skills", descricao: "O Claude monta seu workflow no n8n. Comandos conferidos no repositório, pedidos prontos e cuidados.", categoria: "30 skills do Claude", arquivo: "guia-n8n-skills.html", caminho: "/guia-n8n-skills", aliases: [] },
  { slug: "playwright-skill", titulo: "Dia 16: playwright-skill", descricao: "O Claude usa o navegador por você. Comandos conferidos no repositório, pedidos prontos e cuidados.", categoria: "30 skills do Claude", arquivo: "guia-playwright-skill.html", caminho: "/guia-playwright-skill", aliases: [] },
  { slug: "skill-mcp-builder", titulo: "Dia 17: mcp-builder", descricao: "Liga o Claude em qualquer sistema. Comandos conferidos no repositório, pedidos prontos e cuidados.", categoria: "30 skills do Claude", arquivo: "guia-mcp-builder.html", caminho: "/guia-mcp-builder", aliases: [] },
  { slug: "document-skills", titulo: "Dia 18: document-skills", descricao: "Excel, Word, PowerPoint e PDF de verdade. Comandos conferidos no repositório, pedidos prontos e cuidados.", categoria: "30 skills do Claude", arquivo: "guia-document-skills.html", caminho: "/guia-document-skills", aliases: [] },
  { slug: "obsidian-skills", titulo: "Dia 19: obsidian-skills", descricao: "O Claude mexe no seu Obsidian. Comandos conferidos no repositório, pedidos prontos e cuidados.", categoria: "30 skills do Claude", arquivo: "guia-obsidian-skills.html", caminho: "/guia-obsidian-skills", aliases: [] },
  { slug: "last30days", titulo: "Dia 20: last30days", descricao: "O que está bombando nos últimos 30 dias. Comandos conferidos no repositório, pedidos prontos e cuidados.", categoria: "30 skills do Claude", arquivo: "guia-last30days.html", caminho: "/guia-last30days", aliases: [] },
  { slug: "superpowers", titulo: "Dia 21: superpowers", descricao: "Método, não improviso. Comandos conferidos no repositório, pedidos prontos e cuidados.", categoria: "30 skills do Claude", arquivo: "guia-superpowers.html", caminho: "/guia-superpowers", aliases: [] },
  { slug: "marketingskills", titulo: "Dia 22: marketingskills", descricao: "53 skills de marketing num lugar só. Comandos conferidos no repositório, pedidos prontos e cuidados.", categoria: "30 skills do Claude", arquivo: "guia-marketingskills.html", caminho: "/guia-marketingskills", aliases: [] },
  { slug: "claude-seo", titulo: "Dia 23: claude-seo", descricao: "Auditoria de SEO completa. Comandos conferidos no repositório, pedidos prontos e cuidados.", categoria: "30 skills do Claude", arquivo: "guia-claude-seo.html", caminho: "/guia-claude-seo", aliases: [] },
  { slug: "claude-ads", titulo: "Dia 24: claude-ads", descricao: "Audita suas contas de anúncio. Comandos conferidos no repositório, pedidos prontos e cuidados.", categoria: "30 skills do Claude", arquivo: "guia-claude-ads.html", caminho: "/guia-claude-ads", aliases: [] },
  { slug: "grill-me", titulo: "Dia 25: grill-me", descricao: "O Claude te interroga antes de construir. Comandos conferidos no repositório, pedidos prontos e cuidados.", categoria: "30 skills do Claude", arquivo: "guia-grill-me.html", caminho: "/guia-grill-me", aliases: [] },
  { slug: "agent-skills", titulo: "Dia 26: agent-skills", descricao: "/spec, /plan, /build, /test, /ship. Comandos conferidos no repositório, pedidos prontos e cuidados.", categoria: "30 skills do Claude", arquivo: "guia-agent-skills.html", caminho: "/guia-agent-skills", aliases: [] },
  { slug: "vercel-agent-skills", titulo: "Dia 27: vercel agent-skills", descricao: "Qualidade de produção em React e Next. Comandos conferidos no repositório, pedidos prontos e cuidados.", categoria: "30 skills do Claude", arquivo: "guia-vercel-agent-skills.html", caminho: "/guia-vercel-agent-skills", aliases: [] },
  { slug: "brand-guidelines", titulo: "Dia 28: brand-guidelines", descricao: "Tudo sai na marca do cliente. Comandos conferidos no repositório, pedidos prontos e cuidados.", categoria: "30 skills do Claude", arquivo: "guia-brand-guidelines.html", caminho: "/guia-brand-guidelines", aliases: [] },
  { slug: "reel-dinamico", titulo: "Dia 29: reel-dinamico, a skill que edita estes Reels", descricao: "As skills que eu mesmo construí. Comandos conferidos no repositório, pedidos prontos e cuidados.", categoria: "30 skills do Claude", arquivo: "guia-reel-dinamico.html", caminho: "/guia-reel-dinamico", aliases: [] },
  { slug: "stack-skills-claude", titulo: "Dia 30: as 5 skills do Claude que eu manteria", descricao: "O fecho da série: as cinco skills que eu abro toda semana, com o link do guia e o comando de cada uma.", categoria: "30 skills do Claude", arquivo: "guia-stack-skills-claude.html", caminho: "/guia-stack-skills-claude", aliases: [] },
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
  { slug: "reel-dinamico", titulo: "reel-dinamico: a skill que edita Reels", descricao: "A skill que edita os vídeos da série 30 skills do Claude: tela dividida, legenda palavra a palavra e efeito sonoro real.", tipo: "Skill", arquivo: "reel-dinamico.zip", requisitos: ["Claude Code, Python 3 e ffmpeg com os filtros zscale e tonemap.", "GPU NVIDIA para a transcrição com faster-whisper.", "real-sfx e earshot para os efeitos sonoros, instalados à parte (veja references/setup.md)."], instrucoes: ["Extraia a pasta reel-dinamico dentro de .claude/skills, no usuário ou no projeto.", "Leia o SKILL.md e o references/setup.md antes do primeiro vídeo.", "Comece pelo projeto de exemplo em exemplos/dia-01 e troque o caminho do vídeo pelo seu."] },
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
