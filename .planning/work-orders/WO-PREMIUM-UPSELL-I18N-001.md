---
work_order: WO-PREMIUM-UPSELL-I18N-001
status: completed
report_status: pending
code_artifact_commit: null
central_branch: codex/premium-upsell-i18n-20261023
owner: Yan
created: 2026-10-23
updated: 2026-10-23
title: Upsell do Segundo Cérebro Premium em inglês e espanhol
classe: construir
risco: medio
authority_source: "Yan, 23/10/2026, nesta sessão: 'vamos rodar trafego pra la. Então traduza o Premium também, vamos colocar o upsell em ingles e espanhol e o produto tem que estar em ingles e espanhol também, despache outro codex pra isso'"
scope_lock:
  version: 1
  base_commit: 7149a632737515a545fa14ce8a8b834806afd539
  allowed_write_globs:
    - .planning/work-orders/WO-PREMIUM-UPSELL-I18N-001.md
    - src/app/en/second-brain-kit/premium/**
    - src/app/es/kit-segundo-cerebro/premium/**
    - src/components/premium-upsell-en.tsx
    - src/components/premium-upsell-es.tsx
    - docs/i18n/premium-upsell.md
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
WORK ORDER (1 página) - Página de upsell do Segundo Cérebro Premium em inglês e em espanhol

Worktree (seu cwd): C:\dev\wt-site-premium-upsell   Branch: codex/premium-upsell-i18n-20261023   Repo: site useinfuser.com (Next.js)   Risco: médio (página pública de venda; nada vai ao ar nesta fatia, sem push).

OBJETIVO
O Kit Segundo Cérebro vai ser vendido nos EUA/Europa (inglês) e na Espanha/América Latina (espanhol). Quem compra o Kit precisa receber a oferta do Premium logo depois da compra (upsell pós-checkout da Hotmart). Crie uma página de upsell em cada idioma. Mesma identidade visual da página do Kit (`src/components/segundo-cerebro.tsx`: fundo preto, verde, `font-punch`, `text-gradient-green`, `green-glow`, `useScrollReveal`).

FONTE (só leitura)
1. A copy de valor do Premium que já foi aprovada em português, na branch de backup: `git show backup/kit-sc-dois-planos-2026-10-05:src/components/segundo-cerebro.tsx`, linhas ~990 a ~1190 (`PREMIUM_ITENS`, versão curta do pop-up, `UpsellModal`, card Premium). É a fonte dos argumentos: cada item = o que o Premium faz e o Básico não faz.
2. O que o Premium é de verdade: `C:\Users\PC\Documents\INFUSER USE - CONSULTORIA DE IA\yangalasso-brain\_infoprodutos\segundo-cerebro-autonomo\segundo-cerebro-autonomo.md` (leia só as seções iniciais até "Pendências") e `...\segundo-cerebro-autonomo\pacote\LEIA-ME.md`. Nenhum argumento pode prometer o que o pacote não faz.

SAÍDA (só crie estes arquivos; não edite nenhum arquivo existente)
- `src/app/en/second-brain-kit/premium/page.tsx` + `src/components/premium-upsell-en.tsx` (inglês, para EUA e Europa).
- `src/app/es/kit-segundo-cerebro/premium/page.tsx` + `src/components/premium-upsell-es.tsx` (espanhol neutro, "tú", para Espanha e LatAm).
- `docs/i18n/premium-upsell.md`: relatório em português (estrutura da página, argumentos usados e de onde vieram, pendências do Yan).
Outros executores estão criando agora `src/app/en/second-brain-kit/page.tsx`, `src/app/es/kit-segundo-cerebro/page.tsx` e `src/components/segundo-cerebro-{en,es}.tsx`. Não crie nem toque nesses arquivos. Se o build reclamar da falta da página-pai, isso não é problema (rota aninhada funciona sem a página-pai).

ESTRUTURA DA PÁGINA (upsell pós-compra, curta, uma decisão só)
1. Faixa de confirmação: "sua compra do Kit foi confirmada, o acesso chega no e-mail" (nada de "espere" ou falsa urgência).
2. Headline do problema que o Kit sozinho não resolve: o segundo cérebro morre quando a pessoa para de manter índice e pendências; o Premium mantém sozinho.
3. Os itens de valor (de `PREMIUM_ITENS`), traduzidos e adaptados, sem número inventado.
4. Preço: objeto `PRICING` no topo do componente, com placeholder visível `"[price]"` e `// TODO(Yan): definir`. Não invente preço nem converta R$.
5. Botão de aceite: elemento com `id="hotmart-upsell-accept"` e um bloco comentado `{/* TODO(Yan): colar aqui o script do funil one-click da Hotmart (Ferramentas > Funil de vendas) */}`. Não invente o script da Hotmart. Por ora o botão aponta para `PREMIUM_CHECKOUT_URL = "[checkout]"` (constante no topo, com TODO).
6. Link de recusa discreto ("No thanks, I'll keep the basic Kit" / equivalente em espanhol), apontando para uma constante `DECLINE_URL = "[thank-you]"` com TODO.
7. Proibido: urgência ou escassez fabricada (contador, "só agora", "última chance"), depoimento inventado, travessão longo (—). Tom humano e direto. `lang="en"` / `lang="es"` na raiz do componente. `metadata` com `robots: { index: false }` (página pós-compra não deve ser indexada).

REGRAS
- Escada do ponytail: um componente por idioma, sem abstração compartilhada, sem libs novas.
- Não crie, remova nem reinstale `node_modules` (é junção para o checkout principal). Não rode npm install/ci. Não faça push. Não mexa em layout raiz, tracking, CSS global nem outras rotas.

ACEITES (rode e cole o final da saída no relatório)
- AC-01 zero português: `grep -nE "\b(você|não|seu|sua|também|então|agora|cérebro|compra)\b|R\$" src/components/premium-upsell-en.tsx src/components/premium-upsell-es.tsx src/app/en/second-brain-kit/premium/page.tsx src/app/es/kit-segundo-cerebro/premium/page.tsx` sem resultado (se casar palavra correta em espanhol, como "compra", explique no relatório).
- AC-02 sem travessão: `grep -n "—"` nos 4 arquivos sem resultado.
- AC-03 tipos: `npx tsc --noEmit` sem erro nos seus arquivos.
- AC-04 lint: `npx eslint` nos 4 arquivos sem erro.
- AC-05 build: `npx next build` conclui e lista `/en/second-brain-kit/premium` e `/es/kit-segundo-cerebro/premium`. Se o build falhar por arquivo de outro executor que ainda está sendo escrito, rode de novo uma vez; se persistir, registre no relatório com a mensagem de erro.

FECHAMENTO
- Um commit só (`git add` explícito dos 5 arquivos), mensagem `feat(i18n): upsell do Segundo Cerebro Premium em en e es`. Nunca `--no-verify`.
- No Windows o sandbox pode negar processo filho do Node (EPERM): rode build, tsc, eslint e `git commit` com permissão escalada.
- Relatório final de até 12 linhas: hash do commit, cada AC com o final da saída, pendências.
- Última linha impressa: EXECUTOR_DONE premium-upsell
