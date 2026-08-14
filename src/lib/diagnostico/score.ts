/**
 * Cálculo do score e roteamento em faixas.
 *
 * Função pura: sem I/O, sem banco, sem data. Isso é o que torna as fronteiras
 * testáveis sem subir nada. Contrato: contracts/score.md.
 *
 * O score NUNCA vai para o cliente. Ele decide a faixa, e a faixa decide o texto.
 */

import { P, RESPOSTA_USO_PESSOAL } from "./perguntas";
import type {
  Avaliacao,
  ConfigScore,
  CriterioIcp,
  Faixa,
  PontuacaoCriterio,
  Respostas,
  ValorResposta,
} from "./tipos";

const MOTIVO = {
  USO_PESSOAL: "uso_pessoal_declarado",
  SEM_RECORRENCIA: "processo_sem_recorrencia",
  SEM_DONO_SEM_DECISAO: "sem_dono_do_processo_e_sem_poder_de_decisao",
} as const;

function lerUnica(respostas: Respostas, id: string): string {
  const valor: ValorResposta | undefined = respostas[id];
  return typeof valor === "string" ? valor : "";
}

function lerMultipla(respostas: Respostas, id: string): readonly string[] {
  const valor: ValorResposta | undefined = respostas[id];
  if (Array.isArray(valor)) return valor;
  return typeof valor === "string" && valor.length > 0 ? [valor] : [];
}

function limitar(pontos: number, teto: number): number {
  return Math.min(Math.max(pontos, 0), teto);
}

/** Frequência mais o bônus de descrição detalhada. Quem descreve o processo, tem processo. */
function pontuarOperacao(respostas: Respostas, config: ConfigScore): number {
  const frequencia = lerUnica(respostas, P.FREQUENCIA);
  const base = config.pontos.frequencia[frequencia] ?? 0;

  const descricao = lerUnica(respostas, P.COMO_FUNCIONA);
  const bonus =
    descricao.trim().length >= config.pontos.descricaoLongaMinChars
      ? config.pontos.descricaoLongaPontos
      : 0;

  return limitar(base + bonus, config.tetos.operacao_existente);
}

/**
 * Consequências observáveis. `nao_acontece` é exclusivo: marcar junto com
 * outras é contradição, e a leitura conservadora é que a dor não existe.
 */
function pontuarDor(respostas: Respostas, config: ConfigScore): number {
  const marcadas = lerMultipla(respostas, P.CONSEQUENCIA);
  if (marcadas.includes("nao_acontece")) return 0;

  const quantidade = Math.min(marcadas.length, 3);
  const base = config.pontos.consequenciaPorQuantidade[String(quantidade)] ?? 0;

  const bonus = marcadas.filter((m) => config.pontos.consequenciaBonus.includes(m)).length;

  return limitar(base + bonus, config.tetos.dor_relevante);
}

/** Fonte digital é o que dá para ler. Papel e memória não são acessáveis. */
function pontuarInformacao(respostas: Respostas, config: ConfigScore): number {
  const fontes = lerMultipla(respostas, P.ONDE_INFORMACAO);
  const digitais = fontes.filter((f) => config.pontos.fontesDigitais.includes(f));

  if (digitais.length >= 2) {
    return limitar(config.pontos.fonteMultiplaDigital, config.tetos.informacao_disponivel);
  }
  if (digitais.length === 1) {
    return limitar(config.pontos.fonteUnicaDigital, config.tetos.informacao_disponivel);
  }
  if (fontes.includes("whatsapp")) {
    return limitar(config.pontos.fonteApenasWhatsapp, config.tetos.informacao_disponivel);
  }
  return 0;
}

function pontuarPorTabela(
  respostas: Respostas,
  perguntaId: string,
  tabela: Readonly<Record<string, number>>,
  teto: number,
): number {
  return limitar(tabela[lerUnica(respostas, perguntaId)] ?? 0, teto);
}

/**
 * Cortes duros. Avaliados ANTES da soma porque a decisão deles não é negociável
 * por pontuação: um lead sem processo recorrente não tem o que automatizar, e um
 * sem dono nem poder de decisão não tem como avançar por melhor que o resto pareça.
 */
function aplicarCorteDuro(respostas: Respostas, config: ConfigScore): { faixa: Faixa; motivo: string } | null {
  if (lerUnica(respostas, P.TIPO_USO) === RESPOSTA_USO_PESSOAL) {
    return { faixa: "nao_icp_pessoal", motivo: MOTIVO.USO_PESSOAL };
  }

  if (lerUnica(respostas, P.FREQUENCIA) === config.cortesDuros.frequenciaEliminatoria) {
    return { faixa: "nao_icp_empresa", motivo: MOTIVO.SEM_RECORRENCIA };
  }

  const semDono = lerUnica(respostas, P.RESPONSAVEL) === config.cortesDuros.patrocinadorAusente;
  const semDecisao = lerUnica(respostas, P.DECISAO) === config.cortesDuros.decisaoAusente;
  if (semDono && semDecisao) {
    return { faixa: "nao_icp_empresa", motivo: MOTIVO.SEM_DONO_SEM_DECISAO };
  }

  return null;
}

function faixaPorScore(score: number, config: ConfigScore): Faixa {
  if (score >= config.limiares.qualificadoMin) return "qualificado";
  if (score >= config.limiares.revisaoMin) return "revisao";
  return "nao_icp_empresa";
}

/**
 * Avalia as respostas e devolve score, faixa e o detalhe por critério.
 *
 * O detalhe por critério existe para a calibração: quando um lead qualificado se
 * revelar ruim na call, a pergunta é qual critério inflou o score, e sem o
 * detalhe só dá para ver o total.
 */
export function avaliar(respostas: Respostas, config: ConfigScore): Avaliacao {
  const porCriterio: readonly PontuacaoCriterio[] = [
    { criterio: "operacao_existente", pontos: pontuarOperacao(respostas, config), teto: config.tetos.operacao_existente },
    { criterio: "dor_relevante", pontos: pontuarDor(respostas, config), teto: config.tetos.dor_relevante },
    { criterio: "informacao_disponivel", pontos: pontuarInformacao(respostas, config), teto: config.tetos.informacao_disponivel },
    { criterio: "patrocinador", pontos: pontuarPorTabela(respostas, P.RESPONSAVEL, config.pontos.patrocinador, config.tetos.patrocinador), teto: config.tetos.patrocinador },
    { criterio: "caminho_decisao", pontos: pontuarPorTabela(respostas, P.DECISAO, config.pontos.decisao, config.tetos.caminho_decisao), teto: config.tetos.caminho_decisao },
    { criterio: "disposicao_colaborar", pontos: pontuarPorTabela(respostas, P.ACESSO, config.pontos.colaboracao, config.tetos.disposicao_colaborar), teto: config.tetos.disposicao_colaborar },
  ];

  const score = porCriterio.reduce((total, c) => total + c.pontos, 0);
  const corte = aplicarCorteDuro(respostas, config);

  return {
    score,
    faixa: corte ? corte.faixa : faixaPorScore(score, config),
    motivoCorte: corte ? corte.motivo : null,
    pontosPorCriterio: porCriterio,
    versaoScore: config.versao,
  };
}

export const MOTIVOS_CORTE = MOTIVO;

/** Máximo teórico, derivado dos tetos. Usado em teste e na calibração. */
export function scoreMaximo(config: ConfigScore): number {
  return Object.values(config.tetos).reduce((total: number, teto: number) => total + teto, 0);
}

export type { CriterioIcp };
