const fs = require("fs");
const path = require("path");
let h = fs.readFileSync(path.join(__dirname, "club-live.html"), "utf8");
const report = [];
// Correções já GRAVADAS direto na fonte club-live.html (founding/vagas removidos + R$67->R$97, 2026-07-03).
// Ficam aqui como skip tolerante: não devem contar como MISS, e servem de rede de segurança caso a copy antiga reapareça.
const BAKED_INTO_SOURCE = new Set([
  "founding-line", "remove offer sorteio li", "mensal flag", "mensal from", "mensal amt",
  "mensal cta txt", "anual pn", "anual cta txt", "micro 10 vagas", "faq founding q",
  "faq founding a", "final lede", "final b1", "final b3", "final b4 live", "final after", "remove raffle",
  "stat big", "stat lbl", // stat "50 mil views JARVIS" removido de vez da fonte (2026-07-03)
  "hero sub2", // os 2 <p class="sub-2"> removidos do hero (2026-07-05)
]);
function rep(label, search, replace, opts = {}) {
  const before = h;
  if (search instanceof RegExp) h = h.replace(search, replace);
  else h = h.split(search).join(replace);
  const changed = before !== h;
  if (!changed && !opts.optional && !BAKED_INTO_SOURCE.has(label)) report.push("MISS: " + label);
  else report.push((changed ? "ok  : " : "skip: ") + label);
}

// ---- COPY CORRECTIONS ----
// live 15/06
rep("eyebrow live", "Comunidade fechada · Lançamento 15/06", "Comunidade fechada · Discord + WhatsApp + Telegram", { optional: true }); // badge removido do hero
rep("founding-line", "Founding: <b>10 vagas</b> a <b>R$67/mês</b> travado pra sempre.", "A partir de <b>R$57/mês</b> no plano anual · R$97/mês no mensal.");
rep("nav seats", '<span class="seats">Founding · 10 vagas</span>', "", { optional: true }); // cta-wrap removido do nav
rep("footer live", " · Lançamento 15/06", "");

// desafio quinzenal
rep("hero sub2 quinz", "desafio quinzenal com freelance real e acesso ao que está", "desafio quinzenal com freelance real e acesso ao que está", { optional: true }); // already? no
rep("hero sub2", "desafio mensal com freelance real e acesso ao que está", "desafio quinzenal com freelance real e acesso ao que está");
rep("demo quinz", "O desafio do mês está aberto.", "O desafio da quinzena está aberto.");
rep("vs-extra quinz", "desafio mensal com freelance + desconto", "desafio quinzenal com freelance + desconto");
rep("vs-save quinz", "as calls e o desafio mensal por cima", "as calls e o desafio quinzenal por cima");
rep("faq quinz", "O desafio mensal com freelance real e a call", "O desafio quinzenal com freelance real e a call");

// bonus header 3->4 + total + O Pergaminho na valuestack
rep("bonus header 4", "E ainda, 3 bônus que você leva junto", "E ainda, 4 bônus que você leva junto");
rep("stack total label", "Valor total dos 3 bônus, inclusos sem custo adicional", "Valor total dos 4 bônus, inclusos sem custo adicional");
rep("stack total value", '<span class="v">R$ 116,80</span>', '<span class="v">R$ 153,80</span>');
rep("vs add pergaminho", '<tr class="vs-extra">', '<tr><td>Bônus — O Pergaminho</td><td>R$ 37,00</td></tr><tr class="vs-extra">');
rep("vs strike", "R$ 1.594,80/ano", "R$ 1.631,80/ano");
rep("vs save value", "R$ 910,80 por ano", "R$ 947,80 por ano");

// founding -> natural price
rep("offer-incl bonus", "Bônus: <b>Kit JARVIS + Kit Segundo Cérebro + Pack de Skills</b>", "Bônus: <b>Kit JARVIS + Kit Segundo Cérebro + Pack de Skills + O Pergaminho</b>");
rep("remove offer sorteio li", /<li>(?:(?!<\/li>)[\s\S])*?Bônus 1º mês(?:(?!<\/li>)[\s\S])*?<\/li>/, "");
rep("stat big", '<div class="big">50 mil</div>', '<div class="big">R$40 mil</div>');
rep(
  "stat lbl",
  '<div class="lbl">views em 24h no vídeo demo do Kit JARVIS, um dos bônus que você leva ao entrar.</div>',
  '<div class="lbl">vendidos em implementações one-shot com IA, em 1 mês.</div>'
);
rep("mensal flag", '<span class="flag">Primeiros 10 · Founding</span>', "");
rep("mensal from", '<div class="from">de <s>R$97/mês</s> por</div>', "");
rep("mensal amt", '<span class="amt">67</span>', '<span class="amt">97</span>');
rep("mensal cta txt", "Garantir vaga no mensal", "Assinar no mensal");
rep("anual pn", "Plano Anual · Founding", "Plano Anual");
rep("anual cta txt", "Garantir vaga no anual", "Assinar no anual");
rep("micro 10 vagas", "10 vagas, não 300", "Acesso imediato");
rep("faq founding q", "O preço Founding sobe depois?", "O preço pode subir depois?");
rep("faq founding a",
  "As 10 vagas Founding travam <b>R$67/mês pra sempre</b> enquanto a assinatura ficar ativa. A partir da 11ª pessoa, o valor passa a ser R$97/mês. O travamento vale enquanto você não cancelar.",
  "O valor de hoje é <b>R$97/mês</b> (ou R$684/ano, ≈ R$57/mês). Quem assina trava o preço enquanto a assinatura ficar ativa. Se subir, vale só pra quem entrar depois.");
