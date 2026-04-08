# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Infuser
**Updated:** 2026-04-08
**Category:** Service Landing Page
**Mode:** Dark-first. Light mode does not exist.

---

## Global Rules

### Color Palette

| Role | Value | CSS Variable | Usage |
|------|-------|--------------|-------|
| Background Primary | `#000000` | `--color-bg-primary` | Default surface background |
| Background Contrast | `#F0F0E4` | `--color-bg-contrast` | Occasional contrast sections |
| Background Accent | `#A8E84C` | `--color-bg-accent` | CTA sections, highlight areas |
| Background Subtle | `#0A0A0A` | `--color-bg-subtle` | Cards, elevated surfaces |
| Background Subtle Green | `#1A2210` | `--color-bg-subtle-green` | Green-context backgrounds |
| Text Primary | `#F0F0E4` | `--color-text-primary` | Main text on black |
| Text Muted | `rgba(240,240,228,0.4)` | `--color-text-muted` | Secondary text, captions |
| Text Muted 2 | `rgba(240,240,228,0.6)` | `--color-text-muted2` | Mid-opacity text |
| Text Accent | `#A8E84C` | `--color-text-accent` | Data, metrics, highlights |
| Text on Accent | `#000000` | `--color-text-on-accent` | Text on green backgrounds |
| Text on Contrast | `#000000` | `--color-text-on-contrast` | Text on warm white backgrounds |
| Accent | `#A8E84C` | `--color-accent` | CTAs, links, hovers, focus borders, tags |
| Accent Hover | `#C5F26E` | `--color-accent-hover` | Hover state |
| Accent Dim | `rgba(168,232,76,0.08)` | `--color-accent-dim` | Tag/badge backgrounds |
| Border | `rgba(240,240,228,0.08)` | `--color-border` | Default borders (low opacity) |
| Border Visible | `rgba(240,240,228,0.12)` | `--color-border-visible` | Visible borders (part of the aesthetic) |

**Background Rules:**
- **Black #000** — Default for every surface. Every page starts on black.
- **Warm White #F0F0E4** — Occasional contrast sections only. Never the default background.
- **Green #A8E84C** — CTA or maximum highlight sections. Rare usage — impact proportional to scarcity. Text always black on green.

**Absolute color prohibitions:**
- Never use pure white `#FFFFFF` as background — always warm white `#F0F0E4`
- Never use colors outside the palette (no purple, blue, orange, or undefined colors)

### Typography

- **Display Sans:** Cabinet Grotesk (400, 500, 700, 800) — Fontshare
- **Display Serif (punch):** Fraunces (800, SOFT:100, WONK:1) — Google Fonts (variable)
- **Body:** Outfit (300, 400, 500, 600) — Google Fonts (variable)
- **Mono:** Space Mono (400, 700) — Google Fonts

**Font imports:**
```css
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT,WONK@9..144,400,0..100,0..1;9..144,600,0..100,0..1;9..144,700,0..100,0..1;9..144,800,0..100,0..1;9..144,900,0..100,0..1&family=Outfit:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');
```
```html
<link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700,800&display=swap" rel="stylesheet">
```

**CSS Variables:**
```css
--font-display: 'Cabinet Grotesk', sans-serif;
--font-punch: 'Fraunces', Georgia, serif;
--font-body: 'Outfit', sans-serif;
--font-mono: 'Space Mono', monospace;
```

**Type Scale:**

| Size | Family / Weight | Usage |
|------|----------------|-------|
| 48–56px | Cabinet Grotesk 800 | Hero headline — rational phrase |
| 36–42px | Fraunces 800 SOFT:100 | Punch serif — emotional hook |
| 28–32px | Cabinet Grotesk 700 | Section heading / H2 |
| 20–24px | Cabinet Grotesk 700 | Card title / H3 |
| 20–28px | Fraunces 800–900 SOFT:100 | Impact numbers (R$, %, score) |
| 15–16px | Outfit 400 | Body text — paragraphs |
| 13px | Outfit 500–600 | Buttons, UI body |
| 11–12px | Outfit 400 | Captions, secondary descriptions |
| 10–11px | Space Mono 400 | Data, timestamps, scores |
| 9–10px | Space Mono 400 uppercase | Overlines, labels, tagline |

**Editorial rule: Sans then Serif.**
Cabinet Grotesk delivers the rational fact. Fraunces delivers the emotional punch. Always in this order. Never invert.

**Fraunces prohibited for:** UI titles (cards, nav, sidebar), technical data, buttons, labels, body paragraphs.

**Font prohibitions:** Never use Inter, Roboto, Arial, Syne, or DM Sans.

