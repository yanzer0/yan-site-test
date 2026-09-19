/**
 * Conexão dos scripts de manutenção com o Postgres do funil.
 *
 * Um `Client` TCP por execução, sem pool: script roda, faz o que veio fazer e
 * sai. Pool aqui só adiaria o encerramento do processo.
 *
 * Existe para que a leitura do ambiente não fique repetida em oito arquivos, e
 * para que a validação da URL seja a mesma em todos eles.
 *
 * Prefere `POSTGRES_URL_NON_POOLING`: DDL e prova de concorrência pedem conexão
 * DIRETA, não um pooler em modo transação.
 *
 * 🔴 Nada aqui imprime a URL: ela carrega usuário e senha.
 */

import pg from "pg";

const { Client } = pg;

const URL_INVALIDA =
  "POSTGRES_URL_NON_POOLING/POSTGRES_URL ausente ou fora do formato postgres://|postgresql://";

/**
 * O `Client` já configurado, ainda NÃO conectado: quem chama decide quando
 * abrir, e há script que abre dois ao mesmo tempo para provar a trava da fila.
 *
 * `connectionString` explícita serve para apontar para outro banco sem mexer no
 * ambiente (o inventário compara origem e destino na mesma execução).
 */
export function abrirCliente(
  connectionString = process.env.POSTGRES_URL_NON_POOLING ?? process.env.POSTGRES_URL,
) {
  if (!connectionString) throw new Error(URL_INVALIDA);

  let protocolo;
  try {
    protocolo = new URL(connectionString).protocol;
  } catch {
    throw new Error(URL_INVALIDA);
  }

  if (protocolo !== "postgres:" && protocolo !== "postgresql:") throw new Error(URL_INVALIDA);

  return new Client({ connectionString });
}
