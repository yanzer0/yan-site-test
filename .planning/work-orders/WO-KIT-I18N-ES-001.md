---
work_order: WO-KIT-I18N-ES-001
status: active
report_status: pending
code_artifact_commit: null
central_branch: codex/kit-es-20261023
owner: Yan
created: 2026-10-23
updated: 2026-10-23
title: Página de vendas do Kit Segundo Cérebro em espanhol
classe: construir
risco: medio
authority_source: "Yan, 23/10/2026, nesta sessão: 'vamos rodar trafego pra la. despache 4 codex, um trabalhando na tradução de TODO o produto pra ingles e outro ... pra espanhol. outro trabalhando tradução da página de vendas pra ingles e outro pra espanhol'"
scope_lock:
  version: 1
  base_commit: 7149a632737515a545fa14ce8a8b834806afd539
  allowed_write_globs:
    - .planning/work-orders/WO-KIT-I18N-ES-001.md
    - src/app/es/kit-segundo-cerebro/**
    - src/components/segundo-cerebro-es.tsx
    - docs/i18n/kit-segundo-cerebro-es.md
  architecture_delta:
    production_files: []
    runtime_dependencies: []
    public_contracts: []
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [AC-01, AC-02, AC-03, AC-04, AC-05]
  stop_when: [AC-01, AC-02, AC-03, AC-04, AC-05]
  passed_acceptance_ids: []
---
WORK ORDER (1 página) - Página de vendas do Kit Segundo Cérebro em espanhol

Worktree (seu cwd): C:\dev\wt-site-kit-es   Branch: codex/kit-es-20261023   Repo: site useinfuser.com (Next.js)   Risco: médio (página pública que vai receber tráfego pago; nada vai ao ar nesta fatia, sem push).

OBJETIVO
A página `/kit-segundo-cerebro` vende o Kit para o Brasil. Crie a versão em espanhol para Espanha e América Latina (espanhol neutro, tratamento "tú", sem regionalismo; "computadora/ordenador" escolha um e mantenha), na rota `/es/kit-segundo-cerebro`, com o MESMO layout, seções, animações e componentes visuais. Não é tradução literal: é copy de resposta direta adaptada ao público de lá, com a mesma estrutura de persuasão.

FONTE (só leitura)
- `src/app/kit-segundo-cerebro/page.tsx` (metadata + rota) e `src/components/kit-segundo-cerebro-page.tsx` (wrapper).
- `src/components/segundo-cerebro.tsx` (1135 linhas, a página inteira). Ignore `src/app/kit-segundo-cerebro/pagina.html` (legado com links velhos da Hubla).

SAÍDA (os únicos arquivos que você cria; não edite nenhum arquivo existente)
- `src/app/es/kit-segundo-cerebro/page.tsx` com `metadata` (title, description e Open Graph) em espanhol.
- `src/components/segundo-cerebro-es.tsx`: cópia de `segundo-cerebro.tsx` com todo texto visível traduzido (inclui alt de imagem, aria-label, textos de FAQ, modal, botões, contadores). Envolva a raiz com `lang="es"`.
- `docs/i18n/kit-segundo-cerebro-es.md`: relatório em português (decisões de copy, o que mudou de ângulo e por quê, imagens com texto em português que precisam ser refeitas, pendências para o Yan).

REGRAS
1. Dinheiro: TODO valor monetário (preço, preço riscado, comparações de "quanto custa um jantar", valor de consultoria) sai de um único objeto `PRICING` no topo do componente, com `// TODO(Yan): definir` em cada valor e placeholder visível (ex.: `"[price]"`). Não invente preço nem converta R$ por câmbio: o Yan define a moeda (EUR ou USD) e os valores. As frases de comparação de preço são reescritas com itens do dia a dia de Espanha e América Latina (espanhol neutro, tratamento "tú", sem regionalismo; "computadora/ordenador" escolha um e mantenha), e o número de cada item também vem do `PRICING`.
2. Checkout: mantenha o link atual da Hotmart (`https://pay.hotmart.com/O108099140A...`) numa constante `CHECKOUT_URL` no topo com `// TODO(Yan): confirmar checkout internacional`. Não crie outro link.
3. Vídeo (VSL da converteai/vturb) está em português: remova o player e os scripts dele desta versão, sem quebrar o layout da seção; registre no relatório.
4. Prova social, números e depoimentos: só o que já está na página em português, traduzido. Nada inventado. Referência só brasileira sem equivalente (ex.: "R$50/hora", PIX, garantia do CDC) vira o equivalente honesto de Espanha e América Latina (espanhol neutro, tratamento "tú", sem regionalismo; "computadora/ordenador" escolha um e mantenha) ou sai, e o relatório diz qual.
5. Proibido travessão longo (—) no texto novo: use hífen simples, vírgula ou ponto. Tom humano, frases curtas, sem cara de IA.
6. Imagens de `public/segundo-cerebro/` continuam as mesmas (não gere imagem). Liste no relatório as que mostram texto em português.
7. Escada do ponytail: copie e traduza. Não refatore, não extraia componente compartilhado, não mexa em layout, CSS global, layout raiz, tracking nem em outras rotas.
8. Não crie, remova nem reinstale `node_modules` (é uma junção para o checkout principal). Não rode npm install/ci. Não faça push.

ACEITES (rode e cole o final da saída no relatório)
- AC-01 zero português visível: `grep -nE "\b(você|não|seu|sua|também|então|agora|cérebro)|R\$" src/components/segundo-cerebro-es.tsx src/app/es/kit-segundo-cerebro/page.tsx` sem resultado.
- AC-02 sem travessão: `grep -n "—" src/components/segundo-cerebro-es.tsx src/app/es/kit-segundo-cerebro/page.tsx` sem resultado.
- AC-03 tipos: `npx tsc --noEmit` sem erro.
- AC-04 lint: `npx eslint src/components/segundo-cerebro-es.tsx src/app/es/kit-segundo-cerebro/page.tsx` sem erro.
- AC-05 build: `npx next build` conclui e lista a rota `/es/kit-segundo-cerebro`.

FECHAMENTO
- Um commit só (`git add` explícito dos 3 arquivos), mensagem `feat(i18n): pagina do Kit Segundo Cerebro em es`. Nunca `--no-verify`.
- No Windows o sandbox pode negar processo filho do Node (EPERM): rode build, tsc, eslint e `git commit` com permissão escalada.
- Relatório final de até 12 linhas: hash do commit, cada AC com o final da saída, pendências.
- Última linha impressa: EXECUTOR_DONE kit-es