rep("final lede",
  "Founding é 10 vagas. Não é abundância disfarçada de escassez, é o tamanho que permite o nível de atenção que o Club entrega.",
  "O jogo se move toda semana. Você entra agora e começa a construir junto, ou continua vendo de fora.");
rep("final b1", "Trava <b>R$67/mês pra sempre</b>", "Trava o preço <b>enquanto a assinatura ficar ativa</b>");
rep("final b2", "Recebe <b>Kit JARVIS + Kit Segundo Cérebro + Pack de Skills</b> imediatamente", "Recebe <b>Kit JARVIS + Segundo Cérebro + Pack de Skills + O Pergaminho</b> na hora");
rep("final b3", "Entra no <b>sorteio da implementação gratuita</b> do Segundo Cérebro", "Acesso imediato a <b>todos os bônus</b>");
rep("final b4 live", "Participa da <b>live de abertura em 15/06</b>", "Entra direto na <b>próxima call ao vivo</b>");
rep("final after", "Depois das 10 vagas, o valor passa a ser R$97/mês.", "Cancela quando quiser · Garantia de 7 dias.");

// ---- CHECKOUT WIRING ----
rep("checkout mensal", 'data-checkout="mensal" href="#"', 'data-checkout="mensal" href="https://pay.hub.la/bYpoAJEja2IHIiF24nsD" target="_blank" rel="noopener"');
rep("checkout anual", 'data-checkout="anual" href="#"', 'data-checkout="anual" href="https://pay.hub.la/XOoxp5QUVAeImUKS08Vq" target="_blank" rel="noopener"');

