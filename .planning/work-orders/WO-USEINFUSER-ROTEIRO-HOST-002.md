---
work_order: WO-USEINFUSER-ROTEIRO-HOST-002
status: active
central_branch: codex/migrar-useinfuser-vps
owner: Codex
authorized_by: Yan
authorized_at: 2026-09-09
scope_lock:
  version: 1
  base_commit: dc68143558cfac69aa2fee8e19c793f22878f212
  allowed_write_globs:
    - .planning/work-orders/WO-USEINFUSER-ROTEIRO-HOST-002.md
    - specs/006-migracao-useinfuser-vps/**
    - src/app/api/diagnostico/roteiro/concluir/route.ts
    - src/app/roteiro/entrar/route.ts
    - src/lib/diagnostico/acesso-roteiro.ts
    - src/lib/diagnostico/documento-roteiro.ts
    - scripts/diagnostico/servico-roteiro.mjs
    - scripts/diagnostico/processar-roteiros.mjs
    - scripts/diagnostico/roteiro.service
    - scripts/diagnostico/reapontar-roteiro-evento.mjs
    - tests/diagnostico/vazamento-roteiro.test.ts
    - deploy/vps/compose.prod.yml
    - deploy/vps/Dockerfile
    - deploy/vps/validate-env.mjs
    - tests/deploy/validate-env.test.ts
  architecture_delta:
    production_files:
      - src/app/api/diagnostico/roteiro/concluir/route.ts
      - src/app/roteiro/entrar/route.ts
      - src/lib/diagnostico/acesso-roteiro.ts
      - src/lib/diagnostico/documento-roteiro.ts
      - scripts/diagnostico/servico-roteiro.mjs
      - scripts/diagnostico/processar-roteiros.mjs
      - scripts/diagnostico/roteiro.service
      - deploy/vps/compose.prod.yml
      - deploy/vps/Dockerfile
      - deploy/vps/validate-env.mjs
    runtime_dependencies: []
    public_contracts:
      - POST /api/diagnostico/roteiro/concluir emits a stable www attachment URL
      - GET /roteiro/entrar shares the access cookie across apex and www in production
    persistence_surfaces: []
    background_jobs:
      - scripts/diagnostico/servico-roteiro.mjs
      - scripts/diagnostico/processar-roteiros.mjs
    operational_controls:
      - production image build fails closed when critical environment values are missing, malformed, or duplicated placeholders
  acceptance_ids:
    - RH-01
    - RH-02
    - RH-03
    - RH-04
    - RH-05
    - RH-06
    - RH-07
    - RH-08
    - RH-09
  stop_when:
    - RH-01
    - RH-02
    - RH-03
    - RH-04
    - RH-05
    - RH-06
    - RH-07
    - RH-08
    - RH-09
  passed_acceptance_ids:
    - RH-01
---

# Hotfix: host estável nos anexos de roteiro

## Problema verificado

O token informado responde 200 na VPS e numa máquina externa, mas 402 quando o mesmo hostname é forçado ao IP antigo da Vercel. O evento existente usa o apex, e o Chrome do usuário ainda o resolve para a Vercel. O gerador acopla `fileUrl` a `req.nextUrl.origin`, então o host do anexo depende de como o worker chamou a API.

## Decisão

Separar a origem pública do anexo da origem da request. `ROTEIRO_PUBLIC_BASE_URL` terá default seguro em `https://www.useinfuser.com`, será validada e ficará explícita no Compose. Workers também usarão `www` enquanto caches do apex antigo expiram.

Como o cookie anterior era host-only, a entrada também passa a emitir `Domain=useinfuser.com` quando acessada no apex ou em `www`. Em localhost e outros hosts, o cookie continua host-only para não quebrar desenvolvimento.

## Aceites

| ID | Critério |
|---|---|
| RH-01 | Token exato prova 200 na VPS/externo e 402 somente no IP antigo da Vercel. |
| RH-02 | Link gerado independe de `req.nextUrl.origin` e usa origem pública validada. |
| RH-03 | Teste falha para apex/request host antigo e passa para `www`. |
| RH-04 | Build e suíte focada passam sem regressão. |
| RH-05 | Release novo fica healthy e passa os 59 probes por host. |
| RH-06 | Worker usa o segredo canônico, recebe 200 e mantém intervalo local. |
| RH-07 | O token reportado responde 200 no host novo; evento existente recebe link `www` se for seguro identificá-lo e atualizar sem reprocessar conteúdo. |
| RH-08 | Uma nova entrada em apex ou `www` autoriza as duas origens; ambiente local continua host-only. |
| RH-09 | O build de produção rejeita env crítica ausente, malformada ou repetida como marcador. |

## Evidências

- RH-01: `187.77.36.156` e Mac externo retornaram 200; `76.76.21.21` retornou 402.
