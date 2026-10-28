import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { renderToStaticMarkup } from "react-dom/server";
const { usuarioLogado, usuarioDaSessao, listar, csv } = vi.hoisted(() => ({ usuarioLogado: vi.fn(), usuarioDaSessao: vi.fn(), listar: vi.fn(), csv: vi.fn() }));
vi.mock("@/lib/diagnostico/sessao", () => ({ usuarioLogado, COOKIE_SESSAO: "infuser_painel" }));
vi.mock("@/lib/diagnostico/auth-db", () => ({ usuarioDaSessao }));
vi.mock("@/lib/guias/db", () => ({ listarLeadsGuias: listar, csvLeadsGuias: csv, modoExportacaoGuias: (v: string) => v === "meta" || v === "comercial" ? v : "todos" }));
vi.mock("next/navigation", () => ({ redirect: (path: string) => { throw new Error(`redirect:${path}`); } }));
import LeadsPage from "@/app/leads/guias/page";
import { GET } from "@/app/leads/guias/export/route";

beforeEach(() => { vi.clearAllMocks(); usuarioLogado.mockResolvedValue(null); usuarioDaSessao.mockResolvedValue(null); listar.mockResolvedValue([]); csv.mockReturnValue("Nome;E-mail"); });
describe("saídas de dados dos guias", () => {
  it("anônimo não recebe página nem CSV e não consulta os dados", async () => {
    await expect(LeadsPage({ searchParams: Promise.resolve({}) })).rejects.toThrow("redirect:/leads/entrar");
    const response = await GET(new NextRequest("https://useinfuser.com/leads/guias/export"));
    expect(response.status).toBe(404); expect(await response.text()).toBe(""); expect(listar).not.toHaveBeenCalled();
  });
  it("equipe aprovada recebe os seis campos escapados", async () => {
    usuarioLogado.mockResolvedValue({ id: "time", nome: "Equipe" });
    listar.mockResolvedValue([{ id: "id", nome: "<script>nome</script>", email: "teste@example.com", whatsapp: "5511999999999", nicho: "Saúde", interesse: "Criar conteúdo", impedimento: "Falta tempo", guia: "skills", origem: "direto", criadoEm: new Date("2026-10-28T12:00:00Z") }]);
    const html = renderToStaticMarkup(await LeadsPage({ searchParams: Promise.resolve({ pagina: "2" }) }));
    expect(html).toContain("&lt;script&gt;nome&lt;/script&gt;"); expect(html).not.toContain("<script>nome");
    for (const valor of ["teste@example.com", "5511999999999", "Saúde", "Criar conteúdo", "Falta tempo", "Crie skills"]) expect(html).toContain(valor);
    expect(listar).toHaveBeenCalledWith(200, 2, "todos");
  });
  it("export autorizado é paginado e não fica em cache", async () => {
    usuarioDaSessao.mockResolvedValue({ id: "time", estado: "aprovado" });
    const response = await GET(new NextRequest("https://useinfuser.com/leads/guias/export?pagina=3", { headers: { cookie: "infuser_painel=sessao-valida" } }));
    expect(response.status).toBe(200); expect(listar).toHaveBeenCalledWith(200, 3, "todos");
    expect(usuarioDaSessao).toHaveBeenCalledWith("sessao-valida");
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("content-disposition")).toContain("pagina-3.csv");
  });
  it("falha de consulta não expõe o erro de banco", async () => {
    usuarioDaSessao.mockResolvedValue({ id: "time" }); listar.mockRejectedValue(new Error("dado-sensivel"));
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const response = await GET(new NextRequest("https://useinfuser.com/leads/guias/export"));
    expect(response.status).toBe(503); expect(await response.text()).not.toContain("dado-sensivel");
    vi.restoreAllMocks();
  });
});
