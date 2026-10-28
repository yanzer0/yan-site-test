---
status: em-andamento
definition_status: ready-for-build
version: 1.0
created: 2026-10-28
owner: Yan
---
# Central de guias

Pedido autorizado por Yan em 28/10: uma central clara v2 com todos os guias e seis campos obrigatórios antes de qualquer acesso. Fato: há 16 HTMLs gratuitos em `public/`, servidos por rotas estáticas e aliases. O middleware atual só cobre a demo Marja e o painel. Existe Postgres privado e autenticação de equipe.

Decisão congelada: central em `/guias`, sublinks `/guias/<slug>`, catálogo único, validação e persistência no servidor, cookie assinado sem PII por 30 dias. O acesso original e o `.html` também passam pelo gate. Sem decisão de produto aberta. Executor único nesta frente; a revisão independente do root e a prova viva de produção ficam antes da publicação, sem simular parecer de terceiros. Código fora desta frente permanece intacto.

Escopo: catálogo, captura, sessão, proteção dos guias, consulta e exportação autenticadas. Fora: conteúdo dos guias, diagnóstico, score, disparos comerciais, ManyChat e gate antigo. [Manifesto](INDEX.md).
