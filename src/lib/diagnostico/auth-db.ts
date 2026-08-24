/**
 * Contas e sessões do painel.
 *
 * 🔴 O gate mora no SQL, não na rota. `usuarioDaSessao` só devolve alguém com
 * `estado = 'aprovado'`, então bloquear uma conta derruba o acesso dela na
 * requisição seguinte, sem depender de a próxima rota lembrar de checar. É o
 * mesmo desenho de `abrirMapaPorToken`, pelo mesmo motivo: um caminho que
 * esquece a checagem é o modo de falha mais comum, e o jeito de eliminá-lo é
 * não deixar existir consulta que devolva o registro sem ela.
 */

import { createHash, randomBytes } from "node:crypto";

import { sql } from "@vercel/postgres";

import { ErroPersistencia } from "./db";
import { normalizarEmail } from "./normalizar";

/** Sete dias. O time abre o painel na semana de trabalho; um mês seria janela à toa. */
const VALIDADE_SESSAO_DIAS = 7;

export type PapelUsuario = "admin" | "membro";
export type EstadoUsuario = "pendente" | "aprovado" | "bloqueado";

export interface UsuarioPainel {
  readonly id: string;
  readonly nome: string;
  readonly email: string;
  readonly papel: PapelUsuario;
  readonly estado: EstadoUsuario;
  readonly criadoEm: Date;
  readonly aprovadoEm: Date | null;
}

/** Erro de negócio, separado de falha de infraestrutura: e-mail repetido não é o banco caindo. */
export class EmailJaCadastrado extends Error {
  constructor() {
    super("email ja cadastrado");
    this.name = "EmailJaCadastrado";
  }
}

export interface NovaConta {
  readonly nome: string;
  readonly email: string;
  readonly senhaHash: string;
  readonly papel: PapelUsuario;
  readonly estado: EstadoUsuario;
}

export interface ContaCriada {
  readonly id: string;
  readonly papel: PapelUsuario;
  readonly estado: EstadoUsuario;
}

/**
 * Cria a conta, decidindo NO BANCO se ela é a primeira.
 *
 * O gatilho é "o painel está SEM DONO", e não "a tabela está vazia". A diferença
 * importa num caso real: se a conta de admin for apagada e sobrarem só contas
 * pendentes, a tabela não está vazia, ninguém pode aprovar ninguém e o painel
 * trava sem saída pela interface. Com "sem dono", o próximo cadastro reassume e
 * o sistema se recupera sozinho.
 *
 * Isso não afrouxa nada: chegar a zero admins aprovados exige mexer no banco, e
 * quem consegue apagar o admin já consegue se inserir como um. A ação de
 * aprovação recusa que alguém mude o próprio acesso, então o último dono não
 * tem como se derrubar pela tela.
 *
 * 🔴 A decisão vive DENTRO da mesma instrução do INSERT, e não numa consulta
 * anterior seguida de um INSERT. Consultar antes e inserir depois abre a janela
 * em que dois cadastros simultâneos leem o painel sem dono e viram dois donos.
 *
 * Limite honesto do que uma instrução garante: dois INSERTs que entrem no mesmo
 * instante ainda podem enxergar a tabela vazia sob READ COMMITTED. O resultado
 * seria dois admins, nunca um invasor no lugar do dono, e a probabilidade real
 * com uma pessoa cadastrando exige colisão em milissegundos.
 *
 * `PAINEL_ADMIN_EMAIL` continua valendo quando existe: ela FORÇA quem é o dono
 * e desliga a promoção automática. Quem quiser travar isso, trava.
 */