// ---- STRUCTURAL: mounts + remove raffle ----
rep("deliv-grid -> mount", /<div class="deliv-grid">[\s\S]*?<\/div>(\s*)<div class="s-head center rv" id="bonus"/, '<div id="club-entregaveis-mount"></div>$1<div class="s-head center rv" id="bonus"');
rep("b-grid -> mount", /<div class="b-grid">[\s\S]*?<\/div>(\s*)<div class="stack/, '<div id="club-bonus-mount"></div>$1<div class="stack');
rep("remove raffle", /<div class="raffle rv">[\s\S]*?<\/div>/, "");

// ---- NOVA SEÇÃO: desafio quinzenal = motor de renda ----
const card = (e, t, d) =>
  `<div style="border:1px solid var(--line);background:var(--panel);border-radius:var(--r);padding:26px 24px"><div style="font-family:var(--font-mono,'JetBrains Mono',monospace);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--green);margin-bottom:11px">${e}</div><h3 style="font-size:18px;line-height:1.3;margin:0 0 9px;color:var(--warm)">${t}</h3><p style="font-size:14px;line-height:1.62;color:var(--muted);margin:0">${d}</p></div>`;

const desafioSection = `<!-- ============ DESAFIO QUINZENAL ============ -->
<section class="s" id="desafio">
  <div class="wrap">
    <div class="s-head center rv">
      <span class="eyebrow">O motor de renda do Club</span>
      <h2 class="kicker-h2">O desafio quinzenal não é exercício. <span class="serif-i">É onde você começa a faturar.</span></h2>
      <p class="lede">A cada 15 dias, um desafio real: você desenvolve um produto com IA no desenvolvimento assistido, ao vivo. E o que você constrói não fica na gaveta.</p>
    </div>
    <div class="rv" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(258px,1fr));gap:16px;margin-top:38px">
      ${card("A Infuser vende por você", "O que você cria, a gente leva pro mercado", "Os melhores produtos de cada desafio a Infuser vende em parceria com quem criou. Você não leva um troféu: leva um produto faturando, com a gente fazendo a venda e você lucrando junto.")}
      ${card("Prática de verdade", "Desenvolvimento assistido, do zero ao produto", "Cada desafio é prática real construindo com IA. Em poucas quinzenas você bota mais coisa de pé do que a maioria constrói num ano, e ainda sai com portfólio.")}
      ${card("Pontuação que abre portas", "Cada vitória, interação e ajuda vira ponto", "Você soma pontos vencendo desafios, interagindo e ajudando outros membros. Quem cresce na pontuação e tem o perfil que a gente precisa entra no radar pra ser contratado pro time da Infuser.")}
      ${card("Já começou", "O primeiro desafio já está no ar", "Não é promessa pro futuro: a primeira call já rodou e o primeiro desafio já está aberto. Quem entra agora pega o jogo no começo.")}
    </div>
    <div class="rv" style="margin-top:18px;border:1px solid rgba(198,255,52,.32);background:linear-gradient(120deg,rgba(198,255,52,.07),rgba(198,255,52,.02));border-radius:var(--r);padding:24px 30px;text-align:center">
      <p style="font-size:16px;line-height:1.6;color:var(--warm);margin:0">Um produto seu vendendo, ou uma vaga no nosso time. <b class="g">Só isso já paga o Club muitas vezes.</b> Você não paga por acesso: entra num lugar onde dá pra fazer dinheiro de verdade com IA.</p>
    </div>
    <div class="sec-cta rv"><a class="btn btn-primary" href="#oferta">Entrar para o Infuser Club <span class="arr">&rarr;</span></a></div>
  </div>
</section>
`;

rep("insert desafio section", /<section class="s" id="metodo">/, (m) => desafioSection + m);
rep("nav desafios link", '<a href="#metodo">O que é</a>', '<a href="#metodo">O que é</a><a href="#desafio">Desafios</a>');
rep(
  "demo quinta partnership",
  "Os 3 melhores não levam troféu. Levam <b>trabalho real pago</b>, com a Infuser, com case de portfólio e a porta aberta pra entrar no time.",
  "Os melhores não levam troféu: levam <b>um produto que a Infuser vende em parceria com eles</b>, case de portfólio e a porta aberta pra entrar no time."
);
rep(
  "niveis note pontuacao",
  "Os níveis são sua progressão dentro da comunidade. O acesso entra por um preço único.",
  "Você sobe de nível com pontuação: pontos por vencer desafios, interagir e ajudar outros membros. O acesso entra por um preço único; o nível você conquista."
);
rep(
  "niveis foot hire",
  "Onde você chega depende do que você faz.",
  "Onde você chega depende do que você faz, e os que mais sobem entram no radar pra trabalhar com a gente."
);

// ---- IMAGE DATA URIs (attr only) -> /club files, in document order ----
const paths = [
  "/club/infuser-club.webp",                 // favicon (dropped from fragment, but consumes index 0)
  "/club/infuser-club.webp",                 // nav logo
  "/club/hero-emblem.webp",                  // hero-bg
  "/club/img-2.webp",                        // demo texture
  "/club/img-3.webp",                        // niveis texture
  "/club/badge-vislumbre.webp",
  "/club/badge-vidente.webp",
  "/club/badge-oraculo.webp",
  "/club/yan-galasso-fundador-da-infuser.webp",
  "/club/img-8.webp",                        // final-bg
  "/club/infuser-club.webp",                 // footer logo
];
let di = 0;
const dataCount = (h.match(/(?:src|href)="data:image\/[^"]+"/g) || []).length;
h = h.replace(/(src|href)="data:image\/[^"]+"/g, (m, attr) => attr + '="' + (paths[di++] || "/club/MISSING.webp") + '"');
report.push((dataCount === paths.length ? "ok  : " : "MISS: ") + `data URIs mapped (${dataCount}/${paths.length})`);

// ---- ASSEMBLE FRAGMENT (font links + style + body, minus scripts) ----
const preconnects = (h.match(/<link rel="preconnect"[^>]*>/g) || []).join("");
const fontLinks = (h.match(/<link href="https:\/\/(?:fonts\.googleapis|api\.fontshare)[^>]*>/g) || []).join("");
const style = (h.match(/<style>[\s\S]*?<\/style>/) || [""])[0];
let body = (h.match(/<body[^>]*>([\s\S]*?)<\/body>/) || ["", ""])[1];
body = body.replace(/<script\b[\s\S]*?<\/script>/gi, ""); // drop TODOS os inline scripts, com ou sem atributos (ex: loader VTURB) — portados p/ React (useEffect)

const fragment = preconnects + "\n" + fontLinks + "\n" + style + "\n" + body;

fs.writeFileSync(
  path.join(__dirname, "..", "..", "src", "app", "club", "club-html.ts"),
  "// AUTO-GERADO de club-live.html (página viva) + correções de copy + mounts dos componentes.\n" +
  "// Regenerar com: node scripts/club/build-club-html.js (raiz do repo). NÃO editar à mão.\n" +
  "export const clubHtml = " + JSON.stringify(fragment) + ";\n"
);

console.log(report.join("\n"));
console.log("\nfragment chars:", fragment.length, "| style:", style.length, "| fontLinks:", fontLinks ? "ok" : "MISSING", "| preconnects:", preconnects ? "ok" : "MISSING");
console.log("MISS count:", report.filter(r => r.startsWith("MISS")).length);
