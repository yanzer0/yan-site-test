/**
 * Validação do JSON que o modelo devolve, antes de virar documento.
 *
 * Este arquivo é o guard entre "o modelo escreveu" e "o cliente lê". Ele não
 * conserta: ele REPROVA, e o gerador falha em voz alta. Corrigir em silêncio o
 * que o modelo errou esconde justamente o sinal de que o prompt precisa mudar.
 */

import { CLASSIFICACOES, TIPOS_ACHADO } from "./mapa-tipos";
import type { Achado, Etapa, MapaConteudo } from "./mapa-tipos";

export interface Problema {
  readonly onde: string;
  readonly porque: string;
}

export type Validacao =
  | { readonly ok: true; readonly conteudo: MapaConteudo }
  | { readonly ok: false; readonly problemas: readonly Problema[] };

/**
 * Palavras que denunciam o COMO, e que FR-008 proíbe no documento.
 *
 * A proibição vale para os ENCAIXES e o próximo passo, não para as etapas: a
 * etapa descreve a ferramenta que o cliente JÁ usa hoje, e isso é fato do
 * processo dele. O que não pode é dizer com o que NÓS construiríamos.
 */
const FERRAMENTAS_DE_SOLUCAO = [
  "n8n", "zapier", "make.com", "langchain", "webhook", "api rest",
  "openai", "gpt-4", "gpt-5", "claude", "gemini", "python", "javascript",
  "banco de dados", "postgres", "supabase", "airtable",
];

/**
 * Vocabulário que só existe em proposta. Proibido em QUALQUER achado.
 *
 * Nenhuma destas palavras descreve a operação do cliente: todas descrevem um
 * projeto sendo vendido.
 */
const MARCAS_DE_PROPOSTA = [
  "sprint", "fase 1", "fase 2", "semanas de", "dias de trabalho",
  "horas de desenvolvimento", "prazo de entrega", "cronograma", "custo estimado",
  "investimento de", "orcamento do projeto", "orçamento do projeto",
];

/**
 * Valor em dinheiro. Proibido só onde seria PRECIFICAR A SOLUÇÃO.
 *
 * A distinção custou um falso positivo real: o validador reprovou o achado
 * "um protesto de doze mil reais perdeu o prazo", que é o custo da dor do
 * cliente, dito por ele na call. Registrar esse número é exatamente o que um
 * diagnóstico honesto faz, e é o que dá dimensão ao problema.
 *
 * O que não pode é valor aparecer no encaixe ou no próximo passo, onde ele
 * viraria preço do que estamos propondo. Mesma lógica da ferramenta: a etapa
 * cita o que o cliente já usa, o encaixe não cita o que nós usaríamos.
 */
const MARCAS_DE_DINHEIRO = ["r$", "reais"];
const ONDE_DINHEIRO_E_PROPOSTA: readonly string[] = ["encaixe"];

function texto(valor: unknown): string {
  return typeof valor === "string" ? valor.trim() : "";
}

function contemAlguma(conteudo: string, termos: readonly string[]): string | null {
  const alvo = conteudo.toLowerCase();
  return termos.find((t) => alvo.includes(t)) ?? null;
}

function validarEtapa(etapa: unknown, indice: number, problemas: Problema[]): void {
  const e = etapa as Partial<Etapa>;
  const onde = `etapas[${indice}]`;

  if (!texto(e.titulo)) problemas.push({ onde, porque: "sem titulo" });
  if (!texto(e.descricao)) problemas.push({ onde, porque: "sem descricao" });
  if (typeof e.ordem !== "number") problemas.push({ onde, porque: "sem ordem numerica" });
}

/**
 * O achado cru, como ele chega do modelo.
 *
 * Deliberadamente NÃO é `Partial<Achado>`: aquele tipo já exclui `"etapa"` do
 * campo `tipo`, e o compilador então trata a checagem de "etapa" como morta. Só
 * que em runtime o JSON pode trazer qualquer string, e é exatamente esse caso
 * que precisa ser rejeitado. Validador que confia no tipo do dado que ainda
 * não validou não valida nada.
 */
type AchadoCru = Omit<Partial<Achado>, "tipo"> & { tipo?: string };

