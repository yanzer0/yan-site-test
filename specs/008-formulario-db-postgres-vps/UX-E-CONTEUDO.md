---
tags: [engenharia, ux, conteudo, migracao, postgres]
status: not-applicable
version: 1.0
reviewer: Claude /codar
updated: 2026-09-19
---

# UX e conteúdo: não aplicável, com uma janela

A migração não altera layout, copy, navegação, perguntas, estados do formulário, painel ou
documentos gerados. A prova é paridade: o smoke da 006 mais os webhooks negativos passam antes e
depois do corte.

O único efeito visível é a janela da F5 (até 15 min, horário morto, avisada no grupo do time):

1. o formulário em `/diagnostico` carrega normalmente, mas o envio recebe 503 e cai no estado de
   erro que já existe no componente; o lead pode tentar de novo depois;
2. o painel `/leads` recebe 503 no Caddy;
3. o resto do site (páginas, guias, Club, `/api/health`) segue normal.

Não há tela de manutenção nova: criar uma seria trabalho visual fora do escopo, e o estado de
erro existente já cobre 15 minutos. Se a janela passar de 30 min, o rollback é obrigatório, não
uma tela melhor.

Qualquer diferença visual ou de comportamento encontrada depois do corte é regressão e bloqueia a
F6, nunca autorização para redesign.
