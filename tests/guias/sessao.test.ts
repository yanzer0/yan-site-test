import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { COOKIE_GUIAS, criarSessaoGuias, sessaoGuiasValida, VALIDADE_GUIAS_SEGUNDOS } from "@/lib/guias/sessao";
const ID = "ef0519fa-7f00-422a-9991-9caf757c49da";
const AGORA = Date.UTC(2026, 9, 28, 14);

beforeEach(() => { process.env.GUIAS_ACCESS_SECRET = "segredo-sintetico-guias-".repeat(3); });
afterEach(() => { delete process.env.GUIAS_ACCESS_SECRET; });

describe("sessão dos guias", () => {
  it("valida assinatura sem carregar PII", async () => {
    const token = await criarSessaoGuias(ID, AGORA);
    expect(COOKIE_GUIAS).toBe("infuser_guias");
    expect(await sessaoGuiasValida(token, AGORA)).toBe(true);
    expect(token).not.toMatch(/@|nome|email|whatsapp/);
  });
  it("expira exatamente em 30 dias", async () => {
    const token = await criarSessaoGuias(ID, AGORA);
    expect(await sessaoGuiasValida(token, AGORA + VALIDADE_GUIAS_SEGUNDOS * 1000 - 1000)).toBe(true);
    expect(await sessaoGuiasValida(token, AGORA + VALIDADE_GUIAS_SEGUNDOS * 1000)).toBe(false);
  });
  it("recusa assinatura adulterada, expiração modificada e tokens malformados", async () => {
    const token = await criarSessaoGuias(ID, AGORA);
    const partes = token.split(".");
    expect(await sessaoGuiasValida(`${partes[0]}.${partes[1]}.${"A".repeat(43)}`, AGORA)).toBe(false);
    expect(await sessaoGuiasValida(`${partes[0]}.${Number(partes[1]) + 1}.${partes[2]}`, AGORA)).toBe(false);
    for (const invalido of [undefined, "", "forjado", ".".repeat(1000), `${ID}.0.AAA`]) expect(await sessaoGuiasValida(invalido, AGORA)).toBe(false);
  });
  it("rotação da chave invalida a sessão anterior", async () => {
    const token = await criarSessaoGuias(ID, AGORA);
    process.env.GUIAS_ACCESS_SECRET = "outra-chave-sintetica-".repeat(3);
    expect(await sessaoGuiasValida(token, AGORA)).toBe(false);
  });
  it("sem configuração falha fechado", async () => {
    delete process.env.GUIAS_ACCESS_SECRET;
    await expect(sessaoGuiasValida(undefined)).rejects.toThrow("guias_config_missing");
    process.env.GUIAS_ACCESS_SECRET = "curta";
    await expect(criarSessaoGuias(ID)).rejects.toThrow("guias_config_missing");
  });
});
