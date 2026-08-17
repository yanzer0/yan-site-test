import { describe, it, expect } from "vitest";

import {
  blocoDeContato,
  descricaoComContato,
  formatarWhatsapp,
  MARCADORES_DO_BLOCO,
  type ContatoDoLead,
} from "@/lib/diagnostico/contato-no-evento";
import { convidadosSemOLead } from "@/lib/diagnostico/agenda-google";

/**
 * O contato do lead na descrição do evento, e o que NUNCA pode ir junto.
 *
 * Esta base já vazou material interno pelo evento uma vez: o roteiro da call foi
 * escrito na descrição, e o lead — que o Cal.com adiciona como convidado — podia
 * ler. Não existe campo de evento que o Google esconda de convidado. Por isso o
 * que entra aqui é só o que é DO LEAD, e o resto é testado como proibição.
 */

const LEAD: ContatoDoLead = {
  nome: "Fulano de Tal",
  email: "fulano@empresa.com.br",
  whatsapp: "11987654321",
  empresa: "Empresa Teste",
  papel: "gerencia",
};

describe("o que a descricao carrega", () => {
  it("leva nome, e-mail e WhatsApp", () => {
    const bloco = blocoDeContato(LEAD);
    expect(bloco).toContain("Fulano de Tal");
    expect(bloco).toContain("fulano@empresa.com.br");
    expect(bloco).toContain("(11) 98765-4321");
  });

  it("o WhatsApp vira link clicavel com DDI", () => {
    expect(blocoDeContato(LEAD)).toContain("https://wa.me/5511987654321");
  });

  it("aguenta lead sem WhatsApp sem quebrar nem escrever 'null'", () => {
    const bloco = blocoDeContato({ ...LEAD, whatsapp: null });
    expect(bloco).not.toContain("WhatsApp");
    expect(bloco).not.toContain("null");
    expect(bloco).toContain("fulano@empresa.com.br");
  });

  it("aguenta lead sem empresa", () => {
    const bloco = blocoDeContato({ ...LEAD, empresa: null, papel: null });
    expect(bloco).not.toContain("null");
    expect(bloco).toContain("Fulano de Tal");
  });
});

describe("o que a descricao NAO pode carregar (o lead le)", () => {
  it("nada de score, faixa ou motivo de corte", () => {
    // Ler que foi classificado como "nao_icp_empresa" é pior do que não receber
    // nada. E o campo existe na fila, a um descuido de distância.
    const bloco = blocoDeContato(LEAD).toLowerCase();
    for (const interno of [
      "score",
      "faixa",
      "nao_icp",
      "não qualificado",
      "desqualific",
      "revisao",
      "roteiro",
      "abertura",
      "objeção",
    ]) {
      expect(bloco, `vazou material interno: "${interno}"`).not.toContain(interno);
    }
  });

  it("a interface nao aceita score nem faixa, entao nem da para errar", () => {
    // Guard de tipo virando teste: se alguém alargar ContatoDoLead para caber
    // score, este teste continua verde mas o de cima pega o conteúdo. As duas
    // camadas existem porque a de tipo some num `as any`.
    const campos = Object.keys(LEAD);
    expect(campos.sort()).toEqual(["email", "empresa", "nome", "papel", "whatsapp"]);
  });
});

describe("convivencia com a descricao que o Cal.com escreveu", () => {
  it("preserva o que ja estava la", () => {
    const anterior = "Reuniao marcada pelo Cal.com\nLink: https://meet.google.com/abc";
    const nova = descricaoComContato(anterior, LEAD);

    expect(nova).toContain("https://meet.google.com/abc");
    expect(nova).toContain("fulano@empresa.com.br");
  });

  it("reprocessar NAO empilha uma segunda copia", () => {
    // O worker reprocessa: retry, remarcação. Sem marcador, cada passada
    // acrescentaria outro bloco de contato na descrição.
    const anterior = "Descricao original do Cal.com";
    const uma = descricaoComContato(anterior, LEAD);
    const duas = descricaoComContato(uma, LEAD);

    const quantas = duas.split(MARCADORES_DO_BLOCO.ABRE).length - 1;
    expect(quantas).toBe(1);
    expect(duas).toContain("Descricao original do Cal.com");
  });

  it("atualiza o contato quando ele muda, sem duplicar", () => {
    const uma = descricaoComContato("original", LEAD);
    const duas = descricaoComContato(uma, { ...LEAD, email: "novo@empresa.com.br" });

    expect(duas).toContain("novo@empresa.com.br");
    expect(duas).not.toContain("fulano@empresa.com.br");
  });

  it("descricao vazia vira so o bloco", () => {
    expect(descricaoComContato(null, LEAD)).toContain("Fulano de Tal");
    expect(descricaoComContato("", LEAD)).toContain("Fulano de Tal");
  });
});

describe("formatarWhatsapp", () => {
  it.each([
    ["11987654321", "(11) 98765-4321"],
    ["5511987654321", "(11) 98765-4321"],
    ["+55 11 98765-4321", "(11) 98765-4321"],
    ["1133334444", "(11) 3333-4444"],
  ])("%s vira %s", (bruto, esperado) => {
    expect(formatarWhatsapp(bruto)).toBe(esperado);
  });

  it("devolve como veio o que nao reconhece, em vez de inventar", () => {
    expect(formatarWhatsapp("nao sei meu numero")).toBe("nao sei meu numero");
  });
});

describe("tirar o lead de convidado do evento", () => {
  const ORGANIZADOR = { email: "yan@infuser.com", organizador: true };
  const LEAD_CONVIDADO = { email: "fulano@empresa.com.br", organizador: false };

  it("remove o lead e devolve o resto", () => {
    const ficam = convidadosSemOLead([ORGANIZADOR, LEAD_CONVIDADO], LEAD.email);
    expect(ficam).toEqual([{ email: "yan@infuser.com" }]);
  });

  it("NUNCA remove o organizador, mesmo se o e-mail bater", () => {
    // Tirar o organizador da própria reunião quebraria o evento.
    const ficam = convidadosSemOLead(
      [{ email: "yan@infuser.com", organizador: true }],
      "yan@infuser.com",
    );
    expect(ficam).toBeNull();
  });

  it("devolve null quando o lead ja nao esta la, para nao gastar um PATCH", () => {
    expect(convidadosSemOLead([ORGANIZADOR], LEAD.email)).toBeNull();
    expect(convidadosSemOLead([], LEAD.email)).toBeNull();
  });

  it("compara e-mail sem ligar para caixa e espaco", () => {
    const ficam = convidadosSemOLead(
      [{ email: "  Fulano@Empresa.COM.BR ", organizador: false }],
      "fulano@empresa.com.br",
    );
    expect(ficam).toEqual([]);
  });
});
