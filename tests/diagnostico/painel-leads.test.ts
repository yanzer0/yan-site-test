/**
 * A base comercial NÃO pode ser legível por quem não é do time. É isto que
 * estes testes travam.
 *
 * O painel serve nome, e-mail, WhatsApp e empresa de todo prospect. Diferente
 * do roteiro, que expõe uma conversa, aqui uma falha expõe a lista inteira de
 * uma vez. Por isso os testes cobrem as DUAS saídas para o mesmo dado - a tela
 * e o CSV - e não só a que é mais óbvia.
 */

import { describe, expect, it, beforeEach, afterEach } from "vitest";

import {
  chaveConfere,
  COOKIE_LEADS,
  cookieAutoriza,
  valorDoCookie,
} from "@/lib/diagnostico/acesso-leads";
import { valorDoCookie as valorDoCookieRoteiro } from "@/lib/diagnostico/acesso-roteiro";
import { envelopeLeadRegistrado } from "@/lib/diagnostico/eventos";
import { paraContexto, paraCsv } from "@/lib/diagnostico/leads-apresentacao";
import type { LeadNaLista, RespostaDoLead } from "@/lib/diagnostico/leads-db";

const CHAVE = "chave-do-painel-de-teste";

beforeEach(() => {
  process.env.LEADS_ACESSO_CHAVE = CHAVE;
});

afterEach(() => {
  delete process.env.LEADS_ACESSO_CHAVE;
  delete process.env.LEADS_EVENTO_URL;
});

const LEAD: LeadNaLista = {
  id: "3f1c0a2e-0000-4000-8000-000000000001",
  nome: 'Ana "Aninha" Souza',
  empresa: "Marmoraria; Cia",
  papel: "dono",
  porte: "6_20",
  email: "ana@exemplo.com",
  whatsapp: "27981629696",
  origem: "instagram",
  tipo: "empresa",
  criadoEm: new Date("2026-08-22T23:58:00Z"),
  score: 15,
  faixa: "qualificado",
  motivoCorte: null,
  agendaEstado: null,
  agendaInicio: null,
};

describe("a porta do painel", () => {
  it("fecha por padrão quando não há chave no ambiente", () => {
    delete process.env.LEADS_ACESSO_CHAVE;
    expect(cookieAutoriza(valorDoCookie(CHAVE))).toBe(false);
    expect(chaveConfere(CHAVE)).toBe(false);
  });

  it("recusa cookie ausente, vazio e adulterado", () => {
    expect(cookieAutoriza(undefined)).toBe(false);
    expect(cookieAutoriza("")).toBe(false);
    expect(cookieAutoriza(`${valorDoCookie(CHAVE).slice(0, -1)}0`)).toBe(false);
  });

  it("aceita o cookie derivado da chave do ambiente", () => {
    expect(cookieAutoriza(valorDoCookie(CHAVE))).toBe(true);
  });

  it("recusa a chave errada mesmo com o mesmo tamanho", () => {
    expect(chaveConfere("chave-do-painel-de-testX")).toBe(false);
    expect(chaveConfere(CHAVE)).toBe(true);
  });

  it("NÃO aceita o cookie do roteiro, mesmo com chave idêntica", () => {
    // Sal diferente por porta. Sem isso, quem tem acesso ao roteiro da call
    // ganharia a base de leads inteira de brinde no dia em que as duas chaves
    // fossem configuradas iguais.
    expect(valorDoCookieRoteiro(CHAVE)).not.toBe(valorDoCookie(CHAVE));
    expect(cookieAutoriza(valorDoCookieRoteiro(CHAVE))).toBe(false);
  });

  it("usa um nome de cookie próprio", () => {
    expect(COOKIE_LEADS).toBe("infuser_leads");
  });
});

