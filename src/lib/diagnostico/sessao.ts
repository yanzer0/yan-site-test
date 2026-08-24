/**
 * Quem está logado, do ponto de vista de uma requisição.
 *
 * Camada fina em cima de `auth-db` para que nenhuma página precise saber o nome
 * do cookie nem lembrar de validar sessão: ela pergunta quem é, e recebe null
 * quando não é ninguém.
 */

import { cookies } from "next/headers";

import { usuarioDaSessao, type UsuarioPainel } from "./auth-db";

export const COOKIE_SESSAO = "infuser_painel";

/**
 * `lax` e não `strict`: com `strict` o cookie não viaja quando a pessoa chega
 * por um link de fora (e-mail, WhatsApp, agenda) e ela cairia no login mesmo
 * já estando logada. `lax` continua bloqueando POST vindo de outro site, que é
 * a parte que protege contra CSRF.
 */
export const OPCOES_COOKIE = {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  path: "/",
} as const;

export async function usuarioLogado(): Promise<UsuarioPainel | null> {
  const jar = await cookies();
  return usuarioDaSessao(jar.get(COOKIE_SESSAO)?.value);
}

/** O usuário logado, se for admin. Usado pelas telas que só o dono do painel abre. */
export async function adminLogado(): Promise<UsuarioPainel | null> {
  const usuario = await usuarioLogado();
  return usuario?.papel === "admin" ? usuario : null;
}
