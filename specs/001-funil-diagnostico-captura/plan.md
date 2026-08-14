# Implementation Plan: Funil de diagnóstico - captura, qualificação e agendamento

**Branch**: `feat/funil-diagnostico` | **Date**: 2026-08-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-funil-diagnostico-captura/spec.md`

## Summary

Substituir o Google Forms de 11 perguntas por um formulário conversacional servido em rota do `useinfuser.com`, que instrumenta os 6 critérios do ICP, calcula um score configurável, roteia o lead em três faixas e agenda a Call 1 no Cal.com dentro da mesma sessão quando há encaixe.

A abordagem técnica é deliberadamente pequena: rota nova no Next que já existe, estado do formulário no cliente com retomada por `localStorage`, cálculo de score no servidor a partir de um arquivo de configuração versionado, persistência em Postgres gerenciado pela própria Vercel, e o Cal.com embarcado para o agendamento. Nada de serviço novo, nada de fila, nada de infra adicional.

O maior risco desta feature não é técnico, é de conteúdo: as perguntas e os pesos do score decidem a qualidade de tudo que vem depois. Por isso o score é dado versionado, não código.

## Technical Context

**Language/Version**: TypeScript 5, Node.js (runtime `nodejs` nas rotas de API)

**Primary Dependencies**: Next.js 15.5.14 (App Router), React 19.2.4, Tailwind CSS 4, shadcn/ui, `@base-ui/react` 1.3.0, framer-motion 12.38.0. Todas já presentes no repositório.

**Storage**: Vercel Postgres (Neon). Decisão e alternativas em [research.md](./research.md).

**Testing**: Vitest, a ser adicionado. O repositório hoje não tem nenhum test runner, e o princípio VIII da constitution exige um check executável. Ver Complexity Tracking.

**Target Platform**: Vercel, deploy automático no push para `main`. O consumo principal é navegador móvel, com peso relevante no navegador embutido do Instagram.

**Project Type**: Aplicação web, rota dentro do site institucional existente. Não é projeto separado.

**Performance Goals**: Primeira pergunta interativa em menos de 2,5 s em 4G. Transição entre perguntas sem espera perceptível, abaixo de 100 ms, porque a conversa é local até o envio.

**Constraints**: Precisa funcionar no webview do Instagram, sem rolagem horizontal, e degradar sem quebrar quando o Cal.com estiver indisponível. Nenhum dado pessoal em query string ou log.

**Scale/Scope**: Dezenas de leads por mês no horizonte visível, não milhares. Isso é decisão de projeto, não desculpa: dimensionar para escala inexistente aqui seria complexidade sem retorno.

## Constitution Check

*GATE: avaliado antes da Phase 0 e reavaliado após a Phase 1.*

| Princípio | Como esta feature satisfaz | Veredito |
|---|---|---|
| I. Diagnóstico antes de venda | Nenhuma superfície do fluxo exibe preço, faixa, plano ou tabela. A única menção a valor é a oferta do Mapa de IA no caminho de não-ICP, que não é a call e não é a implementação. | PASS |
| II. GPCT, nunca BANT | O conjunto de perguntas coleta situação. Nenhuma pergunta de orçamento, urgência ou dor subjetiva. Ver `contracts/perguntas.md`. | PASS |
| III. Score derivado do ICP | Cada pergunta pontuável mapeia para um dos 6 critérios, e cada critério tem ao menos uma pergunta. A tabela de rastreabilidade está em `contracts/score.md`. | PASS |
| IV. Lead desqualificado é dado | Toda submissão persiste, com faixa e motivo. Nenhum caminho descarta. | PASS |
| V. Só se afirma o que foi verificado | A feature não afirma capacidade. A promessa do mapa depende da `002`, e FR-032 amarra o lançamento a ela. | PASS |
| VI. Identidade e copy da casa | A rota usa o design system do site, que já é v2. Copy sem em-dash, sem palavra banida, revisada contra o tone-of-voice. | PASS |
| VII. Dado mínimo, consentimento explícito | Consentimento é caixa não pré-marcada, bloqueia o envio, e a política de privacidade já existe publicada no site. Nenhum dado pessoal em URL ou log. | PASS |
| VIII. Check que o agente roda sozinho | ⚠️ O repositório não tem test runner. Resolvido adicionando Vitest com testes de score e de contrato do webhook. Ver Complexity Tracking. | PASS com mitigação |

Nenhuma violação sem justificativa. Reavaliação pós-Phase 1: sem mudança nos vereditos.

## Project Structure

### Documentation (this feature)

```text
specs/001-funil-diagnostico-captura/
├── plan.md              # Este arquivo
├── research.md          # Phase 0: decisões técnicas e alternativas
├── data-model.md        # Phase 1: entidades e schema
├── quickstart.md        # Phase 1: como validar de ponta a ponta
├── contracts/
│   ├── perguntas.md     # O conjunto de perguntas e a ramificação
│   ├── score.md         # Pesos, faixas e rastreabilidade ao ICP
│   └── api.md           # Contratos das rotas
└── tasks.md             # Phase 2, gerado pelo /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── diagnostico/
│   │   ├── page.tsx                  # Rota pública do formulário
│   │   └── obrigado/page.tsx         # Confirmação pós-agendamento
│   └── api/
│       ├── kiwify-webhook/route.ts   # EXISTE, referência de padrão de webhook
│       ├── meta-capi/route.ts        # EXISTE
│       └── diagnostico/
│           ├── submit/route.ts       # Recebe a submissão, pontua, persiste
│           └── parcial/route.ts      # Grava preenchimento parcial
├── components/
│   └── diagnostico/                  # Componentes da conversa
├── lib/
│   ├── meta-capi.ts                  # EXISTE
│   └── diagnostico/
│       ├── perguntas.ts              # Definição declarativa das perguntas
│       ├── score.ts                  # Cálculo puro, sem I/O
│       ├── score-config.json         # Pesos e limiares, versionados
│       └── db.ts                     # Acesso ao Postgres
└── tests/
    └── diagnostico/
        ├── score.test.ts             # Casos de fronteira das três faixas
        └── perguntas.test.ts         # Cobertura dos 6 critérios do ICP
```

**Structure Decision**: rota dentro do app existente, sem projeto separado. O formulário precisa morar em `useinfuser.com`, o repositório já é Next na Vercel, e criar um segundo projeto adicionaria domínio, deploy e manutenção sem entregar nada. As rotas de API seguem exatamente o padrão de `src/app/api/kiwify-webhook/route.ts`, que já resolve validação de assinatura, tipagem de payload e política de resposta a falha upstream.

## Complexity Tracking

| Violação | Por que é necessária | Alternativa mais simples rejeitada porque |
|---|---|---|
| Adicionar Vitest e um diretório de testes a um repositório que hoje não tem nenhum | O princípio VIII exige um check que o agente rode sozinho. O score é lógica de decisão comercial com três faixas e casos de fronteira; sem teste, um erro de peso desqualifica lead bom em silêncio e ninguém percebe. | Confiar em `next build` e `eslint` cobre tipo e sintaxe, não cobre se o score classifica certo. Teste manual não é executável pelo agente e não roda no CI. |
| Adicionar um banco de dados a um site que hoje é inteiramente estático e serverless | FR-024, FR-025 e FR-027 exigem persistir concluídos e parciais e consultar por origem, faixa e data. Isso é o coração do princípio IV. | Planilha ou arquivo não suportam consulta nem exclusão por pedido do titular, e reintroduziriam o problema que a feature existe para resolver. |
