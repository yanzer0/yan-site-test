// @ts-nocheck
/* eslint-disable */
// AUTO-GERADO: scripts inline da pagina portados p/ rodar no useEffect
// (dangerouslySetInnerHTML NAO executa <script>). Entidades HTML decodificadas (fix do chat-demo).
export function runLegiaoScripts() {
  // ---- script #1 ----
  {

  (function(){
    var bar=document.getElementById('cmdbar'); if(!bar)return;
    var CMDS=['/pagina-de-vendas','/oferta','/vsl','/whatsapp','/auditar-meta','/big-idea'];
    var line=bar.querySelector('.cb-line'), txt=bar.querySelector('.cb-txt'), drop=bar.querySelector('.cb-drop'), bubble=bar.querySelector('.cb-bubble');
    var items=[].slice.call(bar.querySelectorAll('.cb-item'));
    var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    if(reduce){ txt.textContent='pagina-de-vendas'; drop.classList.add('show'); items[0].classList.add('on'); bubble.classList.add('show'); return; }
    var ci=0, timers=[];
    function clr(){ timers.forEach(clearTimeout); timers=[]; }
    function hi(cmd){ items.forEach(function(x){x.classList.toggle('on', x.getAttribute('data-cmd')===cmd);}); }
    function run(){
      var cmd=CMDS[ci%CMDS.length], body=cmd.slice(1), i=0;
      drop.classList.remove('show'); bubble.classList.remove('show'); items.forEach(function(x){x.classList.remove('on');}); txt.textContent='';
      var iv=setInterval(function(){
        txt.textContent=body.slice(0,++i);
        if(i>=body.length){ clearInterval(iv);
          timers.push(setTimeout(function(){ drop.classList.add('show'); hi(cmd);
            timers.push(setTimeout(function(){ bubble.classList.add('show');
              timers.push(setTimeout(function(){ ci++; run(); }, 2400));
            }, 720));
          }, 520));
        }
      }, 68);
      timers.push({/*noop*/});
    }
    var started=false;
    if('IntersectionObserver' in window){ new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting && !started && !document.hidden){ started=true; run(); } }); },{threshold:.25}).observe(bar); }
    else { run(); }
  })();
  
  }
  // ---- script #2 ----
  {

  const DATA = [
    {
      agent: "Auditor de Conta Meta",
      command: "/auditar-conta-meta",
      proves: "Diagnostica pelas 4 dimensões oficiais da Meta e acha o furo de tracking que um olhar superficial leria como 'performance ruim'. Nível consultor, não cospe texto bonito.",
      turns: [
        { role:"user", kind:"message", text:"Herdei uma conta de tráfego de infoprodutor, objetivo Compra, R$300/dia. Quero saber se posso escalar ou tô jogando verba no lixo." },
        { role:"agent", kind:"message", text:"Sou o Auditor de Conta Meta. Faço diagnóstico 0-100 nas 4 dimensões que a Meta usa pra te entregar (criativo, sinal/evento, público e estrutura) e te digo o que arrumar primeiro. Me passa o que conseguir: objetivo, gasto, CTR dos tops, número de compras na última semana, se tem CAPI ligada, e quantos conjuntos. Não sabe onde achar? Te guio na tela." },
        { role:"user", kind:"message", text:"14 anúncios ativos, 2 vídeos antigos levam 80% do gasto, CTR geral 0,9%. Umas 6 compras na semana pelo Gerenciador, mas o checkout (Hotmart) mostra 11 no mesmo período. CAPI não sei dizer. 5 conjuntos, ABO." },
        { role:"agent", kind:"diagnostico", text:"Gargalo dominante: SINAL/EVENTO. O Gerenciador conta 6 compras, o checkout conta 11. Isso é ~45% das vendas sumindo antes de chegar ao otimizador. A conta não está otimizando mal: ela está otimizando cega. Qualquer leitura de qual criativo ou público funciona está enviesada por esse furo." },
        { role:"agent", kind:"output", text:"Score: 48/100 - conta NÃO está pronta pra escalar.\n\nCriativo 14/25 - 2 vídeos de 40 dias com 80% do gasto: dependência frágil.\nSinal/evento 8/25 - furo de tracking. Prioridade 1.\nPúblico 13/25 - 3 lookalike da mesma origem concorrem no leilão.\nEstrutura 13/25 - 5 conjuntos dividem os poucos eventos.\n\nOrdem: (1) fechar o tracking com /tracking-meta, sem isso toda otimização é dado pela metade; (2) consolidar conjuntos; (3) checar sobreposição; (4) só então renovar criativo." },
        { role:"agent", kind:"message", text:"E não vou cravar que seu CTR 0,9% é ruim como verdade universal [SUPOSIÇÃO - varia por nicho]. Me traz o histórico dos meses bons que eu digo se é queda ou se é o normal dessa conta." }
      ]
    },
    {
      agent: "Forja de Página de Vendas",
      command: "/pagina-de-vendas",
      proves: "Não cospe texto: constrói o mecanismo com você, diagnostica o nível de consciência do público antes de escrever uma linha, e se recusa a inventar prova social.",
      turns: [
        { role:"user", kind:"message", text:"Tenho um curso de confeitaria pra fazer renda extra vendendo bolo caseiro. R$ 297, tráfego frio de anúncio. Público é mãe que sabe fazer bolo bonito mas não consegue vender. Já formei várias alunas mas não tenho número exato nem mecanismo nomeado." },
        { role:"agent", kind:"message", text:"Tenho o suficiente pra forjar a página. Vou calibrar a sequência pro tráfego frio, construir o mecanismo com você e marcar onde falta prova, que eu não invento." },
        { role:"agent", kind:"diagnostico", text:"Público consciente do problema mas NÃO da solução: ela sabe fazer bolo, sente que não vira dinheiro. A página abre LONGE da oferta, pela conversa interna dela ('faço bolo lindo, todo mundo elogia, mas não sai do elogio pro pagamento'). Abrir com 'Conheça o Curso X' pra tráfego frio mata. O problema não é técnica de bolo, é não ter sistema de venda e preço. Vou chamar o mecanismo de 'Método Bolo que Paga' e o problema de 'Confeiteira de Elogio'." },
        { role:"agent", kind:"output", text:"HEADLINE: 'Você faz um bolo que todo mundo elogia, mas que ninguém nunca te pagou pra fazer? Existe um motivo, e não tem nada a ver com o seu bolo. Tem a ver com o que ninguém te ensinou DEPOIS que o bolo fica pronto.'\n\nMétodo Bolo que Paga, 3 frentes: (1) precificar pra lucrar, a conta que inclui o seu tempo, não só o ingrediente; (2) cardápio e fotos que fazem a pessoa perguntar o preço já querendo comprar; (3) as 3 primeiras clientes pagantes em quem você já tem por perto." },
        { role:"agent", kind:"message", text:"[SUPOSIÇÃO - confirme] Você disse 'várias alunas' mas sem número nem case. Eu NÃO vou escrever 'mais de 500 alunas' nem inventar depoimento. Me mande o número real + 2-3 prints com autorização. É o que sustenta R$297 pra tráfego frio. Sem prova real, esse bloco não vai ao ar." }
      ]
    },
    {
      agent: "Mestre da Big Idea (Schwartz)",
      command: "/big-idea-schwartz",
      proves: "Cruza as 2 réguas de Schwartz (consciência + sofisticação) a partir do que o cliente JÁ tentou, marca [SUPOSIÇÃO] onde falta voz real, e entrega 3 ângulos rankeados com lógica e risco.",
      turns: [
        { role:"user", kind:"message", text:"Quero lançar um curso de inglês pra programadores. A pessoa lê documentação tranquilo, mas trava na hora de falar em daily ou code review com gringo. Já tentou Duolingo, cursinho e Anki. Ticket R$997, tráfego frio no Instagram, primeiro lançamento." },
        { role:"agent", kind:"message", text:"Antes de te dar a Big Idea, deixa eu cravar o diagnóstico, é dele que sai o ângulo. Já tenho quase tudo. Só me confirma: tem alguma frase literal do seu público descrevendo a frustração? Comentário, DM, resposta de formulário, qualquer coisa na voz deles." },
        { role:"user", kind:"message", text:"Não tenho reviews, é o primeiro lançamento. Mas converso com esse povo todo dia no Instagram." },
        { role:"agent", kind:"diagnostico", text:"Diagnóstico: nível 3 de consciência (ele já sabe que precisa praticar fala, não perca tempo provando isso) e estágio 4 de sofisticação (já viu 'método de imersão', 'inglês na ponta da língua', está cínico com promessa grande). Isso vem do histórico de tentativas que você listou. [SUPOSIÇÃO] Não tenho a voz literal dele reclamando. Recomendo /message-mining em comentários de posts de inglês pra dev antes de escrever." },
        { role:"agent", kind:"output", text:"Big Idea: 'Você não tem um problema de inglês. Você tem um problema de inglês técnico em tempo real, e nenhum curso de inglês foi feito pra isso.'\n\nÂngulo 1 (recomendado): 'Por que você lê inglês perfeito mas trava de falar' - entra pelo mecanismo, onde nível 3 deve começar.\nÂngulo 2: 'O inglês que você aprendeu não é o de uma daily'.\nÂngulo 3: 'Imersão não funciona pra quem não tem 6 meses sobrando' - só se a mineração mostrar cinismo alto.\n\nEstágio 4 exige mecanismo único nomeado: leve pro /mecanismo-unico, sem nome o cinismo não fura." }
      ]
    },
    {
      agent: "Estrategista de Recuperação WhatsApp",
      command: "/recuperacao-whatsapp",
      proves: "Diagnostica o tipo de gatilho (inativo vs carrinho quente), nomeia o método (árvore toque-intervalo-tom-parada) e checa o opt-in legal antes de dar qualquer fala.",
      turns: [
        { role:"user", kind:"message", text:"Tenho uma loja de suplementos, vendo pelo WhatsApp. Clientes que compravam todo mês sumiram, último pedido há uns 2 meses. Ticket médio uns R$ 180. Me dá as falas prontas, não sou bom de escrever." },
        { role:"agent", kind:"message", text:"Entendido. Antes das falas: eles compraram de você e te chamaram no zap antes? Preciso confirmar se é opt-in real (contato legítimo) ou se você só tem o número salvo. Isso muda o que dá pra fazer legalmente no WhatsApp." },
        { role:"user", kind:"message", text:"Sim, todos compraram de mim e mandaram mensagem primeiro." },
        { role:"agent", kind:"diagnostico", text:"Gatilho: inativo recorrente. Diferente de carrinho quente (que pede horas), aqui o intervalo é em dias e o ângulo é reconexão + utilidade, não 'volta a comprar'. O cliente não te esqueceu, ele só saiu do hábito. Fluxo de 3 toques reativa o hábito sem soar desespero." },
        { role:"agent", kind:"output", text:"Árvore:\nToque 1 (Dia 0): 'Oi [nome], tava revendo meus clientes e vi que faz um tempinho que a gente não se fala. Como tá indo o [produto]? Conseguiu manter a rotina?'\nToque 2 (Dia 3-4): 'Pelo seu último pedido você deve tar chegando no fim do pote. Quer que eu já separe pra você não ficar sem? Sem compromisso.'\nToque 3 (Dia 8-10): 'Não vou ficar te enchendo, prometo. Quando quiser repor é só me chamar.'\nDepois disso PARA. 3 toques pensados batem 8 repetidos. Taxa de reativação não cravo [SUPOSIÇÃO - levante o seu número real com 30-50 contatos]." }
      ]
    },
    {
      agent: "Arquiteto de Oferta Grand Slam",
      command: "/oferta-grand-slam",
      proves: "Diagnostica QUAL dos 4 eixos da Value Equation está fraco antes de montar qualquer copy. Identifica o problema real e soca nele, não empilha feature.",
      turns: [
        { role:"user", kind:"message", text:"Quero montar a oferta do Esquadrão: 80 agentes de IA que rodam dentro do Claude, R$97 vitalício. A maior objeção é que acham que é só um pacote de prompts caro." },
        { role:"agent", kind:"message", text:"Vou rodar o diagnóstico da Value Equation antes de montar qualquer copy. Me confirma: qual é a transformação real (de/para), quem é o comprador ideal, e se tem concorrentes diretos com reclamações coletadas. Isso muda tudo no ângulo." },
        { role:"user", kind:"message", text:"De fazer copy/tráfego na mão ou aceitar o genérico do ChatGPT -> ter um time de especialistas executando dentro da ferramenta que já usa. Público: vende infoproduto ou serviço, solo ou time pequeno. Concorrentes (Xquads, Bravy) têm reclamação de 'não consegui usar nenhum' e 'não sei o que cada um faz'." },
        { role:"agent", kind:"diagnostico", text:"O eixo fraco não é Dream Outcome nem Tempo/Esforço, o Esquadrão já instala em minutos. É a Probabilidade Percebida de Alcançar. A categoria inteira morre aqui: as reclamações ('é só prompt', 'não consegui usar', 'não sei o que cada um faz') são todas de probabilidade percebida. É nesse eixo que a oferta tem que socar, não em mais features." },
        { role:"agent", kind:"output", text:"Oferta remontada por eixo:\nDream Outcome = vender 'o time que faz o trabalho que hoje te custa caro ou trava', nunca '80 agentes' (isso é feature).\nProbabilidade Percebida [a alavanca] = mecanismo nomeado: cada agente carrega o framework do especialista real + anti-padrões, se auto-explica, guia o input, e tem demo cru ao vivo.\nÂncoras de mercado [SUPOSIÇÃO: confirmar]: copywriter R$3-8k, gestor de tráfego R$1,5-3k/mês.\nPróximo passo: /precificacao pra ancorar o R$97." }
      ]
    },
    {
      agent: "Arquiteto de VSL",
      command: "/vsl-copy",
      proves: "Diagnostica o nível de consciência, nomeia um mecanismo que o cliente não tinha, e marca [SUPOSIÇÃO] onde falta prova real, em vez de cuspir roteiro genérico.",
      turns: [
        { role:"user", kind:"message", text:"Tenho uma mentoria de finanças pra dentista autônomo. Fatura R$ 40-60k/mês no consultório mas nunca sobra nada, não sabe quanto é dele e quanto é da clínica. Ticket R$ 3.500. Tráfego frio no Instagram. Sou dentista e contador, atendi uns 30. Mecanismo eu não tenho nomeado." },
        { role:"agent", kind:"message", text:"Tenho o suficiente pra montar o roteiro. Vou cravar o nível de consciência, construir o mecanismo com você (você não tinha nomeado) e marcar onde falta prova, que eu não vou inventar." },
        { role:"agent", kind:"diagnostico", text:"O dentista sente a dor (aperto apesar do faturamento alto) mas acha que o problema é 'ganhar mais' ou 'cortar gasto'. Não enxerga a causa. Tráfego frio, então o lead abre agitando a dor nomeada, nunca pelo mecanismo. Mecanismo: problema = 'Caixa Único' (PF e PJ misturados, a clínica come o salário antes dele ver); solução = 'Separação em 3 Caixas' (clínica, pró-labore, reserva). O dinheiro não muda, ele para de sumir porque ele enxerga quanto é dele." },
        { role:"agent", kind:"output", text:"LEAD (0:00-0:45): 'Se você é dentista, fatura mais de R$ 40 mil por mês e mesmo assim chega no fim do mês sem saber pra onde foi o dinheiro... o problema não é o que te disseram. Não tem nada a ver com ganhar mais. Tem a ver com um erro que quase todo dentista comete, e que ninguém te ensinou na faculdade nem o seu contador te falou.'" },
        { role:"agent", kind:"message", text:"[SUPOSIÇÃO - confirme] Você disse que atendeu ~30 dentistas mas não passou case. Não vou inventar 'dentista que economizou R$ X'. Me mande 1-2 cases reais ou rode /message-mining nos seus atendimentos. Sem isso o bloco de prova fica oco e a VSL não sustenta o ticket de R$ 3.500." }
      ]
    }
  ];
  
  const tabsEl = document.getElementById('tabs');
  const live = document.getElementById('chatLive');
  const staticEl = document.getElementById('chatStatic');
  const agName = document.getElementById('agName');
  const agCmd = document.getElementById('agCmd');
  const provesEl = document.getElementById('proves');
  let cur = 0, playToken = 0;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.body.classList.add('js');
  function whoLabel(t){ return t.role === 'user' ? 'Você' : (t.kind==='output' ? 'Output' : (t.kind==='diagnostico' ? 'Diagnóstico' : 'Agente')); }
  function bubbleHTML(t){
    const cls = t.role === 'agent' ? ('bub ' + t.kind) : 'bub';
    return '<div class="row '+t.role+'"><div class="'+cls+'"><div class="who">'+whoLabel(t)+'</div>'+escapeHtml(t.text)+'</div></div>';
  }
  function escapeHtml(s){ return s.replace(/[&<>]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }
  function renderStatic(d){ staticEl.innerHTML = d.turns.map(bubbleHTML).join(''); }
  function renderTabs(){
    tabsEl.innerHTML = DATA.map((d,i)=>'<button class="tab" role="tab" aria-controls="chatLive" aria-selected="'+(i===cur)+'" data-i="'+i+'">'+d.agent+'</button>').join('');
    tabsEl.querySelectorAll('.tab').forEach(b=>b.onclick=()=>select(+b.dataset.i));
  }
  function select(i){
    cur = i; const d = DATA[i];
    agName.textContent = d.agent; agCmd.textContent = d.command;
    provesEl.innerHTML = '<b>O que isso prova:</b> ' + escapeHtml(d.proves);
    renderStatic(d);
    tabsEl.querySelectorAll('.tab').forEach(b=>b.setAttribute('aria-selected', (+b.dataset.i===i)));
    play(d);
  }
  function delayFor(text){ return Math.min(1400, 350 + text.length * 12); }
  async function play(d){
    const token = ++playToken;
    live.innerHTML = '';
    for(const t of d.turns){
      if(token !== playToken) return;
      if(t.role === 'agent' && !reduce){
        const typ = document.createElement('div');
        typ.className = 'row agent';
        typ.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';
        live.appendChild(typ); scrollEnd();
        await sleep(delayFor(t.text)); if(token!==playToken) return;
        typ.remove();
      }
      const wrap = document.createElement('div');
      wrap.innerHTML = bubbleHTML(t);
      const row = wrap.firstChild;
      live.appendChild(row); scrollEnd();
      await sleep(reduce ? 140 : 520); if(token!==playToken) return;
    }
  }
  function scrollEnd(){ live.scrollTop = live.scrollHeight; }
  function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
  document.getElementById('replay').onclick = ()=>play(DATA[cur]);
  renderTabs();
  renderStatic(DATA[0]);
  provesEl.innerHTML = '<b>O que isso prova:</b> ' + escapeHtml(DATA[0].proves);
  let autostarted = false;
  function autostart(){ if(autostarted) return; autostarted = true; play(DATA[cur]); }
  try{
    const io = new IntersectionObserver((es)=>{ es.forEach(e=>{ if(e.isIntersecting) autostart(); }); }, {threshold:.2});
    io.observe(live);
  }catch(e){}
  setTimeout(autostart, 900);
  
  }
  // ---- script #3 ----
  {

  (function(){
    [].forEach.call(document.querySelectorAll('#faq .faq-q'),function(btn){
      var panel=btn.nextElementSibling;
      if(btn.getAttribute('aria-expanded')==='true'&&panel) panel.classList.add('open');
      btn.addEventListener('click',function(){
        var open=btn.getAttribute('aria-expanded')!=='true';
        btn.setAttribute('aria-expanded',open?'true':'false');
        if(panel) panel.classList.toggle('open',open);
      });
    });
  })();
  
  }
  // ---- script #4 ----
  {

  (function(){
    // ---- MorphingText (port fiel da Magic UI: morphTime 1.5 / cooldown .5) ----
    var texts = ["copy","tráfego","vendas","ofertas","conteúdo","branding","estratégia"];
    var morphTime = 1.5, cooldownTime = 0.5;
    var wrap = document.getElementById('morph');
    var ms = wrap.querySelectorAll('.m'); var t1 = ms[0], t2 = ms[1];
    t1.textContent = texts[0]; t2.textContent = texts[1];
    var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    if(reduce){ wrap.style.filter='none'; t1.style.opacity='100%'; t2.style.opacity='0%'; return; }
    var vis=true;
    if('IntersectionObserver' in window){ new IntersectionObserver(function(e){vis=e[0].isIntersecting;},{threshold:0}).observe(wrap); }
    var idx=0, morph=0, cooldown=0, time=new Date(), curFilt='none', restDone=false;
    function setFilt(v){ if(curFilt!==v){curFilt=v;wrap.style.filter=v;} }
    function setStyles(frac){
      setFilt('url(#threshold)'); restDone=false;
      t2.style.filter='blur('+Math.min(8/frac-8,100)+'px)'; t2.style.opacity=Math.pow(frac,0.4)*100+'%';
      var inv=1-frac; t1.style.filter='blur('+Math.min(8/inv-8,100)+'px)'; t1.style.opacity=Math.pow(inv,0.4)*100+'%';
      t1.textContent=texts[idx%texts.length]; t2.textContent=texts[(idx+1)%texts.length];
    }
    function doMorph(){ morph-=cooldown; cooldown=0; var frac=morph/morphTime; if(frac>1){cooldown=cooldownTime;frac=1;} setStyles(frac); if(frac===1)idx++; }
    function doCooldown(){ if(restDone)return; restDone=true; morph=0; setFilt('none'); t2.style.filter='none';t2.style.opacity='100%'; t1.style.filter='none';t1.style.opacity='0%'; }
    (function animate(){ requestAnimationFrame(animate); if(!vis||document.hidden){ time=new Date(); return; } var now=new Date(); var dt=(now-time)/1000; time=now; cooldown-=dt; if(cooldown<=0)doMorph(); else doCooldown(); })();
  })();
  
    // ORBITA — escala raios/tiles ao tamanho medido do container (mecanica Magic UI real preservada)
    (function(){
      var scene=document.getElementById('orbit'); if(!scene)return;
      var BASE=560;                                   // container-base dos raios/tiles inline no HTML
      var rings=scene.querySelectorAll('.orbit-ring circle');
      var items=scene.querySelectorAll('.orbit-item');
      var baseR=[], baseSize=[], baseRing=[];
      [].forEach.call(items,function(el){ baseR.push(parseFloat(el.style.getPropertyValue('--radius'))); baseSize.push(parseFloat(el.style.getPropertyValue('--icon-size'))); });
      [].forEach.call(rings,function(c){ baseRing.push(parseFloat(c.getAttribute('r'))); });
      function layout(){
        var d=scene.clientWidth||parseFloat(getComputedStyle(scene).width);
        var k=d/BASE;                                 // fator unico -> raio E tile escalam juntos (folga mantida)
        [].forEach.call(rings,function(c,i){ c.setAttribute('r',(baseRing[i]*k).toFixed(1)); });
        [].forEach.call(items,function(el,i){ el.style.setProperty('--radius',(baseR[i]*k).toFixed(2)); el.style.setProperty('--icon-size',(baseSize[i]*k).toFixed(1)+'px'); });
      }
      layout();
      var raf; window.addEventListener('resize',function(){ cancelAnimationFrame(raf); raf=requestAnimationFrame(layout); });
      if(document.fonts&&document.fonts.ready) document.fonts.ready.then(layout);
    })();
  
  }
  // ---- script #5 ----
  {

  (function(){
    var root=document.documentElement;
    root.classList.remove('no-js'); root.classList.add('js');
    var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    var els=[].slice.call(document.querySelectorAll('.reveal'));
    if(reduce||!('IntersectionObserver' in window)){els.forEach(function(el){el.classList.add('in');});return;}
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if(e.isIntersecting){var t=e.target;t.style.willChange='opacity,transform';t.classList.add('in');io.unobserve(t);t.addEventListener('transitionend',function(){t.style.willChange='auto';},{once:true});} });
    },{root:null,rootMargin:'0px 0px -12% 0px',threshold:0.12});
    els.forEach(function(el){io.observe(el);});
    setTimeout(function(){
      els.forEach(function(el){
        if(el.classList.contains('in'))return;
        var r=el.getBoundingClientRect();
        if(r.top<innerHeight&&r.bottom>0){el.classList.add('in');}
      });
    },1600);
  })();
  
  }
}
