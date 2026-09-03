"use client";

/**
 * O motor da conversa: uma pergunta por vez, com a anterior visível.
 *
 * A trilha é derivada da resposta de uso pessoal versus empresa, então marcar
 * "uso pessoal" encurta o formulário na hora, sem recarregar nada.
 *
 * Retomada: o estado vai para o localStorage a cada mudança. Quem fecha a aba e
 * volta no mesmo aparelho continua de onde parou. Quem troca de aparelho perde o
 * rascunho local, e é por isso que o parcial também é gravado no servidor.
 */

import { useCallback, useEffect, useMemo, useState } from "react";

import { Campo } from "./Campo";
import { Desfecho } from "./Desfecho";
import { P, RESPOSTA_USO_PESSOAL, perguntasDaTrilha } from "@/lib/diagnostico/perguntas";
import type { Pergunta, ResultadoSubmissao, ValorResposta } from "@/lib/diagnostico/tipos";

const CHAVE_LOCAL = "infuser:diagnostico:v1";

/** Campos de identificação. Ficam fora de `respostas` porque não pontuam. */
interface Extras {
  nome: string;
  empresaNome: string;
  empresaPapel: string;
  whatsapp: string;
  email: string;
  origem: string;
  /** Só aparece quando a origem é indicação. Opcional: vazio não trava o envio. */
  indicadoPor: string;
}

const EXTRAS_VAZIO: Extras = {
  nome: "",
  empresaNome: "",
  empresaPapel: "",
  whatsapp: "",
  email: "",
  origem: "",
  indicadoPor: "",
};

/** A opção de origem que revela o campo "quem te indicou". Mesmo id do contrato de perguntas. */
const ORIGEM_INDICACAO = "indicacao";

interface EstadoSalvo {
  readonly passo: number;
  readonly respostas: Record<string, ValorResposta>;
  readonly extras: Extras;
  readonly sessaoId: string;
}

interface ConversaProps {
  readonly urlCal?: string;
  readonly urlMapa?: string;
  readonly urlPolitica: string;
  /**
   * A abertura que explica a call. Só aparece na PRIMEIRA pergunta.
   *
   * Vem de fora, e não escrita aqui dentro, porque a página é server component:
   * assim o texto continua no HTML inicial, que é o que o webview do Instagram
   * consegue mostrar antes do JavaScript rodar.
   */
  readonly children?: React.ReactNode;
}

