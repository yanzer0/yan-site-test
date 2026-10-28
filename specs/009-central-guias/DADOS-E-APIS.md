# Dados e APIs v1.0

Fonte: tabela `guias_leads` no Postgres privado existente. UUID por cadastro, seis campos NOT NULL com CHECK de limites, guia de entrada allowlisted na aplicação, origem sem query string, criado_em e versao_privacidade. Índices por data e e-mail. INSERT parametrizado, sem registrar payload ou SQL em log. Cadastros repetidos são preservados como eventos de entrada; não alteram leads/avaliações do diagnóstico.

Migração aditiva e idempotente: `migration.sql` nesta pasta. Rodar como dono `formulario` antes de publicar; não colocar em init do volume. Rollback de app preserva tabela e registros; não executar DROP em produção. Base entra no backup já existente do banco. Consulta e CSV por equipe aprovada, sem cache, exportação escapa fórmulas. Retenção segue política publicada e exclusão por solicitação via suporte; não inventar prazo legal. Sem copiar PII de produção para teste.
