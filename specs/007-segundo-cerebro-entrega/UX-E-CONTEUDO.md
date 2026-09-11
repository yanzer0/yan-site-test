# UX: ativação sem senha

## Direção Studio

Risco G, produto Infuser. Modo CRIAR + QA. Reutilizar o design system do wizard em vez de criar uma
segunda linguagem. Tese visual: uma porta calma para um produto premium, com Onyx/Carbon, Lime e Teal,
tipografia Inter/Onest/Geist Mono e o núcleo cognitivo da capa como assinatura discreta. Tese de
interação: uma única ação por tela, feedback imediato e nenhuma animação que esconda estado.

## Tela sem sessão

- eyebrow: `ACESSO DO COMPRADOR`;
- título: `Acesse seu Segundo Cérebro.`;
- texto: `Use o mesmo e-mail informado na compra. Você receberá um link individual para ativar este navegador.`;
- label: `E-mail usado na compra`;
- CTA: `Enviar meu link de acesso`;
- apoio: `Ainda não comprou? Conheça o Segundo Cérebro Autônomo.`;
- suporte: `Se o e-mail não chegar, confira o spam ou fale com contato@useinfuser.com.`

## Estados

Link verificado tem CTA `Ativar este navegador`. Link expirado e reenvio não revelam se o e-mail
existe. Indisponibilidade diz para tentar novamente, sem chamar o usuário de não comprador.

## QA

Label real, autocomplete e-mail, alvo >=44 px, foco Teal, contraste AA, corpo 16 px no mobile,
sem overflow em 375 px e reduced motion.
