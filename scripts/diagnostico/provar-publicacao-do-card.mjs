#!/usr/bin/env node
/**
 * Prova as travas de publicação do card da Call 1 contra um git de verdade.
 *
 * Uso:
 *   node scripts/diagnostico/provar-publicacao-do-card.mjs
 *
 * Por que existe: em 25/08 um `pull --rebase --autostash` conflitou no clone da
 * VPS e deixou um arquivo unmerged. O `git commit` passou a falhar, a exceção
 * era engolida como aviso, e por DOIS DIAS todo card foi gerado no disco e
 * nunca chegou ao git — três clientes ficaram invisíveis para o time. O mesmo
 * índice sujo fez um commit chamado "card e roteiro da Call 1 de bmb" apagar o
 * card de outro cliente.
 *
 * As duas falhas são de orquestração do git, e teste com git falso não prova
 * nenhuma delas: quem errou foi o comportamento real do `commit` e do `rebase`.
 * Por isso aqui se monta um remoto e um clone de mentira em disco e se exercita
 * a função exportada pelo serviço.
 *
 * Não toca em rede, banco, nem no brain: tudo vive num diretório temporário que
 * é apagado no fim.
 */

import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const raiz = mkdtempSync(join(tmpdir(), "prova-card-"));
const REMOTO = join(raiz, "remoto.git");
const CLONE = join(raiz, "clone");

const ok = (t) => `  ✅ ${t}`;
const nao = (t) => `  ❌ ${t}`;
let falhou = false;

function conferir(condicao, certo, errado) {
  if (condicao) console.log(ok(certo));
  else {
    console.log(nao(errado));
    falhou = true;
  }
}

const git = (cwd, ...args) => spawnSync("git", args, { cwd, encoding: "utf8", shell: false });

function escrever(caminho, conteudo) {
  mkdirSync(join(caminho, ".."), { recursive: true });
  writeFileSync(caminho, conteudo, "utf8");
}

/** Um par remoto/clone com um card de cliente já versionado. */
function montarCenario() {
  rmSync(raiz, { recursive: true, force: true });
  mkdirSync(REMOTO, { recursive: true });
  git(REMOTO, "init", "--bare", "--initial-branch=main");

  git(raiz, "clone", REMOTO, "clone");
  git(CLONE, "config", "user.email", "prova@useinfuser.com");
  git(CLONE, "config", "user.name", "Prova");

  escrever(join(CLONE, "_pipeline", "clientes", "vizinho", "vizinho.md"), "card do vizinho\n");
  escrever(join(CLONE, "_memory", "current-state.md"), "estado inicial\n");
  git(CLONE, "add", "-A");
  git(CLONE, "commit", "-m", "base", "--no-verify");
  git(CLONE, "push", "origin", "HEAD:main");
}

/** Grava um card novo no clone, do jeito que o `gravarCard` do serviço grava. */
function gravarCard(slug) {
  escrever(join(CLONE, "_pipeline", "clientes", slug, `${slug}.md`), `card de ${slug}\n`);
  escrever(join(CLONE, "_pipeline", "clientes", slug, `roteiro-call-${slug}-call-1.html`), "<p>roteiro</p>\n");
}

/** O remoto tem este caminho no topo do main? */
function noRemoto(caminho) {
  const saida = git(REMOTO, "ls-tree", "-r", "--name-only", "main");
  return (saida.stdout ?? "").split("\n").includes(caminho);
}

/**
 * Deixa um caminho `unmerged` no índice do clone, sem provocar merge nenhum.
 *
 * `update-index --index-info` lê da entrada padrão no formato
 * `<modo> <sha> <estagio>\t<caminho>`: modo 0 remove a entrada normal, e os três
 * estágios seguintes são o que o git chama de conflito.
 */
function conflitarNoIndice(caminho) {
  const sha = git(CLONE, "hash-object", "-w", join(CLONE, caminho)).stdout.trim();
  spawnSync("git", ["update-index", "--index-info"], {
    cwd: CLONE,
    encoding: "utf8",
    shell: false,
    input:
      `0 0000000000000000000000000000000000000000\t${caminho}\n` +
      [1, 2, 3].map((estagio) => `100644 ${sha} ${estagio}\t${caminho}`).join("\n") +
      "\n",
  });
}

