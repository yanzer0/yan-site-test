import { describe, expect, it } from "vitest";
import { GET } from "@/app/guia-claude-instagram/route";
import { GET as atalho } from "@/app/setup/route";
import { guiaPorCaminho, destinoDoGuia, CATALOGO_CENTRAL } from "@/lib/guias/catalogo";

describe("guia SETUP do Claude com Instagram", () => {
  it("resolve as portas do guia para o item gratuito da Central", () => {
    for (const path of ["/guia-claude-instagram", "/setup", "/guia-claude-instagram.html", "/guias/claude-instagram"]) {
      expect(guiaPorCaminho(path)?.slug).toBe("claude-instagram");
    }
    expect(destinoDoGuia("claude-instagram")).toBe("/guia-claude-instagram");
    expect(CATALOGO_CENTRAL.find((item) => item.slug === "claude-instagram")).toMatchObject({ estado: "Gratuito", tipo: "Guia", caminho: "/guias/claude-instagram" });
  });

  it("serve o HTML com pedidos copiáveis, checklist e loader consentido", async () => {
    for (const rota of [GET, atalho]) {
      const response = rota();
      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toBe("text/html; charset=utf-8");
      const html = await response.text();
      expect(html).toContain("Ligue o Claude ao seu Instagram");
      expect(html).toContain('https://useinfuser.com/guia-claude-instagram"');
      expect(html).toContain("https://ai.metricool.com/mcp");
      expect(html).toContain('id="chkcount"');
      expect(html).toContain('class="cp"');
      expect(html).toContain("/guias/marketing.js?v=20261028-1");
    }
  });
});
