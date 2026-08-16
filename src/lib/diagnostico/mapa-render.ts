/**
 * Renderiza o mapa: JSON de achados mais template canônico vira HTML.
 *
 * Determinístico. Nenhum modelo participa daqui, e é justamente esse o ponto:
 * a identidade visual e a estrutura do documento ficam fora do alcance do
 * modelo, que só entrega conteúdo. Modelo que escreve HTML inventa markup.
 *
 * O template é a fonte única do visual e vive no brain, em
 * `_knowledge/templates/mapa-diagnostico/`. Este arquivo não conhece cor,
 * fonte nem layout: ele só preenche buracos marcados.
 */

import { achadosDoTipo } from "./mapa-tipos";
import type { Achado, Classificacao, Etapa, MapaConteudo } from "./mapa-tipos";

/**
 * Versão do template canônico usada na renderização, gravada em cada mapa.
 *
 * Mora aqui e não na rota porque route handler do Next só aceita exportar os
 * nomes que ele conhece (`GET`, `POST`, `dynamic`, `runtime`). Qualquer outro
 * export quebra o build, e o `tsc --noEmit` não pega isso: é validação dos
 * tipos que o Next gera, não do TypeScript do arquivo.
 */
export const VERSAO_TEMPLATE = "2026-08-14.1";

/** Rótulo e classe CSS de cada selo, na ordem em que o template os declara. */
const SELO: Readonly<Record<Classificacao, { classe: string; rotulo: string }>> = {
  fato: { classe: "seal-fato", rotulo: "Fato" },
  leitura: { classe: "seal-leitura", rotulo: "Leitura" },
  limite: { classe: "seal-limite", rotulo: "Limite" },
};

/**
 * Escapa o que vai para o HTML.
 *
 * Todo texto daqui vem de transcrição de terceiro passada por um modelo. Tratar
 * como confiável seria injeção esperando acontecer, mesmo que a página seja
 * privada: o autor do conteúdo é, no limite, quem falou na call.
 */
