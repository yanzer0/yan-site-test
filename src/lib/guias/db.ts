import { sql } from "../diagnostico/banco";
import type { CadastroGuia } from "./captura";

export const VERSAO_AVISO_GUIAS = "guias-2026-10-28";
export interface LeadGuia extends CadastroGuia {
  readonly id: string;
  readonly criadoEm: Date;
}

export async function gravarCadastroGuia(id: string, cadastro: CadastroGuia): Promise<void> {
  await sql`
    INSERT INTO guias_leads (id, nome, email, whatsapp, nicho, interesse, impedimento, guia, origem, versao_privacidade)
    VALUES (${id}, ${cadastro.nome}, ${cadastro.email}, ${cadastro.whatsapp}, ${cadastro.nicho}, ${cadastro.interesse}, ${cadastro.impedimento}, ${cadastro.guia}, ${cadastro.origem}, ${VERSAO_AVISO_GUIAS})
  `;
}

export async function listarLeadsGuias(limite = 200, pagina = 1): Promise<LeadGuia[]> {
  const tamanho = Math.max(1, Math.min(5000, Math.floor(limite)));
  const deslocamento = (Math.max(1, Math.floor(pagina)) - 1) * tamanho;
  const resultado = await sql.query<LeadGuia>(`
    SELECT id, nome, email, whatsapp, nicho, interesse, impedimento, guia, origem, criado_em AS "criadoEm"
    FROM guias_leads ORDER BY criado_em DESC, id DESC LIMIT $1 OFFSET $2
  `, [tamanho, deslocamento]);
  return resultado.rows;
}

export function csvLeadsGuias(leads: readonly LeadGuia[]): string {
  const celula = (bruto: unknown) => {
    const texto = String(bruto ?? "");
    const seguro = /^[\s]*[=+@-]/.test(texto) ? `'${texto}` : texto;
    return `"${seguro.replace(/"/g, '""')}"`;
  };
  const linhas = leads.map((lead) => [lead.nome, lead.email, lead.whatsapp, lead.nicho, lead.interesse, lead.impedimento, lead.guia || "central", lead.origem, new Date(lead.criadoEm).toISOString()].map(celula).join(";"));
  return `\uFEFF${["Nome;E-mail;WhatsApp;Nicho;Interesse com IA;Impedimento;Guia de entrada;Origem;Data UTC", ...linhas].join("\r\n")}`;
}
