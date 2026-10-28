import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { GUIAS, destinoDoGuia, guiaPorCaminho, guiaPorSlug } from "@/lib/guias/catalogo";
import { documentoAcesso, documentoBiblioteca } from "@/lib/guias/documentos";
import { GET as abrirSublink } from "@/app/guias/[slug]/route";
import { GET as abrirFormulario } from "@/app/guias/acesso/route";
import { NextRequest } from "next/server";

describe("inventário público de guias", () => {
  it("exige um catálogo explícito antes de servir os materiais", () => {
    expect(existsSync(resolve("src/lib/guias/catalogo.ts"))).toBe(true);
  });
  it("não deixa arquivos diretos fora da proteção do middleware", () => {
    expect(readFileSync(resolve("src/middleware.ts"), "utf8")).toContain("protegerGuia");
  });
  it("inclui exatamente os dezesseis HTMLs gratuitos presentes no código", () => {
    const arquivos = readdirSync(resolve("public")).filter((name) => /^(?:guia-|opus|agente-que-aprende|protocolo-de-autoria|tutorial-maestri).*\.html$/.test(name));
    expect(GUIAS).toHaveLength(16);
    expect(GUIAS.map((guia) => guia.arquivo).sort()).toEqual(arquivos.sort());
    expect(new Set(GUIAS.map((guia) => guia.slug)).size).toBe(16);
  });
  it("todos os aliases de route handlers estão no mesmo catálogo", () => {
    for (const entry of readdirSync(resolve("src/app"), { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const rota = resolve("src/app", entry.name, "route.ts");
      if (!existsSync(rota)) continue;
      const codigo = readFileSync(rota, "utf8");
      for (const guia of GUIAS) if (codigo.includes(`"${guia.arquivo}"`)) expect(guiaPorCaminho(`/${entry.name}`)?.slug).toBe(guia.slug);
    }
  });
  it("gera biblioteca sem analytics e formulário com seis campos obrigatórios", () => {
    const biblioteca = documentoBiblioteca();
    for (const guia of GUIAS) expect(biblioteca).toContain(`/guias/${guia.slug}`);
    expect(biblioteca).toContain("/guias/guias.css");
    expect(biblioteca).not.toMatch(/googletagmanager|utmify|clarity|facebook\.net/);
    const formulario = documentoAcesso(guiaPorSlug("skills"), 'https://example.com/\"><script>');
    expect(formulario).toContain("Crie skills");
    expect(formulario).not.toContain('https://example.com/\"><script>');
    for (const campo of ["nome", "email", "whatsapp", "nicho", "interesse", "impedimento"]) expect(formulario).toMatch(new RegExp(`(?:input|textarea)[^>]*name="${campo}"[^>]*required`));
    expect(formulario).toContain('lang="pt-BR"');
    expect(formulario).toContain('charset="utf-8"');
  });
  it("sublink resolve somente para o material esperado", async () => {
    const req = new NextRequest("https://useinfuser.com/guias/skills");
    expect((await abrirSublink(req, { params: Promise.resolve({ slug: "skills" }) })).headers.get("location")).toBe("https://useinfuser.com/guia-skill");
    expect((await abrirSublink(req, { params: Promise.resolve({ slug: "desconhecido" }) })).status).toBe(404);
    expect(destinoDoGuia("//golpe.example")).toBeUndefined();
    expect(destinoDoGuia("https://golpe.example")).toBeUndefined();
    expect(destinoDoGuia({ slug: "skills" })).toBeUndefined();
    expect(guiaPorCaminho("/%E0%A4%A")).toBeUndefined();
  });
  it("o formulário não aceita guia arbitrário nem expõe campos na URL", async () => {
    const invalido = abrirFormulario(new NextRequest("https://useinfuser.com/guias/acesso?guia=https://golpe.example"));
    expect(invalido.status).toBe(404);
    const valido = abrirFormulario(new NextRequest("https://useinfuser.com/guias/acesso?guia=skills"));
    expect(valido.status).toBe(200);
    expect(valido.headers.get("cache-control")).toContain("no-store");
    expect(valido.headers.get("content-security-policy")).toContain("connect-src 'self'");
  });
});
