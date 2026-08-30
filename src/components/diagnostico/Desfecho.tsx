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

import type { Faixa, OfertaAlternativa } from "@/lib/diagnostico/tipos";
import { CalAgenda } from "./CalAgenda";

const LINK_KIT = "https://useinfuser.com/kit-segundo-cerebro";

interface DesfechoProps {
  readonly faixa: Faixa;
  readonly nome: string;
  readonly processo: string;
  readonly email: string;
  /**
   * Qual alternativa mostrar a quem não é qualificado. Decidida no servidor a
   * partir do motivo do corte. Ausente equivale a `call_paga`, que é o que
   * toda faixa não qualificada recebia antes de os gates existirem.
   */
  readonly oferta?: OfertaAlternativa;
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

/**
 * O Kit, com o que sustenta o preço listado, e o botão que leva à venda.
 *
 * Um componente só para os dois caminhos que chegam aqui (uso pessoal e empresa
 * que não vai à call) pelo mesmo motivo que existe o `ConviteDaCall`: texto
 * duplicado por faixa diverge com o tempo e ninguém percebe.
 *
 * 🔴 O preço aqui já esteve ERRADO em produção: dizia "pagamento único de
 * R$ 67" enquanto a página cobra assinatura mensal a partir de R$ 37 (Starter),
 * com R$ 67 sendo o plano do meio. Quem clicava batia num preço diferente do
 * que acabou de ler. Qualquer mudança de preço nesta caixa se confere em
 * `src/app/kit-segundo-cerebro/pagina.html`, que é a página que recebe o clique.
 *
 * O que sustenta a oferta é a lista do que vem dentro, nunca adjetivo. Mesma
 * disciplina do bloco do Mapa: o lead conclui o valor sozinho, e conclusão
 * própria não gera reatância.
 */
function OfertaSegundoCerebro({ abertura }: { readonly abertura: React.ReactNode }) {
  return (
    <div className="dg-oferta">
      <div className="dg-oferta-nome">Kit Segundo Cérebro</div>
      {abertura}
      <ul className="dg-inclui">
        <li>Um cérebro privado onde ficam os seus projetos, decisões, ideias e contexto</li>
        <li>
          Conecta no Claude ou no Codex que você já usa, e a partir daí a IA responde com o que
          está lá dentro
        </li>
        <li>Você pede em português normal, sem estrutura para acertar nem pasta para manter</li>
        <li>
          Nos planos acima do inicial vêm junto o Kit de Skills e os cinco agentes base da Infuser
        </li>
        <li>Tutorial de ativação e conexão, para você ligar sozinho no mesmo dia</li>
      </ul>
      <p>
        São três planos, a partir de <strong>R$ 37 por mês</strong>. É assinatura mensal, e a
        assinatura da IA que você já usa continua contratada à parte.
      </p>
      <a className="dg-cta" href={LINK_KIT} target="_blank" rel="noopener noreferrer">
        Ver os planos do Segundo Cérebro
      </a>
    </div>
  );
}

export function Desfecho({ faixa, nome, processo, email, oferta, urlCal, urlMapa }: DesfechoProps) {
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
        <OfertaSegundoCerebro
          abertura={
            <p>
              É o sistema que o Yan usa todo dia para não reexplicar as coisas para a IA a cada
              conversa.
            </p>
          }
        />
      </div>
    );
  }

  // Empresa que não vai para a agenda: ela declarou não ter a hora que a call
  // custa. Vender a MESMA hora, cobrando por ela, seria devolver o obstáculo
  // com preço. O que sobra de honesto é o produto que ele usa sozinho.
  //
  // Continua valendo o FR-017: em nenhuma linha aqui ele lê veredito sobre o
  // próprio encaixe. O que ele lê é a própria resposta dele, devolvida.
  if (oferta === "kit") {
    return (
      <div className="dg-desfecho">
        <h2 className="dg-h1">
          Anotado, <em>{eu}</em>.
        </h2>
        <OfertaSegundoCerebro
          abertura={
            <p>
              O mapa da sua operação sai de uma hora de conversa, e essa hora não cabe na sua
              agenda por enquanto. Dá para começar pelo lado que não depende de reunião: parar de
              reexplicar a sua operação para a IA toda vez que abre uma conversa nova.
            </p>
          }
        />
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
