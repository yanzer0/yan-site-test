---
work_order: WO-TESTES-EOL-SCHEMA-001
status: complete
central_branch: claude/eol-schema-testes
owner: Claude
authorized_by: Yan
authorized_at: 2026-10-09
definition_source: pedido do Yan em 09/10/2026 ("faz"), depois de verificar que as 3 falhas da suíte não são propositais
scope_lock:
  version: 1
  base_commit: 03c855f
  allowed_write_globs:
    - .planning/work-orders/WO-TESTES-EOL-SCHEMA-001.md
    - .gitattributes
    - tests/diagnostico/schema-do-brain.ts
  architecture_delta:
    production_files: []
    runtime_dependencies: []
    public_contracts: []
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [EOL-S01, EOL-S02, EOL-S03]
  stop_when: [EOL-S01, EOL-S02, EOL-S03]
  passed_acceptance_ids: [EOL-S01, EOL-S02, EOL-S03]
---

# Suíte verde no Windows: fim de linha e cópia do schema

## Resultado autorizado

A suíte local é o único teste do repo (o deploy não roda `vitest`) e estava sempre vermelha no
Windows por três falhas que não são de produto:

- `instalar` e `validate-env`: o `core.autocrlf=true` da máquina materializa os arquivos em CRLF.
  O git guarda todos os textos em LF (408 `i/lf`, nenhum `i/crlf`). O hash do logo no blob bate com
  o esperado; o `.mjs` em LF passa 4/4. Mesmo problema que o commit `4490400` (30/08) remendou num
  teste só. Aqui a causa sai na raiz: `.gitattributes` com `* text=auto eol=lf`.
- `contrato-brain`: a cópia do schema de clientes parou em 17/08. O brain ganhou
  `perdido-stand-by` (03/09), `material-pronto`, `follow-up` e o modelo `parceria` (16/09).

Nenhum teste é afrouxado. A trava byte a byte do logo (`1b7722d`) continua.

## Critérios

- EOL-S01: depois do commit, arquivo apagado e restaurado por `git checkout` volta sem nenhum CR
  (logo e `validate-env.mjs`).
- EOL-S02: `contrato-brain`, `instalar` e `validate-env` verdes num checkout materializado com a
  regra commitada; suíte inteira sem falha.
- EOL-S03: `git status` limpo no clone principal depois do pull (arquivos antigos em CRLF não
  aparecem como modificados).

## Evidência

Commit de conteúdo `539f64b`, 09/10/2026.

- EOL-S01: depois do commit, `rm` + `git checkout --` em `public/instalar/assets/brands/infuser-v2-lockup.svg`
  e `deploy/vps/validate-env.mjs`: 0 CR nos dois; sha do logo `7602deefc3198000…`, o esperado pelo teste.
- EOL-S02: worktree rematerializado (`git rm -r --cached . && git reset --hard`), 0 textos `w/crlf`,
  `npm ci` limpo, `vitest run`: 26 arquivos passaram, 1 pulado (`banco-integracao`, exige banco),
  440 testes passaram, 0 falharam.
- EOL-S03: clone principal com status vazio antes e depois do `pull` (0 linhas), mesmo com os arquivos
  antigos ainda em CRLF no disco. Rematerializado em seguida: 0 `w/crlf`, status vazio, e os 3 testes
  (`contrato-brain`, `instalar`, `validate-env`) passaram 19/19 ali.
