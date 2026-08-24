"use server";

/**
 * As ações do acesso ao painel: cadastrar, entrar, sair, aprovar.
 *
 * Server Actions e não route handlers por dois motivos concretos:
 *
 *   1. O Next compara `Origin` com `Host` em toda Server Action e recusa o que
 *      vem de fora. Isso é proteção de CSRF nativa da plataforma, sem token
 *      escrito à mão - e escrever CSRF à mão é onde se erra.
 *   2. `<form action={acao}>` submete sem JavaScript. O erro volta por redirect
 *      com um código na URL, nunca por estado de cliente, então o fluxo inteiro
 *      funciona com script bloqueado.
 *
 * 🔴 Nada aqui devolve mensagem que revele se um e-mail tem conta. Login errado
 * e login inexistente respondem a mesma coisa e gastam o mesmo tempo.
 */

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  contaParaLogin,
  criarSessao,
  criarUsuario,
  definirEstado,
  emailDoAdmin,
  EmailJaCadastrado,
  encerrarSessao,
  type EstadoUsuario,
} from "@/lib/diagnostico/auth-db";
import { publicarCadastroSolicitado } from "@/lib/diagnostico/eventos";
import { normalizarEmail, pareceEmail } from "@/lib/diagnostico/normalizar";
import {
  etiquetar,
  etiquetasDaTentativa,
  ipDaRequisicao,
  limparAntigas,
  limparFalhasDaConta,
  podeCadastrar,
  podeTentarLogin,
  registrarTentativa,
  segredoDoFreio,
} from "@/lib/diagnostico/rate-limit";
import { adminLogado } from "@/lib/diagnostico/sessao";
import { conferirSenha, criticarSenha, gastarTempoDeSenha, gerarHash } from "@/lib/diagnostico/senha";
import { COOKIE_SESSAO, OPCOES_COOKIE } from "@/lib/diagnostico/sessao";

/**
 * Códigos de erro, nunca a frase.
 *
 * A tela traduz. Assim a URL não carrega texto que possa ser injetado de volta
 * na página, e trocar a redação não muda o contrato.
 */
type CodigoErro =
  | "campos"
  | "email"
  | "senha_fraca"
  | "credenciais"
  | "pendente"
  | "bloqueado"
  | "muitas_tentativas"
  | "muitos_cadastros"
  | "indisponivel";

function voltar(aba: "entrar" | "cadastrar", erro: CodigoErro, esperar?: number): never {
  const q = new URLSearchParams({ aba, erro });
  if (esperar) q.set("esperar", String(esperar));
  redirect(`/leads/entrar?${q.toString()}`);
}

function texto(dados: FormData, campo: string, limite: number): string {
  const bruto = dados.get(campo);
  return typeof bruto === "string" ? bruto.trim().slice(0, limite) : "";
}

// ─────────────────────────────────────────────────────────────
// Cadastro
// ─────────────────────────────────────────────────────────────

export async function cadastrar(dados: FormData): Promise<void> {
  const nome = texto(dados, "nome", 80);
  const email = texto(dados, "email", 254);
  const senha = typeof dados.get("senha") === "string" ? (dados.get("senha") as string) : "";

  if (!nome || !email || !senha) voltar("cadastrar", "campos");
  if (!pareceEmail(email)) voltar("cadastrar", "email");

  const critica = criticarSenha(senha, email);
  if (!critica.ok) voltar("cadastrar", "senha_fraca");

  const origem = etiquetar(await segredoDoFreio(), "origem", ipDaRequisicao(await headers()));

  const veredito = await podeCadastrar(origem);
  if (veredito.bloqueado) voltar("cadastrar", "muitos_cadastros", veredito.esperarSegundos);

  // O e-mail do admin nasce aprovado; qualquer outro nasce pendente. É o único
  // jeito de sair do problema do ovo e da galinha sem abrir um backdoor: quem
  // controla a variável de ambiente é quem controla o deploy, e não existe
  // caminho pela rede que promova ninguém a admin.
  const ehAdmin = emailDoAdmin().length > 0 && normalizarEmail(email) === emailDoAdmin();

  let usuarioId: string;
  try {
    usuarioId = await criarUsuario({
      nome,
      email,
      senhaHash: await gerarHash(senha),
      papel: ehAdmin ? "admin" : "membro",
      estado: ehAdmin ? "aprovado" : "pendente",
    });
  } catch (erro) {
    await registrarTentativa([origem], "cadastro", false);

    // 🔴 E-mail repetido responde SUCESSO, igualzinho a um cadastro novo. Dizer
    // "esse e-mail já existe" entrega, para quem estiver sondando, quais
    // endereços têm conta aqui.
    if (erro instanceof EmailJaCadastrado) redirect("/leads/entrar?aba=entrar&aviso=cadastro");

    console.error("[painel/cadastro] falha ao criar conta");
    voltar("cadastrar", "indisponivel");
  }

  await registrarTentativa([origem], "cadastro", true);

  // O Yan precisa saber que tem gente esperando. Sem aviso, o cadastro fica
  // parado até alguém lembrar de olhar - que é exatamente o problema que o
  // painel de leads existe para resolver, repetido numa tela nova.
  if (!ehAdmin) await publicarCadastroSolicitado({ usuarioId, nome });

  redirect("/leads/entrar?aba=entrar&aviso=cadastro");
}

