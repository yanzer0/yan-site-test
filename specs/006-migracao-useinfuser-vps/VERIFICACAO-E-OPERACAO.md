---
tags: [engenharia, testes, operacao, runbook, migracao]
status: ready
version: 1.2
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

- release viva: `671add23864a`, ambiente validado durante o build e container healthy;
- token reportado: documento de 25.862 bytes em apex e `www`; 402 apenas quando forçado ao IP antigo `76.76.21.21`;
- teste unitário: origem pública não depende do host da request e rejeita configuração insegura;
- integração: anexo aponta para `https://www.useinfuser.com/roteiro/<token>`;
- contrato de acesso: entrada em apex ou `www` compartilha o cookie somente no domínio de produção; cookie host-only anterior é promovido de forma transparente;
- privacidade: fluxo sem cookie em `www` termina na página neutra de 1.032 bytes e não consulta o documento;
- produção: 59 probes externos em apex e 59 em `www`, todos aprovados; Mac externo recebeu 200 no IP `187.77.36.156`;
- worker: processo vivo, segredo canônico e fila 200 em 0,91 s sem long-poll;
- evento existente: o Google confirmou o novo `fileUrl` sem notificação e sem reprocessar o conteúdo;
- suíte: 397 testes passaram; permanece excluído somente o baseline conhecido `contrato-brain.test.ts`.

## 11. Provas exigidas do hotfix 1.2

- teste vermelho antes do código para retry de `UND_ERR_SOCKET` na conclusão;
- teste verde prova exatamente duas chamadas e retorno da segunda;
- teste negativo prova que resposta HTTP e consulta da fila não são repetidas;
- source guard prova `Connection: close` em todas as chamadas do worker;
- log de causa contém somente código e mensagem limitados, sem header, corpo ou identidade do lead;
- testes focados, suíte, lint e build executados;
- release e processo do worker confirmados no caminho vivo;
- booking da KSG concluído, anexo confirmado e fila morta limpa;
- nenhum novo alerta `funil-diagnostico/roteiro` após o reprocessamento.

### Evidência local executada

- teste vermelho: import do cliente HTTP inexistente bloqueou antes da implementação;
- teste verde: 6 casos do worker passaram, incluindo retry único, fila sem retry, HTTP sem retry e erro permanente sem retry;
- regressão adjacente: 19 casos da descrição idempotente do evento passaram;
- lint tocado: zero erro nos dois scripts e no teste modificados;
- build: Next 15.5.25 compilou e listou 40 rotas;
- suíte: 401 testes passaram; `contrato-brain` manteve a divergência conhecida de `perdido-stand-by`; o import de `validate-env.mjs` falhou somente no checkout CRLF e passou no worktree-base LF;
- lint completo: os dois erros de `require()` do build do Club também reproduzem no commit-base;
- SCA: o PostCSS transitivo do Next tem advisory novo e o único remédio sugerido pelo npm é Next 16; sem mudança de dependência nesta fatia, fica fora do hotfix e não é ocultado.
