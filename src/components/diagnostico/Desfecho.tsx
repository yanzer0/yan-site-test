"use client";

/**
 * O que o lead vê ao terminar, por faixa.
 *
 * 🔴 Regra que governa todos os textos daqui (FR-017 e princípio IV): em
 * NENHUMA faixa o lead lê que foi desqualificado, reprovado ou que não atende
 * critérios. Quem não tem encaixe recebe um caminho honesto, não um carimbo.
 *
 * Os textos são contrato, não copy livre: contracts/score.md.
 */

import { useState } from "react";

import type { Faixa } from "@/lib/diagnostico/tipos";
import { CalAgenda } from "./CalAgenda";

const LINK_KIT = "https://useinfuser.com/kit-segundo-cerebro";

interface DesfechoProps {
  readonly faixa: Faixa;
  readonly nome: string;
  readonly processo: string;
  readonly email: string;
  /** URL do evento do Cal.com. Ausente cai no caminho alternativo, nunca em erro cru. */
  readonly urlCal?: string;
  /** Destino do Mapa de IA. Enquanto não existir página, cai no contato. */
  readonly urlMapa?: string;
}

function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] ?? nome;
}

/**
 * De `https://cal.com/infuser/diagnostico` para `infuser/diagnostico`.
 *
 * A variável de ambiente guarda a URL pública, que é o que se manda para uma
 * pessoa. O embed quer só o caminho. Converter aqui evita ter duas variáveis
 * dizendo a mesma coisa em formatos diferentes, que é onde uma delas envelhece.
 */
export function caminhoDoCal(url: string): string | null {
  try {
    const { hostname, pathname } = new URL(url);
    if (!hostname.endsWith("cal.com")) return null;
    const caminho = pathname.replace(/^\/+|\/+$/g, "");
    return caminho.length > 0 ? caminho : null;
  } catch {
    return null;
  }
}

export function Desfecho({ faixa, nome, processo, email, urlCal, urlMapa }: DesfechoProps) {
  const [calFalhou, setCalFalhou] = useState(false);
  const eu = primeiroNome(nome);

  if (faixa === "qualificado") {
    // O embed oficial quer `usuario/evento`, não a URL inteira. Nome e e-mail
    // vão pela config do componente, não na query string.
    const embed = urlCal ? caminhoDoCal(urlCal) : null;

    return (
      <div className="dg-desfecho">
        <h2 className="dg-h1">
          Fecha bem com o que a gente faz, <em>{eu}</em>.
        </h2>
        <p>
          A conversa é de uma hora, por vídeo. É diagnóstico: a gente quer entender como o{" "}
          <strong>{processo || "seu processo"}</strong> funciona aí dentro e te dizer com
          sinceridade o que dá e o que não dá para automatizar.
        </p>
        <p>
          Não tem apresentação, proposta nem preço nessa call. No fim dela você recebe o mapa da
          operação por escrito.
        </p>

        {embed && !calFalhou ? (
          <div className="dg-cal">
            <CalAgenda
              link={embed}
              nome={nome}
              email={email}
              aoFalhar={() => setCalFalhou(true)}
            />
          </div>
        ) : (
          // FR-021: indisponibilidade do provedor nunca vira erro cru na cara do
          // lead qualificado, que é o ativo mais caro do funil.
          <div className="dg-oferta">
            <div className="dg-oferta-nome">A gente te chama para marcar</div>
            <p>
              O calendário não abriu agora, mas seu cadastro está salvo. Alguém do time entra em
              contato no WhatsApp que você deixou para combinar o horário.
            </p>
          </div>
        )}
      </div>
    );
  }

  if (faixa === "revisao") {
    // Sem oferta de propósito: vender para quem ainda pode virar call gratuita queima a call.
    return (
      <div className="dg-desfecho">
        <h2 className="dg-h1">
          Recebi, <em>{eu}</em>. Obrigado pelo tempo.
        </h2>
        <p>
          Pelo que você descreveu, faz sentido a gente olhar com calma antes de marcar. Alguém do
          time te chama no WhatsApp em até um dia útil para entender dois ou três pontos.
        </p>
      </div>
    );
  }

  if (faixa === "nao_icp_pessoal") {
    return (
      <div className="dg-desfecho">
        <h2 className="dg-h1">
          Boa, <em>{eu}</em>.
        </h2>
        <p>
          Pelo que você contou, o que você quer é organizar o seu próprio contexto, e para isso a
          call de diagnóstico de empresa não serve.
        </p>
        <div className="dg-oferta">
          <div className="dg-oferta-nome">Kit Segundo Cérebro</div>
          <p>
            É o sistema que o Yan usa todo dia para não reexplicar as coisas para a IA a cada
            conversa. Pagamento único de <strong>R$ 67</strong>.
          </p>
          <a className="dg-cta" href={LINK_KIT} target="_blank" rel="noopener noreferrer">
            Ver o kit
          </a>
        </div>
      </div>
    );
  }

  // nao_icp_empresa
  return (
    <div className="dg-desfecho">
      <h2 className="dg-h1">
        Vou ser direto com você, <em>{eu}</em>.
      </h2>
      <p>
        Pelo que descreveu, a call de diagnóstico não é o melhor caminho agora, e a gente não vai
        ocupar uma hora sua com uma conversa que não vai te servir.
      </p>
      <div className="dg-oferta">
        <div className="dg-oferta-nome">Mapa de IA</div>
        <p>
          É o mesmo diagnóstico, feito em cima do seu processo, e você sai com o mapa por escrito
          de onde a IA encaixa na sua operação. Custa <strong>R$ 197</strong>.
        </p>
        {urlMapa && (
          <a className="dg-cta" href={urlMapa} target="_blank" rel="noopener noreferrer">
            Quero o mapa
          </a>
        )}
      </div>
      <p style={{ marginTop: 20 }}>Se em algum momento o cenário aí mudar, é só voltar aqui.</p>
    </div>
  );
}
