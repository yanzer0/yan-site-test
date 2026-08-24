/**
 * A lista filtrada em CSV.
 *
 * 🔴 Mesma porta da tela, checada aqui de novo. Esta rota é uma segunda saída
 * para o MESMO dado, e proteger só a página deixaria a base a um GET de
 * distância de quem descobrisse o endereço.
 *
 * Route handler e não página porque a resposta é um arquivo.
 */

import { NextRequest, NextResponse } from "next/server";

import { COOKIE_LEADS, cookieAutoriza } from "@/lib/diagnostico/acesso-leads";
import { listarLeads, lerRespostas, type FiltroAgenda } from "@/lib/diagnostico/leads-db";
import { paraCsv } from "@/lib/diagnostico/leads-apresentacao";
import { FAIXAS, type Faixa } from "@/lib/diagnostico/tipos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!cookieAutoriza(req.cookies.get(COOKIE_LEADS)?.value)) {
    // Sem corpo e sem explicação: quem não tem a porta não aprende nada aqui.
    return new NextResponse(null, { status: 404 });
  }

  const bruto = req.nextUrl.searchParams;
  const faixaBruta = bruto.get("faixa") ?? undefined;
  const agendaBruta = bruto.get("agenda") ?? undefined;

  const faixa = FAIXAS.includes(faixaBruta as Faixa) ? (faixaBruta as Faixa) : null;
  const agenda: FiltroAgenda =
    agendaBruta === "agendou" || agendaBruta === "nao_agendou" ? agendaBruta : "todos";

  const leads = await listarLeads({ faixa, agenda });
  const respostas = await lerRespostas(leads.map((l) => l.id));

  const nome = ["leads", faixa ?? "todas", agenda].join("-");

  return new NextResponse(paraCsv(leads, respostas), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nome}.csv"`,
      // Arquivo com dado pessoal não fica em cache de CDN nem de navegador.
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
