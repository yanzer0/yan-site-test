# Arquitetura v1.1

Mesmo monólito Next 15.5.25. Catálogo puro compartilhado pelo gate e biblioteca. Middleware Edge verifica HMAC WebCrypto antes de qualquer guia canônico, alias ou HTML direto. Sem sessão redireciona ao formulário com slug allowlisted. O handler POST Node valida e grava via adaptador `diagnostico/banco.ts`; só após sucesso emite cookie. A biblioteca e o formulário são documentos HTML completos servidos por route handlers, isolados do layout global com tracking. JS local cuida de busca e feedback, formulário funciona sem depender de terceiros.

Banco existente, nova tabela exclusiva. Sem serviço novo ou fila. Fronteiras: navegador não confiável, middleware com segredo runtime, API com SQL parametrizado, equipe autenticada com a autorização já existente. Falha de segredo ou banco bloqueia acesso. Cookie não comprova identidade civil nem verifica posse de e-mail; comprova preenchimento validado e persistido. Revisão independente root antes de produção.


## Ampliação autorizada por Yan em 28/10/2026

O pedido novo exige guardar respostas e dados úteis para contato, mensuração e públicos. A versão 1.1 inclui duas escolhas opcionais separadas, desmarcadas: contato comercial e publicidade/públicos Meta. Recusar não impede acesso. Versão do aviso, escolhas e horário do servidor ficam ligados ao cadastro e ao histórico. Preferências autenticadas permitem revogar; exportações e carregamento de tags respeitam o estado atual.

Metadados limitados e com origem: campanha e IDs allowlisted; navegador, idioma, fuso, tela, cookies específicos e IP público apenas com publicidade autorizada. Localização aproximada por IP via GeoJS, host HTTPS fixo, sem redirect e timeout de 1,5s; falha fica indisponível e não bloqueia cadastro. Sem GPS, fingerprint, cookies de autenticação ou coleta de histórico. O loader GTM existente dos 16 guias será substituído por um loader compartilhado condicionado à escolha, sem pixel duplicado. Exportação Meta contém só identificadores padronizados, sem respostas abertas, IP ou cookies; contato filtra opt-in comercial. Sem disparos nem criação de audiência.

Migração aditiva idempotente inclui escolhas atuais, JSONB de metadados e histórico de consentimentos. Alteração/negação impede cargas futuras do GTM; revogação remove os enriquecimentos de publicidade da base corrente. Não podemos desfazer tratamentos já efetuados por terceiros antes da revogação. Provas: opt-out sem GeoJS/metadados, whitelist, indisponibilidade tolerada, revogação e filtros de export, GTM único e os gates anteriores. O TS2493 legado continua fora do escopo.
