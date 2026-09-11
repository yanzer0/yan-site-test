# PRD: entrega do Segundo Cérebro Autônomo

## Problema

O produto e o guia existem apenas no disco local. Um comprador da Hubla ainda não recebe uma rota estável nem um caminho de reentrada.

## Usuário

Comprador não técnico que precisa instalar no Windows, macOS ou Linux usando Claude, Codex ou ambos.

## Requisitos funcionais

| ID | Requisito | Aceite |
|---|---|---|
| RF-01 | Servir o guia em `/instalar` | GET no apex e www responde 200 com o título correto |
| RF-02 | Servir o pacote | botão baixa ZIP válido e igual ao build aprovado |
| RF-03 | Criar produto na Hubla | produto ativo com acesso vitalício e pagamento único |
| RF-04 | Criar oferta padrão | checkout mostra R$147 |
| RF-05 | Criar oferta promocional | link direto mostra R$97 sem digitar cupom |
| RF-06 | Criar módulo “Comece aqui” | comprador encontra CTA para `/instalar` |
| RF-07 | Configurar pós-compra | pagamento aprovado leva à Área de Membros |
| RF-08 | Preservar atualização | novo deploy mantém a mesma URL e troca guia e ZIP juntos |

## Requisitos não funcionais

| ID | Meta | Prova |
|---|---|---|
| RNF-01 | zero PII e segredo no bundle | varredura e revisão dos ativos públicos |
| RNF-02 | sem overflow em 375 px | browser real |
| RNF-03 | zero erro de console | browser real |
| RNF-04 | rollback em uma tag anterior | runbook VPS |
| RNF-05 | página fora de busca | meta `noindex, nofollow` |

## Métricas iniciais

- compra aprovada que chega à Área de Membros;
- clique em “Abrir guia de instalação”;
- download do ZIP;
- pedidos de suporte por instalação.

## Rastreabilidade

RF-01, RF-02 e RF-08 ficam no site; RF-03 a RF-07 ficam na Hubla; todos convergem no UAT de compra.
