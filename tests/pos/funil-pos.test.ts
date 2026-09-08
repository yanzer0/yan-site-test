import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { GET as getUpsell } from "@/app/pos/route";
import { GET as getDownsell } from "@/app/pos/oferta-final/route";
import { GET as getObrigado } from "@/app/pos/obrigado/route";

const ROOT = process.cwd();

function readPublicHtml(fileName: string) {
  return readFileSync(join(ROOT, "public", fileName), "utf8");
}

describe("funil pos-compra do Club", () => {
  it("mantem os tres documentos noindex, rastreados e sem texto proibido", () => {
    for (const fileName of [
      "pos.html",
      "pos-oferta-final.html",
      "pos-obrigado.html",
    ]) {
      const html = readPublicHtml(fileName);

      expect(html).toContain('name="robots" content="noindex, nofollow"');
      expect(html).toContain("api.useinfuser.com/etrthkooc.js");
      expect(html).not.toContain("SUBSTITUIR");
      expect(html).not.toContain("—");
      expect(html).not.toContain("–");
    }
  });

  it("liga upsell, downsell, checkouts e confirmacao final", () => {
    const upsell = readPublicHtml("pos.html");
    const downsell = readPublicHtml("pos-oferta-final.html");
    const obrigado = readPublicHtml("pos-obrigado.html");

    expect(upsell).toContain('href="/pos/oferta-final"');
    expect(upsell).toContain("https://pay.hub.la/bYpoAJEja2IHIiF24nsD");
    expect(upsell).toContain("https://pay.hub.la/XOoxp5QUVAeImUKS08Vq");

    expect(downsell).toContain("https://pay.hub.la/Iz3MwLgkWwk2ejINfXvq");
    expect(downsell).toContain("CLUB");
    expect(downsell).toContain('href="/pos/obrigado"');

    expect(obrigado).toContain("Seu material chegou no seu e-mail");
  });

  it("serve os tres HTMLs com o content-type correto", async () => {
    for (const [get, marker] of [
      [getUpsell, "Infuser Club · Upsell"],
      [getDownsell, "Primeiro Mês por R$67"],
      [getObrigado, "Seu material chegou no seu e-mail"],
    ] as const) {
      const response = get();

      expect(response.headers.get("content-type")).toBe(
        "text/html; charset=utf-8",
      );
      await expect(response.text()).resolves.toContain(marker);
    }
  });
});
