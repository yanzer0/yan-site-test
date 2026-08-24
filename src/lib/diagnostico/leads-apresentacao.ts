/**
 * Como o painel mostra o que o banco guarda, e como exporta.
 *
 * Lógica pura de propósito: formatar data, montar link de WhatsApp e gerar CSV
 * não precisam de banco nem de requisição, e assim são testáveis sem subir nada.
 */

import { PERGUNTAS } from "./perguntas";
import type { Faixa } from "./tipos";
import type { LeadNaLista, RespostaDoLead } from "./leads-db";

/**
 * O que cada faixa quer dizer para quem vai ligar.
 *
 * O nome técnico (`nao_icp_empresa`) diz o que o score decidiu; o rótulo diz o
 * que fazer com a pessoa. O painel existe para a segunda leitura.
 */
export const ROTULO_FAIXA: Record<Faixa, string> = {
  qualificado: "Qualificado",
  revisao: "Revisar à mão",
  nao_icp_empresa: "Empresa fora do critério",
  nao_icp_pessoal: "Uso pessoal",
};

/**
 * Horário de Brasília, sempre.
 *
 * O banco guarda em UTC e a sessão do Neon roda em GMT. Mostrar o horário cru
 * faz o time ler "23:58" para um lead que preencheu às 20:58, e errar a leitura
 * de quando a pessoa estava com o assunto na cabeça.
 */
export function dataBR(quando: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(quando);
}

/**
 * Link que abre a conversa no WhatsApp, no celular e no desktop.
 *
 * `null` quando não há número: um link quebrado no painel faz o time achar que
 * o contato existe e descobrir o contrário na hora de chamar.
 */
export function linkWhatsapp(whatsapp: string | null): string | null {
  if (!whatsapp) return null;
  const digitos = whatsapp.replace(/\D+/g, "");
  if (digitos.length < 10) return null;
  return `https://wa.me/${digitos.length <= 11 ? `55${digitos}` : digitos}`;
}

/** O rótulo humano de uma opção, do contrato de perguntas. Cai no id se sumir. */
export function rotuloDaResposta(perguntaId: string, valor: unknown): string {
  const pergunta = PERGUNTAS.find((p) => p.id === perguntaId);
  const bruto = Array.isArray(valor) ? valor : [valor];

  return bruto
    .map((v) => {
      const opcao = pergunta?.opcoes?.find((o) => o.id === v);
      return opcao?.rotulo ?? String(v ?? "");
    })
    .filter((t) => t.length > 0)
    .join(" · ");
}

/** O enunciado da pergunta. Cai no id quando a versão do contrato mudou. */
export function tituloDaPergunta(perguntaId: string): string {
  return PERGUNTAS.find((p) => p.id === perguntaId)?.enunciado ?? perguntaId;
}

const COLUNAS_FIXAS = [
  "nome",
  "empresa",
  "papel",
  "porte",
  "email",
  "whatsapp",
  "origem",
  "tipo",
  "faixa",
  "score",
  "motivo_corte",
  "agendou",
  "agenda_estado",
  "agenda_inicio",
  "preenchido_em",
] as const;

function celula(valor: string): string {
  // Aspas duplas dobradas e o campo inteiro entre aspas: cobre separador,
  // quebra de linha e aspas dentro do texto livre que o lead escreveu.
  return `"${valor.replace(/"/g, '""')}"`;
}

/**
 * A lista inteira em CSV, com as respostas literais uma por coluna.
 *
 * Separador `;` e BOM porque o destino mais provável é o Excel em português,
 * que com vírgula joga a linha toda numa célula só. Modelo de linguagem lê os
 * dois igual, então otimizar para a planilha não custa nada do outro lado.
 */
