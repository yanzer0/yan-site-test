# Central de guias: manifesto v1.2

| Artefato | Versão | Estado |
|---|---|---|
| [Entidade](README.md) | 1.2 | ready-for-build |
| [Requisitos](PRD.md) | 1.1 | ready-for-build |
| [Arquitetura](ARQUITETURA.md) | 1.1 | ready-for-build |
| [Contratos](CONTRATOS-E-EVENTOS.md) | 1.2 | ready-for-build |
| [Dados](DADOS-E-APIS.md) | 1.1 | ready-for-build |
| [Studio e UX](UX-E-CONTEUDO.md) | 1.2 | ready-for-build |
| [Plano](PLANO-DE-IMPLEMENTACAO.md) | 1.1 | ready-for-build |
| [Verificação](VERIFICACAO-E-OPERACAO.md) | 1.1 | ready-for-build |
| [Decisão](DECISAO-ARQUITETURAL.md) | 1.1 | ready-for-build |

Precedência: pedido explícito de Yan, requisitos, contratos/dados, arquitetura/UX, plano e verificação. Não há decisão bloqueante antes de implementar. Revisão independente e prova de produção pertencem ao root antes da publicação. [Work order](../../.planning/work-orders/WO-CENTRAL-GUIAS-001.md). Migração executável: `migration.sql`.


## Ampliação autorizada por Yan em 28/10/2026

O pedido novo exige guardar respostas e dados úteis para contato, mensuração e públicos. A versão 1.1 inclui duas escolhas opcionais separadas, desmarcadas: contato comercial e publicidade/públicos Meta. Recusar não impede acesso. Versão do aviso, escolhas e horário do servidor ficam ligados ao cadastro e ao histórico. Preferências autenticadas permitem revogar; exportações e carregamento de tags respeitam o estado atual.

Metadados limitados e com origem: campanha e IDs allowlisted; navegador, idioma, fuso, tela, cookies específicos e IP público apenas com publicidade autorizada. Localização aproximada por IP via GeoJS, host HTTPS fixo, sem redirect e timeout de 1,5s; falha fica indisponível e não bloqueia cadastro. Sem GPS, fingerprint, cookies de autenticação ou coleta de histórico. O loader GTM existente dos 16 guias será substituído por um loader compartilhado condicionado à escolha, sem pixel duplicado. Exportação Meta contém só identificadores padronizados, sem respostas abertas, IP ou cookies; contato filtra opt-in comercial. Sem disparos nem criação de audiência.

Migração aditiva idempotente inclui escolhas atuais, JSONB de metadados e histórico de consentimentos. Alteração/negação impede cargas futuras do GTM; revogação remove os enriquecimentos de publicidade da base corrente. Não podemos desfazer tratamentos já efetuados por terceiros antes da revogação. Provas: opt-out sem GeoJS/metadados, whitelist, indisponibilidade tolerada, revogação e filtros de export, GTM único e os gates anteriores. O TS2493 legado continua fora do escopo.
