# Verificação e operação v1.0

Vitest: cada campo ausente/inválido, corpo malformado/grande, origem externa, honeypot, limite, falha do banco sem cookie, destino escolhido, assinatura/expiração/adulteração, cobertura de todos os aliases e HTMLs, demo/painel preservados, equipe/CSV anônimos bloqueados e fórmula CSV neutralizada. Teste de inventário detecta guia HTML novo sem catálogo. RED inicial no inventário antes da implementação; root pode reproduzir na base. Rodar `npm test`, `npx tsc --noEmit`, `npm run build`. Asserts removidos: zero previsto.

Segurança: SQL parametrizado, sem PII em cookies/logs/URL, segredo exclusivo, no-store e noindex, origem e payload limitados. Limite de envio por endereço de rede em memória com teto para o container único; registrar limite honesto e gatilho de escala no código. Biblioteca pública não contém dado pessoal. Falhas logam só operação e requestId. Equipe usa sessão existente, nenhuma conta nova.

Antes de produção: aplicar SQL, provisionar `GUIAS_ACCESS_SECRET`, deploy padrão e smoke apex/www; confirmar release em `/api/health`. Smoke deve esperar redirecionamentos nos guias e 200 no formulário, além de negar export anônimo. Root faz QA mobile/desktop e cadastro sintético controlado, removendo apenas o próprio registro de teste. Sem alegar deploy nesta sessão de execução.

Suíte HTTP permanente: `TEST_GUIAS_HTTP_URL=http://127.0.0.1:3188 npm test -- tests/guias/http.test.ts` com servidor já iniciado. Verifica a fronteira real do Next, arquivos públicos, cabeçalho de subrequest e sessão assinada quando o segredo sintético está no ambiente. Sem URL a suíte fica explicitamente pulada. O banco integrado exige Postgres descartável; a gravação viva e o QA visual ficam com o root.

Achado de ambiente/legado fora do escopo: o `tsc --noEmit` geral falha em duas inferências de mocks do instalador (`tests/instalar/instalar.test.ts:94,101`, TS2493). Arquivo idêntico ao main e falha reproduzida no checkout principal sem esta feature. Não removemos testes nem afrouxamos o gate. `next build` verifica o caminho de produção e passa; a aceitação do typecheck completo continua visível na work order.

O teste HTTP encontrou que o Next standalone pode devolver `request.url` com localhost mesmo recebendo Host público. A origem dos redirecionamentos agora é resolvida por allowlist de hosts públicos/loopback; host arbitrário cai no apex oficial. Teste permanente cobre www atrás do proxy. Nenhum dado pessoal é usado nesse diagnóstico.
