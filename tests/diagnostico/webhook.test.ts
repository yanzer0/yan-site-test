import { describe, it, expect } from "vitest";
import { createHmac } from "node:crypto";

import {
  assinaturaConfere,
  eventoTratado,
  lerAgendamento,
  type PayloadCal,
} from "@/lib/diagnostico/cal-webhook";
import { sanitizarRespostas, validarSubmissao } from "@/lib/diagnostico/submissao";
import { P } from "@/lib/diagnostico/perguntas";

const SEGREDO = "segredo-de-teste";

function assinar(corpo: string, segredo = SEGREDO): string {
  return createHmac("sha256", segredo).update(corpo).digest("hex");
}

describe("assinatura do webhook", () => {
  const corpo = JSON.stringify({ triggerEvent: "BOOKING_CREATED" });

  it("aceita a assinatura correta", () => {
    expect(assinaturaConfere(corpo, assinar(corpo), SEGREDO)).toBe(true);
  });

  it("rejeita quando um caractere muda", () => {
    const valida = assinar(corpo);
    const adulterada = (valida[0] === "a" ? "b" : "a") + valida.slice(1);
    expect(assinaturaConfere(corpo, adulterada, SEGREDO)).toBe(false);
  });

  it("rejeita assinatura de outro segredo", () => {
    expect(assinaturaConfere(corpo, assinar(corpo, "outro-segredo"), SEGREDO)).toBe(false);
  });

  it("rejeita corpo adulterado com assinatura do corpo original", () => {
    const outroCorpo = JSON.stringify({ triggerEvent: "BOOKING_CANCELLED" });
    expect(assinaturaConfere(outroCorpo, assinar(corpo), SEGREDO)).toBe(false);
  });

  it("rejeita assinatura vazia e segredo vazio sem lancar", () => {
    expect(assinaturaConfere(corpo, "", SEGREDO)).toBe(false);
    expect(assinaturaConfere(corpo, assinar(corpo), "")).toBe(false);
  });

  it("rejeita assinatura de tamanho diferente sem lancar", () => {
    expect(() => assinaturaConfere(corpo, "abc", SEGREDO)).not.toThrow();
    expect(assinaturaConfere(corpo, "abc", SEGREDO)).toBe(false);
  });
});

describe("leitura do payload do Cal.com", () => {
  const completo: PayloadCal = {
    triggerEvent: "BOOKING_CREATED",
    payload: {
      uid: "abc123",
      startTime: "2026-08-20T14:00:00.000Z",
      attendees: [{ email: "lead@empresa.com", name: "Lead" }],
    },
  };

  it("le uid, inicio e email", () => {
    const lido = lerAgendamento(completo);
    expect(lido?.bookingId).toBe("abc123");
    expect(lido?.email).toBe("lead@empresa.com");
    expect(lido?.inicioEm.toISOString()).toBe("2026-08-20T14:00:00.000Z");
  });

  it("devolve null quando falta o essencial, em vez de lancar", () => {
    expect(lerAgendamento({ triggerEvent: "BOOKING_CREATED", payload: {} })).toBeNull();
    expect(lerAgendamento({})).toBeNull();
    expect(
      lerAgendamento({ payload: { uid: "x", startTime: "data-invalida", attendees: [{ email: "a@b.co" }] } }),
    ).toBeNull();
  });

  it("so trata os eventos declarados", () => {
    expect(eventoTratado("BOOKING_CREATED")).toBe(true);
    expect(eventoTratado("MEETING_ENDED")).toBe(false);
    expect(eventoTratado(undefined)).toBe(false);
  });
});

describe("sanitizacao das respostas", () => {
  it("descarta pergunta que nao existe no contrato", () => {
    const limpo = sanitizarRespostas({ pergunta_inventada: "x", [P.FREQUENCIA]: "todo_dia" });
    expect(limpo["pergunta_inventada"]).toBeUndefined();
    expect(limpo[P.FREQUENCIA]).toBe("todo_dia");
  });

  it("descarta opcao que nao esta declarada na pergunta", () => {
    const limpo = sanitizarRespostas({ [P.FREQUENCIA]: "a_cada_nanossegundo" });
    expect(limpo[P.FREQUENCIA]).toBeUndefined();
  });

  it("filtra opcoes invalidas dentro de multipla escolha", () => {
    const limpo = sanitizarRespostas({ [P.CONSEQUENCIA]: ["refazer", "opcao_falsa"] });
    expect(limpo[P.CONSEQUENCIA]).toEqual(["refazer"]);
  });

  it("corta texto longo demais em vez de aceitar", () => {
    const gigante = "a".repeat(9000);
    const limpo = sanitizarRespostas({ [P.COMO_FUNCIONA]: gigante });
    expect((limpo[P.COMO_FUNCIONA] as string).length).toBe(5000);
  });

  it("aguenta entrada que nao e objeto", () => {
    expect(sanitizarRespostas(null)).toEqual({});
    expect(sanitizarRespostas("texto")).toEqual({});
    expect(sanitizarRespostas(42)).toEqual({});
  });
});

describe("validacao da submissao", () => {
  const contatoValido = {
    nome: "Ricardo Menezes",
    email: "ricardo@vertex.com.br",
    whatsapp: "11988887777",
    empresa: "Vertex",
  };
  const respostasEmpresa = { [P.TIPO_USO]: "empresa", [P.FREQUENCIA]: "todo_dia" };

  it("recusa sem consentimento, antes de qualquer outra coisa", () => {
    const r = validarSubmissao(respostasEmpresa, "instagram", false, contatoValido);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.erro).toBe("consent_required");
  });

  it("recusa consentimento que nao seja o booleano true", () => {
    for (const valor of ["true", 1, {}, null, undefined]) {
      const r = validarSubmissao(respostasEmpresa, "instagram", valor, contatoValido);
      expect(r.ok).toBe(false);
    }
  });

  it("recusa e-mail invalido", () => {
    const r = validarSubmissao(respostasEmpresa, "instagram", true, {
      ...contatoValido,
      email: "nao-e-email",
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.erro).toBe("email_invalido");
  });

  it("exige whatsapp de empresa, mas nao de uso pessoal", () => {
    const empresa = validarSubmissao(respostasEmpresa, "ig", true, { ...contatoValido, whatsapp: "" });
    expect(empresa.ok).toBe(false);

    const pessoal = validarSubmissao({ [P.TIPO_USO]: "pessoal" }, "ig", true, {
      nome: "Ana",
      email: "ana@gmail.com",
    });
    expect(pessoal.ok).toBe(true);
    if (pessoal.ok) expect(pessoal.dados.tipo).toBe("pessoal");
  });

  it("uso pessoal nao carrega dados de empresa", () => {
    const r = validarSubmissao({ [P.TIPO_USO]: "pessoal" }, "ig", true, {
      ...contatoValido,
      empresa: "Deveria Sumir",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.dados.empresa).toBeNull();
      expect(r.dados.porte).toBeNull();
    }
  });

  it("origem ausente vira nao_informado em vez de vazio", () => {
    const r = validarSubmissao(respostasEmpresa, undefined, true, contatoValido);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.dados.origem).toBe("nao_informado");
  });
});
