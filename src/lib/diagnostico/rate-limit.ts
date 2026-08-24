/**
 * Freio das rotas de acesso, com o Postgres como memória.
 *
 * Postgres e não Redis porque em serverless não existe estado em processo: um
 * `Map` em memória é zerado quando a próxima requisição cai noutra instância,
 * e um atacante nem precisa saber disso para se beneficiar. O banco já é o
 * estado compartilhado do projeto, então o freio mora nele.
 *
 * 🔴 DUAS cotas, com códigos DIFERENTES, nunca uma só:
 *
 *   - por CONTA (e-mail): protege uma pessoa de ter a senha adivinhada.
 *   - por ORIGEM (IP): protege o servidor de ser varrido com mil e-mails.
 *
 * Cota única global faria o primeiro que chega monopolizar o balde e derrubar
 * todo mundo junto - e a recusa por cota própria precisa ser distinguível da
 * recusa por saturação, senão não há como saber se o problema é "você errou a
 * senha" ou "tem alguém atacando".
 *
 * 🔴 O caminho legítimo ABRE de novo no acerto: login com sucesso limpa as
 * falhas daquela conta. Sem isso, quem erra quatro vezes e acerta na quinta
 * fica com o freio armado pelos quinze minutos seguintes, e o freio passa a
 * atrapalhar quem ele deveria proteger.
 *
 * Env:
 *   PAINEL_SEGREDO  (sensível) — chave do HMAC que anonimiza e-mail e IP
 */

import { createHmac } from "node:crypto";

import { sql } from "@vercel/postgres";

export type Acao = "login" | "cadastro";

export interface Limite {
  readonly tentativas: number;
  readonly janelaMinutos: number;
}

/**
 * Cinco erros de senha em quinze minutos é folgado para quem digitou errado e
 * apertado para quem está adivinhando: mesmo sem trava, cinco chutes a cada
 * quinze minutos leva séculos contra uma senha de doze caracteres.
 */
export const LIMITE_LOGIN_CONTA: Limite = { tentativas: 5, janelaMinutos: 15 };

/** Mais alto que o da conta: um escritório inteiro pode sair pelo mesmo IP. */
export const LIMITE_LOGIN_ORIGEM: Limite = { tentativas: 20, janelaMinutos: 15 };

/** Cadastro conta ACERTOS também: o abuso aqui é criar contas, não errar senha. */
export const LIMITE_CADASTRO_ORIGEM: Limite = { tentativas: 3, janelaMinutos: 60 };

function segredo(): string {
  const s = process.env.PAINEL_SEGREDO;
  if (!s) {
    // Fecha por padrão. Sem o segredo, a alternativa seria guardar IP em claro
    // ou rodar sem freio, e as duas são piores que a rota recusar.
    throw new Error("PAINEL_SEGREDO ausente");
  }
  return s;
}

/**
 * A identidade vira uma etiqueta irreversível.
 *
 * Contar tentativas não exige saber de quem elas são. Guardar o e-mail ou o IP
 * em claro criaria uma lista de quem tentou entrar de onde, que é dado pessoal
 * que o freio não precisa ter.
 */
export function etiqueta(tipo: "conta" | "origem", valor: string): string {
  return `${tipo}:${createHmac("sha256", segredo()).update(valor.toLowerCase()).digest("hex")}`;
}

/**
 * O IP de quem chamou, como a Vercel entrega.
 *
 * `x-forwarded-for` chega do proxy da Vercel, que o reescreve; o primeiro
 * elemento é o cliente. Sem nenhum dos dois cabeçalhos devolve uma etiqueta
 * fixa, e o efeito é que ambientes sem proxy compartilham um balde só - o que
 * é conservador, nunca permissivo.
 */
export function ipDaRequisicao(cabecalhos: Headers): string {
  const real = cabecalhos.get("x-real-ip");
  if (real) return real.trim();

  const encaminhado = cabecalhos.get("x-forwarded-for");
  if (encaminhado) return encaminhado.split(",")[0].trim();

  return "sem-origem";
}

