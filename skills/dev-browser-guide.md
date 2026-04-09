# Dev Browser — Guia de Uso

Ferramenta CLI para automacao de browser com scripts JavaScript sandboxed. Da ao agente (Claude Code, Gemini CLI, Codex, etc) a capacidade de navegar sites, preencher formularios, tirar screenshots, extrair dados e testar apps web.

> Fonte: [SawyerHood/dev-browser](https://github.com/SawyerHood/dev-browser)

---

## Instalacao

```bash
# Instalar CLI global
npm install -g dev-browser

# Instalar Playwright + Chromium
dev-browser install

# Instalar a skill para agentes de codigo
npx skills add SawyerHood/dev-browser --yes
```

Apos instalar, reinicie a sessao do Claude Code para que a skill seja detectada.

Arquivos instalados:
- `.agents/skills/dev-browser/SKILL.md` (skill universal)
- `.claude/skills/dev-browser` (symlink para Claude Code)

---

## O que e o Dev Browser

Uma CLI que executa scripts JavaScript em um sandbox QuickJS WASM para controlar browsers via Playwright. Diferente de MCPs de browser, ele:

- Roda scripts em sandbox (sem acesso ao filesystem ou rede do host)
- Mantem paginas persistentes entre execucoes (paginas nomeadas sobrevivem entre scripts)
- Conecta a Chrome rodando ou lanca Chromium proprio
- Suporta a API completa do Playwright (navegacao, clicks, forms, locators, evaluate, screenshots)

---

## Modos de Uso

### Headless (sem janela visual)

```bash
dev-browser --headless <<'EOF'
const page = await browser.getPage("main");
await page.goto("https://example.com", { waitUntil: "domcontentloaded" });
console.log(await page.title());
EOF
```

### Conectar a Chrome ja aberto

Primeiro, abrir Chrome com remote debugging:
```bash
# Windows
chrome.exe --remote-debugging-port=9222

# Mac
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222
```

Depois conectar:
```bash
dev-browser --connect <<'EOF'
const tabs = await browser.listPages();
console.log(JSON.stringify(tabs, null, 2));
EOF
```

### Headful (com janela visivel)

```bash
dev-browser <<'EOF'
const page = await browser.getPage("demo");
await page.goto("https://example.com");
EOF
```

---

## API de Scripts

Scripts rodam no sandbox QuickJS (nao e Node.js). Objetos disponiveis:

### browser (controle de paginas)

| Metodo | Descricao |
|---|---|
| `browser.getPage(name)` | Obter/criar pagina nomeada (persistente) |
| `browser.newPage()` | Criar pagina anonima (limpa apos script) |
| `browser.listPages()` | Listar todas as tabs: `[{id, url, title, name}]` |
| `browser.closePage(name)` | Fechar pagina nomeada |

### page (Playwright Page completo)

| Metodo | Descricao |
|---|---|
| `page.goto(url, opts)` | Navegar para URL |
| `page.click(selector)` | Clicar em elemento |
| `page.fill(selector, value)` | Preencher campo |
| `page.locator(selector)` | Criar locator Playwright |
| `page.evaluate(fn)` | Executar JS no contexto da pagina |
| `page.screenshot()` | Capturar screenshot (retorna buffer) |
| `page.title()` | Obter titulo da pagina |
| `page.snapshotForAI(opts)` | Snapshot otimizado para agentes AI |

### File I/O (restrito a `~/.dev-browser/tmp/`)

| Funcao | Descricao |
|---|---|
| `saveScreenshot(buf, name)` | Salvar screenshot, retorna path |
| `writeFile(name, data)` | Escrever arquivo, retorna path |
| `readFile(name)` | Ler arquivo, retorna conteudo |

### Output

```javascript
console.log()    // stdout
console.warn()   // stderr
console.error()  // stderr
console.info()   // stdout
```

---

## Exemplos Praticos

### Navegar e extrair texto

```bash
dev-browser --headless <<'EOF'
const page = await browser.getPage("scrape");
await page.goto("https://example.com", { waitUntil: "domcontentloaded" });
const title = await page.title();
const h1 = await page.locator("h1").textContent();
console.log("Title: " + title);
console.log("H1: " + h1);
EOF
```

### Tirar screenshot

```bash
dev-browser --headless <<'EOF'
const page = await browser.getPage("shot");
await page.goto("https://example.com", { waitUntil: "domcontentloaded" });
const buf = await page.screenshot();
const path = await saveScreenshot(buf, "meu-screenshot");
console.log("Salvo em: " + path);
EOF
```

### Preencher formulario

```bash
dev-browser --headless <<'EOF'
const page = await browser.getPage("form");
await page.goto("https://httpbin.org/forms/post", { waitUntil: "domcontentloaded" });
await page.fill('input[name="custname"]', "Yan");
await page.fill('input[name="custemail"]', "yan@example.com");
await page.click('button[type="submit"]');
EOF
```

### Listar tabs abertas

```bash
dev-browser --connect <<'EOF'
const tabs = await browser.listPages();
for (const tab of tabs) {
  console.log(tab.title + " → " + tab.url);
}
EOF
```

### Snapshot para AI

```bash
dev-browser --headless <<'EOF'
const page = await browser.getPage("ai");
await page.goto("https://example.com", { waitUntil: "domcontentloaded" });
const snapshot = await page.snapshotForAI();
console.log(snapshot);
EOF
```

---

## Configuracao no Claude Code

### Auto-aprovar comandos dev-browser

Adicionar em `.claude/settings.json` (projeto ou global `~/.claude/settings.json`):

```json
{
  "permissions": {
    "allow": [
      "Bash(dev-browser *)",
      "Bash(npx dev-browser *)"
    ]
  }
}
```

Isso e seguro porque os scripts rodam em sandbox WASM sem acesso ao host.

---

## Paginas Persistentes vs Anonimas

| Tipo | Criacao | Ciclo de vida |
|---|---|---|
| **Nomeada** | `browser.getPage("nome")` | Persiste entre execucoes de scripts |
| **Anonima** | `browser.newPage()` | Limpa automaticamente apos o script |

Use paginas nomeadas para fluxos multi-step (login → navegacao → acao). Use anonimas para operacoes unicas.

---

## Performance vs Alternativas

| Metodo | Tempo | Custo | Turns | Sucesso |
|---|---|---|---|---|
| **Dev Browser** | 3m 53s | $0.88 | 29 | 100% |
| Playwright MCP | 4m 31s | $1.45 | 51 | 100% |
| Playwright Skill | 8m 07s | $1.45 | 38 | 67% |
| Chrome Extension | 12m 54s | $2.81 | 80 | 100% |

Dev Browser e o mais rapido, mais barato e usa menos turns que todas as alternativas.

---

## Notas

- Scripts rodam em sandbox QuickJS WASM — sem acesso ao filesystem ou rede do host
- Skill auditada: Safe (Gen), 1 alert (Socket), Critical Risk (Snyk) — risco refere-se ao escopo de automacao, nao a vulnerabilidade no codigo
- Requer Playwright + Chromium (instalados via `dev-browser install`)
- Instalada em `.agents/skills/dev-browser/` com symlink para `.claude/skills/`
- Licenca: MIT
