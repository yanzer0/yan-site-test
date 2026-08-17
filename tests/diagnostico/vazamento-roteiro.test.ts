/**
 * O roteiro NÃO pode chegar ao lead. Este é o teste que trava isso.
 *
 * O que aconteceu em 17/08: a primeira versão escrevia o andaime na descrição
 * do evento que o Cal.com cria, e o lead é convidado desse evento. Verificado
 * na documentação oficial do Google:
 *
 *   "private" - The event is private and only event attendees may view event
 *   details.
 *
 * Ou seja, `private` esconde de quem NÃO é convidado. O convidado sempre vê a
 * descrição, e não existe campo que esconda dela só ele. O prospect leria
 * "revela trauma e o que NÃO propor" e "a resposta DELE é o fechamento" na
 * agenda dele.
 *
 * Não deu erro em lugar nenhum. Funcionou perfeitamente, no evento errado.
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

beforeEach(() => {
  chamadas.length = 0;
  process.env.GOOGLE_CALENDAR_ID = "agenda-infuser@group.calendar.google.com";
  process.env.GOOGLE_SERVICE_ACCOUNT_B64 = Buffer.from(
    JSON.stringify({ client_email: "sa@teste.iam.gserviceaccount.com", private_key: "chave" }),
  ).toString("base64");

  vi.stubGlobal("fetch", (url: string | URL, opcoes: RequestInit = {}) => {
    const alvo = String(url);
    chamadas.push({
      url: alvo,
      metodo: opcoes.method ?? "GET",
      corpo: opcoes.body ? JSON.parse(String(opcoes.body)) : null,
    });
    const vazio = alvo.includes("/events?") && (opcoes.method ?? "GET") === "GET";
    return Promise.resolve(
      new Response(JSON.stringify(vazio ? { items: [] } : { id: "evento-do-roteiro" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

async function publicar() {
  const { publicarRoteiro } = await import("@/lib/diagnostico/agenda-google");
  return publicarRoteiro({
    bookingId: "booking-abc",
    nomeDoLead: "Ricardo Alves",
    inicioEm: new Date("2026-08-21T15:00:00.000Z"),
    descricao: "<b>FRAME</b><br>Cala depois do ta certo.",
  });
}

describe("o roteiro nao encosta no evento da call", () => {
  it("cria um evento NOVO em vez de editar o do Cal.com", async () => {
    await publicar();
    const escritas = chamadas.filter((c) => c.metodo !== "GET");
    expect(escritas).toHaveLength(1);
    expect(escritas[0].metodo).toBe("POST");
  });

  it("nunca faz PATCH num evento que a rotina nao criou", async () => {
    await publicar();
    // Um PATCH sem POST antes significaria estar editando evento de terceiro.
    const patches = chamadas.filter((c) => c.metodo === "PATCH");
    expect(patches).toHaveLength(0);
  });

  it("🔴 o evento do roteiro NAO tem convidado nenhum", async () => {
    await publicar();
    const corpo = chamadas.find((c) => c.metodo === "POST")?.corpo as Record<string, unknown>;
    expect(corpo.attendees).toBeUndefined();
  });

  it("nao dispara convite para ninguem", async () => {
    await publicar();
    expect(chamadas.find((c) => c.metodo === "POST")?.url).toContain("sendUpdates=none");
  });

  it("marca o evento como privado", async () => {
    await publicar();
    const corpo = chamadas.find((c) => c.metodo === "POST")?.corpo as Record<string, unknown>;
    expect(corpo.visibility).toBe("private");
  });

  it("nao ocupa o horario, que ja e da call", async () => {
    await publicar();
    const corpo = chamadas.find((c) => c.metodo === "POST")?.corpo as Record<string, unknown>;
    expect(corpo.transparency).toBe("transparent");
  });

  it("nao dispara lembrete, que seria barulho duplicado", async () => {
    await publicar();
    const corpo = chamadas.find((c) => c.metodo === "POST")?.corpo as Record<string, unknown>;
    expect(corpo.reminders).toEqual({ useDefault: false, overrides: [] });
  });

  it("carrega a chave do booking, para se achar de novo sem depender do titulo", async () => {
    await publicar();
    const corpo = chamadas.find((c) => c.metodo === "POST")?.corpo as {
      extendedProperties?: { private?: Record<string, string> };
    };
    expect(corpo.extendedProperties?.private?.infuserRoteiro).toBe("roteiro-booking-abc");
  });

  it("procura por extendedProperty antes de criar, e nao por titulo", async () => {
    await publicar();
    const busca = chamadas.find((c) => c.metodo === "GET");
    expect(busca?.url).toContain("privateExtendedProperty=infuserRoteiro%3Droteiro-booking-abc");
  });
});

describe("reprocessar nao enche a agenda de duplicata", () => {
  it("atualiza o evento existente em vez de criar outro", async () => {
    vi.stubGlobal("fetch", (url: string | URL, opcoes: RequestInit = {}) => {
      const alvo = String(url);
      const metodo = opcoes.method ?? "GET";
      chamadas.push({ url: alvo, metodo, corpo: opcoes.body ? JSON.parse(String(opcoes.body)) : null });
      // Desta vez a busca ACHA um evento de roteiro anterior.
      const corpo = alvo.includes("/events?") && metodo === "GET" ? { items: [{ id: "ja-existe" }] } : { id: "ja-existe" };
      return Promise.resolve(
        new Response(JSON.stringify(corpo), { status: 200, headers: { "content-type": "application/json" } }),
      );
    });

    const id = await publicar();
    expect(id).toBe("ja-existe");
    expect(chamadas.filter((c) => c.metodo === "POST")).toHaveLength(0);
    expect(chamadas.filter((c) => c.metodo === "PATCH")).toHaveLength(1);
  });
});
