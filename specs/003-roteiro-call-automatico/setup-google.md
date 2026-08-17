# Setup da service account do Google Calendar, clique a clique

**Feature**: `003-roteiro-call-automatico` | **Verificado na documentação oficial em 17/08/2026**

Cinco passos. O resultado é um arquivo JSON que eu configuro como variável de ambiente.

Os rótulos abaixo saíram da documentação oficial do Google, não de memória. A interface pode aparecer em português na sua conta, então cada rótulo vem com as duas versões.

**Por que service account e não OAuth:** o calendário INFUSER é um calendário compartilhado dentro de uma conta Gmail pessoal. Service account funciona aí sem Workspace e sem domain-wide delegation: basta compartilhar o calendário com o e-mail dela, como se fosse uma pessoa. OAuth exigiria refresh token, que expira e volta a depender de você.

**Por que precisa disso:** o Cal.com não tem endpoint para editar a descrição de um booking já criado. Verifiquei na API v2, existe reagendar, cancelar, confirmar, trocar local e adicionar convidado, mas não editar o corpo do evento. Quem escreve o roteiro no card é a API do Google, direto.

---

## Passo 1: ativar a Google Calendar API

Link direto, já abre na tela de ativar:

**https://console.cloud.google.com/flows/enableapi?apiid=calendar-json.googleapis.com**

Escolha o projeto **`infuser-painel`**, que já existe (foi criado para o SSO do Painel OS). Reaproveitar evita mais um projeto para manter.

Clique em **Ativar** / **Enable**.

## Passo 2: criar a service account

Link direto para a tela de criação:

**https://console.cloud.google.com/projectselector/iam-admin/serviceaccounts/create?walkthrough_id=iam--create-service-account**

- Selecione o projeto `infuser-painel`
- **Nome da conta de serviço** / *Service account name*: `infuser-agenda`
- O **ID** é gerado sozinho. Precisa ter entre 6 e 30 caracteres, minúsculas e hífens
- **Descrição** (opcional): `Escreve o roteiro da Call 1 no card do evento`

Na tela seguinte, o Google oferece conceder papéis IAM. **Pule.** Clique em **Concluir** / **Done** sem escolher papel nenhum.

Isso não é economia de passo: o acesso vem do compartilhamento do calendário, no passo 4, e não de permissão no projeto. Dar papel de IAM aqui só ampliaria o alcance da conta sem necessidade.

Ao terminar, **copie o e-mail da conta de serviço**. Ele tem a forma:

```
infuser-agenda@infuser-painel.iam.gserviceaccount.com
```

## Passo 3: gerar a chave JSON

Ainda na lista de contas de serviço:

1. Clique no **endereço de e-mail** da conta que você acabou de criar
2. Abra a aba **Chaves** / *Keys*
3. Clique em **Adicionar chave** / *Add key* e escolha **Criar nova chave** / *Create new key*
4. Selecione **JSON** como tipo e clique em **Criar** / *Create*

🔴 **O download acontece uma vez só.** A documentação é explícita: depois de baixar, não dá para baixar de novo. Se perder, o caminho é apagar a chave e criar outra.

Guarde o arquivo **fora de qualquer pasta de repositório**. O `.gitignore` cobre `.env*`, mas não pega um JSON solto com outro nome.

## Passo 4: compartilhar o calendário INFUSER com ela

Este é o passo que dá o acesso de verdade, e é o mais fácil de esquecer.

No **Google Agenda**, na lista à esquerda:

1. Passe o mouse sobre o calendário **INFUSER** e clique nos **três pontinhos** (*More* / *Mais*)
2. **Configurações e compartilhamento** / *Settings and sharing*
3. No painel esquerdo, **Compartilhar com pessoas específicas** / *Shared with*
4. **Adicionar pessoas e grupos** / *Add people and groups*
5. Cole o e-mail da service account
6. Em permissão, escolha **Fazer alterações nos eventos** / *Make changes and see all event details*
7. **Enviar** / *Send*

Dois avisos que evitam confusão:

**Não espere e-mail de confirmação.** Compartilhamento normalmente manda convite para a pessoa aceitar, mas service account não tem caixa de entrada nem clica em link. O acesso vale na hora.

**Se faltar este passo, a API responde 404** e a mensagem parece dizer que o calendário não existe. É falta de permissão, não calendário errado. Se der 404 na hora de testar, o primeiro lugar a olhar é aqui.

## Passo 5: me mandar a chave

Duas formas, e a segunda é melhor:

**Melhor:** salve o JSON em algum lugar fora do repositório e me diga o caminho. Eu leio, configuro na Vercel e no ambiente local, e o conteúdo nunca passa pelo chat.

**Alternativa:** colar o conteúdo aqui. Funciona, mas a chave fica no histórico, e essa chave dá acesso de escrita ao calendário. Se fizer assim, dá para revogar depois em **Chaves** e gerar outra.

---

## Se aparecer erro de política

Algumas organizações bloqueiam criação de chave de service account pela restrição `iam.disableServiceAccountKeyCreation`. Isso vale para contas de organização, e a sua é Gmail pessoal, então não deve aparecer. Se aparecer, me avisa que existe caminho alternativo com Workload Identity.

## Coordenadas que eu já tenho

| | |
|---|---|
| Calendário INFUSER | `4fcaa5b9315ce7d51b35a89dcc33fbd7acbe990271281c13d83e8d5e86d2cc5a@group.calendar.google.com` |
| Event type no Cal.com | id `6672241`, slug `diagnostico` |
| Título do evento | `CALL - {Scheduler}` |
| Escopo que vou usar | `https://www.googleapis.com/auth/calendar.events` |

O escopo é só de eventos: a conta consegue editar evento, e não consegue apagar o calendário nem mexer em configuração de compartilhamento.
