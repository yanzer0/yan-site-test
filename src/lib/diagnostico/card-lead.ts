/**
 * Monta o card do cliente no brain a partir das respostas do formulário.
 *
 * É a parte determinística da feature 003: transposição de campo para campo,
 * sem modelo no meio. Por isso mora aqui como função pura e é testável sem
 * disco, sem rede e sem `claude -p`.
 *
 * O contrato do frontmatter é `scripts/lib/schema-clientes.js` no brain. Os
 * enums abaixo são cópia dele, e a cópia é intencionalmente pequena e comentada:
 * este repositório não importa código do brain, e um card fora do enum é
 * bloqueado pelo checker do brain na hora do commit, que é onde a divergência
 * apareceria alto e claro.
 *
 * 🔴 FR-007: o que o lead escreveu vai literal. Nada de reescrever a fala dele
 * para "ficar melhor" — o texto cru é o insumo do PREP e da Call 1.
 */

/** Estágio de entrada do funil. Call marcada é exatamente onde este lead está. */
export const STATUS_ENTRADA = "call-marcada";

/**
 * Onde a resposta do formulário não decide o campo, o card entra com o valor
 * honesto de "ainda não sei", e não com um chute que parece informação.
 */
const SEGMENTO_PADRAO = "outro";
const MODELO_PADRAO = "indefinido";

/** `origem` do formulário → enum de origem do schema do brain. */
const ORIGEM_DO_BRAIN: Readonly<Record<string, string>> = {
  instagram: "instagram",
  indicacao: "indicacao",
  youtube: "instagram", // O enum não tem youtube. Conteúdo próprio cai em instagram.
  linkedin: "networking",
  google: "inbound",
  outro: "outro",
};

/** Rótulos de porte, para o card ler como frase e não como identificador. */
const PORTE_LEGIVEL: Readonly<Record<string, string>> = {
  so_eu: "só o dono",
  "2_5": "2 a 5 pessoas",
  "6_20": "6 a 20 pessoas",
  "21_50": "21 a 50 pessoas",
  "50_mais": "mais de 50 pessoas",
};

export interface RespostaLegivel {
  readonly perguntaId: string;
  readonly enunciado: string;
  /** Já resolvido para rótulo quando a pergunta é de escolha. Múltipla vem unida por vírgula. */
  readonly resposta: string;
}

export interface DadosDoCard {
  readonly nome: string;
  readonly empresa: string | null;
  readonly papel: string | null;
  readonly porte: string | null;
  readonly email: string;
  readonly whatsapp: string | null;
  readonly origem: string;
  /** Quem indicou, quando a origem é indicação. Opcional: card antigo não tem e continua válido. */
  readonly indicadoPor?: string | null;
  readonly score: number;
  readonly faixa: string;
  readonly inicioDaCall: Date;
  readonly respostas: readonly RespostaLegivel[];
  /** `2026-08-17`. Recebido de fora para a função não depender do relógio. */
  readonly hoje: string;
}

/**
 * Slug da pasta do cliente.
 *
 * Não resolve colisão: quem faz isso é quem grava, que é o único que sabe o que
 * já existe no disco. Aqui só se produz a forma canônica.
 */
export function slugDaEmpresa(nome: string): string {
  // O range vai escapado: combining diacritics literais no fonte são
  // invisíveis no editor e somem em qualquer reencode do arquivo.
  const semAcento = nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const limpo = semAcento
    .toLowerCase()
    .replace(/\b(ltda|me|epp|eireli|s\/?a|sa)\b/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/, "");
  return limpo || "lead-sem-empresa";
}

/**
 * O fuso da operação. Toda data que uma pessoa lê no card é renderizada aqui.
 *
 * 🔴 27/08/2026 — antes disto o código usava `getDate()`/`getHours()`, que é a
 * hora DO PROCESSO. O card é montado na rota, e função da Vercel roda em UTC:
 * a call do Bruno (Grupo Makron), marcada para 12:00 de São Paulo, virou
 * "Call 1 às 15:00" no card e no roteiro. Três horas de erro em todo card
 * gerado, no campo que decide quando alguém entra na chamada.
 *
 * Os testes não pegaram porque construíam a data com `new Date(2026, 7, 5, 9, 5)`,
 * que é hora local: o valor voltava pelo mesmo fuso em que entrou e o teste
 * passava em qualquer máquina. Instante só se testa em UTC.
 */
const FUSO = "America/Sao_Paulo";

