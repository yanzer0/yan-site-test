import { describe, expect, it } from "vitest";
import { GET } from "@/app/guia-img/route";
import { guiaPorCaminho, destinoDoGuia, CATALOGO_CENTRAL } from "@/lib/guias/catalogo";

describe("guia de transformações de imagem enviado por Pedro", () => {
  it("resolve a URL pedida, o HTML e o sublink para o guia gratuito", () => {
    for (const path of ["/guia-img", "/guia-img.html", "/guias/imagem"]) {
      expect(guiaPorCaminho(path)?.slug).toBe("imagem");
    }
    expect(destinoDoGuia("imagem")).toBe("/guia-img");
    expect(CATALOGO_CENTRAL.find((item) => item.slug === "imagem")).toMatchObject({ estado: "Gratuito", tipo: "Guia", caminho: "/guias/imagem" });
  });

  it("serve o HTML com pedidos copiáveis, checklist e loader consentido", async () => {
    const response = GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/html; charset=utf-8");
    const html = await response.text();
    expect(html).toContain("Cinco imagens de campanha.");
    expect(html).toContain('https://useinfuser.com/guia-img"');
    expect(html).toContain('id="chkcount"');
    expect(html).toContain('class="cp"');
    expect(html).toContain('/guias/marketing.js?v=20261028-1');
  });
});
