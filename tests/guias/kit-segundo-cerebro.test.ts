import { describe, expect, it } from "vitest";
import { GET } from "@/app/guia-kit-segundo-cerebro/route";
import { guiaPorCaminho, alvoPorCaminho } from "@/lib/guias/catalogo";

describe("guia de instalação do Kit Segundo Cérebro", () => {
  it("fica fora do portão de captura, porque quem chega nele já comprou", () => {
    for (const path of ["/guia-kit-segundo-cerebro", "/guia-kit-segundo-cerebro.html"]) {
      expect(guiaPorCaminho(path)).toBeUndefined();
      expect(alvoPorCaminho(path)).toBeUndefined();
    }
  });

  it("serve o HTML com os passos, os comandos copiáveis e os acentos corretos", async () => {
    const response = GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/html; charset=utf-8");
    const html = await response.text();
    expect(html).toContain('<meta charset="utf-8">');
    expect(html).toContain('https://useinfuser.com/guia-kit-segundo-cerebro"');
    expect(html).toContain("Instalação do Kit Segundo Cérebro");
    // O kit é um cofre do Obsidian: a página não pode prometer instalação sem ele.
    expect(html).toContain("cofre do Obsidian");
    for (const trecho of ["Extrair o kit", "Instalar o Obsidian", "Instalar o Claude Code", "Abrir o Claude dentro da pasta do kit", "Testar"]) {
      expect(html).toContain(trecho);
    }
    for (const comando of ["curl -fsSL https://claude.ai/install.sh | bash", "irm https://claude.ai/install.ps1 | iex", "claude --version", "/daily-briefing"]) {
      expect(html).toContain(comando);
    }
    // O wikilink do markdown não vira link quebrado: o guia de personalização vem dentro do kit.
    expect(html).not.toContain("[[guia-personalizacao]]");
    expect(html).toContain("guia-personalizacao.md");
    // Comando longo precisa quebrar linha no celular, senão estoura a tela.
    expect(html).toContain("@media(max-width:760px){.step{padding:22px 20px}.prompt .ptxt,.code{font-size:12.5px;white-space:pre-wrap}}");
    expect(html).toContain('id="chkcount"');
    expect(html).toContain('class="cp"');
    // Fora do fluxo de consentimento dos guias gratuitos, então sem o loader de marketing.
    expect(html).not.toContain("/guias/marketing.js");
    // Travessão em-dash não entra em texto da casa.
    expect(html).not.toContain("—");
  });
});
