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
  it("reúne somente as vinte e cinco entregas públicas confirmadas", () => {
    expect(CATALOGO_CENTRAL).toHaveLength(25); expect(GUIAS).toHaveLength(16);
    expect(CATALOGO_CENTRAL.filter((item) => item.estado === "Gratuito")).toHaveLength(20);
    expect(CATALOGO_CENTRAL.filter((item) => item.estado === "Premium").map((item) => item.caminho)).toEqual(["/legiao", "/kit-segundo-cerebro", "/kit-skills", "/kit-jarvis"]);
    expect(CATALOGO_CENTRAL.find((item) => item.slug === "kit-vscode")).toMatchObject({ estado: "Gratuito", tipo: "Kit", caminho: "/kit-vscode" });
    expect(CATALOGO_CENTRAL.find((item) => item.slug === "painel-os")).toMatchObject({ estado: "Em breve", tipo: "SaaS" });
    expect(CATALOGO_CENTRAL.find((item) => item.slug === "painel-os")).not.toHaveProperty("caminho");
    expect(CATALOGO_CENTRAL.every((item) => item.estado === "Em breve" || /^\/(?!\/)/.test(item.caminho ?? ""))).toBe(true);
    expect(JSON.stringify(CATALOGO_CENTRAL)).not.toMatch(/R\$|US\$|\/painel\/signup|\/mc|\/admin|\/instalar|Starter|Business|Pergaminho/);
  });
  it("renderiza tipos, estados e filtros sem um botão para o SaaS", () => {
    const html = documentoBiblioteca(); expect(html).toContain("Central Infuser");
    for (const grupo of ["guias", "recursos", "premium", "em-breve"]) expect(html).toContain(`data-filtro="${grupo}"`);
    expect(html.match(/data-guia /g)).toHaveLength(25); expect(html).toContain("25 itens · 20 gratuitos");
    expect(html).not.toContain('href="/central/painel-os"'); expect(html).not.toContain("/painel/signup");
    expect(html).toContain("Premium"); expect(html).toContain("Em breve");
    const css = readFileSync("public/guias/guias.css", "utf8");
    expect(css).toContain("display:flex;flex-wrap:wrap"); expect(css).toContain("flex:1 1 calc((100% - 32px)/3)"); expect(css).toContain(".guide-grid>.guide-card:first-child{flex-basis:100%}");
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
