import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { usuarioLogado } from "@/lib/diagnostico/sessao";
import { dataBR } from "@/lib/diagnostico/leads-apresentacao";
import { listarLeadsGuias, type LeadGuia } from "@/lib/guias/db";
import { guiaPorSlug } from "@/lib/guias/catalogo";
import "../leads.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Leads dos guias | Infuser", robots: { index: false, follow: false } };

export default async function LeadsGuiasPage({ searchParams }: { searchParams: Promise<{ pagina?: string }> }) {
  const usuario = await usuarioLogado();
  if (!usuario) redirect("/leads/entrar");
  const pagina = Math.min(100000, Math.max(1, Number.parseInt((await searchParams).pagina ?? "1", 10) || 1));
  let leads: LeadGuia[];
  try { leads = await listarLeadsGuias(200, pagina); } catch {
    console.error("[guias/leads] read_failed");
    return <main className="lp"><div className="lp-wrap"><h1 className="lp-titulo">Não foi possível ler os cadastros.</h1><p className="lp-sub">Tente novamente em instantes. O acesso aos guias continua independente desta consulta.</p><Link className="lp-voltar" href="/leads/guias">Tentar novamente</Link></div></main>;
  }
  return <main className="lp"><div className="lp-wrap">
    <div className="lp-topo-sessao"><span className="lp-marca">Infuser</span><span>{usuario.nome}</span><Link className="lp-voltar" href="/leads">Leads do diagnóstico</Link></div>
    <h1 className="lp-titulo">Leads dos guias</h1><p className="lp-sub">Os seis campos do cadastro e o material de entrada. Cadastros mais recentes primeiro.</p>
    <div className="lp-barra"><a className="lp-acao" href={`/leads/guias/export?pagina=${pagina}`}>Baixar CSV desta página</a><span>Página {pagina} · até 200 cadastros</span>{pagina > 1 && <Link className="lp-chip" href={`/leads/guias?pagina=${pagina - 1}`}>Anterior</Link>}{leads.length === 200 && <Link className="lp-chip" href={`/leads/guias?pagina=${pagina + 1}`}>Próxima</Link>}</div>
    {leads.length === 0 ? <p className="lp-vazio">Nenhum cadastro nesta página.</p> : leads.map((lead) => <article className="lp-cartao" key={lead.id}>
      <h2>{lead.nome}</h2><p>{lead.email} · {lead.whatsapp}</p><p><strong>Nicho:</strong> {lead.nicho}</p><p><strong>Interesse com IA:</strong> {lead.interesse}</p><p><strong>O que impede hoje:</strong> {lead.impedimento}</p><p><strong>Entrada:</strong> {guiaPorSlug(lead.guia)?.titulo ?? "Central de guias"} · {dataBR(lead.criadoEm)}</p><p><strong>Origem:</strong> {lead.origem}</p>
    </article>)}
  </div></main>;
}
