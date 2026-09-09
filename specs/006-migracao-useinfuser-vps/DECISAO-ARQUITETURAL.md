---
tags: [engenharia, adr, arquitetura, migracao, vps]
status: ready
version: 1.0
updated: 2026-09-09
---

# ADR: hospedar o useinfuser.com completo na VPS existente

## Status

`accepted`

## Contexto

A conta Vercel Hobby está pausada por compute. O site é comercial, tem rotas dinâmicas, webhooks, autenticação e banco, então não cabe numa exportação estática sem reescrever o produto. A Infuser já paga uma VPS com Docker, Caddy e capacidade disponível.

## Decisão

Hospedar o aplicativo inteiro como Next.js standalone em container dedicado na VPS, atrás do Caddy e em rede Docker exclusiva. Manter Neon e integrações externas, alterar apenas o runtime e a borda pública.

## Raciocínio e trade-offs

A decisão restaura todas as rotas sem assinatura nova e sem dividir o monólito durante incidente. O custo aceito é concentrar mais uma superfície na VPS e assumir deploy/observabilidade próprios. Healthcheck, isolamento, tag por commit, backup do Caddy e rollback reduzem esse risco.

## Consequências positivas

- elimina o teto de compute da Vercel para este site;
- mantém URLs, recursos dinâmicos e banco;
- usa capacidade já contratada;
- torna custo e processo observáveis.

## Custos e riscos residuais

- a VPS continua sendo ponto único de falha;
- CDN global e previews automáticos deixam de ser fornecidos pela Vercel;
- operação do Caddy/Docker passa a ser responsabilidade direta da Infuser;
- resposta da Hostinger sobre o reboot ainda precisa ser registrada.

## Alternativas consideradas

### Vercel Pro

Rejeitada porque não corrige o long-poll e cria custo recorrente/on-demand.

### Cloudflare Pages estático

Rejeitada para o apex porque quebraria SSR, APIs, middleware, webhooks e painel. Pode servir projetos puramente estáticos em outra fatia.

### Reescrever para Cloudflare Workers

Rejeitada agora porque amplia contrato, runtime e banco durante incidente.

## Compatibilidade, migração e rollback

Não há schema ou URL nova. O release é testado antes do DNS. Rollback restaura imagem/Caddy/DNS conforme a camada que falhar.

## Critérios para reconsiderar

- load sustentado acima de 70% da VPS;
- necessidade de alta disponibilidade ou multi-região;
- indisponibilidade da VPS acima do SLO;
- custo operacional superar um host gerenciado compatível.
