/**
 * A porta do painel, compartilhada pelas telas que servem dado de lead.
 *
 * 🔴 A checagem roda ANTES de qualquer consulta ao banco. Assim nem o tempo de
 * resposta entrega se existe lead, e nenhum caminho serve PII por engano.
 */

import { cookies } from "next/headers";

import { COOKIE_LEADS, cookieAutoriza } from "@/lib/diagnostico/acesso-leads";

// debt: nenhum registro de quem abriu o painel e quando. Se um cookie vazar,
// não há como saber que foi usado nem por onde. Gatilho: quando o time passar
// de três pessoas, ou no primeiro aparelho perdido.

export async function temAcesso(): Promise<boolean> {
  const jar = await cookies();
  return cookieAutoriza(jar.get(COOKIE_LEADS)?.value);
}

/**
 * O que aparece para quem chega sem o cookie.
 *
 * Não diz "acesso negado" nem nomeia o que existe atrás. Quem é do time sabe o
 * que fazer; quem não é não descobre que aqui mora uma base de leads.
 */
export function PaginaSemAcesso() {
  return (
    <main className="lp">
      <div className="lp-wrap" style={{ maxWidth: 420, paddingTop: "18vh", textAlign: "center" }}>
        <div className="lp-marca">Infuser</div>
        <h1 className="lp-titulo">Área interna</h1>
        <p className="lp-sub">
          Este aparelho ainda não foi liberado. Se você é do time, peça o link de acesso e abra
          uma vez por aparelho.
        </p>
      </div>
    </main>
  );
}
