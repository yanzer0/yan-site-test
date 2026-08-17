/**
 * O roteiro NÃO pode ser legível pelo lead. Este é o teste que trava isso.
 *
 * História, porque ela explica o desenho e evita refazer o caminho errado:
 *
 * 1. A primeira versão escrevia o andaime na DESCRIÇÃO do evento. O lead é
 *    convidado, e a doc do Google é literal: `private` significa "only event
 *    attendees may view event details" — esconde de quem NÃO é convidado.
 * 2. A segunda tentou anexar um PDF do Google Drive, contando com a ACL do
 *    Google para barrar. Não funciona sem Workspace: service account não tem
 *    quota, nem dentro de pasta compartilhada.
 *      403 Service Accounts do not have storage quota.
 * 3. A que ficou: o PDF é nosso, servido em `/roteiro/<token>`, e quem barra é
 *    um cookie que só o time tem. O anexo é clicável por qualquer convidado —
 *    é justamente por isso que a porta tem que estar no nosso lado.
 *
 * O que estes testes travam é essa porta.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import {
  chaveConfere,
  COOKIE_ACESSO,
  cookieAutoriza,
  valorDoCookie,
} from "@/lib/diagnostico/acesso-roteiro";

const CHAVE = "chave-do-time-de-teste";
const chamadas: { url: string; metodo: string; corpo: unknown }[] = [];

vi.mock("google-auth-library", () => ({
  JWT: class {
    getAccessToken() {
      return Promise.resolve({ token: "token-de-teste" });
    }
  },
}));

beforeEach(() => {
  chamadas.length = 0;
  process.env.ROTEIRO_ACESSO_CHAVE = CHAVE;
  process.env.GOOGLE_CALENDAR_ID = "agenda-infuser@group.calendar.google.com";
  process.env.GOOGLE_SERVICE_ACCOUNT_B64 = Buffer.from(
    JSON.stringify({ client_email: "sa@teste.iam.gserviceaccount.com", private_key: "chave" }),
  ).toString("base64");

  vi.stubGlobal("fetch", (url: string | URL, opcoes: RequestInit = {}) => {
    const alvo = String(url);
    const corpoTexto = typeof opcoes.body === "string" ? opcoes.body : null;
    chamadas.push({
      url: alvo,
      metodo: opcoes.method ?? "GET",
      corpo: corpoTexto ? JSON.parse(corpoTexto) : null,
    });
    return Promise.resolve(
      new Response(JSON.stringify({ id: "evento-da-call" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("a porta do documento", () => {
  it("🔴 sem cookie NAO autoriza", () => {
    expect(cookieAutoriza(undefined)).toBe(false);
    expect(cookieAutoriza("")).toBe(false);
    expect(cookieAutoriza("qualquer-coisa")).toBe(false);
  });

  it("com o cookie certo autoriza", () => {
    expect(cookieAutoriza(valorDoCookie(CHAVE))).toBe(true);
  });

  it("🔴 fecha por padrao: sem chave no ambiente, ninguem entra", () => {
    // O modo de falha seguro é o time ficar sem acesso, nunca o lead ganhar.
    const cookieValido = valorDoCookie(CHAVE);
    delete process.env.ROTEIRO_ACESSO_CHAVE;
    expect(cookieAutoriza(cookieValido)).toBe(false);
    expect(chaveConfere(CHAVE)).toBe(false);
  });

  it("o cookie NAO e a chave, e sim um derivado dela", () => {
    // Copiar o cookie de um aparelho dá leitura, não dá a chave nem permite
    // emitir cookie novo.
    expect(valorDoCookie(CHAVE)).not.toContain(CHAVE);
    expect(valorDoCookie(CHAVE)).toMatch(/^[0-9a-f]{64}$/);
  });

  it("trocar a chave derruba os cookies antigos", () => {
    const antigo = valorDoCookie(CHAVE);
    process.env.ROTEIRO_ACESSO_CHAVE = "chave-nova-apos-incidente";
    expect(cookieAutoriza(antigo)).toBe(false);
  });

  it("recusa chave errada na entrada", () => {
    expect(chaveConfere("errada")).toBe(false);
    expect(chaveConfere("")).toBe(false);
    expect(chaveConfere(CHAVE)).toBe(true);
  });

  it("o nome do cookie e escopado, nao generico", () => {
    expect(COOKIE_ACESSO).toBe("infuser_roteiro");
  });
});

describe("o nome do anexo, que o lead LE", () => {
  it("nao entrega que e roteiro de venda", async () => {
    const { nomeDoDocumento } = await import("@/lib/diagnostico/documento-roteiro");
    const nome = nomeDoDocumento("Vertex Componentes", "Ricardo");

    expect(nome).toBe("Preparo - Vertex Componentes - Call 1.pdf");
    for (const proibido of ["roteiro", "venda", "objec", "script"]) {
      expect(nome.toLowerCase()).not.toContain(proibido);
    }
  });

  it("cai no nome da pessoa quando nao ha empresa", async () => {
    const { nomeDoDocumento } = await import("@/lib/diagnostico/documento-roteiro");
    expect(nomeDoDocumento(null, "Ricardo Alves")).toBe("Preparo - Ricardo Alves - Call 1.pdf");
  });

  it("remove caractere que quebra nome de arquivo", async () => {
    const { nomeDoDocumento } = await import("@/lib/diagnostico/documento-roteiro");
    expect(nomeDoDocumento('Alfa/Beta: "Gama"', "x")).toBe("Preparo - Alfa-Beta- -Gama- - Call 1.pdf");
  });
});

describe("o anexo no evento da call", () => {
  async function anexar() {
    const { anexarNoEvento } = await import("@/lib/diagnostico/documento-roteiro");
    await anexarNoEvento(
      "evento-1",
      { fileUrl: "https://useinfuser.com/roteiro/abc123", titulo: "Preparo - Vertex - Call 1.pdf" },
      "token",
      "agenda@group.calendar.google.com",
    );
  }

  it("🔴 manda supportsAttachments, sem o qual o Google IGNORA o anexo calado", async () => {
    await anexar();
    expect(chamadas.find((c) => c.metodo === "PATCH")?.url).toContain("supportsAttachments=true");
  });

  it("nao notifica os convidados da mudanca", async () => {
    await anexar();
    expect(chamadas.find((c) => c.metodo === "PATCH")?.url).toContain("sendUpdates=none");
  });

  it("usa PATCH, que preserva link da reuniao e convidados", async () => {
    await anexar();
    // PUT substituiria o recurso inteiro e apagaria o que o Cal.com criou.
    expect(chamadas.filter((c) => c.metodo === "PUT")).toHaveLength(0);
    expect(chamadas.filter((c) => c.metodo === "PATCH")).toHaveLength(1);
  });

  it("🔴 NAO toca na descricao do evento, que o lead le", async () => {
    await anexar();
    const patch = chamadas.find((c) => c.metodo === "PATCH")?.corpo as Record<string, unknown>;
    expect(patch.description).toBeUndefined();
    expect(Object.keys(patch)).toEqual(["attachments"]);
  });

  it("o anexo aponta pro NOSSO dominio, onde temos a porta", async () => {
    await anexar();
    const patch = chamadas.find((c) => c.metodo === "PATCH")?.corpo as {
      attachments: { fileUrl: string }[];
    };
    // Um link sem porta nossa (Drive público, storage aberto) seria clicável
    // pelo lead e leria o roteiro inteiro.
    expect(patch.attachments[0].fileUrl).toContain("useinfuser.com/roteiro/");
  });
});
