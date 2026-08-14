# Phase 1 - Como validar de ponta a ponta

**Feature**: `001-funil-diagnostico-captura` | **Data**: 2026-08-14

Guia de validação, não de implementação. O que prova que a feature funciona.

---

## Pré-requisitos

- Node instalado. O clone precisa de `npm install` na primeira vez, porque o repositório não versiona `node_modules`.
- Vercel Postgres provisionado e `POSTGRES_URL` no ambiente local.
- Um tipo de evento de 1 hora criado no Cal.com, com intervalo de 1 hora entre agendamentos, apontando para a agenda compartilhada.
- `CAL_WEBHOOK_SECRET` igual ao configurado no painel do Cal.com.

---

## Check automático, o que o agente roda sozinho

```bash
npm run lint && npx tsc --noEmit && npx vitest run
```

Este é o portão do princípio VIII da constitution. Precisa passar antes de qualquer entrega.

O que cada parte prova:

- `lint` e `tsc` provam que compila e respeita as regras de tipo. Não provam comportamento.
- `vitest` prova o que importa: que o score classifica nas faixas certas nas fronteiras, que os cortes duros vencem score alto, e que os 6 critérios do ICP têm cobertura de pergunta.

---

## Validação manual, os quatro caminhos

Rodar `npm run dev` e abrir `/diagnostico`.

### Caminho 1: lead qualificado

Responder como empresa, processo diário, descrição longa do processo, três consequências incluindo dinheiro e prazo, duas fontes digitais, dono nomeado, decide sozinho, acesso sem problema.

**Esperado**: seletor de horários do Cal.com aparece na mesma tela. Marcar um horário. Conferir que o evento entrou na agenda e que a confirmação diz que não há proposta nem preço na call e que o mapa vem no fim.

### Caminho 2: revisão humana

Mesma coisa, mas com decisão que depende da diretoria e acesso que precisa passar por alguém.

**Esperado**: nenhum seletor de horário, nenhuma oferta, nenhuma palavra que soe a recusa. O time é notificado.

### Caminho 3: não-ICP de empresa

Processo esporádico, ou sem dono e sem poder de decisão.

**Esperado**: recusa honesta com a oferta do Mapa de IA de R$ 197. Nenhuma menção a desqualificação, reprovação ou critérios não atendidos.

### Caminho 4: uso pessoal

Marcar uso pessoal na segunda pergunta.

**Esperado**: o formulário encurta na hora, termina em 5 perguntas, e o destino é o Kit Segundo Cérebro de R$ 67. Nunca vê agendamento.

---

## Validação do webhook

```bash
node -e "const c=require('crypto');const b=process.env.B;console.log(c.createHmac('sha256',process.env.S).update(b).digest('hex'))"
```

Usar o hash como header `x-cal-signature-256` e postar o corpo em `/api/diagnostico/cal-webhook`.

**Esperado**: 200 com o agendamento vinculado ao lead. Trocar um caractere do hash e repetir: **401**, sem nada persistido.

---

## Validação de retomada

Responder metade, fechar a aba, reabrir a mesma URL.

**Esperado**: a conversa retoma no ponto certo com as respostas anteriores. Consultar `parciais`: o registro existe e não aparece em `leads`.

---

## Validação de consentimento

Chegar na tela de envio sem marcar a caixa.

**Esperado**: botão inativo. Forçando a chamada da API sem a marca de consentimento: **400** com `consent_required`, e nada persistido.

---

## Validação de privacidade

Percorrer o fluxo inteiro com o inspetor de rede aberto.

**Esperado**: nenhum dado pessoal em query string. Nos logs do servidor, nenhum nome, e-mail ou telefone, nem em caso de erro.

---

## Validação no ambiente real do tráfego

Abrir a rota pelo navegador embutido do Instagram, em celular.

**Esperado**: a primeira pergunta aparece sem depender de JavaScript ter rodado, não há rolagem horizontal, e o embed do Cal.com carrega. Este teste é obrigatório: é por onde entra a maior parte dos leads, e é o ambiente mais restrito da lista.

---

## Validação de falha do Cal.com

Bloquear o domínio do Cal.com no navegador e percorrer o caminho de lead qualificado.

**Esperado**: o lead não vê erro cru. Vê um caminho alternativo que preserva o contato, e o registro fica marcado como qualificado sem agendamento.

---

## O que ainda não é validável aqui

A promessa do mapa na tela de abertura só é verdadeira quando a feature `002` estiver entregando. Enquanto ela não existir, esta feature **não vai a produção**, por FR-032. O teste de que a promessa se cumpre mora no quickstart da `002`.
