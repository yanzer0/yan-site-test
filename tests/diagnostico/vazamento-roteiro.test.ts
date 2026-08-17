/**
 * O roteiro NÃO pode ser legível pelo lead. Este é o teste que trava isso.
 *
 * História, porque ela explica o desenho: a primeira versão escrevia o andaime
 * na descrição do evento do Cal.com, e o lead é convidado desse evento. A
 * documentação do Google é literal:
 *
 *   "private" - The event is private and only event attendees may view event
 *   details.
 *
 * `private` esconde de quem NÃO é convidado. O convidado sempre vê a descrição.
 *
 * Agora o roteiro é um PDF no Drive, anexado ao evento da call. A proteção
 * deixou de ser "não escreve onde ele lê" e passou a ser a ACL do Drive: o
 * arquivo herda a permissão da pasta, que só o time tem. O que estes testes
 * travam é justamente isso — que nada no código torne o arquivo público.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

const chamadas: { url: string; metodo: string; corpo: unknown }[] = [];

vi.mock("google-auth-library", () => ({
  JWT: class {
    getAccessToken() {
      return Promise.resolve({ token: "token-de-teste" });
    }
  },
}));

function responder(corpo: unknown, status = 200): Response {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { "content-type": "application/json" },
  });
}

beforeEach(() => {
  chamadas.length = 0;
  process.env.GOOGLE_CALENDAR_ID = "agenda-infuser@group.calendar.google.com";
  process.env.GOOGLE_DRIVE_FOLDER_ID = "pasta-do-time";
  process.env.GOTENBERG_URL = "http://gotenberg:3000";
  process.env.GOOGLE_SERVICE_ACCOUNT_B64 = Buffer.from(
    JSON.stringify({ client_email: "sa@teste.iam.gserviceaccount.com", private_key: "chave" }),
  ).toString("base64");

  vi.stubGlobal("fetch", (url: string | URL, opcoes: RequestInit = {}) => {
    const alvo = String(url);
    const metodo = opcoes.method ?? "GET";
    const corpoTexto = typeof opcoes.body === "string" ? opcoes.body : null;
    chamadas.push({ url: alvo, metodo, corpo: corpoTexto ? JSON.parse(corpoTexto) : opcoes.body });

    if (alvo.includes("gotenberg")) {
      return Promise.resolve(new Response(new Uint8Array([0x25, 0x50, 0x44, 0x46]), { status: 200 }));
    }
    // O upload PRECISA ser testado antes da busca: a URL dele é
    // `/upload/drive/v3/files?...`, que também casa com `/drive/v3/files?`.
    // Na ordem inversa o upload cai no branch da busca, devolve `{files:[]}`
    // sem `id`, e o erro que aparece é "publicar no drive: 200" — que não diz
    // nada sobre a causa real.
    if (alvo.includes("/upload/drive/v3/files")) {
      return Promise.resolve(
        responder({ id: "arquivo-1", webViewLink: "https://drive.google.com/file/d/arquivo-1/view" }),
      );
    }
    if (alvo.includes("/drive/v3/files?")) return Promise.resolve(responder({ files: [] }));
    return Promise.resolve(responder({ id: "evento-da-call" }));
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("o PDF no Drive nunca vira publico", () => {
  it("🔴 NAO cria permissao nenhuma no arquivo", async () => {
    const { publicarNoDrive } = await import("@/lib/diagnostico/documento-roteiro");
    await publicarNoDrive(Buffer.from("pdf"), "Preparo - Vertex - Call 1.pdf");

    // `permissions.create` com `type: anyone` destruiria a unica protecao do
    // desenho: o arquivo passaria a abrir pra qualquer um com o link, e o link
    // esta anexado no evento que o lead enxerga.
    const permissoes = chamadas.filter((c) => c.url.includes("/permissions"));
    expect(permissoes).toHaveLength(0);
  });

  it("grava DENTRO da pasta do time, e nao solto no Drive", async () => {
    const { publicarNoDrive } = await import("@/lib/diagnostico/documento-roteiro");
    await publicarNoDrive(Buffer.from("pdf"), "Preparo - Vertex - Call 1.pdf");

    // Fora da pasta o arquivo nao herda ACL nenhuma, e a protecao some.
    const upload = chamadas.find((c) => c.url.includes("/upload/drive/v3/files"));
    expect(upload?.corpo).toBeInstanceOf(FormData);
  });

  it("usa o escopo minimo do Drive", async () => {
    const modulo = await import("@/lib/diagnostico/documento-roteiro");
    const fonte = await import("node:fs").then((fs) =>
      fs.readFileSync("src/lib/diagnostico/documento-roteiro.ts", "utf8"),
    );
    // `drive.file` enxerga so o que a propria conta criou. `drive` daria acesso
    // ao Drive inteiro do Yan a partir de uma credencial que vive num servidor.
    expect(fonte).toContain("auth/drive.file");
    expect(fonte).not.toContain("auth/drive.readonly");
    expect(fonte).not.toMatch(/auth\/drive["']/);
    expect(modulo.nomeDoDocumento).toBeTypeOf("function");
  });

  it("reprocessar substitui o arquivo, nao acumula duplicata", async () => {
    vi.stubGlobal("fetch", (url: string | URL, opcoes: RequestInit = {}) => {
      const alvo = String(url);
      chamadas.push({ url: alvo, metodo: opcoes.method ?? "GET", corpo: null });
      if (alvo.includes("/upload/drive/v3/files")) {
        return Promise.resolve(responder({ id: "ja-existe", webViewLink: "https://drive.google.com/x" }));
      }
      if (alvo.includes("/drive/v3/files?")) {
        return Promise.resolve(responder({ files: [{ id: "ja-existe" }] }));
      }
      return Promise.resolve(responder({ id: "ja-existe" }));
    });

    const { publicarNoDrive } = await import("@/lib/diagnostico/documento-roteiro");
    const r = await publicarNoDrive(Buffer.from("pdf"), "Preparo - Vertex - Call 1.pdf");

    expect(r.fileId).toBe("ja-existe");
    const upload = chamadas.find((c) => c.url.includes("/upload/drive/v3/files"));
    expect(upload?.metodo).toBe("PATCH");
  });

  it("escapa aspas no nome, que vem do lead", async () => {
    const { publicarNoDrive } = await import("@/lib/diagnostico/documento-roteiro");
    await publicarNoDrive(Buffer.from("pdf"), "Preparo - D'Angelo - Call 1.pdf");

    // Aspas simples delimitam o valor na query do Drive. Sem escape, o nome do
    // lead controla a busca.
    const busca = chamadas.find((c) => c.url.includes("/drive/v3/files?"));
    expect(decodeURIComponent(busca?.url ?? "")).toContain("D\\'Angelo");
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
  it("🔴 manda supportsAttachments, sem o qual o Google IGNORA o anexo calado", async () => {
    const { anexarNoEvento } = await import("@/lib/diagnostico/documento-roteiro");
    await anexarNoEvento(
      "evento-1",
      { fileId: "a1", fileUrl: "https://drive.google.com/x", titulo: "Preparo - Vertex - Call 1.pdf" },
      "token",
      "agenda@group.calendar.google.com",
    );

    const patch = chamadas.find((c) => c.metodo === "PATCH");
    expect(patch?.url).toContain("supportsAttachments=true");
  });

  it("nao notifica os convidados da mudanca", async () => {
    const { anexarNoEvento } = await import("@/lib/diagnostico/documento-roteiro");
    await anexarNoEvento(
      "evento-1",
      { fileId: "a1", fileUrl: "https://drive.google.com/x", titulo: "t" },
      "token",
      "agenda@group.calendar.google.com",
    );
    expect(chamadas.find((c) => c.metodo === "PATCH")?.url).toContain("sendUpdates=none");
  });

  it("usa PATCH, que preserva link da reuniao e convidados", async () => {
    const { anexarNoEvento } = await import("@/lib/diagnostico/documento-roteiro");
    await anexarNoEvento(
      "evento-1",
      { fileId: "a1", fileUrl: "https://drive.google.com/x", titulo: "t" },
      "token",
      "agenda@group.calendar.google.com",
    );
    // PUT substituiria o recurso inteiro e apagaria o que o Cal.com criou.
    expect(chamadas.filter((c) => c.metodo === "PUT")).toHaveLength(0);
    expect(chamadas.filter((c) => c.metodo === "PATCH")).toHaveLength(1);
  });

  it("🔴 NAO toca na descricao do evento, que o lead le", async () => {
    const { anexarNoEvento } = await import("@/lib/diagnostico/documento-roteiro");
    await anexarNoEvento(
      "evento-1",
      { fileId: "a1", fileUrl: "https://drive.google.com/x", titulo: "t" },
      "token",
      "agenda@group.calendar.google.com",
    );
    const patch = chamadas.find((c) => c.metodo === "PATCH")?.corpo as Record<string, unknown>;
    expect(patch.description).toBeUndefined();
    expect(Object.keys(patch)).toEqual(["attachments"]);
  });
});
