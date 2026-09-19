/**
 * Único ponto de contato entre o código do funil e o Postgres.
 *
 * O resto de `src/` importa `sql` daqui e não sabe qual driver está por baixo.
 * Foi assim que o banco saiu do Neon (driver HTTP) para um Postgres em TCP na
 * VPS sem que uma única query mudasse.
 *
 * A interface é de propósito a MENOR que cobre o que o projeto usa hoje:
 * tagged template, `sql.query` e o encerramento do pool. Transação explícita,
 * `connect()` e cursor não entram enquanto nenhum chamador precisar.
 *
 * 🔴 Nada aqui loga texto de query nem parâmetro: todo valor que passa por este
 * módulo é dado de lead (FR-026). O único log possível é o código de um erro de
 * conexão em cliente ocioso, que não tem chamador para recebê-lo.
 */

import { Pool } from "pg";

export interface Resultado<T> {
  readonly rows: T[];
  readonly rowCount: number;
}

/**
 * Mensagem FIXA. Nunca inclui o valor lido: a URL carrega usuário e senha, e
 * mensagem de erro vai parar em log de container e em print de terminal.
 */
const URL_INVALIDA = "POSTGRES_URL ausente ou fora do formato postgres://|postgresql://";

function conexaoValidada(): string {
  const valor = process.env.POSTGRES_URL;
  if (!valor) throw new Error(URL_INVALIDA);

  let protocolo: string;
  try {
    protocolo = new URL(valor).protocol;
  } catch {
    throw new Error(URL_INVALIDA);
  }

  if (protocolo !== "postgres:" && protocolo !== "postgresql:") throw new Error(URL_INVALIDA);
  return valor;
}

/**
 * O pool é um por PROCESSO. Em dev ele mora no `globalThis` porque o HMR do
 * Next reavalia o módulo a cada salvamento: sem isso, meia dúzia de edições
 * deixariam meia dúzia de pools abertos contra o mesmo banco.
 */
const escopoGlobal = globalThis as typeof globalThis & { poolDoFunil?: Pool };

function criarPool(): Pool {
  const pool = new Pool({
    connectionString: conexaoValidada(),
    // Cinco por instância. O funil faz dezenas de escritas por dia; o teto
    // existe para que um pico não esgote as conexões do servidor inteiro.
    max: 5,
    idleTimeoutMillis: 30_000,
    // Banco fora do ar tem que virar erro em 5 s, não requisição pendurada.
    connectionTimeoutMillis: 5_000,
    // Teto por instrução. O Neon HTTP não tinha nenhum dos dois, e query presa
    // segurava a rota até o timeout da plataforma.
    statement_timeout: 15_000,
  });

  // Erro em cliente OCIOSO não tem `await` esperando por ele. Sem este
  // listener o EventEmitter derruba o processo inteiro. Registra-se o CÓDIGO,
  // nunca a URL nem o parâmetro.
  pool.on("error", (erro: NodeJS.ErrnoException) => {
    console.error(`[banco] conexao ociosa caiu: ${erro.code ?? erro.name}`);
  });

  return pool;
}

let pool = escopoGlobal.poolDoFunil;

function poolDoProcesso(): Pool {
  if (!pool) {
    pool = criarPool();
    if (process.env.NODE_ENV !== "production") escopoGlobal.poolDoFunil = pool;
  }
  return pool;
}

/**
 * A URL é conferida no CARREGAMENTO do módulo: quem sobe o servidor sem
 * `POSTGRES_URL` descobre ao carregar, não na primeira gravação de lead.
 *
 * Fora de um processo que SERVE, porém, o módulo é carregado sem ninguém para
 * consultar: o `next build` o importa só para ler a configuração das rotas, e
 * um teste de função pura o arrasta junto por estar no mesmo grafo de imports.
 * Travar ali transformaria variável de EXECUÇÃO em requisito de COMPILAÇÃO e de
 * teste, sem proteger nada. Quem consulta sem a URL continua falhando, porque a
 * mesma validação roda ao abrir o pool.
 */
const SEM_SERVIDOR_ATRAS =
  process.env.NEXT_PHASE === "phase-production-build" || process.env.NODE_ENV === "test";

if (!SEM_SERVIDOR_ATRAS) poolDoProcesso();

/**
 * `undefined` falha ALTO e antes de ir ao banco.
 *
 * O pacote anterior mandava `null` em silêncio, então um campo que o chamador
 * esqueceu de preencher virava `NULL` gravado sem ninguém perceber. Valor
 * ausente de propósito se escreve `null`.
 */
function recusarUndefined(valores: readonly unknown[]): void {
  const posicao = valores.indexOf(undefined);
  if (posicao >= 0) {
    throw new TypeError(`parametro $${posicao + 1} e undefined; use null para ausente`);
  }
}

/** Cada interpolação vira `$n`. Nunca concatenação de valor na string. */
function textoParametrizado(strings: TemplateStringsArray, valores: readonly unknown[]): string {
  let texto = strings[0];
  for (let indice = 0; indice < valores.length; indice += 1) {
    texto += `$${indice + 1}${strings[indice + 1]}`;
  }
  return texto;
}

async function executar<T>(texto: string, valores: readonly unknown[]): Promise<Resultado<T>> {
  recusarUndefined(valores);
  const resultado = await poolDoProcesso().query(texto, valores as unknown[]);
  return { rows: resultado.rows as T[], rowCount: resultado.rowCount ?? 0 };
}

export const sql = Object.assign(
  <T = Record<string, unknown>>(
    strings: TemplateStringsArray,
    ...valores: unknown[]
  ): Promise<Resultado<T>> => executar<T>(textoParametrizado(strings, valores), valores),
  {
    query: <T = Record<string, unknown>>(
      texto: string,
      params: readonly unknown[] = [],
    ): Promise<Resultado<T>> => executar<T>(texto, params),
  },
);

/** Encerra o pool para o processo poder sair. Usado por teste e script. */
export function encerrarPool(): Promise<void> {
  return pool ? pool.end() : Promise.resolve();
}
