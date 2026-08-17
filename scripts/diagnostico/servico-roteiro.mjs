#!/usr/bin/env node
/**
 * Serviço que gera o roteiro da Call 1 assim que a call é marcada.
 *
 * Roda na VPS da Infuser como unit systemd, em loop, drenando a fila por
 * long-poll. Substitui o `processar-roteiros.mjs`, que rodava por agendamento
 * na máquina do Yan e dependia dela estar ligada.
 *
 * ## Por que long-poll, e não um endpoint público na VPS
 *
 * O Caddy da VPS serve 9 domínios de cliente. Abrir porta, subdomínio e
 * certificado para o webhook empurrar ganharia uns 20 segundos num processo que
 * leva 3 minutos, em troca de mexer no proxy de produção. Aqui a VPS PERGUNTA e
 * a conexão fica aberta esperando: latência de segundos, zero superfície nova,
 * zero mudança no Caddy.
 *
 * ## Por que a fila continua existindo
 *
 * Ela é o log durável. Se este serviço cair, o agendamento fica na fila e é
 * processado quando ele voltar. O webhook nunca depende da VPS estar de pé.
 *
 * ## O que este serviço faz que a API não pode fazer
 *
 * Só duas coisas, e é por isso que ele existe: escrever no disco do brain e
 * rodar o Claude Code dentro dele. Montar o card, converter em PDF, subir no
 * Drive, anexar no evento e mexer na fila é tudo da API, que tem uma
 * implementação e testes.
 *
 * 🔴 Nada aqui grava nome, e-mail ou telefone em log.
 *
 * Envs:
 *   ROTEIRO_WORKER_SECRET     (sensível)
 *   CLAUDE_CODE_OAUTH_TOKEN   (sensível)
 *   BRAIN_PATH                clone dedicado (default: /home/infuser/brain-roteiro)
 *   ROTEIRO_BASE_URL          base da API (default: produção)
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const BRAIN = process.env.BRAIN_PATH ?? "/home/infuser/brain-roteiro";
const BASE = process.env.ROTEIRO_BASE_URL ?? "https://useinfuser.com";
const SEGREDO = process.env.ROTEIRO_WORKER_SECRET;

/** Quanto a API segura a resposta esperando trabalho aparecer. */
const ESPERA_S = 25;
/** Teto do gerador. Sem isto, um modelo travado pendura o serviço para sempre. */
const TIMEOUT_MODELO_MS = 20 * 60_000;
/** Pausa depois de erro de rede, para não martelar a API num apagão. */
const PAUSA_APOS_ERRO_MS = 30_000;

let encerrando = false;

function registrar(nivel, mensagem) {
  // journald já carimba a hora; repetir aqui seria ruído no `journalctl`.
  console.log(`[${nivel}] ${mensagem}`);
}

function morrer(mensagem) {
  registrar("erro", mensagem);
  process.exit(1);
}

if (!SEGREDO) morrer("ROTEIRO_WORKER_SECRET ausente");
if (!existsSync(BRAIN)) morrer(`brain nao encontrado em ${BRAIN}`);

/**
 * Desligamento gracioso.
 *
 * O systemd manda SIGTERM em todo `restart` e `stop`. Sem isto, um deploy no
 * meio de uma geração mataria o processo com o roteiro pela metade, e o item
 * voltaria para a fila gastando uma tentativa por um problema que não é dele.
 * Aqui o item em voo termina; o que não começa é o próximo.
 */
for (const sinal of ["SIGTERM", "SIGINT"]) {
  process.on(sinal, () => {
    if (encerrando) process.exit(0);
    encerrando = true;
    registrar("info", `${sinal} recebido: termino o item em voo e saio`);
  });
}

async function chamarApi(caminho, opcoes = {}) {
  const resposta = await fetch(`${BASE}${caminho}`, {
    ...opcoes,
    headers: { ...opcoes.headers, "x-roteiro-secret": SEGREDO, "Content-Type": "application/json" },
  });
  const corpo = await resposta.json().catch(() => ({}));
  return { ok: resposta.ok, status: resposta.status, corpo };
}

