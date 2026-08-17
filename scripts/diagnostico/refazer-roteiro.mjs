#!/usr/bin/env node
/**
 * Devolve um agendamento para a fila de roteiros.
 *
 * Uso:
 *   node --env-file=.env.local scripts/diagnostico/refazer-roteiro.mjs <cal_booking_id>
 *
 * Serve para dois casos reais: reprocessar depois de consertar a causa de uma
 * falha, e regerar o roteiro quando o formulário do lead mudou. Zera as
 * tentativas de propósito — um item que chegou ao teto por um problema já
 * corrigido não deve continuar bloqueado.
 */

import { createClient } from "@vercel/postgres";

const booking = process.argv[2];
if (!booking) {
  console.error("\n  uso: refazer-roteiro.mjs <cal_booking_id>\n");
  process.exit(1);
}

const url = process.env.POSTGRES_URL_NON_POOLING ?? process.env.POSTGRES_URL;
if (!url) {
  console.error("\n  POSTGRES_URL nao esta no ambiente.\n");
  process.exit(1);
}

const cliente = createClient({ connectionString: url });
await cliente.connect();

try {
  const { rowCount } = await cliente.query(
    `UPDATE roteiros
        SET estado = 'pendente', tentativas = 0, ultimo_erro = NULL, concluido_em = NULL
      WHERE cal_booking_id = $1`,
    [booking],
  );
  console.log(
    rowCount === 0
      ? `\n  ${booking} nao esta na fila de roteiros.\n`
      : `\n  ${booking} voltou para a fila.\n`,
  );
} finally {
  await cliente.end();
}
