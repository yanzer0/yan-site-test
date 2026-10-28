# Verificação e operação v1.0

Vitest: cada campo ausente/inválido, corpo malformado/grande, origem externa, honeypot, limite, falha do banco sem cookie, destino escolhido, assinatura/expiração/adulteração, cobertura de todos os aliases e HTMLs, demo/painel preservados, equipe/CSV anônimos bloqueados e fórmula CSV neutralizada. Teste de inventário detecta guia HTML novo sem catálogo. RED inicial no inventário antes da implementação; root pode reproduzir na base. Rodar `npm test`, `npx tsc --noEmit`, `npm run build`. Asserts removidos: zero previsto.

Segurança: SQL parametrizado, sem PII em cookies/logs/URL, segredo exclusivo, no-store e noindex, origem e payload limitados. Limite de envio por endereço de rede em memória com teto para o container único; registrar limite honesto e gatilho de escala no código. Biblioteca pública não contém dado pessoal. Falhas logam só operação e requestId. Equipe usa sessão existente, nenhuma conta nova.

Antes de produção: aplicar SQL, provisionar `GUIAS_ACCESS_SECRET`, deploy padrão e smoke apex/www; confirmar release em `/api/health`. Smoke deve esperar redirecionamentos nos guias e 200 no formulário, além de negar export anônimo. Root faz QA mobile/desktop e cadastro sintético controlado, removendo apenas o próprio registro de teste. Sem alegar deploy nesta sessão de execução.
