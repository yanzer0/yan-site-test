/**
 * O fato "um lead foi registrado", na caixa padrão da Infuser.
 *
 * Por que evento e não uma chamada direta ao canal de aviso: hoje o consumidor
 * é um só (o time recebe o aviso e abre o painel). Amanhã são vários - a tela
 * viva por SSE, o card no brain, uma automação de follow-up. Cada um novo vira
 * mais um leitor da MESMA caixa, sem tocar no formulário. Retrofit de envelope
 * depois dói; agora custa este arquivo.
 *
 * Envelope CloudEvents 1.0: `specversion`, `id`, `source`, `type` obrigatórios;
 * `subject` e `time` recomendados. Dedup pela dupla `(source, id)`, nunca pelo
 * `id` sozinho.
 *
 * 🔴 O evento NÃO carrega nome, e-mail nem WhatsApp. Ele vai para canal de
 * aviso, log e n8n, e nenhum dos três é lugar de dado pessoal (FR-026). Quem
 * precisa do contato abre o painel, que tem porta. O envelope leva só o que
 * decide se alguém age: faixa, score, porte e o link.
 *
 * Env:
 *   LEADS_EVENTO_URL  (opcional) — webhook que recebe o envelope cru
 *   OPS_ALERT_URL     — canal já existente, usado como saída enquanto o de cima
 *                       não estiver configurado
 */

import { randomUUID } from "node:crypto";

import { alertar } from "./alerta";
import type { Faixa } from "./tipos";

const SOURCE = "useinfuser.com/diagnostico";

/** Verbo no passado, vocabulário fechado. Comando não entra aqui. */
const TYPE_LEAD_REGISTRADO = "br.com.useinfuser.diagnostico.lead.registered";

export interface DadosLeadRegistrado {
  readonly leadId: string;
  readonly faixa: Faixa;
  readonly score: number;
  readonly porte: string | null;
  readonly tipo: "empresa" | "pessoal";
  readonly origem: string;
}

export interface EnvelopeEvento {
  readonly specversion: "1.0";
  readonly id: string;
  readonly source: string;
  readonly type: string;
  readonly subject: string;
  readonly time: string;
  readonly datacontenttype: "application/json";
  readonly data: { readonly ok: true } & DadosLeadRegistrado & { readonly painel: string };
}

export function envelopeLeadRegistrado(
  dados: DadosLeadRegistrado,
  agora: Date,
  id: string = randomUUID(),
): EnvelopeEvento {
  return {
    specversion: "1.0",
    id,
    source: SOURCE,
    type: TYPE_LEAD_REGISTRADO,
    subject: dados.leadId,
    time: agora.toISOString(),
    datacontenttype: "application/json",
    data: {
      ok: true,
      ...dados,
      painel: `https://useinfuser.com/leads/${dados.leadId}`,
    },
  };
}

/**
 * Publica o fato. Nunca lança.
 *
 * Mesma política do `alertar`: o lead já preencheu e já está gravado. Falhar em
 * avisar não pode virar erro na cara de quem acabou de responder catorze
 * perguntas.
 */
export async function publicarLeadRegistrado(dados: DadosLeadRegistrado): Promise<void> {
  const envelope = envelopeLeadRegistrado(dados, new Date());
  const url = process.env.LEADS_EVENTO_URL;

  if (!url) {
    // Sem canal próprio configurado, o fato ainda precisa chegar em alguém.
    // O aviso vai pelo canal de ops que já existe, e continua sem dado pessoal.
    await alertar({
      source: "funil-diagnostico",
      severity: "info",
      message: `Lead novo. faixa=${dados.faixa} score=${dados.score} porte=${dados.porte ?? "nao_informado"} origem=${dados.origem}. Abrir: ${envelope.data.painel}`,
    });
    return;
  }

  try {
    const resposta = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/cloudevents+json" },
      body: JSON.stringify(envelope),
    });
    if (!resposta.ok) {
      console.error(`[evento] canal respondeu ${resposta.status} para ${envelope.type}`);
    }
  } catch {
    console.error(`[evento] falha ao publicar ${envelope.type}`);
  }
}
