/**
 * As perguntas do formulário, declarativas.
 *
 * Contrato: specs/001-funil-diagnostico-captura/contracts/perguntas.md.
 * Mudar enunciado, opção ou ordem é mudança de spec, não de código.
 *
 * Regra que governa este arquivo (princípio II da constitution): pergunta-se
 * SITUAÇÃO. Dor subjetiva, urgência e orçamento ficam para a call, onde o
 * cliente articula em voz alta. Nenhuma pergunta daqui pode violar isso.
 *
 * 🔴 Exceção única, e ela é do Yan (30/08/2026, emenda 1.1.0 da constitution):
 * as duas ÚLTIMAS perguntas da trilha de empresa não qualificam, elas GATEIAM.
 * `tempo_call` e `investimento` não pontuam, não mapeiam para critério do ICP e
 * não perguntam faixa nenhuma: declaram o que a call custa em tempo e o PISO do
 * que a Infuser cobra por projeto, e registram se aquilo cabe. A diferença que
 * sustenta a exceção é que quem nomeia o número somos nós, e ele é LIMIAR, não
 * cotação: não diz quanto o projeto custa, diz abaixo de quanto não há projeto.
 * O risco que a decisão de 25/08 aponta (perguntar orçamento cedo ancora baixo)
 * vem de o CLIENTE jogar um número pequeno, e aqui ele não joga número.
 * Ver `_decisions/2026-08-30-gate-de-tempo-e-investimento-no-formulario.md`.
 */

import type { Pergunta, Trilha } from "./tipos";

/**
 * Versão do conjunto de perguntas, gravada em cada resposta.
 * Sem ela, resposta antiga fica órfã de significado quando a copy muda.
 * Subir sempre que uma pergunta for adicionada, removida ou tiver opção alterada.
 */
export const VERSAO_PERGUNTAS = "2026-08-30.2";

/** Identificadores estáveis. Reescrever a copy de uma pergunta não pode invalidar histórico. */
export const P = {
  NOME: "nome",
  TIPO_USO: "tipo_uso",
  EMPRESA: "empresa",
  PORTE: "porte",
  PROCESSO: "processo",
  COMO_FUNCIONA: "como_funciona",
  FREQUENCIA: "frequencia",
  CONSEQUENCIA: "consequencia",
  ONDE_INFORMACAO: "onde_informacao",
  RESPONSAVEL: "responsavel",
  DECISAO: "decisao",
  TENTATIVAS: "tentativas",
  ACESSO: "acesso",
  TEMPO_CALL: "tempo_call",
  INVESTIMENTO: "investimento",
  CONTATO: "contato",
  OBJETIVO_PESSOAL: "objetivo_pessoal",
  USO_IA: "uso_ia",
  EMAIL_PESSOAL: "email_pessoal",
} as const;

/** Resposta da pergunta 2 que desvia para a trilha curta. */
export const RESPOSTA_USO_PESSOAL = "pessoal";

