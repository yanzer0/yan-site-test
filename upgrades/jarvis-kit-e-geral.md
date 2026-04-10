# Melhorias — Jarvis Kit & Site Geral

**Avaliado em:** 2026-04-09
**Agentes utilizados:** Performance Oracle, Visual Design (Emil Kowalski), UX/CRO, Animation & Motion Design
**Status:** Pendente implementacao

---

## VEREDICTO GERAL

O site e estruturalmente competente mas visualmente monotono e tecnicamente pesado. A sensacao de "cru" vem de: mesma largura maxima em tudo, mesma animacao, mesmo ritmo de espacamento, mesma cor em tudo, e +60MB de assets nao otimizados que fazem a pagina parecer vazia durante o carregamento. Lighthouse mobile estimado: 10-30.

---

## 1. CRITICOS (corrigir imediatamente)

### 1.1 Assets gigantes — 45MB de PNGs + 17MB de video

| Arquivo | Tamanho | Onde e usado |
|---|---|---|
| `jarvis-product-mockup.png` | 12 MB | `cta.tsx:44` |
| `jarvis-terminal.png` | 11 MB | `services.tsx:35` |
| `jarvis-ai-guide.png` | 11 MB | `stats.tsx:60` |
| `jarvis-spectrum.png` | 6.8 MB | `technical.tsx:40` |
| `lockup-sem-fundo.png` | 2.3 MB | navbar, footer, selector (4x!) |
| `video-site.mp4` | 17 MB | `hero.tsx:47` (autoplay!) |

**Impacto real:** Ao scrollar abaixo do hero, a pagina mostra TELA PRETA TOTAL por multiplas viewports inteiras porque as imagens de 11MB+ nao carregaram a tempo.

**Fix:**
- Converter todos os PNGs para WebP a 1400px de largura (alvo: ~100-200KB cada)
- Substituir logo por SVG (`lockup-allwarm-on-black.svg` ja existe a 9.7KB)
- Comprimir video para ~2MB em 720p H.265
- Adicionar `poster` frame nos videos
- Adicionar `preload="metadata"` nos videos
- Adicionar `placeholder="blur"` com `blurDataURL` nas Images
- Adicionar prop `sizes` em todos os `<Image>` components
- **Economia esperada: 98% (60MB -> ~2MB)**

### 1.2 "use client" na raiz matando SSR e SEO

- `page.tsx:1` — toda a arvore e client-side rendered
- Google ve uma URL unica (`/`) para tudo, sem HTML server-side
- Sem `<title>`, `<meta>`, ou `<h1>` unicos por produto
- Navegacao e `onClick={setState}` — nao crawlavel
- FCP estimado: 5-8 segundos no mobile

**Fix:**
- Converter para rotas Next.js reais: `/jarvis/page.tsx` e `/segundo-cerebro/page.tsx`
- Cada pagina com seu `metadata` export com title, description, OG image unicos
- Mover `"use client"` para componentes folha apenas
- Adicionar structured data (`Product` schema) para cada produto

### 1.3 Three.js (600KB) para animacao decorativa de pontos

- `dotted-surface.tsx` importa Three.js inteiro para 2400 particulas oscilando com `Math.sin`
- **BUG:** `cancelAnimationFrame` usa ID stale (linha 131) — a animacao NUNCA para no unmount, criando memory leak
- `antialias: true` + `devicePixelRatio` sem cap = 4x de GPU em retina
- Roda a 60fps mesmo fora da viewport (sem IntersectionObserver)

**Fix:**
- Substituir por Canvas 2D (~50 linhas, 0 dependencias) ou efeito CSS
- Remover `three` e `@types/three` do `package.json`
- Se manter: cap pixel ratio a 1.5, desabilitar antialias, adicionar IntersectionObserver
- **Economia: ~150KB gzipped do bundle**

### 1.4 Product selector cria friccao desnecessaria

- Visitante do Instagram ja sabe qual produto quer — selector adiciona click sem valor
- Sem informacao suficiente para escolher (sem preco, sem proposta de valor nos cards)
- "Escolha seu kit" assume que o visitante ja sabe o que cada kit faz

**Fix:**
- Usar rotas separadas e linkar direto do Instagram para `/jarvis` ou `/segundo-cerebro`
- Se manter o selector, adicionar preco e proposta de valor em cada card

### 1.5 next.config.ts vazio

**Fix:**
```typescript
const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    minimumCacheTTL: 31536000,
  },
};
```

---

## 2. DESIGN — Monotonia visual

### 2.1 Layout identico em tudo

