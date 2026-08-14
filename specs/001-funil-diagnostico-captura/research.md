# Phase 0 - Pesquisa e decisões técnicas

**Feature**: `001-funil-diagnostico-captura` | **Data**: 2026-08-14

Nenhum `NEEDS CLARIFICATION` restou na spec após o clarify de 14/08. O que este documento resolve são as escolhas técnicas que o plano precisa fixar antes do desenho.

---

## D1. Onde os leads ficam armazenados

**Decisão**: Vercel Postgres (Neon), na mesma conta que já hospeda o site.

**Rationale**: os requisitos pedem consulta por origem, faixa e intervalo de data, separação entre concluído e parcial, e exclusão sob pedido do titular. Isso é trabalho de banco relacional. A Vercel já é a plataforma de deploy, então a conexão é gerenciada, a variável de ambiente entra no mesmo painel dos segredos que já existem, e não se cria conta, cobrança ou superfície de operação nova. O volume esperado, dezenas de leads por mês, cabe folgado em qualquer plano de entrada.

**Alternativas consideradas**:

- **Supabase**: Postgres gerenciado, camada de API pronta e o Yan já tem um MCP conectado. Rejeitado porque é uma plataforma a mais para operar e monitorar, e nada nos requisitos precisa do que ela adiciona sobre um Postgres puro. O MCP conectado serve a projeto de cliente, não à infra da Infuser.
- **Postgres da VPS**, que já existe para o Prospector CNPJ. Rejeitado porque exigiria expor o banco da VPS à internet para a Vercel alcançar, o que troca uma dependência gerenciada por uma superfície de ataque nova.
- **Vercel KV / Redis**: bom para o preenchimento parcial, inútil para consulta por origem, faixa e data. Usar os dois seria duas fontes de verdade para o mesmo lead.
- **Planilha do Google**: rejeitado. Não suporta exclusão por titular de forma auditável nem consulta estruturada, e é a categoria de solução que esta feature existe para aposentar.

---

## D2. Onde o score é calculado

**Decisão**: no servidor, na rota de submissão, a partir de um arquivo de configuração versionado (`score-config.json`). A função de cálculo é pura, sem I/O.

**Rationale**: score no cliente é score manipulável, e a faixa decide se o lead ganha ou não uma hora da agenda do time. Função pura torna o teste trivial e permite cobrir os casos de fronteira das três faixas sem subir banco nem servidor. Configuração em arquivo versionado atende FR-018, que exige pesos alteráveis sem mexer em código, e ainda deixa rastro em git de quando e por que um peso mudou.

**Alternativas consideradas**:

- Pesos no banco, editáveis por painel. Rejeitado por ora: não existe painel, e criar um antes de saber se os pesos precisam mudar com frequência é complexidade especulativa. O arquivo versionado é reversível para essa direção depois.
- Score no cliente para dar feedback em tempo real. Rejeitado: o lead nunca vê o score, então não há ganho de UX, só exposição da regra de qualificação.

---

## D3. Retomada de preenchimento parcial

**Decisão**: `localStorage` no navegador para retomar a conversa, mais gravação server-side do parcial ao término de cada seção.

**Rationale**: o `localStorage` cobre o caso comum, que é a pessoa fechar a aba e voltar no mesmo aparelho, sem custo de rede nem de banco. A gravação server-side existe por outro motivo: FR-025 exige que o parcial seja dado consultável, não só conveniência do visitante. Gravar a cada pergunta seria uma escrita por pergunta e não compra nada; ao término de seção é granularidade suficiente para saber onde as pessoas desistem.

**Risco reconhecido**: quem começa no celular e volta no computador perde o parcial local. Aceitável, e o registro server-side ainda existe para a análise de abandono.

---

## D4. Integração com o Cal.com

**Decisão**: embed do Cal.com na tela final, com os dados do lead pré-preenchidos, mais webhook `BOOKING_CREATED` recebido por rota própria e validado por HMAC-SHA256 no header `x-cal-signature-256`.

**Rationale**: o embed mantém o lead dentro do fluxo, sem salto para outro domínio, que é onde se perde gente. O webhook é o que fecha o ciclo, vinculando o agendamento ao lead que já foi persistido, e é o mesmo gatilho que a feature `003` consome para gerar o roteiro. Uma integração, dois consumidores.

**Padrão a seguir**: `src/app/api/kiwify-webhook/route.ts`, que já resolve leitura de raw body, verificação de assinatura com `timingSafeEqual`, tipagem do payload por interface, e a política de responder 200 mesmo em falha de terceiro para não provocar tempestade de retry. A diferença é o algoritmo: Kiwify usa SHA-1, Cal.com usa SHA-256.

**Alternativas consideradas**:

- Redirecionar para a página do Cal.com. Mais simples de construir e pior de converter, porque troca de domínio no meio do fluxo e o webview do Instagram trata isso mal.
- Consumir a API do Cal.com e desenhar o seletor de horários nós mesmos. Mais controle visual, muito mais código e mais superfície de erro, sem ganho proporcional.

---

## D5. Comportamento quando o Cal.com falha

**Decisão**: o lead qualificado nunca vê erro cru. Se o embed não carregar ou não houver horário, a tela oferece um caminho alternativo que preserva o lead, informando que o time entra em contato para marcar, e o registro é marcado como qualificado sem agendamento.

**Rationale**: FR-021 exige isso, e a razão é comercial: o lead qualificado é o ativo mais caro do funil. Perdê-lo por uma indisponibilidade de terceiro é o pior resultado possível da feature inteira.

---

## D6. Como o formulário funciona no webview do Instagram

**Decisão**: renderização no servidor da primeira pergunta, sem dependência de JavaScript para exibir conteúdo, e progressive enhancement para a transição conversacional. Nenhum recurso que exija permissão do navegador.

**Rationale**: o webview do Instagram é o caminho principal do tráfego e é o ambiente mais restrito da lista. Um formulário que só existe depois que o JavaScript roda é um formulário que às vezes não existe. A regra da casa já aprendeu isso em entregável HTML: conteúdo visível por padrão, animação como realce.

---

## D7. Framework de teste

**Decisão**: Vitest, com dois arquivos iniciais: casos de fronteira do score e cobertura dos 6 critérios do ICP pelas perguntas.

**Rationale**: o repositório não tem test runner nenhum hoje. Vitest é o que roda mais rápido em projeto Vite/Next moderno, não exige configuração ritual, e é o mesmo runner já usado em outro repositório da casa, o `infuser-mcp`. O teste que importa aqui não é o de componente: é o que prova que um lead com as respostas X cai na faixa Y, e que nenhum critério do ICP ficou sem pergunta.

**O que explicitamente não é testado agora**: renderização de componente e teste de ponta a ponta em navegador. O custo de manutenção não se paga no tamanho desta feature, e o `quickstart.md` cobre a validação manual de ponta a ponta.

---

## D8. Identificação do lead para deduplicação

**Decisão**: par e-mail normalizado mais WhatsApp normalizado só para dígitos, com prefixo 55 quando o número vier sem código de país.

**Rationale**: FR-033 exige atualizar em vez de duplicar. E-mail sozinho falha quando a pessoa usa dois endereços; telefone sozinho falha quando digita errado. A normalização de telefone brasileira já existe implementada em `kiwify-webhook/route.ts` e deve ser extraída para uso comum em vez de reescrita.
