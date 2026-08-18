#!/usr/bin/env node
/**
 * Worker do roteiro da Call 1, em modo MANUAL. Ferramenta de emergência.
 *
 * 🔴 O DONO DESTE TRABALHO É A VPS, não esta máquina. Quem roda em produção é o
 * `servico-roteiro.mjs`, de pé na VPS por long-poll, com o brain clonado em
 * `/home/infuser/brain-roteiro`. Este script existe para quando for preciso
 * drenar a fila à mão, e nada mais.
 *
 * Rodar isto com a VPS de pé faz DOIS consumidores disputarem a mesma fila. Em
 * 17/08 uma tarefa agendada do Windows chamava este arquivo a cada 5 minutos e
 * gerou o mesmo roteiro que a VPS já estava gerando, além de abrir um CMD na
 * tela do Yan o dia inteiro. A tarefa foi desabilitada, e a fila ganhou trava
 * (`reservarTrabalho` com `FOR UPDATE SKIP LOCKED`), então hoje o segundo
 * consumidor sai de mãos vazias em vez de duplicar o trabalho. Ainda assim:
 * rode este script sabendo que ele é a exceção.
 *
 * Uso:
 *   node --env-file=.env.local scripts/diagnostico/processar-roteiros.mjs
 *   node --env-file=.env.local scripts/diagnostico/processar-roteiros.mjs --seco
 *
 * Por que o trabalho não roda na Vercel: o `/call-roteiro` lê
 * `_empresa/identidade/pricing.md`, `services.md`, `icp.md` e `positioning.md`.
 * A pasta `_empresa/` é confidencial e não existe no ambiente serverless.
 *
 * O worker faz exatamente o que só ele pode fazer: escrever no disco do brain e
 * rodar o Claude Code dentro dele. Tudo que não exige o brain — montar o card,
 * traduzir resposta, escrever no Google Agenda, mexer na fila — é da API, que
 * tem uma implementação só e testes.
 *
 * Fluxo por agendamento:
 *   1. grava o card do cliente (markdown vem pronto da rota)
 *   2. roda o `/call-roteiro` em modo andaime pelo Claude Code headless
 *   3. valida com `validate-call-card.mjs` — exit 0 é obrigatório
 *   4. manda o HTML para a rota, que escreve no card do evento e fecha a fila
 *
 * 🔴 Nada aqui grava nome, e-mail ou telefone em log. O que aparece no console
 * é o identificador do booking e o slug.
 *
 * Envs:
 *   ROTEIRO_WORKER_SECRET  (sensível)
 *   BRAIN_PATH             caminho do clone do brain (default: o do Yan)
 *   ROTEIRO_BASE_URL       base da API (default: produção)
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const BRAIN =
  process.env.BRAIN_PATH ??
  "C:\\Users\\PC\\Documents\\INFUSER USE - CONSULTORIA DE IA\\yangalasso-brain";
const BASE = process.env.ROTEIRO_BASE_URL ?? "https://useinfuser.com";
const SECO = process.argv.includes("--seco");

function morrer(mensagem) {
  console.error(`\n  ${mensagem}\n`);
  process.exit(1);
}

const segredo = process.env.ROTEIRO_WORKER_SECRET;
if (!segredo) morrer("ROTEIRO_WORKER_SECRET nao esta no ambiente.");
if (!existsSync(BRAIN)) morrer(`brain nao encontrado em ${BRAIN}. Defina BRAIN_PATH.`);

/**
 * Confere que o Claude Code consegue autenticar, ANTES de entrar no laço.
 *
 * Sem isto, um token expirado aparece como `o modelo falhou:` com stderr vazio,
 * uma vez por item da fila, e cada aparição gasta uma tentativa. O item chega
 * ao teto de tentativas por um problema que se resolve com um comando.
 *
 * Ponto que já mordeu de verdade: `CLAUDE_CODE_OAUTH_TOKEN` persistido no nível
 * do usuário no Windows NÃO entra em processo que já estava aberto. Um terminal
 * anterior ao setup continua sem a variável e cai nas credenciais do keychain,
 * que expiram. Por isso a checagem fala do processo, não só do token.
 */
