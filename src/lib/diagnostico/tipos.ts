/**
 * Tipos do domínio do funil de diagnóstico.
 *
 * Contratos de origem: specs/001-funil-diagnostico-captura/contracts/perguntas.md
 * e contracts/score.md. Mudar pergunta, peso ou faixa é mudança de spec.
 */

/** Os 6 critérios de entrada do ICP. Toda pergunta que pontua mapeia para um deles. */
export const CRITERIOS_ICP = [
  "operacao_existente",
  "dor_relevante",
  "informacao_disponivel",
  "patrocinador",
  "caminho_decisao",
  "disposicao_colaborar",
] as const;

export type CriterioIcp = (typeof CRITERIOS_ICP)[number];

/** Faixas de roteamento. O lead nunca vê o nome da faixa nem o score. */
export const FAIXAS = [
  "qualificado",
  "revisao",
  "nao_icp_empresa",
  "nao_icp_pessoal",
] as const;

export type Faixa = (typeof FAIXAS)[number];

export const TIPOS_PERGUNTA = [
  "texto_curto",
  "texto_longo",
  "escolha_unica",
  "multipla_escolha",
  "contato",
] as const;

export type TipoPergunta = (typeof TIPOS_PERGUNTA)[number];

/** Por qual caminho a pergunta aparece. `ambos` cobre as que vêm antes da ramificação. */
export type Trilha = "empresa" | "pessoal" | "ambos";

export interface OpcaoPergunta {
  readonly id: string;
  readonly rotulo: string;
}

export interface Pergunta {
  readonly id: string;
  readonly ordem: number;
  readonly trilha: Trilha;
  readonly tipo: TipoPergunta;
  readonly enunciado: string;
  readonly ajuda?: string;
  readonly obrigatoria: boolean;
  readonly opcoes?: readonly OpcaoPergunta[];
  /** Presente somente nas perguntas que pontuam. Ausente = identificação ou contexto. */
  readonly criterioIcp?: CriterioIcp;
}

/**
 * O que o lead respondeu. `valor` é string para resposta única e livre,
 * e lista de ids de opção para múltipla escolha.
 */
export type ValorResposta = string | readonly string[];

export type Respostas = Readonly<Record<string, ValorResposta>>;

export interface PontuacaoCriterio {
  readonly criterio: CriterioIcp;
  readonly pontos: number;
  readonly teto: number;
}

export interface Avaliacao {
  readonly score: number;
  readonly faixa: Faixa;
  /** Preenchido quando um corte duro decidiu a faixa, ignorando a soma. */
  readonly motivoCorte: string | null;
  readonly pontosPorCriterio: readonly PontuacaoCriterio[];
  readonly versaoScore: string;
}

export interface ConfigScore {
  readonly versao: string;
  readonly limiares: {
    readonly qualificadoMin: number;
    readonly revisaoMin: number;
  };
  readonly tetos: Readonly<Record<CriterioIcp, number>>;
  readonly pontos: {
    readonly frequencia: Readonly<Record<string, number>>;
    readonly descricaoLongaMinChars: number;
    readonly descricaoLongaPontos: number;
    readonly consequenciaPorQuantidade: Readonly<Record<string, number>>;
    readonly consequenciaBonus: readonly string[];
    readonly fontesDigitais: readonly string[];
    readonly fonteUnicaDigital: number;
    readonly fonteMultiplaDigital: number;
    readonly fonteApenasWhatsapp: number;
    readonly patrocinador: Readonly<Record<string, number>>;
    readonly decisao: Readonly<Record<string, number>>;
    readonly colaboracao: Readonly<Record<string, number>>;
  };
  readonly cortesDuros: {
    readonly frequenciaEliminatoria: string;
    readonly patrocinadorAusente: string;
    readonly decisaoAusente: string;
  };
}

/** O que a rota de submissão recebe. Validado no servidor antes de qualquer persistência. */
export interface LeadSubmissao {
  readonly sessaoId: string;
  readonly respostas: Respostas;
  readonly origem: string;
  readonly consentimento: boolean;
}

/** O que a rota devolve. Nunca inclui o score numérico: é informação interna. */
export interface ResultadoSubmissao {
  readonly faixa: Faixa;
  readonly nome: string;
  /** Presente somente quando a faixa é `qualificado`. */
  readonly agendamento?: {
    readonly nome: string;
    readonly email: string;
    readonly processo: string;
  };
}
