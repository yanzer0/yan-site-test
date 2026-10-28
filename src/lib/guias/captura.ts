import { destinoDoGuia } from "./catalogo";
import { normalizarEmail, normalizarTelefone, pareceEmail, pareceWhatsapp } from "../diagnostico/normalizar";

export const CAMPOS_GUIAS = ["nome", "email", "whatsapp", "nicho", "interesse", "impedimento"] as const;
export type CampoGuia = typeof CAMPOS_GUIAS[number];
export interface CadastroGuia {
  readonly nome: string;
  readonly email: string;
  readonly whatsapp: string;
  readonly nicho: string;
  readonly interesse: string;
  readonly impedimento: string;
  readonly guia: string;
  readonly origem: string;
}

export function origemSemDados(valor: unknown): string {
  if (typeof valor !== "string" || valor.length > 2048) return "direto";
  try {
    const url = new URL(valor);
    return ["http:", "https:"].includes(url.protocol) ? `${url.origin}${url.pathname}`.slice(0, 512) : "direto";
  } catch { return "direto"; }
}

export function validarCadastroGuia(bruto: unknown): { ok: true; cadastro: CadastroGuia; destino: string } | { ok: false; campos: Partial<Record<CampoGuia | "guia" | "website", string>> } {
  if (!bruto || typeof bruto !== "object" || Array.isArray(bruto)) return { ok: false, campos: { nome: "Preencha os seus dados para abrir os guias." } };
  const dados = bruto as Record<string, unknown>;
  const campos: Partial<Record<CampoGuia | "guia" | "website", string>> = {};
  const texto = (campo: CampoGuia) => typeof dados[campo] === "string" ? dados[campo].trim() : "";
  const nome = texto("nome"), email = texto("email"), whatsapp = texto("whatsapp"), nicho = texto("nicho"), interesse = texto("interesse"), impedimento = texto("impedimento");
  if (nome.length < 2 || nome.length > 120 || /[\u0000-\u001f]/.test(nome)) campos.nome = "Informe o seu nome, com 2 a 120 caracteres.";
  if (!pareceEmail(email)) campos.email = "Informe um e-mail válido.";
  if (whatsapp.length > 30 || !/^[+\d\s().-]+$/.test(whatsapp) || !pareceWhatsapp(whatsapp) || /^(\d)\1+$/.test(whatsapp.replace(/\D/g, ""))) campos.whatsapp = "Informe o WhatsApp com DDD, por exemplo (11) 99999-9999.";
  if (nicho.length < 2 || nicho.length > 160) campos.nicho = "Informe o seu nicho de atuação, com 2 a 160 caracteres.";
  if (interesse.length < 5 || interesse.length > 2000) campos.interesse = "Conte o que você quer fazer com IA, com 5 a 2.000 caracteres.";
  if (impedimento.length < 5 || impedimento.length > 2000) campos.impedimento = "Conte o que impede você hoje, com 5 a 2.000 caracteres.";
  const destino = destinoDoGuia(dados.guia);
  if (!destino) campos.guia = "Este guia não está no catálogo. Abra a central de guias.";
  if (dados.website !== undefined && dados.website !== "") campos.website = "Não foi possível concluir este envio.";
  if (Object.keys(campos).length || !destino) return { ok: false, campos };
  return { ok: true, cadastro: { nome, email: normalizarEmail(email), whatsapp: normalizarTelefone(whatsapp), nicho, interesse, impedimento, guia: typeof dados.guia === "string" ? dados.guia : "", origem: origemSemDados(dados.origem) }, destino };
}

// ponytail: one container, at most 2,000 network keys; use a shared store before horizontal scaling.
const envios = new Map<string, { quantidade: number; inicio: number }>();
export function permitirEnvio(chave: string, agora = Date.now()): boolean {
  const janela = 15 * 60 * 1000;
  const anterior = envios.get(chave);
  if (anterior && agora - anterior.inicio < janela) {
    anterior.quantidade += 1;
    return anterior.quantidade <= 10;
  }
  for (const [id, item] of envios) if (agora - item.inicio >= janela) envios.delete(id);
  if (envios.size >= 2000) return false;
  envios.set(chave, { quantidade: 1, inicio: agora });
  return true;
}