### Gradients

| Token | Value | Usage |
|-------|-------|-------|
| `--gradient-depth` | `linear-gradient(160deg, #000 30%, #0D1A08 70%, #1A2210 100%)` | Hero sections, long sections, page backgrounds |
| `--gradient-depth-radial` | `radial-gradient(circle at 30% 30%, #1A2210, #000)` | Alternative depth |
| `--gradient-accent` | `linear-gradient(135deg, #A8E84C, #C5F26E)` | CTAs, buttons, green CTA sections, tags, badges |
| `--gradient-accent-dim` | `linear-gradient(135deg, rgba(168,232,76,0.08), rgba(197,242,110,0.12))` | Subtle accent backgrounds |
| `--gradient-mesh` | Layered radial-gradients over #000 | Hero premium, impact posts, proposals, orbs |
| `--gradient-mesh-orb` | `radial-gradient(circle at 35% 35%, rgba(197,242,110,0.15), rgba(168,232,76,0.08) 30%, rgba(26,34,16,0.4) 60%, #000 100%)` | Decorative orb elements |

**Gradient rules:**
- **G1 Depth** (black to dark green) — hero sections, long sections. NOT for small cards or icons.
- **G2 Accent** (green to green-light) — CTAs, buttons, tags. NOT for body text or full-page backgrounds.
- **G3 Mesh** (multipoint radial) — premium hero, impact moments. NOT for functional UI or repeated components.

### Logo System

Three modes: icon alone, wordmark alone, full lockup. Each works independently.

**Lockup technical parameters:**

| Parameter | Value | Note |
|-----------|-------|------|
| icon_scale | 21.5 | Icon scale inside lockup viewBox |
| icon_cy | 1200 | Vertical center (optical offset — below mathematical center) |
| icon_tx | 100 | Horizontal icon position |
| wm_offset | 1516 | Wordmark horizontal start |
| viewBox | 0 0 5516 2180 | Total lockup viewBox |
| stroke-width | 3.2 | Icon weight (medium) |
| dot radius | 4 | Central dot radius |

**Logo usage rules:**
- Icon alone for favicon, WhatsApp avatar, app icon
- Wordmark alone when context already establishes the brand
- Lockup as primary signature in hero, footer, materials
- Icon in green on black as primary variant
- Monochrome (warm white or black) when green doesn't work

**Logo prohibitions:**
- Never distort, rotate, or compress the logo
- Never use icon colors outside the defined palette
- Never alter stroke-width or dot radius
- Never place wordmark above the icon (lockup is horizontal)
- Never use on noisy background or images without sufficient contrast

### Spacing Variables

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Tight gaps |
| `--space-sm` | `8px` / `0.5rem` | Icon gaps, inline spacing |
| `--space-md` | `16px` / `1rem` | Standard padding |
| `--space-lg` | `24px` / `1.5rem` | Section padding, card padding |
| `--space-xl` | `32px` / `2rem` | Large gaps |
| `--space-2xl` | `48px` / `3rem` | Section margins |
| `--space-3xl` | `64px` / `4rem` | Hero padding |

### Shadow Depths

| Level | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.3)` | Subtle lift |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.4)` | Cards, buttons |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.4)` | Modals, dropdowns |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.5)` | Hero images, featured cards |

> Shadows allowed with moderation. Subtle box-shadow or color elevation only. Never colored glow.

---

## Component Specs

### Visual Rules

| Decision | Definition | Note |
|----------|-----------|------|
| Dark-first | Always. Light mode does not exist. | Every material, screen, and piece starts on black. |
| Border-radius | 6–8px default | Modern without being soft. Apply to buttons, cards, inputs, tags. |
| Borders | Visible — part of the aesthetic | Max 1px. The aesthetic is precision. Never 2px+. |
| Shadows | Allowed with moderation | Subtle box-shadow or color elevation. Never colored glow. |

### Green Usage Map

| Where | How |
|-------|-----|
| Primary CTAs | Solid green background, black text |
| Secondary CTAs | Green outline, green text, transparent background |
| Tertiary CTAs | Green text with underline, no background or border |
| Links | Electric green, underline on hover |
| Hover states | Transition to green-light #C5F26E |
| Focus borders | 1px solid green on active inputs |
| Tags and badges | Green text on green-dim background (8% opacity) |
| Text highlights | Data and metrics in green within paragraphs |
| Logo icon | Always green in primary variant |

### Buttons

