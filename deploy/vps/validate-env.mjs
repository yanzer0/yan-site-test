#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

function unquote(value) {
  if (value.startsWith('"') && value.endsWith('"')) {
    try {
      return JSON.parse(value);
    } catch {
      return value.slice(1, -1);
    }
  }
  if (value.startsWith("'") && value.endsWith("'")) return value.slice(1, -1);
  return value;
}

export function parseEnvironment(text) {
  const environment = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    environment[match[1]] = unquote(match[2]);
  }
  return environment;
}

function isHttps(value) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function isPostgres(value) {
  try {
    return ["postgres:", "postgresql:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

export function validateProductionEnvironment(environment) {
  const errors = [];
  const requireValue = (name, predicate, reason) => {
    const value = environment[name] ?? "";
    if (!value) errors.push(`${name}: ausente`);
    else if (!predicate(value)) errors.push(`${name}: ${reason}`);
  };

  requireValue("POSTGRES_URL", isPostgres, "URL Postgres invalida");
  requireValue("POSTGRES_URL_NON_POOLING", isPostgres, "URL Postgres invalida");
  requireValue("ROTEIRO_ACESSO_CHAVE", (value) => value.length >= 20, "curta demais");
  requireValue("ROTEIRO_WORKER_SECRET", (value) => value.length >= 32, "curto demais");
  requireValue("GOOGLE_CALENDAR_ID", (value) => value.includes("@"), "id invalido");
  requireValue("GOOGLE_SERVICE_ACCOUNT_B64", (value) => {
    try {
      const credential = JSON.parse(Buffer.from(value, "base64").toString("utf8"));
      return Boolean(credential.client_email && credential.private_key);
    } catch {
      return false;
    }
  }, "credencial base64 invalida");
  requireValue("MAPA_PUBLICAR_SECRET", (value) => value.length >= 32, "curto demais");
  requireValue("CAL_WEBHOOK_SECRET", (value) => value.length >= 32, "curto demais");
  requireValue("NEXT_PUBLIC_CAL_URL", isHttps, "URL HTTPS invalida");
  requireValue("NEXT_PUBLIC_MAPA_IA_URL", isHttps, "URL HTTPS invalida");
  requireValue("OPS_ALERT_URL", isHttps, "URL HTTPS invalida");
  requireValue("STRIPE_SECRET_KEY", (value) => /^sk_(?:test|live)_/.test(value), "formato invalido");
  requireValue("STRIPE_WEBHOOK_SECRET", (value) => value.startsWith("whsec_"), "formato invalido");
  requireValue("DEMO_MARJA_USER", (value) => value.length >= 3, "curto demais");
  requireValue("DEMO_MARJA_PASS", (value) => value.length >= 20, "curta demais");
  requireValue(
    "ROTEIRO_PUBLIC_BASE_URL",
    (value) => value === "https://www.useinfuser.com",
    "deve ser https://www.useinfuser.com",
  );

  const secretNames = [
    "CAL_WEBHOOK_SECRET",
    "DEMO_MARJA_PASS",
    "MAPA_PUBLICAR_SECRET",
    "ROTEIRO_ACESSO_CHAVE",
    "ROTEIRO_WORKER_SECRET",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
  ];
  for (let index = 0; index < secretNames.length; index += 1) {
    for (let compared = index + 1; compared < secretNames.length; compared += 1) {
      const first = secretNames[index];
      const second = secretNames[compared];
      if (environment[first] && environment[first] === environment[second]) {
        errors.push(`${first}/${second}: valores criticos duplicados`);
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`Ambiente de producao invalido:\n- ${errors.join("\n- ")}`);
  }
}

async function main() {
  const file = process.argv[2];
  if (!file) throw new Error("Informe o arquivo de ambiente");
  const environment = parseEnvironment(await readFile(file, "utf8"));
  validateProductionEnvironment(environment);
  console.log("production environment validated");
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (import.meta.url === invokedPath) await main();
