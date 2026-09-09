#!/usr/bin/env node

const baseUrl = new URL(process.argv[2] ?? "http://127.0.0.1:3000");
const expectedRelease = process.argv[3] ?? process.env.APP_RELEASE;

const publicPaths = [
  "/",
  "/agente-que-aprende",
  "/club",
  "/comunidade",
  "/diagnostico",
  "/demodome",
  "/guia-agentes",
  "/guia-comandos-gpt",
  "/guia-gpt6-astra",
  "/guia-ia-sem-bajulacao",
  "/guia-mapeamento-processos",
  "/guia-skill",
  "/kit-jarvis",
  "/kit-segundo-cerebro",
  "/kit-skills",
  "/kit-vscode",
  "/legiao",
  "/opus5",
  "/pos",
  "/pos/obrigado",
  "/pos/oferta-final",
  "/privacidade",
  "/protocolo-de-autoria",
  "/termos",
  "/time",
  "/tutorial-maestri",
];

const skillTreeAssets = [
  "/skilltree.css",
  "/skilltree.js",
  "/skilltree-auth.js",
  "/skilltree-model.js",
  "/skilltree-route.js",
  "/skilltree-standalone.css",
  "/skilltree-standalone.js",
  "/skilltree-assets/infuser-v2-icon-lime.svg",
];

const checks = [];

async function check(path, expectedStatuses, options = {}) {
  const url = new URL(path, baseUrl);
  const startedAt = performance.now();
  const response = await fetch(url, { redirect: "manual", ...options });
  const durationMs = Math.round(performance.now() - startedAt);
  const body = await response.text();

  if (!expectedStatuses.includes(response.status)) {
    throw new Error(`${path}: expected ${expectedStatuses.join("/")}, got ${response.status}`);
  }
  if (/deployment is temporarily paused/i.test(body)) {
    throw new Error(`${path}: Vercel pause page reached instead of the VPS release`);
  }

  checks.push({ path, status: response.status, durationMs });
  return { response, body };
}

const health = await check("/api/health", [200]);
const healthBody = JSON.parse(health.body);
if (!healthBody.ok || healthBody.service !== "useinfuser-site") {
  throw new Error("/api/health: invalid service payload");
}
if (expectedRelease && healthBody.release !== expectedRelease) {
  throw new Error(`/api/health: expected release ${expectedRelease}, got ${healthBody.release}`);
}

for (const path of publicPaths) {
  const result = await check(path, [200]);
  if (result.body.length < 100) throw new Error(`${path}: response body is unexpectedly small`);
}

for (const path of skillTreeAssets) {
  const result = await check(path, [200]);
  if (result.body.length < 100) throw new Error(`${path}: response body is unexpectedly small`);
}

const protectedDemo = await check("/demomarja", [401]);
if (!protectedDemo.response.headers.get("www-authenticate")?.startsWith("Basic")) {
  throw new Error("/demomarja: Basic authentication challenge is missing");
}
await check("/leads", [302, 303, 307, 308]);
const leadsLogin = await check("/leads/entrar", [200]);
if (!leadsLogin.response.headers.get("content-security-policy")?.includes("frame-ancestors 'none'")) {
  throw new Error("/leads/entrar: protected CSP is missing");
}
await check("/leads/equipe", [302, 303, 307, 308]);
// The export deliberately hides its existence from unauthenticated callers.
await check("/leads/export", [404]);
// Authentication runs before the dynamic id validator, so an anonymous caller
// must be redirected without learning whether the id exists.
await check("/leads/not-a-uuid", [302, 303, 307, 308]);
await check("/api/diagnostico/roteiro/fila", [401]);
await check("/api/diagnostico/mapa/respostas", [401]);
await check("/api/diagnostico/cal-webhook", [404, 405]);
await check("/api/diagnostico/mapa-pago/webhook", [404, 405]);
await check("/api/diagnostico/mapa/publicar", [405]);
await check("/api/diagnostico/parcial", [405]);
await check("/api/diagnostico/submit", [405]);
await check("/api/diagnostico/roteiro/concluir", [405]);
await check("/api/agentes", [401]);
await check("/api/organization", [401]);
await check("/mapa/not-a-token", [404]);
await check("/roteiro/not-a-token", [404]);
await check("/roteiro/entrar", [200]);
await check("/diagnostico/pago", [200]);
await check("/icon.svg", [200]);
await check("/segundo-cerebro", [307]);
await check("/legiaodeagentes", [307]);
await check("/__smoke_missing__", [404]);

console.log(JSON.stringify({ ok: true, baseUrl: baseUrl.origin, checks }, null, 2));
