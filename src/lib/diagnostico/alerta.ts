/**
 * Aviso operacional para o time.
 *
 * Reusa o canal `OPS - alert` que já existe no n8n da Infuser (workflow
 * `M0DVv7r86uqKUjnE`), que recebe `{source, severity, message}` e manda e-mail.
 * Canal novo não se inventa quando já existe um funcionando.
 *
 * 🔴 A mensagem NUNCA carrega dado pessoal (FR-021 da 003, FR-026 da 001).
 * Vai o identificador do lead e o motivo, nunca nome, e-mail ou telefone: o
 * destino é e-mail, e e-mail não é lugar de PII de terceiro.
 *
 * Env:
 *   OPS_ALERT_URL  (sensível, webhook com token na URL)
 */

export type Severidade = "info" | "warning" | "error";

interface Alerta {
  readonly source: string;
  readonly severity: Severidade;
  readonly message: string;
}

/**
 * Dispara o alerta. Nunca lança.
 *
 * Falhar em avisar não pode derrubar o fluxo do lead: ele já preencheu, e
 * perder o lead por causa do canal de aviso seria trocar o caro pelo barato.
 * A falha do próprio alerta vai para o log do servidor.
 */
export async function alertar(alerta: Alerta): Promise<void> {
  const url = process.env.OPS_ALERT_URL;
  if (!url) {
    console.error(`[alerta] OPS_ALERT_URL nao configurada. Perdido: ${alerta.message}`);
    return;
  }

  try {
    const resposta = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(alerta),
    });
    if (!resposta.ok) {
      console.error(`[alerta] canal respondeu ${resposta.status}`);
    }
  } catch {
    console.error("[alerta] falha ao chamar o canal de alerta");
  }
}

/**
 * Avisa que um lead caiu na faixa de revisão humana e precisa de alguém olhar.
 *
 * Só o id e o porte: quem for atender abre o registro e vê o resto. O e-mail de
 * alerta não precisa saber quem é a pessoa para cumprir a função dele, que é
 * dizer "tem trabalho esperando".
 */
export function avisarRevisaoHumana(leadId: string, porte: string | null): Promise<void> {
  return alertar({
    source: "funil-diagnostico",
    severity: "warning",
    message: `Lead em revisao humana. id=${leadId} porte=${porte ?? "nao_informado"}. Abrir o registro para decidir se agenda.`,
  });
}

/** Avisa que a persistência falhou. Sem isso, lead perdido some em silêncio. */
export function avisarFalhaPersistencia(operacao: string, sessaoId: string): Promise<void> {
  return alertar({
    source: "funil-diagnostico",
    severity: "error",
    message: `Falha ao persistir lead. operacao=${operacao} sessao=${sessaoId}. O lead preencheu e NAO foi salvo.`,
  });
}
