#!/usr/bin/env node
/**
 * Gera o mapa de diagnóstico a partir da transcrição da Call 1.
 *
 * Uso:
 *   node --env-file=.env.local scripts/diagnostico/gerar-mapa.mjs \
 *     --email ricardo@vertex.com.br \
 *     --transcricao transcricoes/vertex-14-08.txt
 *
 * O que este script faz e o que ele NÃO faz:
 *   FAZ  ler a transcrição do disco, chamar o modelo, mandar o JSON para a rota
 *   NÃO  validar, renderizar nem gravar. Isso é da rota `/api/diagnostico/mapa/publicar`,
 *        que é a fonte única dessas três coisas e roda o mesmo código em produção.
 *
 * O motor é o Claude Code em modo headless, que consome a assinatura em vez de
 * uma chave de API. Mesma decisão da feature 003.
 *
 * 🔴 A transcrição NUNCA sai do disco local para o banco nem para o repositório.
 * O que viaja é o JSON de achados, que já é texto tratado.
 */

import { readFileSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const AQUI = dirname(fileURLToPath(import.meta.url));
const PROMPT = join(AQUI, "mapa-prompt.md");

function arg(nome) {
  const i = process.argv.indexOf(`--${nome}`);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

function morrer(mensagem) {
  console.error(`\n  ${mensagem}\n`);
  process.exit(1);
}

const email = arg("email");
const caminhoTranscricao = arg("transcricao");
const base = arg("base") ?? "http://localhost:3100";

// Não existe `--de`, e é de propósito: quem assina o mapa é sempre a Infuser,
// nunca a pessoa que conduziu a call. A rota fixa isso e ignora o que vier.

if (!email || !caminhoTranscricao) {
  morrer(
    [
      "faltou argumento.",
      "",
      "  node --env-file=.env.local scripts/diagnostico/gerar-mapa.mjs \\",
      "    --email lead@empresa.com \\",
      "    --transcricao transcricoes/empresa-14-08.txt",
    ].join("\n"),
  );
}

if (!existsSync(caminhoTranscricao)) {
  morrer(`transcricao nao encontrada: ${caminhoTranscricao}`);
}

const segredo = process.env.MAPA_PUBLICAR_SECRET;
if (!segredo) morrer("MAPA_PUBLICAR_SECRET nao esta no ambiente.");

/** Data por extenso e curta, no fuso local. */
function datas() {
  const agora = new Date();
  const meses = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
  ];
  const d = String(agora.getDate()).padStart(2, "0");
  const m = String(agora.getMonth() + 1).padStart(2, "0");
  return {
    data: `${agora.getDate()} de ${meses[agora.getMonth()]} de ${agora.getFullYear()}`,
    dataCurta: `${d}.${m}.${agora.getFullYear()}`,
  };
}

/**
 * Extrai o JSON da saída do modelo.
 *
 * O prompt pede JSON puro, mas modelo às vezes embrulha em cerca de código ou
 * escreve uma linha antes. Em vez de confiar, procura-se o objeto mais externo.
 */
function extrairJson(saida) {
  const semCerca = saida.replace(/```json\s*/gi, "").replace(/```/g, "");
  const inicio = semCerca.indexOf("{");
  const fim = semCerca.lastIndexOf("}");
  if (inicio === -1 || fim === -1) return null;
  try {
    return JSON.parse(semCerca.slice(inicio, fim + 1));
  } catch {
    return null;
  }
}

async function main() {
  console.log(`\n  Lendo a transcricao...`);
  const transcricao = readFileSync(caminhoTranscricao, "utf8");
  console.log(`  ${transcricao.length} caracteres.`);

  // As respostas do formulario vem da rota, que ja tem acesso ao banco.
  console.log(`  Buscando as respostas do formulario de ${email}...`);
  const respostasReq = await fetch(
    `${base}/api/diagnostico/mapa/respostas?email=${encodeURIComponent(email)}`,
    { headers: { "x-mapa-secret": segredo } },
  );
  if (!respostasReq.ok) {
    morrer(`nao consegui buscar as respostas: ${respostasReq.status}`);
  }
  const { respostas } = await respostasReq.json();

  const prompt = readFileSync(PROMPT, "utf8")
    .replace("{{RESPOSTAS}}", JSON.stringify(respostas, null, 2))
    .replace("{{TRANSCRICAO}}", transcricao);

  console.log(`\n  Chamando o modelo. Isso leva um tempo...`);

  /**
   * O prompt vai por STDIN, não como argumento.
   *
   * O Windows limita a linha de comando a cerca de 8 mil caracteres, e só a
   * transcrição já passa disso. Como argumento, o processo nem chega a nascer:
   * morre com "Linha de comando muito longa" antes de o modelo ver qualquer
   * coisa. Por stdin não há limite prático.
   *
   * `shell: false` de propósito: com shell, o conteúdo da transcrição passaria
   * pelo interpretador de comandos, e transcrição é texto de terceiro.
   */
  const execucao = spawnSync("claude", ["-p"], {
    input: prompt,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
    shell: false,
  });

  if (execucao.status !== 0) {
    morrer(`o modelo falhou: ${execucao.stderr?.slice(0, 500) ?? "sem stderr"}`);
  }

  const conteudo = extrairJson(execucao.stdout ?? "");
  if (!conteudo) {
    // Guarda a saida crua: sem ela, "o modelo devolveu lixo" e' impossivel de diagnosticar.
    mkdirSync("saidas", { recursive: true });
    writeFileSync("saidas/ultima-saida-bruta.txt", execucao.stdout ?? "", "utf8");
    morrer("o modelo nao devolveu JSON. Saida crua em saidas/ultima-saida-bruta.txt");
  }

  console.log(`  Recebido: ${conteudo.etapas?.length ?? 0} etapas, ${conteudo.achados?.length ?? 0} achados.`);

  const { data, dataCurta } = datas();
  console.log(`\n  Publicando (a rota valida, renderiza e grava)...`);

  const publicar = await fetch(`${base}/api/diagnostico/mapa/publicar`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-mapa-secret": segredo },
    body: JSON.stringify({ email, conteudo, data, dataCurta }),
  });

  const resposta = await publicar.json();

  if (publicar.status === 422) {
    console.error(`\n  O conteudo do modelo foi REPROVADO na validacao:\n`);
    for (const p of resposta.problemas ?? []) {
      console.error(`    ${p.onde}: ${p.porque}`);
    }
    console.error(`\n  Nada foi gravado. Ajuste o prompt ou a transcricao e rode de novo.\n`);
    process.exit(2);
  }

  if (!publicar.ok) {
    morrer(`falha ao publicar: ${publicar.status} ${JSON.stringify(resposta)}`);
  }

  console.log(`\n  ─────────────────────────────────────────────`);
  console.log(`  Mapa gerado, no estado "${resposta.estado}".\n`);
  console.log(`  Para revisar:  ${base}${resposta.url}   (ainda devolve 404: nao aprovado)`);
  console.log(`  Para aprovar:  node --env-file=.env.local scripts/diagnostico/aprovar-mapa.mjs ${resposta.token}`);
  console.log(`  ─────────────────────────────────────────────\n`);
}

main().catch((erro) => morrer(`erro: ${erro.message}`));
