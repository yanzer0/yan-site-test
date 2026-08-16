# Implementation Plan: Gerador do mapa de diagnóstico

**Branch**: `feat/funil-diagnostico` | **Date**: 2026-08-14 | **Spec**: [spec.md](./spec.md)

## Summary

Transformar a transcrição da Call 1 mais as respostas do formulário no mapa da operação do lead, entregue como página privada no `useinfuser.com`.

A geração roda **na máquina do Yan**, não na Vercel, por três motivos que se somam: a transcrição nasce local (GPU, `/video-gpu`), o template canônico vive no brain, e o motor é o Claude Code CLI, que consome a assinatura em vez de uma chave de API. É a mesma decisão da `003`, pelas mesmas razões.

O que vai para a nuvem é só o resultado: o HTML aprovado, servido por rota com token opaco.

## Technical Context

**Language/Version**: TypeScript 5 nas rotas, JavaScript (ESM) nos scripts locais, Node 22

**Primary Dependencies**: as que já existem. `@vercel/postgres` para persistir, Claude Code CLI 2.1.166 como motor de geração. Nenhuma dependência nova.

**Storage**: as tabelas `mapas` e `mapa_achados`, no mesmo Postgres da `001`. A transcrição **não** entra no banco.

**Testing**: Vitest, junto da suíte que já existe

**Target Platform**: geração em Windows local; entrega na Vercel

**Performance Goals**: irrelevante aqui. São poucas gerações por semana, e cada uma leva o tempo do modelo ler a transcrição.

**Constraints**: a página do mapa não pode ser indexável, o HTML precisa ser self-contained e no-JS-safe, e nenhuma transcrição pode encostar em repositório versionado.

**Scale/Scope**: poucos mapas por semana.

## Constitution Check

| Princípio | Como satisfaz | Veredito |
|---|---|---|
| I. Diagnóstico antes de venda | O mapa não tem preço, escopo nem proposta. O guard de copy reprova `R$` no template. | PASS |
| II. GPCT | Não se aplica: aqui não há perguntas. | N/A |
| III. Score derivado do ICP | Não se aplica. | N/A |
| IV. Lead desqualificado é dado | O mapa se vincula ao lead que já existe, sem criar caminho paralelo. | PASS |
| V. Só se afirma o que foi verificado | É o coração da feature: selo `Fato` versus `Leitura` em todo bloco, e `.gap-box` quando não houver base. Tem guard executável. | PASS |
| VI. Identidade e copy da casa | Template canônico v2 já criado e registrado no `templates-registry.js`. O guard 5 cobre a classe. | PASS |
| VII. Dado mínimo, consentimento | Transcrição nunca versionada, nunca em log, retida por prazo definido. Sem consentimento de gravação, não gera. | PASS |
| VIII. Check que o agente roda | Validação do JSON de achados, guard de conteúdo proibido e guard de identidade, todos em Vitest. | PASS |

Nenhuma violação. Nenhuma entrada nova no Complexity Tracking: esta feature não adiciona dependência nem serviço.

## Decisões de projeto

### D1. O motor é o Claude Code CLI, em modo headless

`claude -p` com a saída forçada a JSON. Consome a assinatura Max que já existe, então não há chave de API nova nem custo por token. Coerente com a decisão da `003`.

**Alternativa rejeitada**: API da Anthropic com chave dedicada. Melhor para escala e para rodar em servidor, mas aqui a geração é local por outros motivos de qualquer forma, e introduzir chave e cobrança para poucas gerações por semana é custo sem retorno. Se um dia a geração migrar para a nuvem, esta decisão muda junto.

### D2. Duas etapas separadas: extrair e renderizar

O modelo produz **JSON de achados**, não HTML. Um renderizador determinístico transforma o JSON no documento.

**Por quê**: modelo que escreve HTML inventa markup, ignora o template canônico e a identidade escapa. Com JSON no meio, a identidade fica fora do alcance do modelo, o resultado é validável por schema antes de virar documento, e o mesmo JSON serve a FR-013 (conteúdo estruturado para a Call 2) sem parsear HTML de volta.

### D3. A transcrição nunca entra no banco nem no repositório

Fica em `transcricoes/`, ignorada pelo git. O que persiste é o JSON de achados, que já é texto tratado.

**Por quê**: FR-019. E o brain tem precedente amargo disso, com conversas de lead que foram parar no histórico de um repositório de cliente e continuam recuperáveis lá.

### D4. Entrega por rota dinâmica com token opaco

`/mapa/[token]`, servindo do banco. O token é aleatório e não carrega nada do lead.

**Alternativa rejeitada**: HTML estático em `public/`. Exigiria commit e deploy por lead, colocaria documento de cliente no repositório e não daria métrica de abertura.

### D5. Aprovação por linha de comando, não por painel

`node scripts/diagnostico/aprovar-mapa.mjs <token>`. Uma ação, um comando.

**Por quê**: FR-016 pede ação única, não interface. Não existe painel hoje, e construir um para um clique por semana é escopo especulativo. O Yan lê o HTML local e aprova. Quando o volume justificar, vira tela.

## Project Structure

```text
src/
├── app/
│   ├── mapa/[token]/page.tsx           # entrega, incrementa abertura, noindex
│   └── api/diagnostico/mapa/
│       └── publicar/route.ts           # recebe o mapa gerado localmente
└── lib/diagnostico/
    ├── mapa-tipos.ts                   # Achado, Mapa, o schema do JSON
    ├── mapa-schema.ts                  # validação do JSON que o modelo devolve
    ├── mapa-render.ts                  # JSON + template -> HTML (determinístico)
    ├── mapa-prompt.ts                  # o prompt de extração
    └── mapa-sql.sql                    # tabelas mapas e mapa_achados

scripts/diagnostico/
├── gerar-mapa.mjs                      # orquestra: lê, chama o modelo, valida, renderiza, publica
└── aprovar-mapa.mjs                    # muda o estado para aprovado

tests/diagnostico/
├── mapa-schema.test.ts                 # o validador rejeita o que precisa rejeitar
└── mapa-render.test.ts                 # o HTML sai com identidade v2 e sem conteúdo proibido
```

**Structure Decision**: a lógica pura (schema, render, prompt) vive em `src/lib` para ser testável pelo Vitest e reutilizável pela rota. Os scripts em `scripts/` são só orquestração e I/O.

## Complexity Tracking

Sem violações a justificar.
