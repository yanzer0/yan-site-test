"use client";

/**
 * O dossiê do lead pronto para colar num chat de modelo.
 *
 * A caixa de texto vem preenchida e é o produto: mesmo sem JavaScript o time
 * seleciona e copia à mão. O botão é conveniência em cima disso, nunca o único
 * caminho, porque boa parte do acesso vem do navegador embutido do Instagram e
 * de celular, onde script de terceiro falha mais do que se admite.
 */

import { useState } from "react";

export function CopiarContexto({ texto }: { readonly texto: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      // Volta ao normal sozinho: o rótulo é retorno da ação, não estado do lead.
      window.setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Clipboard bloqueado (webview, http, permissão). A caixa continua ali,
      // então o caminho manual segue valendo e nada quebra na cara do usuário.
      setCopiado(false);
    }
  }

  return (
    <>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <button type="button" className="lp-acao" style={{ marginLeft: 0, border: 0, cursor: "pointer" }} onClick={copiar}>
          {copiado ? "Copiado" : "Copiar tudo"}
        </button>
      </div>
      <textarea className="lp-contexto" readOnly value={texto} />
    </>
  );
}
