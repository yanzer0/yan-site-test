# Plano de implementação

## DAG e ondas

- W1: congelar fatos dos áudios, checkouts e padrão de rota. Concluído.
- W2: criar documentos HTML e rotas. Depende de W1.
- W3: inspeção estática, lint e build. Depende de W2.
- W4: deploy em `main`, verificar produção e QA visual. Depende de W3.

Caminho crítico: W1 -> W2 -> W3 -> W4. A execução é serial porque cada onda consome o artefato da anterior. Não há trabalho independente que justifique paralelo.

## Rollout e rollback

Push único para `main`, deploy imutável da Vercel e smoke test imediato. Em falha, `git revert` do commit da rota restaura o estado anterior, no qual `/pos` era 404.

## Rastreabilidade

- FR-01/02 -> AC-01
- FR-03 -> AC-02
- FR-04/05 -> AC-03
- FR-06 e NFRs -> AC-04