- `max-w-3xl` (768px) em TODAS as secoes — tubo estreito claustrofobico
- Mesmo `py-20 sm:py-28` em todas as secoes — ritmo metronomo
- Fundo `#000` puro em tudo — sem variacao de profundidade
- `--gradient-depth` definido no CSS mas nunca usado
- Nenhum elemento full-bleed em toda a pagina

**Fix:**
- Hero: `max-w-4xl`
- Includes: `max-w-5xl`
- Technical: imagem full-bleed ou `max-w-5xl`
- Alternar backgrounds: `#000` / `#0A0A0A` / `gradient-depth`
- Variar espacamento: TrustBar `py-8`, CTA final `py-32`
- Adicionar pelo menos 1 imagem full-bleed que quebra o container

### 2.2 Verde em excesso — fadiga visual

- `text-gradient-green` usado 20+ vezes so no Jarvis
- Quando tudo e highlight, nada e highlight
- Um unico acento para: CTAs, badges, borders, headings, links, glow, icones
- `text-zinc-400` (corpo) no limite minimo de contraste WCAG

**Fix:**
- Cortar `text-gradient-green` em 60% — maioria vira `text-white font-semibold`
- Adicionar cor secundaria (amber/gold `#F5C542` ou warm white) para nao-CTA
- Subir corpo de `text-zinc-400` para `text-zinc-300`
- Reservar `text-zinc-400` para texto secundario e `text-zinc-500` para captions
- FAQ: trocar `?` verde por `bg-white/10 text-zinc-300`
- Imagens: trocar `border-green-500/10` por `border-white/10`

### 2.3 Tipografia — 4 fontes subutilizadas

- Toda secao segue o MESMO padrao: `Cabinet Grotesk bold + quebra de linha + Fraunces verde`
- Na 3a secao ja e previsivel
- Fraunces (a fonte mais interessante) e one-trick pony — so para palavra verde
- Outfit desaparece em `text-[15px] text-zinc-400`

**Fix:**
- Quebrar o padrao de heading em pelo menos 2-3 secoes
- `services.tsx`: subir corpo para `text-base` (16px) — e a secao de persuasao
- `technical.tsx`: fazer porcentagens (45%, 55%, 87%) grandes com `font-punch text-3xl`
- `stats.tsx`: numeros dos steps de `text-2xl` para `text-5xl font-punch`
- Usar Fraunces-only heading em pelo menos 1 secao

---

## 3. ANIMACAO (framework Emil Kowalski)

### 3.1 Animacoes existentes muito lentas

| Animacao | Atual | Recomendado |
|---|---|---|
| `fade-in-up` duration | 600ms | 400ms |
| `fade-in-up` translateY | 20px | 12px |
| `fade-in-up` easing | `ease-out` (fraco) | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Stagger total | 500ms (delay-100 a 500) | 300ms (incrementos de 60ms) |
| Ultimo elemento visivel | 1100ms apos load | 700ms |
| Card hover duration | 300ms | 200ms |

### 3.2 Animacoes que DEVEM existir mas nao existem

| Interacao | Estado atual | Recomendacao |
|---|---|---|
| Scroll reveals | Nenhum — tudo estatico abaixo do hero | `IntersectionObserver` com fade-in por secao |
| Transicao de pagina | Hard cut instantaneo | `AnimatePresence` com fade + translateY |
| Menu mobile | Show/hide binario | Slide down + fade, 200ms |
| FAQ toggle | Sempre aberto, sem interacao | Accordion com transicao de altura |
| Navbar no scroll | Estatica, sempre igual | Aumentar `backdrop-blur` + opacidade no scroll |
| Button press | So hover (up), sem active (down) | `active:scale-[0.97]` |
| Arrow "Acessar" | Linear, stiff | Adicionar spring/overshoot |

### 3.3 Remover/substituir

- `pulse-glow` no CTA final (`cta.tsx:33`): pulso infinito = estetica 2019. Substituir por `hover:scale-[1.02]`
- FallingPattern: `backgroundPosition` de 36 gradientes = paint a cada frame (nao GPU). Mover para `transform: translateY()` com CSS keyframes
- FallingPattern + DottedSurface: ambos ignoram `prefers-reduced-motion`

---

## 4. COMPONENTES — Polish ausente

