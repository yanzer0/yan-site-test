"use client";

/**
 * Renderiza o campo de uma pergunta, por tipo.
 *
 * Só conhece os quatro tipos simples. O tipo `contato`, que agrupa mais de um
 * dado numa pergunta só, é montado pela Conversa, porque cada ocorrência dele
 * tem uma combinação diferente de subcampos.
 */

import type { Pergunta, ValorResposta } from "@/lib/diagnostico/tipos";

interface CampoProps {
  readonly pergunta: Pergunta;
  readonly valor: ValorResposta | undefined;
  readonly aoMudar: (valor: ValorResposta) => void;
  readonly aoConfirmar: () => void;
}

function comoTexto(valor: ValorResposta | undefined): string {
  return typeof valor === "string" ? valor : "";
}

function comoLista(valor: ValorResposta | undefined): readonly string[] {
  return Array.isArray(valor) ? valor : [];
}

export function Campo({ pergunta, valor, aoMudar, aoConfirmar }: CampoProps) {
  if (pergunta.tipo === "texto_longo") {
    return (
      <textarea
        className="dg-textarea"
        value={comoTexto(valor)}
        placeholder={pergunta.ajuda}
        maxLength={5000}
        onChange={(e) => aoMudar(e.target.value)}
        autoFocus
      />
    );
  }

  if (pergunta.tipo === "texto_curto") {
    return (
      <input
        className="dg-input"
        type="text"
        value={comoTexto(valor)}
        placeholder={pergunta.ajuda}
        maxLength={200}
        onChange={(e) => aoMudar(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            aoConfirmar();
          }
        }}
        autoFocus
      />
    );
  }

  if (pergunta.tipo === "escolha_unica") {
    const escolhido = comoTexto(valor);
    return (
      <div className="dg-opcoes">
        {pergunta.opcoes?.map((opcao) => (
          <button
            key={opcao.id}
            type="button"
            className="dg-opcao"
            aria-pressed={escolhido === opcao.id}
            onClick={() => aoMudar(opcao.id)}
          >
            <span className="dg-marca">{escolhido === opcao.id ? "✓" : ""}</span>
            {opcao.rotulo}
          </button>
        ))}
      </div>
    );
  }

  // multipla_escolha
  const marcadas = comoLista(valor);
  return (
    <div className="dg-opcoes">
      {pergunta.opcoes?.map((opcao) => {
        const marcada = marcadas.includes(opcao.id);
        return (
          <button
            key={opcao.id}
            type="button"
            className="dg-opcao"
            data-marcada={marcada}
            onClick={() =>
              aoMudar(
                marcada ? marcadas.filter((m) => m !== opcao.id) : [...marcadas, opcao.id],
              )
            }
          >
            <span className="dg-marca">{marcada ? "✓" : ""}</span>
            {opcao.rotulo}
          </button>
        );
      })}
    </div>
  );
}
