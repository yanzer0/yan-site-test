/**
 * Comparação de segredo de rota interna, em tempo constante.
 *
 * Estava copiado em cada rota que precisa dele. Uma cópia é descuido, três é um
 * lugar onde uma delas vai divergir sem ninguém ver.
 */

import { timingSafeEqual } from "node:crypto";

/**
 * O `timingSafeEqual` lança quando os buffers têm tamanhos diferentes, então o
 * tamanho é checado antes: segredo de tamanho errado é rejeitado sem exceção,
 * que é o caminho normal de uma chamada não autorizada.
 */
export function segredoConfere(recebido: string, esperado: string): boolean {
  if (!recebido || !esperado) return false;
  const a = Buffer.from(recebido);
  const b = Buffer.from(esperado);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
