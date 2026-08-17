/**
 * A verificação do webhook do Stripe.
 *
 * Este módulo é o que separa "pagou" de "disse que pagou", e o esquema de
 * assinatura do Stripe NÃO é o mesmo do Cal.com: o header traz `t=` e `v1=`
 * juntos, e o que se assina é `timestamp.corpo`, não o corpo puro. Copiar o
 * outro webhook aqui daria assinatura inválida em 100% dos casos.
 */

import { createHmac } from "node:crypto";

import { describe, expect, it } from "vitest";

import { assinaturaStripeConfere, TOLERANCIA_SEGUNDOS } from "@/lib/diagnostico/stripe";

const SEGREDO = "whsec_teste";
const CORPO = JSON.stringify({ type: "checkout.session.completed" });
const AGORA = 1_800_000_000;

function assinar(corpo: string, timestamp: number, segredo = SEGREDO): string {
  const v1 = createHmac("sha256", segredo).update(`${timestamp}.${corpo}`).digest("hex");
  return `t=${timestamp},v1=${v1}`;
}

describe("assinatura do webhook do Stripe", () => {
  it("aceita a assinatura correta", () => {
    expect(assinaturaStripeConfere(CORPO, assinar(CORPO, AGORA), SEGREDO, AGORA)).toBe(true);
  });

  it("recusa quando o corpo foi adulterado", () => {
    const header = assinar(CORPO, AGORA);
    const adulterado = JSON.stringify({ type: "checkout.session.completed", extra: "x" });
    expect(assinaturaStripeConfere(adulterado, header, SEGREDO, AGORA)).toBe(false);
  });

  it("recusa assinatura feita com outro segredo", () => {
    const header = assinar(CORPO, AGORA, "whsec_do_atacante");
    expect(assinaturaStripeConfere(CORPO, header, SEGREDO, AGORA)).toBe(false);
  });

  it("recusa header vazio ou sem segredo", () => {
    expect(assinaturaStripeConfere(CORPO, "", SEGREDO, AGORA)).toBe(false);
    expect(assinaturaStripeConfere(CORPO, assinar(CORPO, AGORA), "", AGORA)).toBe(false);
  });

  it("recusa header malformado, sem t ou sem v1", () => {
    expect(assinaturaStripeConfere(CORPO, "v1=abc", SEGREDO, AGORA)).toBe(false);
    expect(assinaturaStripeConfere(CORPO, `t=${AGORA}`, SEGREDO, AGORA)).toBe(false);
    expect(assinaturaStripeConfere(CORPO, "lixo", SEGREDO, AGORA)).toBe(false);
  });

  it("🔴 recusa replay: assinatura valida, mas velha demais", () => {
    // Sem a janela, um webhook capturado uma vez valeria para sempre.
    const antigo = AGORA - TOLERANCIA_SEGUNDOS - 1;
    expect(assinaturaStripeConfere(CORPO, assinar(CORPO, antigo), SEGREDO, AGORA)).toBe(false);
  });

  it("aceita dentro da janela de tolerancia", () => {
    const quaseVelho = AGORA - TOLERANCIA_SEGUNDOS + 5;
    expect(assinaturaStripeConfere(CORPO, assinar(CORPO, quaseVelho), SEGREDO, AGORA)).toBe(true);
  });

  it("recusa timestamp no futuro alem da janela", () => {
    // Relogio adiantado do outro lado tambem e sinal de payload forjado.
    const futuro = AGORA + TOLERANCIA_SEGUNDOS + 1;
    expect(assinaturaStripeConfere(CORPO, assinar(CORPO, futuro), SEGREDO, AGORA)).toBe(false);
  });

  it("aceita quando o header traz varias v1, como na rotacao de segredo", () => {
    const valida = createHmac("sha256", SEGREDO).update(`${AGORA}.${CORPO}`).digest("hex");
    const header = `t=${AGORA},v1=0000000000000000000000000000000000000000000000000000000000000000,v1=${valida}`;
    expect(assinaturaStripeConfere(CORPO, header, SEGREDO, AGORA)).toBe(true);
  });

  it("assina o timestamp junto com o corpo, nao o corpo sozinho", () => {
    // Guarda a diferenca para o webhook do Cal.com, que assina so o corpo.
    const comoNoCal = createHmac("sha256", SEGREDO).update(CORPO).digest("hex");
    expect(assinaturaStripeConfere(CORPO, `t=${AGORA},v1=${comoNoCal}`, SEGREDO, AGORA)).toBe(false);
  });
});
