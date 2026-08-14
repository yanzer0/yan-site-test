# Provisionar o banco: os quatro passos

**Feature**: `001-funil-diagnostico-captura` | **Data**: 2026-08-14

Só o passo 1 e o 2 exigem você. O 3 e o 4 são um comando cada.

**Por que não fiz sozinho:** o `vercel login` usa device code no navegador, e o `vercel integration accept-terms` declara exigir "an interactive terminal and human confirmation". São gates humanos por desenho. Autenticar e aceitar termos em nome de outra pessoa não é coisa que eu faça.

---

## 1. Autenticar o CLI

```bash
vercel login
```

Abre o navegador com um código. Autoriza e pronto. O CLI já está na versão 59.0.0 nesta máquina.

Para conferir depois: `vercel whoami` deve responder teu usuário.

---

## 2. Instalar a integração de Postgres

O produto "Vercel Postgres" **não existe mais**. A documentação oficial diz que as bases foram movidas para o Neon em dezembro de 2024, e hoje se instala uma integração de Postgres pelo Marketplace.

**Pelo painel, que é o caminho mais curto:** abrir o projeto `yan-site-test` na Vercel, aba **Storage**, **Create Database**, escolher **Neon**, e conectar ao projeto. O plano gratuito do Neon serve com folga para o volume esperado, que é dezenas de leads por mês.

**Ou por CLI**, já que você tem terminal interativo:

```bash
vercel integration discover postgres
```

Isso lista os provedores disponíveis com o slug exato de cada um. Escolhido o slug, `vercel integration add <slug>` instala.

Prefiro te dar o comando de descoberta em vez de chutar o slug: não consigo verificar a lista sem estar autenticado, e comando chutado é como as coisas quebram.

**O que importa no fim deste passo:** o projeto precisa ficar com `POSTGRES_URL` nas variáveis de ambiente. Confere em Settings, Environment Variables.

---

## 3. Trazer as variáveis para a máquina

Na raiz do clone principal (`C:\Users\PC\Documents\GitHub\yan-site-test`), que é o que está linkado ao projeto:

```bash
vercel env pull .env.local
```

---

## 4. Aplicar o schema

No worktree da feature (`C:\Users\PC\Documents\GitHub\yan-site-funil`), com o `.env.local` copiado para lá ou apontando para ele:

```bash
node --env-file=.env.local scripts/diagnostico/aplicar-schema.mjs
```

O script aplica os 15 statements e **prova o resultado**: no fim, consulta o `information_schema` e lista o que existe de verdade, mais o índice único de deduplicação. Se faltar qualquer tabela, sai com código 2.

É seguro rodar mais de uma vez. Todo statement do schema é idempotente.

Saída esperada:

```
  15 statements aplicados.

  Tabelas no banco:
    [x] leads
    [x] respostas
    [x] avaliacoes
    [x] parciais
    [x] agendamentos
    [x] exclusoes
    [x] indice de deduplicacao leads_contato_unico

  Schema aplicado e verificado.
```

---

## Depois disso

O formulário passa a persistir. Para provar de ponta a ponta, com o dev server rodando:

```bash
curl -X POST http://localhost:3100/api/diagnostico/submit -H "Content-Type: application/json" -d "{\"consentimento\":true,\"origem\":\"instagram\",\"contato\":{\"nome\":\"Teste Ponta a Ponta\",\"email\":\"teste@exemplo.com\",\"whatsapp\":\"11988887777\",\"empresa\":\"ACME\",\"papel\":\"dono\"},\"respostas\":{\"tipo_uso\":\"empresa\",\"frequencia\":\"todo_dia\"}}"
```

Hoje isso devolve **500 `storage_failed`**, que é o comportamento certo sem banco. Com o banco no ar, passa a devolver a faixa.

## O que ainda falta além do banco

O `CAL_WEBHOOK_SECRET` e o `NEXT_PUBLIC_CAL_URL`, que dependem de criar o tipo de evento no Cal.com. Sem eles o agendamento não aparece, mas o resto do formulário funciona.
