/**
 * Converte o roteiro HTML em texto para a descrição do evento do Google Agenda.
 *
 * Por que só a zona ao vivo vai para o card do evento: o call-card completo tem
 * PREP, matriz de capacidades, objeções e checklists, e é material de leitura
 * antes da call. A descrição do evento é o que a pessoa abre no celular trinta
 * segundos antes de entrar. Enfiar o documento inteiro ali transformaria a única
 * coisa que precisa ser escaneável num paredão. O learning
 * `roteiro-call-card-1-pagina` diz exatamente isso.
 *
 * Então o card do evento recebe o andaime (`frame → diagnosis → decision →
 * door-1 → advance`, no máximo 400 palavras porque o validador já garante) mais
 * o link para o documento completo.
 *
 * Funções puras de propósito: dá para testar o corte, o escape e o limite sem
 * rede, sem Google e sem modelo.
 */

/**
 * Limite de caracteres da descrição de um evento no Google Agenda.
 *
 * Estourar devolve 400 e o roteiro não chega. Como a zona ao vivo é limitada a
 * 400 palavras pelo validador, o normal é ficar bem abaixo; a checagem existe
 * para o caso anormal não virar falha silenciosa.
 */
export const LIMITE_DESCRICAO = 8192;

const ZONA_INICIO = "<!-- CALL-ZONE:START -->";
const ZONA_FIM = "<!-- CALL-ZONE:END -->";

/**
 * Rótulo de reserva para cada etapa.
 *
 * O rótulo bom vem do próprio roteiro, no `.phase-title` do template canônico.
 * Este mapa só entra quando o título não está lá — o `data-stage` é inglês
 * porque é contrato do validador, e quem lê o card do evento é o Iago ou o
 * Pedro cinco minutos antes da call.
 */
const NOME_DA_ETAPA: Readonly<Record<string, string>> = {
  frame: "ABERTURA",
  diagnosis: "DIAGNÓSTICO",
  decision: "DECISÃO",
  "door-1": "PORTA 1",
  advance: "PRÓXIMO PASSO",
};

export interface EtapaDoAndaime {
  readonly estagio: string;
  readonly rotulo: string;
  readonly texto: string;
}

export class RoteiroSemZonaAoVivo extends Error {
  constructor() {
    super("o roteiro nao tem os marcadores CALL-ZONE");
    this.name = "RoteiroSemZonaAoVivo";
  }
}

/** Recorta o trecho entre os marcadores. Lança quando não há zona: sem ela não há andaime. */
export function extrairZonaAoVivo(html: string): string {
  const inicio = html.indexOf(ZONA_INICIO);
  const fim = html.indexOf(ZONA_FIM);
  if (inicio === -1 || fim === -1 || fim <= inicio) throw new RoteiroSemZonaAoVivo();
  return html.slice(inicio + ZONA_INICIO.length, fim);
}

/**
 * Texto visível de um trecho de HTML, com os espaços normalizados.
 *
 * Blocos e quebras viram espaço antes das tags sumirem: sem isso,
 * `<li>a</li><li>b</li>` colaria em "ab". Depois as entidades voltam a ser
 * caractere, para o escape adiante não produzir `&amp;amp;`.
 */
