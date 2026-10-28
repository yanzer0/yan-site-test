import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { CATALOGO_CENTRAL, GUIAS, RECURSOS_CENTRAL, alvoDeAcesso, destinoDoGuia } from "@/lib/guias/catalogo";
import { documentoAcesso, documentoBiblioteca, documentoRecurso } from "@/lib/guias/documentos";
import { validarCadastroGuia } from "@/lib/guias/captura";
import { config, middleware } from "@/middleware";
import { readFileSync } from "node:fs";

beforeEach(() => { process.env.GUIAS_ACCESS_SECRET = "segredo-sintetico-central-catalogo-".repeat(2); });
afterEach(() => { delete process.env.GUIAS_ACCESS_SECRET; });
describe("Central Infuser", () => {
  it("reúne somente as vinte e oito entregas públicas confirmadas", () => {
    expect(CATALOGO_CENTRAL).toHaveLength(28); expect(GUIAS).toHaveLength(16);
    expect(CATALOGO_CENTRAL.filter((item) => item.estado === "Gratuito")).toHaveLength(20);
    expect(CATALOGO_CENTRAL.filter((item) => item.estado === "Premium").map((item) => item.caminho)).toEqual(["/legiao", "/kit-segundo-cerebro", "/kit-skills", "/kit-jarvis", "https://pay.hotmart.com/A108157970A", "/kit-segundo-cerebro", "https://pay.hotmart.com/O108099140A?off=bmb50jm3&checkoutMode=10"]);
    expect(CATALOGO_CENTRAL.find((item) => item.slug === "kit-vscode")).toMatchObject({ estado: "Gratuito", tipo: "Kit", caminho: "/kit-vscode" });
    expect(CATALOGO_CENTRAL.find((item) => item.slug === "painel-os")).toMatchObject({ estado: "Em breve", tipo: "SaaS" });
    expect(CATALOGO_CENTRAL.find((item) => item.slug === "painel-os")).not.toHaveProperty("caminho");
    expect(CATALOGO_CENTRAL.every((item) => item.estado === "Em breve" || /^\/(?!\/)/.test(item.caminho ?? "") || /^https:\/\/pay\.hotmart\.com\//.test(item.caminho ?? ""))).toBe(true);
    expect(JSON.stringify(CATALOGO_CENTRAL)).not.toMatch(/R\$|US\$|\/painel\/signup|\/mc|\/admin|\/instalar|Starter|Business/);
  });
  it("renderiza tipos, estados e filtros sem um botão para o SaaS", () => {
    const html = documentoBiblioteca(); expect(html).toContain("Central Infuser");
    for (const grupo of ["guias", "recursos", "premium", "em-breve"]) expect(html).toContain(`data-filtro="${grupo}"`);
    expect(html.match(/data-guia /g)).toHaveLength(28); expect(html).toContain("28 itens · 20 gratuitos");
    expect(html).not.toContain('href="/central/painel-os"'); expect(html).not.toContain("/painel/signup");
    expect(html).toContain("Premium"); expect(html).toContain("Em breve");
    const css = readFileSync("public/guias/guias.css", "utf8");
    expect(css).toContain("display:flex;flex-wrap:wrap"); expect(css).toContain("flex:1 1 calc((100% - 32px)/3)"); expect(css).toContain(".guide-grid>.guide-card:first-child{flex-basis:100%}");
  });
  it("distingue a compra do Estúdio dos complementos ligados à oferta base", () => {
    expect(CATALOGO_CENTRAL.find((item) => item.slug === "estudio-criacao")).toMatchObject({ estado: "Premium", acao: "Comprar Estúdio", caminho: "https://pay.hotmart.com/A108157970A" });
    expect(CATALOGO_CENTRAL.find((item) => item.slug === "segundo-cerebro-premium")).toMatchObject({ relacao: "Upgrade do Kit base", acao: "Conhecer o Kit base", caminho: "/kit-segundo-cerebro" });
    expect(CATALOGO_CENTRAL.find((item) => item.slug === "pergaminho")).toMatchObject({ relacao: "Complemento opcional do Kit", acao: "Ver oferta com complementos", caminho: "https://pay.hotmart.com/O108099140A?off=bmb50jm3&checkoutMode=10" });
    const html = documentoBiblioteca();
    expect(html).toContain("Upgrade do Kit base"); expect(html).toContain("Complemento opcional do Kit");
    expect(html).toContain('href="https://pay.hotmart.com/O108099140A?off=bmb50jm3&amp;checkoutMode=10"');
  });
  it("usa um link nativo por card inteiro e mantém Em breve não interativo", () => {
    const html = documentoBiblioteca();
    const cards = [...html.matchAll(/<(a|article) class="guide-card [^"]*"([^>]*)>([\s\S]*?)<\/\1>/g)];
    expect(cards).toHaveLength(CATALOGO_CENTRAL.length);
    cards.forEach(([_, tag, atributos, corpo], index) => {
      const item = CATALOGO_CENTRAL[index];
      expect(corpo).not.toMatch(/<a\b|<button\b|tabindex=/);
      expect(corpo).toMatch(/<h3>[^<]+<\/h3>/);
      if (item.caminho) {
        expect(tag).toBe("a"); expect(atributos).toContain(`href="${item.caminho.replace(/&/g, "&amp;")}"`);
        expect(atributos).toContain("aria-label="); expect(corpo).toContain('<span class="card-link" aria-hidden="true">');
      } else {
        expect(tag).toBe("article"); expect(atributos).not.toContain("href="); expect(corpo).not.toContain('class="card-link"');
      }
    });
  });
  it("cadastro mantém requisitos e encaminha material específico ou Central", () => {
    expect(destinoDoGuia("")).toBe("/central"); expect(destinoDoGuia("https://evil.example")).toBeUndefined();
    for (const slug of ["kit-vscode", ...RECURSOS_CENTRAL.map((r) => r.slug)]) {
      const alvo = alvoDeAcesso(slug)!;
      expect(alvo).toBeDefined(); expect(destinoDoGuia(slug)).toBe(alvo.caminho);
      const html = documentoAcesso(alvo, "direto"); expect(html).toContain(alvo.titulo);
      for (const campo of ["nome", "email", "whatsapp", "nicho", "interesse", "impedimento"]) expect(html).toMatch(new RegExp(`(?:input|textarea)[^>]*name="${campo}"[^>]*required`));
      const dados = { nome: "Teste", email: "teste@example.com", whatsapp: "11999999999", nicho: "Teste", interesse: "Testar IA", impedimento: "Falta tempo", guia: slug };
      expect(validarCadastroGuia(dados)).toMatchObject({ ok: true, destino: alvo.caminho });
      expect(validarCadastroGuia({ ...dados, email: "" }).ok).toBe(false);
    }
  });
  for (const caminho of ["/central", "/kit-vscode", ...RECURSOS_CENTRAL.flatMap((r) => [`/central/recursos/${r.slug}`, `/central/baixar/${r.slug}`])]) {
    it(`protege ${caminho}`, async () => {
      expect(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url: `https://useinfuser.com${caminho}` })).toBe(true);
      const r = await middleware(new NextRequest(`https://useinfuser.com${caminho}`)); expect(r.status).toBe(307);
      expect(new URL(r.headers.get("location")!).pathname).toBe("/guias/acesso");
    });
  }
  it("detalhes descrevem requisitos e levam apenas ao download próprio", () => {
    for (const recurso of RECURSOS_CENTRAL) {
      const html = documentoRecurso(recurso); expect(html).toContain(`/central/baixar/${recurso.slug}`);
      for (const requisito of recurso.requisitos) expect(html).toContain(requisito);
      expect(html).not.toContain("drive.google.com"); expect(html).not.toContain("C:\\Users");
    }
  });
});
