import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GET as getInstall } from "@/app/instalar/route";
import { GET as getGuideScript } from "@/app/instalar/guide.js/route";
import { GET as getActivation, POST as postActivation } from "@/app/instalar/ativar/route";
import { GET as getDownload } from "@/app/instalar/download/route";
import { POST as postResend } from "@/app/instalar/reenviar/route";

const publicDir = join(process.cwd(), "public", "instalar");
const privateDir = join(process.cwd(), "private", "instalar");
const originalOrigin = process.env.SECOND_BRAIN_ACCESS_ORIGIN;

afterEach(() => {
  vi.unstubAllGlobals();
  if (originalOrigin === undefined) delete process.env.SECOND_BRAIN_ACCESS_ORIGIN;
  else process.env.SECOND_BRAIN_ACCESS_ORIGIN = originalOrigin;
});

function request(path: string, init?: RequestInit) {
  return new Request(`https://useinfuser.com${path}`, init);
}

describe("fachada protegida do Segundo Cérebro", () => {
  it("mostra a tela de acesso sem revelar o wizard quando não há sessão", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status: 401 })));
    const response = await getInstall(request("/instalar"));
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("content-security-policy")).toContain("form-action 'self'");
    expect(html).toContain("Acesse seu Segundo Cérebro");
    expect(html).toContain("E-mail usado na compra");
    expect(html).not.toContain("Qual é o seu sistema?");
    expect(html).not.toContain("Baixar o Segundo Cérebro");
  });

  it("serve o wizard privado somente após o MCP confirmar a sessão", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status: 204 })));
    const response = await getInstall(request("/instalar", { headers: { cookie: "second_brain_access=session" } }));
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html).toContain("Instale seu Segundo Cérebro");
    expect(html).toContain("Qual é o seu sistema?");
    expect(html).toContain('/instalar/guide.js?v=20260911-1');
  });

  it("falha fechado quando o MCP não responde", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("offline"); }));
    const response = await getInstall(request("/instalar"));
    const html = await response.text();

    expect(response.status).toBe(503);
    expect(html).toContain("Acesso temporariamente");
    expect(html).not.toContain("Qual é o seu sistema?");
  });

  it("protege o JavaScript que contém as etapas", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status: 401 })));
    expect((await getGuideScript(request("/instalar/guide.js"))).status).toBe(401);

    vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status: 204 })));
    const allowed = await getGuideScript(request("/instalar/guide.js", { headers: { cookie: "second_brain_access=session" } }));
    expect(allowed.status).toBe(200);
    expect(await allowed.text()).toContain("instala meu segundo cérebro");
  });

  it("repassa ativação, cookie e redirect apenas pelos headers permitidos", async () => {
    const upstreamFetch = vi.fn(async () => new Response("", {
      status: 303,
      headers: {
        location: "/instalar",
        "set-cookie": "second_brain_access=session; Path=/instalar; HttpOnly",
        "x-internal-debug": "must-not-cross",
      },
    }));
    vi.stubGlobal("fetch", upstreamFetch);
    const response = await postActivation(request("/instalar/ativar", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ code: "act_test" }),
    }));

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/instalar");
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
    expect(response.headers.get("x-internal-debug")).toBeNull();
    const call = upstreamFetch.mock.calls[0];
    expect(String(call?.[0])).toBe("https://mcp.useinfuser.com/second-brain/activate");
  });

  it("encaminha somente o código esperado no GET de ativação", async () => {
    const upstreamFetch = vi.fn(async () => new Response("confirm", { status: 200 }));
    vi.stubGlobal("fetch", upstreamFetch);
    await getActivation(request("/instalar/ativar?code=act_safe&debug=secret"));
    expect(String(upstreamFetch.mock.calls[0]?.[0])).toBe(
      "https://mcp.useinfuser.com/second-brain/activate?code=act_safe",
    );
  });

  it("preserva o ZIP binário autorizado e nega o download anônimo", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status: 401 })));
    expect((await getDownload(request("/instalar/download"))).status).toBe(401);

    const bytes = Uint8Array.from([80, 75, 3, 4, 1, 2, 3]);
    vi.stubGlobal("fetch", vi.fn(async () => new Response(bytes, {
      status: 200,
      headers: {
        "content-type": "application/zip",
        "content-disposition": 'attachment; filename="segundo-cerebro-autonomo.zip"',
      },
    })));
    const response = await getDownload(request("/instalar/download", { headers: { cookie: "second_brain_access=session" } }));
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/zip");
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(bytes);
  });

  it("limita os corpos enviados ao upstream", async () => {
    vi.stubGlobal("fetch", vi.fn());
    const response = await postResend(request("/instalar/reenviar", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: `email=${"a".repeat(20_000)}`,
    }));
    expect(response.status).toBe(413);
  });

  it("mantém os ativos sensíveis fora de public e preserva os ativos visuais", () => {
    expect(existsSync(join(publicDir, "index.html"))).toBe(false);
    expect(existsSync(join(publicDir, "guide.js"))).toBe(false);
    expect(existsSync(join(publicDir, "assets/downloads/segundo-cerebro-autonomo.zip"))).toBe(false);
    expect(existsSync(join(privateDir, "index.html"))).toBe(true);
    expect(existsSync(join(privateDir, "guide.js"))).toBe(true);
    expect(statSync(join(publicDir, "assets/brands/segundo-cerebro-autonomo-premium.webp")).size).toBeGreaterThan(10_000);
    const script = readFileSync(join(privateDir, "guide.js"), "utf-8");
    expect(script).toContain('"/instalar/download"');
    expect(script).not.toContain("assets/downloads/segundo-cerebro-autonomo.zip");
  });

  it("remove conclusões futuras quando o usuário volta um passo", () => {
    const script = readFileSync(join(privateDir, "guide.js"), "utf-8");
    expect(script).toContain("state.completed = state.completed.filter((index) => index < targetStep)");
  });
});