export async function criarUsuario(conta: NovaConta): Promise<ContaCriada> {
  const emailNorm = normalizarEmail(conta.email);

  try {
    if (conta.papel === "admin") {
      // Caminho do e-mail declarado no ambiente: o papel já veio decidido.
      const r = await sql`
        INSERT INTO usuarios_painel (nome, email, email_norm, senha_hash, papel, estado)
        VALUES (${conta.nome}, ${conta.email}, ${emailNorm}, ${conta.senhaHash}, 'admin', 'aprovado')
        RETURNING id, papel, estado
      `;
      const x = r.rows[0];
      return { id: String(x.id), papel: x.papel as PapelUsuario, estado: x.estado as EstadoUsuario };
    }

    const r = await sql`
      INSERT INTO usuarios_painel (nome, email, email_norm, senha_hash, papel, estado)
      SELECT ${conta.nome}, ${conta.email}, ${emailNorm}, ${conta.senhaHash},
             CASE WHEN orfao.sim THEN 'admin'    ELSE 'membro'   END,
             CASE WHEN orfao.sim THEN 'aprovado' ELSE 'pendente' END
        FROM (
          SELECT NOT EXISTS (
            SELECT 1 FROM usuarios_painel WHERE papel = 'admin' AND estado = 'aprovado'
          ) AS sim
        ) AS orfao
      RETURNING id, papel, estado
    `;
    const x = r.rows[0];
    return { id: String(x.id), papel: x.papel as PapelUsuario, estado: x.estado as EstadoUsuario };
  } catch (causa) {
    // 23505 = unique_violation. É a corrida entre duas submissões do mesmo
    // e-mail, e quem decide é o índice do banco, não uma consulta anterior que
    // poderia ficar desatualizada entre o SELECT e o INSERT.
    if (causa instanceof Error && (causa as { code?: string }).code === "23505") {
      throw new EmailJaCadastrado();
    }
    throw new ErroPersistencia("criar usuario", causa);
  }
}

export interface ContaParaLogin {
  readonly id: string;
  readonly senhaHash: string;
  readonly estado: EstadoUsuario;
  readonly papel: PapelUsuario;
  readonly nome: string;
}

/**
 * O necessário para conferir uma tentativa de login.
 *
 * Devolve conta em QUALQUER estado de propósito: quem decide o que dizer é o
 * chamador, e ele precisa saber a diferença entre senha errada e conta ainda
 * não aprovada para não mandar a pessoa trocar uma senha que está certa.
 */
export async function contaParaLogin(email: string): Promise<ContaParaLogin | null> {
  try {
    const r = await sql`
      SELECT id, senha_hash, estado, papel, nome
        FROM usuarios_painel
       WHERE email_norm = ${normalizarEmail(email)}
    `;
    if (r.rows.length === 0) return null;

    const x = r.rows[0];
    return {
      id: String(x.id),
      senhaHash: String(x.senha_hash),
      estado: x.estado as EstadoUsuario,
      papel: x.papel as PapelUsuario,
      nome: String(x.nome),
    };
  } catch (causa) {
    throw new ErroPersistencia("buscar conta para login", causa);
  }
}

function hashDoToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Abre sessão e devolve o token que vai no cookie.
 *
 * 🔴 O banco guarda só o HASH. Um dump da tabela não permite montar o cookie de
 * ninguém, que é a diferença entre vazar uma lista de sessões e vazar acesso.
 */
export async function criarSessao(usuarioId: string): Promise<string> {
  const token = randomBytes(32).toString("base64url");

  try {
    await sql`
      INSERT INTO sessoes_painel (usuario_id, token_hash, expira_em)
      VALUES (
        ${usuarioId},
        ${hashDoToken(token)},
        now() + (${String(VALIDADE_SESSAO_DIAS)} || ' days')::interval
      )
    `;
    return token;
  } catch (causa) {
    throw new ErroPersistencia("criar sessao", causa);
  }
}

/**
 * Quem é o dono deste cookie, se é que ele ainda vale.
 *
 * As três condições vivem no `WHERE`: sessão não expirada, conta aprovada, e o
 * hash bate. Nenhuma rota consegue pular uma delas por esquecimento.
 */
