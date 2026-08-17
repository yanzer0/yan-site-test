/**
 * O andaime contra um roteiro REAL, gerado pelo `/call-roteiro`.
 *
 * Por que existe, além dos testes de unidade com HTML inventado: os testes de
 * unidade passavam com `<section data-stage>`, que é o que o comando documenta,
 * enquanto o template canônico do brain emite `<div class="phase" data-stage>`.
 * O extrator achava zero etapas e escrevia um card de evento com só o cabeçalho
 * — 139 caracteres, sem erro nenhum, sem teste vermelho.
 *
 * A fixture é a saída literal de uma execução do comando em 17/08/2026. Se o
 * template mudar de forma outra vez, é aqui que aparece.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { lerEtapas, extrairZonaAoVivo, montarDescricao } from "@/lib/diagnostico/andaime";

const REAL = readFileSync(
  join(process.cwd(), "tests", "diagnostico", "fixtures", "roteiro-call-1-real.html"),
  "utf8",
);

describe("roteiro real gerado pelo /call-roteiro", () => {
  it("nao usa <section>: as etapas vem em <div class=phase>", () => {
    // Guarda a razão de o extrator casar por atributo e não por tag.
    const zona = extrairZonaAoVivo(REAL);
    expect(zona).toMatch(/<div[^>]+class="phase"[^>]+data-stage=/);
    expect(zona).not.toMatch(/<section[^>]+data-stage=/);
  });

  it("acha as cinco etapas do diagnostico, na ordem canonica", () => {
    expect(lerEtapas(extrairZonaAoVivo(REAL)).map((e) => e.estagio)).toEqual([
      "frame",
      "diagnosis",
      "decision",
      "door-1",
      "advance",
    ]);
  });

  it("usa o titulo do proprio roteiro como rotulo", () => {
    const rotulos = lerEtapas(extrairZonaAoVivo(REAL)).map((e) => e.rotulo);
    expect(rotulos[0]).toBe("FRAME");
    expect(rotulos.every((r) => r === r.toUpperCase())).toBe(true);
  });

  it("nao repete o titulo dentro do corpo da etapa", () => {
    const frame = lerEtapas(extrairZonaAoVivo(REAL))[0];
    expect(frame.texto.startsWith(frame.rotulo)).toBe(false);
  });

  it("leva as falas literais do andaime, que sao o motivo da feature", () => {
    const descricao = montarDescricao({
      html: REAL,
      nomeDoLead: "Ricardo Alves",
      empresa: "Vertex Componentes",
    });
    // Uma fala de cada ponta da conversa: se o recorte quebrar, alguma some.
    expect(descricao).toContain("Meu objetivo aqui e entender como a Vertex funciona");
    expect(descricao).toContain("Se nada mudar nos proximos 6 meses");
  });

  it("produz um card util, nao um cabecalho solto", () => {
    const descricao = montarDescricao({
      html: REAL,
      nomeDoLead: "Ricardo Alves",
      empresa: "Vertex Componentes",
    });
    // 139 caracteres foi o tamanho do card vazio que passou despercebido.
    expect(descricao.length).toBeGreaterThan(1200);
  });

  it("nao deixa o PREP vazar para o card do evento", () => {
    const descricao = montarDescricao({ html: REAL, nomeDoLead: "Ricardo", empresa: null });
    for (const doPrep of ["PREP", "Fundação", "R$", "hipótese"]) {
      expect(descricao.includes(doPrep), `vazou "${doPrep}"`).toBe(false);
    }
  });

  it("continua sem usar tag que o Google Agenda nao renderiza", () => {
    const descricao = montarDescricao({ html: REAL, nomeDoLead: "Ricardo", empresa: null });
    const tags = [...descricao.matchAll(/<(\/?[a-z]+)[^>]*>/g)].map((m) => m[1].replace("/", ""));
    expect([...new Set(tags)].sort()).toEqual(["b", "br"]);
  });

  it("mostra as falas com aspas de verdade, nao com &quot;", () => {
    const descricao = montarDescricao({ html: REAL, nomeDoLead: "Ricardo", empresa: null });
    expect(descricao).not.toContain("&quot;");
    expect(descricao).toContain('"Ricardo, bom dia.');
  });
});