export function paraCsv(
  leads: readonly LeadNaLista[],
  respostas: readonly RespostaDoLead[],
): string {
  const porLead = new Map<string, Map<string, unknown>>();
  for (const r of respostas) {
    const doLead = porLead.get(r.leadId) ?? new Map<string, unknown>();
    doLead.set(r.perguntaId, r.valor);
    porLead.set(r.leadId, doLead);
  }

  // As colunas de resposta seguem a ordem do contrato de perguntas, não a ordem
  // em que o banco devolveu: assim o CSV de hoje tem a mesma cara do de ontem.
  const perguntasPresentes = PERGUNTAS.map((p) => p.id).filter((id) =>
    respostas.some((r) => r.perguntaId === id),
  );

  // Prefixo nas colunas de resposta porque o id da pergunta colide com coluna
  // fixa: `porte` existe nos dois lados, e cabeçalho repetido faz a planilha (e
  // quem lê depois) casar o valor com a coluna errada.
  const cabecalho = [
    ...COLUNAS_FIXAS,
    ...perguntasPresentes.map((id) => `resp_${id}`),
  ]
    .map(celula)
    .join(";");

  const linhas = leads.map((l) => {
    const respostasDoLead = porLead.get(l.id) ?? new Map<string, unknown>();
    const agendou = l.agendaEstado !== null && l.agendaEstado !== "cancelado";

    const fixas = [
      l.nome,
      l.empresa ?? "",
      l.papel ?? "",
      l.porte ?? "",
      l.email,
      l.whatsapp ?? "",
      l.origem,
      l.tipo,
      l.faixa ? ROTULO_FAIXA[l.faixa] : "",
      l.score === null ? "" : String(l.score),
      l.motivoCorte ?? "",
      agendou ? "sim" : "nao",
      l.agendaEstado ?? "",
      l.agendaInicio ? dataBR(l.agendaInicio) : "",
      dataBR(l.criadoEm),
    ];

    const abertas = perguntasPresentes.map((id) =>
      respostasDoLead.has(id) ? rotuloDaResposta(id, respostasDoLead.get(id)) : "",
    );

    return [...fixas, ...abertas].map(celula).join(";");
  });

  return `﻿${[cabecalho, ...linhas].join("\r\n")}\r\n`;
}

/**
 * O dossiê de um lead em texto corrido, pronto para colar num chat de modelo.
 *
 * Existe porque o pedido real não é "ver o lead", é "chamar com contexto": o
 * time copia este bloco, cola no Claude e pede a mensagem de follow-up. Sem
 * ele, a pessoa recorta campo por campo da tela e perde as respostas abertas,
 * que são justamente o que dá contexto.
 */
export function paraContexto(
  lead: LeadNaLista,
  respostas: readonly RespostaDoLead[],
): string {
  const agendou = lead.agendaEstado !== null && lead.agendaEstado !== "cancelado";

  const linhas = [
    `Lead do formulário de diagnóstico da Infuser (useinfuser.com/diagnostico).`,
    ``,
    `Nome: ${lead.nome}`,
    `Empresa: ${lead.empresa ?? "não informou"}`,
    `Papel: ${lead.papel ?? "não informou"}`,
    `Tamanho do time: ${lead.porte ?? "não informou"}`,
    `E-mail: ${lead.email}`,
    `WhatsApp: ${lead.whatsapp ?? "não informou"}`,
    `Onde nos conheceu: ${lead.origem}`,
    `Preenchido em: ${dataBR(lead.criadoEm)}`,
    `Classificação interna: ${lead.faixa ? ROTULO_FAIXA[lead.faixa] : "sem avaliação"}`,
    `Agendou a call: ${agendou ? `sim, ${lead.agendaInicio ? dataBR(lead.agendaInicio) : "data não registrada"}` : "não"}`,
    ``,
    `O que ele respondeu:`,
  ];

  for (const r of respostas) {
    linhas.push(`- ${tituloDaPergunta(r.perguntaId)} ${rotuloDaResposta(r.perguntaId, r.valor)}`);
  }

  return linhas.join("\n");
}
