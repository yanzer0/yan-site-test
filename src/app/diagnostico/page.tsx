import type { Metadata } from "next";

import { Conversa } from "@/components/diagnostico/Conversa";
import { LOGO_INFUSER_V2 } from "./logo-infuser";
import "./diagnostico.css";

export const metadata: Metadata = {
  title: "Diagnóstico gratuito da sua operação | Infuser",
  description:
    "Uma hora de diagnóstico com o time da Infuser para mapear onde IA e automação encaixam na sua operação. São 14 perguntas e leva uns 3 minutos.",
  robots: { index: true, follow: true },
};

/**
 * A rota do formulário de diagnóstico.
 *
 * Server component de propósito: a abertura e a primeira pergunta chegam no HTML
 * inicial, sem depender do JavaScript ter rodado. Isso importa porque a maior
 * parte do tráfego entra pelo navegador embutido do Instagram, que é o ambiente
 * mais restrito da lista.
 */
export default function DiagnosticoPage() {
  const urlCal = process.env.NEXT_PUBLIC_CAL_URL;
  const urlMapa = process.env.NEXT_PUBLIC_MAPA_IA_URL;

  return (
    <main className="dg">
      <div className="dg-wrap">
        {/* Logo v2, o mesmo lockup dos deliverables. Substituiu a palavra
            "INFUSER" escrita: marca de verdade, nao nome em texto.
            Fica como <img> com data URI em vez de next/image porque e SVG
            embutido: nao ha o que otimizar e evita uma requisicao a mais na
            primeira tela, que e a que carrega no webview do Instagram. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="dg-brand" src={LOGO_INFUSER_V2} alt="Infuser" width={132} height={30} />

        <div className="dg-eyebrow">Diagnóstico sem custo</div>
        <h1 className="dg-h1">
          Uma hora para mapear onde a IA <em>encaixa de verdade</em> na sua operação
        </h1>
        <p className="dg-lead">
          São 14 perguntas e leva uns 3 minutos. Se fizer sentido pros dois lados, você escolhe o
          horário aqui mesmo no final.
        </p>
        <p className="dg-lead">
          Na call a gente mapeia como o seu processo funciona hoje e onde IA e automação encaixam.
          Depois você recebe esse mapa por escrito, para usar com a gente ou sem a gente.
        </p>
        <p className="dg-nota">
          Não é apresentação comercial. Não tem proposta nem preço nessa conversa.
        </p>

        <Conversa urlCal={urlCal} urlMapa={urlMapa} urlPolitica="/privacidade" />
      </div>
    </main>
  );
}
