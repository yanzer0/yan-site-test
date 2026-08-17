# Duas ações no Google, um minuto cada

Sem elas o roteiro não pode ser anexado com segurança. Tudo o mais eu construo sozinho.

## Por que o Drive, e não um link nosso

Testei em 17/08: o Google Calendar **aceita** anexo com URL de fora do Drive. Grava, mostra o ícone, funciona.

E é justamente por isso que não serve. O lead é convidado do evento da call. Ele vê o anexo e **clica**. Se o anexo é um link nosso, ele lê o roteiro — "revela trauma e o que NÃO propor", "a resposta DELE é o fechamento". É o mesmo vazamento que a gente acabou de fechar, entrando por outra porta.

Com o arquivo no Drive, quem controla o acesso é o Google: o lead vê que existe um anexo, clica, e recebe **"Você precisa de permissão"**. Você, o Pedro e o Iago abrem direto, inclusive no celular. Não é código nosso segurando a porta, é a ACL do Google.

---

## Ação 1: ligar a Drive API

Link direto, já abre na tela certa e no projeto certo:

**https://console.developers.google.com/apis/api/drive.googleapis.com/overview?project=326820948094**

Clique em **Ativar** / **Enable**.

É o mesmo projeto `infuser-painel` onde a conta de serviço já vive. O erro que eu levei ao testar foi literalmente este:

```
Google Drive API has not been used in project 326820948094 before or it is disabled.
```

A propagação leva um ou dois minutos depois de ativar.

## Ação 2: criar a pasta e compartilhar com a conta de serviço

A conta de serviço não tem espaço de Drive próprio (isso é do Google, não configuração nossa). Ela precisa gravar **dentro de uma pasta sua** — e aí o arquivo conta no seu Drive, que é onde faz sentido ele estar.

1. Abra **https://drive.google.com/drive/my-drive**
2. **Novo** → **Nova pasta** → nome: `Roteiros de Call`
3. Clique com o botão direito na pasta → **Compartilhar**
4. Cole:

   ```
   infuser-agenda@infuser-painel.iam.gserviceaccount.com
   ```

5. Permissão: **Editor** (ela precisa criar arquivo lá dentro)
6. **Enviar**

Não espere e-mail de confirmação: conta de serviço não tem caixa de entrada. O acesso vale na hora.

7. Entre na pasta e **copie o id da URL**. Ela fica assim:

   ```
   https://drive.google.com/drive/folders/1AbCdEfGhIjKlMnOpQrStUvWxYz
                                          └────────── isto ──────────┘
   ```

## Ação 3 (opcional, recomendada): dar acesso ao Pedro e ao Iago

Ainda em **Compartilhar**, adicione os dois como **Leitor**. Sem isso, só você abre o roteiro — e a call pode ser conduzida por qualquer um dos três.

---

## O que me mandar

Só o id da pasta. Ele não é segredo (sem permissão ninguém abre), então pode colar aqui mesmo.

---

## O que acontece depois, automático

```
lead agenda no Cal.com
   └─ webhook enfileira (Vercel)
        └─ a VPS pega em segundos
             ├─ grava o card do cliente no brain
             ├─ gera o roteiro com o /call-roteiro
             ├─ valida (exit 0 obrigatório)
             ├─ converte pra PDF no Gotenberg
             ├─ sobe na pasta Roteiros de Call
             └─ anexa no evento da call
```

Você abre o evento, clica no anexo, lê. O lead vê o anexo e esbarra em "solicitar acesso".

## O que ainda vai ficar de fora

O lead **vê que existe um anexo** e o nome dele. Isso não dá para esconder: anexo é parte do evento, e o evento é compartilhado. O que dá para garantir é que ele não abre o conteúdo.

Por isso o arquivo se chama `Preparo - <empresa> - Call 1.pdf`, e não "roteiro de vendas": um cliente ver que a Infuser preparou a conversa dele é bom sinal. O que não pode é ele ler as falas.
