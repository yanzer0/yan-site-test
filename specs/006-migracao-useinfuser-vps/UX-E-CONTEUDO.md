---
tags: [engenharia, ux, conteudo, migracao]
status: not-applicable
version: 1.0
reviewer: Codex
updated: 2026-09-09
---

# UX e conteúdo: não aplicável

Esta migração não altera layout, conteúdo, navegação, responsividade, acessibilidade ou mensagens. O requisito é paridade integral com o commit base do site.

A verificação aplicável é operacional:

1. todas as rotas do build continuam presentes;
2. páginas públicas retornam seus conteúdos e assets;
3. páginas protegidas mantêm auth, CSP e `no-store`;
4. desktop/mobile não recebem código visual novo.

Qualquer diferença visual encontrada bloqueia o corte e é regressão, não autorização para redesign.
