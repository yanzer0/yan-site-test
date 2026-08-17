"use client";

/**
 * O calendário da call PAGA, na página de retorno do Stripe.
 *
 * Separado do `Desfecho` porque o contexto é outro: aqui não há score, nem
 * faixa, nem nome vindo do formulário — só um e-mail que o Stripe confirmou.
 * Espremer os dois casos no mesmo componente cobraria um `if` a cada linha.
 *
 * O fallback quando o embed não carrega existe pelo mesmo motivo do outro, com
 * o peso maior: aqui a pessoa JÁ PAGOU. Erro cru na tela de quem pagou é a pior
 * tela do funil inteiro.
 */

import { useState } from "react";

import { CalAgenda } from "./CalAgenda";
import { caminhoDoCal } from "./Desfecho";

interface AgendaPagaProps {
  readonly urlCal?: string;
  readonly email: string | null;
}

export function AgendaPaga({ urlCal, email }: AgendaPagaProps) {
  const [falhou, setFalhou] = useState(false);
  // Reusa o conversor do Desfecho de propósito: duas implementações do mesmo
  // parse é onde uma delas envelhece e só a outra é corrigida.
  const embed = urlCal ? caminhoDoCal(urlCal) : null;

  if (!embed || falhou) {
    return (
      <div className="dg-oferta">
        <div className="dg-oferta-nome">A gente marca com você</div>
        <p>
          O calendário não abriu agora, mas seu pagamento está confirmado e registrado. Responda o
          e-mail do comprovante e a gente combina o horário no mesmo dia.
        </p>
      </div>
    );
  }

  return (
    <div className="dg-cal">
      <CalAgenda link={embed} nome="" email={email ?? ""} aoFalhar={() => setFalhou(true)} />
    </div>
  );
}
