# Contratos e eventos v1.0

GET `/guias`: biblioteca após sessão. GET `/guias/acesso?guia=<slug>`: formulário contextual; slug desconhecido não vira redirecionamento. GET `/guias/<slug>`: sublink protegido para a rota original. POST `/api/guias/acesso`: JSON até 12KiB com nome, email, whatsapp, nicho, interesse, impedimento, guia opcional, origem opcional e website honeypot. Retorno 200 com destino local allowlisted e Set-Cookie; erros 400/403/413/429/503 sem PII e sem cookie. Origem deve coincidir com o host de produção/local da requisição. Destino nunca é URL arbitrária.

Cookie `infuser_guias`: UUID aleatório e expiração, assinado HMAC-SHA256 com `GUIAS_ACCESS_SECRET` exclusivo mínimo 32 caracteres; HttpOnly, Secure em produção, Domain=.useinfuser.com, SameSite=Lax, Path=/, 30 dias. O mesmo cadastro vale no apex e no www. Sem evento entre sistemas: esta fatia só grava/consulta internamente. Nenhum webhook ou disparo externo adicionado, nenhuma mudança no evento do diagnóstico.