export function textoVisivel(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<\/(p|div|li|h[1-6]|section|tr)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<li\b[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;|&#34;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&amp;/gi, "&")
    .replace(/[ \t]+/g, " ")
    .replace(/ ?\n ?/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Escapa para valor de ATRIBUTO. Só depois de `textoVisivel`, nunca antes.
 *
 * Aspas entram aqui porque delimitam o atributo. Em conteúdo de texto elas não
 * precisam de escape — use `escaparTexto`.
 */
export function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Escapa para CONTEÚDO de texto, preservando as aspas.
 *
 * O andaime é quase todo fala literal entre aspas. Escapando-as, o card do
 * evento vira uma parede de `&quot;` — legal para o parser, ilegível para quem
 * está lendo trinta segundos antes de entrar na call.
 */
export function escaparTexto(texto: string): string {
  return texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Casa QUALQUER tag que carregue `data-stage`, não só `<section>`.
 *
 * Isto já queimou uma rodada: o comando `/call-roteiro` documenta a zona com
 * `<section data-stage="frame">`, mas o template canônico do brain emite
 * `<div class="phase" data-stage="frame">`. Um extrator amarrado em `<section>`
 * encontra zero etapas e escreve um card de evento vazio, sem erro nenhum.
 *
 * O `validate-call-card.mjs`, que é o portão, sempre casou por atributo e não
 * por tag. Este regex é o mesmo dele de propósito.
 */
const ABERTURA_DE_ETAPA = /<[^>]+\bdata-stage\s*=\s*["']([^"']+)["'][^>]*>/gi;

/** O cabeçalho do template: vira o rótulo, então sai do corpo para não duplicar. */
const CABECALHO_DA_ETAPA = /<div\s+class="phase-header"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/i;
const TITULO_DA_ETAPA = /<div\s+class="phase-title">([\s\S]*?)<\/div>/i;

/**
 * Quebra a zona ao vivo em etapas na ordem em que aparecem no documento.
 *
 * A ordem canônica não é revalidada aqui: quem faz isso é o
 * `validate-call-card.mjs`, que já rodou e é o portão. Repetir a regra em dois
 * lugares criaria duas verdades para manter.
 */
export function lerEtapas(zona: string): readonly EtapaDoAndaime[] {
  const aberturas = [...zona.matchAll(ABERTURA_DE_ETAPA)];

  return aberturas
    .map((abertura, indice) => {
      const inicioDoCorpo = (abertura.index ?? 0) + abertura[0].length;
      const fimDoCorpo = aberturas[indice + 1]?.index ?? zona.length;
      const bruto = zona.slice(inicioDoCorpo, fimDoCorpo);
      const estagio = abertura[1];

      // O título do próprio roteiro vence o mapa fixo: se o método mudar o nome
      // de uma etapa, o card do evento acompanha sem precisar de deploy aqui.
      const doTemplate = textoVisivel(bruto.match(TITULO_DA_ETAPA)?.[1] ?? "");

      return {
        estagio,
        rotulo: (doTemplate || NOME_DA_ETAPA[estagio] || estagio).toUpperCase(),
        texto: textoVisivel(bruto.replace(CABECALHO_DA_ETAPA, " ")),
      };
    })
    .filter((etapa) => etapa.texto.length > 0);
}

export interface DadosDoCartao {
  readonly html: string;
  readonly nomeDoLead: string;
  readonly empresa: string | null;
  readonly urlDoRoteiroCompleto?: string;
}

/**
 * Monta a descrição do evento.
 *
 * O Google Agenda renderiza um subconjunto de HTML na descrição. Aqui só se usa
 * `<b>`, `<br>` e `<a href>`, que é o que sobrevive no app do celular e no web.
 * Nada de `<ul>`, `<table>` ou estilo: o que não é suportado aparece como texto
 * cru no meio do roteiro.
 */
export function montarDescricao(dados: DadosDoCartao): string {
  const etapas = lerEtapas(extrairZonaAoVivo(dados.html));

  const cabecalho = dados.empresa
    ? `<b>${escaparTexto(dados.nomeDoLead)} · ${escaparTexto(dados.empresa)}</b>`
    : `<b>${escaparTexto(dados.nomeDoLead)}</b>`;

  const corpo = etapas.map(
    (etapa) =>
      `<b>${escaparTexto(etapa.rotulo)}</b><br>${escaparTexto(etapa.texto).replace(/\n/g, "<br>")}`,
  );

  const rodape = [
    "Roteiro gerado automaticamente a partir do formulário. Diagnóstico: sem oferta, sem preço.",
    dados.urlDoRoteiroCompleto
      ? `Documento completo com o PREP: <a href="${escaparHtml(dados.urlDoRoteiroCompleto)}">abrir</a>`
      : null,
  ].filter((linha): linha is string => linha !== null);

  const descricao = [cabecalho, ...corpo, rodape.join("<br>")].join("<br><br>");
  return descricao.length > LIMITE_DESCRICAO ? cortarComAviso(descricao) : descricao;
}

/**
 * Corta no limite deixando um aviso visível.
 *
 * Truncar em silêncio seria pior que estourar: quem lê acharia que o roteiro
 * termina ali e entraria na call sem o próximo passo.
 */
function cortarComAviso(descricao: string): string {
  const aviso = "<br><br><b>[roteiro cortado por tamanho, abra o documento completo]</b>";
  return `${descricao.slice(0, LIMITE_DESCRICAO - aviso.length)}${aviso}`;
}