/**
 * Grava o card no brain e devolve o caminho relativo.
 *
 * FR-024: pasta existente em status diferente de `call-marcada` significa que
 * alguém de uma empresa que já é cliente preencheu o formulário. Sobrescrever
 * apagaria o histórico dele, então o card é preservado e o roteiro continua.
 */
function gravarCard(trabalho) {
  const pasta = join(BRAIN, "_pipeline", "clientes", trabalho.slug);
  const caminho = join(pasta, `${trabalho.slug}.md`);

  const statusAtual = existsSync(caminho)
    ? (readFileSync(caminho, "utf8").match(/^status:\s*(\S+)/m)?.[1] ?? null)
    : null;

  if (statusAtual && statusAtual !== "call-marcada") {
    return { pulado: true, motivo: `card ja existe em status "${statusAtual}"` };
  }

  mkdirSync(pasta, { recursive: true });
  writeFileSync(caminho, trabalho.cardMarkdown, "utf8");
  return { pulado: false };
}

/**
 * Roda o `/call-roteiro` pelo Claude Code headless, dentro do brain.
 *
 * `--settings` aponta para um arquivo mínimo SEM hooks. O `.claude/settings.json`
 * do brain registra 6 eventos, e o `Stop` roda o `check-brain-consistency.js`,
 * que faz `process.exit(2)` quando bloqueia. Exit 2 num hook de Stop impede o
 * turno de terminar, e o comando nunca devolveria.
 *
 * `--andaime` é fixo: a agenda é única e compartilhada, sem round robin, então
 * o sistema não sabe nem pode saber quem vai conduzir a call (FR-015).
 *
 * Ferramentas explícitas em vez de pular o portão inteiro: um serviço que roda
 * sozinho não deveria poder executar comando arbitrário.
 */
function gerarRoteiro(slug) {
  const execucao = spawnSync(
    "claude",
    [
      "-p",
      `/call-roteiro ${slug} --diagnostico --andaime`,
      "--settings",
      join(BRAIN, ".claude", "settings-worker.json"),
      "--allowedTools",
      "Read,Write,Glob,Grep,Bash(node scripts/validate-call-card.mjs:*)",
    ],
    {
      cwd: BRAIN,
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
      shell: false,
      timeout: TIMEOUT_MODELO_MS,
      // stdin fechado explicitamente. Como serviço systemd o stdin fica aberto
      // e nunca entrega nada; o CLI espera 3 segundos por dado que não vem e
      // avisa "no stdin data received". Fechar tira a espera e o ruído do log.
      input: "",
    },
  );

  // `timeout` mata por sinal e devolve status null, não código de saída.
  if (execucao.signal) {
    throw new Error(`o modelo estourou o teto de 20 min (sinal ${execucao.signal})`);
  }
  if (execucao.status !== 0) {
    // O CLI escreve erro de autenticação no stdout, não no stderr.
    const motivo = `${execucao.stderr ?? ""}${execucao.stdout ?? ""}`.trim();
    throw new Error(`o modelo falhou: ${motivo.slice(0, 400) || "sem saida"}`);
  }

  const relativo = `_pipeline/clientes/${slug}/roteiro-call-${slug}-call-1.html`;
  const absoluto = join(BRAIN, relativo);
  if (!existsSync(absoluto)) throw new Error(`o comando terminou mas ${relativo} nao existe`);

  return { relativo, absoluto };
}

/**
 * Endereço do Gotenberg, descoberto no Docker.
 *
 * O container está na rede `infuser-net` e NÃO publica porta no host, então
 * `localhost:3000` não resolve. Publicar a porta seria mexer no compose de um
 * serviço de produção; perguntar o IP ao Docker não mexe em nada.
 *
 * O IP muda quando o container é recriado (raro), por isso é resolvido a cada
 * conversão em vez de ficar guardado.
 */
function enderecoDoGotenberg() {
  if (process.env.GOTENBERG_URL) return process.env.GOTENBERG_URL;

  const consulta = spawnSync(
    "docker",
    ["inspect", "-f", "{{range .NetworkSettings.Networks}}{{.IPAddress}} {{end}}", "gotenberg"],
    { encoding: "utf8", shell: false, timeout: 15_000 },
  );
  const ip = (consulta.stdout ?? "").trim().split(/\s+/)[0];
  if (consulta.status !== 0 || !ip) {
    throw new Error("nao consegui descobrir o IP do container gotenberg");
  }
  return `http://${ip}:3000`;
}

