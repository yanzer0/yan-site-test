import { isIP } from "node:net";
import type { NextRequest } from "next/server";
import { campanhaPermitida, COOKIES_PUBLICIDADE } from "./atribuicao";
import { origemSemDados } from "./captura";
import { origemPublicaGuias } from "./http";
import { alvoDeAcesso, guiaPorSlug } from "./catalogo";

export const AVISO_MARKETING_GUIAS = "guias-marketing-2026-10-28-v2";
export interface ConsentimentosGuias { readonly comercial: boolean; readonly publicidade: boolean }
export interface LocalizacaoGuia {
  status: "disponivel" | "indisponivel";
  fonte: "GeoJS";
  estimada: true;
  motivo?: string;
  pais?: string;
  estado?: string;
  cidade?: string;
  latitude?: number;
  longitude?: number;
  precisaoKm?: number;
}
export interface MetadadosGuias {
  entrada: { url: string; guia: string };
  publicidade: { status: "nao_autorizada" | "autorizada"; campanha?: Record<string, string>; referencia?: string; navegador?: Record<string, unknown>; cookies?: Record<string, string>; ip?: string; ipFonte?: "request_x_forwarded_for"; localizacao?: LocalizacaoGuia };
}

export function consentimentosGuias(bruto: unknown): ConsentimentosGuias {
  const dados = bruto && typeof bruto === "object" ? bruto as Record<string, unknown> : {};
  return { comercial: dados.comercial === true, publicidade: dados.publicidade === true };
}
function texto(valor: unknown, limite: number): string | undefined {
  return typeof valor === "string" && valor.length <= limite && !/[\u0000-\u001f]/.test(valor) ? valor : undefined;
}
function objeto(valor: unknown): Record<string, unknown> {
  return valor && typeof valor === "object" && !Array.isArray(valor) ? valor as Record<string, unknown> : {};
}
function dimensoes(valor: unknown): { largura: number; altura: number } | undefined {
  const dados = objeto(valor);
  return Number.isInteger(dados.largura) && Number.isInteger(dados.altura) && Number(dados.largura) > 0 && Number(dados.largura) <= 16384 && Number(dados.altura) > 0 && Number(dados.altura) <= 16384 ? { largura: Number(dados.largura), altura: Number(dados.altura) } : undefined;
}
export function navegadorPermitido(req: NextRequest, bruto: unknown): Record<string, unknown> {
  const dados = objeto(bruto);
  const navegador: Record<string, unknown> = { fonte: "navegador", userAgent: texto(req.headers.get("user-agent"), 1024) ?? "indisponivel" };
  const idioma = texto(dados.idioma, 32); if (idioma && /^[a-zA-Z0-9-]+$/.test(idioma)) navegador.idioma = idioma;
  if (Array.isArray(dados.idiomas)) navegador.idiomas = dados.idiomas.slice(0, 10).filter((item) => typeof item === "string" && /^[a-zA-Z0-9-]{2,32}$/.test(item));
  const plataforma = texto(dados.plataforma, 80); if (plataforma) navegador.plataforma = plataforma;
  const fuso = texto(dados.fuso, 80);
  if (fuso) { try { new Intl.DateTimeFormat("pt-BR", { timeZone: fuso }); navegador.fuso = fuso; } catch { /* Invalid browser timezone is omitted. */ } }
  const tela = dimensoes(dados.tela), janela = dimensoes(dados.janela);
  if (tela) navegador.tela = tela; if (janela) navegador.janela = janela;
  navegador.dispositivoEstimado = /mobile|android|iphone/i.test(String(navegador.userAgent)) ? "movel" : "outro";
  return navegador;
}
export function cookiesPermitidos(req: NextRequest): Record<string, string> {
  const cookies: Record<string, string> = {};
  for (const nome of COOKIES_PUBLICIDADE) {
    const valor = req.cookies.get(nome)?.value;
    if (valor && valor.length <= 512 && /^[a-zA-Z0-9._~:%+-]+$/.test(valor)) cookies[nome] = valor;
  }
  return cookies;
}
export function ipPublico(valor: string): boolean {
  const versao = isIP(valor);
  if (versao === 4) {
    const [a,b,c] = valor.split(".").map(Number);
    return !(a === 0 || a === 10 || a === 127 || a >= 224 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && (b === 168 || (b === 0 && (c === 0 || c === 2)))) || (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) || (a === 203 && b === 0 && c === 113));
  }
  return versao === 6 && !/^(?:0*:|::|f[cd]|fe[89ab]|ff|2001:db8)/i.test(valor) && !valor.toLowerCase().includes("::ffff:");
}
export async function localizarIp(ip: string): Promise<LocalizacaoGuia> {
  const indisponivel = (motivo: string): LocalizacaoGuia => ({ status: "indisponivel", fonte: "GeoJS", estimada: true, motivo });
  if (!ipPublico(ip)) return indisponivel("ip_nao_publico");
  try {
    const resposta = await fetch(`https://get.geojs.io/v1/ip/geo/${encodeURIComponent(ip)}.json`, { signal: AbortSignal.timeout(1500), redirect: "error", cache: "no-store" });
    if (!resposta.ok) return indisponivel("provedor_indisponivel");
    const dados = objeto(await resposta.json());
    const pais = texto(dados.country_code, 2), cidade = texto(dados.city, 120), estado = texto(dados.region, 120);
    if (!pais || !/^[A-Z]{2}$/.test(pais)) return indisponivel("resposta_invalida");
    const latitude = Number(dados.latitude), longitude = Number(dados.longitude), precisao = Number(dados.accuracy);
    if (dados.latitude !== undefined && (dados.latitude === null || dados.longitude === null || String(dados.latitude).trim() === "" || String(dados.longitude).trim() === "" || !Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180)) return indisponivel("coordenadas_invalidas");
    return { status: "disponivel", fonte: "GeoJS", estimada: true, pais, ...(cidade ? { cidade } : {}), ...(estado ? { estado } : {}), ...(dados.latitude !== undefined ? { latitude, longitude } : {}), ...(dados.accuracy != null && String(dados.accuracy).trim() !== "" && Number.isInteger(precisao) && precisao >= 0 && precisao <= 50000 ? { precisaoKm: precisao } : {}) };
  } catch { return indisponivel("provedor_indisponivel"); }
}
export async function coletarMetadados(req: NextRequest, corpo: unknown, guia: string, consentimento: ConsentimentosGuias): Promise<MetadadosGuias> {
  const alvo = alvoDeAcesso(guia);
  const caminhoEntrada = guiaPorSlug(guia) ? `/guias/${guia}` : alvo?.caminho ?? "/central";
  const entrada = { url: `${origemPublicaGuias(req)}${caminhoEntrada}`, guia: guia || "central" };
  if (!consentimento.publicidade) return { entrada, publicidade: { status: "nao_autorizada" } };
  const dados = objeto(corpo), campanha = campanhaPermitida(new URLSearchParams(objeto(dados.campanha) as Record<string,string>));
  const ip = req.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() ?? "";
  return { entrada, publicidade: { status: "autorizada", campanha, referencia: origemSemDados(dados.referencia), navegador: navegadorPermitido(req, dados.navegador), cookies: cookiesPermitidos(req), ...(ipPublico(ip) ? { ip, ipFonte: "request_x_forwarded_for" } : {}), localizacao: await localizarIp(ip) } };
}
