import { describe, expect, it } from "vitest";
import { existsSync, statSync } from "node:fs";
import { GET } from "@/app/guia-motion-libertadores/route";
import { GET as atalho } from "@/app/final/route";
import { guiaPorCaminho, destinoDoGuia, CATALOGO_CENTRAL } from "@/lib/guias/catalogo";

describe("guia FINAL do Reels de números em motion", () => {
  it("resolve o caminho canônico, o atalho, o HTML e o sublink para o guia gratuito", () => {
    for (const path of ["/guia-motion-libertadores", "/final", "/guia-motion-libertadores.html", "/guias/motion-libertadores"]) {
      expect(guiaPorCaminho(path)?.slug).toBe("motion-libertadores");
    }
    expect(destinoDoGuia("motion-libertadores")).toBe("/guia-motion-libertadores");
    expect(CATALOGO_CENTRAL.find((item) => item.slug === "motion-libertadores")).toMatchObject({ estado: "Gratuito", tipo: "Guia", categoria: "Conteúdo e criação", caminho: "/guias/motion-libertadores" });
  });

  it("serve o mesmo HTML nas duas rotas, com CTA do Estúdio, sem preço e com loader consentido", async () => {
    const [canonico, curto] = await Promise.all([GET().text(), atalho().text()]);
    expect(curto).toBe(canonico);
    expect(canonico).toContain('https://useinfuser.com/guia-motion-libertadores"');
    expect(canonico).toContain('href="https://useinfuser.com/estudio"');
    expect(canonico).not.toContain("pay.hotmart.com");
    expect(canonico).not.toContain("GTA");
    expect(canonico).toContain('id="chkcount"');
    expect(canonico).toContain('/guias/marketing.js?v=20261028-1');
  });

  it("as quatro imagens referenciadas existem em public", async () => {
    const html = await GET().text();
    for (const n of [1, 2, 3, 4]) {
      const src = `/guias/motion-libertadores/quadro-${n}.webp`;
      expect(html).toContain(`src="${src}"`);
      expect(existsSync(`public${src}`) && statSync(`public${src}`).size > 1000, src).toBe(true);
    }
  });
});
