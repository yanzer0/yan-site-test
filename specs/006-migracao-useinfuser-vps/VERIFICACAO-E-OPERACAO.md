---
tags: [engenharia, testes, operacao, runbook, migracao]
status: ready
version: 1.1
updated: 2026-09-09
---

# Verificação e operação: useinfuser.com na VPS

## 1. Estratégia baseada em risco

Falhas perigosas são: DNS apontar antes do upstream, página pública parecer viva com APIs mortas, auth desaparecer, segredo entrar na imagem e Caddy derrubar outros serviços. Cada uma exige contraexemplo, não apenas happy path.

## 2. Matriz de invariantes

| Invariante | Prova positiva | Contraexemplo | Nível |
|---|---|---|---|
| Todas as rotas existem | smoke do inventário | path inexistente retorna 404 | E2E |
| Auth permanece fechada | credencial válida em UAT | sem cookie/Basic retorna login/401 | Integração |
| Webhook verifica origem | payload assinado sintético em staging | sem assinatura retorna 4xx | Contrato |
| Segredo não vaza | scan Git/imagem | env path não está no contexto | Segurança |
| Caddy não quebra vizinhos | probes antes/depois | config inválida é rejeitada | Produção |
| Poll não segura request | resposta imediata | guard reprova `esperar=25` | Regressão |

## 3. Testes

- unidade/contrato: suíte Vitest existente e guard do worker;
- build: `next build` com inventário de rotas;
- imagem: build limpo, usuário não-root, healthcheck;
- integração: probes internos contra container e via Caddy;
- E2E: apex e `www` no DNS real, incluindo todas as páginas do build, rewrites, assets do SkillTree, redirects legados, rotas dinâmicas negativas, `/leads/entrar` e APIs negativas.

O baseline tem um teste já vermelho por divergência do enum `perdido-stand-by` entre brain e repo. É defeito pré-existente fora da migração; os outros 375 testes passam. Ele não pode ser escondido e será reportado separadamente.

## 4. Segurança adversarial

- `npm audit --omit=dev` antes/depois;
- atualização de Next e Sharp até remover vulnerabilidades críticas conhecidas;
- container sem root, sem capabilities, read-only, `no-new-privileges`;
- sem porta publicada e rede dedicada;
- middleware e webhooks exercitados sem credenciais.

## 5. Performance, capacidade e custo

| Cenário | Orçamento | Ação se falhar |
|---|---:|---|
| Health interno | < 200 ms | investigar boot/event loop |
| RSS 15 min | < 1,2 GiB | rollback e perfil |
| Load VPS | sem crescimento sustentado > 3 | abortar corte |
| Worker fila | request < 2 s vazia | investigar DB; nunca reativar long-poll |

## 6. Logs e alertas

- Caddy mantém access log JSON existente.
- Container escreve stdout/stderr, sem corpo/PII.
- `/api/health` expõe apenas estado, serviço e release.
- Vigia externo existente passa a testar o domínio após corte; UptimeRobot definitivo permanece pendência separada.

## 7. Runbook

1. Confirmar DNS, TLS, `/api/health` e status do container.
2. Comparar release esperado e logs dos últimos 10 minutos.
3. Se app falhar, restaurar tag anterior.
4. Se borda falhar, restaurar Caddyfile e reload.
5. Se DNS/cert falhar, restaurar registros anteriores.
6. Repetir probes no caminho público real e registrar evidência.

## 8. Critérios de prontidão

- [x] testes e build focados verdes, com baseline vermelho explicitado;
- [x] audit sem vulnerabilidade crítica no runtime;
- [x] container hardened e healthy;
- [x] todas as rotas e proteções provadas;
- [x] Caddy validado e rollback preservado;
- [x] DNS/TLS/release confirmados no caminho real;
- [x] observação pós-corte sem 5xx novo.

## 9. Evidência executada em 2026-09-09

- release vivo: `42c41cba44d2`;
- apex e `www`: 59 probes cada, todos aprovados;
- DNS: Hostinger, Cloudflare, Google e Quad9 retornaram `187.77.36.156`;
- TLS: Let's Encrypt, válido de 09/09 a 08/12/2026 nos dois hosts;
- container: `healthy`, usuário `nextjs`, rootfs read-only, sem porta publicada, capabilities removidas;
- consumo observado: 216 MiB de 1,5 GiB;
- fila: chamada autenticada 200 em 0,95 s e worker com intervalo local de 60 s;
- `/time`: upstream restaurado ao persistir `skilltree-net` no Caddy;
- 5xx: contador não cresceu durante a janela posterior ao conserto;
- vantage externo: Mac Mini fora da VPS resolveu o novo IP e recebeu health 200 e `/time` 200.

## 10. Provas do hotfix 1.1

- token reportado: 200 na VPS e em vantage externo; 402 apenas quando forçado a `76.76.21.21`;
- teste unitário: origem pública não depende do host da request e rejeita configuração insegura;
- integração: anexo aponta para `https://www.useinfuser.com/roteiro/<token>`;
- produção: nova imagem healthy, smoke completo e worker 200 em chamada curta;
- evento existente: atualizar somente o `fileUrl`, sem notificação, se a linha e o evento forem identificados sem ambiguidade.