process.env.ROTEIRO_WORKER_SECRET = "prova";
process.env.BRAIN_PATH = CLONE;
// Sem isto o alerta de OPS tentaria rodar o script real da VPS.
process.env.OPS_ALERT_CMD = join(raiz, "alerta-que-nao-existe.sh");

montarCenario();
const { publicarNoGit } = await import("./servico-roteiro.mjs");

console.log("\n  Publicação do card da Call 1\n");

// ── 1. Caminho feliz: o card chega ao remoto.
gravarCard("cliente-um");
publicarNoGit("cliente-um");
conferir(
  noRemoto("_pipeline/clientes/cliente-um/cliente-um.md"),
  "o card chega ao remoto",
  "o card NAO chegou ao remoto",
);

// ── 2. Clone conflitado: recusa em vez de falhar calado.
//    Reproduz o estado exato de 25/08 — um arquivo unmerged no índice. Montar os
//    estágios à mão é o jeito honesto: provocar um merge de verdade faria a
//    prova depender de qual conflito o git escolhe gerar.
conflitarNoIndice("_memory/current-state.md");

const temUnmerged = (git(CLONE, "ls-files", "--unmerged").stdout ?? "").trim().length > 0;
conferir(temUnmerged, "cenario conflitado montado", "nao consegui montar o cenario conflitado");

gravarCard("cliente-dois");
let recusou = false;
let mensagem = "";
try {
  publicarNoGit("cliente-dois");
} catch (erro) {
  recusou = true;
  mensagem = erro.message;
}
conferir(recusou, "clone conflitado e RECUSADO", "clone conflitado passou batido");
conferir(
  /unmerged/i.test(mensagem) && /reset --hard/i.test(mensagem),
  "a recusa diz o arquivo e o comando de destravar",
  `a recusa nao ajuda a destravar: ${mensagem}`,
);
conferir(
  !noRemoto("_pipeline/clientes/cliente-dois/cliente-dois.md"),
  "nada e empurrado com o clone conflitado",
  "empurrou mesmo com o clone conflitado",
);

// ── 3. Índice sujo não viaja de carona.
//    Foi assim que o commit "de bmb" apagou o card de vertex-componentes.
montarCenario();
rmSync(join(CLONE, "_pipeline", "clientes", "vizinho", "vizinho.md"));
git(CLONE, "add", "_pipeline/clientes/vizinho/vizinho.md"); // deleção STAGED, de outro cliente

gravarCard("cliente-tres");
publicarNoGit("cliente-tres");

conferir(
  noRemoto("_pipeline/clientes/cliente-tres/cliente-tres.md"),
  "o card do cliente da vez chega ao remoto",
  "o card do cliente da vez nao chegou",
);
conferir(
  noRemoto("_pipeline/clientes/vizinho/vizinho.md"),
  "o card do OUTRO cliente sobrevive ao commit",
  "o commit APAGOU o card de outro cliente (regressao de 25/08)",
);

const mensagemDoTopo = (git(REMOTO, "log", "-1", "--format=%s", "main").stdout ?? "").trim();
conferir(
  mensagemDoTopo === "brain: card e roteiro da Call 1 de cliente-tres",
  "a mensagem do commit descreve o que ele contem",
  `mensagem inesperada: ${mensagemDoTopo}`,
);

// ── 4. Reprocessar sem mudança não é falha e não gera commit vazio.
const antes = (git(REMOTO, "rev-parse", "main").stdout ?? "").trim();
publicarNoGit("cliente-tres");
const depois = (git(REMOTO, "rev-parse", "main").stdout ?? "").trim();
conferir(antes === depois, "reprocessar sem mudanca nao gera commit", "reprocessar gerou commit vazio");

// ── 5. O clone fica limpo, que é o que impede o conflito de nascer.
const sujeira = (git(CLONE, "status", "--porcelain").stdout ?? "")
  .split("\n")
  .filter((linha) => linha.trim() && !linha.startsWith("??"));
conferir(
  sujeira.length === 0,
  "o clone termina sem modificacao pendente",
  `o clone terminou sujo: ${sujeira.join(" | ")}`,
);

rmSync(raiz, { recursive: true, force: true });
conferir(!existsSync(raiz), "temporarios limpos", "sobrou temporario em disco");

console.log(falhou ? "\n  FALHOU\n" : "\n  Tudo passou.\n");
process.exit(falhou ? 1 : 0);
