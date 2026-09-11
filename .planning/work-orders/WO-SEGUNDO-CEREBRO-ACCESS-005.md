---
work_order: WO-SEGUNDO-CEREBRO-ACCESS-005
status: active
central_branch: codex/segundo-cerebro-auth
owner: Codex
authorized_by: Yan
authorized_at: 2026-09-11
definition_source: specs/007-segundo-cerebro-entrega/INDEX.md
scope_lock:
  version: 1
  base_commit: 8dbf49be15df3d58ae3a2be5cb329023102a090a
  allowed_write_globs:
    - .planning/work-orders/WO-SEGUNDO-CEREBRO-ACCESS-005.md
    - specs/007-segundo-cerebro-entrega/**
    - private/instalar/**
    - public/instalar/**
    - src/app/instalar/**
    - src/lib/instalar/**
    - tests/instalar/**
    - deploy/vps/smoke.mjs
    - Dockerfile
    - .env.example
  architecture_delta:
    production_files:
      - private/instalar/**
      - public/instalar/**
      - src/app/instalar/**
      - src/lib/instalar/**
      - Dockerfile
      - deploy/vps/smoke.mjs
    runtime_dependencies: []
    public_contracts:
      - GET /instalar
      - GET|POST /instalar/ativar
      - POST /instalar/reenviar
      - GET /instalar/guide.js
      - GET /instalar/download
    persistence_surfaces:
      - HttpOnly cookie set through the Infuser MCP activation service
    background_jobs: []
  acceptance_ids: [SCA-S01, SCA-S02, SCA-S03, SCA-S04, SCA-S05, SCA-S06, SCA-S07]
  stop_when: [SCA-S01, SCA-S02, SCA-S03, SCA-S04, SCA-S05, SCA-S06, SCA-S07]
  passed_acceptance_ids: []
---

# Proteção do guia e download do Segundo Cérebro

## Resultado autorizado

Trocar o acesso público por ativação passwordless vinculada à compra, mantendo a URL
`useinfuser.com/instalar` e a experiência existente do wizard.

## Critérios

- SCA-S01: visitante sem sessão vê acesso por e-mail, nunca o guia nem o ZIP.
- SCA-S02: GET do magic link não consome o código; POST válido cria sessão e redireciona.
- SCA-S03: sessão ativa serve o guia e o JavaScript privado.
- SCA-S04: download exige sessão e entrega o ZIP aprovado byte a byte.
- SCA-S05: HTML, JavaScript e ZIP deixam de existir em caminhos estáticos públicos.
- SCA-S06: desktop, mobile, teclado, estados de erro e reenvio passam.
- SCA-S07: produção e rollback passam nos dois hosts, integrados ao MCP.

## Rollback

Restaurar o release anterior do site. O MCP permanece fail-closed quando a feature ou o
entitlement não estão disponíveis.