// ─────────────────────────────────────────────────────────────
// Login
// ─────────────────────────────────────────────────────────────

export async function entrar(dados: FormData): Promise<void> {
  const email = texto(dados, "email", 254);
  const senha = typeof dados.get("senha") === "string" ? (dados.get("senha") as string) : "";

  if (!email || !senha) voltar("entrar", "campos");

  const { conta, origem } = await etiquetasDaTentativa(normalizarEmail(email), await headers());

  // 🔴 O freio roda ANTES do hash. Conferir a senha custa 128MB e meio segundo,
  // então checar depois transformaria o login na ferramenta de negação de
  // serviço mais barata do site.
  const veredito = await podeTentarLogin(conta, origem);
  if (veredito.bloqueado) voltar("entrar", "muitas_tentativas", veredito.esperarSegundos);

  const registro = await contaParaLogin(email);

  if (!registro) {
    // Gasta o mesmo trabalho de uma verificação real antes de recusar. Sem
    // isso, a diferença de tempo diria de graça quais e-mails têm conta.
    await gastarTempoDeSenha(senha);
    await registrarTentativa([conta, origem], "login", false);
    voltar("entrar", "credenciais");
  }

  const senhaConfere = await conferirSenha(senha, registro.senhaHash);
  if (!senhaConfere) {
    await registrarTentativa([conta, origem], "login", false);
    voltar("entrar", "credenciais");
  }

  // A senha está certa. A partir daqui a resposta PODE ser específica: quem
  // provou ser o dono da conta merece saber que ela está esperando aprovação,
  // em vez de ficar tentando trocar uma senha que já está correta.
  if (registro.estado === "pendente") {
    await registrarTentativa([conta, origem], "login", true);
    voltar("entrar", "pendente");
  }
  if (registro.estado === "bloqueado") {
    await registrarTentativa([conta, origem], "login", true);
    voltar("entrar", "bloqueado");
  }

  const token = await criarSessao(registro.id);

  await registrarTentativa([conta, origem], "login", true);
  await limparFalhasDaConta(conta);
  await limparAntigas();

  const jar = await cookies();
  jar.set(COOKIE_SESSAO, token, { ...OPCOES_COOKIE, maxAge: 7 * 24 * 60 * 60 });

  redirect("/leads");
}

export async function sair(): Promise<void> {
  const jar = await cookies();
  await encerrarSessao(jar.get(COOKIE_SESSAO)?.value);
  jar.delete(COOKIE_SESSAO);
  redirect("/leads/entrar");
}

// ─────────────────────────────────────────────────────────────
// Aprovação
// ─────────────────────────────────────────────────────────────

const ESTADOS_PERMITIDOS: readonly EstadoUsuario[] = ["aprovado", "bloqueado", "pendente"];

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Aprova, bloqueia ou devolve alguém para a fila.
 *
 * 🔴 A autorização é conferida AQUI DENTRO, na própria ação, não na página que
 * desenha o botão. Server Action é um endpoint: esconder o botão não esconde a
 * rota, e um membro comum que descobrisse o nome da ação poderia se
 * autoaprovar se a checagem morasse só na tela.
 */
export async function decidirCadastro(dados: FormData): Promise<void> {
  const admin = await adminLogado();
  if (!admin) redirect("/leads/entrar");

  const usuarioId = texto(dados, "usuarioId", 64);
  const estadoBruto = texto(dados, "estado", 20) as EstadoUsuario;

  if (!UUID.test(usuarioId)) redirect("/leads/equipe?erro=alvo");
  if (!ESTADOS_PERMITIDOS.includes(estadoBruto)) redirect("/leads/equipe?erro=estado");

  // Um admin que se bloqueia sozinho deixa o painel sem ninguém que aprove, e o
  // conserto exigiria mexer no banco à mão.
  if (usuarioId === admin.id) redirect("/leads/equipe?erro=proprio");

  await definirEstado(usuarioId, estadoBruto, admin.id);

  redirect("/leads/equipe?aviso=salvo");
}
