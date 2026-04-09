# Stitch Skills — Guia de Uso

Skills de design e frontend do Google Labs para agentes de código (Claude Code, Gemini CLI, Codex, etc).

> Fonte: [google-labs-code/stitch-skills](https://github.com/google-labs-code/stitch-skills)

---

## Instalacao

```bash
# Listar todas as skills disponiveis
npx skills add google-labs-code/stitch-skills --list

# Instalar uma skill especifica (global)
npx skills add google-labs-code/stitch-skills --skill <nome> --global --yes

# Instalar todas de uma vez
npx skills add google-labs-code/stitch-skills --skill stitch-design --global --yes
npx skills add google-labs-code/stitch-skills --skill stitch-loop --global --yes
npx skills add google-labs-code/stitch-skills --skill design-md --global --yes
npx skills add google-labs-code/stitch-skills --skill enhance-prompt --global --yes
npx skills add google-labs-code/stitch-skills --skill react:components --global --yes
npx skills add google-labs-code/stitch-skills --skill remotion --global --yes
npx skills add google-labs-code/stitch-skills --skill shadcn-ui --global --yes
npx skills add google-labs-code/stitch-skills --skill taste-design --global --yes
```

Apos instalar, reinicie a sessao do Claude Code para que as skills sejam detectadas.

---

## Skills Disponiveis

### 1. stitch-design

**Para que serve:** Ponto de entrada unificado para trabalho de design com o Stitch MCP. Combina enhancement de prompts, sintese de design system e geracao de telas em alta fidelidade.

**Quando usar:**
- Criar telas de UI a partir de descricoes vagas
- Gerar ou atualizar um design system completo
- Trabalhar com o Stitch MCP server para gerar interfaces

**Como usar:**
```
/stitch-design
```
Descreva o que voce quer construir e a skill orquestra o fluxo completo: melhora seu prompt, aplica o design system e gera as telas.

---

### 2. stitch-loop

**Para que serve:** Gera um site multi-paginas completo a partir de um unico prompt. Usa um padrao de "baton-passing" onde cada iteracao gera uma pagina e passa contexto para a proxima.

**Quando usar:**
- Criar um site inteiro de uma vez (landing pages, portfolios, dashboards)
- Gerar multiplas paginas com consistencia visual entre elas

**Como usar:**
```
/stitch-loop
```
Forneca uma descricao do site desejado. A skill gera pagina por pagina de forma autonoma, organizando arquivos e validando cada etapa.

---

### 3. design-md

**Para que serve:** Analisa projetos Stitch e gera um arquivo `DESIGN.md` documentando o design system em linguagem semantica, otimizado para geracao de telas futuras.

**Quando usar:**
- Documentar o design system de um projeto existente
- Criar uma referencia de tokens, cores, tipografia e espacamento
- Preparar um projeto para futuras geracoes consistentes

**Como usar:**
```
/design-md
```
Aponte para um projeto com telas Stitch e a skill extrai e documenta o design system automaticamente.

---

### 4. enhance-prompt

**Para que serve:** Transforma ideias vagas de UI em prompts otimizados para o Stitch. Adiciona keywords de UI/UX, injeta contexto de design system e estrutura o output para melhores resultados.

**Quando usar:**
- Antes de gerar telas, para melhorar a qualidade do prompt
- Quando sua descricao e generica demais ("faz uma tela bonita de login")
- Para adicionar especificidade e atmosfera ao pedido

**Como usar:**
```
/enhance-prompt
```
Descreva sua ideia e a skill devolve um prompt refinado com termos tecnicos, atmosfera visual e contexto de design.

---

### 5. react:components (react-components)

**Para que serve:** Converte telas geradas pelo Stitch em componentes React modulares com Vite, incluindo validacao AST e consistencia de design tokens.

**Quando usar:**
- Transformar HTML/CSS gerado pelo Stitch em componentes React reutilizaveis
- Criar um sistema de componentes a partir de designs existentes
- Integrar telas Stitch em um projeto React/Vite

**Como usar:**
```
/react:components
```
Aponte para as telas Stitch e a skill gera componentes React com props tipadas, design tokens e estrutura de projeto Vite.

---

### 6. remotion

**Para que serve:** Gera videos de walkthrough a partir de projetos Stitch usando Remotion, com transicoes suaves, zoom e overlays de texto.

**Quando usar:**
- Criar videos de demonstracao de um app/site
- Gerar showcases profissionais de telas para apresentacoes
- Produzir conteudo visual para portfolio ou pitch

**Como usar:**
```
/remotion
```
Aponte para o projeto e a skill gera um projeto Remotion com composicoes animadas das telas.

---

### 7. shadcn-ui

**Para que serve:** Guia especializado para integrar e construir aplicacoes com componentes shadcn/ui. Ajuda a descobrir, instalar, customizar e otimizar componentes.

**Quando usar:**
- Adicionar componentes shadcn/ui a um projeto
- Customizar temas e variantes de componentes
- Seguir best practices de integracao shadcn/ui + React

**Como usar:**
```
/shadcn-ui
```
Pergunte sobre qualquer componente shadcn/ui e a skill fornece orientacao de instalacao, customizacao e uso.

---

### 8. taste-design

**Para que serve:** Design system semantico premium. Gera arquivos `DESIGN.md` que enforcam padroes anti-genericos: tipografia rigorosa, cores calibradas, layouts assimetricos, micro-motion perpetuo e performance com aceleracao de hardware.

**Quando usar:**
- Quando quer um design system com padrao Awwwards/premium
- Para evitar interfaces genericas e "AI-looking"
- Criar guidelines de design que priorizem distinacao visual

**Como usar:**
```
/taste-design
```
A skill gera um design system semantico com regras estritas de qualidade visual, pronto para ser consumido por agentes na geracao de telas.

---

## Resumo Rapido

| Skill | Funcao Principal |
|---|---|
| `stitch-design` | Hub central — prompt + design system + geracao de telas |
| `stitch-loop` | Site multi-paginas autonomo |
| `design-md` | Documentar design system existente |
| `enhance-prompt` | Melhorar prompts vagos para UI |
| `react:components` | Converter Stitch → React components |
| `remotion` | Gerar videos de walkthrough |
| `shadcn-ui` | Guia de integracao shadcn/ui |
| `taste-design` | Design system premium anti-generico |

---

## Notas

- Todas as skills foram auditadas e sao seguras (sem prompt injection ou codigo malicioso)
- Projeto experimental do Google Labs — nao e produto oficial Google
- Skills instaladas em `~/.agents/skills/` com symlinks para Claude Code
- Licenca: Apache 2.0
