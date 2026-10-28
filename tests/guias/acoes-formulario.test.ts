import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { documentoAcesso, documentoPreferencias, documentoBiblioteca } from "@/lib/guias/documentos";
import { GUIAS } from "@/lib/guias/catalogo";

function formulario({ valido = true, comercial = true, publicidade = true, preferencias = false, falha = false } = {}) {
  const primary = { disabled: false, dataset: { consentAction: "confirm" }, firstElementChild: { textContent: preferencias ? "Salvar preferências" : "Confirmar escolhas e acessar" } };
  const decline = { disabled: false, dataset: { consentAction: "decline" }, firstElementChild: { textContent: "Continuar sem marketing" } };
  const buttons = preferencias ? [primary] : [primary, decline];
  const summary = { hidden: true, textContent: "", focus: vi.fn() };
  let submit: (event: unknown) => Promise<void> = async () => {};
  const form = {
    id: preferencias ? "preferencias-guias" : "acesso-guias", action: "/api/guias/acesso",
    reportValidity: vi.fn(() => valido), addEventListener: (_: string, callback: typeof submit) => { submit = callback; },
    querySelectorAll: (selector: string) => selector === 'button[type="submit"]' ? buttons : [], querySelector: () => null,
    elements: { namedItem: (name: string) => ({ checked: name === "consent_comercial" ? comercial : publicidade }) },
  };
  const marketing = vi.fn(() => ({ navegador: { idioma: "pt-BR" } }));
  const assign = vi.fn();
  let liberar: (value: unknown) => void = () => {};
  const fetch = vi.fn((_input: string, _init: { body: string }) => new Promise((resolve) => { liberar = resolve; }));
  const context = {
    document: { getElementById: (id: string) => id === form.id ? form : id === "enviar-cadastro" ? primary : id === "erro-formulario" ? summary : null },
    window: { infuserGuiasMarketing: marketing, infuserGuiasPreferenciasAlteradas: vi.fn(), location: { assign } },
    FormData: class { *[Symbol.iterator]() { yield* Object.entries({ nome: "Teste", email: "teste@example.com", whatsapp: "11999999999", nicho: "Teste", interesse: "Testar IA", impedimento: "Falta tempo", consent_comercial: "on", consent_publicidade: "on" }); } },
    fetch, AbortController, setTimeout: () => 1, clearTimeout: () => {}, HTMLElement: class {},
  };
  runInNewContext(readFileSync("public/guias/guias.js", "utf8"), context);
  const enviar = (submitter?: unknown) => submit({ preventDefault: () => {}, submitter });
  const concluir = () => liberar({ ok: !falha, json: async () => falha ? { erro: "Tente novamente." } : { destino: "/central" } });
  return { primary, decline, buttons, form, marketing, assign, fetch, enviar, concluir, summary };
}

describe("ações explícitas do cadastro", () => {
  it("cadastro inicia marcado e preferências revogadas continuam falsas", () => {
    const signup = documentoAcesso(undefined, "direto"), preferencias = documentoPreferencias({ comercial: false, publicidade: false }, false);
    for (const nome of ["consent_comercial", "consent_publicidade"]) {
      expect(signup).toMatch(new RegExp(`name="${nome}"[^>]*checked`));
      expect(preferencias).not.toMatch(new RegExp(`name="${nome}"[^>]*checked`));
    }
    expect(signup).toContain("Confirmar escolhas e acessar"); expect(signup).toContain("Continuar sem marketing");
    for (const nome of ["nome", "email", "whatsapp", "nicho", "interesse", "impedimento"]) expect(signup).toMatch(new RegExp(`(?:input|textarea)[^>]*name="${nome}"[^>]*required`));
  });
  it("confirma somente os valores atuais das opções e bloqueia ambos durante o envio", async () => {
    const f = formulario({ comercial: false, publicidade: true }); const envio = f.enviar(f.primary);
    expect(f.buttons.every((button) => button.disabled)).toBe(true);
    const payload = JSON.parse(f.fetch.mock.calls[0][1].body);
    expect(payload.consentimentos).toEqual({ comercial: false, publicidade: true }); expect(payload.marketing).toEqual({ navegador: { idioma: "pt-BR" } });
    f.concluir(); await envio; expect(f.assign).toHaveBeenCalledWith("/central");
  });
  it.each(["decline", "missing", "unknown"])("%s não autoriza os defaults nem coleta enriquecimento", async (acao) => {
    const f = formulario(); const submitter = acao === "decline" ? f.decline : acao === "unknown" ? { dataset: { consentAction: "confirm" } } : undefined;
    const envio = f.enviar(submitter); const payload = JSON.parse(f.fetch.mock.calls[0][1].body);
    expect(payload.consentimentos).toEqual({ comercial: false, publicidade: false }); expect(payload).not.toHaveProperty("marketing"); expect(f.marketing).not.toHaveBeenCalled();
    expect(payload).not.toHaveProperty("consent_publicidade"); f.concluir(); await envio;
  });
  it.each(["primary", "decline"])("%s mantém a validação dos seis campos", async (acao) => {
    const f = formulario({ valido: false }); await f.enviar(acao === "primary" ? f.primary : f.decline);
    expect(f.form.reportValidity).toHaveBeenCalled(); expect(f.fetch).not.toHaveBeenCalled(); expect(f.buttons.every((button) => !button.disabled)).toBe(true);
  });
  it("falha restaura os dois botões e seus rótulos", async () => {
    const f = formulario({ falha: true }); const envio = f.enviar(f.decline); f.concluir(); await envio;
    expect(f.buttons.every((button) => !button.disabled)).toBe(true);
    expect(f.primary.firstElementChild.textContent).toBe("Confirmar escolhas e acessar"); expect(f.decline.firstElementChild.textContent).toBe("Continuar sem marketing"); expect(f.summary.hidden).toBe(false);
  });
  it("preferências confirmam o estado salvo sem aplicar defaults novos", async () => {
    const f = formulario({ preferencias: true, comercial: false, publicidade: false }); const envio = f.enviar(f.primary);
    expect(JSON.parse(f.fetch.mock.calls[0][1].body).consentimentos).toEqual({ comercial: false, publicidade: false }); f.concluir(); await envio;
  });
  it("destaque ocupa a grade toda e preserva os dezesseis links e a ordem", () => {
    const css = readFileSync("public/guias/guias.css", "utf8"), html = documentoBiblioteca();
    expect(css).toContain(".guide-grid>.guide-card:first-child{flex-basis:100%}"); expect(css).toContain("display:flex;flex-wrap:wrap"); expect(css).not.toMatch(/grid-column:span [12]/);
    expect(GUIAS).toHaveLength(16); const indices = GUIAS.map((guia) => html.indexOf(`href="/guias/${guia.slug}"`));
    expect(indices.every((index) => index >= 0)).toBe(true); expect(indices).toEqual([...indices].sort((a,b) => a-b));
  });
});
