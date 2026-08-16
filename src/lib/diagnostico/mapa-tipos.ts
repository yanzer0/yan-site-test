/**
 * Tipos do mapa de diagnóstico.
 *
 * O modelo produz `MapaConteudo` como JSON. Ele NUNCA produz HTML: o
 * renderizador é determinístico e é ele que conhece o template canônico.
 * Isso mantém a identidade visual fora do alcance do modelo.
 */

/** As cinco naturezas de achado que o mapa carrega. */
export const TIPOS_ACHADO = ["etapa", "atrito", "encaixe", "dependencia", "limite"] as const;
export type TipoAchado = (typeof TIPOS_ACHADO)[number];

/**
 * A separação que sustenta o documento inteiro (FR-006).
 *
 * `fato` é o que o cliente disse. `leitura` é inferência da Infuser. `limite`
 * é avaliação nossa sobre o que não dá para automatizar. Nunca misturar num
 * mesmo bloco: é o que permite o cliente saber o que confirmar e o que corrigir.
 */
export const CLASSIFICACOES = ["fato", "leitura", "limite"] as const;
export type Classificacao = (typeof CLASSIFICACOES)[number];

export const ESTADOS_MAPA = ["gerado", "aprovado", "entregue"] as const;
export type EstadoMapa = (typeof ESTADOS_MAPA)[number];

/** Uma etapa do processo, na seção 01. */
export interface Etapa {
  readonly ordem: number;
  readonly titulo: string;
  readonly descricao: string;
  readonly responsavel: string;
  readonly ferramenta: string;
  readonly volume: string;
}

/** Um achado das seções 02 a 05. */
export interface Achado {
  readonly tipo: Exclude<TipoAchado, "etapa">;
  readonly classificacao: Classificacao;
  readonly titulo: string;
  /** No encaixe, é o "onde entra". Nos outros, é a descrição. */
  readonly descricao: string;
  /** Só no encaixe: o que muda quando aquilo é atacado. */
  readonly oQueMuda?: string;
  /**
   * Trecho da transcrição que sustenta o achado.
   * Obrigatório quando a classificação é `fato`: é o que torna FR-005 verificável.
   */
  readonly origem?: string;
}

export interface Citacao {
  readonly texto: string;
  readonly autor: string;
}

export interface MapaConteudo {
  readonly cliente: string;
  readonly contato: string;
  readonly processo: string;
  readonly segmento: string;
  /** Uma ou duas linhas de abertura, com a dor central nas palavras do cliente. */
  readonly resumo: string;
  readonly etapas: readonly Etapa[];
  readonly citacao: Citacao | null;
  readonly achados: readonly Achado[];
  /** Preenchido quando a call não deu base para alguma seção (FR-010). */
  readonly lacunas: readonly string[];
  readonly proximoPasso: {
    readonly titulo: string;
    readonly descricao: string;
    readonly passos: readonly string[];
  };
}

export interface Mapa {
  readonly id: string;
  readonly leadId: string;
  readonly token: string;
  readonly estado: EstadoMapa;
  readonly conteudo: MapaConteudo;
  readonly html: string;
  readonly aprovadoPor: string | null;
  readonly aprovadoEm: Date | null;
  readonly houveCorrecao: boolean;
  readonly aberturas: number;
}

export function achadosDoTipo(
  conteudo: MapaConteudo,
  tipo: Achado["tipo"],
): readonly Achado[] {
  return conteudo.achados.filter((a) => a.tipo === tipo);
}