| Elemento | Problema | Fix |
|---|---|---|
| Botoes CTA | Sem `:active` state | `active:scale-[0.98] active:brightness-90` |
| Botoes CTA | Sem `focus-visible` ring | `focus-visible:ring-2 ring-green-400 ring-offset-2 ring-offset-black` |
| Navbar CTA | `rounded-full` vs hero CTA `rounded-lg` | Unificar border-radius |
| Menu mobile | Aparece/desaparece instantaneamente | Transicao de altura + opacidade |
| FAQ | Nao e accordion — mostra tudo estatico | Converter para accordion animado |
| Grid arquivos | `gap-[2px]` parece bug visual | Mudar para `gap-3` ou `gap-4` |
| Footer | So logo + 2 linhas de texto | Links sociais, termos, contato |
| Videos | Sem `poster` frame | Adicionar poster para evitar retangulo preto |
| TrustBar | So paragrafo de texto | Numero animado ou marquee com logos/screenshots |
| Mobile typography | `text-[11px]` no selector | Minimo 12px em qualquer lugar |
| Product selector subtitle | `text-[11px]` mobile | Subir para `text-xs` (12px) |
| Product selector title | Jump `text-sm` -> `text-2xl` | Suavizar: `text-base sm:text-xl md:text-2xl` |
| "Novo" badge | `text-[9px]` mobile | Subir para `text-[10px]` minimo |

---

## 5. CONVERSAO (UX/CRO)

### 5.1 Prova social praticamente inexistente

- "50k views" mencionado mas nunca mostrado visualmente
- Zero testimonials de compradores
- Nenhum contador de vendas
- Sem embed ou screenshots de comentarios do Instagram

**Fix:**
- Adicionar secao "mural de comentarios" com 6-8 screenshots
- Adicionar depoimentos de compradores
- Adicionar badge "X kits vendidos"
- Mostrar o video/post original do Instagram

### 5.2 Sinais de confianca ausentes

- "7 dias de garantia" em `text-[13px] text-zinc-500` — praticamente invisivel
- Sem badge de garantia visual (icone de escudo)
- Sem indicadores de seguranca de pagamento (Kiwify logo, SSL)
- Sem secao "quem criou" — nenhuma foto, bio, ou credencial do Yan
- Sem links para redes sociais
- FAQ diz "sem upsell" mas TEM upsell do Segundo Cerebro logo abaixo — contradicao

**Fix:**
- Badge visual de garantia com icone de escudo, destaque
- Logo Kiwify + "Pagamento seguro" com icone de cadeado
- Secao "Quem fez isso" com foto, @yangalasso, bio, follower count
- Corrigir FAQ: "Sem upsell escondido dentro do produto"

### 5.3 CTAs mal posicionados

- Apos o hero, proximo botao de compra so na secao FINAL
- 5-6 secoes sem oportunidade de compra = "zona morta"

**Fix:**
- Adicionar CTA inline apos secao AITeacher
- OU barra sticky flutuante com preco + botao

### 5.4 Cross-sell e bundle

- Upsell aparece DEPOIS do CTA final — timing errado
- Sem bundle pricing (R$19,90 + R$67 = R$86,90 separados)

**Fix:**
- Mover upsell para ANTES do CTA final
- Criar oferta bundle com desconto

### 5.5 Urgencia zero

- Nenhum mecanismo de urgencia em nenhum produto
- Preco ancora do SC (~~R$127~~ R$67) sem prazo

**Fix:**
- Adicionar "Preco de lancamento" com prazo ou quantidade
- Ou "Preco sobe dia X"

### 5.6 Elementos de conversao ausentes

- Sem before/after visual (especialmente para SC)
- Sem tabela comparativa "DIY vs Kit"
- Sem email capture / exit intent
- Sem video testimonials

---

## PRIORIDADES DE IMPLEMENTACAO

### Fase 1 — Emergencial (80% do impacto)
1. Converter PNGs para WebP + comprimir video
2. Substituir logo PNG por SVG
3. Separar em rotas Next.js reais (SEO)
4. Remover Three.js

### Fase 2 — Design polish
5. Variar larguras de container e espacamento
6. Reduzir verde, adicionar cor secundaria
7. Scroll reveals com IntersectionObserver
8. FAQ accordion
9. Transicao de pagina com AnimatePresence
10. Estados active/focus nos botoes

### Fase 3 — Conversao
11. Secao prova social (screenshots Instagram)
12. Secao "Quem criou" com foto/bio
13. Badge garantia + seguranca pagamento
14. CTA mid-page sticky
15. Bundle pricing

### Fase 4 — Refinamento
16. Ajustar durations/easings animacoes
17. Stagger 60ms increments
18. Poster frames nos videos
19. Footer completo
20. Corrigir typos no copy