```css
/* Primary Button */
.btn-primary {
  display: inline-flex;
  align-items: center;
  padding: 10px 24px;
  background: var(--color-accent); /* #A8E84C */
  color: var(--color-text-on-accent); /* #000 */
  font: 600 13px/1 var(--font-body); /* Outfit */
  border-radius: 7px;
  border: none;
  cursor: pointer;
  transition: all 200ms ease;
}

.btn-primary:hover {
  background: var(--color-accent-hover); /* #C5F26E */
}

/* Secondary Button */
.btn-secondary {
  display: inline-flex;
  align-items: center;
  padding: 10px 24px;
  background: transparent;
  color: var(--color-accent);
  font: 500 13px/1 var(--font-body);
  border-radius: 7px;
  border: 1px solid var(--color-accent);
  cursor: pointer;
  transition: all 200ms ease;
}

/* Tertiary Button */
.btn-tertiary {
  display: inline-flex;
  align-items: center;
  padding: 10px 4px;
  background: transparent;
  color: var(--color-accent);
  font: 500 13px/1 var(--font-body);
  border: none;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
  transition: all 200ms ease;
}
```

### Cards

```css
.card {
  background: var(--color-bg-subtle); /* #0A0A0A */
  border: 1px solid var(--color-border); /* rgba(240,240,228,0.08) */
  border-radius: 8px;
  padding: 24px 22px;
  transition: all 200ms ease;
}

.card:hover {
  border-color: var(--color-border-visible);
}
```

### Inputs

```css
.input {
  padding: 12px 16px;
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font: 400 16px/1.5 var(--font-body);
  color: var(--color-text-primary);
  transition: border-color 200ms ease;
}

.input:focus {
  border-color: var(--color-accent);
  outline: none;
  box-shadow: 0 0 0 3px rgba(168, 232, 76, 0.12);
}

.input::placeholder {
  color: var(--color-text-muted);
}
```

### Modals

```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
}

.modal {
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-border-visible);
  border-radius: 12px;
  padding: 32px;
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 90%;
}
```

### Tags / Badges

```css
.tag {
  display: inline-flex;
  align-items: center;
  padding: 5px 14px;
  background: var(--color-accent-dim);
  color: var(--color-accent);
  font: 500 12px/1 var(--font-body);
  border-radius: 6px;
}
```

---

## Style Guidelines

**Style:** Dark editorial, precision borders, Sans + Serif editorial rhythm

**Key Effects:** 
- `font-size: clamp(36px, 5vw, 56px)` for hero headlines
- `letter-spacing: -0.03em` on display headings
- `font-variation-settings: 'SOFT' 100, 'WONK' 1` on Fraunces
- Visible 1px borders as part of the design language
- Green used sparingly for maximum impact

### Page Pattern

**Pattern Name:** Scroll-Triggered Storytelling

- **Conversion Strategy:** Narrative increases time-on-page 3x. Use progress indicator. Mobile: simplify animations.
- **CTA Placement:** End of each chapter (mini) + Final climax CTA
- **Section Order:** 1. Intro hook, 2. Chapter 1 (problem), 3. Chapter 2 (journey), 4. Chapter 3 (solution), 5. Climax CTA

---

## Anti-Patterns (Do NOT Use)

- **Pure white backgrounds** — Always warm white #F0F0E4 for contrast sections
- **Thick borders (2px+)** — Max 1px, precision aesthetic
- **Fonts outside the system** — Never Inter, Roboto, Arial, Syne, DM Sans
- **Colors outside the palette** — Never purple, blue, orange, or undefined colors
- **Colored glow shadows** — Subtle box-shadow only
- **Complex navigation** — Keep it minimal
- **Hidden contact info** — Always accessible
- **Emojis as icons** — Use SVG icons (Lucide, Heroicons)
- **Missing cursor:pointer** — All clickable elements must have cursor:pointer
- **Layout-shifting hovers** — Avoid scale transforms that shift layout
- **Low contrast text** — Maintain 4.5:1 minimum contrast ratio
- **Instant state changes** — Always use transitions (150–300ms)
- **Invisible focus states** — Focus states must be visible for a11y

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] Dark-first: all backgrounds default to black, no light mode
- [ ] Only palette colors used (no #FFFFFF, no blues, no oranges)
- [ ] Correct font families (Cabinet Grotesk, Fraunces, Outfit, Space Mono)
- [ ] Editorial rule respected (sans for facts, serif for emotional punch)
- [ ] Fraunces only used for punch/impact, never for UI labels or body
- [ ] Green accent used sparingly, not flooding the page
- [ ] Borders max 1px, visible as part of the aesthetic
- [ ] No emojis used as icons (use SVG instead)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150–300ms)
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile
