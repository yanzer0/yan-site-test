import { sql } from "../diagnostico/banco";
import type { CadastroGuia } from "./captura";
import { AVISO_MARKETING_GUIAS, type ConsentimentosGuias, type MetadadosGuias } from "./marketing";

export const VERSAO_AVISO_GUIAS = "guias-2026-10-28";
export interface LeadGuia extends CadastroGuia {
  readonly id: string;
  readonly criadoEm: Date;
  readonly consentComercial?: boolean;
  readonly consentPublicidade?: boolean;
  readonly consentAtualizadoEm?: Date;
  readonly metadados?: MetadadosGuias;
}
export type ModoExportacaoGuias = "todos" | "comercial" | "meta";
export function modoExportacaoGuias(valor: string | null | undefined): ModoExportacaoGuias { return valor === "comercial" || valor === "meta" ? valor : "todos"; }

export async function gravarCadastroGuia(id: string, cadastro: CadastroGuia, consentimentos: ConsentimentosGuias = { comercial: false, publicidade: false }, metadados: MetadadosGuias = { entrada: { url: "/guias", guia: "central" }, publicidade: { status: "nao_autorizada" } }): Promise<void> {
  await sql`
    WITH novo AS (
      INSERT INTO guias_leads (id, nome, email, whatsapp, nicho, interesse, impedimento, guia, origem, versao_privacidade, consent_comercial, consent_publicidade, consent_versao, metadados)
      VALUES (${id}, ${cadastro.nome}, ${cadastro.email}, ${cadastro.whatsapp}, ${cadastro.nicho}, ${cadastro.interesse}, ${cadastro.impedimento}, ${cadastro.guia}, ${cadastro.origem}, ${VERSAO_AVISO_GUIAS}, ${consentimentos.comercial}, ${consentimentos.publicidade}, ${AVISO_MARKETING_GUIAS}, ${JSON.stringify(metadados)}::jsonb)
      RETURNING id, consent_comercial, consent_publicidade
    )
    INSERT INTO guias_consentimentos (lead_id, comercial, publicidade, versao, origem)
    SELECT id, consent_comercial, consent_publicidade, ${AVISO_MARKETING_GUIAS}, 'cadastro' FROM novo
  `;
}

export async function listarLeadsGuias(limite = 200, pagina = 1, modo: ModoExportacaoGuias = "todos"): Promise<LeadGuia[]> {
  const tamanho = Math.max(1, Math.min(5000, Math.floor(limite)));
  const deslocamento = (Math.max(1, Math.floor(pagina)) - 1) * tamanho;
  const resultado = await sql.query<LeadGuia>(`
    SELECT l.id, l.nome, l.email, l.whatsapp, l.nicho, l.interesse, l.impedimento, l.guia, l.origem, l.criado_em AS "criadoEm", l.metadados,
           c.consent_comercial AS "consentComercial", c.consent_publicidade AS "consentPublicidade", c.consent_atualizado_em AS "consentAtualizadoEm"
    FROM guias_leads l
    CROSS JOIN LATERAL (SELECT p.id, p.consent_comercial, p.consent_publicidade, p.consent_atualizado_em FROM guias_leads p
      WHERE p.email = l.email OR p.whatsapp = l.whatsapp ORDER BY p.consent_atualizado_em DESC, p.id DESC LIMIT 1) c
    WHERE ($3 = 'todos' OR (l.id = c.id AND (($3 = 'comercial' AND c.consent_comercial) OR ($3 = 'meta' AND c.consent_publicidade))))
    ORDER BY l.criado_em DESC, l.id DESC LIMIT $1 OFFSET $2
  `, [tamanho, deslocamento, modo]);
  return resultado.rows;
}

