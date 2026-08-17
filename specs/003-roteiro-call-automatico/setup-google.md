# Setup da service account do Google Calendar

**Feature**: `003-roteiro-call-automatico` | **Data**: 2026-08-17

Isto é o que só você consegue fazer. São cinco passos no console do Google e o resultado é um arquivo JSON que eu configuro como variável de ambiente.

**Por que service account e não OAuth:** o calendário INFUSER é um calendário compartilhado (`...@group.calendar.google.com`) dentro de uma conta Gmail pessoal. Service account funciona nesse caso sem Workspace nem domain-wide delegation: basta compartilhar o calendário com o e-mail dela, exatamente como você compartilharia com uma pessoa. OAuth exigiria refresh token que expira e precisa de você de novo.

**Por que não dá sem isso:** o Cal.com não tem endpoint para editar a descrição de um booking já criado. Verificado na API v2: existe reagendar, cancelar, confirmar, trocar local e adicionar convidado, mas não editar o corpo do evento. Então quem escreve o roteiro no card é a API do Google, direto.

---

## 1. Projeto no Google Cloud

Em `console.cloud.google.com`, use um projeto existente ou crie um novo. O brain registra que já existe um projeto **`infuser-painel`**, criado para o SSO do Painel OS. Serve, e evita mais um projeto para manter.

## 2. Ativar a Google Calendar API

No projeto escolhido: **APIs e serviços** → **Biblioteca** → procurar **Google Calendar API** → **Ativar**.

## 3. Criar a service account

**APIs e serviços** → **Credenciais** → **Criar credenciais** → **Conta de serviço**.

- Nome sugerido: `infuser-agenda`
- Não precisa conceder papel nenhum no projeto. O acesso vem do compartilhamento do calendário, no passo 5, e não de permissão de IAM.

Ao final, copie o **e-mail da conta de serviço**. Ele tem a cara de `infuser-agenda@infuser-painel.iam.gserviceaccount.com`.

## 4. Gerar a chave JSON

Na service account criada: aba **Chaves** → **Adicionar chave** → **Criar nova chave** → **JSON**.

O arquivo baixa uma vez só. Guarde e **não coloque em pasta do repositório**: o `.gitignore` cobre `.env*`, mas não um JSON solto.

## 5. Compartilhar o calendário INFUSER com ela

Este é o passo que dá o acesso, e é o mais fácil de esquecer.

No Google Agenda, ao lado do calendário **INFUSER**: **três pontinhos** → **Configurações e compartilhamento** → **Compartilhar com pessoas específicas** → **Adicionar pessoas**.

- Cole o e-mail da service account
- Permissão: **Fazer alterações em eventos**

Sem isso, a API responde 404 no calendário, e o erro parece "calendário não existe" quando na verdade é falta de permissão.

---

## O que eu faço depois

Você me passa o conteúdo do JSON (ou o caminho do arquivo) e eu:

1. Configuro como variável de ambiente na Vercel e no local, sem que ela toque o repositório
2. Ligo a escrita da descrição no evento
3. Provo com um agendamento de teste, conferindo o card no seu calendário

## Coordenadas já conhecidas

| | |
|---|---|
| Calendário INFUSER | `4fcaa5b9315ce7d51b35a89dcc33fbd7acbe990271281c13d83e8d5e86d2cc5a@group.calendar.google.com` |
| Event type no Cal.com | id `6672241`, slug `diagnostico` |
| Título do evento | `CALL - {Scheduler}` |
| Escopo necessário | `https://www.googleapis.com/auth/calendar.events` |

O escopo é só de eventos, não do calendário inteiro: a service account consegue editar evento, e não consegue apagar o calendário nem mexer em configuração.