describe("o evento de lead registrado", () => {
  const dados = {
    leadId: LEAD.id,
    faixa: "qualificado" as const,
    score: 15,
    porte: "6_20",
    tipo: "empresa" as const,
    origem: "instagram",
  };

  it("monta um envelope CloudEvents 1.0 completo", () => {
    const e = envelopeLeadRegistrado(dados, new Date("2026-08-24T12:00:00Z"), "id-fixo");

    expect(e.specversion).toBe("1.0");
    expect(e.id).toBe("id-fixo");
    expect(e.source).toBe("useinfuser.com/diagnostico");
    expect(e.type).toBe("br.com.useinfuser.diagnostico.lead.registered");
    expect(e.subject).toBe(LEAD.id);
    expect(e.time).toBe("2026-08-24T12:00:00.000Z");
    expect(e.data.ok).toBe(true);
  });

  it("usa verbo no PASSADO, nunca comando", () => {
    const e = envelopeLeadRegistrado(dados, new Date());
    const verbo = e.type.split(".").pop();
    expect(["registered", "queued", "completed", "failed", "produced"]).toContain(verbo);
  });

  it("🔴 NÃO carrega dado pessoal", () => {
    // O envelope vai para canal de aviso, log e n8n. Nenhum dos três é lugar de
    // PII. Quem precisa do contato abre o painel, que tem porta.
    //
    // Allowlist de campos e não busca por substring: a primeira versão deste
    // teste procurava o nome dentro do JSON e passou com o nome DENTRO do
    // envelope, porque `JSON.stringify` escapa as aspas e a substring deixa de
    // casar. Comparar o conjunto de chaves não tem essa cegueira, e ainda pega
    // campo de PII que ninguém pensou em listar aqui.
    const permitidas = ["ok", "leadId", "faixa", "score", "porte", "tipo", "origem", "painel"];
    const e = envelopeLeadRegistrado(dados, new Date());

    expect(Object.keys(e.data).sort()).toEqual([...permitidas].sort());

    // E o envelope inteiro não pode conter contato em campo nenhum.
    const cru = JSON.stringify(e);
    for (const proibido of ["ana@exemplo.com", "27981629696", "Marmoraria"]) {
      expect(cru).not.toContain(proibido);
    }
  });
});

describe("o CSV", () => {
  const respostas: RespostaDoLead[] = [
    { leadId: LEAD.id, perguntaId: "processo", valor: 'Cobrança;\ncom "aspas"' },
  ];

  it("escapa aspas, separador e quebra de linha", () => {
    const csv = paraCsv([LEAD], respostas);
    // Uma linha do lead que não vaza para fora do campo: se o escape falhasse,
    // o `;` do nome da empresa criaria coluna nova e a planilha sairia torta.
    expect(csv).toContain('"Marmoraria; Cia"');
    expect(csv).toContain('"Ana ""Aninha"" Souza"');
    expect(csv).toContain('""aspas""');
  });

  it("abre com BOM para o Excel em português não quebrar acento", () => {
    expect(paraCsv([LEAD], [])).toMatch(/^﻿/);
  });

  it("traz contato, classificação e se agendou", () => {
    const csv = paraCsv([LEAD], []);
    expect(csv).toContain("ana@exemplo.com");
    expect(csv).toContain("27981629696");
    expect(csv).toContain("Qualificado");
    // A coluna que responde a pergunta que originou o painel.
    expect(csv).toContain('"nao"');
  });

  it("não repete nome de coluna no cabeçalho", () => {
    // `porte` é coluna fixa E id de pergunta. Sem prefixo nas respostas o
    // cabeçalho sai com o nome duas vezes, e aí não há como saber qual valor
    // pertence a qual coluna - nem no Excel, nem para um modelo lendo o arquivo.
    const csv = paraCsv([LEAD], [{ leadId: LEAD.id, perguntaId: "porte", valor: "6_20" }]);
    const colunas = csv.split(String.fromCharCode(13, 10))[0].split(";");

    expect(new Set(colunas).size).toBe(colunas.length);
    expect(colunas).toContain('"resp_porte"');
  });

  it("não quebra sem lead nenhum", () => {
    const csv = paraCsv([], []);
    expect(csv.split("\r\n").filter((l) => l.length > 0)).toHaveLength(1);
  });
});

describe("o contexto para colar no modelo", () => {
  it("leva contato, classificação e as respostas literais", () => {
    const texto = paraContexto(LEAD, [
      { leadId: LEAD.id, perguntaId: "processo", valor: "Cobrança manual todo dia" },
    ]);

    expect(texto).toContain("Ana");
    expect(texto).toContain("ana@exemplo.com");
    expect(texto).toContain("Cobrança manual todo dia");
    expect(texto).toContain("Agendou a call: não");
  });

  it("mostra o horário de Brasília, não o UTC do banco", () => {
    // 23:58Z é 20:58 em São Paulo. Ler o horário cru faz o time achar que o
    // lead preencheu de madrugada.
    expect(paraContexto(LEAD, [])).toContain("20:58");
  });
});
