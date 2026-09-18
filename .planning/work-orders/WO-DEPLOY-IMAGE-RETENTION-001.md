---
work_order: WO-DEPLOY-IMAGE-RETENTION-001
status: active
central_branch: claude/deploy-image-retention
owner: Claude
authorized_by: Yan
authorized_at: 2026-09-18
definition_source: conversa 2026-09-18 (limpeza de disco da VPS)
scope_lock:
  version: 1
  base_commit: 5144a8f9a625b65789ea051006ceb0368bacc001
  allowed_write_globs:
    - .planning/work-orders/WO-DEPLOY-IMAGE-RETENTION-001.md
    - deploy/vps/deploy.sh
  architecture_delta:
    production_files: []
    runtime_dependencies: []
    public_contracts: []
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [DIR-S01]
  stop_when: [DIR-S01]
  passed_acceptance_ids: [DIR-S01]
---

# Poda automática de imagens antigas no deploy do useinfuser-site

## Resultado autorizado

`deploy/vps/deploy.sh` mantém só as `KEEP_IMAGES` (padrão 3) tags mais recentes da imagem
`useinfuser-site` depois de um deploy saudável, igual ao que `infuser-mcp/scripts/update.sh` já
faz em produção desde 20/07. Sem isso o disco da VPS acumula tag de deploy sem limite (13 tags
achadas em 18/09, 6,8GB) e contribuiu pros estouros repetidos do alarme de 85%.

## Critérios

- DIR-S01: `bash -n deploy/vps/deploy.sh` passa, e a lógica de seleção de tags (mesmo
  `docker image ls | sort | tail | awk` do padrão já provado em produção) mantém exatamente as
  `KEEP_IMAGES` tags mais recentes e descarta o resto, verificado contra uma lista de imagens de
  teste antes de mexer em produção.

## Rollback

Reverter o commit. Nenhuma mudança de runtime, só o passo de limpeza pós-deploy; container em
produção não é afetado (imagem em uso nunca é alvo do `docker rmi`, que recusa removê-la).
