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
  OfertaAlternativa,
  PontuacaoCriterio,
  Respostas,
  ValorResposta,
} from "./tipos";

const MOTIVO = {
  USO_PESSOAL: "uso_pessoal_declarado",
  SEM_RECORRENCIA: "processo_sem_recorrencia",
  SEM_DONO_SEM_DECISAO: "sem_dono_do_processo_e_sem_poder_de_decisao",
  SEM_TEMPO: "sem_tempo_para_a_call",
  SEM_INVESTIMENTO: "investimento_minimo_nao_cabe",
  SEM_TEMPO_E_SEM_INVESTIMENTO: "sem_tempo_e_investimento_nao_cabe",
} as const;

/**
 * Motivos de corte que tornam a call PAGA incoerente como alternativa.
 *
 * Quem declarou não ter uma hora não passa a ter uma hora porque ela custa
 * R$ 197. Oferecer reunião paga a quem acabou de dizer que não consegue reunir
 * é vender o obstáculo de volta, e o destino honesto é o produto que ele usa
 * sozinho, no tempo dele.
 */
const MOTIVOS_SEM_CALL: readonly string[] = [
  MOTIVO.SEM_TEMPO,
  MOTIVO.SEM_TEMPO_E_SEM_INVESTIMENTO,
];

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

  // Os gates de compromisso vêm ANTES dos cortes de ICP porque respondem uma
  // pergunta diferente: os de ICP dizem que não há o que diagnosticar, estes
  // dizem que a pessoa não vai à call. E é o motivo que escolhe a alternativa,
  // então quem falha nos dois precisa sair pelo motivo que fecha mais portas.
  //
  // Reprovam por LISTA DE PERMISSÃO, e não pela resposta que elimina: a rota de
  // submissão é pública, e um POST que simplesmente omite o campo passaria por
  // um teste de igualdade. Gate que se atravessa apagando o campo não é gate.
  const semTempo = !config.cortesDuros.tempoAceito.includes(lerUnica(respostas, P.TEMPO_CALL));
  const semInvestimento = !config.cortesDuros.investimentoAceito.includes(
    lerUnica(respostas, P.INVESTIMENTO),
  );

  if (semTempo && semInvestimento) {
    return { faixa: "nao_icp_empresa", motivo: MOTIVO.SEM_TEMPO_E_SEM_INVESTIMENTO };
  }
  if (semTempo) {
    return { faixa: "nao_icp_empresa", motivo: MOTIVO.SEM_TEMPO };
  }
  if (semInvestimento) {
    return { faixa: "nao_icp_empresa", motivo: MOTIVO.SEM_INVESTIMENTO };
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

/**
 * A alternativa que o lead não qualificado recebe.
 *
 * Função pura sobre a avaliação, e não sobre a faixa: a faixa `nao_icp_empresa`
 * cobre saídas de naturezas diferentes, e é o motivo que separa quem ainda pode
 * comprar uma call de quem não pode comprar call nenhuma.
 *
 * Quem falhou SÓ o gate de dinheiro continua na call paga de propósito:
 * R$ 197 não é R$ 3.000, e o Mapa é entregável fechado que não depende de ele
 * sustentar o projeto inteiro.
 */
export function ofertaAlternativa(avaliacao: Avaliacao): OfertaAlternativa {
  if (avaliacao.faixa === "nao_icp_pessoal") return "kit";
  if (avaliacao.motivoCorte !== null && MOTIVOS_SEM_CALL.includes(avaliacao.motivoCorte)) {
    return "kit";
  }
  return "call_paga";
}

/** Máximo teórico, derivado dos tetos. Usado em teste e na calibração. */
export function scoreMaximo(config: ConfigScore): number {
  return Object.values(config.tetos).reduce((total: number, teto: number) => total + teto, 0);
}

export type { CriterioIcp };