/**
 * HTML para PDF pelo Gotenberg.
 *
 * Roda AQUI e não na rota da API porque o Gotenberg vive na rede interna da
 * VPS. A alternativa seria expor um conversor de documentos à internet só para
 * a Vercel alcançar, o que é abrir superfície por conveniência de arquitetura.
 *
 * O arquivo precisa se chamar `index.html`: é o nome que o Chromium do
 * Gotenberg abre. Outro nome devolve 400 sem dizer por quê.
 */
async function converterEmPdf(html) {
  const forma = new FormData();
  forma.append("files", new Blob([html], { type: "text/html" }), "index.html");
  forma.append("printBackground", "true");
  forma.append("marginTop", "0.4");
  forma.append("marginBottom", "0.4");

  const controle = new AbortController();
  const alarme = setTimeout(() => controle.abort(), 60_000);
  try {
    const resposta = await fetch(`${enderecoDoGotenberg()}/forms/chromium/convert/html`, {
      method: "POST",
      body: forma,
      signal: controle.signal,
    });
    if (!resposta.ok) throw new Error(`gotenberg respondeu ${resposta.status}`);

    const pdf = Buffer.from(await resposta.arrayBuffer());
    if (pdf.subarray(0, 4).toString("latin1") !== "%PDF") {
      throw new Error("gotenberg devolveu algo que nao e PDF");
    }
    return pdf;
  } finally {
    clearTimeout(alarme);
  }
}

/**
 * Tira os comentários HTML antes de virar documento.
 *
 * O template do roteiro carrega instrução de geração em comentário, e comentário
 * viaja no arquivo mesmo sem aparecer na tela. Documento que sai daqui não leva
 * instrução interna junto.
 */
function limparComentarios(html) {
  return html.replace(/<!--[\s\S]*?-->/g, "");
}

/** O validador do brain. Exit 0 é obrigatório (FR-011), e este serviço não confia no modelo. */
function validar(absoluto) {
  const execucao = spawnSync(
    process.execPath,
    [join(BRAIN, "scripts", "validate-call-card.mjs"), absoluto],
    { cwd: BRAIN, encoding: "utf8", shell: false, timeout: 60_000 },
  );
  if (execucao.status !== 0) {
    throw new Error(`validate-call-card reprovou: ${(execucao.stderr || execucao.stdout).trim()}`);
  }
  return (execucao.stdout || "").trim();
}

/**
 * Empurra o card e o roteiro para o GitHub.
 *
 * `pull --rebase` antes do push porque este não é o único clone que empurra: o
 * `sync-to-git.sh` e a máquina do Yan também. Sem rebase, o push é rejeitado e
 * o card fica preso aqui, invisível para o time.
 *
 * Falhar aqui NÃO derruba o item: o roteiro já existe e vai ser anexado no
 * evento de qualquer jeito. O que se perde é o card chegar ao time agora, e
 * isso o próximo push recupera.
 */
function publicarNoGit(slug) {
  const git = (...args) =>
    spawnSync("git", args, { cwd: BRAIN, encoding: "utf8", shell: false, timeout: 120_000 });

  git("add", `_pipeline/clientes/${slug}`);
  const commit = git("commit", "-m", `brain: card e roteiro da Call 1 de ${slug}`, "--no-verify");

  // "Nada mudou" NÃO é falha: acontece sempre que o card é reprocessado sem
  // alteração. O git tem DUAS frases para isso e eu só cobria uma — com algo
  // staged diz "nothing to commit", sem nada staged diz "no changes added to
  // commit". A segunda virou um aviso de erro falso no log da primeira
  // execução real.
  const nadaMudou = /nothing to commit|no changes added to commit/i.test(
    `${commit.stdout ?? ""}${commit.stderr ?? ""}`,
  );
  if (commit.status !== 0 && !nadaMudou) {
    throw new Error(`commit falhou: ${(commit.stderr || commit.stdout).slice(0, 200)}`);
  }
  if (nadaMudou) return;

  git("pull", "--rebase", "--autostash");
  const push = git("push", "origin", "HEAD");
  if (push.status !== 0) {
    throw new Error(`push falhou: ${(push.stderr || push.stdout).slice(0, 200)}`);
  }
}

