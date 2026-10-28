import { randomUUID } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { CAMPOS_GUIAS, origemSemDados, permitirEnvio, validarCadastroGuia } from "@/lib/guias/captura";
import { sessaoGuiasValida, COOKIE_GUIAS } from "@/lib/guias/sessao";
const { gravar } = vi.hoisted(() => ({ gravar: vi.fn() }));
vi.mock("@/lib/guias/db", () => ({ gravarCadastroGuia: gravar }));
import { POST } from "@/app/api/guias/acesso/route";

const CADASTRO = { nome: "Pessoa de Teste", email: "teste@example.com", whatsapp: "(11) 99999-9999", nicho: "Consultoria", interesse: "Criar conteúdo com IA", impedimento: "Falta um processo claro", guia: "skills", website: "", origem: "https://instagram.com/p/abc?email=nao-gravar" };
function requisicao(corpo: unknown, extra: Record<string, string> = {}): NextRequest {
  return new NextRequest("http://localhost:3000/api/guias/acesso", { method: "POST", headers: { "content-type": "application/json", origin: "http://localhost:3000", "x-forwarded-for": randomUUID(), ...extra }, body: typeof corpo === "string" ? corpo : JSON.stringify(corpo) });
}
beforeEach(() => { process.env.GUIAS_ACCESS_SECRET = "segredo-sintetico-exclusivo-".repeat(3); gravar.mockReset().mockResolvedValue(undefined); });
afterEach(() => { delete process.env.GUIAS_ACCESS_SECRET; vi.restoreAllMocks(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("cadastro obrigatório dos guias", () => {
  it.each(CAMPOS_GUIAS)("recusa campo ausente: %s", async (campo) => {
    const cadastro: Record<string, unknown> = { ...CADASTRO }; delete cadastro[campo];
    const response = await POST(requisicao(cadastro));
    expect(response.status).toBe(400);
    expect((await response.json()).campos).toHaveProperty(campo);
    expect(gravar).not.toHaveBeenCalled(); expect(response.headers.get("set-cookie")).toBeNull();
  });
  it.each([
    ["nome", " "], ["email", "sem-arroba"], ["whatsapp", "123"], ["whatsapp", "1199abc99999"], ["whatsapp", "99999999999"], ["nicho", []], ["interesse", " "], ["impedimento", 12], ["interesse", "a".repeat(2001)], ["website", "bot"], ["guia", "https://golpe.example"],
  ])("recusa conteúdo inválido em %s", async (campo, valor) => {
    const response = await POST(requisicao({ ...CADASTRO, [campo as string]: valor }));
    expect(response.status).toBe(400); expect(gravar).not.toHaveBeenCalled(); expect(response.headers.get("set-cookie")).toBeNull();
  });
  it("persiste os seis campos e só então libera o guia escolhido", async () => {
    const response = await POST(requisicao(CADASTRO));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ destino: "/guia-skill" });
    expect(gravar).toHaveBeenCalledWith(expect.any(String), { nome: CADASTRO.nome, email: CADASTRO.email, whatsapp: "5511999999999", nicho: CADASTRO.nicho, interesse: CADASTRO.interesse, impedimento: CADASTRO.impedimento, guia: "skills", origem: "https://instagram.com/p/abc" }, { comercial: false, publicidade: false }, expect.objectContaining({ publicidade: { status: "nao_autorizada" } }));
    const cookie = response.cookies.get(COOKIE_GUIAS)!;
    expect(await sessaoGuiasValida(cookie.value)).toBe(true);
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
    expect(response.headers.get("set-cookie")).toContain("SameSite=lax");
    expect(response.headers.get("set-cookie")).not.toContain(CADASTRO.email);
  });
  it("entrada geral volta para a biblioteca", async () => {
    const response = await POST(requisicao({ ...CADASTRO, guia: "" }));
    expect(response.status).toBe(200); expect(await response.json()).toEqual({ destino: "/central" });
  });
  it("salva escolhas e libera com GeoJS indisponível", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("GeoJS offline"); }));
    const r = await POST(requisicao({ ...CADASTRO, consentimentos: { comercial: true, publicidade: true }, marketing: { campanha: { utm_source: "instagram", fbclid: "click-123", email: "private@example.com" } } }, { "x-forwarded-for": "8.8.8.8" }));
    expect(r.status).toBe(200); expect(r.headers.get("set-cookie")).toContain("HttpOnly");
    expect(gravar).toHaveBeenCalledWith(expect.any(String), expect.any(Object), { comercial: true, publicidade: true }, expect.objectContaining({ publicidade: expect.objectContaining({ localizacao: expect.objectContaining({ status: "indisponivel" }) }) }));
    expect(await r.json()).toEqual({ destino: "/guia-skill?utm_source=instagram&fbclid=click-123" });
  });
  it("falha de banco não libera nem vaza dados no log", async () => {
    gravar.mockRejectedValue(new Error(`banco falhou com ${CADASTRO.email}`));
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const response = await POST(requisicao(CADASTRO));
    expect(response.status).toBe(503); expect(response.headers.get("set-cookie")).toBeNull();
    expect(JSON.stringify(log.mock.calls)).not.toContain(CADASTRO.email);
    expect(await response.text()).not.toContain(CADASTRO.email);
  });
  it("segredo ausente impede a gravação e a liberação", async () => {
    delete process.env.GUIAS_ACCESS_SECRET; vi.spyOn(console, "error").mockImplementation(() => undefined);
    const response = await POST(requisicao(CADASTRO));
    expect(response.status).toBe(503); expect(gravar).not.toHaveBeenCalled(); expect(response.headers.get("set-cookie")).toBeNull();
  });
  it("origem externa, ausente e JSON inválido são recusados", async () => {
    expect((await POST(requisicao(CADASTRO, { origin: "https://golpe.example" }))).status).toBe(403);
    expect((await POST(requisicao(CADASTRO, { origin: "" }))).status).toBe(403);
    expect((await POST(requisicao("{"))).status).toBe(400);
    expect((await POST(requisicao(CADASTRO, { "content-type": "text/plain" }))).status).toBe(400);
    expect(gravar).not.toHaveBeenCalled();
  });
  it("em produção usa somente o host público, mesmo atrás do proxy", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const response = await POST(new NextRequest("http://0.0.0.0:3000/api/guias/acesso", { method: "POST", headers: { host: "www.useinfuser.com", origin: "https://www.useinfuser.com", "content-type": "application/json", "x-forwarded-for": randomUUID() }, body: JSON.stringify(CADASTRO) }));
    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toContain("Secure");
    expect(response.headers.get("set-cookie")).toContain("Domain=.useinfuser.com");
    const externo = await POST(new NextRequest("http://0.0.0.0:3000/api/guias/acesso", { method: "POST", headers: { host: "golpe.example", origin: "https://golpe.example", "content-type": "application/json" }, body: JSON.stringify(CADASTRO) }));
    expect(externo.status).toBe(403);
  });
  it("limita corpo pelo tamanho real e pelo cabeçalho", async () => {
    expect((await POST(requisicao("x".repeat(32769)))).status).toBe(413);
    expect((await POST(requisicao(CADASTRO, { "content-length": "32769" }))).status).toBe(413);
    expect(gravar).not.toHaveBeenCalled();
  });
  it("limita exatamente dez envios por rede em quinze minutos", async () => {
    const rede = randomUUID();
    for (let index = 0; index < 10; index += 1) expect((await POST(requisicao({}, { "x-forwarded-for": rede }))).status).toBe(400);
    const response = await POST(requisicao(CADASTRO, { "x-forwarded-for": rede }));
    expect(response.status).toBe(429); expect(response.headers.get("retry-after")).toBe("900"); expect(gravar).not.toHaveBeenCalled();
    const chave = randomUUID(); const agora = 10000000;
    for (let index = 0; index < 10; index += 1) expect(permitirEnvio(chave, agora)).toBe(true);
    expect(permitirEnvio(chave, agora)).toBe(false);
    expect(permitirEnvio(chave, agora + 900000)).toBe(true);
  });
  it("normaliza espaços e descarta dados extras", () => {
    const result = validarCadastroGuia({ ...CADASTRO, nome: "  Pessoa de Teste  ", email: "TESTE@EXAMPLE.COM", role: "admin" });
    expect(result.ok).toBe(true);
    if (result.ok) { expect(result.cadastro.nome).toBe("Pessoa de Teste"); expect(result.cadastro.email).toBe("teste@example.com"); expect(result.cadastro).not.toHaveProperty("role"); }
    expect(origemSemDados("javascript:alert(1)")).toBe("direto");
    expect(origemSemDados("https://user:pass@example.com/path?email=x#secret")).toBe("https://example.com/path");
  });
  it("limita o armazenamento do rate limiter a duas mil redes", async () => {
    vi.resetModules();
    const { permitirEnvio: permitir } = await import("@/lib/guias/captura");
    for (let index = 0; index < 2000; index += 1) expect(permitir(`rede-${index}`, 1000)).toBe(true);
    expect(permitir("rede-2001", 1000)).toBe(false);
    expect(permitir("rede-nova", 901000)).toBe(true);
  });
});
