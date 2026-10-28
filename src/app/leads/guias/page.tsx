import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { usuarioLogado } from "@/lib/diagnostico/sessao";
import { dataBR } from "@/lib/diagnostico/leads-apresentacao";
import { listarLeadsGuias, modoExportacaoGuias, type LeadGuia } from "@/lib/guias/db";
import { alvoDeAcesso } from "@/lib/guias/catalogo";
import "../leads.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Leads dos guias | Infuser", robots: { index: false, follow: false } };

export default async function LeadsGuiasPage({ searchParams }: { searchParams: Promise<{ pagina?: string; modo?: string }> }) {
  const usuario = await usuarioLogado();
  if (!usuario) redirect("/leads/entrar");
  const params = await searchParams;
  const pagina = Math.min(100000, Math.max(1, Number.parseInt(params.pagina ?? "1", 10) || 1));
  const modo = modoExportacaoGuias(params.modo);
  let leads: LeadGuia[];
  try { leads = await listarLeadsGuias(200, pagina, modo); } catch {
    console.error("[guias/leads] read_failed");
    return <main className="lp"><div className="lp-wrap"><h1 className="lp-titulo">Não foi possível ler os cadastros.</h1><p className="lp-sub">Tente novamente em instantes. O acesso aos guias continua independente desta consulta.</p><Link className="lp-voltar" href="/leads/guias">Tentar novamente</Link></div></main>;
  }
  return <main className="lp"><div className="lp-wrap">
    <div className="lp-topo-sessao"><span className="lp-marca">Infuser</span><span>{usuario.nome}</span><Link className="lp-voltar" href="/leads">Leads do diagnóstico</Link></div>
    <h1 className="lp-titulo">Leads dos guias</h1><p className="lp-sub">Os seis campos do cadastro e o material de entrada. Cadastros mais recentes primeiro.</p>
    <div className="lp-barra"><Link className="lp-chip" href="/leads/guias?modo=todos">Revisão interna</Link><Link className="lp-chip" href="/leads/guias?modo=comercial">Contato autorizado</Link><Link className="lp-chip" href="/leads/guias?modo=meta">Públicos Meta autorizados</Link><a className="lp-acao" href={`/leads/guias/export?pagina=${pagina}&modo=${modo}`}>Baixar CSV deste filtro</a><span>Página {pagina} · até 200 cadastros</span>{pagina > 1 && <Link className="lp-chip" href={`/leads/guias?pagina=${pagina - 1}&modo=${modo}`}>Anterior</Link>}{leads.length === 200 && <Link className="lp-chip" href={`/leads/guias?pagina=${pagina + 1}&modo=${modo}`}>Próxima</Link>}</div>
    {leads.length === 0 ? <p className="lp-vazio">Nenhum cadastro nesta página.</p> : leads.map((lead) => <article className="lp-cartao" key={lead.id}>
      <h2>{lead.nome}</h2><p>{lead.email} · {lead.whatsapp}</p><p><strong>Nicho:</strong> {lead.nicho}</p><p><strong>Interesse com IA:</strong> {lead.interesse}</p><p><strong>O que impede hoje:</strong> {lead.impedimento}</p><p><strong>Entrada:</strong> {alvoDeAcesso(lead.guia)?.titulo ?? (lead.guia.trim() ? lead.guia : "Central Infuser")} · {dataBR(lead.criadoEm)}</p><p><strong>Origem:</strong> {lead.origem}</p><p><strong>Escolhas atuais:</strong> contato {lead.consentComercial ? "autorizado" : "não autorizado"} · publicidade {lead.consentPublicidade ? "autorizada" : "não autorizada"}</p><p><strong>Localização estimada:</strong> {lead.metadados?.publicidade.localizacao?.status === "disponivel" ? [lead.metadados.publicidade.localizacao.cidade, lead.metadados.publicidade.localizacao.estado, lead.metadados.publicidade.localizacao.pais].filter(Boolean).join(", ") + " (GeoJS, por IP)" : "indisponível ou não autorizada"}</p><details><summary>Campanha e metadados disponíveis</summary><pre>{JSON.stringify(lead.metadados ?? {}, null, 2)}</pre></details>
    </article>)}
  </div></main>;
}
