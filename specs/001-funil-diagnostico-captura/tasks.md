# Tasks: Funil de diagnóstico - captura, qualificação e agendamento

**Input**: Design documents from `/specs/001-funil-diagnostico-captura/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: incluídos. O princípio VIII da constitution exige um check executável, e o score é lógica de decisão comercial com fronteiras.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência)
- **[Story]**: a qual user story a tarefa pertence

---

## Phase 1: Setup

**Objetivo**: preparar o terreno num repositório que hoje não tem test runner nem banco.

- [x] T001 Rodar `npm install` no worktree, porque `node_modules` não é versionado
- [x] T002 Adicionar `vitest` como devDependency e o script `test` em `package.json`
- [x] T003 [P] Criar `vitest.config.ts` na raiz, com o alias `@` apontando para `src`
- [x] T004 [P] Criar a estrutura de pastas: `src/lib/diagnostico/`, `src/components/diagnostico/`, `src/app/diagnostico/`, `src/app/api/diagnostico/`, `tests/diagnostico/`

**Checkpoint**: `npx vitest run` roda e reporta zero testes sem erro de configuração.

---

## Phase 2: Foundational (BLOQUEIA todas as stories)

**Objetivo**: o núcleo que todas as histórias consomem. Nada de UI aqui.

- [x] T005 [P] Criar `src/lib/diagnostico/tipos.ts` com as interfaces do domínio: `Pergunta`, `Resposta`, `Faixa`, `Avaliacao`, `LeadSubmissao`. Usar `interface` para formato de objeto e objeto `as const` em vez de `enum`, conforme o padrão da casa
- [x] T006 [P] Criar `src/lib/diagnostico/score-config.json` com os pesos, os cortes duros e os limiares exatos de `contracts/score.md`, mais o campo `versao`
- [x] T007 Criar `src/lib/diagnostico/perguntas.ts` com as 14 perguntas de empresa e as 5 do caminho pessoal, declarativas, cada uma com `id` estável, tipo, opções e o `criterioIcp` quando pontua. Texto literal de `contracts/perguntas.md`
- [x] T008 Criar `src/lib/diagnostico/score.ts` com a função pura `avaliar(respostas, config)`. Sem I/O, sem import de banco. Cortes duros avaliados antes da soma
- [x] T009 [P] Criar `tests/diagnostico/score.test.ts` com os 9 casos obrigatórios de `contracts/score.md`, incluindo as quatro fronteiras e a precedência dos cortes duros
- [x] T010 [P] Criar `tests/diagnostico/perguntas.test.ts` provando que os 6 critérios do ICP têm ao menos uma pergunta e que nenhuma pergunta pontuável ficou sem critério
- [x] T011 Criar `src/lib/diagnostico/schema.sql` com as cinco tabelas de `data-model.md`, índices e a chave única de deduplicação
- [x] T012 Criar `src/lib/diagnostico/db.ts` com o acesso ao Postgres. Query parametrizada sempre, nunca concatenação. Erros com classe própria, nunca catch genérico
- [x] T013 [P] Extrair `normalizarTelefone` e `normalizarEmail` para `src/lib/diagnostico/normalizar.ts`, reaproveitando a lógica que já existe em `src/app/api/kiwify-webhook/route.ts` em vez de reescrever

**Checkpoint**: `npx vitest run` passa. O score classifica certo sem nenhuma UI existir.

---

## Phase 3: User Story 1 - Lead com encaixe sai com a call marcada (P1) 🎯 MVP

**Goal**: o lead qualificado conclui e agenda na mesma sessão, sem espera humana.

**Independent Test**: preencher com respostas de lead qualificado e ver o seletor de horários aparecer, com o registro gravado.

- [ ] T014 [US1] Criar `src/app/api/diagnostico/submit/route.ts`: valida consentimento no servidor, pontua, deduplica, persiste e devolve a faixa. Nunca devolve o score numérico. Segue o padrão de `kiwify-webhook/route.ts`
- [ ] T015 [P] [US1] Criar `src/components/diagnostico/Conversa.tsx`, o componente de pergunta única por vez com a resposta anterior visível
- [ ] T016 [P] [US1] Criar `src/components/diagnostico/Abertura.tsx` com o texto da tela inicial de `contracts/perguntas.md`, declarando quantas perguntas, quanto tempo e o que o lead ganha
- [ ] T017 [P] [US1] Criar `src/components/diagnostico/Consentimento.tsx`: caixa não pré-marcada, link para a política, botão inativo sem a marca
- [ ] T018 [US1] Criar `src/app/diagnostico/page.tsx` montando o fluxo, com a primeira pergunta renderizada no servidor para funcionar no webview do Instagram
- [ ] T019 [US1] Criar `src/components/diagnostico/Agendamento.tsx` com o embed do Cal.com pré-preenchido, mais o caminho alternativo quando o provedor falhar
- [ ] T020 [US1] Criar `src/app/api/diagnostico/cal-webhook/route.ts` com verificação HMAC-SHA256 em tempo constante contra `x-cal-signature-256`
- [ ] T021 [P] [US1] Criar `tests/diagnostico/webhook.test.ts` provando que assinatura inválida devolve 401 e não persiste nada
- [ ] T022 [US1] Criar `src/app/diagnostico/obrigado/page.tsx` com a confirmação que explica que a call é diagnóstico, sem proposta nem preço

**Checkpoint**: US1 funciona ponta a ponta. É o MVP.

---

## Phase 4: User Story 2 - Lead sem encaixe é registrado, não descartado (P2)

**Goal**: quem não passa recebe destino honesto e fica gravado com o motivo.

- [ ] T023 [US2] Implementar a ramificação de uso pessoal em `perguntas.ts`, encurtando o fluxo para 5 perguntas
- [ ] T024 [US2] Criar `src/components/diagnostico/Desfecho.tsx` com os quatro textos finais de `contracts/score.md`, um por faixa
- [ ] T025 [US2] Rotear o não-ICP de empresa para o Mapa de IA e o de uso pessoal para o Kit Segundo Cérebro. O sistema não pode oferecer o Kit a quem declarou empresa
- [ ] T026 [P] [US2] Criar `tests/diagnostico/desfecho.test.ts` provando que nenhum texto de nenhuma faixa contém as palavras de recusa proibidas por FR-017

**Checkpoint**: as quatro faixas têm destino e nenhuma comunica desqualificação.

---

## Phase 5: User Story 3 - O time enxerga de onde vem lead bom (P3)

- [ ] T027 [US3] Criar as consultas por origem, faixa e intervalo de data em `src/lib/diagnostico/consultas.ts`
- [ ] T028 [US3] Criar a notificação ao time quando a faixa for revisão humana, usando o canal `OPS - alert` que já existe no n8n
- [ ] T029 [US3] Implementar a exclusão de lead a pedido do titular, em cascata, com registro do pedido sem dado pessoal

---

## Phase 6: User Story 4 - Quem abandona no meio não vira zero (P3)

- [ ] T030 [US4] Persistir o estado da conversa em `localStorage` com identificador de sessão, retomando no ponto certo
- [ ] T031 [US4] Criar `src/app/api/diagnostico/parcial/route.ts`, gravando ao término de cada seção
- [ ] T032 [US4] Garantir que o parcial é apagado quando a submissão completa acontece, e que nunca aparece como lead

---

## Phase 7: Polish

- [ ] T033 Rodar o quickstart inteiro, os quatro caminhos
- [ ] T034 Testar no webview do Instagram, em celular real
- [ ] T035 Conferir que nenhum dado pessoal aparece em query string ou log
- [ ] T036 Revisar toda a copy contra as regras da casa: zero em-dash, zero palavra banida, acentuação correta

---

## Dependências

- Phase 1 e 2 bloqueiam tudo.
- US1 depende só da Foundational.
- US2 depende de US1 para o componente de desfecho existir.
- US3 e US4 são independentes entre si, ambas dependem da Foundational.
- 🔴 **Produção depende da feature `002`**, por FR-032. Nada sobe antes do mapa existir.

## Estratégia

MVP primeiro: Phase 1, 2 e 3. Parar, validar US1 de ponta a ponta, e só então seguir. Commit por grupo lógico de tarefas.
