import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { CopiarContexto } from "@/components/diagnostico/CopiarContexto";
import { lerLead, lerRespostas } from "@/lib/diagnostico/leads-db";
import {
  dataBR,
  linkWhatsapp,
  paraContexto,
  ROTULO_FAIXA,
  rotuloDaResposta,
  tituloDaPergunta,
} from "@/lib/diagnostico/leads-apresentacao";
import { usuarioLogado } from "@/lib/diagnostico/sessao";
import "../leads.css";

export const metadata: Metadata = {
  title: "Lead | Infuser",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await usuarioLogado())) redirect("/leads/entrar");

  const { id } = await params;
  // Formato errado nem chega ao banco: consulta com texto arbitrário em coluna
  // uuid vira erro de driver, e erro de driver na tela é informação de graça
  // para quem está sondando.
  if (!UUID.test(id)) notFound();

  const lead = await lerLead(id);
  if (!lead) notFound();

  const respostas = await lerRespostas([lead.id]);
  const zap = linkWhatsapp(lead.whatsapp);
  const agendou = lead.agendaEstado !== null && lead.agendaEstado !== "cancelado";

  return (
    <main className="lp">
      <div className="lp-wrap" style={{ maxWidth: 760 }}>
        <Link className="lp-voltar" href="/leads">
          voltar para a lista
        </Link>

        <h1 className="lp-titulo" style={{ marginTop: 10 }}>
          {lead.nome}
        </h1>
        <p className="lp-sub">
          {lead.empresa ?? "sem empresa informada"} · preencheu em {dataBR(lead.criadoEm)}
        </p>

        <div className="lp-bloco">
          <h2>Contato</h2>
          <div className="lp-contato">
            {zap && (
              <a className="lp-link" data-tipo="zap" href={zap} target="_blank" rel="noreferrer">
                WhatsApp {lead.whatsapp}
              </a>
            )}
            <a className="lp-link" href={`mailto:${lead.email}`}>
              {lead.email}
            </a>
          </div>
        </div>

        <div className="lp-bloco">
          <h2>Como o funil classificou</h2>
          <div className="lp-selos">
            <span className="lp-selo" data-tom={lead.faixa === "qualificado" ? "bom" : "frio"}>
              {lead.faixa ? ROTULO_FAIXA[lead.faixa] : "sem avaliação"}
            </span>
            {lead.score !== null && (
              <span className="lp-selo" data-tom="frio">
                score {lead.score}
              </span>
            )}
            <span className="lp-selo" data-tom={agendou ? "bom" : "atencao"}>
              {agendou
                ? `call em ${lead.agendaInicio ? dataBR(lead.agendaInicio) : "data não registrada"}`
                : lead.agendaEstado === "cancelado"
                  ? "cancelou a call"
                  : "não agendou"}
            </span>
            <span className="lp-selo" data-tom="frio">
              veio de {lead.origem}
            </span>
          </div>
          {lead.motivoCorte && (
            <p className="lp-q" style={{ marginTop: 12 }}>
              Motivo do corte: {lead.motivoCorte}
            </p>
          )}
        </div>

        <div className="lp-bloco">
          <h2>O que ele respondeu</h2>
          {respostas.length === 0 ? (
            <p className="lp-q">Nenhuma resposta gravada.</p>
          ) : (
            <div className="lp-qa">
              {respostas.map((r) => (
                <div key={r.perguntaId}>
                  <p className="lp-q">{tituloDaPergunta(r.perguntaId)}</p>
                  <p className="lp-a">{rotuloDaResposta(r.perguntaId, r.valor)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lp-bloco">
          <h2>Para colar no Claude</h2>
          <CopiarContexto texto={paraContexto(lead, respostas)} />
        </div>
      </div>
    </main>
  );
}
