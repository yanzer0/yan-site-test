import type { Metadata } from "next";
import Link from "next/link";

import { contarPorFaixa, listarLeads, type FiltroAgenda, type LeadNaLista } from "@/lib/diagnostico/leads-db";
import { dataBR, linkWhatsapp, ROTULO_FAIXA } from "@/lib/diagnostico/leads-apresentacao";
import { FAIXAS, type Faixa } from "@/lib/diagnostico/tipos";
import { PaginaSemAcesso, temAcesso } from "./porta";
import "./leads.css";

export const metadata: Metadata = {
  title: "Leads | Infuser",
  // Base comercial com dado pessoal. Nunca no índice de ninguém.
  robots: { index: false, follow: false, nocache: true },
};

// Sem cache em nenhuma camada: o painel existe para mostrar quem preencheu
// AGORA. Uma página estática que serve lead de ontem é pior que não ter painel,
// porque o time confia nela e deixa de checar.
export const dynamic = "force-dynamic";
export const revalidate = 0;

/** Só um valor do enum vira filtro. Qualquer outra coisa na URL é ignorada. */
function faixaValida(bruto: string | undefined): Faixa | null {
  return FAIXAS.includes(bruto as Faixa) ? (bruto as Faixa) : null;
}

function agendaValida(bruto: string | undefined): FiltroAgenda {
  return bruto === "agendou" || bruto === "nao_agendou" ? bruto : "todos";
}

function comFiltros(faixa: Faixa | null, agenda: FiltroAgenda, base = "/leads"): string {
  const q = new URLSearchParams();
  if (faixa) q.set("faixa", faixa);
  if (agenda !== "todos") q.set("agenda", agenda);
  const texto = q.toString();
  return texto ? `${base}?${texto}` : base;
}

function selosDoLead(lead: LeadNaLista) {
  const agendou = lead.agendaEstado !== null && lead.agendaEstado !== "cancelado";

  const selos: { texto: string; tom: "bom" | "atencao" | "frio" }[] = [];

  if (lead.faixa) {
    selos.push({
      texto: ROTULO_FAIXA[lead.faixa],
      tom: lead.faixa === "qualificado" ? "bom" : lead.faixa === "revisao" ? "atencao" : "frio",
    });
  }

  if (lead.score !== null) selos.push({ texto: `score ${lead.score}`, tom: "frio" });

  if (agendou) {
    selos.push({
      texto: lead.agendaInicio ? `call ${dataBR(lead.agendaInicio)}` : "agendou",
      tom: "bom",
    });
  } else if (lead.agendaEstado === "cancelado") {
    selos.push({ texto: "cancelou a call", tom: "atencao" });
  } else {
    // O caso que o funil perde em silêncio: qualificado que preencheu e nunca
    // marcou. Marcado como atenção justamente para saltar na lista.
    selos.push({
      texto: "sem agendamento",
      tom: lead.faixa === "qualificado" ? "atencao" : "frio",
    });
  }

  if (lead.porte) selos.push({ texto: lead.porte.replace(/_/g, " "), tom: "frio" });
  if (lead.papel) selos.push({ texto: lead.papel, tom: "frio" });

  return selos;
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ faixa?: string; agenda?: string }>;
}) {
  if (!(await temAcesso())) return <PaginaSemAcesso />;

  const params = await searchParams;
  const faixa = faixaValida(params.faixa);
  const agenda = agendaValida(params.agenda);

  const [contagens, leads] = await Promise.all([
    contarPorFaixa(),
    listarLeads({ faixa, agenda }),
  ]);

  const totalGeral = contagens.reduce((soma, c) => soma + c.total, 0);

  return (
    <main className="lp">
      <div className="lp-wrap">
        <div className="lp-marca">Infuser</div>
        <h1 className="lp-titulo">Leads do diagnóstico</h1>
        <p className="lp-sub">
          Quem preencheu useinfuser.com/diagnostico. Atualiza a cada vez que esta página abre.
        </p>

        <div className="lp-cartoes">
          <Link
            className="lp-cartao"
            data-ativo={faixa === null ? "sim" : "nao"}
            href={comFiltros(null, agenda)}
          >
            <div className="lp-cartao-n">{totalGeral}</div>
            <div className="lp-cartao-r">Todos</div>
          </Link>

          {FAIXAS.map((f) => {
            const c = contagens.find((x) => x.faixa === f);
            return (
              <Link
                key={f}
                className="lp-cartao"
                data-ativo={faixa === f ? "sim" : "nao"}
                href={comFiltros(f, agenda)}
              >
                <div className="lp-cartao-n">{c?.total ?? 0}</div>
                <div className="lp-cartao-r">{ROTULO_FAIXA[f]}</div>
                {f === "qualificado" && (c?.semAgendamento ?? 0) > 0 && (
                  <div className="lp-cartao-alerta">
                    {c?.semAgendamento} sem agendar
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        <div className="lp-barra">
          {(["todos", "agendou", "nao_agendou"] as const).map((a) => (
            <Link
              key={a}
              className="lp-chip"
              data-ativo={agenda === a ? "sim" : "nao"}
              href={comFiltros(faixa, a)}
            >
              {a === "todos" ? "Agendou ou não" : a === "agendou" ? "Agendou" : "Não agendou"}
            </Link>
          ))}

          <a className="lp-acao" href={comFiltros(faixa, agenda, "/leads/export")}>
            Baixar CSV
          </a>
        </div>

        {leads.length === 0 ? (
          <p className="lp-vazio">Nenhum lead com esse filtro.</p>
        ) : (
          <div className="lp-lista">
            {leads.map((lead) => {
              const zap = linkWhatsapp(lead.whatsapp);
              return (
                <article key={lead.id} className="lp-item" data-faixa={lead.faixa ?? "sem"}>
                  <div className="lp-topo">
                    <span className="lp-nome">
                      <Link href={`/leads/${lead.id}`}>{lead.nome}</Link>
                    </span>
                    {lead.empresa && <span className="lp-empresa">{lead.empresa}</span>}
                    <span className="lp-quando">{dataBR(lead.criadoEm)}</span>
                  </div>

                  <div className="lp-selos">
                    {selosDoLead(lead).map((s) => (
                      <span key={s.texto} className="lp-selo" data-tom={s.tom}>
                        {s.texto}
                      </span>
                    ))}
                  </div>

                  <div className="lp-contato">
                    {zap && (
                      <a className="lp-link" data-tipo="zap" href={zap} target="_blank" rel="noreferrer">
                        WhatsApp {lead.whatsapp}
                      </a>
                    )}
                    <a className="lp-link" href={`mailto:${lead.email}`}>
                      {lead.email}
                    </a>
                    <Link className="lp-link" href={`/leads/${lead.id}`}>
                      Ver respostas e copiar contexto
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
