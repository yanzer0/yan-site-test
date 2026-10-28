import { randomUUID } from "node:crypto";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { COOKIE_GUIAS, criarSessaoGuias } from "@/lib/guias/sessao";
const db = vi.hoisted(() => ({ ler: vi.fn(), alterar: vi.fn(), medir: vi.fn() }));
vi.mock("@/lib/guias/db", () => ({ lerPreferenciasGuias: db.ler, alterarPreferenciasGuias: db.alterar, atualizarMedicaoGuias: db.medir }));
import { GET, POST } from "@/app/api/guias/preferencias/route";

beforeEach(() => { process.env.GUIAS_ACCESS_SECRET = "segredo-sintetico-de-preferencias-".repeat(2); db.ler.mockReset().mockResolvedValue({ comercial: true, publicidade: true }); db.alterar.mockReset().mockResolvedValue(undefined); db.medir.mockReset().mockResolvedValue(undefined); });
afterEach(() => { delete process.env.GUIAS_ACCESS_SECRET; });
async function request(body?: unknown, headers: Record<string,string> = {}): Promise<NextRequest> {
  const token = await criarSessaoGuias(randomUUID());
  return new NextRequest("https://useinfuser.com/api/guias/preferencias", { ...(body ? { method: "POST", body: JSON.stringify(body) } : {}), headers: { origin: "https://useinfuser.com", cookie: `${COOKIE_GUIAS}=${token}`, "content-type": "application/json", ...headers } });
}
describe("preferências de publicidade e contato", () => {
  it("sem sessão não lê escolhas", async () => {
    const r = await GET(new NextRequest("https://useinfuser.com/api/guias/preferencias")); expect(r.status).toBe(401); expect(db.ler).not.toHaveBeenCalled();
  });
  it("sessão recebe só escolhas e identificador sem PII", async () => {
    const r = await GET(await request()); expect(r.status).toBe(200); expect(await r.json()).toMatchObject({ comercial: true, publicidade: true, versao: "guias-marketing-2026-10-28-v2" });
  });
  it("revogação salva as duas escolhas e elimina cookies permitidos", async () => {
    const r = await POST(await request({ consentimentos: { comercial: false, publicidade: false } }));
    expect(r.status).toBe(200); expect(db.alterar).toHaveBeenCalledWith(expect.any(String), { comercial: false, publicidade: false });
    expect(r.headers.get("set-cookie")).toContain("Max-Age=0"); expect(r.headers.get("set-cookie")).not.toContain(COOKIE_GUIAS);
  });
  it("medição posterior depende da escolha atual e não reativa revogação", async () => {
    db.ler.mockResolvedValue({ comercial: true, publicidade: false });
    const r = await POST(await request({ acao: "medicao", navegador: { idioma: "pt-BR" } })); expect(r.status).toBe(403); expect(db.medir).not.toHaveBeenCalled();
  });
  it("bloqueia origem externa e escolhas malformadas", async () => {
    expect((await POST(await request({ consentimentos: { comercial: true, publicidade: true } }, { origin: "https://evil.example" }))).status).toBe(403);
    expect((await POST(await request({ consentimentos: { comercial: "sim", publicidade: true } }))).status).toBe(400); expect(db.alterar).not.toHaveBeenCalled();
  });
});
