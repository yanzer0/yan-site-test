/**
 * Quem pode abrir o painel de leads.
 *
 * 🔴 Este módulo é a única coisa entre a base comercial da Infuser e a
 * internet. O painel serve nome, e-mail, WhatsApp e empresa de todo prospect
 * que preencheu o formulário. Falha aqui não vaza um documento: vaza a lista
 * inteira, com dado pessoal, de uma vez.
 *
 * Mesmo mecanismo do roteiro (`acesso-roteiro.ts`): o time entra uma vez por
 * aparelho em `/leads/entrar?k=<chave>` e ganha um cookie. Duas diferenças
 * deliberadas, as duas por causa do que está atrás da porta:
 *
 *   1. **Chave própria** (`LEADS_ACESSO_CHAVE`), não a do roteiro. Menor
 *      privilégio: derrubar o acesso ao painel não derruba o roteiro na véspera
 *      de uma call, e quem tem um não ganha o outro de brinde.
 *   2. **90 dias, não um ano.** O roteiro é aberto correndo, minutos antes da
 *      call, e lá o atrito de reentrar custa caro. O painel é trabalho sentado:
 *      reentrar quatro vezes por ano não atrapalha ninguém, e encurta a janela
 *      em que um aparelho perdido continua valendo.
 *
 * Env:
 *   LEADS_ACESSO_CHAVE  (sensível) — a chave que o time usa uma vez por aparelho
 */

// debt: terceira porta por cookie neste repo vira extração de um `porta-cookie.ts`
// parametrizado (cookie, sal, validade). Gatilho: a terceira. Com duas, extrair
// agora seria abstrair com uma amostra só de variação.

import { createHmac, timingSafeEqual } from "node:crypto";

export const COOKIE_LEADS = "infuser_leads";

/** 90 dias. Ver o cabeçalho para o porquê de não ser um ano como no roteiro. */
export const VALIDADE_SEGUNDOS = 90 * 24 * 60 * 60;

function chaveDoAmbiente(): string | null {
  return process.env.LEADS_ACESSO_CHAVE ?? null;
}

/**
 * O valor do cookie é derivado da chave, nunca a chave em si.
 *
 * Quem copiar o cookie de um aparelho ganha leitura, não descobre a chave nem
 * consegue emitir cookie novo. E trocar a chave invalida todos os cookies de
 * uma vez: é o botão de pânico se um aparelho do time se perder.
 *
 * O sal é diferente do sal do roteiro de propósito. Sem isso, as duas portas
 * derivariam o mesmo valor sempre que as chaves fossem iguais, e um cookie
 * serviria para as duas.
 */
export function valorDoCookie(chave: string): string {
  return createHmac("sha256", chave).update("infuser-leads-v1").digest("hex");
}

function iguais(a: string, b: string): boolean {
  const x = Buffer.from(a, "utf8");
  const y = Buffer.from(b, "utf8");
  if (x.length !== y.length) return false;
  return timingSafeEqual(x, y);
}

/** A chave apresentada em `/leads/entrar` é a do ambiente? */
export function chaveConfere(apresentada: string): boolean {
  const esperada = chaveDoAmbiente();
  if (!esperada || !apresentada) return false;
  return iguais(apresentada, esperada);
}

/**
 * Este cookie autoriza abrir o painel?
 *
 * Fecha por padrão: sem chave configurada no ambiente ninguém entra, nem o
 * time. O modo de falha seguro aqui é o painel ficar inacessível, nunca aberto.
 */
export function cookieAutoriza(cookie: string | undefined): boolean {
  const chave = chaveDoAmbiente();
  if (!chave || !cookie) return false;
  return iguais(cookie, valorDoCookie(chave));
}
