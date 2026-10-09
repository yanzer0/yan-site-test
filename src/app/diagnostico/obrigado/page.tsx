import type { Metadata } from "next";

import { LOGO_INFUSER_V2 } from "../logo-infuser";
import "../diagnostico.css";

export const metadata: Metadata = {
  title: "Call marcada | Infuser",
  // Página de conversão: só se chega aqui depois de agendar. Fora do índice.
  robots: { index: false, follow: false },
};

/**
 * Para onde o lead qualificado vai quando o Cal.com confirma a reserva
 * (`irParaObrigado` no Desfecho). É a URL que o GTM conta como "call agendada".
 *
 * 🔴 O texto só promete o que o processo faz: o lead não é convidado da agenda,
 * quem confirma e manda o link é o time, pelo WhatsApp (Yan, 25/08).
 */
export default function DiagnosticoObrigadoPage() {
  return (
    <main className="dg">
      <div className="dg-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="dg-brand" src={LOGO_INFUSER_V2} alt="Infuser" width={132} height={30} />

        <div className="dg-eyebrow">Call marcada</div>
        <h1 className="dg-h1">
          Pronto, sua call está <em>marcada</em>.
        </h1>
        <p className="dg-lead">
          Alguém do time vai te chamar no WhatsApp que você deixou, para confirmar o horário e
          mandar o link da reunião.
        </p>
        <p className="dg-lead">
          Na call a gente percorre o seu processo do começo ao fim. No fim você recebe o Mapa da
          sua operação, por escrito.
        </p>
        <p className="dg-nota">Não é apresentação comercial: na call não tem pitch nem orçamento.</p>
      </div>
    </main>
  );
}
