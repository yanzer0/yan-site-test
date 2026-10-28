# Contratos e eventos v1.1

GET `/guias`: biblioteca após sessão. GET `/guias/acesso?guia=<slug>`: formulário contextual; slug desconhecido não vira redirecionamento. GET `/guias/<slug>`: sublink protegido para a rota original. POST `/api/guias/acesso`: JSON até 32KiB com nome, email, whatsapp, nicho, interesse, impedimento, guia opcional, origem opcional e website honeypot. Retorno 200 com destino local allowlisted e Set-Cookie; erros 400/403/413/429/503 sem PII e sem cookie. Origem deve coincidir com o host de produção/local da requisição. Destino nunca é URL arbitrária.

Cookie `infuser_guias`: UUID aleatório e expiração, assinado HMAC-SHA256 com `GUIAS_ACCESS_SECRET` exclusivo mínimo 32 caracteres; HttpOnly, Secure em produção, Domain=.useinfuser.com, SameSite=Lax, Path=/, 30 dias. O mesmo cadastro vale no apex e no www. Sem evento entre sistemas: esta fatia só grava/consulta internamente. Nenhum webhook ou disparo externo adicionado, nenhuma mudança no evento do diagnóstico.


## Ampliação autorizada por Yan em 28/10/2026

O pedido novo exige guardar respostas e dados úteis para contato, mensuração e públicos. A versão 1.1 inclui duas escolhas opcionais separadas, desmarcadas: contato comercial e publicidade/públicos Meta. Recusar não impede acesso. Versão do aviso, escolhas e horário do servidor ficam ligados ao cadastro e ao histórico. Preferências autenticadas permitem revogar; exportações e carregamento de tags respeitam o estado atual.

Metadados limitados e com origem: campanha e IDs allowlisted; navegador, idioma, fuso, tela, cookies específicos e IP público apenas com publicidade autorizada. Localização aproximada por IP via GeoJS, host HTTPS fixo, sem redirect e timeout de 1,5s; falha fica indisponível e não bloqueia cadastro. Sem GPS, fingerprint, cookies de autenticação ou coleta de histórico. O loader GTM existente dos 16 guias será substituído por um loader compartilhado condicionado à escolha, sem pixel duplicado. Exportação Meta contém só identificadores padronizados, sem respostas abertas, IP ou cookies; contato filtra opt-in comercial. Sem disparos nem criação de audiência.

Migração aditiva idempotente inclui escolhas atuais, JSONB de metadados e histórico de consentimentos. Alteração/negação impede cargas futuras do GTM; revogação remove os enriquecimentos de publicidade da base corrente. Não podemos desfazer tratamentos já efetuados por terceiros antes da revogação. Provas: opt-out sem GeoJS/metadados, whitelist, indisponibilidade tolerada, revogação e filtros de export, GTM único e os gates anteriores. O TS2493 legado continua fora do escopo.