export async function registrarTentativa(
  etiquetas: readonly string[],
  acao: Acao,
  sucesso: boolean,
): Promise<void> {
  for (const chave of etiquetas) {
    await sql`
      INSERT INTO tentativas_acesso (chave, acao, sucesso)
      VALUES (${chave}, ${acao}, ${sucesso})
    `;
  }
}

/** Login que dá certo devolve a conta ao estado limpo. Ver o cabeçalho. */
export async function limparFalhasDaConta(etiquetaConta: string): Promise<void> {
  await sql`
    DELETE FROM tentativas_acesso
     WHERE chave = ${etiquetaConta} AND acao = 'login' AND sucesso = false
  `;
}

export interface Veredito {
  readonly bloqueado: boolean;
  /** Distingue "sua conta travou" de "esta rede travou". Motivos diferentes, respostas diferentes. */
  readonly motivo?: "conta" | "origem";
  readonly esperarSegundos?: number;
}

async function excedeu(
  chave: string,
  acao: Acao,
  limite: Limite,
  contarSucessos: boolean,
): Promise<{ excedeu: boolean; esperarSegundos: number }> {
  const r = await sql.query(
    `SELECT COUNT(*)::int AS n,
            MIN(ocorreu_em) AS mais_antiga
       FROM tentativas_acesso
      WHERE chave = $1
        AND acao = $2
        AND ocorreu_em > now() - ($3 || ' minutes')::interval
        ${contarSucessos ? "" : "AND sucesso = false"}`,
    [chave, acao, String(limite.janelaMinutos)],
  );

  const n = Number(r.rows[0]?.n ?? 0);
  if (n < limite.tentativas) return { excedeu: false, esperarSegundos: 0 };

  // Quanto falta para a tentativa mais antiga sair da janela. Devolver isto
  // permite responder com um prazo real em vez de "tente mais tarde".
  const maisAntiga = r.rows[0]?.mais_antiga ? new Date(r.rows[0].mais_antiga) : new Date();
  const liberaEm = maisAntiga.getTime() + limite.janelaMinutos * 60_000;
  const faltam = Math.max(1, Math.ceil((liberaEm - Date.now()) / 1000));

  return { excedeu: true, esperarSegundos: faltam };
}

/**
 * Pode tentar entrar?
 *
 * 🔴 Chamado ANTES de conferir a senha. O hash custa 128MB e meio segundo por
 * tentativa, então deixar o freio para depois transformaria o próprio login
 * em ferramenta de negação de serviço.
 */
export async function podeTentarLogin(
  etiquetaConta: string,
  etiquetaOrigem: string,
): Promise<Veredito> {
  const conta = await excedeu(etiquetaConta, "login", LIMITE_LOGIN_CONTA, false);
  if (conta.excedeu) {
    return { bloqueado: true, motivo: "conta", esperarSegundos: conta.esperarSegundos };
  }

  const origem = await excedeu(etiquetaOrigem, "login", LIMITE_LOGIN_ORIGEM, false);
  if (origem.excedeu) {
    return { bloqueado: true, motivo: "origem", esperarSegundos: origem.esperarSegundos };
  }

  return { bloqueado: false };
}

export async function podeCadastrar(etiquetaOrigem: string): Promise<Veredito> {
  const origem = await excedeu(etiquetaOrigem, "cadastro", LIMITE_CADASTRO_ORIGEM, true);
  return origem.excedeu
    ? { bloqueado: true, motivo: "origem", esperarSegundos: origem.esperarSegundos }
    : { bloqueado: false };
}

/**
 * Descarta o que já saiu de qualquer janela.
 *
 * Chamado de dentro do fluxo de login em vez de por cron: a tabela só cresce
 * quando alguém tenta entrar, então o momento de limpar é esse. Uma rotina
 * agendada para isso seria infraestrutura nova para um problema que se resolve
 * sozinho aqui.
 */
export async function limparAntigas(): Promise<void> {
  await sql`DELETE FROM tentativas_acesso WHERE ocorreu_em < now() - interval '24 hours'`;
}
