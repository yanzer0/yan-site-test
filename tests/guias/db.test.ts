import { beforeEach, describe, expect, it, vi } from "vitest";
const { sql, query } = vi.hoisted(() => { const query = vi.fn(); return { sql: Object.assign(vi.fn(), { query }), query }; });
vi.mock("@/lib/diagnostico/banco", () => ({ sql }));
import { alterarPreferenciasGuias, atualizarMedicaoGuias, csvLeadsGuias, gravarCadastroGuia, listarLeadsGuias, VERSAO_AVISO_GUIAS } from "@/lib/guias/db";

beforeEach(() => { sql.mockReset().mockResolvedValue({ rows: [], rowCount: 1 }); query.mockReset().mockResolvedValue({ rows: [] }); });
describe("persistência e exportação", () => {
  it("parametriza os seis campos e não toca o diagnóstico", async () => {
    const dados = { nome: "Teste", email: "teste@example.com", whatsapp: "5511999999999", nicho: "Teste", interesse: "Teste interesse", impedimento: "Teste impedimento", guia: "skills", origem: "direto" };
    await gravarCadastroGuia("id-sintetico", dados);
    const [template, ...parametros] = sql.mock.calls[0];
    expect(template.join("")).toContain("INSERT INTO guias_leads");
    expect(template.join("")).not.toContain(dados.email);
    expect(template.join("")).toContain("INSERT INTO guias_consentimentos");
    expect(parametros.slice(10, 13)).toEqual([false, false, "guias-marketing-2026-10-28-v1"]);
    expect(parametros.slice(0, 10)).toEqual(["id-sintetico", dados.nome, dados.email, dados.whatsapp, dados.nicho, dados.interesse, dados.impedimento, dados.guia, dados.origem, VERSAO_AVISO_GUIAS]);
  });
  it("consulta paginada tem ordenação estável e limites parametrizados", async () => {
    await listarLeadsGuias(200, 2);
    expect(query).toHaveBeenCalledWith(expect.stringContaining("ORDER BY l.criado_em DESC, l.id DESC LIMIT $1 OFFSET $2"), [200, 200, "todos"]);
  });
  it("CSV preserva aspas e neutraliza fórmulas em campos livres", () => {
    const csv = csvLeadsGuias([{ id: "id", nome: '=HYPERLINK("x")', email: "teste@example.com", whatsapp: "5511999999999", nicho: "@SUM(1)", interesse: "+fórmula", impedimento: "-texto", guia: "", origem: "direto", criadoEm: new Date("2026-10-28T12:00:00Z") }]);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain("'=HYPERLINK(\"\"x\"\")"); expect(csv).toContain("'@SUM(1)"); expect(csv).toContain("'+fórmula"); expect(csv).toContain("'-texto");
    expect(csv).toContain("2026-10-28T12:00:00.000Z"); expect(csv).toContain("central");
  });
  it("revogação remove metadados e atualiza todos os registros do contato", async () => {
    await alterarPreferenciasGuias("id", { comercial: false, publicidade: false });
    expect(query).toHaveBeenCalledWith(expect.stringContaining("jsonb_set(l.metadados, '{publicidade}'"), ["id", false, false, "guias-marketing-2026-10-28-v1"]);
    expect(query.mock.calls[0][0]).toContain("INSERT INTO guias_consentimentos");
    expect(query.mock.calls[0][0]).toContain("l.email = alvo.email OR l.whatsapp = alvo.whatsapp");
    await atualizarMedicaoGuias("id", {}, {}); expect(query.mock.calls[1][0]).toContain("consent_publicidade = true AND NOT EXISTS");
  });

});
