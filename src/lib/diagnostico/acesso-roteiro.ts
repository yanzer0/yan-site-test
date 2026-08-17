/**
 * Quem pode abrir o PDF do roteiro.
 *
 * 🔴 Este módulo é a única coisa entre o material interno de condução de venda e
 * o prospect. O anexo do evento é clicável por todo convidado, e o lead É
 * convidado. Sem esta porta, ele lê "revela trauma e o que NÃO propor".
 *
 * Como funciona: quem é do time entra uma vez por dispositivo em
 * `/roteiro/entrar?k=<chave>` e ganha um cookie de longa duração. Quem chega
 * pelo anexo sem o cookie vê uma página neutra, nunca o documento.
 *
 * Por que cookie e não login: o time abre o roteiro no celular, minutos antes
 * da call, às vezes correndo. Tela de login aí é atrito que faz a pessoa
 * desistir e entrar sem roteiro, que é o problema que a feature existe para
 * resolver. Uma vez por dispositivo é o teto de atrito aceitável.
 *
 * Env:
 *   ROTEIRO_ACESSO_CHAVE  (sensível) — a chave que o time usa uma vez
 */

import { createHmac, timingSafeEqual } from "node:crypto";

export const COOKIE_ACESSO = "infuser_roteiro";

/** Um ano. O time entra uma vez por aparelho e esquece que existe. */
export const VALIDADE_SEGUNDOS = 365 * 24 * 60 * 60;

function chaveDoAmbiente(): string | null {
  return process.env.ROTEIRO_ACESSO_CHAVE ?? null;
}

/**
 * O valor do cookie é derivado da chave, nunca a chave em si.
 *
 * Assim o cookie não é reutilizável como credencial de entrada: quem o copiar
 * de um aparelho tem acesso de leitura, mas não descobre a chave nem consegue
 * emitir cookie novo. E trocar a chave invalida todos os cookies de uma vez,
 * que é o botão de pânico se algum aparelho do time se perder.
 */
export function valorDoCookie(chave: string): string {
  return createHmac("sha256", chave).update("infuser-roteiro-v1").digest("hex");
}

function iguais(a: string, b: string): boolean {
  const x = Buffer.from(a, "utf8");
  const y = Buffer.from(b, "utf8");
  if (x.length !== y.length) return false;
  return timingSafeEqual(x, y);
}

/** A chave apresentada em `/roteiro/entrar` é a do ambiente? */
export function chaveConfere(apresentada: string): boolean {
  const esperada = chaveDoAmbiente();
  if (!esperada || !apresentada) return false;
  return iguais(apresentada, esperada);
}

/**
 * Este cookie autoriza ver o documento?
 *
 * Fecha por padrão: sem chave configurada no ambiente, ninguém entra. O modo
 * de falha seguro aqui é o documento ficar inacessível para o time, e não
 * aberto para o lead.
 */
export function cookieAutoriza(cookie: string | undefined): boolean {
  const chave = chaveDoAmbiente();
  if (!chave || !cookie) return false;
  return iguais(cookie, valorDoCookie(chave));
}
