"use client";

/**
 * O calendário de agendamento, com altura automática.
 *
 * Existia como `<iframe height="520">` fixo, e o resultado era o lead ter que
 * rolar dentro de uma caixa para achar as datas. Altura fixa nunca resolve
 * aqui: o Cal.com muda de layout entre desktop e celular, e o mesmo número que
 * serve num corta o outro.
 *
 * O embed oficial resolve por `postMessage`: o iframe informa a própria altura
 * ao pai e cresce sozinho. Nada de chutar breakpoint.
 */

import { useEffect } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";

interface CalAgendaProps {
  /** Caminho do evento no Cal.com, no formato `usuario/evento`. */
  readonly link: string;
  readonly nome: string;
  readonly email: string;
  readonly aoFalhar: () => void;
}

export function CalAgenda({ link, nome, email, aoFalhar }: CalAgendaProps) {
  useEffect(() => {
    let vivo = true;

    (async () => {
      try {
        const cal = await getCalApi();
        if (!vivo) return;

        // Tema escuro para casar com a página. O acento é o lime da v2.
        // `light` precisa existir mesmo com o tema fixo em dark: o tipo exige
        // os dois, e deixar de fora quebra a compilação.
        cal("ui", {
          theme: "dark",
          hideEventTypeDetails: false,
          cssVarsPerTheme: {
            dark: { "cal-brand": "#C6FF34" },
            light: { "cal-brand": "#C6FF34" },
          },
        });
      } catch {
        // Se o embed não carregar, o lead qualificado NAO pode ver erro cru:
        // cai no caminho alternativo, que preserva o contato (FR-021).
        if (vivo) aoFalhar();
      }
    })();

    return () => {
      vivo = false;
    };
  }, [aoFalhar]);

  return (
    <Cal
      calLink={link}
      config={{ name: nome, email, layout: "month_view" }}
      style={{ width: "100%", height: "100%", overflow: "scroll" }}
    />
  );
}