async function processar(trabalho) {
  registrar("info", `inicio booking=${trabalho.calBookingId} slug=${trabalho.slug} tentativa=${trabalho.tentativas + 1}`);

  const card = gravarCard(trabalho);
  registrar("info", card.pulado ? `card pulado: ${card.motivo}` : "card gravado");

  const roteiro = gerarRoteiro(trabalho.slug);
  registrar("info", validar(roteiro.absoluto));

  const pdf = await converterEmPdf(limparComentarios(readFileSync(roteiro.absoluto, "utf8")));
  registrar("info", `pdf gerado: ${Math.round(pdf.length / 1024)} kB`);

  const conclusao = await chamarApi("/api/diagnostico/roteiro/concluir", {
    method: "POST",
    body: JSON.stringify({
      calBookingId: trabalho.calBookingId,
      inicioEm: trabalho.inicioEm,
      email: trabalho.lead.email,
      nome: trabalho.lead.nome,
      empresa: trabalho.lead.empresa,
      pdfBase64: pdf.toString("base64"),
      caminhoRoteiro: roteiro.relativo,
    }),
  });

  if (!conclusao.ok) {
    throw new Error(`a rota recusou: ${conclusao.status} ${conclusao.corpo.erro ?? ""}`);
  }
  registrar("info", `anexado no evento ${conclusao.corpo.eventoId} (${conclusao.corpo.bytes} bytes de PDF)`);

  try {
    publicarNoGit(trabalho.slug);
    registrar("info", "card publicado no git");
  } catch (erro) {
    // Não relança: o roteiro já está no evento, que é o que a call precisa.
    registrar("aviso", `card nao chegou ao git: ${erro.message}`);
  }

  registrar("info", `fim booking=${trabalho.calBookingId}`);
}

async function umaVolta() {
  const fila = await chamarApi(`/api/diagnostico/roteiro/fila?esperar=${ESPERA_S}`);
  if (!fila.ok) {
    registrar("erro", `fila respondeu ${fila.status}`);
    return { pausar: true };
  }

  const { trabalhos = [], emRisco = [], mortos = [] } = fila.corpo;

  // A fila morta some de `trabalhos` por desenho (o filtro de tentativas), então
  // sem este aviso ela vira silêncio, e silêncio parece sucesso.
  for (const item of mortos) {
    registrar("erro", `ESGOTOU as tentativas: booking=${item.calBookingId} call=${item.inicioEm} ultimo=${item.ultimoErro ?? "?"}`);
  }
  for (const item of emRisco) {
    registrar("aviso", `call em menos de 24h sem roteiro: booking=${item.calBookingId} call=${item.inicioEm}`);
  }

  for (const trabalho of trabalhos) {
    if (encerrando) break;
    try {
      await processar(trabalho);
    } catch (erro) {
      registrar("erro", `booking=${trabalho.calBookingId} FALHOU: ${erro.message}`);
      // Quem conta a tentativa e dispara o alerta é a rota. Sem este POST, uma
      // quebra local não contaria e o item voltaria para sempre.
      await chamarApi("/api/diagnostico/roteiro/concluir", {
        method: "POST",
        body: JSON.stringify({ calBookingId: trabalho.calBookingId, falha: erro.message }),
      }).catch(() => {});
    }
  }

  return { pausar: false };
}

registrar("info", `servico de roteiro de pe | brain=${BRAIN} | api=${BASE} | espera=${ESPERA_S}s`);

while (!encerrando) {
  try {
    const { pausar } = await umaVolta();
    if (pausar && !encerrando) await new Promise((r) => setTimeout(r, PAUSA_APOS_ERRO_MS));
  } catch (erro) {
    registrar("erro", `volta falhou: ${erro.message}`);
    if (!encerrando) await new Promise((r) => setTimeout(r, PAUSA_APOS_ERRO_MS));
  }
}

registrar("info", "encerrado");
