# Dados e APIs v1.1

Fonte: tabela `guias_leads` no Postgres privado existente. UUID por cadastro, seis campos NOT NULL com CHECK de limites, guia de entrada allowlisted na aplicação, origem sem query string, criado_em e versao_privacidade. Índices por data e e-mail. INSERT parametrizado, sem registrar payload ou SQL em log. Cadastros repetidos são preservados como eventos de entrada; não alteram leads/avaliações do diagnóstico.

Migração aditiva e idempotente: `migration.sql` nesta pasta. Rodar como dono `formulario` antes de publicar; não colocar em init do volume. Rollback de app preserva tabela e registros; não executar DROP em produção. Base entra no backup já existente do banco. Consulta e CSV por equipe aprovada, sem cache, exportação escapa fórmulas. Retenção segue política publicada e exclusão por solicitação via suporte; não inventar prazo legal. Sem copiar PII de produção para teste.


## Ampliação autorizada por Yan em 28/10/2026

O pedido novo exige guardar respostas e dados úteis para contato, mensuração e públicos. A versão 1.1 inclui duas escolhas opcionais separadas, desmarcadas: contato comercial e publicidade/públicos Meta. Recusar não impede acesso. Versão do aviso, escolhas e horário do servidor ficam ligados ao cadastro e ao histórico. Preferências autenticadas permitem revogar; exportações e carregamento de tags respeitam o estado atual.

Metadados limitados e com origem: campanha e IDs allowlisted; navegador, idioma, fuso, tela, cookies específicos e IP público apenas com publicidade autorizada. Localização aproximada por IP via GeoJS, host HTTPS fixo, sem redirect e timeout de 1,5s; falha fica indisponível e não bloqueia cadastro. Sem GPS, fingerprint, cookies de autenticação ou coleta de histórico. O loader GTM existente dos 16 guias será substituído por um loader compartilhado condicionado à escolha, sem pixel duplicado. Exportação Meta contém só identificadores padronizados, sem respostas abertas, IP ou cookies; contato filtra opt-in comercial. Sem disparos nem criação de audiência.

Migração aditiva idempotente inclui escolhas atuais, JSONB de metadados e histórico de consentimentos. Alteração/negação impede cargas futuras do GTM; revogação remove os enriquecimentos de publicidade da base corrente. Não podemos desfazer tratamentos já efetuados por terceiros antes da revogação. Provas: opt-out sem GeoJS/metadados, whitelist, indisponibilidade tolerada, revogação e filtros de export, GTM único e os gates anteriores. O TS2493 legado continua fora do escopo.


## Central Infuser, revisão v1.3

Schema preservado: guias_leads.guia recebe slug allowlisted do material, até 80 caracteres. Empacotados: agente-que-aprende.zip e orquestra-claude-codex.zip dos builders oficiais, video-transcricao-gpu.zip dos seis arquivos da skill autorizada. Nada de conteúdo de /instalar ou skills internas. Arquivos só via mapeamento fixo, sem concatenar input no filesystem. Contato e publicidade continuam sob escolhas vigentes.
