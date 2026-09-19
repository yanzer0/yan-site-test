---
work_order: WO-FORMULARIO-DB-004
status: active
central_branch: claude/formulario-db-f4
owner: Opus 5 (executor) / Claude (validador)
authorized_by: Yan
authorized_at: 2026-09-19
scope_lock:
  version: 1
  base_commit: 76ee39835752bf015e848899cf7e52d677dae1f9
  allowed_write_globs:
    - .planning/work-orders/WO-FORMULARIO-DB-004.md
    - deploy/vps/formulario-db/**
    - deploy/vps/README.md
    - specs/008-formulario-db-postgres-vps/**
  architecture_delta:
    production_files:
      - deploy/vps/formulario-db/backup.sh
      - deploy/vps/formulario-db/restore-drill.sh
      - deploy/vps/formulario-db/contar-tabelas.sh
    runtime_dependencies: []
    public_contracts: []
    persistence_surfaces:
      - diretorio ~/backups/formulario/ na VPS (700), dumps cifrados
    background_jobs:
      - cron diario backup-formulario 03:15 na VPS
  acceptance_ids:
    - AC-05
    - AC-06
  stop_when:
    - AC-05
    - AC-06
  passed_acceptance_ids: []
---

# WO-FORMULARIO-DB-004: F3 (restore drill do dump do Neon) e F4 (backup cifrado com drill)

## Autorização

Yan, 19/09/2026: "go pra todas, vá até o fim". Pacote: `specs/008-formulario-db-postgres-vps/`
(`README.md` decisões 6 e 7 e superfícies protegidas, `DADOS-E-APIS.md` §4, §6, §8,
`PLANO-DE-IMPLEMENTACAO.md` §3 e §4 F3 + F4, `VERIFICACAO-E-OPERACAO.md` §2, §4, §8,
`INVENTARIO-F0.md`). F1 está viva na VPS: `formulario-db` (`postgres:17.11`) healthy, rede
`formulario-net`, role `formulario`, extensão `pgcrypto`, secrets em
`/home/infuser/.config/useinfuser/formulario-db-{admin,app}.password`.

## Escopo

- F3: dump `-Fc` do Neon vivo com `pg_dump` 17 rodando na VPS, restore num container
  descartável `postgres:17.11` (mesma role, banco e extensão que o init da F1 cria), prova por
  contagem de linhas por tabela e `last_value` da sequência (origem = destino no instante do
  dump), depois container e volume apagados. O `formulario-db` de produção NÃO recebe o dump
  nesta ordem (isso é a F5).
- F4: `deploy/vps/formulario-db/backup.sh` (dump `-Fc` do `formulario-db` por `docker exec`,
  resumo de contagens ao lado, sha256, `age -R ~/.config/age/recipients.txt`, remove o dump em
  claro, retenção 14 dias, falha alta), `restore-drill.sh` (restaura num container descartável e
  compara contagens com o resumo), `contar-tabelas.sh` (helper `tabela,linhas` ordenado, usado
  nos dois lados), cron diário 03:15 com alerta `ops-alert.sh` em falha, alerta provado com
  falha forçada, primeiro drill real, seção no `deploy/vps/README.md`.

## Fora do escopo

Env do site, Caddy, worker, código de `src/` ou `scripts/diagnostico`, o `formulario-db` de
produção (só leitura para o backup), o Neon (só leitura). Nunca `compose down`, nunca `-v` em
volume de produção, nunca apagar `formulario-db-data`.

## Critérios de aceite

| ID | Critério | Prova exigida |
|---|---|---|
| AC-05 | Dump do Neon restaura num container descartável com `--exit-on-error` e as 14 contagens + a sequência batem com a origem no instante do dump; container e volume de teste removidos | saída do `diff` (vazia) entre `contar-tabelas` da origem e do destino, `pg_restore --list` com 14 tabelas, `docker ps -a` e `docker volume ls` sem o descartável ao fim, `df -h /` antes e depois |
| AC-06 | Backup cifrado do `formulario-db` no cron com sha256 válido, alerta em falha provado, restore drill provado | `crontab -l` com a linha; `ls -la ~/backups/formulario/` com `.dump.age`, `.sha256`, `.resumo` e sem `.dump` em claro; `sha256sum -c`; saída do drill com `diff` vazio; prova do alerta (falha forçada dispara `ops-alert.sh`, depois limpo); `df -h /` |

## Evidência

Executada em 2026-09-19 na VPS (`vps-infuser`) como `infuser`. Checkout de produção
`/home/infuser/useinfuser-site` movido de `ef861b299f88` para `fb14957dbd2f` (só documentos e os
três scripts desta fatia; nada foi construído nem reiniciado). Nenhuma senha, URL de conexão,
conteúdo de env, e-mail ou linha de dado aparece abaixo: só nomes de tabela, contagens, tamanhos
e códigos.

### AC-05: restore drill do dump do Neon

`df -h /` antes: `193G 156G 38G 81%`. Diretório criado com `mkdir -m 700`:
`/home/infuser/backups/formulario 700 infuser:infuser`.

**Dump.** `docker run --rm -e NEON_URL -v /home/infuser/backups/formulario:/out postgres:17.11 sh -c 'pg_dump "$NEON_URL" -Fc -f /out/neon-<utc>.dump'`,
com `NEON_URL` lida só da chave `POSTGRES_URL_NON_POOLING` para dentro de uma variável da própria
sessão (141 caracteres, conteúdo nunca impresso, nunca em argv, nunca em arquivo).

```
neon-20260919T072030Z.dump   240.549 bytes   real 0m13,143s
```

Os 13 s são a rede até `us-east-1`, não o volume (9,2 MB). O orçamento de 10 s de
`DADOS-E-APIS.md` §9 vale para o dump local por `docker exec`, que mediu 0,2 s na F4.

**`pg_restore --list`:** 14 entradas `TABLE DATA`, as 14 tabelas do `INVENTARIO-F0.md`
(`agendamentos`, `avaliacoes`, `exclusoes`, `leads`, `mapa_achados`, `mapas`, `painel_config`,
`parciais`, `pedidos_mapa`, `respostas`, `roteiros`, `sessoes_painel`, `tentativas_acesso`,
`usuarios_painel`). Fora delas o TOC tem 28 `TABLE`, 23 `INDEX`, 20 `CONSTRAINT`, 9 `FK`,
3 `SEQUENCE`, 3 `DEFAULT`, 1 `EXTENSION`, 1 `COMMENT`.

**Contagem da origem no mesmo instante** (helper `contar-tabelas.sh` com o `psql` num
`docker run` e a URL só em variável de ambiente; 1,4 s, uma única conexão):

```
agendamentos,23      exclusoes,0        painel_config,1    respostas,536      tentativas_acesso,2
avaliacoes,80        leads,77           parciais,44        roteiros,22        usuarios_painel,3
mapa_achados,0       mapas,0            pedidos_mapa,1     sessoes_painel,17
seq:tentativas_acesso_id_seq,118
```

Soma 806 linhas, idêntica ao `INVENTARIO-F0.md`: o vivo não cresceu entre a F0 e a F3.

**Restore descartável.** Container `formulario-restore-f3`, `postgres:17.11`, `--network none`,
volume nomeado `formulario-restore-f3`, `POSTGRES_PASSWORD=descartavel`, pronto em 2 s. Role e
banco iguais aos do init da F1:

```
$ psql -Atc "select rolname,rolsuper,rolcreatedb,rolcreaterole from pg_roles where rolname='formulario'"
formulario|f|f|f
$ psql -d formulario -Atc "select extname from pg_extension"
plpgsql
pgcrypto
```

**Duas falhas reais, nesta ordem, antes do verde** (o `--exit-on-error` pegou as duas e o banco
foi recriado limpo entre as tentativas):

1. sem flag nenhuma:
   `ERROR: must be owner of extension pgcrypto` em `COMMENT ON EXTENSION pgcrypto IS ...`, exit 1.
   Estado após a falha: `0` tabelas em `public`, ou seja, parou antes de qualquer dado.
2. com `--no-comments`:
   `ERROR: role "neon_superuser" does not exist` em
   `ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;`, exit 1.
   Esta não estava prevista no pacote: é ACL de role de plataforma do Neon. O remédio previsto
   (`pg_restore -l` + `-L`) não serve, porque `--list` nem mostra entradas de ACL; a flag
   `--no-acl` serve, e não descarta nada de útil, já que `--no-owner --role=formulario` faz a
   propriedade ser o modelo de acesso inteiro.
3. com `--no-comments --no-acl`: **exit 0**, `real 0m0,216s`.

**Diff origem contra destino: vazio.** As 15 linhas do destino são iguais, caractere a caractere,
às 15 da origem (14 tabelas + `seq:tentativas_acesso_id_seq,118`). Dono das tabelas no destino:
`formulario` (uma só linha em `select distinct tableowner`). Extensões: `pgcrypto`, `plpgsql`.

**Contraexemplo obrigatório.** Uma linha plantada em `painel_config` no descartável e o diff
acusa, com exit 1:

```
7c7
< painel_config,1
---
> painel_config,2
```

**Descartável apagado.** `docker rm -f formulario-restore-f3 && docker volume rm formulario-restore-f3`;
`docker ps -a` e `docker volume ls` filtrados por `formulario-restore-f3` devolvem `0` e `0`.
`formulario-db` de produção seguiu `healthy` e com `0` tabelas em `public`: o restore de produção
é a F5, não esta ordem.

`df -h /` depois: `193G 156G 38G 81%`.

### AC-06: backup cifrado com drill e alerta

**Arquivos.** `deploy/vps/formulario-db/contar-tabelas.sh`, `backup.sh` e `restore-drill.sh`, os
três `100755` no índice do git (o bit de execução precisa ser posto à mão, porque o worktree é
Windows e o cron do Linux depende dele).

**Cron.** Backup do crontab antes de editar: `/home/infuser/backups/crontab.bak.20260919T072922Z`
(21 linhas). Depois, 22 linhas, com

```
15 3 * * * /home/infuser/useinfuser-site/deploy/vps/formulario-db/backup.sh /home/infuser/backups/formulario >> /home/infuser/logs/backup-formulario.log 2>&1 || /home/infuser/ops-alert.sh "backup-formulario" "critico" "backup diario do formulario-db FALHOU - ver ~/logs/backup-formulario.log"
```

**Primeira execução real**, do caminho do cron e no ambiente enxuto do cron
(`env -i HOME=... PATH=/usr/bin:/bin`), exit 0, `~/logs/backup-formulario.log`:

```
formulario-20260919T072935Z-ef861b299f88.dump: OK
restore-drill: OK: formulario-20260919T072935Z-ef861b299f88.dump restaurou com 0 linhas de contagem iguais ao resumo
backup-formulario: OK: formulario-20260919T072935Z-ef861b299f88.dump.age cifrado, drill verde, 0 tabelas (release ef861b299f88)
```

A primeira linha é a saída do `sha256sum -c` de dentro do drill. `docker`, `age`, `sha256sum`,
`find`, `date` e `mktemp` estão todos em `/usr/bin`, então o `PATH` do cron alcança tudo (`psql`
não existe no host por desenho: ele só roda dentro de contêiner).

**`ls -la ~/backups/formulario/`** (diretório 700, todo arquivo 600, nenhum `.dump` em claro):

```
formulario-20260919T072601Z-ef861b299f88.dump.age  1708
formulario-20260919T072601Z-ef861b299f88.resumo       0
formulario-20260919T072601Z-ef861b299f88.sha256     112
formulario-20260919T072935Z-ef861b299f88.dump.age  1708
formulario-20260919T072935Z-ef861b299f88.resumo       0
formulario-20260919T072935Z-ef861b299f88.sha256     112
neon-20260919T072030Z.resumo                        232
```

São duas execuções do mesmo dia: a de 07:26:01Z é o smoke do script a partir de `/tmp`, a de
07:29:35Z é a oficial, do caminho do cron. Nenhuma foi apagada.

**`sha256sum -c` fora do drill falha, e isso é o desenho:** `FAILED open or read: No such file or
directory`, porque o `.sha256` é do dump em claro e o claro não sobrevive ao script (`trap EXIT`,
inclusive em falha). O `-c` verde só existe no instante do drill, com o claro em mãos, e está no
log acima.

**O `.resumo` sai com 0 tabelas e isso é honesto, não verde falso:** o `formulario-db` está vazio
até a F5 carregar o dump. O drill de um banco vazio prova a mecânica (dump, resumo, sha, `age`,
restore, limpeza), não prova contagem. A prova de contagem com dado real está logo abaixo.

**Drill real com 806 linhas**, pelo script, sobre o dump do Neon da F3:

```
$ restore-drill.sh /home/infuser/backups/formulario/neon-20260919T072030Z.dump
neon-20260919T072030Z.dump: OK
restore-drill: OK: neon-20260919T072030Z.dump restaurou com 15 linhas de contagem iguais ao resumo
real 0m2,155s
```

Container e volume de drill removidos ao fim: `docker ps -a` e `docker volume ls` filtrados por
`formulario-drill` devolvem `0` e `0`.

**Contraexemplo do drill.** Um byte trocado numa cópia do dump (`dd ... seek=150000`) e o drill
morre alto, antes de subir contêiner:

```
corrompido.dump: FAILED
sha256sum: WARNING: 1 computed checksum did NOT match
restore-drill: FALHA: o drill não foi concluído
exit=2
```

**Contraexemplo da chave.** O drill sobre o `.dump.age` sem `AGE_IDENTITY` falha com o motivo
nomeado, em vez de fingir que decifrou:

```
restore-drill: FALHA: AGE_IDENTITY precisa apontar para a chave privada age; ela não fica nesta VPS (ver deploy/vps/README.md)
exit=2
```

**Alerta provado.** `backup.sh` apontado para um caminho impossível (uma pasta dentro do arquivo
de log) encadeado ao `ops-alert.sh`:

```
mkdir: cannot create directory '/home/infuser/logs/backup-formulario.log': Not a directory
backup-formulario: FALHA: não consegui criar /home/infuser/logs/backup-formulario.log/nao-existe
exit da cadeia = 0 (ops-alert rodou)
```

Entrega confirmada no outro lado, não só o disparo: execução `193163` do workflow
`M0DVv7r86uqKUjnE` (`OPS - alert (email Yan)`), `mode=webhook`, `status=success`,
`startedAt 2026-09-19 04:30:08.637-03`, `stoppedAt ...10.276-03`, exatamente o instante da falha
forçada. A mensagem foi `"TESTE de alerta da F4, ignorar"`. Nenhuma permissão foi alterada, então
não houve nada a restaurar.

**Retenção.** `find -mtime +14 -print` no diretório devolve `0` arquivos hoje, como esperado com
dois backups de minutos atrás.

**Descarte do dump da F3.** O `neon-<utc>.dump` em claro e o `.sha256` dele foram removidos: a F4
já provou o caminho de cifrar e de restaurar, o Neon segue sendo a fonte viva até a F5, e um
`.age` com PII que ninguém nesta VPS consegue decifrar seria passivo sem utilidade, fora da
retenção de 14 dias (que só casa `formulario-*`). Ficou só o `neon-<utc>.resumo`, que é contagem,
não dado.

`df -h /` depois de tudo: `193G 156G 38G 81%`, abaixo do alarme de 85% do `disk-check.sh` e sem
variação medível nesta fatia.

## Desvios do pacote

1. **`--no-acl` entrou no rito de restore, e o remédio previsto não servia.** `DADOS-E-APIS.md` §4
   dizia "decide entre `--no-comments` e filtrar a extensão pelo `--list` e `-L`". `--no-comments`
   era necessário mas não suficiente, e o `--list` não expõe entradas de ACL, então filtrar por
   `-L` não resolveria a segunda falha. §4 foi reescrito com as duas falhas medidas e os dois
   remédios.
2. **A chave privada `age` não está na VPS, e isso muda o desenho do drill.**
   `~/.config/age/recipients.txt` tem só a recipient pública; a privada está no gerenciador de
   senhas, cifrada com passphrase (`age -p`, guardada em base64 na nota), igual à do backup
   principal (`/opt/infuser-brew/kb/06_deployment_runbook.md` e `09_troubleshooting.md`). Por isso
   o drill diário roda **dentro** do `backup.sh`, sobre o dump em claro, antes de cifrar: é o
   único instante em que a VPS prova o restore sozinha. O `restore-drill.sh` continua aceitando
   `.dump.age` com `AGE_IDENTITY`, para quem trouxer a chave. §6 registra a lacuna: o `.age`
   protege o dump em repouso, não protege contra perder a VPS inteira (R1 segue aberto).
3. **O drill roda depois de cifrar, não antes.** Assim um drill vermelho alerta sem jogar fora o
   backup do dia.
4. **`contar-tabelas.sh` no lugar de `inventariar-banco.mjs`.** O `.mjs` comum aos dois lados é
   entrega da F2 e ainda não existe. O helper faz o que a prova exige (contagem por tabela mais
   `last_value` de cada sequência), recebe a invocação do `psql` como argumentos para a URL ficar
   em variável de ambiente e nunca em `argv`, e conta as 14 tabelas numa só ida ao servidor com
   `query_to_xml`.
5. **O `.resumo` pode ser vazio e o script segue.** Um banco sem tabelas é o estado legítimo do
   `formulario-db` até a F5.

## Lacuna nomeada (não construída de propósito)

Depois da F5, um backup que saia com `0 tabelas` seria catástrofe silenciosa: o drill compara o
dump com o resumo do **próprio** dump, então vazio bate com vazio e o cron fica verde. O gate
natural é comparar a lista de tabelas de hoje com a do `.resumo` anterior, e ele não foi
construído porque está fora do AC-06 e alarmaria em `DROP TABLE` legítimo. Decisão do Yan; o
lugar barato de resolver é a F6.
