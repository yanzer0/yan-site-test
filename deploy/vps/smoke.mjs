#!/usr/bin/env node

const baseUrl = new URL(process.argv[2] ?? "http://127.0.0.1:3000");
const expectedRelease = process.argv[3] ?? process.env.APP_RELEASE;

const publicPaths = [
  "/",
  "/agente-que-aprende",
  "/club",
  "/comunidade",
  "/diagnostico",
  "/guia-agentes",
  "/guia-comandos-gpt",
  "/guia-gpt6-astra",
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
  "/tutorial-maestri",
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

await check("/demomarja", [401]);
await check("/leads", [302, 303, 307, 308]);
await check("/leads/entrar", [200]);
await check("/leads/equipe", [302, 303, 307, 308]);
// The export deliberately hides its existence from unauthenticated callers.
await check("/leads/export", [404]);
await check("/api/diagnostico/roteiro/fila", [401]);
await check("/api/diagnostico/cal-webhook", [404, 405]);
await check("/api/diagnostico/mapa-pago/webhook", [404, 405]);
await check("/__smoke_missing__", [404]);

console.log(JSON.stringify({ ok: true, baseUrl: baseUrl.origin, checks }, null, 2));
