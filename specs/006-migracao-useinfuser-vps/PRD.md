---
tags: [engenharia, prd, migracao, disponibilidade]
status: ready
version: 1.0
updated: 2026-09-09
---

# PRD: migração do useinfuser.com para a VPS

## 1. Problema verificado

O host atual pausou a conta inteira depois que um long-poll contínuo consumiu três vezes a memória incluída no Hobby. O deployment está saudável, o que elimina build e DNS como causa do incidente. O site comercial não pode depender novamente desse teto compartilhado.

## 2. Usuários e contexto

| Usuário | Necessidade | Risco de dano |
|---|---|---|
| Visitante/lead | Acessar páginas, guias e diagnóstico | Perda de conversão e confiança. |
| Time Infuser | Operar `/leads`, roteiros e mapas | Indisponibilidade e atraso comercial. |
| Integrações Cal/Stripe | Entregar webhooks válidos | Perda ou atraso de eventos de negócio. |

## 3. Job to be done

Quando a Vercel estiver pausada, quero que o site completo rode na infraestrutura já paga da Infuser para manter páginas e fluxos de negócio disponíveis sem assinar Pro.

## 4. Resultado

- baseline: domínio retorna página de deployment pausado.
- meta: domínio e `www` retornam a aplicação pela VPS, com paridade funcional das 40 rotas do build.
- fonte: build, probes HTTP, headers, logs do Caddy e container.

## 5. Escopo e não objetivos

Inclui o aplicativo inteiro no mesmo commit e domínio, mais o corte operacional. Não inclui redesign, novo produto, migração do banco ou outros subdomínios.

## 6. Requisitos funcionais

| ID | Requisito | Prioridade | Critério de aceite |
|---|---|---|---|
| RF-01 | Servir apex e `www` pela VPS | MUST | TLS válido e resposta do release esperado. |
| RF-02 | Preservar todas as rotas públicas | MUST | Smoke test contra inventário do build. |
| RF-03 | Preservar APIs e webhooks | MUST | Rotas existem e falham fechadas sem credencial/assinatura. |
| RF-04 | Preservar `/leads` e demo protegida | MUST | Auth, CSP e `no-store` continuam ativos. |
| RF-05 | Eliminar long-poll contínuo | MUST | Nenhuma chamada mantém 25 s; worker pausa entre consultas. |
| RF-06 | Permitir deploy e rollback reproduzíveis | MUST | Runbook e imagem identificada por commit. |

## 7. Requisitos não funcionais

| ID | Requisito | Meta | Como provar |
|---|---|---|---|
| RNF-01 | Disponibilidade | Container reinicia sozinho | Matar processo em staging e observar health. |
| RNF-02 | Segurança | Zero segredo no Git/imagem; processo não-root | Scan de diff, inspect de imagem e usuário. |
| RNF-03 | Isolamento | Rede dedicada, sem porta publicada | `docker inspect` e socket externo. |
| RNF-04 | Capacidade | Memória limitada a 1,5 GiB; CPU a 1,5 | Compose e observação pós-corte. |
| RNF-05 | Operabilidade | Healthcheck e logs sem PII | `/api/health`, `docker logs`, Caddy. |
| RNF-06 | Compatibilidade | Node 24 e Next 15 patch seguro | Build e testes. |

## 8. Dependências e riscos

| Item | Tipo | Estado | Dono | Mitigação |
|---|---|---|---|---|
| DNS Hostinger | dependência | acesso não provado | Yan | Preparar tudo e fazer handoff apenas se login for exigido. |
| Caddy compartilhado | risco | vivo | Codex | Backup, validate, reload e rollback de arquivo. |
| Neon externo | dependência | vivo na Vercel | Codex | Probe de leitura sem mutação. |
| Reboot da VPS | risco | causa externa pendente | Yan | restart policy e monitor externo. |

## 9. Métricas e sinais de dano

| Métrica | Meta | Janela | Regra de decisão |
|---|---:|---|---|
| HTTP 5xx | 0 no smoke | corte + 15 min | Qualquer 5xx crítico aborta. |
| Healthcheck | healthy | contínuo | 3 falhas consecutivas abortam. |
| RSS do container | < 1,2 GiB | 15 min | Crescimento contínuo aborta. |
| Rotas públicas | 100% inventariadas | pré e pós-DNS | Falha em qualquer rota bloqueia corte. |

## 10. Critérios de aceite

1. O caminho público real serve o release da VPS com TLS válido.
2. Nenhuma subpágina inventariada some ou perde assets.
3. Entradas protegidas permanecem fechadas sem credenciais.
4. O poll que causou o incidente não pode reaparecer por configuração.

## 11. Rastreabilidade

| Requisito | Arquitetura | Fatia | Prova |
|---|---|---|---|
| RF-01 | ARQUITETURA §4 | W3/W4 | DNS, TLS e release header. |
| RF-02 | ARQUITETURA §5 | W2/W4 | Smoke de rotas. |
| RF-03/RF-04 | ARQUITETURA §6 | W2/W4 | Probes negativos e headers. |
| RF-05 | CONTRATOS §2 | W1 | Teste de regressão e log do worker. |
| RF-06 | PLANO §8-9 | W3/W4 | Runbook e rollback ensaiado. |
