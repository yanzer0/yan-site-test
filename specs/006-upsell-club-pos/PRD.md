# PRD - `/pos`

## Usuário e problema

Compradores do Kit Segundo Cérebro precisam receber a oferta do Club, poder recusá-la, ver uma última condição e encerrar o fluxo sem link quebrado.

## Requisitos

- FR-01: `GET /pos` entrega a página principal com os checkouts mensal e anual corretos.
- FR-02: recusas em `/pos` levam a `/pos/oferta-final`.
- FR-03: o downsell informa que o cupom `CLUB` precisa ser aplicado no checkout.
- FR-04: a recusa final leva a `/pos/obrigado`.
- FR-05: a confirmação informa que o material foi enviado por e-mail.
- FR-06: as três páginas carregam o GTM padrão das páginas HTML cruas.
- NFR-01: responsivo a 375 px e 1440 px, sem rolagem horizontal.
- NFR-02: sem formulário, segredo, dado pessoal ou dependência nova.
- NFR-03: `noindex, nofollow` em todas as páginas.

## Aceite

- AC-01: `/pos` responde 200 e todos os links resolvem para destinos esperados.
- AC-02: `/pos/oferta-final` responde 200 e mostra `CLUB` junto da instrução de cupom.
- AC-03: `/pos/obrigado` responde 200 e mostra a confirmação de entrega.
- AC-04: lint, build, inspeção estática e QA desktop/mobile passam sem erro de console.
