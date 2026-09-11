# Verificação e operação

## Matriz

| Caso | Esperado |
|---|---|
| sem cookie | tela de acesso, sem guia |
| cookie de outro produto | negado |
| GET magic link duas vezes | ambos mostram confirmação |
| POST magic link duas vezes | 303 e depois 400 |
| sessão ativa | guia e JS 200 |
| sessão ativa + download | ZIP e hash corretos |
| reembolso | mesma sessão e download negados |
| e-mail desconhecido | mesma resposta do conhecido |
| MCP indisponível | 503 próprio, sem conteúdo |

## Gates

- testes do MCP, regressão da A Legião e CI completo;
- testes do Next, build, smoke e caminhos antigos 404;
- browser em 1440 e 375, teclado, console e download;
- n8n com pin data e execução real controlada;
- produção em apex e www;
- logs sem PII, código, cookie ou segredo.

## Rollout

1. Subir MCP com segredo dedicado e tenant, sem workflow ativo.
2. Provar API local e em produção por comando controlado.
3. Subir site protegido.
4. Confirmar que o ZIP público antigo retorna 404.
5. Ativar workflow e regra Hubla.
6. Executar grant, ativação, download e revoke controlados.

Compra real exige confirmação financeira separada.