function validarAchado(achado: unknown, indice: number, problemas: Problema[]): void {
  const a = achado as AchadoCru;
  const onde = `achados[${indice}]`;

  if (!a.tipo || !(TIPOS_ACHADO as readonly string[]).includes(a.tipo)) {
    problemas.push({ onde, porque: `tipo invalido: ${String(a.tipo)}` });
    return;
  }
  if (a.tipo === "etapa") {
    problemas.push({ onde, porque: "etapa nao vai em achados, vai em etapas" });
    return;
  }
  if (!a.classificacao || !(CLASSIFICACOES as readonly string[]).includes(a.classificacao)) {
    problemas.push({ onde, porque: `classificacao invalida: ${String(a.classificacao)}` });
    return;
  }

  if (!texto(a.titulo)) problemas.push({ onde, porque: "sem titulo" });
  if (!texto(a.descricao)) problemas.push({ onde, porque: "sem descricao" });

  // FR-005: fato precisa de origem rastreavel. Sem isso nao e fato, e chute com selo.
  if (a.classificacao === "fato" && !texto(a.origem)) {
    problemas.push({
      onde,
      porque: "classificado como fato mas sem trecho de origem na transcricao",
    });
  }

  // FR-008: o COMO nao entra. Vale para encaixe, dependencia e limite.
  const corpo = `${texto(a.titulo)} ${texto(a.descricao)} ${texto(a.oQueMuda)}`;
  const ferramenta = contemAlguma(corpo, FERRAMENTAS_DE_SOLUCAO);
  if (ferramenta && a.tipo === "encaixe") {
    problemas.push({ onde, porque: `encaixe cita ferramenta de solucao: "${ferramenta}"` });
  }
  const proposta = contemAlguma(corpo, MARCAS_DE_PROPOSTA);
  if (proposta) {
    problemas.push({ onde, porque: `contem vocabulario de proposta: "${proposta}"` });
  }

  // Valor em dinheiro só é problema onde ele precificaria a solução. No atrito
  // e no limite, ele é o custo da dor que o cliente relatou, e deve ficar.
  if (ONDE_DINHEIRO_E_PROPOSTA.includes(a.tipo)) {
    const dinheiro = contemAlguma(corpo, MARCAS_DE_DINHEIRO);
    if (dinheiro) {
      problemas.push({ onde, porque: `encaixe nao pode citar valor: "${dinheiro}"` });
    }
  }

  if (a.tipo === "encaixe" && !texto(a.oQueMuda)) {
    problemas.push({ onde, porque: "encaixe sem 'o que muda'" });
  }
}

/**
 * Valida o conteúdo inteiro.
 *
 * Devolve TODOS os problemas de uma vez, não só o primeiro: quem for ajustar o
 * prompt precisa ver o conjunto, e não descobrir um erro por execução.
 */
export function validarMapa(bruto: unknown): Validacao {
  const problemas: Problema[] = [];

  if (typeof bruto !== "object" || bruto === null) {
    return { ok: false, problemas: [{ onde: "raiz", porque: "nao e um objeto" }] };
  }

  const c = bruto as Partial<MapaConteudo>;

  for (const campo of ["cliente", "contato", "processo", "resumo"] as const) {
    if (!texto(c[campo])) problemas.push({ onde: campo, porque: "vazio ou ausente" });
  }

  if (!Array.isArray(c.etapas) || c.etapas.length === 0) {
    problemas.push({ onde: "etapas", porque: "o processo precisa de ao menos uma etapa" });
  } else {
    c.etapas.forEach((e, i) => validarEtapa(e, i, problemas));
  }

  if (!Array.isArray(c.achados)) {
    problemas.push({ onde: "achados", porque: "ausente" });
  } else {
    c.achados.forEach((a, i) => validarAchado(a, i, problemas));

    const porTipo = (tipo: string) =>
      (c.achados ?? []).filter((a) => (a as Achado).tipo === tipo).length;

    if (porTipo("atrito") === 0) {
      problemas.push({ onde: "achados", porque: "nenhum ponto de atrito" });
    }
    if (porTipo("encaixe") === 0) {
      problemas.push({ onde: "achados", porque: "nenhum ponto de encaixe" });
    }
    // FR-009 e a spec: secao de limites vazia nao significa que o caso nao tem
    // limite, significa que o diagnostico foi raso.
    if (porTipo("limite") === 0) {
      problemas.push({
        onde: "achados",
        porque: "nenhum limite. Secao obrigatoria: vazia = diagnostico raso, nao caso sem limite",
      });
    }
  }

  if (!c.proximoPasso || !texto(c.proximoPasso.titulo) || !texto(c.proximoPasso.descricao)) {
    problemas.push({ onde: "proximoPasso", porque: "incompleto" });
  }

  if (!Array.isArray(c.lacunas)) {
    problemas.push({ onde: "lacunas", porque: "ausente. Use [] quando nao houver lacuna" });
  }

  // FR-014: em-dash em qualquer texto do documento e violacao de marca.
  const tudo = JSON.stringify(bruto);
  if (tudo.includes("—") || tudo.includes("–")) {
    problemas.push({ onde: "conteudo", porque: "contem em-dash ou en-dash" });
  }

  if (problemas.length > 0) return { ok: false, problemas };
  return { ok: true, conteudo: bruto as MapaConteudo };
}

export const TERMOS_PROIBIDOS = {
  ferramentas: FERRAMENTAS_DE_SOLUCAO,
  proposta: MARCAS_DE_PROPOSTA,
  dinheiro: MARCAS_DE_DINHEIRO,
} as const;
