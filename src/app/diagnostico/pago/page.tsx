import type { Metadata } from "next";

import { AgendaPaga } from "@/components/diagnostico/AgendaPaga";
import { lerSessao } from "@/lib/diagnostico/stripe";
import { pagamentoLiberaAgendamento } from "@/lib/diagnostico/pagamento-db";
import { LOGO_INFUSER_V2 } from "../logo-infuser";
import "../diagnostico.css";

export const metadata: Metadata = {
  title: "Pagamento confirmado | Infuser",
  // Página de pós-compra com dado de pedido na URL. Fora do índice.
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Para onde o Stripe manda o comprador do Mapa de IA depois do pagamento.
 *
 * 🔴 A confirmação NÃO vem da URL. O `session_id` na query string é controlado
 * por quem acessa; quem decide se pagou é a consulta ao Stripe mais o registro
 * no banco. Sem isso, `?session_id=qualquer-coisa` viraria call de graça.
 *
 * Dois caminhos de checagem, e o segundo é o que salva:
 *   1. a sessão do Stripe está `paid`
 *   2. existe pedido `pago` para este e-mail no nosso banco
 *
 * O segundo cobre o caso de o comprador voltar depois, com a sessão expirada
 * ou sem a URL: se ele pagou, ele agenda.
 */
export default async function DiagnosticoPagoPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  const urlCal = process.env.NEXT_PUBLIC_CAL_URL;

  let liberado = false;
  let email: string | null = null;
  let motivo = "Não encontrei esse pagamento.";

  if (sessionId) {
    try {
      const sessao = await lerSessao(sessionId);
      email = sessao.email;

      if (sessao.pago && email) {
        // O webhook costuma chegar antes, mas não é garantido: se ainda não
        // gravou, o pagamento confirmado pelo Stripe já basta para liberar.
        liberado = true;
      } else if (email) {
        liberado = await pagamentoLiberaAgendamento(email);
        if (!liberado) motivo = "O pagamento ainda não foi confirmado pelo banco.";
      }
    } catch {
      // Falha ao falar com o Stripe não pode virar "você não pagou" na cara de
      // quem acabou de pagar.
      motivo = "Não consegui confirmar agora. Se o pagamento saiu, me chama que eu resolvo na hora.";
    }
  }

  return (
    <main className="dg">
      <div className="dg-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="dg-brand" src={LOGO_INFUSER_V2} alt="Infuser" width={132} height={30} />

        {liberado ? (
          <>
            <div className="dg-eyebrow">Pagamento confirmado</div>
            <h1 className="dg-h1">
              Agora é <em>escolher o horário</em>.
            </h1>
            <p className="dg-lead">
              A conversa é de uma hora, por vídeo. A gente mapeia como o seu processo funciona hoje
              e onde IA e automação encaixam, e depois você recebe esse mapa por escrito.
            </p>
            <p className="dg-nota">
              É o mesmo diagnóstico da call gratuita. O que muda é que aqui não tem critério de
              entrada.
            </p>
            <AgendaPaga urlCal={urlCal} email={email} />
          </>
        ) : (
          <>
            <div className="dg-eyebrow">Pagamento</div>
            <h1 className="dg-h1">
              Não consegui <em>confirmar</em>.
            </h1>
            <p className="dg-lead">{motivo}</p>
            <p className="dg-nota">
              Se o valor saiu da sua conta, nada foi perdido: me chama no e-mail que está no
              comprovante do Stripe e eu libero o agendamento na hora.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
