---
status: em-andamento
definition_status: ready-for-build
version: 1.1
created: 2026-10-28
owner: Yan
---
# Central de guias

Pedido autorizado por Yan em 28/10: uma central clara v2 com todos os guias e seis campos obrigatórios antes de qualquer acesso. Fato: há 16 HTMLs gratuitos em `public/`, servidos por rotas estáticas e aliases. O middleware atual só cobre a demo Marja e o painel. Existe Postgres privado e autenticação de equipe.

Decisão congelada: central em `/guias`, sublinks `/guias/<slug>`, catálogo único, validação e persistência no servidor, cookie assinado sem PII por 30 dias. O acesso original e o `.html` também passam pelo gate. Sem decisão de produto aberta. Executor único nesta frente; a revisão independente do root e a prova viva de produção ficam antes da publicação, sem simular parecer de terceiros. Código fora desta frente permanece intacto.

Escopo: catálogo, captura, sessão, proteção dos guias, consulta e exportação autenticadas. Fora: conteúdo dos guias, diagnóstico, score, disparos comerciais, ManyChat e gate antigo. [Manifesto](INDEX.md).

## Publicação pelo root

No checkout da VPS, antes do deploy, aplique a migração aditiva como dona das tabelas:

```sh
docker exec -i formulario-db psql -U postgres -d formulario -v ON_ERROR_STOP=1 -c 'SET ROLE formulario' -f - < specs/009-central-guias/migration.sql
```

Provisione `GUIAS_ACCESS_SECRET` exclusivo, mínimo 32 caracteres, em `/home/infuser/.config/useinfuser/useinfuser.env` (600). Gere sem imprimir o valor e preserve as outras variáveis. Não reutilize chaves de outro subsistema. Só depois rode o deploy padrão de `deploy/vps/README.md`. Sem segredo o acesso aos materiais retorna 503 e o smoke recusa a publicação. O smoke cobre os arquivos HTML diretos além dos links limpos.

Consulta do time: `/leads/guias`, com as contas já aprovadas em `/leads`. CSV paginado nos mesmos lotes de 200 e mesmos filtros de autorização. Cada entrada gera um cadastro separado, sem alterar o score ou o agendamento do diagnóstico.

Preview local: `npm run dev -- --hostname 127.0.0.1 --port 3188`, com `GUIAS_ACCESS_SECRET` sintético no ambiente; formulário em `/guias/acesso`. Para testar persistência é necessário Postgres descartável com a migração aplicada. Não usar credenciais de produção no preview. Voltar ao SHA anterior reverte o comportamento; mantenha a tabela e o segredo para preservar os dados e uma retomada segura.


## Ampliação autorizada por Yan em 28/10/2026

O pedido novo exige guardar respostas e dados úteis para contato, mensuração e públicos. A versão 1.1 inclui duas escolhas opcionais separadas, desmarcadas: contato comercial e publicidade/públicos Meta. Recusar não impede acesso. Versão do aviso, escolhas e horário do servidor ficam ligados ao cadastro e ao histórico. Preferências autenticadas permitem revogar; exportações e carregamento de tags respeitam o estado atual.

Metadados limitados e com origem: campanha e IDs allowlisted; navegador, idioma, fuso, tela, cookies específicos e IP público apenas com publicidade autorizada. Localização aproximada por IP via GeoJS, host HTTPS fixo, sem redirect e timeout de 1,5s; falha fica indisponível e não bloqueia cadastro. Sem GPS, fingerprint, cookies de autenticação ou coleta de histórico. O loader GTM existente dos 16 guias será substituído por um loader compartilhado condicionado à escolha, sem pixel duplicado. Exportação Meta contém só identificadores padronizados, sem respostas abertas, IP ou cookies; contato filtra opt-in comercial. Sem disparos nem criação de audiência.

Migração aditiva idempotente inclui escolhas atuais, JSONB de metadados e histórico de consentimentos. Alteração/negação impede cargas futuras do GTM; revogação remove os enriquecimentos de publicidade da base corrente. Não podemos desfazer tratamentos já efetuados por terceiros antes da revogação. Provas: opt-out sem GeoJS/metadados, whitelist, indisponibilidade tolerada, revogação e filtros de export, GTM único e os gates anteriores. O TS2493 legado continua fora do escopo.
