import { readFileSync } from "node:fs";
import { inflateRawSync } from "node:zlib";
import { readFile } from "node:fs/promises";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { RECURSOS_CENTRAL } from "@/lib/guias/catalogo";
import { COOKIE_GUIAS, criarSessaoGuias } from "@/lib/guias/sessao";
import { GET as detalhe } from "@/app/central/recursos/[slug]/route";
import { GET as baixar } from "@/app/central/baixar/[slug]/route";
vi.mock("node:fs/promises", async () => {
  const original = await vi.importActual<typeof import("node:fs/promises")>("node:fs/promises");
  return { ...original, readFile: vi.fn(original.readFile) };
});
beforeEach(() => { process.env.GUIAS_ACCESS_SECRET = "segredo-sintetico-central-downloads-".repeat(2); vi.mocked(readFile).mockClear(); });
afterEach(() => { delete process.env.GUIAS_ACCESS_SECRET; vi.restoreAllMocks(); });
async function request(caminho: string, autorizado = false): Promise<NextRequest> {
  const token = autorizado ? await criarSessaoGuias("b8e2d55f-851a-435e-b575-f0d4f6a7af02") : "falso";
  return new NextRequest(`https://useinfuser.com${caminho}`, { headers: { cookie: `${COOKIE_GUIAS}=${token}` } });
}
function arquivosZip(buffer: Buffer): Map<string, Buffer> {
  let fim = buffer.length - 22;
  while (fim >= 0 && buffer.readUInt32LE(fim) !== 0x06054b50) fim -= 1;
  if (fim < 0) throw new Error("ZIP sem diretório central");
  let posicao = buffer.readUInt32LE(fim + 16);
  const quantidade = buffer.readUInt16LE(fim + 10), arquivos = new Map<string, Buffer>();
  for (let index = 0; index < quantidade; index += 1) {
    expect(buffer.readUInt32LE(posicao)).toBe(0x02014b50);
    const nomeTamanho = buffer.readUInt16LE(posicao + 28), extra = buffer.readUInt16LE(posicao + 30), comentario = buffer.readUInt16LE(posicao + 32);
    const nome = buffer.subarray(posicao + 46, posicao + 46 + nomeTamanho).toString("utf8").replace(/\\/g, "/");
    const inicio = buffer.readUInt32LE(posicao + 42), metodo = buffer.readUInt16LE(posicao + 10), tamanho = buffer.readUInt32LE(posicao + 20);
    const offset = inicio + 30 + buffer.readUInt16LE(inicio + 26) + buffer.readUInt16LE(inicio + 28);
    const comprimido = buffer.subarray(offset, offset + tamanho);
    arquivos.set(nome, metodo === 8 ? inflateRawSync(comprimido) : comprimido);
    posicao += 46 + nomeTamanho + extra + comentario;
  }
  return arquivos;
}
describe("distribuição privada dos recursos", () => {
  for (const recurso of RECURSOS_CENTRAL) {
    it(`${recurso.slug}: nega sessão falsa antes de ler arquivos`, async () => {
      const contexto = { params: Promise.resolve({ slug: recurso.slug }) };
      expect((await detalhe(await request(`/central/recursos/${recurso.slug}`), contexto)).status).toBe(307);
      const r = await baixar(await request(`/central/baixar/${recurso.slug}`), contexto);
      expect(r.status).toBe(307); expect(new URL(r.headers.get("location")!).searchParams.get("guia")).toBe(recurso.slug); expect(readFile).not.toHaveBeenCalled();
    });
    it(`${recurso.slug}: sessão válida entrega detalhe e ZIP real`, async () => {
      const contexto = { params: Promise.resolve({ slug: recurso.slug }) };
      expect((await detalhe(await request(`/central/recursos/${recurso.slug}`, true), contexto)).status).toBe(200);
      const r = await baixar(await request(`/central/baixar/${recurso.slug}`, true), contexto);
      expect(r.status).toBe(200); expect(r.headers.get("content-type")).toBe("application/zip"); expect(r.headers.get("content-disposition")).toContain(recurso.arquivo); expect(r.headers.get("cache-control")).toContain("no-store");
      expect(Buffer.from(await r.arrayBuffer()).readUInt32LE(0)).toBe(0x04034b50);
    });
    it(`${recurso.slug}: ZIP válido contém só o pacote autorizado`, () => {
      const arquivos = arquivosZip(readFileSync(`private/central/${recurso.arquivo}`)); expect(arquivos.size).toBeGreaterThan(1);
      for (const [nome, bytes] of arquivos) {
        expect(nome).not.toMatch(/\.\.|^\/|private\/instalar|\.env|\.git\//);
        const texto = bytes.toString("utf8"); expect(/sk-[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|BEGIN .*PRIVATE KEY|C:\\Users\\PC\\|helukabel|infuser-mcp|yangalasso-brain/i.test(texto), nome).toBe(false);
      }
      if (recurso.slug === "video-transcricao-gpu") {
        expect(arquivos.size).toBe(6); expect(arquivos.has("video-transcricao-gpu/scripts/transcribe-gpu.py")).toBe(true); expect(arquivos.has("video-transcricao-gpu/INSTALAR.md")).toBe(true);
      } else {
        const raiz = recurso.slug === "pacote-agente-que-aprende" ? "agente-que-aprende" : "orquestra-claude-codex";
        expect(arquivos.has(`${raiz}/instalar.mjs`)).toBe(true); expect(arquivos.has(`${raiz}/LEIA-ME.md`)).toBe(true);
      }
    });
  }
  it("traversal e nomes arbitrários não alcançam outros arquivos", async () => {
    for (const slug of ["../../instalar", "%2e%2e%2finstalar", "segundo-cerebro-autonomo.zip", "C:\\Users\\PC", "desconhecido"]) {
      const r = await baixar(await request("/central/baixar/x", true), { params: Promise.resolve({ slug }) }); expect(r.status).toBe(404);
    }
    expect(readFile).not.toHaveBeenCalled();
  });
  it("arquivo ausente é falha explícita sem fingir download", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.mocked(readFile).mockRejectedValueOnce(new Error("ENOENT private path"));
    const r = await baixar(await request("/central/baixar/video-transcricao-gpu", true), { params: Promise.resolve({ slug: "video-transcricao-gpu" }) });
    expect(r.status).toBe(503); expect(await r.text()).not.toContain("private path");
  });
});
