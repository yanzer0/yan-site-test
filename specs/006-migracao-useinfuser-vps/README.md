---
tags: [engenharia, definicao, migracao, vps, incidente]
status: verified
definition_status: verified
definition_version: 1.0
owner: Yan
updated: 2026-09-09
---

# Migração do useinfuser.com para a VPS

## Estado da definição

- `definition_status`: `verified`
- versão do pacote: `1.0`
- owner humano: Yan
- executor técnico: Codex /codar
- risco/altitude: G
- última revisão: 2026-09-09

## Resultado contratado

Restabelecer `useinfuser.com` e `www.useinfuser.com` na VPS da Infuser, preservando todas as rotas, subpáginas, APIs, webhooks, autenticação, assets e integrações do projeto `yan-site-test`, sem depender do plano Pro da Vercel.

## Contexto confirmado

### Fatos verificados

- A conta Hobby foi pausada ao atingir 1.082 GB-h de memória provisionada e 8h17 de CPU ativa.
- O deployment atual está `Ready`; a indisponibilidade é o pause da conta, não falha de build.
- O worker de roteiro iniciou em 17/08/2026 às 14:45 e segura uma Function por 25 segundos em laço contínuo.
- O cálculo de 2 GB por 543,5 horas resulta em 1.087 GB-h, diferença de 0,5% para o painel.
- O build local do commit base `435d450` conclui e lista 40 rotas de aplicação.
- A VPS tem Docker, Compose, Caddy, 9,4 GiB de RAM disponível e 37 GB livres no momento da definição.
- O clone original tem alterações locais alheias; a migração usa worktree isolada.

### Hipóteses

- As credenciais de produção exportadas pela Vercel funcionarão sem alteração contra Neon, Cal, Google e Stripe. Validação: smoke tests autenticados e webhooks sem payload real antes do DNS.

### Lacunas

- O DNS é administrado na Hostinger e pode exigir login humano se não houver API já autorizada. Isso não bloqueia build e staging, mas pode bloquear o corte final.
- A resposta da Hostinger sobre o reboot abrupto de 06/09 continua pendente. Risco mitigado com restart policy, healthcheck e rollback.

## Decisões congeladas

1. O aplicativo continua monolítico em Next.js; não haverá exportação estática nem divisão de rotas nesta migração.
2. O runtime será um container não privilegiado atrás do Caddy, em rede Docker dedicada.
3. Segredos serão exportados da Vercel para arquivo 600 fora do repositório e injetados em runtime/build por secret mount.
4. O long-poll de 25 segundos será removido; o worker consultará a fila rapidamente com intervalo explícito.
5. O DNS só muda depois de build, healthcheck, paridade de rotas, backup e validação do Caddy.
6. `club.useinfuser.com` e `live.useinfuser.com` são subdomínios separados e estão fora desta work order.

## Escopo

- `useinfuser.com`, `www.useinfuser.com` e todas as subpáginas do projeto `yan-site-test`.
- Container, Compose, healthcheck, Caddy, segredos, deploy, smoke tests, DNS e rollback.
- Atualização de patch de segurança do Next.js e Sharp necessária para expor o servidor próprio.
- Correção do worker que causou a exaustão de compute.

## Não objetivos

- Redesign, alteração de copy, novas páginas ou mudança do funil.
- Migração do Postgres/Neon.
- Migração dos hosts `live`, `club` ou sites de clientes.
- Correção das pendências gerais da VPS sem relação direta com este corte.

## Superfícies protegidas

| Superfície | Papel | Regra de mudança |
|---|---|---|
| Banco Neon | Fonte de leads, agenda, mapas e roteiros | Sem schema ou dados modificados. |
| Webhooks Cal/Stripe | Entrada externa de produção | URL, assinatura e respostas preservadas. |
| `/leads` | Painel com dados pessoais | Middleware, CSP, sessão e auth preservados e testados. |
| Caddy compartilhado | Borda de todos os serviços | Backup, validação e reload, nunca restart cego. |
| DNS Hostinger | Corte público | Mudar apenas apex e `www`, com valores anteriores registrados. |

## Decisões em aberto

Nenhuma decisão técnica bloqueia o build. O acesso ao DNS pode exigir handoff humano no momento do corte.

## Definição de pronto

- Apex e `www` respondem pela VPS com TLS válido.
- Todas as rotas públicas do build respondem no caminho real.
- Rotas protegidas continuam protegidas e webhooks recusam assinatura ausente.
- O worker não mantém conexão de 25 segundos nem repete sem pausa.
- Healthcheck, logs, deploy e rollback estão documentados e provados.

## Histórico do gate

| Data | Estado | Versão | Quem revisou | Motivo |
|---|---|---|---|---|
| 2026-09-09 | ready-for-build | 1.0 | Yan + Codex /codar | Incidente diagnosticado, escopo e recuperação congelados. |
| 2026-09-09 | verified | 1.0 | Codex /codar | DNS, TLS, 59 probes por host, worker e observação de produção aprovados. |
