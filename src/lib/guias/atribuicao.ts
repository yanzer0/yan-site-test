export const PARAMETROS_CAMPANHA = ["utm_source", "utm_medium", "utm_campaign", "utm_id", "utm_term", "utm_content", "fbclid", "gclid", "msclkid", "ttclid", "sck"] as const;
export const COOKIES_PUBLICIDADE = ["_fbp", "_fbc", "_ga", "_ga_D7W2XG1MCF", "_gcl_au", "_ttp"] as const;
export function campanhaPermitida(parametros: URLSearchParams): Record<string, string> {
  const saida: Record<string, string> = {};
  for (const nome of PARAMETROS_CAMPANHA) {
    const valor = parametros.get(nome)?.trim();
    if (valor && valor.length <= 500 && /^[\p{L}\p{N} ._~+:/=|-]+$/u.test(valor) && (!nome.startsWith("utm_") || !/\b\d{10,14}\b/.test(valor))) saida[nome] = valor;
  }
  return saida;
}
