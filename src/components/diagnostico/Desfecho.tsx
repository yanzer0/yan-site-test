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

/**
 * O convite para a call, idêntico para quem paga e para quem não paga.
 *
 * 🔴 Decisão do Yan, 17/08: a call é o PRODUTO, e o Mapa é o bônus que ela
 * entrega. Antes, quem não passava no corte lia "a call gratuita não é o melhor
 * caminho agora" e logo abaixo era cobrado R$ 197 pela mesma hora. Desqualificar
 * e cobrar na mesma tela derruba a venda: ninguém paga por aquilo que acabaram
 * de dizer que não serve para ele.
 *
 * Por isso a promessa é uma só, e a ÚNICA diferença entre as faixas é o bloco de
 * ação embaixo: calendário direto, ou pagamento antes do calendário.
 *
 * Sobre a copy: o que sustenta o preço é a lista do que vem no documento, não
 * adjetivo. Em nenhum lugar está escrito que o Mapa "vale mais que isso" ou que
 * a call "não é reunião comercial" — os dois são conclusões que o lead monta
 * sozinho a partir de fatos verificáveis, e conclusão própria não gera reatância.
 * O fato que mais trabalha é o de que o documento é PROIBIDO de citar ferramenta
 * nossa, prazo ou valor: isso não é promessa de vendedor, é regra do validador
 * (`mapa-schema.ts`), e é o que responde sozinho a objeção "isso é orçamento
 * disfarçado".
 */
function ConviteDaCall({ processo }: { readonly processo: string }) {
  const oProcesso = processo || "o processo que você descreveu";

  return (
    <>
      <p>
        Uma hora, por vídeo. A gente percorre <strong>{oProcesso}</strong> do começo ao fim: quem
        faz cada passo, onde ele trava hoje, e onde IA e automação encaixam de verdade.
      </p>
      <p>No fim da call você recebe o Mapa da sua operação, por escrito.</p>

      <div className="dg-oferta">
        <div className="dg-oferta-nome">O que vem no Mapa</div>
        <ul className="dg-inclui">
          <li>
            Seu processo desenhado etapa por etapa, com responsável, ferramenta e volume de cada
            uma
          </li>
          <li>Onde ele trava, e o trecho da nossa conversa que sustenta cada ponto</li>
          <li>Onde a IA encaixa, e o que muda na prática em cada encaixe</li>
          <li>O que não dá para automatizar aí dentro</li>
          <li>O que a gente não conseguiu cobrir em uma hora, dito com todas as letras</li>
          <li>O próximo passo, destrinchado em passos</li>
        </ul>
        <p>
          O documento separa o que <strong>você disse</strong> do que{" "}
          <strong>a gente concluiu</strong>, então você lê sabendo o que é o seu relato e o que é
          leitura nossa. Por regra, ele não cita ferramenta nossa, prazo nem valor de projeto: o
          que ele descreve é a sua operação.
        </p>
        <p>Ele é seu. Se a gente não trabalhar junto, ele continua valendo.</p>
      </div>
    </>
  );
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
          Então vamos marcar, <em>{eu}</em>.
        </h2>

        <ConviteDaCall processo={processo} />

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

  // `nao_icp_empresa` e `revisao`, os dois no mesmo destino: a MESMA call, paga.
  //
  // As faixas continuam separadas no banco, porque é delas que sai a calibração
  // dos pesos. O que se unifica é o que o lead vê, e ele não vê faixa nenhuma:
  // vê o mesmo convite que o qualificado, com o preço no lugar do calendário.
  return (
    <div className="dg-desfecho">
      <h2 className="dg-h1">
        Então vamos marcar, <em>{eu}</em>.
      </h2>

      <ConviteDaCall processo={processo} />

      {/* 🔴 O PREÇO só existe junto com o caminho de compra. Card que anuncia
          R$ 197 sem botão é pior que card nenhum: o lead decide comprar e bate
          numa parede. Foi o estado real do funil entre 16 e 17/08. */}
      {urlMapa ? (
        <div className="dg-oferta dg-oferta-fechamento">
          <div className="dg-oferta-nome">
            A call custa <strong>R$ 197</strong>
          </div>
          <p>Você escolhe o horário logo depois do pagamento.</p>
          <a className="dg-cta" href={urlMapa} target="_blank" rel="noopener noreferrer">
            Agendar a call
          </a>
        </div>
      ) : (
        <div className="dg-oferta dg-oferta-fechamento">
          <div className="dg-oferta-nome">A gente te chama para marcar</div>
          <p>
            O caminho de pagamento não abriu agora, mas seu cadastro está salvo. Alguém do time
            entra em contato no WhatsApp que você deixou.
          </p>
        </div>
      )}
    </div>
  );
}
