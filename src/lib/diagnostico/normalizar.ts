/**
 * Normalização de contato, usada na deduplicação de lead (FR-033).
 *
 * A lógica de telefone é a mesma que já existe em
 * `src/app/api/kiwify-webhook/route.ts`. Ela foi replicada aqui em vez de
 * importada de lá de propósito: unificar as duas exigiria editar uma rota de
 * produção que já funciona, o que é refatoração e merece ser sua própria
 * mudança, com seu próprio teste de caracterização. Fica anotado como dívida.
 */

/** Só os dígitos. Vazio quando não há nada aproveitável. */
export function apenasDigitos(valor: string | null | undefined): string {
  return valor ? valor.replace(/\D+/g, "") : "";
}

/**
 * Telefone brasileiro em formato comparável.
 * Celular sem código de país tem 10 ou 11 dígitos, então ganha o 55 na frente.
 */
export function normalizarTelefone(valor: string | null | undefined): string {
  const digitos = apenasDigitos(valor);
  if (!digitos) return "";
  if (digitos.length <= 11) return `55${digitos}`;
  return digitos;
}

/** E-mail em formato comparável. Não valida, apenas normaliza. */
export function normalizarEmail(valor: string | null | undefined): string {
  return valor ? valor.trim().toLowerCase() : "";
}

/**
 * Aceita um e-mail sintaticamente plausível.
 *
 * Deliberadamente permissiva: a validação forte de e-mail é a entrega real, não
 * a regex. Rejeitar lead bom por causa de um TLD incomum custa mais caro que
 * aceitar um endereço que depois vai dar bounce.
 */
export function pareceEmail(valor: string): boolean {
  const limpo = valor.trim();
  return limpo.length >= 5 && limpo.length <= 254 && /^[^\s@]+@[^\s@.]+\.[^\s@]+$/.test(limpo);
}

/** WhatsApp brasileiro válido: 10 ou 11 dígitos locais, com ou sem o 55. */
export function pareceWhatsapp(valor: string): boolean {
  const digitos = apenasDigitos(valor);
  if (digitos.startsWith("55")) return digitos.length === 12 || digitos.length === 13;
  return digitos.length === 10 || digitos.length === 11;
}
