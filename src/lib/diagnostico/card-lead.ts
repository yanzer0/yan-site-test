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

/** `2026-08-17`. Data local, não UTC: um agendamento das 21h em SP não é do dia seguinte. */
export function dataIso(quando: Date): string {
  const mes = String(quando.getMonth() + 1).padStart(2, "0");
  const dia = String(quando.getDate()).padStart(2, "0");
  return `${quando.getFullYear()}-${mes}-${dia}`;
}

/** `17/08 às 14:30`, como uma pessoa lê. */
export function quandoLegivel(quando: Date): string {
  const dia = String(quando.getDate()).padStart(2, "0");
  const mes = String(quando.getMonth() + 1).padStart(2, "0");
  const hora = String(quando.getHours()).padStart(2, "0");
  const minuto = String(quando.getMinutes()).padStart(2, "0");
  return `${dia}/${mes} às ${hora}:${minuto}`;
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

  const frontmatter = [
    "---",
    `status: ${STATUS_ENTRADA}`,
    `modelo: ${MODELO_PADRAO}`,
    `empresa: ${valorYaml(empresa)}`,
    `segmento: ${SEGMENTO_PADRAO}`,
    "prioridade: media",
    "responsavel: Yan",
    `origem: ${origem}`,
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
