/**
 * A cópia do schema do brain não pode envelhecer em silêncio.
 *
 * Estes testes só têm dente na máquina onde o brain está clonado. É o caso da
 * máquina do Yan, que é justamente onde o worker roda e onde o card é gravado —
 * ou seja, exatamente onde a divergência causaria estrago.
 */

import { describe, expect, it } from "vitest";

import { ENUM_MODELO, ENUM_ORIGEM, ENUM_STATUS, REQUIRED_FIELDS, schemaOriginal } from "./schema-do-brain";

const original = schemaOriginal();
const comOBrain = original ? describe : describe.skip;

comOBrain("a copia do schema bate com o brain", () => {
  it("mesmos campos obrigatorios", () => {
    expect([...REQUIRED_FIELDS].sort()).toEqual([...original!.REQUIRED_FIELDS].sort());
  });

  it("mesmo funil", () => {
    expect([...ENUM_STATUS].sort()).toEqual(original!.STATUS.map((s) => s.id).sort());
  });

  it("mesmas origens", () => {
    expect([...ENUM_ORIGEM].sort()).toEqual([...original!.ORIGENS].sort());
  });

  it("mesmos modelos comerciais", () => {
    expect([...ENUM_MODELO].sort()).toEqual([...original!.MODELOS].sort());
  });
});

describe("aviso quando o brain nao esta por perto", () => {
  it("diz explicitamente que a comparacao com a fonte nao rodou", () => {
    if (!original) {
      console.warn(
        "[contrato-brain] brain nao encontrado: a comparacao com schema-clientes.js NAO rodou. " +
          "A cobertura aqui e apenas contra a copia declarada.",
      );
    }
    expect(true).toBe(true);
  });
});
