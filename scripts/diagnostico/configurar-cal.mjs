#!/usr/bin/env node
/**
 * Cria o tipo de evento da Call 1 no Cal.com, o webhook, e imprime as duas
 * variáveis de ambiente que o funil precisa.
 *
 * Uso:
 *   $env:CAL_API_KEY="cal_live_..."   (PowerShell)
 *   node scripts/diagnostico/configurar-cal.mjs
 *
 * A chave sai de: Cal.com -> Settings -> Developer -> API keys -> Add.
 * Ela NUNCA é gravada em arquivo por este script.
 *
 * É idempotente no que dá: se o tipo de evento com o mesmo slug já existir,
 * ele reaproveita em vez de criar um segundo. Webhook duplicado é detectado
 * pela mesma subscriberUrl.
 *
 * Decisões que viraram parâmetro, vindas de specs/001 (FR-030):
 *   - 60 minutos de call
 *   - 60 minutos de intervalo depois, para não emendar duas
 *   - agenda única e compartilhada, sem round robin
 */

const API = "https://api.cal.com/v2";
const VERSAO_EVENT_TYPES = "2024-06-14";

const SLUG = "diagnostico";
const TITULO = "Call de diagnóstico";
const DURACAO_MIN = 60;
const INTERVALO_DEPOIS_MIN = 60;

const URL_WEBHOOK = "https://useinfuser.com/api/diagnostico/cal-webhook";
const GATILHOS = ["BOOKING_CREATED", "BOOKING_CANCELLED", "BOOKING_RESCHEDULED"];

const DESCRICAO = [
  "Uma hora para entender como o seu processo funciona hoje e onde IA e automação encaixam.",
  "",
  "É diagnóstico, não apresentação comercial. Não tem proposta nem preço nessa conversa.",
  "No fim você recebe o mapa da operação por escrito.",
].join("\n");

const chave = process.env.CAL_API_KEY;
if (!chave) {
  console.error("\n  CAL_API_KEY nao esta no ambiente.\n");
  console.error("  Pegue em: Cal.com > Settings > Developer > API keys > Add");
  console.error("  Depois rode:\n");
  console.error('    $env:CAL_API_KEY="cal_live_..."');
  console.error("    node scripts/diagnostico/configurar-cal.mjs\n");
  process.exit(1);
}

async function chamar(caminho, opcoes = {}) {
  const resposta = await fetch(`${API}${caminho}`, {
    ...opcoes,
    headers: {
      Authorization: `Bearer ${chave}`,
      "Content-Type": "application/json",
      ...(opcoes.headers ?? {}),
    },
  });

  const texto = await resposta.text();
  let corpo;
  try {
    corpo = JSON.parse(texto);
  } catch {
    corpo = { raw: texto };
  }

  if (!resposta.ok) {
    const detalhe = corpo?.error?.message ?? corpo?.message ?? texto.slice(0, 300);
    throw new Error(`${opcoes.method ?? "GET"} ${caminho} -> ${resposta.status}: ${detalhe}`);
  }
  return corpo;
}

/** Segredo forte para a assinatura HMAC do webhook. */
function gerarSegredo() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function main() {
  console.log("\n  Identificando a conta...");
  const eu = await chamar("/me", { headers: { "cal-api-version": VERSAO_EVENT_TYPES } });
  const usuario = eu?.data?.username ?? eu?.username;
  if (!usuario) throw new Error("nao consegui ler o username da conta");
  console.log(`  Conta: ${usuario}\n`);

  // ── tipo de evento ──
  console.log("  Procurando tipo de evento existente...");
  const existentes = await chamar(`/event-types?username=${encodeURIComponent(usuario)}`, {
    headers: { "cal-api-version": VERSAO_EVENT_TYPES },
  });
  const lista = existentes?.data ?? [];
  let evento = lista.find((e) => e.slug === SLUG);

  if (evento) {
    console.log(`  Ja existia: id=${evento.id} slug=${evento.slug}`);
  } else {
    console.log("  Criando...");
    const criado = await chamar("/event-types", {
      method: "POST",
      headers: { "cal-api-version": VERSAO_EVENT_TYPES },
      body: JSON.stringify({
        title: TITULO,
        slug: SLUG,
        lengthInMinutes: DURACAO_MIN,
        description: DESCRICAO,
        afterEventBuffer: INTERVALO_DEPOIS_MIN,
      }),
    });
    evento = criado?.data ?? criado;
    console.log(`  Criado: id=${evento.id} slug=${evento.slug}`);
  }

  // ── webhook ──
  console.log("\n  Verificando webhooks...");
  let segredo = gerarSegredo();
  const webhooks = await chamar("/webhooks");
  const jaExiste = (webhooks?.data ?? []).find((w) => w.subscriberUrl === URL_WEBHOOK);

  if (jaExiste) {
    console.log(`  Ja existia um webhook para essa URL: id=${jaExiste.id}`);
    console.log("  NAO vou recriar. Se precisar de um segredo novo, apague o antigo no painel.");
    segredo = null;
  } else {
    console.log("  Criando webhook...");
    const criado = await chamar("/webhooks", {
      method: "POST",
      body: JSON.stringify({
        subscriberUrl: URL_WEBHOOK,
        triggers: GATILHOS,
        active: true,
        secret: segredo,
      }),
    });
    const w = criado?.data ?? criado;
    console.log(`  Criado: id=${w.id}`);
  }

  // ── saída ──
  const urlEvento = `https://cal.com/${usuario}/${SLUG}`;

  console.log("\n  ─────────────────────────────────────────────");
  console.log("  Variaveis para o projeto na Vercel:\n");
  console.log(`    NEXT_PUBLIC_CAL_URL=${urlEvento}`);
  if (segredo) {
    console.log(`    CAL_WEBHOOK_SECRET=${segredo}`);
  } else {
    console.log("    CAL_WEBHOOK_SECRET=<o webhook ja existia, use o segredo dele>");
  }
  console.log("\n  ─────────────────────────────────────────────\n");
  console.log(`  Pagina publica do evento: ${urlEvento}`);
  console.log(`  Duracao: ${DURACAO_MIN} min, com ${INTERVALO_DEPOIS_MIN} min de intervalo depois.`);
  console.log("\n  A DISPONIBILIDADE (dias e horarios) segue o schedule padrao da conta.");
  console.log("  Confira em Cal.com > Availability se bate com dias uteis em horario comercial.\n");
}

main().catch((erro) => {
  console.error(`\n  Erro: ${erro.message}\n`);
  process.exit(1);
});