function novaSessao(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `s-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

export function Conversa({ urlCal, urlMapa, urlPolitica, children }: ConversaProps) {
  const [passo, setPasso] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, ValorResposta>>({});
  const [extras, setExtras] = useState<Extras>(EXTRAS_VAZIO);
  const [consentiu, setConsentiu] = useState(false);
  const [sessaoId, setSessaoId] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [resultado, setResultado] = useState<ResultadoSubmissao | null>(null);

  // Retoma o rascunho local. Roda uma vez, no cliente.
  useEffect(() => {
    try {
      const bruto = window.localStorage.getItem(CHAVE_LOCAL);
      if (bruto) {
        const salvo = JSON.parse(bruto) as EstadoSalvo;
        setPasso(salvo.passo ?? 0);
        setRespostas(salvo.respostas ?? {});
        setExtras({ ...EXTRAS_VAZIO, ...salvo.extras });
        setSessaoId(salvo.sessaoId || novaSessao());
        return;
      }
    } catch {
      // Rascunho corrompido não pode impedir alguém de preencher. Recomeça limpo.
    }
    setSessaoId(novaSessao());
  }, []);

  useEffect(() => {
    if (!sessaoId || resultado) return;
    try {
      const estado: EstadoSalvo = { passo, respostas, extras, sessaoId };
      window.localStorage.setItem(CHAVE_LOCAL, JSON.stringify(estado));
    } catch {
      // Sem localStorage (aba anônima, storage cheio) o formulário segue funcionando.
    }
  }, [passo, respostas, extras, sessaoId, resultado]);

  const trilha = respostas[P.TIPO_USO] === RESPOSTA_USO_PESSOAL ? "pessoal" : "empresa";
  const perguntas = useMemo(() => perguntasDaTrilha(trilha), [trilha]);

  const total = perguntas.length;
  const indice = Math.min(passo, total - 1);
  const atual: Pergunta | undefined = perguntas[indice];
  const anterior = indice > 0 ? perguntas[indice - 1] : undefined;
  const ehUltima = indice === total - 1;

  const definir = useCallback((id: string, valor: ValorResposta) => {
    setRespostas((antes) => ({ ...antes, [id]: valor }));
    setErro("");
  }, []);

  const respondida = useCallback(
    (pergunta: Pergunta): boolean => {
      if (!pergunta.obrigatoria) return true;

      if (pergunta.id === P.NOME) return extras.nome.trim().length >= 2;
      if (pergunta.id === P.EMPRESA) return extras.empresaNome.trim().length > 0 && extras.empresaPapel.length > 0;
      if (pergunta.id === P.EMAIL_PESSOAL) return extras.email.trim().length > 0;
      if (pergunta.id === P.CONTATO) {
        return extras.whatsapp.trim().length > 0 && extras.email.trim().length > 0 && extras.origem.length > 0;
      }

      const valor = respostas[pergunta.id];
      if (Array.isArray(valor)) return valor.length > 0;
      return typeof valor === "string" && valor.trim().length > 0;
    },
    [respostas, extras],
  );

  /**
   * Grava o rascunho no servidor a cada três perguntas.
   *
   * A cada pergunta seria uma escrita por clique sem comprar nada. A cada três
   * dá granularidade suficiente para saber onde as pessoas desistem, que é o
   * motivo do parcial existir. Falha aqui é ignorada de propósito: é telemetria,
   * não pode atrapalhar quem está preenchendo.
   */
  function gravarRascunho(proximoIndice: number) {
    if (!sessaoId || proximoIndice % 3 !== 0) return;
    void fetch("/api/diagnostico/parcial", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessaoId,
        respostas,
        ultimaPergunta: atual?.id ?? "",
        origem: extras.origem,
      }),
      keepalive: true,
    }).catch(() => {});
  }

  function avancar() {
    if (!atual) return;
    if (!respondida(atual)) {
      setErro("Precisa responder essa para seguir.");
      return;
    }
    setErro("");
    if (!ehUltima) {
      const proximo = indice + 1;
      gravarRascunho(proximo);
      setPasso(proximo);
    }
  }

  async function enviar() {
    if (!atual || !respondida(atual)) {
      setErro("Precisa responder essa para seguir.");
      return;
    }
    if (!consentiu) {
      setErro("Marque o consentimento para enviar.");
      return;
    }

    setEnviando(true);
    setErro("");

    try {
      const resposta = await fetch("/api/diagnostico/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessaoId,
          respostas,
          origem: extras.origem,
          consentimento: true,
          contato: {
            nome: extras.nome,
            email: extras.email,
            whatsapp: extras.whatsapp,
            empresa: extras.empresaNome,
            papel: extras.empresaPapel,
            indicadoPor: extras.origem === ORIGEM_INDICACAO ? extras.indicadoPor : "",
          },
        }),
      });

      if (!resposta.ok) {
        setErro("Não consegui enviar agora. Tenta de novo em alguns segundos.");
        return;
      }

      const dados = (await resposta.json()) as ResultadoSubmissao;
      setResultado(dados);
      try {
        window.localStorage.removeItem(CHAVE_LOCAL);
      } catch {
        // Falhar a limpeza do rascunho não invalida o envio, que já aconteceu.
      }
    } catch {
      setErro("Não consegui enviar agora. Tenta de novo em alguns segundos.");
    } finally {
      setEnviando(false);
    }
  }

  if (resultado) {
    return (
      <Desfecho
        faixa={resultado.faixa}
        nome={resultado.nome}
        processo={resultado.agendamento?.processo ?? ""}
        email={resultado.agendamento?.email ?? extras.email}
        oferta={resultado.oferta}
        urlCal={urlCal}
        urlMapa={urlMapa}
      />
    );
  }

  if (!atual) return null;

  const ecoAnterior = anterior ? resumir(anterior, respostas, extras) : "";

  return (
    <div>
      {indice === 0 && children}

      <div className="dg-progresso">
        <span>
          {indice + 1} de {total}
        </span>
        <div className="dg-barra">
          <span style={{ width: `${((indice + 1) / total) * 100}%` }} />
        </div>
      </div>

      {ecoAnterior && (
        <p className="dg-eco">
          {anterior?.enunciado} <b>{ecoAnterior}</b>
        </p>
      )}

      <h2 className="dg-pergunta">{atual.enunciado}</h2>
      {atual.ajuda && atual.tipo !== "texto_curto" && atual.tipo !== "texto_longo" && (
        <p className="dg-ajuda">{atual.ajuda}</p>
      )}

      {renderCampo()}

      {ehUltima && (
        <label className="dg-consent">
          <input
            type="checkbox"
            checked={consentiu}
            onChange={(e) => setConsentiu(e.target.checked)}
          />
          <p>
            Concordo em ser contatado e com o tratamento dos meus dados conforme a{" "}
            <a href={urlPolitica} target="_blank" rel="noopener noreferrer">
              Política de Privacidade
            </a>
            .
          </p>
        </label>
      )}

      <div className="dg-acoes">
        <button
          type="button"
          className="dg-btn"
          onClick={ehUltima ? enviar : avancar}
          disabled={enviando || (ehUltima && !consentiu)}
        >
          {enviando ? "Enviando..." : ehUltima ? "Enviar" : "Continuar"}
        </button>
        {indice > 0 && (
          <button type="button" className="dg-voltar" onClick={() => setPasso(indice - 1)}>
            Voltar
          </button>
        )}
      </div>

      {erro && <p className="dg-erro">{erro}</p>}
    </div>
  );

  function renderCampo() {
    if (atual!.id === P.NOME) {
      return (
        <input
          className="dg-input"
          type="text"
          value={extras.nome}
          maxLength={200}
          onChange={(e) => setExtras({ ...extras, nome: e.target.value })}
          autoFocus
        />
      );
    }

    if (atual!.id === P.EMAIL_PESSOAL) {
      return (
        <input
          className="dg-input"
          type="email"
          inputMode="email"
          value={extras.email}
          onChange={(e) => setExtras({ ...extras, email: e.target.value })}
          autoFocus
        />
      );
    }

    if (atual!.id === P.EMPRESA) {
      return (
        <>
          <div className="dg-campo">
            <span className="dg-rotulo">Empresa</span>
            <input
              className="dg-input"
              type="text"
              value={extras.empresaNome}
              maxLength={200}
              onChange={(e) => setExtras({ ...extras, empresaNome: e.target.value })}
              autoFocus
            />
          </div>
          <div className="dg-campo">
            <span className="dg-rotulo">Seu papel</span>
            <div className="dg-opcoes">
              {atual!.opcoes?.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  className="dg-opcao"
                  aria-pressed={extras.empresaPapel === o.id}
                  onClick={() => setExtras({ ...extras, empresaPapel: o.id })}
                >
                  <span className="dg-marca">{extras.empresaPapel === o.id ? "✓" : ""}</span>
                  {o.rotulo}
                </button>
              ))}
            </div>
          </div>
        </>
      );
    }

    if (atual!.id === P.CONTATO) {
      return (
        <>
          <div className="dg-campo">
            <span className="dg-rotulo">WhatsApp com DDD</span>
            <input
              className="dg-input"
              type="tel"
              inputMode="tel"
              value={extras.whatsapp}
              onChange={(e) => setExtras({ ...extras, whatsapp: e.target.value })}
              autoFocus
            />
          </div>
          <div className="dg-campo">
            <span className="dg-rotulo">E-mail</span>
            <input
              className="dg-input"
              type="email"
              inputMode="email"
              value={extras.email}
              onChange={(e) => setExtras({ ...extras, email: e.target.value })}
            />
          </div>
          <div className="dg-campo">
            <span className="dg-rotulo">Como você chegou até aqui?</span>
            <div className="dg-opcoes">
              {atual!.opcoes?.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  className="dg-opcao"
                  aria-pressed={extras.origem === o.id}
                  onClick={() => setExtras({ ...extras, origem: o.id })}
                >
                  <span className="dg-marca">{extras.origem === o.id ? "✓" : ""}</span>
                  {o.rotulo}
                </button>
              ))}
            </div>
          </div>
          {extras.origem === ORIGEM_INDICACAO && (
            <div className="dg-campo">
              <span className="dg-rotulo">Quem te indicou? (opcional)</span>
              <input
                className="dg-input"
                type="text"
                maxLength={200}
                value={extras.indicadoPor}
                onChange={(e) => setExtras({ ...extras, indicadoPor: e.target.value })}
              />
            </div>
          )}
        </>
      );
    }

    return (
      <Campo
        pergunta={atual!}
        valor={respostas[atual!.id]}
        aoMudar={(v) => definir(atual!.id, v)}
        aoConfirmar={avancar}
      />
    );
  }
}

/** Texto curto da resposta anterior, para a conversa não parecer um formulário mudo. */
function resumir(
  pergunta: Pergunta,
  respostas: Record<string, ValorResposta>,
  extras: Extras,
): string {
  if (pergunta.id === P.NOME) return extras.nome;
  if (pergunta.id === P.EMPRESA) return extras.empresaNome;

  const valor = respostas[pergunta.id];
  const rotulo = (id: string) => pergunta.opcoes?.find((o) => o.id === id)?.rotulo ?? id;

  if (Array.isArray(valor)) return valor.map(rotulo).join(", ");
  if (typeof valor === "string") {
    const texto = pergunta.opcoes ? rotulo(valor) : valor;
    return texto.length > 90 ? `${texto.slice(0, 90)}...` : texto;
  }
  return "";
}
