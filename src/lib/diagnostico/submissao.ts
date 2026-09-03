/**
 * Validação e extração da submissão do formulário.
 *
 * Separado da rota de propósito: aqui é lógica pura e testável, a rota fica só
 * com o transporte HTTP. Toda entrada externa é validada aqui, antes de
 * encostar no banco.
 */

import { P, RESPOSTA_USO_PESSOAL, perguntaPorId } from "./perguntas";
import { pareceEmail, pareceWhatsapp } from "./normalizar";
import type { DadosLead } from "./db";
import type { Respostas, ValorResposta } from "./tipos";

export const MAX_TEXTO_CURTO = 200;
export const MAX_TEXTO_LONGO = 5000;

export type ResultadoValidacao =
  | { readonly ok: true; readonly dados: DadosLead; readonly respostas: Respostas }
  | { readonly ok: false; readonly erro: string };

function texto(valor: ValorResposta | undefined): string {
  return typeof valor === "string" ? valor.trim() : "";
}

/**
 * Aceita apenas perguntas conhecidas e opções declaradas.
 *
 * Isso é o que impede alguém de postar `{"pergunta_inventada": "..."}` ou uma
 * opção que não existe para inflar o score: o que não está no contrato é
 * descartado em silêncio, e o que é opção precisa constar da lista.
 */
export function sanitizarRespostas(bruto: unknown): Respostas {
  if (typeof bruto !== "object" || bruto === null) return {};

  const limpo: Record<string, ValorResposta> = {};

  for (const [id, valor] of Object.entries(bruto as Record<string, unknown>)) {
    const pergunta = perguntaPorId(id);
    if (!pergunta) continue;

    const idsValidos = pergunta.opcoes?.map((o) => o.id);

    if (Array.isArray(valor)) {
      const opcoes = valor
        .filter((v): v is string => typeof v === "string")
        .filter((v) => (idsValidos ? idsValidos.includes(v) : true))
        .slice(0, 20);
      if (opcoes.length > 0) limpo[id] = opcoes;
      continue;
    }

    if (typeof valor !== "string") continue;

    const limite = pergunta.tipo === "texto_longo" ? MAX_TEXTO_LONGO : MAX_TEXTO_CURTO;
    const cortado = valor.trim().slice(0, limite);
    if (cortado.length === 0) continue;
    if (idsValidos && !idsValidos.includes(cortado)) continue;

    limpo[id] = cortado;
  }

  return limpo;
}

/**
 * Valida a submissão inteira e extrai os dados de contato.
 *
 * O consentimento é checado aqui, no servidor. Confiar no botão desabilitado do
 * cliente não é validação, é decoração.
 */
/** A opção de origem que libera o campo "quem te indicou". Mesmo id do contrato de perguntas. */
export const ORIGEM_INDICACAO = "indicacao";

export function validarSubmissao(
  respostasBrutas: unknown,
  origem: unknown,
  consentimento: unknown,
  contato: {
    nome?: unknown;
    email?: unknown;
    whatsapp?: unknown;
    empresa?: unknown;
    papel?: unknown;
    indicadoPor?: unknown;
  },
): ResultadoValidacao {
  if (consentimento !== true) {
    return { ok: false, erro: "consent_required" };
  }

  const respostas = sanitizarRespostas(respostasBrutas);

  const nome = texto(typeof contato.nome === "string" ? contato.nome : "").slice(0, MAX_TEXTO_CURTO);
  if (nome.length < 2) return { ok: false, erro: "nome_invalido" };

  const email = texto(typeof contato.email === "string" ? contato.email : "");
  if (!pareceEmail(email)) return { ok: false, erro: "email_invalido" };

  const ehPessoal = respostas[P.TIPO_USO] === RESPOSTA_USO_PESSOAL;

  const whatsappBruto = texto(typeof contato.whatsapp === "string" ? contato.whatsapp : "");
  if (!ehPessoal && !pareceWhatsapp(whatsappBruto)) {
    return { ok: false, erro: "whatsapp_invalido" };
  }

  const origemLimpa = texto(typeof origem === "string" ? origem : "").slice(0, 60) || "nao_informado";

  // "Quem te indicou" só faz sentido quando a origem é indicação. Fora disso o
  // valor é descartado, mesmo que venha no payload: um nome solto sem origem que
  // o explique viraria dado inventado na hora de medir o canal.
  const indicadoPorBruto = texto(typeof contato.indicadoPor === "string" ? contato.indicadoPor : "");
  const indicadoPor =
    origemLimpa === ORIGEM_INDICACAO && indicadoPorBruto.length > 0
      ? indicadoPorBruto.slice(0, MAX_TEXTO_CURTO)
      : null;

  return {
    ok: true,
    respostas,
    dados: {
      nome,
      email,
      whatsapp: whatsappBruto.length > 0 ? whatsappBruto : null,
      empresa: ehPessoal ? null : texto(typeof contato.empresa === "string" ? contato.empresa : "").slice(0, MAX_TEXTO_CURTO) || null,
      papel: ehPessoal ? null : texto(typeof contato.papel === "string" ? contato.papel : "") || null,
      porte: ehPessoal ? null : texto(respostas[P.PORTE]) || null,
      origem: origemLimpa,
      indicadoPor,
      tipo: ehPessoal ? "pessoal" : "empresa",
    },
  };
}
