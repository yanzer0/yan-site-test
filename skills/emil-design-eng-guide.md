# Emil Design Engineering — Guia de Uso

Skill que codifica a filosofia de Emil Kowalski sobre polish de UI, design de componentes, decisoes de animacao e os detalhes invisiveis que fazem software parecer excelente.

> Fonte: [emilkowalski/skill](https://github.com/emilkowalski/skill) | [emilkowal.ski/skill](https://emilkowal.ski/skill)

---

## Instalacao

```bash
# Instalar (com auto-confirm para todos os agentes)
npx skills add emilkowalski/skill --yes

# Instalar apenas para Claude Code
npx skills add emilkowalski/skill
# Selecionar "Claude Code" na lista interativa
```

Apos instalar, reinicie a sessao do Claude Code para que a skill seja detectada.

Arquivos instalados:
- `.agents/skills/emil-design-eng/SKILL.md` (skill universal)
- `.claude/skills/emil-design-eng` (symlink para Claude Code)

---

## O que essa skill faz

Quando invocada, transforma o agente em um **design engineer** com a mentalidade de craft do Emil Kowalski (criador do Sonner, Vaul, etc). O agente passa a:

1. Revisar codigo UI com tabela Before/After/Why
2. Tomar decisoes de animacao baseadas em frequencia de uso
3. Aplicar easing curves customizadas (nunca usar `ease-in` para UI)
4. Seguir regras de performance (GPU-only: transform + opacity)
5. Respeitar acessibilidade (`prefers-reduced-motion`)

---

## Filosofia Central

| Principio | Resumo |
|---|---|
| **Taste is trained** | Bom gosto e instinto treinado, nao preferencia pessoal |
| **Unseen details compound** | Detalhes invisiveis se acumulam e criam experiencias que usuarios amam sem saber por que |
| **Beauty is leverage** | Beleza e diferencial competitivo real em software |

---

## Framework de Decisao de Animacao

A skill segue 4 perguntas em ordem antes de animar qualquer coisa:

### 1. Deve animar?

| Frequencia | Decisao |
|---|---|
| 100+x/dia (atalhos, command palette) | **Nunca** animar |
| Dezenas/dia (hover, navegacao) | Remover ou reduzir drasticamente |
| Ocasional (modais, drawers, toasts) | Animacao padrao |
| Raro/primeira vez (onboarding) | Pode adicionar delight |

### 2. Qual o proposito?

Propositos validos: consistencia espacial, indicacao de estado, explicacao, feedback, prevenir mudancas bruscas. Se o proposito e apenas "fica bonito" e o usuario vera com frequencia — nao anime.

### 3. Qual easing usar?

| Situacao | Easing |
|---|---|
| Elemento entrando/saindo | `ease-out` |
| Movendo/morphing na tela | `ease-in-out` |
| Hover/mudanca de cor | `ease` |
| Movimento constante (marquee) | `linear` |

**Sempre usar curves customizadas:**
```css
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
```

**Nunca usar `ease-in` para UI.** Comeca lento e faz a interface parecer travada.

### 4. Qual duracao?

| Elemento | Duracao |
|---|---|
| Feedback de botao | 100-160ms |
| Tooltips, popovers pequenos | 125-200ms |
| Dropdowns, selects | 150-250ms |
| Modais, drawers | 200-500ms |
| Marketing/explicativo | Pode ser mais longo |

**Regra: animacoes de UI devem ficar abaixo de 300ms.**

---

## Regras de Componentes

### Botoes
- Sempre `transform: scale(0.97)` no `:active`
- Transition de 160ms com `ease-out`

### Nunca animar de scale(0)
- Comecar de `scale(0.95)` + `opacity: 0`
- Nada no mundo real aparece do nada

### Popovers
- `transform-origin` deve apontar para o trigger, nao center
- **Excecao:** modais mantem `transform-origin: center`

### Tooltips
- Delay inicial para evitar ativacao acidental
- Pular delay + animacao em tooltips subsequentes

### Stagger
- Delay de 30-80ms entre itens
- Nunca bloquear interacao durante stagger

---

## Performance

| Regra | Motivo |
|---|---|
| So animar `transform` e `opacity` | Pula layout e paint, roda na GPU |
| Evitar CSS variables em drag | `--var` no pai recalcula todos os filhos |
| Framer Motion: usar `transform` string | Props `x`/`y` rodam na main thread (nao GPU) |
| CSS animations > JS sob carga | CSS roda off main thread |
| WAAPI para animacoes programaticas | Performance de CSS com controle de JS |

```jsx
// Ruim: nao e hardware accelerated
<motion.div animate={{ x: 100 }} />

// Bom: hardware accelerated
<motion.div animate={{ transform: "translateX(100px)" }} />
```

---

## Acessibilidade

```css
@media (prefers-reduced-motion: reduce) {
  .element {
    animation: fade 0.2s ease;
    /* Sem animacoes de movimento */
  }
}
```

```css
@media (hover: hover) and (pointer: fine) {
  .element:hover {
    transform: scale(1.05);
  }
}
```

---

## Formato de Review

A skill exige que reviews de UI usem tabela markdown:

| Before | After | Why |
|---|---|---|
| `transition: all 300ms` | `transition: transform 200ms ease-out` | Especificar propriedades; evitar `all` |
| `transform: scale(0)` | `transform: scale(0.95); opacity: 0` | Nada aparece do nada |
| `ease-in` em dropdown | `ease-out` com curve customizada | `ease-in` parece travado |
| Sem `:active` no botao | `transform: scale(0.97)` no `:active` | Botoes devem responder ao toque |

---

## Checklist Rapido

- [ ] `transition: all` → especificar propriedades exatas
- [ ] `scale(0)` → comecar de `scale(0.95)` + opacity
- [ ] `ease-in` em UI → trocar para `ease-out` ou curve customizada
- [ ] `transform-origin: center` em popover → usar variavel do trigger
- [ ] Animacao em acao de teclado → remover completamente
- [ ] Duracao > 300ms em UI → reduzir para 150-250ms
- [ ] Hover sem media query → adicionar `@media (hover: hover)`
- [ ] Keyframes em elemento disparado rapido → usar CSS transitions
- [ ] Framer Motion `x`/`y` sob carga → usar string `transform`
- [ ] Mesma velocidade enter/exit → exit mais rapido que enter
- [ ] Elementos aparecem todos de uma vez → adicionar stagger (30-80ms)

---

## Principios do Sonner (Componentes Amados)

1. **DX e chave** — sem hooks, sem context, setup minimo
2. **Bons defaults > muitas opcoes** — funcionar bonito out of the box
3. **Naming cria identidade** — nomes memoraveis > nomes descritivos
4. **Edge cases invisiveis** — pausar timers em tab hidden, preencher gaps entre toasts
5. **Transitions > keyframes** — para UI dinamica, transitions sao interruptiveis
6. **Doc site interativo** — deixar pessoas experimentar antes de instalar

---

## Notas

- Skill auditada: Safe (Gen), 0 alerts (Socket), Low Risk (Snyk)
- Baseada no curso [animations.dev](https://animations.dev/) do Emil Kowalski
- Instalada em `.agents/skills/emil-design-eng/` com symlink para `.claude/skills/`
- Licenca: verificar repositorio original
