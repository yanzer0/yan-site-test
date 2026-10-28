# Studio: direção e UX v1.2

Identidade pedida por Yan: v2 clara. Tese visual: biblioteca de trabalho com papel #EEF4EF, tinta #0C0C0A, Lime #C6FF34 e Teal #1F6F5F; uma composição de fichas/editorial no hero e catálogo limpo por assunto. Inter no título, Onest no corpo, Geist Mono nas etiquetas, logo horizontal claro oficial. Vidro claro tem base sólida legível e só recebe blur como realce. Reusar fontes vendadas; sem imagem ou dependência nova.

Tese de interação: abrir um link preserva o guia desejado; antes de ler, preencher seis campos com rótulos explícitos. Erro junto do campo e resumo acessível, envio desabilita botão, falha preserva entradas e permite tentar de novo. Após sucesso abre o material; na sessão seguinte, a biblioteca responde a busca e filtros sem recarregar. Hover discreto em 200ms, teclado com foco visível, reduced-motion respeitado. Telas 375/1440. Sem checklist técnico, bastidor de produção ou promessas de resultado no texto público.

Jornada: post ou central > cadastro > guia/central > navegação entre guias sem repetir cadastro por 30 dias. Sem saída comercial automática. As opções iniciais e ações explícitas seguem a revisão v1.2 abaixo. Aviso transparente de finalidade e link à política de privacidade.


## Ampliação autorizada por Yan em 28/10/2026

O pedido novo exige guardar respostas e dados úteis para contato, mensuração e públicos. A versão 1.1 inclui duas escolhas opcionais separadas (estado inicial revisado na v1.2): contato comercial e publicidade/públicos Meta. Recusar não impede acesso. Versão do aviso, escolhas e horário do servidor ficam ligados ao cadastro e ao histórico. Preferências autenticadas permitem revogar; exportações e carregamento de tags respeitam o estado atual.

Metadados limitados e com origem: campanha e IDs allowlisted; navegador, idioma, fuso, tela, cookies específicos e IP público apenas com publicidade autorizada. Localização aproximada por IP via GeoJS, host HTTPS fixo, sem redirect e timeout de 1,5s; falha fica indisponível e não bloqueia cadastro. Sem GPS, fingerprint, cookies de autenticação ou coleta de histórico. O loader GTM existente dos 16 guias será substituído por um loader compartilhado condicionado à escolha, sem pixel duplicado. Exportação Meta contém só identificadores padronizados, sem respostas abertas, IP ou cookies; contato filtra opt-in comercial. Sem disparos nem criação de audiência.

Migração aditiva idempotente inclui escolhas atuais, JSONB de metadados e histórico de consentimentos. Alteração/negação impede cargas futuras do GTM; revogação remove os enriquecimentos de publicidade da base corrente. Não podemos desfazer tratamentos já efetuados por terceiros antes da revogação. Provas: opt-out sem GeoJS/metadados, whitelist, indisponibilidade tolerada, revogação e filtros de export, GTM único e os gates anteriores. O TS2493 legado continua fora do escopo.

## Revisão v1.2 autorizada pelo usuário

No cadastro inicial, contato e publicidade começam marcados. Isso não inicia publicidade nem significa confirmação por omissão. O botão Confirmar escolhas e acessar confirma os valores visíveis; Continuar sem marketing envia ambas as escolhas falsas e nenhum metadado de publicidade, mantendo os seis campos obrigatórios. Submitter ausente/desconhecido nunca promove os defaults a autorização. Ambos os botões ficam indisponíveis durante a gravação e recuperam seus rótulos em falha. Na página de preferências, sempre renderizar os valores efetivamente salvos, inclusive revogações. Aviso persistido: guias-marketing-2026-10-28-v2; nenhuma migração.

O primeiro card ocupa 1 / -1 na grade em todos os tamanhos. No desktop ficam um destaque de largura total e 15 cards em cinco linhas de três, sem mudar DOM, URLs, busca, filtros ou ícones SVG. O root faz QA em 375px e desktop. Não há alegação de certificação jurídica; as escolhas dependem de ação afirmativa conforme a orientação já comunicada pelo root.
