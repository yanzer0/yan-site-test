# Decisão arquitetural v1.1

28/10/2026: manter site e banco, usar catálogo único e cookie HMAC para cobrir HTML estático no middleware. Alternativas: só `required` no browser deixa bypass; usar gate antigo sem validação do site mantém links públicos; serviço novo duplica infraestrutura. O middleware evita alterar 16 documentos e 18 handlers e protege o arquivo cru. Custo: revogação imediata exige rotação global do segredo; sessão expira em 30 dias e não contém PII. Reavaliar se necessário revogar sessões individuais ou escalar além de um container. Rollback é de código, schema aditivo permanece. Fontes de API: [Middleware Next 15](https://nextjs.org/docs/15/app/api-reference/file-conventions/middleware) e [Route handlers Next 15](https://nextjs.org/docs/15/app/api-reference/file-conventions/route).


## Ampliação autorizada por Yan em 28/10/2026

O pedido novo exige guardar respostas e dados úteis para contato, mensuração e públicos. A versão 1.1 inclui duas escolhas opcionais separadas, desmarcadas: contato comercial e publicidade/públicos Meta. Recusar não impede acesso. Versão do aviso, escolhas e horário do servidor ficam ligados ao cadastro e ao histórico. Preferências autenticadas permitem revogar; exportações e carregamento de tags respeitam o estado atual.

Metadados limitados e com origem: campanha e IDs allowlisted; navegador, idioma, fuso, tela, cookies específicos e IP público apenas com publicidade autorizada. Localização aproximada por IP via GeoJS, host HTTPS fixo, sem redirect e timeout de 1,5s; falha fica indisponível e não bloqueia cadastro. Sem GPS, fingerprint, cookies de autenticação ou coleta de histórico. O loader GTM existente dos 16 guias será substituído por um loader compartilhado condicionado à escolha, sem pixel duplicado. Exportação Meta contém só identificadores padronizados, sem respostas abertas, IP ou cookies; contato filtra opt-in comercial. Sem disparos nem criação de audiência.

Migração aditiva idempotente inclui escolhas atuais, JSONB de metadados e histórico de consentimentos. Alteração/negação impede cargas futuras do GTM; revogação remove os enriquecimentos de publicidade da base corrente. Não podemos desfazer tratamentos já efetuados por terceiros antes da revogação. Provas: opt-out sem GeoJS/metadados, whitelist, indisponibilidade tolerada, revogação e filtros de export, GTM único e os gates anteriores. O TS2493 legado continua fora do escopo.


## Central Infuser, revisão v1.3

Reusar monólito/sessão/cadastro e binários privados como assets de deploy. Não usar Drive como dependência do download, nem segundo serviço, nem modelos/downloads GPU nesta sessão. Builds oficiais preservam o método distribuído; não anunciar atualização silenciosa da Orquestra. Native flex-wrap/flex-grow atende última linha sem cálculo de spans. Produtos sem URL não entram com destino inventado.
