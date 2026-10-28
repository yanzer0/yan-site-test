import { describe, expect, it } from "vitest";
import { GUIAS } from "@/lib/guias/catalogo";
import { COOKIE_GUIAS, criarSessaoGuias } from "@/lib/guias/sessao";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";

const base = process.env.TEST_GUIAS_HTTP_URL;
describe.skipIf(!base)("guias pelo servidor HTTP real", () => {
  it("bloqueia central, todos os links, aliases, sublinks e HTMLs diretos", async () => {
    const caminhos = ["/guias", ...GUIAS.flatMap((guia) => [guia.caminho, ...guia.aliases, `/${guia.arquivo}`, `/guias/${guia.slug}`])];
    for (const caminho of caminhos) {
      const response = await fetch(new URL(caminho, base), { redirect: "manual" });
      expect(response.status, caminho).toBe(307);
      expect(new URL(response.headers.get("location")!, base).pathname, caminho).toBe("/guias/acesso");
      expect(response.headers.get("cache-control"), caminho).toContain("no-store");
    }
  });
  it("não aceita cookie falso nem cabeçalho de subrequest do cliente", async () => {
    for (const headers of [{ cookie: `${COOKIE_GUIAS}=forjado` }, { "x-middleware-subrequest": "middleware:middleware:middleware:middleware:middleware" }] as Record<string, string>[]) {
      const response = await fetch(new URL("/guia-agentes.html", base), { headers, redirect: "manual" });
      expect(response.status).toBe(307);
    }
    for (const caminho of ["/%67uia-agentes.html", "/guia%2Dagentes.html", "/guia-agentes%2Ehtml"]) {
      expect((await fetch(new URL(caminho, base), { redirect: "manual" })).status).toBe(307);
    }
  });
  it("redireciona para o domínio público quando está atrás do proxy", async () => {
    const url = new URL("/guias", base);
    const enviar = url.protocol === "https:" ? httpsRequest : httpRequest;
    // Send the proxy Host explicitly, without browser Fetch header normalization.
    const response = await new Promise<{ status?: number; location?: string }>((resolve, reject) => {
      const request = enviar(url, { headers: { Host: "www.useinfuser.com", "X-Forwarded-Host": "www.useinfuser.com", "X-Forwarded-Proto": "https" } }, (response) => {
        response.resume(); response.on("end", () => resolve({ status: response.statusCode, location: response.headers.location }));
      });
      request.on("error", reject); request.end();
    });
    expect(response.status).toBe(307);
    expect(response.location).toBe("https://www.useinfuser.com/guias/acesso");
  });
  it("serve o formulário contextual e nega dados da equipe", async () => {
    const response = await fetch(new URL("/guias/acesso?guia=skills", base));
    expect(response.status).toBe(200);
    const html = await response.text();
    expect(html).toContain("Crie skills");
    for (const name of ["nome", "email", "whatsapp", "nicho", "interesse", "impedimento"]) expect(html).toContain(`name="${name}"`);
    expect((await fetch(new URL("/leads/guias/export", base), { redirect: "manual" })).status).toBe(404);
  });
  it.skipIf(!process.env.GUIAS_ACCESS_SECRET)("sessão assinada libera biblioteca e HTML original", async () => {
    const token = await criarSessaoGuias("ace670b8-7ae9-4bc5-8ddd-9017cef542c4");
    const headers = { cookie: `${COOKIE_GUIAS}=${token}` };
    const biblioteca = await fetch(new URL("/guias", base), { headers, redirect: "manual" });
    expect(biblioteca.status).toBe(200);
    expect((await biblioteca.text()).match(/data-guia /g)).toHaveLength(16);
    const guia = await fetch(new URL("/guia-agentes.html", base), { headers, redirect: "manual" });
    expect(guia.status).toBe(200);
    expect((await guia.text()).length).toBeGreaterThan(1000);
    expect(guia.headers.get("cache-control")).toContain("no-store");
  });
});
