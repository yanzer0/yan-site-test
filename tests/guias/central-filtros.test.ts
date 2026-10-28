import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { CATALOGO_CENTRAL } from "@/lib/guias/catalogo";
describe("busca e filtros da Central", () => {
  it("combina grupo e busca sem modificar a ordem do catálogo", () => {
    let pesquisar = () => {}; const search = { value: "", addEventListener: (_: string, callback: () => void) => { pesquisar = callback; }, focus: vi.fn() };
    const cards = CATALOGO_CENTRAL.map((item) => ({ hidden: false, dataset: { categoria: item.grupo, busca: `${item.titulo} ${item.tipo} ${item.estado}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() } }));
    const filtros = ["todos", "guias", "recursos", "premium", "em-breve"].map((id) => {
      let callback = () => {}; return { dataset: { filtro: id }, classList: { toggle: vi.fn() }, setAttribute: vi.fn(), addEventListener: (_: string, fn: () => void) => { callback = fn; }, click: () => callback() };
    });
    const resultado = { textContent: "" }, vazio = { hidden: true }, limpar = { addEventListener: vi.fn() };
    const document = { getElementById: (id: string) => ({ "buscar-guias": search, "resultado-busca": resultado, "sem-guias": vazio, "limpar-busca": limpar } as Record<string, unknown>)[id] ?? null, querySelectorAll: (selector: string) => selector === "[data-guia]" ? cards : filtros };
    runInNewContext(readFileSync("public/guias/guias.js", "utf8"), { document });
    filtros[3].click(); expect(cards.filter((card) => !card.hidden)).toHaveLength(4); expect(resultado.textContent).toBe("4 itens na Central");
    filtros[4].click(); expect(cards.filter((card) => !card.hidden)).toHaveLength(1); expect(cards[24].hidden).toBe(false);
    filtros[2].click(); expect(cards.filter((card) => !card.hidden)).toHaveLength(3);
    search.value = "GPU"; pesquisar(); expect(cards.filter((card) => !card.hidden)).toHaveLength(1);
    search.value = "nenhum assunto"; pesquisar(); expect(vazio.hidden).toBe(false); expect(cards).toHaveLength(25);
  });
});
