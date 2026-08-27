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
 * rodar o Claude Code dentro dele. Montar o card, escrever no Google Agenda e
 * mexer na fila é tudo da API, que tem uma
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
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
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
 * evento de qualquer jeito. O que se perde é o card chegar ao time agora.
 *
 * 🔴 27/08/2026 — as três travas abaixo nasceram de uma quebra real. Um
 * `pull --rebase --autostash` conflitou em 25/08 e deixou `_memory/current-state.md`
 * unmerged no índice. Ninguém percebeu: o `git commit` passou a falhar com
 * "Committing is not possible because you have unmerged files", a exceção era
 * engolida como aviso, e por dois dias TODO card foi gerado, gravado no disco e
 * nunca chegou ao git. Os cards de `carloscostaprev`, `grupo-makron` e
 * `lroth-advisor` ficaram presos aqui, e o time trabalhou sem eles.
 *
 * Pior: o mesmo estado sujo fez o commit de 25/08 varrer o índice inteiro. Ele
 * se chamava "card e roteiro da Call 1 de bmb" e, junto, APAGOU o card de
 * `vertex-componentes` — 102 linhas de cliente, num commit que dizia falar de
 * outro. Commit sem pathspec leva o que estiver staged, e a mensagem mente.
 */
function publicarNoGit(slug) {
  const git = (...args) =>
    spawnSync("git", args, { cwd: BRAIN, encoding: "utf8", shell: false, timeout: 120_000 });

  const caminho = `_pipeline/clientes/${slug}`;

  // TRAVA 1 — fail-closed em clone conflitado, ANTES de escrever qualquer coisa.
  // É a mesma trava que o `sync-to-git.sh` já tinha e esta esteira não tinha. Sem
  // ela o erro só aparece no `git commit`, depois de mexer no índice, e some no
  // log. A mensagem diz o comando exato porque quem lê isto está destravando.
  const unmerged = git("ls-files", "--unmerged");
  if ((unmerged.stdout ?? "").trim()) {
    const arquivos = [
      ...new Set(
        (unmerged.stdout ?? "")
          .trim()
          .split("\n")
          .map((linha) => linha.split("\t")[1])
          .filter(Boolean),
      ),
    ];
    throw new Error(
      `clone conflitado (arquivo unmerged): ${arquivos.join(", ")}. ` +
        `Nenhum card sai daqui ate resolver: cd ${BRAIN} && git reset --hard origin/main`,
    );
  }

  git("add", caminho);

  // TRAVA 2 — pathspec no commit. Com pathspec o git commita o conteudo DESTES
  // caminhos e ignora o resto do indice, entao lixo staged de uma execucao
  // anterior nunca mais viaja de carona numa mensagem que fala de outro cliente.
  const commit = git(
    "commit",
    "--no-verify",
    "-m",
    `brain: card e roteiro da Call 1 de ${slug}`,
    "--",
    caminho,
  );

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

  // TRAVA 3 — índice e árvore voltam ao commit que acabou de sair, antes do rebase.
  //
  // Este clone é DERIVADO: nada aqui é escrito por gente. O que sobra fora da
  // pasta do cliente é indice regenerado pelo proprio `/call-roteiro` (INDEX.md,
  // pendencias-trigger.md), que a maquina do Yan regenera de qualquer jeito.
  // Guardar essa sujeira era o que dava material para o `--autostash` conflitar,
  // e foi assim que o clone travou. Arvore limpa faz o rebase ser trivial, e por
  // isso o `--autostash` deixou de ser necessario.
  //
  // `reset --hard` e nao `checkout -- .`: o segundo limpa a ARVORE e deixa o
  // INDICE sujo, e ai o `pull --rebase` recusa com "your index contains
  // uncommitted changes" — o card ficaria preso do mesmo jeito, so com outra
  // frase. A prova `provar-publicacao-do-card.mjs` pegou exatamente isso.
  // Seguro porque o card ja esta commitado nesta altura, e arquivo nao rastreado
  // o reset nao toca.
  git("reset", "--hard", "HEAD");

  const pull = git("pull", "--rebase");
  if (pull.status !== 0) {
    // Sem isto o rebase interrompido fica de pe e envenena TODA execucao
    // seguinte — que e exatamente a falha que estas travas existem para matar.
    git("rebase", "--abort");
    throw new Error(`pull --rebase falhou (rebase abortado): ${(pull.stderr || pull.stdout).slice(0, 200)}`);
  }

  const push = git("push", "origin", "HEAD");
  if (push.status !== 0) {
    throw new Error(`push falhou: ${(push.stderr || push.stdout).slice(0, 200)}`);
  }
}

/**
 * Alerta o Yan pelo canal de OPS que já existe (webhook n8n `ops-alert`).
 *
 * O card que não chega ao git é invisível: o roteiro vai para o evento, a call
 * acontece, e nada denuncia que o CRM ficou para trás. Antes disto o sinal era
 * uma linha de `[aviso]` num log que ninguém abre, e ela ficou dois dias no ar
 * sem ser lida. Best-effort de propósito: alerta que falha não pode derrubar o
 * item, porque o roteiro — que é o que a call precisa — já está entregue.
 */
function alertarOps(fonte, mensagem) {
  const comando = process.env.OPS_ALERT_CMD ?? "/home/infuser/ops-alert.sh";
  if (!existsSync(comando)) return;
  spawnSync(comando, [fonte, "critico", mensagem], {
    encoding: "utf8",
    shell: false,
    timeout: 30_000,
  });
}

