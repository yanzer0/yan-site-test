# ADR: Hubla como porta e guia público no site Infuser

## Status

accepted

## Contexto

O comprador precisa de acesso persistente e simples. Enviar ZIP por e-mail ou WhatsApp envelhece. Construir autenticação própria duplicaria a Hubla e aumentaria suporte. O arquivo baixado continua compartilhável mesmo com login.

## Decisão

A Hubla controla compra e reentrada na área externa. A oferta padrão usa R$147 como preço-base e R$97 como preço promocional automático. O pós-compra e a área externa apontam para `https://useinfuser.com/instalar`, que serve o guia público com o ZIP vigente.

## Consequências

- acesso inicial simples e reentrada pela Hubla;
- atualização do guia sem trocar a URL;
- sem backend ou segredo novo;
- a URL e o ZIP podem ser compartilhados, risco aceito para esta primeira versão;
- revogação externa exige uma fatia futura com webhook e token individual.

## Rollback

Desativar o produto; restaurar a tag anterior do site. Não há migration nem dado novo no site.

## Reconsiderar quando

- compartilhamento não autorizado gerar perda mensurável;
- houver assinatura recorrente ou conteúdo revogável;
- suporte exigir identificação do comprador no guia.