export function escaparHtml(valor: string): string {
  return valor
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Extrai o molde de um bloco marcado, sem os marcadores. */
function moldeDe(template: string, nome: string): string {
  const abre = `<!--@bloco:${nome}-->`;
  const fecha = `<!--@/bloco:${nome}-->`;
  const inicio = template.indexOf(abre);
  const fim = template.indexOf(fecha);
  if (inicio === -1 || fim === -1) {
    throw new Error(`bloco "${nome}" nao existe no template canonico`);
  }
  return template.slice(inicio + abre.length, fim);
}

/** Troca o bloco marcado inteiro pelo conteúdo renderizado. */
function substituirBloco(template: string, nome: string, conteudo: string): string {
  const abre = `<!--@bloco:${nome}-->`;
  const fecha = `<!--@/bloco:${nome}-->`;
  const inicio = template.indexOf(abre);
  const fim = template.indexOf(fecha);
  if (inicio === -1 || fim === -1) {
    throw new Error(`bloco "${nome}" nao existe no template canonico`);
  }
  return template.slice(0, inicio) + conteudo + template.slice(fim + fecha.length);
}

function preencher(molde: string, valores: Readonly<Record<string, string>>): string {
  let saida = molde;
  for (const [chave, valor] of Object.entries(valores)) {
    saida = saida.split(`{{${chave}}}`).join(valor);
  }
  return saida;
}

function renderEtapas(molde: string, etapas: readonly Etapa[]): string {
  return etapas
    .map((etapa, indice) =>
      preencher(molde, {
        ETAPA_NUMERO: String(etapa.ordem),
        // A linha de conexao some na ultima etapa, senao o traco fica solto no fim.
        ETAPA_CONECTOR:
          indice === etapas.length - 1 ? "" : '<div class="phase-connector"></div>',
        ETAPA_TITULO: escaparHtml(etapa.titulo),
        ETAPA_DESCRICAO: escaparHtml(etapa.descricao),
        ETAPA_RESPONSAVEL: escaparHtml(etapa.responsavel),
        ETAPA_FERRAMENTA: escaparHtml(etapa.ferramenta),
        ETAPA_FREQUENCIA: escaparHtml(etapa.volume),
      }),
    )
    .join("\n");
}

function renderAchados(
  molde: string,
  achados: readonly Achado[],
  campos: (a: Achado) => Readonly<Record<string, string>>,
): string {
  return achados
    .map((achado) =>
      preencher(molde, {
        SELO_CLASSE: SELO[achado.classificacao].classe,
        SELO_ROTULO: SELO[achado.classificacao].rotulo,
        ...campos(achado),
      }),
    )
    .join("\n");
}

export interface DadosRender {
  readonly conteudo: MapaConteudo;
  readonly representante: string;
  /** Data por extenso, ex "14 de agosto de 2026". Vem de fora: o render é puro. */
  readonly data: string;
  /** Data curta, ex "14.08.2026". */
  readonly dataCurta: string;
}

/**
 * Monta o documento.
 *
 * Lança se o template não tiver algum bloco esperado. Falhar alto aqui é melhor
 * que entregar documento com buraco: o erro aparece na geração, não na mão do
 * cliente.
 */
export function renderizarMapa(template: string, dados: DadosRender): string {
  const { conteudo } = dados;
  let html = template;

  html = substituirBloco(html, "etapa", renderEtapas(moldeDe(html, "etapa"), conteudo.etapas));

  html = substituirBloco(
    html,
    "atrito",
    renderAchados(moldeDe(html, "atrito"), achadosDoTipo(conteudo, "atrito"), (a) => ({
      ATRITO_TITULO: escaparHtml(a.titulo),
      ATRITO_DESCRICAO: escaparHtml(a.descricao),
    })),
  );

  html = substituirBloco(
    html,
    "encaixe",
    renderAchados(moldeDe(html, "encaixe"), achadosDoTipo(conteudo, "encaixe"), (a) => ({
      ENCAIXE_TITULO: escaparHtml(a.titulo),
      ENCAIXE_ONDE: escaparHtml(a.descricao),
      ENCAIXE_O_QUE_MUDA: escaparHtml(a.oQueMuda ?? ""),
    })),
  );

  html = substituirBloco(
    html,
    "dependencia",
    renderAchados(moldeDe(html, "dependencia"), achadosDoTipo(conteudo, "dependencia"), (a) => ({
      DEPENDENCIA_TITULO: escaparHtml(a.titulo),
      DEPENDENCIA_DESCRICAO: escaparHtml(a.descricao),
    })),
  );

  html = substituirBloco(
    html,
    "limite",
    renderAchados(moldeDe(html, "limite"), achadosDoTipo(conteudo, "limite"), (a) => ({
      LIMITE_TITULO: escaparHtml(a.titulo),
      LIMITE_MOTIVO: escaparHtml(a.descricao),
    })),
  );

  // Citacao e opcional: sem fala marcante registrada, o bloco sai inteiro em vez
  // de aparecer vazio com aspas soltas.
  const moldeCitacao = moldeDe(html, "citacao");
  html = substituirBloco(
    html,
    "citacao",
    conteudo.citacao
      ? preencher(moldeCitacao, {
          CITACAO_TEXTO: escaparHtml(conteudo.citacao.texto),
          CITACAO_AUTOR: escaparHtml(conteudo.citacao.autor),
        })
      : "",
  );

  // Lacuna e o oposto de opcional por conveniencia: quando existe, PRECISA
  // aparecer, porque declarar o que faltou e o que impede o documento de mentir.
  const moldeLacuna = moldeDe(html, "lacuna");
  html = substituirBloco(
    html,
    "lacuna",
    conteudo.lacunas
      .map((lacuna) => preencher(moldeLacuna, { LACUNA_DESCRICAO: escaparHtml(lacuna) }))
      .join("\n"),
  );

  const moldePasso = moldeDe(html, "passo");
  html = substituirBloco(
    html,
    "passo",
    conteudo.proximoPasso.passos
      .slice(0, 3)
      .map((passo, i) =>
        preencher(moldePasso, {
          PASSO_NUMERO: String(i + 1),
          PASSO_TEXTO: escaparHtml(passo),
        }),
      )
      .join("\n"),
  );

  // Os comentarios saem DEPOIS de todos os blocos, porque os marcadores
  // `@bloco:` sao comentarios e precisam existir ate aqui.
  html = limparComentarios(html);

  return preencher(html, {
    CLIENTE: escaparHtml(conteudo.cliente),
    CONTATO_CLIENTE: escaparHtml(conteudo.contato),
    PROCESSO: escaparHtml(conteudo.processo),
    SEGMENTO: escaparHtml(conteudo.segmento),
    LEAD: escaparHtml(conteudo.resumo),
    REPRESENTANTE_INFUSER: escaparHtml(dados.representante),
    DATA: escaparHtml(dados.data),
    DATA_CURTA: escaparHtml(dados.dataCurta),
    PROXIMO_PASSO_TITULO: escaparHtml(conteudo.proximoPasso.titulo),
    PROXIMO_PASSO_DESCRICAO: escaparHtml(conteudo.proximoPasso.descricao),
  });
}

/** Nenhum token pode sobrar no documento entregue. */
export function tokensNaoPreenchidos(html: string): readonly string[] {
  return [...new Set(html.match(/\{\{[A-Z_]+\}\}/g) ?? [])];
}

/**
 * Tira os comentários do documento antes de entregar.
 *
 * O template canônico é cheio de instrução interna: "REPETIR .phase por etapa",
 * as regras de conteúdo, o aviso sobre o guard. Isso é para quem mantém o
 * template, não para o cliente, e ir junto no HTML entregue seria vazar nota de
 * bastidor num documento que o lead pode abrir o código-fonte e ler.
 *
 * Só comentários HTML saem. Comentário dentro de `<style>` é CSS e fica.
 */
export function limparComentarios(html: string): string {
  const inicioStyle = html.indexOf("<style>");
  const fimStyle = html.indexOf("</style>");

  if (inicioStyle === -1 || fimStyle === -1) {
    return html.replace(/<!--[\s\S]*?-->/g, "");
  }

  const antes = html.slice(0, inicioStyle).replace(/<!--[\s\S]*?-->/g, "");
  const estilo = html.slice(inicioStyle, fimStyle);
  const depois = html.slice(fimStyle).replace(/<!--[\s\S]*?-->/g, "");

  return antes + estilo + depois;
}
