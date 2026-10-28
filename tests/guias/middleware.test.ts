import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { config, middleware } from "@/middleware";
import { GUIAS } from "@/lib/guias/catalogo";
import { COOKIE_GUIAS, criarSessaoGuias } from "@/lib/guias/sessao";

beforeEach(() => { process.env.GUIAS_ACCESS_SECRET = "guia-teste-assinatura-".repeat(3); });
afterEach(() => { delete process.env.GUIAS_ACCESS_SECRET; delete process.env.DEMO_MARJA_USER; delete process.env.DEMO_MARJA_PASS; });

describe("todas as portas de acesso dos guias", () => {
  for (const guia of GUIAS) {
    for (const caminho of [guia.caminho, ...guia.aliases, `/${guia.arquivo}`, `/guias/${guia.slug}`]) {
      it(`bloqueia ${caminho} sem cadastro`, async () => {
        expect(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url: `https://useinfuser.com${caminho}` })).toBe(true);
        const response = await middleware(new NextRequest(`https://useinfuser.com${caminho}`));
        expect(response.status).toBe(307);
        const location = new URL(response.headers.get("location")!);
        expect(location.pathname).toBe("/guias/acesso");
        expect(location.searchParams.get("guia")).toBe(guia.slug);
        expect(response.headers.get("cache-control")).toContain("no-store");
      });
    }
  }
  it("central também exige cadastro e ignora query de redirect externa", async () => {
    const response = await middleware(new NextRequest("https://useinfuser.com/guias?url=https://golpe.example"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://useinfuser.com/guias/acesso");
  });
  it("não usa host interno do Next nem host arbitrário como destino", async () => {
    const publico = await middleware(new NextRequest("https://localhost:3000/guias", { headers: { host: "www.useinfuser.com" } }));
    expect(publico.headers.get("location")).toBe("https://www.useinfuser.com/guias/acesso");
    const externo = await middleware(new NextRequest("https://golpe.example/guias", { headers: { host: "golpe.example" } }));
    expect(externo.headers.get("location")).toBe("https://useinfuser.com/guias/acesso");
  });
  it("libera central e material com cookie válido sem cache compartilhado", async () => {
    const token = await criarSessaoGuias("02822f74-afbf-4c03-ae54-09bca59889e8");
    for (const caminho of ["/guias", "/guia-agentes.html", "/guias/skills", "/guiamotion"]) {
      const response = await middleware(new NextRequest(`https://useinfuser.com${caminho}`, { headers: { cookie: `${COOKIE_GUIAS}=${token}` } }));
      expect(response.status).toBe(200);
      expect(response.headers.get("x-middleware-next")).toBe("1");
      expect(response.headers.get("vary")).toContain("Cookie");
    }
  });
  it("cookie falso não libera e segredo ausente retorna 503", async () => {
    const req = new NextRequest("https://useinfuser.com/guia-agentes", { headers: { cookie: `${COOKIE_GUIAS}=forjado` } });
    expect((await middleware(req)).status).toBe(307);
    delete process.env.GUIAS_ACCESS_SECRET;
    expect((await middleware(req)).status).toBe(503);
  });
  it("formulário e assets locais continuam acessíveis antes do cadastro", async () => {
    for (const caminho of ["/guias/acesso", "/guias/guias.css", "/guias/guias.js", "/guias/logo.svg"]) expect((await middleware(new NextRequest(`https://useinfuser.com${caminho}`))).status).toBe(200);
  });
  it("preserva desafio da demo e CSP do painel sem depender de guias", async () => {
    delete process.env.GUIAS_ACCESS_SECRET;
    process.env.DEMO_MARJA_USER = "teste"; process.env.DEMO_MARJA_PASS = "senha-sintetica";
    const demo = await middleware(new NextRequest("https://useinfuser.com/demomarja.html"));
    expect(demo.status).toBe(401);
    expect(demo.headers.get("www-authenticate")).toContain("Basic");
    const painel = await middleware(new NextRequest("https://useinfuser.com/leads/guias"));
    expect(painel.status).toBe(200);
    expect(painel.headers.get("content-security-policy")).toContain("frame-ancestors 'none'");
    expect(painel.headers.get("content-security-policy")).toContain("nonce-");
  });
});
