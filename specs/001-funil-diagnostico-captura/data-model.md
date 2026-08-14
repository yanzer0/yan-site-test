# Phase 1 - Modelo de dados

**Feature**: `001-funil-diagnostico-captura` | **Data**: 2026-08-14

Postgres. Quatro tabelas. O desenho serve três perguntas que o negócio precisa responder: de onde vem lead bom, onde as pessoas desistem, e o que exatamente o lead disse.

---

## `leads`

O lead que concluiu o formulário.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid, PK | |
| `nome` | text | |
| `empresa` | text, nulo | Nulo no caminho de uso pessoal |
| `papel` | text, nulo | |
| `porte` | text, nulo | Faixa de número de pessoas |
| `email` | text | |
| `email_norm` | text | Minúsculo e sem espaços, usado na deduplicação |
| `whatsapp` | text, nulo | Nulo no caminho pessoal |
| `whatsapp_norm` | text, nulo | Só dígitos, com 55 quando vier sem país |
| `origem` | text | Como chegou, declarado pelo lead |
| `tipo` | text | `empresa` ou `pessoal` |
| `consentimento_em` | timestamptz | Quando marcou a caixa. Nulo é impossível: sem consentimento não persiste |
| `criado_em` | timestamptz | |
| `atualizado_em` | timestamptz | |

Índice único em `(email_norm, whatsapp_norm)`. Reenvio atualiza a linha e preserva as respostas antigas em `respostas`, conforme FR-033.

Índices de consulta em `origem` e `criado_em`, que é o que FR-027 pede.

---

## `respostas`

Cada resposta, preservando o texto literal. Append-only.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid, PK | |
| `lead_id` | uuid, FK para `leads` | |
| `pergunta_id` | text | Identificador estável da pergunta, não o texto dela |
| `valor` | jsonb | Texto, opção única ou lista, conforme o tipo |
| `versao_perguntas` | text | Qual versão do contrato de perguntas estava no ar |
| `criado_em` | timestamptz | |

**Por que append-only e por que `versao_perguntas`**: as perguntas vão mudar. Sem a versão, uma resposta antiga fica órfã de significado e a análise histórica mente. Sem o append-only, o reenvio de FR-033 apagaria o que o lead disse da primeira vez, que costuma ser o mais honesto.

**Por que `pergunta_id` e não o texto**: reescrever a copy de uma pergunta não pode invalidar o histórico.

---

## `avaliacoes`

O resultado da pontuação. Uma por submissão, não uma por lead.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid, PK | |
| `lead_id` | uuid, FK | |
| `score` | integer | 0 a 16 |
| `faixa` | text | `qualificado`, `revisao`, `nao_icp_empresa`, `nao_icp_pessoal` |
| `motivo_corte` | text, nulo | Preenchido quando um corte duro decidiu a faixa |
| `pontos_por_criterio` | jsonb | Detalhe por critério do ICP, para calibrar depois |
| `versao_score` | text | Qual `score-config.json` produziu este resultado |
| `criado_em` | timestamptz | |

**Por que `versao_score` é obrigatório**: os pesos vão ser recalibrados. Sem a versão, não dá para comparar a faixa que o sistema deu com o que a call revelou, e a calibração de SC-006 vira achismo.

**Por que `pontos_por_criterio`**: quando um lead qualificado se revelar ruim na call, a pergunta é qual critério inflou o score. Sem o detalhe, só dá para ver o total.

---

## `parciais`

Quem começou e não terminou. Separado de `leads` por exigência de FR-025.

| Campo | Tipo | Notas |
|---|---|---|
| `sessao_id` | uuid, PK | Gerado no cliente ao abrir o formulário |
| `respostas` | jsonb | O que foi respondido até agora |
| `ultima_pergunta` | text | Onde parou |
| `origem` | text, nulo | |
| `criado_em` | timestamptz | |
| `atualizado_em` | timestamptz | |

Não tem FK para `leads` e não vira lead. Quando a submissão completa acontece, o parcial daquela sessão é apagado.

Retenção: 30 dias. Parcial de mais de um mês não ensina nada e é dado pessoal parado sem consentimento.

---

## `agendamentos`

Vinculado pelo webhook do Cal.com.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid, PK | |
| `lead_id` | uuid, FK | |
| `cal_booking_id` | text, único | Identificador do Cal.com, base da idempotência |
| `inicio_em` | timestamptz | |
| `estado` | text | `agendado`, `cancelado`, `remarcado`, `realizado`, `nao_compareceu` |
| `criado_em` | timestamptz | |
| `atualizado_em` | timestamptz | |

Não há campo de host. A agenda é única e compartilhada, e quem conduz é combinado fora do sistema, conforme FR-030.

---

## Exclusão a pedido do titular

FR-028. Apagar o lead remove em cascata `respostas`, `avaliacoes` e `agendamentos`. O registro do pedido de exclusão fica fora dessas tabelas, com data e sem dado pessoal, para prova de atendimento.

---

## O que este modelo deliberadamente não tem

- **Nenhuma tabela de usuário ou autenticação.** O formulário é público e não tem login. Adicionar conta seria escopo novo e superfície de ataque nova.
- **Nenhum campo de score no `leads`.** Score é da avaliação, e uma avaliação envelhece quando os pesos mudam. Guardar no lead congelaria um número sem contexto.
- **Nenhuma coluna por pergunta.** As perguntas mudam; colunas não devem mudar junto. É o que `respostas` em `jsonb` com `pergunta_id` resolve.
