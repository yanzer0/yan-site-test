---
work_order: WO-LEGIAO-HERO-PREDIO-001
status: complete
central_branch: claude/legiao-hero-skilltree
owner: Claude
authorized_by: Yan
authorized_at: 2026-10-10
definition_source: pedido do Yan em 10/10/2026 (demo em largura total com scroll próprio; headline "Você pede, o andar certo responde. 80 especialistas dentro do seu Claude" com Claude e Codex alternando em outra fonte; luz do prédio sem corte; nome do andar só no hover, andar clicável levando à seção dos andares; o SkillTree do prédio na página; celular leve e fácil)
scope_lock:
  version: 1
  base_commit: 8e80047
  allowed_write_globs:
    - .planning/work-orders/WO-LEGIAO-HERO-PREDIO-001.md
    - public/legiao.html
    - public/legiao/*.html
    - public/legiao/assets/**
  architecture_delta:
    production_files:
      - public/legiao.html
      - public/legiao/*.html
      - public/legiao/assets/**
    runtime_dependencies: []
    public_contracts: []
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [LH-01, LH-02, LH-03, LH-04, LH-05]
  stop_when: [LH-01, LH-02, LH-03, LH-04, LH-05]
  passed_acceptance_ids: [LH-01, LH-02, LH-03, LH-04, LH-05]
---

# Hero novo, andares clicáveis e o prédio interativo na página de vendas

## Resultado autorizado

- Hero: título "Você pede, o andar certo responde." e a linha "80 especialistas dentro do seu" com Claude e
  Codex alternando em Geist Mono, só com transform e opacity, em largura fixa (a linha não pula).
- O prédio: a arte se funde no brilho da página (sem o retângulo cortando a luz); os rótulos fixos saem;
  cada andar é um link que acende e mostra o nome no hover e leva à aba do andar em `#andares`. No toque,
  uma dica diz pra tocar num andar.
- Seção `#predio-vivo` logo abaixo do hero com o app do prédio (o mesmo da área do comprador, copiado do
  `infuser-mcp` para `public/legiao/assets/` e `public/legiao/predio-v1.html`, com fontes locais e o link
  "Quero a Legião" no lugar de "Como conectar"). No desktop o app só carrega depois de um clique, pra não
  prender a rolagem; no celular um botão abre o app em tela cheia, sem pesar a página.
- Demo de `#provas` em largura total e barra de rolagem própria (também na página).
- Celular: sem desfoque na barra do topo e sem a animação do elevador.

## Ajustes pedidos na mesma frente (10/10)

- Fundo de pontinhos da Infuser (o padrão `.dots` dos guias v2) e blocos de cor alternando entre Onyx, Ink,
  Carbon, teal profundo, Paper, Warm White e Lime; nos fundos claros o destaque vira marca-texto lime.
- A seção "Quem trabalha em cada andar" sai: o andar clicado no hero leva ao SkillTree já dentro do andar
  (`predio-v1.html?andar=<id>`, que aciona a animação de entrada do próprio app). Os 91 resumos de venda
  passam para o `agents.json` da cópia do site, então aparecem no leitor do agente dentro do SkillTree.
- A base do prédio esmaece (sem corte seco) e, no app aberto em tela cheia, há um botão "Voltar pra página".

## Critérios de aceite

- `LH-01`: rotador troca Claude e Codex sem mudar a altura da linha; reduced-motion mostra só Claude; zero
  travessão.
- `LH-02`: no desktop o hover num andar mostra o nome e acende o andar, e o clique abre a aba certa em
  `#andares`; no celular o toque faz o mesmo e a dica aparece; sem JavaScript os andares são links para as
  âncoras.
- `LH-03`: o app do prédio carrega os 91 agentes dentro da moldura depois do clique; no celular o botão
  aponta para `/legiao/predio-v1.html`; a demo ocupa a largura do container; rolagem lateral 0 e nenhum
  erro em 1440 e 375 px.
- `LH-05`: no desktop o clique no andar do hero desce ao `#predio-vivo` e o app entra naquele andar (um
  segundo clique troca o andar); no celular o toque abre `predio-v1.html?andar=<id>` já no andar, com o botão
  de voltar visível; o leitor mostra o resumo de venda.
- `LH-04`: publicado pela VPS, `/legiao` e `/legiao/predio-v1.html` respondem 200, e o QA headless contra
  produção repete LH-01 a LH-03.

## Evidência

- `LH-01`: Chromium headless local e em produção: a linha do rotador mantém a altura enquanto Claude e Codex
  trocam (opacidades 1/0 e depois 0/1); com reduced-motion o Codex some e o Claude fica parado; 0 travessão.
- `LH-02`: no desktop o hover em Oferta deixa a etiqueta com opacidade 1 e o andar com
  `brightness(1.6) saturate(1.3)`; no celular a dica de toque aparece e o elevador some; sem JavaScript os 7
  andares são links para `predio-v2.html?andar=<id>`.
- `LH-03`: o app carrega os 91 agentes na moldura; a demo mede 1132 de 1132 px (desktop) e 327 de 327
  (celular); rolagem lateral 0 e nenhum erro nas duas larguras.
- `LH-05`: o clique em Copy no hero deixa `#predio-vivo` a 64 px do topo e o app em `scene=copy` com o
  botão "todos os andares" visível; um clique em Vendas troca para `scene=vendas`; no celular o toque em
  Oferta abre `/legiao/predio-v2.html?andar=oferta` em `scene=oferta` com o botão "Voltar pra página"; o
  leitor usa o resumo de venda (Negociador de Preço e Reunião: "Chegou o 'consegue melhorar?'...").
- `LH-04`: commits `a9cf78a`, `8925332` e `50f3f18`. Como `/legiao/*` sai com cache imutável de 1 ano, o app
  mudou de nome (`predio-v2.html`, `legiao-v2.js`, `agents-v2.json`) em vez de sobrescrever o arquivo antigo.
  O primeiro `deploy.sh` do `50f3f18` falhou no build (`next/font` sem acesso à fonte) e mesmo assim saiu
  com exit 0 sem trocar o container; o segundo terminou com `useinfuser-site release 50f3f1803996 is
  healthy`. `/legiao`, `www`, `predio-v2.html`, `agents-v2.json` e `legiao-v2.js` respondem 200, e o QA
  contra produção repetiu LH-02, LH-03 e LH-05.
