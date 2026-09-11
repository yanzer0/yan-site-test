# ADR: Hubla como porta e guia público no site Infuser

## Status

accepted

## Contexto

O comprador precisa de acesso persistente e simples. Enviar ZIP por e-mail ou WhatsApp envelhece. Construir autenticação própria duplicaria a Hubla e aumentaria suporte. O arquivo baixado continua compartilhável mesmo com login.

## Decisão

A Hubla controla compra e acesso ao módulo. O módulo aponta para `https://useinfuser.com/instalar`, que serve um guia público com o ZIP vigente. O CTA promocional usa uma oferta direta de R$97; a oferta padrão de R$147 permanece como âncora e alternativa standalone.

## Consequências

- acesso inicial simples e reentrada pela Hubla;
- atualização do guia sem trocar a URL;
- sem backend ou segredo novo;
- a URL e o ZIP podem ser compartilhados, risco aceito para esta primeira versão;
- revogação externa exige uma fatia futura com webhook e token individual.

## Rollback

Desativar as ofertas e o módulo; restaurar a tag anterior do site. Não há migration nem dado novo no site.

## Reconsiderar quando

- compartilhamento não autorizado gerar perda mensurável;
- houver assinatura recorrente ou conteúdo revogável;
- suporte exigir identificação do comprador no guia.
