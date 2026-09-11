# Dados e APIs: entrega do Segundo Cérebro Autônomo

## Autoridade

| Dado | Autoridade | Classificação |
|---|---|---|
| produto, ofertas, preço e comprador | Hubla | comercial e pessoal |
| HTML, imagens e ZIP | Git e release do site | público por URL |
| progresso do wizard | `localStorage` do navegador | local, não sensível |

## APIs e persistência

Nenhuma tabela, migration ou API nova. O Route Handler responde apenas `GET /instalar`; os ativos são arquivos estáticos. O site não recebe dados da compra nem identifica o comprador.

## Retenção e logs

- nenhum dado pessoal é gravado pelo guia;
- logs HTTP devem registrar caminho e status, nunca query com token;
- Hubla mantém seu próprio ciclo de dados e acesso.

## Capacidade

O maior custo é transferência dos PNGs. As imagens continuam carregadas sob demanda pelo passo; o ZIP tem menos de 100 KB. Não há trabalho assíncrono nem chamada de banco.
