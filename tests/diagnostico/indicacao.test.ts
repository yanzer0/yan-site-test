/**
 * O campo "quem te indicou" (2026-09-03).
 *
 * Indicação é o canal que o ICP chama de prioritário, e até aqui não tinha
 * número porque o formulário só gravava a origem. Estes testes travam o
 * contrato: o nome só entra acompanhado da origem que o explica, é cortado no
 * tamanho de texto curto, e aparece no dossiê e no CSV do painel.
 */

import { describe, expect, it } from "vitest";

import { ORIGEM_INDICACAO, validarSubmissao } from "@/lib/diagnostico/submissao";
import { paraContexto, paraCsv } from "@/lib/diagnostico/leads-apresentacao";
import type { LeadNaLista } from "@/lib/diagnostico/leads-db";

const CONTATO = {
  nome: "Ana Souza",
  email: "ana@exemplo.com",
  whatsapp: "27981629696",
  empresa: "Marmoraria",
  papel: "dono",
};
const RESPOSTAS = { tipo_uso: "empresa", porte: "6_20" };

describe("quem te indicou, na submissao", () => {
  it("entra quando a origem e indicacao, aparado", () => {
    const r = validarSubmissao(RESPOSTAS, ORIGEM_INDICACAO, true, {
      ...CONTATO,
      indicadoPor: "  Thiago Nigro ",
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.dados.indicadoPor).toBe("Thiago Nigro");
  });

  it("e descartado quando a origem e outra, mesmo vindo no payload", () => {
    const r = validarSubmissao(RESPOSTAS, "instagram", true, { ...CONTATO, indicadoPor: "Fulano" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.dados.indicadoPor).toBeNull();
  });

  it("fica nulo quando veio vazio ou ausente", () => {
    const vazio = validarSubmissao(RESPOSTAS, ORIGEM_INDICACAO, true, { ...CONTATO, indicadoPor: "" });
    const ausente = validarSubmissao(RESPOSTAS, ORIGEM_INDICACAO, true, CONTATO);
    expect(vazio.ok && vazio.dados.indicadoPor).toBeNull();
    expect(ausente.ok && ausente.dados.indicadoPor).toBeNull();
  });

  it("e cortado no tamanho de texto curto", () => {
    const r = validarSubmissao(RESPOSTAS, ORIGEM_INDICACAO, true, {
      ...CONTATO,
      indicadoPor: "x".repeat(500),
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.dados.indicadoPor?.length).toBe(200);
  });

  it("nao e texto? e ignorado, nao quebra", () => {
    const r = validarSubmissao(RESPOSTAS, ORIGEM_INDICACAO, true, {
      ...CONTATO,
      indicadoPor: { nome: "objeto" },
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.dados.indicadoPor).toBeNull();
  });
});

const LEAD: LeadNaLista = {
  id: "3f1c0a2e-0000-4000-8000-000000000002",
  nome: "Ana Souza",
  empresa: "Marmoraria",
  papel: "dono",
  porte: "6_20",
  email: "ana@exemplo.com",
  whatsapp: "27981629696",
  origem: "indicacao",
  indicadoPor: "Thiago Nigro",
  tipo: "empresa",
  criadoEm: new Date("2026-08-22T23:58:00Z"),
  score: 15,
  faixa: "qualificado",
  motivoCorte: null,
  agendaEstado: null,
  agendaInicio: null,
};

describe("o painel mostra quem indicou", () => {
  it("no dossie pronto para colar", () => {
    expect(paraContexto(LEAD, [])).toContain("Indicado por: Thiago Nigro");
  });

  it("no csv, como coluna propria", () => {
    const csv = paraCsv([LEAD], []);
    const [cabecalho, linha] = csv.split("\r\n");
    expect(cabecalho).toContain('"indicado_por"');
    expect(linha).toContain('"Thiago Nigro"');
  });

  it("nao inventa linha quando nao houve indicacao", () => {
    expect(paraContexto({ ...LEAD, indicadoPor: null }, [])).not.toContain("Indicado por");
  });
});
