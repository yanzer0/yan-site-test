import { describe, expect, it } from "vitest";
import { GET } from "@/app/reforma-tributaria/route";
import { CATALOGO_CENTRAL, destinoDoGuia, guiaPorCaminho } from "@/lib/guias/catalogo";

describe("guia de preparação operacional para a reforma tributária", () => {
  it("resolve o caminho público e o HTML direto para o mesmo guia gratuito", () => {
    for (const path of ["/reforma-tributaria", "/guia-reforma-tributaria.html", "/guias/reforma-tributaria"]) {
      expect(guiaPorCaminho(path)?.slug).toBe("reforma-tributaria");
    }
    expect(destinoDoGuia("reforma-tributaria")).toBe("/reforma-tributaria");
    expect(CATALOGO_CENTRAL.find((item) => item.slug === "reforma-tributaria")).toMatchObject({ estado: "Gratuito", tipo: "Guia", caminho: "/guias/reforma-tributaria" });
  });

  it("serve o roteiro completo com checklist, fontes oficiais e CTA para o formulário", async () => {
    const response = GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/html; charset=utf-8");
    const html = await response.text();
    expect(html.match(/type="checkbox" data-k=/g)).toHaveLength(24);
    expect(html).toContain('id="action-template"');
    expect(html.match(/href="\/diagnostico\?/g)).toHaveLength(2);
    expect(html).toContain("www.gov.br/receitafederal/");
    expect(html).toContain("não equivale a uma certificação");
    expect(html).toContain('/guias/marketing.js?v=20261028-1');
  });
});