export async function lerPreferenciasGuias(id: string): Promise<ConsentimentosGuias | undefined> {
  const resultado = await sql.query<{ comercial: boolean; publicidade: boolean }>(`
    SELECT p.consent_comercial AS comercial, p.consent_publicidade AS publicidade FROM guias_leads p
    JOIN guias_leads alvo ON alvo.id = $1 AND (p.email = alvo.email OR p.whatsapp = alvo.whatsapp)
    ORDER BY p.consent_atualizado_em DESC, p.id DESC LIMIT 1
  `, [id]);
  return resultado.rows[0];
}
export async function alterarPreferenciasGuias(id: string, consentimentos: ConsentimentosGuias): Promise<void> {
  await sql.query(`
    WITH alvo AS (SELECT email, whatsapp FROM guias_leads WHERE id = $1), mudados AS (
      UPDATE guias_leads l SET consent_comercial = $2, consent_publicidade = $3, consent_versao = $4, consent_atualizado_em = now(),
      metadados = CASE WHEN $3 THEN l.metadados ELSE jsonb_set(l.metadados, '{publicidade}', '{"status":"nao_autorizada"}'::jsonb) END
      FROM alvo WHERE l.email = alvo.email OR l.whatsapp = alvo.whatsapp RETURNING l.id
    ) INSERT INTO guias_consentimentos (lead_id, comercial, publicidade, versao, origem)
    SELECT id, $2, $3, $4, 'preferencias' FROM mudados
  `, [id, consentimentos.comercial, consentimentos.publicidade, AVISO_MARKETING_GUIAS]);
}
export async function atualizarMedicaoGuias(id: string, navegador: Record<string,unknown>, cookies: Record<string,string>): Promise<void> {
  await sql.query(`UPDATE guias_leads SET metadados = jsonb_set(metadados, '{publicidade}',
    COALESCE(metadados->'publicidade', '{}'::jsonb) || jsonb_build_object('navegador', $2::jsonb, 'cookies', $3::jsonb))
    WHERE id = $1 AND consent_publicidade = true AND NOT EXISTS (SELECT 1 FROM guias_leads p WHERE (p.email = guias_leads.email OR p.whatsapp = guias_leads.whatsapp)
    AND p.consent_publicidade = false AND p.consent_atualizado_em >= guias_leads.consent_atualizado_em)`, [id, JSON.stringify(navegador), JSON.stringify(cookies)]);
}

export function csvLeadsGuias(leads: readonly LeadGuia[], modo: ModoExportacaoGuias = "todos"): string {
  const celula = (bruto: unknown) => {
    const texto = String(bruto ?? "");
    const seguro = /^[\s]*[=+@-]/.test(texto) ? `'${texto}` : texto;
    return `"${seguro.replace(/"/g, '""')}"`;
  };
  const contatos = new Set<string>();
  const candidatos = modo === "todos" ? leads : [...leads].sort((a,b) => new Date(b.consentAtualizadoEm ?? b.criadoEm).getTime() - new Date(a.consentAtualizadoEm ?? a.criadoEm).getTime()).filter((lead) => {
    const email = `e:${lead.email.trim().toLowerCase()}`, telefone = `t:${lead.whatsapp.replace(/\D/g, "")}`;
    if (contatos.has(email) || contatos.has(telefone)) return false;
    contatos.add(email); contatos.add(telefone); return true;
  });
  const filtrados = candidatos.filter((lead) => modo === "todos" || (modo === "comercial" ? lead.consentComercial === true : lead.consentPublicidade === true));
  if (modo === "meta") {
    const emails = new Set<string>(), telefones = new Set<string>();
    const linhas: string[] = [];
    for (const lead of filtrados) {
      const email = lead.email.trim().toLowerCase(), telefone = lead.whatsapp.replace(/\D/g, "");
      if (emails.has(email) || telefones.has(telefone)) continue;
      emails.add(email); telefones.add(telefone);
      const nome = lead.nome.trim().toLowerCase().split(/\s+/), local = lead.metadados?.publicidade.localizacao;
      linhas.push([email, telefone, nome[0], nome.slice(1).join(" "), local?.status === "disponivel" ? local.cidade ?? "" : "", local?.status === "disponivel" ? local.estado ?? "" : "", local?.status === "disponivel" ? local.pais?.toLowerCase() ?? "" : ""].map(celula).join(","));
    }
    return `\uFEFF${["email,phone,fn,ln,ct,st,country", ...linhas].join("\r\n")}`;
  }
  const linhas = filtrados.map((lead) => [lead.nome, lead.email, lead.whatsapp, lead.nicho, lead.interesse, lead.impedimento, lead.guia || "central", lead.origem, new Date(lead.criadoEm).toISOString(), lead.consentComercial === true ? "sim" : "nao", lead.consentPublicidade === true ? "sim" : "nao", JSON.stringify(lead.metadados ?? {})].map(celula).join(";"));
  return `\uFEFF${["Nome;E-mail;WhatsApp;Nicho;Interesse com IA;Impedimento;Guia de entrada;Origem;Data UTC;Contato autorizado;Publicidade autorizada;Metadados", ...linhas].join("\r\n")}`;
}
