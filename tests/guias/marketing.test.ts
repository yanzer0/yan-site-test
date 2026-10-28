import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { GUIAS } from "@/lib/guias/catalogo";
import { campanhaPermitida } from "@/lib/guias/atribuicao";
import { coletarMetadados, consentimentosGuias, ipPublico, localizarIp } from "@/lib/guias/marketing";
import { csvLeadsGuias, type LeadGuia } from "@/lib/guias/db";

const geo = { country_code: "BR", city: "São Paulo", region: "São Paulo", latitude: "-23.55", longitude: "-46.63", accuracy: 20 };
beforeEach(() => { vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(geo), { headers: { "content-type": "application/json" } }))); });
afterEach(() => { vi.unstubAllGlobals(); });
const req = () => new NextRequest("https://useinfuser.com/api/guias/acesso", { headers: { "x-forwarded-for": "8.8.8.8", "user-agent": "test mobile", cookie: "_fbp=fb.1.123.456; _ga=GA1.2.3.4; infuser_painel=AUTH_SECRET; csrf=SECRET" } });
describe("marketing opcional dos guias", () => {
  it("sem opt-in descarta qualquer enriquecimento e não chama GeoJS", async () => {
    const dados = await coletarMetadados(req(), { navegador: { idioma: "pt-BR" }, campanha: { fbclid: "x" }, ip: "8.8.8.8", cookies: { csrf: "secret" } }, "skills", { comercial: false, publicidade: false });
    expect(dados.publicidade).toEqual({ status: "nao_autorizada" });
    expect(fetch).not.toHaveBeenCalled(); expect(JSON.stringify(dados)).not.toContain("AUTH_SECRET");
    expect(consentimentosGuias({ comercial: "true", publicidade: 1 })).toEqual({ comercial: false, publicidade: false });
  });
  it("coleta somente valores autorizados, com origem e localização estimada", async () => {
    const dados = await coletarMetadados(req(), { campanha: { utm_source: "instagram", fbclid: "click-123", email: "x@example.com", redirect: "https://evil.example" }, navegador: { idioma: "pt-BR", idiomas: ["pt-BR"], fuso: "America/Sao_Paulo", tela: { largura: 1920, altura: 1080 }, fingerprint: "NUNCA" }, landingUrl: "https://evil.example", referencia: "https://instagram.com/p/test?email=secret" }, "skills", { comercial: false, publicidade: true });
    expect(dados.publicidade.cookies).toEqual({ _fbp: "fb.1.123.456", _ga: "GA1.2.3.4" });
    expect(dados.publicidade.campanha).toEqual({ utm_source: "instagram", fbclid: "click-123" });
    expect(dados.publicidade.referencia).toBe("https://instagram.com/p/test");
    expect(dados.entrada.url).toBe("https://useinfuser.com/guias/skills");
    expect(dados.publicidade.localizacao).toMatchObject({ status: "disponivel", fonte: "GeoJS", estimada: true, pais: "BR", cidade: "São Paulo", precisaoKm: 20 });
    expect(fetch).toHaveBeenCalledWith("https://get.geojs.io/v1/ip/geo/8.8.8.8.json", expect.objectContaining({ redirect: "error", signal: expect.any(AbortSignal) }));
    expect(JSON.stringify(dados)).not.toMatch(/AUTH_SECRET|csrf|fingerprint|evil\.example/);
  });
  it.each(["127.0.0.1", "10.0.0.1", "192.168.1.1", "169.254.169.254", "::1", "fc00::1", "2001:db8::1", "https://evil.example"])("não consulta IP privado/inválido: %s", async (ip) => {
    expect(ipPublico(ip)).toBe(false); expect((await localizarIp(ip)).status).toBe("indisponivel"); expect(fetch).not.toHaveBeenCalled();
  });
  it("falha de provedor e coordenadas fora de intervalo ficam indisponíveis", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("offline"));
    expect(await localizarIp("8.8.8.8")).toMatchObject({ status: "indisponivel", motivo: "provedor_indisponivel" });
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ ...geo, latitude: "1000" })));
    const resultado = await localizarIp("8.8.8.8"); expect(resultado.status).toBe("indisponivel"); expect(resultado).not.toHaveProperty("latitude");
  });
  it("campanha é allowlist e não inclui parâmetros arbitrários", () => {
    expect(campanhaPermitida(new URLSearchParams("utm_source=instagram&email=secret%40example.com&next=https://evil.example&fbclid=abc-123"))).toEqual({ utm_source: "instagram", fbclid: "abc-123" });
  });
  it("exportações respeitam escolhas atuais e Meta contém só identificadores", () => {
    const lead: LeadGuia = { id: "id", nome: "Pessoa Teste", email: " TESTE@EXAMPLE.COM ", whatsapp: "+55 (11) 99999-9999", nicho: "NICHO_INTERNO", interesse: "INTERESSE_INTERNO", impedimento: "IMPEDIMENTO_INTERNO", guia: "skills", origem: "direto", criadoEm: new Date(), consentComercial: true, consentPublicidade: true, metadados: { entrada: { url: "/guias", guia: "skills" }, publicidade: { status: "autorizada", ip: "8.8.8.8", cookies: { _fbp: "COOKIE_INTERNO" }, localizacao: { status: "disponivel", fonte: "GeoJS", estimada: true, pais: "BR", cidade: "São Paulo", estado: "São Paulo" } } } };
    const meta = csvLeadsGuias([lead, { ...lead, id: "duplicado" }, { ...lead, email: "revogado@example.com", whatsapp: "5511888888888", consentPublicidade: false }], "meta");
    expect(meta.split("\r\n")).toHaveLength(2); expect(meta).toContain("teste@example.com");
    expect(meta).not.toMatch(/NICHO_INTERNO|INTERESSE_INTERNO|IMPEDIMENTO_INTERNO|COOKIE_INTERNO|8\.8\.8\.8|revogado@example/);
    expect(csvLeadsGuias([{ ...lead, consentComercial: false }], "comercial")).not.toContain("TESTE@EXAMPLE");
    expect(csvLeadsGuias([{ ...lead, consentPublicidade: false }], "meta")).not.toContain("teste@example");
    expect(csvLeadsGuias([lead], "todos")).toContain("INTERESSE_INTERNO");
    const revogado = { ...lead, consentComercial: false, consentPublicidade: false, consentAtualizadoEm: new Date(Date.now() + 1000) };
    expect(csvLeadsGuias([lead, revogado], "meta")).not.toContain("teste@example");
    expect(csvLeadsGuias([lead, revogado], "comercial")).not.toContain("TESTE@EXAMPLE");
  });
  it("cada guia tem um loader compartilhado e nenhum GTM incondicional", () => {
    for (const guia of GUIAS) {
      const html = readFileSync(`public/${guia.arquivo}`, "utf8");
      expect(html.match(/src="\/guias\/marketing\.js/g), guia.arquivo).toHaveLength(1);
      expect(html, guia.arquivo).not.toContain("etrthkooc.js");
    }
  });
  it("loader não carrega GTM na negativa e carrega uma vez após autorização", async () => {
    const codigo = readFileSync("public/guias/marketing.js", "utf8");
    const testar = async (publicidade: boolean) => {
      const scripts: unknown[] = [], window: Record<string, unknown> = {};
      const context = { window, location: { pathname: "/guia-agentes", search: "", reload: vi.fn() }, document: { querySelector: () => ({}), createElement: () => ({}), head: { append: (script: unknown) => scripts.push(script) }, body: { append: vi.fn() }, referrer: "" }, fetch: vi.fn(async () => ({ ok: true, json: async () => ({ publicidade }) })), setTimeout, Intl, URLSearchParams, navigator: { language: "pt-BR", languages: ["pt-BR"], platform: "test" }, screen: { width: 100, height: 100 }, innerWidth: 100, innerHeight: 100 };
      runInNewContext(codigo, context); runInNewContext(codigo, context);
      await new Promise((resolve) => setTimeout(resolve, 0)); return scripts;
    };
    expect(await testar(false)).toHaveLength(0); expect(await testar(true)).toHaveLength(1);
  });
});
