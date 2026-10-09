---
work_order: WO-DIAGNOSTICO-TRACKING-URLS-001
status: complete
central_branch: claude/tracking-diagnostico
owner: Claude
authorized_by: Yan
authorized_at: 2026-10-09
definition_source: pedido do Iago (CCO) em 09/10/2026, confirmado pelo Yan no mesmo dia ("faz os dois" + "cria a página de obrigado")
scope_lock:
  version: 1
  base_commit: c3b5c3c
  allowed_write_globs:
    - .planning/work-orders/WO-DIAGNOSTICO-TRACKING-URLS-001.md
    - src/components/diagnostico/CalAgenda.tsx
    - src/components/diagnostico/Desfecho.tsx
    - src/app/diagnostico/obrigado/page.tsx
    - next.config.ts
    - deploy/vps/smoke.mjs
  architecture_delta:
    production_files:
      - src/components/diagnostico/CalAgenda.tsx
      - src/components/diagnostico/Desfecho.tsx
      - src/app/diagnostico/obrigado/page.tsx
      - next.config.ts
    runtime_dependencies: []
    public_contracts:
      - URL /diagnostico/qualificado (troca via history.replaceState, sem recarregar)
      - URL /diagnostico/obrigado (pagina nova, carregamento completo)
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [TRK-S01, TRK-S02, TRK-S03, TRK-S04]
  stop_when: [TRK-S01, TRK-S02, TRK-S03, TRK-S04]
  passed_acceptance_ids: [TRK-S01, TRK-S02, TRK-S03, TRK-S04]
---

# URLs de conversão do funil de diagnóstico

## Resultado autorizado

O Iago vai configurar no GTM dois eventos do pixel da Meta no funil `/diagnostico`. Hoje o
formulário, o desfecho e a agenda vivem na mesma URL, então o GTM não distingue os momentos.

- **Lead qualificado:** quando o desfecho `qualificado` aparece, a URL vira
  `/diagnostico/qualificado` (mesma query string) sem recarregar. GTM: acionador
  "Alteração no histórico".
- **Call agendada:** quando o Cal.com confirma a reserva no embed do qualificado
  (`bookingSuccessfulV2`), o navegador vai para `/diagnostico/obrigado` (mesma query string).
  GTM: acionador "Visualização de página".

Fora do escopo, de propósito: o fluxo pago (`/diagnostico/pago`) não redireciona, para o pixel
não aprender com quem está fora do ICP. Nada é configurado no Cal.com: o evento de tipo é o mesmo
do fluxo pago, e um redirect lá misturaria os dois públicos.

`/diagnostico/qualificado` acessado direto (refresh) redireciona para `/diagnostico` com a query,
para nunca dar 404 a um lead.

## Critérios

- TRK-S01: no desfecho qualificado a URL passa a `/diagnostico/qualificado?<query original>` e a
  agenda continua na tela.
- TRK-S02: `/diagnostico/obrigado` responde 200, `noindex`, identidade v2, desktop 1440 e mobile 375.
- TRK-S03: `/diagnostico/qualificado` responde 307 para `/diagnostico` preservando a query.
- TRK-S04: build, lint e testes verdes; deploy na VPS saudável com smoke cobrindo as duas rotas.

## Evidência

Build de produção local (`next start -p 3021`), 09/10/2026. Nenhum lead nem reserva real: o
`/api/diagnostico/submit` foi simulado no navegador e o rascunho semeado no localStorage.

- TRK-S01: depois do envio, `location.href` =
  `/diagnostico/qualificado?sck=1791587670238_17915876038732`, h2 "Então vamos marcar, Teste.",
  iframe do Cal.com presente, única chamada à API = o submit simulado. Em seguida, um
  `postMessage` com `fullType: "CAL::bookingSuccessfulV2"` (o formato que o `embed.js` do Cal.com
  despacha) levou a `/diagnostico/obrigado?sck=...`.
- TRK-S02: `/diagnostico/obrigado` 200, `noindex` no HTML, screenshots 1440 e 375 sem quebra,
  console sem erro. Rota estática no build (`○ /diagnostico/obrigado`).
- TRK-S03: `curl /diagnostico/qualificado?sck=123_456` → `307`, `location: /diagnostico?sck=123_456`.
- Testes: `vitest run` 433 passaram, 3 falharam (`contrato-brain` x2, `instalar` x1, mais a suíte
  `validate-env`); as mesmas 3 falham com o diff guardado em stash, então não são desta ordem.
- TRK-S04: build local exit 0 e eslint limpo nos arquivos tocados. Deploy na VPS em 09/10/2026: `deploy/vps/deploy.sh` EXIT=0, "useinfuser-site release 2a8266f3a92a is healthy", smoke com `/diagnostico/obrigado` 200 e `/diagnostico/qualificado?sck=smoke` 307. De fora: `https://useinfuser.com/diagnostico/obrigado` com h1 e noindex; `/diagnostico/qualificado?sck=abc_123` 307 para `/diagnostico?sck=abc_123`.