function conferirAutenticacao() {
  const teste = spawnSync("claude", ["-p", "responda apenas: ok"], {
    encoding: "utf8",
    shell: false,
    timeout: 120_000,
  });

  const saida = `${teste.stdout ?? ""}${teste.stderr ?? ""}`.trim();
  if (teste.status === 0 && /ok/i.test(saida)) return;

  console.error(`\n  O Claude Code nao conseguiu autenticar.\n`);
  console.error(`    resposta: ${saida.slice(0, 200) || "(vazia)"}`);
  console.error(`    CLAUDE_CODE_OAUTH_TOKEN neste processo: ${process.env.CLAUDE_CODE_OAUTH_TOKEN ? "presente" : "AUSENTE"}`);
  console.error(`\n  Se estiver AUSENTE, a variavel existe no usuario mas nao neste terminal:`);
  console.error(`  variavel de ambiente so entra em processo aberto DEPOIS dela. Abra um`);
  console.error(`  terminal novo, ou renove o token com:  claude setup-token\n`);
  process.exit(1);
}

async function chamarApi(caminho, opcoes = {}) {
  const resposta = await fetch(`${BASE}${caminho}`, {
    ...opcoes,
    headers: { ...opcoes.headers, "x-roteiro-secret": segredo, "Content-Type": "application/json" },
  });
  const corpo = await resposta.json().catch(() => ({}));
  return { ok: resposta.ok, status: resposta.status, corpo };
}

/**
 * Grava o card no brain, ou recusa quando a pasta já é de outro estágio.
 *
 * FR-024: pasta existente em status diferente de `call-marcada` significa que
 * alguém de uma empresa que já é cliente preencheu o formulário. Isso é
 * conversa de expansão, e sobrescrever apagaria o histórico do cliente. O
 * roteiro continua sendo gerado, apontando para o card que já existe.
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

  if (!SECO) {
    mkdirSync(pasta, { recursive: true });
    writeFileSync(caminho, trabalho.cardMarkdown, "utf8");
  }
  return { pulado: false };
}

/**
 * Roda o `/call-roteiro` pelo Claude Code headless, dentro do brain.
 *
 * `--andaime` é fixo e não é opção: a agenda é única e compartilhada, sem round
 * robin, então o sistema não sabe nem pode saber quem vai conduzir a call. O
 * andaime com as falas literais serve aos três — Iago e Pedro usam as falas,
 * o Yan ignora e usa só os movimentos (FR-015).
 *
 * As ferramentas vão explicitamente permitidas em vez de pular o portão de
 * permissão inteiro. Um worker que roda sozinho não deveria poder executar
 * comando arbitrário: o único Bash liberado é o próprio validador.
 */
function gerarRoteiro(slug) {
  const execucao = spawnSync(
    "claude",
    [
      "-p",
      `/call-roteiro ${slug} --diagnostico --andaime`,
      "--allowedTools",
      "Read,Write,Glob,Grep,Bash(node scripts/validate-call-card.mjs:*)",
    ],
    // Teto de 20 minutos. Sem timeout, uma travada do modelo deixa o processo
    // pendurado para sempre — e num agendamento periódico isso empilha um
    // zumbi por disparo até a máquina engasgar. 20 min é folgado: as execuções
    // medidas ficaram bem abaixo disso.
    { cwd: BRAIN, encoding: "utf8", maxBuffer: 32 * 1024 * 1024, shell: false, timeout: 20 * 60_000 },
  );

  // `timeout` mata por sinal e devolve status null, não um código de saída.
  // Sem este ramo, a mensagem seria "o modelo falhou: sem saida", que esconde
  // a única informação que importa: que estourou o tempo.
  if (execucao.signal) {
    throw new Error(`o modelo estourou o teto de 20 min (sinal ${execucao.signal})`);
  }

  if (execucao.status !== 0) {
    // O CLI escreve erro de autenticação no stdout, não no stderr: olhar só o
    // stderr produzia "o modelo falhou:" seguido de nada.
    const motivo = `${execucao.stderr ?? ""}${execucao.stdout ?? ""}`.trim();
    throw new Error(`o modelo falhou: ${motivo.slice(0, 400) || "sem saida"}`);
  }

  const relativo = `_pipeline/clientes/${slug}/roteiro-call-${slug}-call-1.html`;
  const absoluto = join(BRAIN, relativo);
  if (!existsSync(absoluto)) throw new Error(`o comando terminou mas ${relativo} nao existe`);

  return { relativo, absoluto };
}