export const PERGUNTAS: readonly Pergunta[] = [
  {
    id: P.NOME,
    ordem: 1,
    trilha: "ambos",
    tipo: "texto_curto",
    enunciado: "Como você se chama?",
    obrigatoria: true,
  },
  {
    id: P.TIPO_USO,
    ordem: 2,
    trilha: "ambos",
    tipo: "escolha_unica",
    enunciado: "Isso é para uma empresa ou uso pessoal?",
    obrigatoria: true,
    opcoes: [
      { id: "empresa", rotulo: "Para uma empresa" },
      { id: RESPOSTA_USO_PESSOAL, rotulo: "Uso pessoal" },
      { id: "nao_sei", rotulo: "Ainda não sei dizer" },
    ],
  },

  // ── trilha de empresa ──
  {
    id: P.EMPRESA,
    ordem: 3,
    trilha: "empresa",
    tipo: "contato",
    enunciado: "Qual empresa, e qual o seu papel nela?",
    obrigatoria: true,
    opcoes: [
      { id: "dono", rotulo: "Dono ou sócio" },
      { id: "diretoria", rotulo: "Diretoria" },
      { id: "gerencia", rotulo: "Gerência" },
      { id: "coordenacao", rotulo: "Coordenação" },
      { id: "time", rotulo: "Sou do time" },
    ],
  },
  {
    id: P.PORTE,
    ordem: 4,
    trilha: "empresa",
    tipo: "escolha_unica",
    enunciado: "Quantas pessoas trabalham aí?",
    obrigatoria: true,
    opcoes: [
      { id: "so_eu", rotulo: "Só eu" },
      { id: "2_5", rotulo: "2 a 5" },
      { id: "6_20", rotulo: "6 a 20" },
      { id: "21_50", rotulo: "21 a 50" },
      { id: "50_mais", rotulo: "Mais de 50" },
    ],
  },
  {
    id: P.PROCESSO,
    ordem: 5,
    trilha: "empresa",
    tipo: "texto_curto",
    enunciado: "Qual processo mais consome tempo do time hoje?",
    ajuda: "cobrança, orçamento, atendimento, relatório, cadastro...",
    obrigatoria: true,
    criterioIcp: "operacao_existente",
  },
  {
    id: P.COMO_FUNCIONA,
    ordem: 6,
    trilha: "empresa",
    tipo: "texto_longo",
    enunciado: "Como ele funciona hoje, do começo ao fim?",
    ajuda: "Quem faz, em qual ferramenta, e o que acontece em cada passo. Pode escrever do seu jeito.",
    obrigatoria: true,
    criterioIcp: "operacao_existente",
  },
  {
    id: P.FREQUENCIA,
    ordem: 7,
    trilha: "empresa",
    tipo: "escolha_unica",
    enunciado: "Com que frequência isso acontece?",
    obrigatoria: true,
    criterioIcp: "operacao_existente",
    opcoes: [
      { id: "varias_dia", rotulo: "Várias vezes ao dia" },
      { id: "todo_dia", rotulo: "Todo dia" },
      { id: "algumas_semana", rotulo: "Algumas vezes por semana" },
      { id: "semanal", rotulo: "Semanal" },
      { id: "mensal", rotulo: "Mensal" },
      { id: "esporadico", rotulo: "É esporádico, não tem ritmo" },
    ],
  },
  {
    id: P.CONSEQUENCIA,
    ordem: 8,
    trilha: "empresa",
    tipo: "multipla_escolha",
    enunciado: "O que costuma acontecer quando esse processo atrasa ou sai errado?",
    obrigatoria: true,
    criterioIcp: "dor_relevante",
    opcoes: [
      { id: "refazer", rotulo: "Alguém precisa refazer o trabalho" },
      { id: "cliente_reclama", rotulo: "O cliente percebe e reclama" },
      { id: "perde_prazo", rotulo: "A gente perde prazo" },
      { id: "dinheiro_errado", rotulo: "Entra dinheiro errado, ou deixa de entrar" },
      { id: "sobra_para_um", rotulo: "Sobra para uma pessoa só resolver" },
      { id: "nao_acontece", rotulo: "Não acontece muito" },
    ],
  },
  {
    id: P.ONDE_INFORMACAO,
    ordem: 9,
    trilha: "empresa",
    tipo: "multipla_escolha",
    enunciado: "Onde a informação desse processo fica hoje?",
    obrigatoria: true,
    criterioIcp: "informacao_disponivel",
    opcoes: [
      { id: "planilha", rotulo: "Planilha" },
      { id: "sistema_erp", rotulo: "Sistema ou ERP" },
      { id: "email", rotulo: "E-mail" },
      { id: "whatsapp", rotulo: "WhatsApp" },
      { id: "papel", rotulo: "Papel ou na cabeça de alguém" },
      { id: "sistema_proprio", rotulo: "Sistema próprio, feito para a gente" },
    ],
  },
  {
    id: P.RESPONSAVEL,
    ordem: 10,
    trilha: "empresa",
    tipo: "escolha_unica",
    enunciado: "Quem responde por esse processo no dia a dia?",
    obrigatoria: true,
    criterioIcp: "patrocinador",
    opcoes: [
      { id: "eu_mesmo", rotulo: "Eu mesmo" },
      { id: "alguem_do_time", rotulo: "Alguém do meu time, que eu sei quem é" },
      { id: "espalhado", rotulo: "Está espalhado, ninguém responde sozinho" },
      { id: "ninguem", rotulo: "Ninguém, na prática" },
    ],
  },
  {
    id: P.DECISAO,
    ordem: 11,
    trilha: "empresa",
    tipo: "escolha_unica",
    enunciado: "Além de você, quem mais participa de uma decisão dessas?",
    obrigatoria: true,
    criterioIcp: "caminho_decisao",
    opcoes: [
      { id: "so_eu", rotulo: "Só eu decido" },
      { id: "eu_e_socio", rotulo: "Eu e mais um sócio" },
      { id: "diretoria", rotulo: "Preciso levar para a diretoria" },
      { id: "outra_area", rotulo: "Preciso de aprovação de outra área, TI ou jurídico" },
      { id: "nao_sou_eu", rotulo: "Não sou eu quem decide" },
    ],
  },
  {
    // Não pontua de propósito. Muda a CONDUÇÃO da call, não a qualificação:
    // quem já contratou e se frustrou compra mais rápido de quem demonstra.
    id: P.TENTATIVAS,
    ordem: 12,
    trilha: "empresa",
    tipo: "multipla_escolha",
    enunciado: "Vocês já tentaram resolver isso de alguma forma?",
    obrigatoria: true,
    opcoes: [
      { id: "primeira_vez", rotulo: "Não, é a primeira vez que a gente olha para isso" },
      { id: "ferramenta", rotulo: "Tentamos com ferramenta, não vingou" },
      { id: "time_tentou", rotulo: "Alguém do time tentou montar" },
      { id: "contratamos", rotulo: "Contratamos alguém e não deu certo" },
      { id: "chatgpt", rotulo: "Usamos ChatGPT ou similar, sem método" },
    ],
  },
  {
    id: P.ACESSO,
    ordem: 13,
    trilha: "empresa",
    tipo: "escolha_unica",
    enunciado:
      "Para desenhar isso direito, a gente precisa de acesso de leitura às ferramentas que você citou e de algumas horas do time. Isso é possível aí?",
    obrigatoria: true,
    criterioIcp: "disposicao_colaborar",
    opcoes: [
      { id: "sim_sem_problema", rotulo: "Sim, sem problema" },
      { id: "sim_com_aprovacao", rotulo: "Sim, mas precisa passar por alguém" },
      { id: "dificil", rotulo: "Difícil, temos restrição de acesso" },
      { id: "nao_sei", rotulo: "Não sei dizer agora" },
    ],
  },
  // ── os dois gates de compromisso ──
  //
  // Vêm DEPOIS de tudo que qualifica e ANTES do contato, de propósito. Depois,
  // porque o lead precisa ter descrito o processo antes de ser perguntado o que
  // vai colocar nele: perguntado antes, é pedágio na porta. E antes do contato
  // porque o formulário fecha na pergunta mais fácil, com o consentimento
  // pousando ali e não em cima do preço.
  //
  // Nenhum dos dois tem `criterioIcp`: eles NÃO somam pontos. São corte duro em
  // `score.ts`, do mesmo tipo que "processo esporádico". Quem responde não sai
  // do funil, sai da agenda gratuita, e recebe a alternativa que corresponde ao
  // que ele acabou de dizer que não tem.
  {
    id: P.TEMPO_CALL,
    ordem: 14,
    trilha: "empresa",
    tipo: "escolha_unica",
    // Uma hora, e não "30 a 45 minutos": é o que a página promete no topo, o
    // que o desfecho repete e o que a Call 1 dura de verdade. Gate que pede
    // menos do que o compromisso real não filtra, só adianta o desencontro.
    enunciado:
      "A call é por vídeo e leva cerca de uma hora, com você e quem toca esse processo no dia a dia. Dá para reservar esse tempo?",
    obrigatoria: true,
    opcoes: [
      { id: "sim", rotulo: "Dá, sem problema" },
      // Passa no gate e vira informação para quem conduz: diagnóstico sem quem
      // executa o processo rende menos, mas ainda rende.
      { id: "so_eu", rotulo: "Dá, mas só eu, sem outras pessoas" },
      { id: "nao", rotulo: "Hoje não consigo reservar esse tempo" },
    ],
  },
  {
    id: P.INVESTIMENTO,
    ordem: 15,
    trilha: "empresa",
    tipo: "escolha_unica",
    // 🔴 UM número, e ele é LIMIAR, não cotação (regra do Yan, 30/08).
    //
    // R$ 3 mil é o piso do que a Infuser cobra por projeto. O que a pergunta
    // faz é medir disposição contra esse piso, e é só isso que ela pode fazer:
    //
    //   - NÃO diz quanto o projeto custa, então não é preço antes do
    //     diagnóstico e não vira âncora que a proposta herda;
    //   - NÃO cita mensalidade, setup, nome de plano nem degrau da tabela.
    //     A versão anterior dizia "começa em R$ 3 mil de implantação e R$ 500
    //     por mês depois", e isso é a ESTRUTURA do SKU (Fundação Essencial)
    //     exposta na primeira superfície que o lead toca. Limiar é uma linha no
    //     chão; cotação é a tabela. Só a linha no chão pode aparecer aqui.
    //
    // Nunca escrever aqui número que não seja o piso do `pricing.md` vivo, e
    // nunca acrescentar um segundo número: `copy.test.ts` prende os dois lados.
    enunciado:
      "A sua empresa está disposta a investir pelo menos R$ 3 mil para resolver isso?",
    obrigatoria: true,
    opcoes: [
      { id: "cabe", rotulo: "Sim, se o resultado justificar" },
      { id: "cabe_com_aprovacao", rotulo: "Sim, mas preciso aprovar internamente" },
      // "Hoje não" e não "Não": o lead volta a ser abordável mais para frente,
      // e o princípio IV diz que ele é dado, não lixo.
      //
      // Sem opção de "não sei": num gate de dinheiro ela é a saída que todo
      // mundo clica para não responder, e o gate deixa de gatear.
      { id: "nao_cabe", rotulo: "Hoje não" },
    ],
  },
  {
    id: P.CONTATO,
    ordem: 16,
    trilha: "empresa",
    tipo: "contato",
    enunciado: "Onde eu te chamo?",
    obrigatoria: true,
    opcoes: [
      { id: "instagram", rotulo: "Instagram" },
      { id: "indicacao", rotulo: "Indicação" },
      { id: "youtube", rotulo: "YouTube" },
      { id: "linkedin", rotulo: "LinkedIn" },
      { id: "google", rotulo: "Google" },
      { id: "outro", rotulo: "Outro" },
    ],
  },

  // ── trilha de uso pessoal: no máximo 6, nunca chega ao agendamento ──
  {
    id: P.OBJETIVO_PESSOAL,
    ordem: 3,
    trilha: "pessoal",
    tipo: "texto_curto",
    enunciado: "O que você quer organizar ou automatizar?",
    obrigatoria: true,
  },
  {
    id: P.USO_IA,
    ordem: 4,
    trilha: "pessoal",
    tipo: "escolha_unica",
    enunciado: "Você já usa alguma IA no seu dia a dia?",
    obrigatoria: true,
    opcoes: [
      { id: "todo_dia", rotulo: "Uso todo dia" },
      { id: "as_vezes", rotulo: "Uso às vezes" },
      { id: "testei_parei", rotulo: "Já testei e parei" },
      { id: "nunca", rotulo: "Nunca usei" },
    ],
  },
  {
    id: P.EMAIL_PESSOAL,
    ordem: 5,
    trilha: "pessoal",
    tipo: "texto_curto",
    enunciado: "Qual o seu e-mail?",
    obrigatoria: true,
  },
];

/** As perguntas de uma trilha, em ordem. `ambos` sempre entra. */
export function perguntasDaTrilha(trilha: Exclude<Trilha, "ambos">): readonly Pergunta[] {
  return PERGUNTAS.filter((p) => p.trilha === trilha || p.trilha === "ambos").sort(
    (a, b) => a.ordem - b.ordem,
  );
}

export function perguntaPorId(id: string): Pergunta | undefined {
  return PERGUNTAS.find((p) => p.id === id);
}
