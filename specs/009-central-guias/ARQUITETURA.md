# Arquitetura v1.0

Mesmo monólito Next 15.5.25. Catálogo puro compartilhado pelo gate e biblioteca. Middleware Edge verifica HMAC WebCrypto antes de qualquer guia canônico, alias ou HTML direto. Sem sessão redireciona ao formulário com slug allowlisted. O handler POST Node valida e grava via adaptador `diagnostico/banco.ts`; só após sucesso emite cookie. A biblioteca e o formulário são documentos HTML completos servidos por route handlers, isolados do layout global com tracking. JS local cuida de busca e feedback, formulário funciona sem depender de terceiros.

Banco existente, nova tabela exclusiva. Sem serviço novo ou fila. Fronteiras: navegador não confiável, middleware com segredo runtime, API com SQL parametrizado, equipe autenticada com a autorização já existente. Falha de segredo ou banco bloqueia acesso. Cookie não comprova identidade civil nem verifica posse de e-mail; comprova preenchimento validado e persistido. Revisão independente root antes de produção.