/**
 * Traz o clone para o `main` de origem ANTES de gerar.
 *
 * 🔴 O `/call-roteiro`, o template canônico e o `validate-call-card.mjs` são
 * lidos DO CLONE. Até 27/08/2026 a única coisa que dava `git pull` aqui era a
 * publicação do card — então quando ela travou, o clone congelou junto, e o
 * serviço passou dois dias gerando roteiro com a definição de comando de 25/08.
 * O resultado apareceu no roteiro do Grupo Makron: saiu no formato v3.0
 * ("Andaime"), sem a pergunta de faixa de investimento que passou a valer em
 * 25/08, enquanto o gerado à mão na máquina do Yan saiu v3.1. Ninguém percebeu,
 * porque roteiro velho não parece quebrado — parece roteiro.
 *
 * Atualizar virou pré-requisito de gerar, e não efeito colateral de publicar.
 *
 * Fail-soft: clone desatualizado gera roteiro pior, clone parado não gera nada.
 * Entre os dois, gerar vence — mas o alerta sai, porque a segunda vez que isto
 * falhar em silêncio é a repetição do bug que ele existe para matar.
 */
function atualizarClone() {
  const git = (...args) =>
    spawnSync("git", args, { cwd: BRAIN, encoding: "utf8", shell: false, timeout: 120_000 });

  if ((git("ls-files", "--unmerged").stdout ?? "").trim()) {
    return { ok: false, motivo: "clone conflitado; nao mexo ate alguem resolver" };
  }

  // A árvore aqui é derivada: o que estiver modificado é índice regerado pelo
  // próprio comando na volta anterior. Descartar é o que torna o pull trivial.
  git("reset", "--hard", "HEAD");

  const pull = git("pull", "--rebase");
  if (pull.status !== 0) {
    git("rebase", "--abort");
    return { ok: false, motivo: (pull.stderr || pull.stdout).trim().slice(0, 200) };
  }
  return { ok: true, cabeca: (git("rev-parse", "--short", "HEAD").stdout ?? "").trim() };
}

async function processar(trabalho) {
  registrar("info", `inicio booking=${trabalho.calBookingId} slug=${trabalho.slug} tentativa=${trabalho.tentativas + 1}`);

  const clone = atualizarClone();
  if (clone.ok) {
    registrar("info", `clone em ${clone.cabeca}`);
  } else {
    registrar("erro", `clone NAO atualizado, o roteiro sai com a definicao antiga: ${clone.motivo}`);
    alertarOps("roteiro-clone-parado", `clone do brain nao atualiza: ${clone.motivo}`);
  }

  const card = gravarCard(trabalho);
  registrar("info", card.pulado ? `card pulado: ${card.motivo}` : "card gravado");

  const roteiro = gerarRoteiro(trabalho.slug);
  registrar("info", validar(roteiro.absoluto));

  // O roteiro vai como HTML, do jeito que nasce. Ate 18/08 ele passava pelo
  // Gotenberg so para virar PDF anexavel; tirar o conversor tirou uma peca que
  // podia cair entre o roteiro pronto e a call.
  const documento = Buffer.from(limparComentarios(readFileSync(roteiro.absoluto, "utf8")), "utf8");
  registrar("info", `documento pronto: ${Math.round(documento.length / 1024)} kB de HTML`);

  const conclusao = await chamarApi("/api/diagnostico/roteiro/concluir", {
    method: "POST",
    body: JSON.stringify({
      calBookingId: trabalho.calBookingId,
      inicioEm: trabalho.inicioEm,
      email: trabalho.lead.email,
      nome: trabalho.lead.nome,
      empresa: trabalho.lead.empresa,
      // Vão para a descrição do evento: quem conduz a call precisa saber para
      // onde chamar se o vídeo cair, sem abrir o CRM em outra aba.
      papel: trabalho.lead.papel ?? null,
      whatsapp: trabalho.lead.whatsapp ?? null,
      documentoBase64: documento.toString("base64"),
      caminhoRoteiro: roteiro.relativo,
    }),
  });

  if (!conclusao.ok) {
    throw new Error(`a rota recusou: ${conclusao.status} ${conclusao.corpo.erro ?? ""}`);
  }
  registrar("info", `anexado no evento ${conclusao.corpo.eventoId} (${conclusao.corpo.bytes} bytes de HTML)`);

  try {
    publicarNoGit(trabalho.slug);
    registrar("info", "card publicado no git");
  } catch (erro) {
    // Não relança: o roteiro já está no evento, que é o que a call precisa.
    registrar("erro", `card nao chegou ao git: ${erro.message}`);
    // Sobe de aviso para alerta porque o modo de falha e SILENCIOSO: a call
    // acontece normalmente e so o CRM fica para tras. Log nao denuncia isso.
    alertarOps("roteiro-card-no-git", `card de ${trabalho.slug} nao chegou ao git: ${erro.message}`);
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

// Exportado para o `provar-publicacao-do-card.mjs`, que exercita as travas de
// publicacao contra um repositorio git de verdade. Sem exportar, a unica forma
// de provar a trava seria reproduzir o clone travado em producao.
export { publicarNoGit };

// O laço só roda quando o arquivo é EXECUTADO. Sem esta guarda, importar o
// módulo para prová-lo subiria um segundo consumidor da fila.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
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
}