/** Os campos de data/hora daquele instante, já no fuso da operação. */
function partesEmSaoPaulo(quando: Date): Record<string, string> {
  const partes = new Intl.DateTimeFormat("pt-BR", {
    timeZone: FUSO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(quando);

  return Object.fromEntries(partes.map(({ type, value }) => [type, value]));
}

/** `2026-08-17`. No fuso de SP: um agendamento das 21h aqui não é do dia seguinte. */
export function dataIso(quando: Date): string {
  const { year, month, day } = partesEmSaoPaulo(quando);
  return `${year}-${month}-${day}`;
}

/** `17/08 às 14:30`, como uma pessoa lê, no fuso de SP. */
export function quandoLegivel(quando: Date): string {
  const { day, month, hour, minute } = partesEmSaoPaulo(quando);
  return `${day}/${month} às ${hour}:${minute}`;
}

/**
 * Escapa um valor de frontmatter YAML.
 *
 * O lead escreve o nome da empresa, e nome de empresa tem dois-pontos, aspas e
 * `#`. Sem aspas o YAML quebra e o card fica ilegível para o harness inteiro.
 * Aspas simples com o escape do YAML (`''`) é a forma que não interpreta nada
 * dentro, que é o que se quer para texto de terceiro.
 */
export function valorYaml(bruto: string): string {
  return `'${bruto.replace(/'/g, "''")}'`;
}

/**
 * O markdown completo do card.
 *
 * A seção `## Pendências` sai no formato de checkbox do harness, com owner e
 * prazo, porque é assim que a pendência aparece no painel. Título acionável e
 * não-técnico antes do `::`, detalhe depois.
 */
export function montarCard(dados: DadosDoCard): string {
  const empresa = dados.empresa?.trim() || `${dados.nome} (empresa não informada)`;
  const origem = ORIGEM_DO_BRAIN[dados.origem] ?? "outro";
  const dataDaCall = dataIso(dados.inicioDaCall);
  const porte = dados.porte ? (PORTE_LEGIVEL[dados.porte] ?? dados.porte) : "não informado";
  // Só vale acompanhado da origem: nome solto sem "indicacao" seria dado inventado.
  const indicadoPor = origem === "indicacao" ? dados.indicadoPor?.trim() || null : null;

  const frontmatter = [
    "---",
    `status: ${STATUS_ENTRADA}`,
    `modelo: ${MODELO_PADRAO}`,
    `empresa: ${valorYaml(empresa)}`,
    `segmento: ${SEGMENTO_PADRAO}`,
    "prioridade: media",
    "responsavel: Yan",
    `origem: ${origem}`,
    ...(indicadoPor ? [`indicado_por: ${valorYaml(indicadoPor)}`] : []),
    `proximo_passo: ${valorYaml(`Conduzir a Call 1 de diagnóstico em ${quandoLegivel(dados.inicioDaCall)}, seguindo o roteiro gerado.`)}`,
    `data_proximo_passo: ${dataDaCall}`,
    `contato: ${valorYaml(dados.nome)}`,
    ...(dados.papel ? [`contato_cargo: ${valorYaml(dados.papel)}`] : []),
    `email: ${valorYaml(dados.email)}`,
    ...(dados.whatsapp ? [`whatsapp: ${valorYaml(dados.whatsapp)}`] : []),
    `created: ${dados.hoje}`,
    `updated: ${dados.hoje}`,
    "tags: [lead, funil-diagnostico]",
    "---",
  ].join("\n");

  const corpo = [
    "",
    `# ${empresa}`,
    "",
    `> Lead que preencheu o formulário de diagnóstico e marcou a Call 1 sozinho.`,
    `> Card criado pela rotina do funil, não à mão. Score ${dados.score}, faixa \`${dados.faixa}\`.`,
    "",
    "## Dados",
    "",
    "| | |",
    "|---|---|",
    `| Contato | ${dados.nome}${dados.papel ? ` (${dados.papel})` : ""} |`,
    `| E-mail | ${dados.email} |`,
    ...(dados.whatsapp ? [`| WhatsApp | ${dados.whatsapp} |`] : []),
    `| Porte | ${porte} |`,
    `| Origem | ${dados.origem} |`,
    ...(indicadoPor ? [`| Indicado por | ${indicadoPor} |`] : []),
    `| Call 1 | ${quandoLegivel(dados.inicioDaCall)} |`,
    "",
    "## O que ele respondeu no formulário",
    "",
    "> 🔴 Texto literal do lead, não editar. É o insumo do PREP e do mapa da Call 1.",
    "",
    ...dados.respostas.flatMap((r) => [`**${r.enunciado}**`, "", r.resposta, ""]),
    "## Pendências",
    "",
    `- [ ] (owner:Yan) (prio:alta) (prazo:${dataDaCall}) Conduzir a Call 1 de diagnóstico com ${dados.nome} :: Roteiro em modo andaime na descrição do evento da agenda INFUSER e no HTML desta pasta. Call 1 é diagnóstico: sem oferta, sem preço.`,
    `- [ ] (owner:Yan) Registrar o que a call revelou e decidir se vai para proposta :: Depois da call, atualizar o Histórico separando fato de hipótese e mover o \`status\` se os critérios da etapa forem atingidos.`,
    "",
    "## Histórico",
    "",
    `- **${dados.hoje}** — Preencheu o formulário de diagnóstico e agendou a Call 1 para ${quandoLegivel(dados.inicioDaCall)}.`,
    "",
  ].join("\n");

  return `${frontmatter}${corpo}`;
}
