export const COOKIE_GUIAS = "infuser_guias";
export const VALIDADE_GUIAS_SEGUNDOS = 30 * 24 * 60 * 60;
const encoder = new TextEncoder();

export function segredoGuias(): string {
  const segredo = process.env.GUIAS_ACCESS_SECRET;
  if (!segredo || segredo.length < 32) throw new Error("guias_config_missing");
  return segredo;
}

async function chave(segredo: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", encoder.encode(segredo), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

function base64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function bytesBase64url(texto: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(atob(texto.replace(/-/g, "+").replace(/_/g, "/")), (caractere) => caractere.charCodeAt(0));
}

export async function criarSessaoGuias(id: string, agora = Date.now()): Promise<string> {
  const payload = `${id}.${Math.floor(agora / 1000) + VALIDADE_GUIAS_SEGUNDOS}`;
  const assinatura = await crypto.subtle.sign("HMAC", await chave(segredoGuias()), encoder.encode(payload));
  return `${payload}.${base64url(new Uint8Array(assinatura))}`;
}

export async function sessaoGuiasValida(token: string | undefined, agora = Date.now()): Promise<boolean> {
  const segredo = segredoGuias();
  if (!token || token.length > 180) return false;
  const partes = token.split(".");
  if (partes.length !== 3 || !/^[0-9a-f-]{36}$/.test(partes[0]) || !/^\d{10}$/.test(partes[1]) || !/^[\w-]{43}$/.test(partes[2])) return false;
  const expiracao = Number(partes[1]);
  const segundoAtual = Math.floor(agora / 1000);
  if (expiracao <= segundoAtual || expiracao > segundoAtual + VALIDADE_GUIAS_SEGUNDOS) return false;
  try {
    return await crypto.subtle.verify("HMAC", await chave(segredo), bytesBase64url(partes[2]), encoder.encode(`${partes[0]}.${partes[1]}`));
  } catch { return false; }
}

export async function idSessaoGuias(token: string | undefined): Promise<string | undefined> {
  return await sessaoGuiasValida(token) ? token!.split(".")[0] : undefined;
}
