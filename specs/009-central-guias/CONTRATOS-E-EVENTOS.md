# Contratos e eventos v1.2

GET `/guias`: biblioteca após sessão. GET `/guias/acesso?guia=<slug>`: formulário contextual; slug desconhecido não vira redirecionamento. GET `/guias/<slug>`: sublink protegido para a rota original. POST `/api/guias/acesso`: JSON até 32KiB com nome, email, whatsapp, nicho, interesse, impedimento, guia opcional, origem opcional e website honeypot. Retorno 200 com destino local allowlisted e Set-Cookie; erros 400/403/413/429/503 sem PII e sem cookie. Origem deve coincidir com o host de produção/local da requisição. Destino nunca é URL arbitrária.

Cookie `infuser_guias`: UUID aleatório e expiração, assinado HMAC-SHA256 com `GUIAS_ACCESS_SECRET` exclusivo mínimo 32 caracteres; HttpOnly, Secure em produção, Domain=.useinfuser.com, SameSite=Lax, Path=/, 30 dias. O mesmo cadastro vale no apex e no www. Sem evento entre sistemas: esta fatia só grava/consulta internamente. Nenhum webhook ou disparo externo adicionado, nenhuma mudança no evento do diagnóstico.


## Ampliação autorizada por Yan em 28/10/2026

O pedido novo exige guardar respostas e dados úteis para contato, mensuração e públicos. A versão 1.1 inclui duas escolhas opcionais separadas (estado inicial revisado na v1.2): contato comercial e publicidade/públicos Meta. Recusar não impede acesso. Versão do aviso, escolhas e horário do servidor ficam ligados ao cadastro e ao histórico. Preferências autenticadas permitem revogar; exportações e carregamento de tags respeitam o estado atual.

Metadados limitados e com origem: campanha e IDs allowlisted; navegador, idioma, fuso, tela, cookies específicos e IP público apenas com publicidade autorizada. Localização aproximada por IP via GeoJS, host HTTPS fixo, sem redirect e timeout de 1,5s; falha fica indisponível e não bloqueia cadastro. Sem GPS, fingerprint, cookies de autenticação ou coleta de histórico. O loader GTM existente dos 16 guias será substituído por um loader compartilhado condicionado à escolha, sem pixel duplicado. Exportação Meta contém só identificadores padronizados, sem respostas abertas, IP ou cookies; contato filtra opt-in comercial. Sem disparos nem criação de audiência.

Migração aditiva idempotente inclui escolhas atuais, JSONB de metadados e histórico de consentimentos. Alteração/negação impede cargas futuras do GTM; revogação remove os enriquecimentos de publicidade da base corrente. Não podemos desfazer tratamentos já efetuados por terceiros antes da revogação. Provas: opt-out sem GeoJS/metadados, whitelist, indisponibilidade tolerada, revogação e filtros de export, GTM único e os gates anteriores. O TS2493 legado continua fora do escopo.

## Revisão v1.2 autorizada pelo usuário

No cadastro inicial, contato e publicidade começam marcados. Isso não inicia publicidade nem significa confirmação por omissão. O botão Confirmar escolhas e acessar confirma os valores visíveis; Continuar sem marketing envia ambas as escolhas falsas e nenhum metadado de publicidade, mantendo os seis campos obrigatórios. Submitter ausente/desconhecido nunca promove os defaults a autorização. Ambos os botões ficam indisponíveis durante a gravação e recuperam seus rótulos em falha. Na página de preferências, sempre renderizar os valores efetivamente salvos, inclusive revogações. Aviso persistido: guias-marketing-2026-10-28-v2; nenhuma migração.

O primeiro card ocupa 1 / -1 na grade em todos os tamanhos. No desktop ficam um destaque de largura total e 15 cards em cinco linhas de três, sem mudar DOM, URLs, busca, filtros ou ícones SVG. O root faz QA em 375px e desktop. Não há alegação de certificação jurídica; as escolhas dependem de ação afirmativa conforme a orientação já comunicada pelo root.
