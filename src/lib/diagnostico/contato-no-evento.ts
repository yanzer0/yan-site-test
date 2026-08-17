/**
 * O contato do lead na descrição do evento da call.
 *
 * Para que existe: quem entra na call precisa saber para onde chamar a pessoa
 * se o vídeo cair, e conferir com quem está falando. Sem isso, o operador abre
 * o CRM em outra aba no meio da conversa.
 *
 * 🔴 O QUE NUNCA PODE ENTRAR AQUI, e por quê: enquanto o Cal.com adicionar o
 * lead como convidado do evento, ele LÊ esta descrição. Não existe campo de
 * evento que o Google esconda de convidado: `visibility: "private"` significa
 * "only event attendees may view event details", ou seja, esconde de quem NÃO
 * é convidado. Já custou um vazamento nesta base: o roteiro da call foi escrito
 * na descrição e ficou legível para o próprio lead.
 *
 * Então vale a regra simples: só entra aqui o que É DO LEAD e ele já sabe.
 * Nome, e-mail, WhatsApp e empresa são dele. Score, faixa, motivo de corte,
 * leitura interna e qualquer trecho do roteiro NÃO são, e ler que foi
 * classificado como "nao_icp_empresa" é pior do que não receber nada.
 *
 * O roteiro continua indo como ANEXO protegido por cookie, nunca como texto.
 */

/** O que se pode dizer na descrição. Nada aqui é novidade para o lead. */
export interface ContatoDoLead {
  readonly nome: string;
  readonly email: string;
  readonly whatsapp: string | null;
  readonly empresa: string | null;
  readonly papel: string | null;
}

/**
 * Delimitadores do nosso bloco.
 *
 * Existem para o texto ser substituível: o worker pode reprocessar o mesmo
 * booking (retry, reagendamento), e sem marcador cada passada empilharia outra
 * cópia do contato na descrição. Com eles, a segunda passada troca a primeira.
 */
const ABRE = "<!-- infuser:contato -->";
const FECHA = "<!-- /infuser:contato -->";

/** `11987654321` → `(11) 98765-4321`. Deixa em paz o que não reconhece. */
export function formatarWhatsapp(bruto: string): string {
  const digitos = bruto.replace(/\D/g, "");
  const nacional = digitos.startsWith("55") && digitos.length > 11 ? digitos.slice(2) : digitos;

  if (nacional.length === 11) {
    return `(${nacional.slice(0, 2)}) ${nacional.slice(2, 7)}-${nacional.slice(7)}`;
  }
  if (nacional.length === 10) {
    return `(${nacional.slice(0, 2)}) ${nacional.slice(2, 6)}-${nacional.slice(6)}`;
  }
  return bruto.trim();
}

/** Link que abre a conversa no WhatsApp. Só com número que dá para discar. */
function linkDoWhatsapp(bruto: string): string | null {
  const digitos = bruto.replace(/\D/g, "");
  if (digitos.length < 10 || digitos.length > 13) return null;
  const comPais = digitos.startsWith("55") ? digitos : `55${digitos}`;
  return `https://wa.me/${comPais}`;
}

/**
 * Monta o bloco de contato.
 *
 * A descrição do Google Calendar aceita HTML simples, e é assim que o link do
 * WhatsApp vira clicável em vez de texto que alguém copia à mão.
 */
export function blocoDeContato(contato: ContatoDoLead): string {
  const linhas: string[] = [`<b>Contato do lead</b>`, contato.nome.trim()];

  const empresa = contato.empresa?.trim();
  const papel = contato.papel?.trim();
  if (empresa) linhas.push(papel ? `${empresa} · ${papel}` : empresa);

  linhas.push(`E-mail: ${contato.email.trim()}`);

  const whatsapp = contato.whatsapp?.trim();
  if (whatsapp) {
    const link = linkDoWhatsapp(whatsapp);
    const legivel = formatarWhatsapp(whatsapp);
    linhas.push(link ? `WhatsApp: <a href="${link}">${legivel}</a>` : `WhatsApp: ${legivel}`);
  }

  return [ABRE, linhas.join("<br>"), FECHA].join("\n");
}

/**
 * Coloca o bloco na descrição, preservando o que já estava lá.
 *
 * O Cal.com escreve a própria descrição ao criar o evento, e ela tem coisa útil.
 * Por isso o contato vai por CIMA e o resto fica: substituir tudo seria trocar
 * um problema de informação faltando por outro.
 */
export function descricaoComContato(atual: string | null, contato: ContatoDoLead): string {
  const bloco = blocoDeContato(contato);
  const anterior = (atual ?? "").trim();

  if (!anterior) return bloco;

  const inicio = anterior.indexOf(ABRE);
  const fim = anterior.indexOf(FECHA);
  if (inicio !== -1 && fim > inicio) {
    // Já tem um bloco nosso: troca no lugar, sem empilhar.
    return (anterior.slice(0, inicio) + bloco + anterior.slice(fim + FECHA.length)).trim();
  }

  return `${bloco}\n<br>\n${anterior}`;
}

export const MARCADORES_DO_BLOCO = { ABRE, FECHA } as const;