export async function usuarioDaSessao(token: string | undefined): Promise<UsuarioPainel | null> {
  if (!token) return null;

  try {
    const r = await sql`
      SELECT u.id, u.nome, u.email, u.papel, u.estado, u.criado_em, u.aprovado_em
        FROM sessoes_painel s
        JOIN usuarios_painel u ON u.id = s.usuario_id
       WHERE s.token_hash = ${hashDoToken(token)}
         AND s.expira_em > now()
         AND u.estado = 'aprovado'
    `;
    if (r.rows.length === 0) return null;

    const x = r.rows[0];
    return {
      id: String(x.id),
      nome: String(x.nome),
      email: String(x.email),
      papel: x.papel as PapelUsuario,
      estado: x.estado as EstadoUsuario,
      criadoEm: new Date(x.criado_em),
      aprovadoEm: x.aprovado_em ? new Date(x.aprovado_em) : null,
    };
  } catch (causa) {
    throw new ErroPersistencia("ler sessao", causa);
  }
}

export async function encerrarSessao(token: string | undefined): Promise<void> {
  if (!token) return;
  await sql`DELETE FROM sessoes_painel WHERE token_hash = ${hashDoToken(token)}`;
}

/** Usado ao bloquear alguém: tirar o acesso tem que valer para as sessões já abertas. */
export async function encerrarSessoesDoUsuario(usuarioId: string): Promise<void> {
  await sql`DELETE FROM sessoes_painel WHERE usuario_id = ${usuarioId}`;
}

export async function listarUsuarios(): Promise<readonly UsuarioPainel[]> {
  try {
    const r = await sql`
      SELECT id, nome, email, papel, estado, criado_em, aprovado_em
        FROM usuarios_painel
       ORDER BY (estado = 'pendente') DESC, criado_em DESC
    `;
    return r.rows.map((x) => ({
      id: String(x.id),
      nome: String(x.nome),
      email: String(x.email),
      papel: x.papel as PapelUsuario,
      estado: x.estado as EstadoUsuario,
      criadoEm: new Date(x.criado_em),
      aprovadoEm: x.aprovado_em ? new Date(x.aprovado_em) : null,
    }));
  } catch (causa) {
    throw new ErroPersistencia("listar usuarios", causa);
  }
}

/**
 * Aprova, bloqueia ou devolve alguém para a fila.
 *
 * Bloquear encerra as sessões abertas na mesma operação. Sem isso, tirar o
 * acesso de alguém só valeria quando o cookie dele expirasse, o que transforma
 * "bloqueei agora" em "bloqueei daqui a sete dias".
 */
export async function definirEstado(
  usuarioId: string,
  estado: EstadoUsuario,
  aprovadorId: string,
): Promise<void> {
  try {
    if (estado === "aprovado") {
      await sql`
        UPDATE usuarios_painel
           SET estado = 'aprovado',
               aprovado_por = ${aprovadorId},
               aprovado_em = now(),
               atualizado_em = now()
         WHERE id = ${usuarioId}
      `;
      return;
    }

    await sql`
      UPDATE usuarios_painel
         SET estado = ${estado},
             aprovado_por = NULL,
             aprovado_em = NULL,
             atualizado_em = now()
       WHERE id = ${usuarioId}
    `;
    await encerrarSessoesDoUsuario(usuarioId);
  } catch (causa) {
    throw new ErroPersistencia("definir estado do usuario", causa);
  }
}

/** Quantos esperam decisão. Vira o aviso no topo do painel. */
export async function contarPendentes(): Promise<number> {
  const r = await sql`SELECT COUNT(*)::int AS n FROM usuarios_painel WHERE estado = 'pendente'`;
  return Number(r.rows[0]?.n ?? 0);
}

/** O e-mail que nasce admin e já aprovado. Sem ele configurado, ninguém aprova ninguém. */
export function emailDoAdmin(): string {
  return normalizarEmail(process.env.PAINEL_ADMIN_EMAIL ?? "");
}
