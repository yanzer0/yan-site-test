import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { GET } from "@/app/instalar/route";

const publicDir = join(process.cwd(), "public", "instalar");

describe("guia público do Segundo Cérebro", () => {
  it("serve o documento pela rota estática com proteção de indexação", async () => {
    const response = GET();
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/html");
    expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
    expect(html).toContain("Instale seu Segundo Cérebro");
    expect(html).toContain('content="noindex,nofollow"');
    expect(html).toContain("api.useinfuser.com/etrthkooc.js");
  });

  it("usa URLs absolutas da rota pública", () => {
    const html = readFileSync(join(publicDir, "index.html"), "utf-8");
    const script = readFileSync(join(publicDir, "guide.js"), "utf-8");

    expect(html).toContain('/instalar/guide.css?v=20260911-1');
    expect(html).toContain('/instalar/guide.js?v=20260911-1');
    expect(html).not.toMatch(/(?:src|href)="assets\//);
    expect(script).toContain('const PUBLIC_ASSET = "/instalar/assets/public/"');
    expect(script).toContain('"/instalar/assets/downloads/segundo-cerebro-autonomo.zip"');
  });

  it("publica somente os ativos preparados e o ZIP instalável", () => {
    const required = [
      "guide.css",
      "guide.js",
      "assets/brands/claude-icon.svg",
      "assets/brands/codex-icon.png",
      "assets/public/claude-comecar.png",
      "assets/public/codex-hooks-ligados.png",
      "assets/downloads/segundo-cerebro-autonomo.zip",
    ];

    for (const relativePath of required) {
      const file = join(publicDir, relativePath);
      expect(existsSync(file), relativePath).toBe(true);
      expect(statSync(file).size, relativePath).toBeGreaterThan(100);
    }

    expect(existsSync(join(publicDir, "assets", "source"))).toBe(false);
    expect(existsSync(join(publicDir, "scripts"))).toBe(false);
  });

  it("remove conclusões futuras quando o usuário volta um passo", () => {
    const script = readFileSync(join(publicDir, "guide.js"), "utf-8");
    expect(script).toContain("state.completed = state.completed.filter((index) => index < targetStep)");
  });
});
