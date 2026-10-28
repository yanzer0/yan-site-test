# Plano v1.1

DAG: definição/WO > catálogo + sessão + schema > middleware/POST + documentos > testes integrados > revisão independente root > migração/deploy/smoke. Caminho crítico é persistência antes do cookie, depois cobertura de todas as portas de HTML. Um executor nesta frente, sem paralelo de código; os módulos compartilham catálogo, sessão e contratos. Escopo exclusivo em WO-CENTRAL-GUIAS-001. Dependência compartilhada impede integração parcial.

R1/AC-01: catálogo e biblioteca. R2-R3/AC-02: formulário/POST/schema. R4/AC-03: sessão e middleware. R5/AC-04: painel/CSV. NFR/AC-05: testes, TypeScript, build e Studio QA root. Integração apenas após revisão. Publicação autorizada no pedido de Yan, executada pelo root. Provisão do segredo e migração precedem deploy. Voltar ao SHA anterior reverte runtime sem apagar dados novos. 2 rodadas ou 90 minutos nesta ordem.


## Ampliação autorizada por Yan em 28/10/2026

O pedido novo exige guardar respostas e dados úteis para contato, mensuração e públicos. A versão 1.1 inclui duas escolhas opcionais separadas, desmarcadas: contato comercial e publicidade/públicos Meta. Recusar não impede acesso. Versão do aviso, escolhas e horário do servidor ficam ligados ao cadastro e ao histórico. Preferências autenticadas permitem revogar; exportações e carregamento de tags respeitam o estado atual.

Metadados limitados e com origem: campanha e IDs allowlisted; navegador, idioma, fuso, tela, cookies específicos e IP público apenas com publicidade autorizada. Localização aproximada por IP via GeoJS, host HTTPS fixo, sem redirect e timeout de 1,5s; falha fica indisponível e não bloqueia cadastro. Sem GPS, fingerprint, cookies de autenticação ou coleta de histórico. O loader GTM existente dos 16 guias será substituído por um loader compartilhado condicionado à escolha, sem pixel duplicado. Exportação Meta contém só identificadores padronizados, sem respostas abertas, IP ou cookies; contato filtra opt-in comercial. Sem disparos nem criação de audiência.

Migração aditiva idempotente inclui escolhas atuais, JSONB de metadados e histórico de consentimentos. Alteração/negação impede cargas futuras do GTM; revogação remove os enriquecimentos de publicidade da base corrente. Não podemos desfazer tratamentos já efetuados por terceiros antes da revogação. Provas: opt-out sem GeoJS/metadados, whitelist, indisponibilidade tolerada, revogação e filtros de export, GTM único e os gates anteriores. O TS2493 legado continua fora do escopo.


## Central Infuser, revisão v1.3

DAG: definição > builders/scan + catálogo > rotas e middleware + portal/Kit tracking > testes/ZIP/integração > build > revisão/publicação root. Um executor nesta frente; a ligação captura/slug/catálogo é compartilhada, sem paralelismo de código. Rollback do app conserva banco e ZIPs; sem migração. Deploy só depois de root confirmar rotas novas e ausência de acesso direto a private/.
