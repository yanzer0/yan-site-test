import { beforeEach, describe, expect, it, vi } from "vitest";
const { sql, query } = vi.hoisted(() => { const query = vi.fn(); return { sql: Object.assign(vi.fn(), { query }), query }; });
vi.mock("@/lib/diagnostico/banco", () => ({ sql }));
import { csvLeadsGuias, gravarCadastroGuia, listarLeadsGuias, VERSAO_AVISO_GUIAS } from "@/lib/guias/db";

beforeEach(() => { sql.mockReset().mockResolvedValue({ rows: [], rowCount: 1 }); query.mockReset().mockResolvedValue({ rows: [] }); });
describe("persistência e exportação", () => {
  it("parametriza os seis campos e não toca o diagnóstico", async () => {
    const dados = { nome: "Teste", email: "teste@example.com", whatsapp: "5511999999999", nicho: "Teste", interesse: "Teste interesse", impedimento: "Teste impedimento", guia: "skills", origem: "direto" };
    await gravarCadastroGuia("id-sintetico", dados);
    const [template, ...parametros] = sql.mock.calls[0];
    expect(template.join("")).toContain("INSERT INTO guias_leads");
    expect(template.join("")).not.toContain(dados.email);
    expect(parametros).toEqual(["id-sintetico", dados.nome, dados.email, dados.whatsapp, dados.nicho, dados.interesse, dados.impedimento, dados.guia, dados.origem, VERSAO_AVISO_GUIAS]);
  });
  it("consulta paginada tem ordenação estável e limites parametrizados", async () => {
    await listarLeadsGuias(200, 2);
    expect(query).toHaveBeenCalledWith(expect.stringContaining("ORDER BY criado_em DESC, id DESC LIMIT $1 OFFSET $2"), [200, 200]);
  });
  it("CSV preserva aspas e neutraliza fórmulas em campos livres", () => {
    const csv = csvLeadsGuias([{ id: "id", nome: '=HYPERLINK("x")', email: "teste@example.com", whatsapp: "5511999999999", nicho: "@SUM(1)", interesse: "+fórmula", impedimento: "-texto", guia: "", origem: "direto", criadoEm: new Date("2026-10-28T12:00:00Z") }]);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain("'=HYPERLINK(\"\"x\"\")"); expect(csv).toContain("'@SUM(1)"); expect(csv).toContain("'+fórmula"); expect(csv).toContain("'-texto");
    expect(csv).toContain("2026-10-28T12:00:00.000Z"); expect(csv).toContain("central");
  });
});