/**
 * Roda o validador do brain. Exit 0 é obrigatório (FR-011).
 *
 * O worker valida mesmo que o comando já tenha validado. Confiar que o modelo
 * rodou o portão é o mesmo que não ter portão.
 */
function validar(absoluto) {
  const execucao = spawnSync(
    process.execPath,
    [join(BRAIN, "scripts", "validate-call-card.mjs"), absoluto],
    { cwd: BRAIN, encoding: "utf8", shell: false },
  );
  if (execucao.status !== 0) {
    throw new Error(`validate-call-card reprovou: ${(execucao.stderr || execucao.stdout).trim()}`);
  }
  return (execucao.stdout || "").trim();
}

async function processar(trabalho) {
  console.log(`\n  ── ${trabalho.calBookingId} → ${trabalho.slug}`);
  console.log(`     call em ${trabalho.inicioEm} | tentativa ${trabalho.tentativas + 1}`);

  const card = gravarCard(trabalho);
  console.log(card.pulado ? `     card: PULADO (${card.motivo})` : `     card gravado`);

  if (SECO) {
    console.log(`     [seco] pararia aqui, sem chamar o modelo e sem tocar na fila`);
    return;
  }

  console.log(`     gerando o roteiro (leva minutos)...`);
  const roteiro = gerarRoteiro(trabalho.slug);
  console.log(`     ${validar(roteiro.absoluto)}`);

  const conclusao = await chamarApi("/api/diagnostico/roteiro/concluir", {
    method: "POST",
    body: JSON.stringify({
      calBookingId: trabalho.calBookingId,
      inicioEm: trabalho.inicioEm,
      nome: trabalho.lead.nome,
      empresa: trabalho.lead.empresa,
      roteiroHtml: readFileSync(roteiro.absoluto, "utf8"),
      caminhoRoteiro: roteiro.relativo,
    }),
  });

  if (!conclusao.ok) {
    throw new Error(`a rota recusou: ${conclusao.status} ${conclusao.corpo.erro ?? ""}`);
  }
  console.log(`     roteiro publicado na agenda (${conclusao.corpo.caracteres} caracteres)`);
}

async function main() {
  console.log(`\n  Fila de roteiros — ${BASE}${SECO ? "  [modo seco]" : ""}`);

  const fila = await chamarApi("/api/diagnostico/roteiro/fila");
  if (!fila.ok) morrer(`nao consegui ler a fila: ${fila.status} ${JSON.stringify(fila.corpo)}`);

  const { trabalhos, emRisco } = fila.corpo;

  if (emRisco.length > 0) {
    console.log(`\n  🔴 ${emRisco.length} call(s) em menos de 24h ainda sem roteiro:`);
    for (const item of emRisco) {
      const causa = item.ultimoErro ? ` — ${item.ultimoErro}` : "";
      console.log(`     ${item.calBookingId} em ${item.inicioEm}${causa}`);
    }
  }

  if (trabalhos.length === 0) {
    console.log(`\n  Nada pendente.\n`);
    return;
  }

  console.log(`  ${trabalhos.length} agendamento(s) pendente(s).`);

  if (!SECO) conferirAutenticacao();

  let falhas = 0;
  for (const trabalho of trabalhos) {
    try {
      await processar(trabalho);
    } catch (erro) {
      falhas += 1;
      console.error(`     FALHOU: ${erro.message}`);
      // Quem conta a tentativa e dispara o alerta é a rota. Sem este POST, uma
      // quebra local (modelo, validador, disco) não contaria, e o item voltaria
      // amanhã com o mesmo problema, para sempre.
      await chamarApi("/api/diagnostico/roteiro/concluir", {
        method: "POST",
        body: JSON.stringify({ calBookingId: trabalho.calBookingId, falha: erro.message }),
      }).catch(() => {});
    }
  }

  console.log(`\n  ${trabalhos.length - falhas} concluido(s), ${falhas} com falha.\n`);
  if (falhas > 0) process.exit(2);
}

main().catch((erro) => morrer(`erro: ${erro.message}`));
