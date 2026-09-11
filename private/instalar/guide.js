(() => {
  "use strict";

  const STORAGE_KEY = "infuser-segundo-cerebro-guide";
  const PUBLIC_ASSET = "/instalar/assets/public/";
  const allowedPlatforms = new Set(["windows", "mac", "linux"]);
  const allowedApps = new Set(["claude", "codex", "both"]);

  const platformNames = {
    windows: "Windows",
    mac: "macOS",
    linux: "Linux",
  };

  const appNames = {
    claude: "Claude",
    codex: "Codex",
    both: "Claude + Codex",
  };

  const icons = {
    download: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0 5-5m-5 5-5-5M5 20h14"/></svg>',
    copy: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>',
    external: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 5h5v5M19 5l-8 8M11 6H6a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-5"/></svg>',
  };

  const state = loadState();
  let currentSteps = [];
  let toastTimer = 0;

  const elements = {
    setup: document.querySelector("#setup"),
    wizard: document.querySelector("#wizard"),
    success: document.querySelector("#success-state"),
    platformOptions: document.querySelector("#platform-options"),
    appSelector: document.querySelector("#app-selector"),
    startGuide: document.querySelector("#start-guide"),
    changeRoute: document.querySelector("#change-route"),
    routeBadge: document.querySelector("#route-badge"),
    progressList: document.querySelector("#progress-list"),
    stepCount: document.querySelector("#step-count"),
    stepKicker: document.querySelector("#step-kicker"),
    stepTitle: document.querySelector("#step-title"),
    stepDescription: document.querySelector("#step-description"),
    stepActions: document.querySelector("#step-actions"),
    stepCallout: document.querySelector("#step-callout"),
    stepLayout: document.querySelector("#step-layout"),
    visualColumn: document.querySelector("#visual-column"),
    screenshotTrigger: document.querySelector("#screenshot-trigger"),
    stepImage: document.querySelector("#step-image"),
    imageCaption: document.querySelector("#image-caption"),
    previousStep: document.querySelector("#previous-step"),
    completeStep: document.querySelector("#complete-step"),
    completionRing: document.querySelector("#completion-ring"),
    completionValue: document.querySelector("#completion-value"),
    savedStatus: document.querySelector("#saved-status"),
    lightbox: document.querySelector("#lightbox"),
    lightboxImage: document.querySelector("#lightbox-image"),
    lightboxCaption: document.querySelector("#lightbox-caption"),
    lightboxClose: document.querySelector("#lightbox-close"),
    toast: document.querySelector("#toast"),
    reviewGuide: document.querySelector("#review-guide"),
    restartGuide: document.querySelector("#restart-guide"),
  };

  function loadState() {
    const fallback = { platform: null, app: null, step: 0, completed: [], started: false, finished: false };
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!parsed || !allowedPlatforms.has(parsed.platform) || !allowedApps.has(parsed.app)) return fallback;
      return {
        platform: parsed.platform,
        app: parsed.app,
        step: Number.isInteger(parsed.step) && parsed.step >= 0 ? parsed.step : 0,
        completed: Array.isArray(parsed.completed) ? parsed.completed.filter(Number.isInteger) : [],
        started: Boolean(parsed.started),
        finished: Boolean(parsed.finished),
      };
    } catch {
      return fallback;
    }
  }

  function saveState(message = "Progresso salvo neste navegador") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      elements.savedStatus.textContent = message;
    } catch {
      elements.savedStatus.textContent = "Progresso ativo nesta sessão";
    }
  }

  function isCodexRoute(app = state.app) {
    return app === "codex" || app === "both";
  }

  function isClaudeRoute(app = state.app) {
    return app === "claude" || app === "both";
  }

  function actionLink(label, href) {
    return { type: "link", label, href };
  }

  function actionDownload(label, href, filename) {
    return { type: "download", label, href, filename };
  }

  function step(config) {
    return {
      kicker: "INSTALAÇÃO",
      image: null,
      imageAlt: "",
      caption: "",
      command: null,
      actions: [],
      callout: null,
      ...config,
    };
  }

  function buildDownloadStep(platform, app) {
    const actions = [];
    const requirements = [];

    if (platform === "windows") {
      actions.push(actionLink("Baixar Git para Windows", "https://git-scm.com/install/windows"));
      requirements.push("Instale o Git para que a aba Code reconheça projetos e pastas.");
    }

    if (isClaudeRoute(app)) {
      actions.push(actionLink("Baixar Claude", "https://claude.com/download"));
      requirements.push("Abra o Claude, entre na sua conta e confirme que a aba Code aparece.");
    }

    if (isCodexRoute(app)) {
      const chatgptUrl = platform === "windows"
        ? "https://get.microsoft.com/installer/download/9PLM9XGG6VKS?cid=website_cta_psi"
        : platform === "linux"
          ? "https://learn.chatgpt.com/docs/linux/linux-app"
          : "https://chatgpt.com/download";
      actions.push(actionLink("Baixar ChatGPT com Codex", chatgptUrl));
      requirements.push("Abra o ChatGPT, entre na sua conta e selecione Codex na barra lateral.");
    }

    if (platform === "linux") {
      return step({
        kicker: "ANTES DE COMEÇAR",
        label: "Preparar o Linux",
        title: "Confirme a versão do seu sistema.",
        body: `<p>O caminho Linux tem cobertura menor que Windows e macOS. Use <strong>Ubuntu 22.04 ou Debian 12, ou versões mais novas</strong>.</p><ul>${requirements.map((item) => `<li>${item}</li>`).join("")}</ul>`,
        actions,
        callout: "<strong>Transparência:</strong> o instalador foi construído para Linux, mas esta rota ainda não recebeu a mesma prova visual ponta a ponta dos outros sistemas.",
      });
    }

    return step({
      kicker: "ANTES DE COMEÇAR",
      label: "Preparar os aplicativos",
      title: "Deixe os aplicativos prontos.",
      body: `<p>Instale apenas o que você escolheu e entre nas suas contas. O cérebro será uma pasta local que os aplicativos podem abrir.</p><ul>${requirements.map((item) => `<li>${item}</li>`).join("")}</ul>`,
      actions,
      callout: platform === "windows"
        ? "<strong>Não pule o Git.</strong> No Windows, ele é necessário para o fluxo de projeto do Claude e melhora a integração do Codex."
        : "<strong>Mac Intel ou Apple Silicon:</strong> use sempre o instalador atual do site oficial.",
    });
  }

  function buildSteps(platform, app) {
    const steps = [buildDownloadStep(platform, app)];

    steps.push(step({
      kicker: "O PACOTE",
      label: "Abrir o instalador",
      title: "Baixe e descompacte antes de abrir.",
      body: `<p><strong>Baixe o pacote pelo botão abaixo.</strong> Quando terminar, localize o arquivo <strong>segundo-cerebro-autonomo.zip</strong>, descompacte e abra a pasta resultante como projeto.</p><ul><li>No Claude, use a aba Code e selecione a pasta.</li><li>No Codex, crie um projeto com a pasta descompactada.</li></ul>`,
      actions: [actionDownload("Baixar o Segundo Cérebro", "/instalar/download", "segundo-cerebro-autonomo.zip")],
      callout: "No Codex, não anexe o ZIP ao chat. O fluxo validado é abrir a pasta descompactada como projeto.",
    }));

    if (isCodexRoute(app)) {
      steps.push(step({
        kicker: "ACESSO À PASTA",
        label: "Adicionar Documentos",
        title: "Dê acesso ao destino.",
        body: `<p>Ao criar o projeto do instalador no Codex, mantenha a pasta descompactada como principal e adicione também <strong>Documentos</strong> em “Pastas de origem”.</p><p>É lá que o cérebro será criado por padrão.</p>`,
        image: "codex-projeto-com-documents.png",
        imageAlt: "Janela Criar projeto do Codex com a pasta do instalador e Documents adicionadas",
        caption: "O projeto precisa mostrar as duas pastas antes da instalação.",
        callout: "Acesso completo não adiciona uma pasta ao projeto sozinho. As duas configurações são necessárias.",
      }));

      steps.push(step({
        kicker: "PERMISSÕES",
        label: "Ativar Acesso completo",
        title: "Evite pausas durante a instalação.",
        body: `<p>Na barra inferior do Codex, abra o menu de permissões e escolha <strong>Acesso completo</strong>. Leia o aviso e confirme.</p><p>Quando terminar, você pode voltar ao modo de aprovação que preferir.</p>`,
        image: "codex-menu-acesso.png",
        imageAlt: "Menu de permissões do Codex com a opção Acesso completo",
        caption: "Escolha Acesso completo durante a instalação.",
        callout: "<strong>Esse modo é amplo:</strong> permite comandos, internet e edição de arquivos sem nova confirmação. Use somente nesta instalação e com o pacote oficial.",
      }));

      steps.push(step({
        kicker: "CONFIRMAÇÃO",
        label: "Confirmar o acesso",
        title: "Confirme a tela de risco.",
        body: `<p>O Codex mostra uma segunda confirmação antes de liberar o acesso. Verifique se você está no projeto do instalador e clique em <strong>Confirmar</strong>.</p>`,
        image: "codex-confirmar-acesso.png",
        imageAlt: "Confirmação do Codex para ativar Acesso completo",
        caption: "A confirmação existe para evitar acesso amplo por engano.",
      }));
    }

    if (platform === "mac" && isClaudeRoute(app)) {
      steps.push(step({
        kicker: "PERMISSÃO DO MAC",
        label: "Permitir outros apps",
        title: "Autorize o macOS uma vez.",
        body: `<p>O macOS pode perguntar se o Claude pode acessar dados de outros aplicativos. Clique em <strong>Permitir</strong> para que ele consiga ler o pacote baixado.</p>`,
        image: "mac-permissao-outros-apps.png",
        imageAlt: "Aviso do macOS pedindo permissão para o Claude acessar dados de outros aplicativos",
        caption: "Essa janela é do macOS e pode aparecer somente na primeira vez.",
      }));
    }

    if (isClaudeRoute(app)) {
      steps.push(step({
        kicker: "PERMISSÕES",
        label: "Usar modo Automático",
        title: "Deixe o Claude concluir sem parar.",
        body: `<p>Na barra inferior do Claude, abra “Aceitar edições” e escolha <strong>Automático</strong>. Se uma confirmação de comando aparecer, escolha “Sempre permitir” durante esta instalação.</p>`,
        image: platform === "mac" ? "mac-permissao-comando.png" : null,
        imageAlt: "Confirmação para o Claude executar o comando de inspeção do pacote",
        caption: "Escolha Sempre permitir para não interromper a instalação.",
        callout: "O instalador só cria arquivos locais e baixa o Node do site oficial se ele ainda não existir.",
      }));
    }

    steps.push(step({
      kicker: "O PEDIDO",
      label: "Pedir a instalação",
      title: "Envie uma frase. Só isso.",
      body: `<p>Na conversa aberta dentro da pasta do instalador, cole a frase abaixo. O agente vai ler o roteiro e fará uma pergunta por vez.</p>`,
      command: "instala meu segundo cérebro",
      callout: "Não cole comandos de terminal. A frase chama o instalador guiado.",
    }));

    if (isClaudeRoute(app)) {
      // A interface interna do Claude é compartilhada entre plataformas; telas do sistema continuam específicas.
      steps.push(step({
        kicker: "PRIMEIRA RESPOSTA",
        label: "Escolher a pasta",
        title: "Diga onde ele deve morar.",
        body: `<p>Escolha a pasta onde o cérebro será criado. Se não tiver preferência, responda <strong>pode ser em Documentos</strong>.</p>`,
        image: "mac-escolher-pasta.png",
        imageAlt: "Claude perguntando onde o segundo cérebro deve ser salvo",
        caption: "O destino precisa ser uma pasta nova ou vazia.",
        callout: "Se a pasta já existir e tiver arquivos, escolha outro nome, como Segundo Cerebro 2.",
      }));

      steps.push(step({
        kicker: "SEGUNDA RESPOSTA",
        label: "Escolher os aplicativos",
        title: "Confirme onde você vai usar.",
        body: `<p>Escolha <strong>Claude</strong>, <strong>Codex</strong> ou <strong>os dois</strong>. A mesma pasta pode ser aberta pelos dois aplicativos.</p>`,
        image: "mac-escolher-app.png",
        imageAlt: "Claude perguntando em quais aplicativos o segundo cérebro será usado",
        caption: "Escolha os dois para compartilhar o mesmo cérebro entre Claude e Codex.",
      }));
    } else {
      steps.push(step({
        kicker: "DUAS RESPOSTAS",
        label: "Escolher pasta e apps",
        title: "Diga onde ele deve morar.",
        body: `<p>Primeiro, escolha a pasta. Se não tiver preferência, responda <strong>pode ser em Documentos</strong>.</p><p>Depois, confirme se vai usar Claude, Codex ou os dois.</p>`,
        callout: "Se a pasta já existir e tiver arquivos, escolha outro nome, como Segundo Cerebro 2.",
      }));
    }

    steps.push(step({
      kicker: "INSTALAÇÃO",
      label: "Esperar as provas",
      title: "Espere a confirmação completa.",
      body: `<p>A instalação pode levar um minuto se precisar baixar o Node. Considere concluído somente quando aparecerem as linhas de <strong>PROVA</strong> e o caminho exato da pasta criada.</p>`,
      image: app === "claude" ? "mac-instalacao-concluida.png" : "codex-instalacao-concluida.png",
      imageAlt: app === "claude"
        ? "Claude confirmando a instalação com todas as verificações aprovadas"
        : "Codex confirmando a instalação com todas as verificações aprovadas",
      caption: "A instalação terminou quando todas as verificações passam e o caminho da nova pasta aparece.",
      callout: "Se aparecer FALHA, pare e envie um print ao suporte. Não repita o comando várias vezes.",
    }));

    steps.push(step({
      kicker: "A PASTA NOVA",
      label: "Abrir o cérebro",
      title: "Troque para o projeto criado.",
      body: `<p>Feche a conversa do instalador. No aplicativo, abra a pasta nova que apareceu no resultado.</p><p>Se o aplicativo perguntar se você confia nela, confirme.</p>`,
      image: isCodexRoute(app) ? "codex-selecionar-pasta.png" : (platform === "mac" ? "mac-confiar-workspace.png" : null),
      imageAlt: isCodexRoute(app)
        ? "Seletor de pasta com Segundo Cerebro destacado"
        : "Janela pedindo para confiar no workspace do Segundo Cerebro",
      caption: "Abra a pasta criada, não a pasta antiga do instalador.",
    }));

    const startCommand = app === "claude" ? "/comecar" : "$comecar";
    steps.push(step({
      kicker: "PRIMEIRA CONVERSA",
      label: "Começar o cérebro",
      title: "Apresente-se ao seu cérebro.",
      body: `<p>Crie uma conversa dentro do projeto novo e envie o comando abaixo. Responda às perguntas com suas próprias palavras.</p>`,
      command: startCommand,
      image: app === "claude" ? "claude-comecar.png" : "codex-comecar.png",
      imageAlt: app === "claude"
        ? "Comando começar iniciando a entrevista no Claude"
        : "Skill começar do Segundo Cerebro iniciando a entrevista no Codex",
      caption: "A primeira pergunta pede seu nome e o que você faz.",
      callout: app === "both"
        ? "No Claude, use /comecar. No Codex, use $comecar. Você só precisa concluir a entrevista uma vez no mesmo cérebro."
        : "A entrevista leva cerca de 5 minutos e pode ser refinada depois.",
    }));

    if (isCodexRoute(app)) {
      steps.push(step({
        kicker: "AUTOMAÇÃO",
        label: "Ligar os 8 hooks",
        title: "Ative a memória automática.",
        body: `<p>Depois que a primeira pergunta aparecer, abra <strong>Configurações → Hooks</strong>. Entre no projeto, revise e ligue os 8 hooks.</p><p>Se a tela estiver vazia, volte ao chat, envie <strong>$comecar</strong> uma vez e atualize a tela de Hooks.</p>`,
        image: "codex-hooks-ligados.png",
        imageAlt: "Tela do Codex com os oito hooks do Segundo Cerebro ligados",
        caption: "Os controles azuis confirmam que os hooks foram aprovados.",
        callout: "Depois de aprovar os hooks, abra uma conversa nova. Assim o contexto inicial também é carregado.",
      }));
    }

    steps.push(step({
      kicker: "PRONTO PARA USAR",
      label: "Concluir",
      title: "Faça a primeira pergunta real.",
      body: `<p>Abra uma conversa nova e pergunte <strong>qual é o próximo passo?</strong> O cérebro já pode usar seu contexto, seus projetos e suas pendências para responder.</p><ul><li>Use ${app === "claude" ? "/daily-briefing" : "$daily-briefing"} para começar o dia.</li><li>Use ${app === "claude" ? "/end-session" : "$end-session"} para fechar uma sessão importante.</li><li>Converse normalmente no restante do tempo.</li></ul>`,
      command: "qual é o próximo passo?",
      callout: "O cérebro só lembra o que foi salvo nas notas. Fechar sessões importantes é o que transforma conversa em memória.",
    }));

    return steps;
  }

  function selectOption(group, attribute, value) {
    document.querySelectorAll(`[${attribute}]`).forEach((button) => {
      button.setAttribute("aria-pressed", String(button.getAttribute(attribute) === value));
    });
  }

  function updateSetup() {
    selectOption(elements.platformOptions, "data-platform", state.platform);
    selectOption(elements.appSelector, "data-app", state.app);
    elements.appSelector.hidden = !state.platform;
    elements.startGuide.disabled = !(state.platform && state.app);
  }

  function renderActions(stepData) {
    elements.stepActions.replaceChildren();

    if (stepData.command) {
      const block = document.createElement("div");
      block.className = "command-block";
      const code = document.createElement("code");
      code.textContent = stepData.command;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "copy-button";
      button.innerHTML = `${icons.copy}<span>Copiar</span>`;
      button.addEventListener("click", () => copyText(stepData.command, button));
      block.append(code, button);
      elements.stepActions.append(block);
    }

    for (const action of stepData.actions) {
      if (action.type !== "link" && action.type !== "download") continue;
      const isDownload = action.type === "download";
      const link = document.createElement("a");
      link.className = isDownload ? "download-link download-link--primary" : "download-link";
      link.href = action.href;
      if (isDownload) {
        link.download = action.filename;
      } else {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      }
      link.innerHTML = `${isDownload ? icons.download : icons.external}<span>${action.label}</span>`;
      elements.stepActions.append(link);
    }
  }

  async function copyText(text, button) {
    let copied = false;
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.append(textarea);
      textarea.select();
      copied = document.execCommand("copy");
      textarea.remove();
    }

    if (copied) {
      const label = button.querySelector("span");
      const previous = label.textContent;
      label.textContent = "Copiado";
      showToast("Copiado para a área de transferência.");
      window.setTimeout(() => { label.textContent = previous; }, 1500);
    } else {
      showToast("Selecione o texto e copie manualmente.");
    }
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    elements.toast.textContent = message;
    elements.toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => elements.toast.classList.remove("is-visible"), 2200);
  }

  function revisitStep(targetStep) {
    if (!Number.isInteger(targetStep) || targetStep < 0 || targetStep >= currentSteps.length) return;
    state.step = targetStep;
    state.completed = state.completed.filter((index) => index < targetStep);
    state.finished = false;
    saveState();
    renderStep();
  }

  function renderProgress() {
    elements.progressList.replaceChildren();
    const highestComplete = state.completed.length ? Math.max(...state.completed) : -1;
    const progress = currentSteps.length <= 1 ? 0 : Math.max(0, Math.min(100, (highestComplete / (currentSteps.length - 1)) * 100));
    elements.progressList.style.setProperty("--progress-height", `${progress}%`);

    currentSteps.forEach((stepData, index) => {
      const item = document.createElement("li");
      const complete = state.completed.includes(index);
      item.className = `progress-item${index === state.step ? " is-current" : ""}${complete ? " is-complete" : ""}`;
      const button = document.createElement("button");
      button.type = "button";
      button.disabled = !complete || index === state.step;
      button.setAttribute("aria-label", `${complete ? "Rever" : "Passo"} ${index + 1}: ${stepData.label}`);
      if (index === state.step) button.setAttribute("aria-current", "step");
      const dot = document.createElement("span");
      dot.className = "progress-dot";
      dot.textContent = complete ? "✓" : String(index + 1).padStart(2, "0");
      const label = document.createElement("span");
      label.className = "progress-label";
      label.textContent = stepData.label;
      button.append(dot, label);
      if (complete) {
        button.addEventListener("click", () => revisitStep(index));
      }
      item.append(button);
      elements.progressList.append(item);
    });
  }

  function renderStep({ focusTitle = false } = {}) {
    const stepData = currentSteps[state.step];
    if (!stepData) return showSuccess();

    elements.stepCount.textContent = `PASSO ${state.step + 1} DE ${currentSteps.length}`;
    elements.stepKicker.textContent = stepData.kicker;
    elements.stepTitle.textContent = stepData.title;
    elements.stepDescription.innerHTML = stepData.body;
    renderActions(stepData);

    elements.stepCallout.hidden = !stepData.callout;
    elements.stepCallout.innerHTML = stepData.callout || "";

    const hasImage = Boolean(stepData.image);
    elements.visualColumn.classList.toggle("is-text-only", !hasImage);
    elements.screenshotTrigger.hidden = !hasImage;
    elements.imageCaption.hidden = !hasImage || !stepData.caption;
    if (hasImage) {
      elements.stepImage.src = PUBLIC_ASSET + stepData.image;
      elements.stepImage.alt = stepData.imageAlt;
      elements.imageCaption.textContent = stepData.caption;
    } else {
      elements.stepImage.removeAttribute("src");
      elements.stepImage.alt = "";
    }

    elements.previousStep.disabled = state.step === 0;
    elements.previousStep.style.visibility = state.step === 0 ? "hidden" : "visible";
    elements.completeStep.querySelector("span").textContent = state.step === currentSteps.length - 1 ? "Concluir" : "Deu certo";

    const percent = Math.round((state.completed.filter((index) => index < currentSteps.length).length / currentSteps.length) * 100);
    const circumference = 2 * Math.PI * 18;
    elements.completionRing.style.setProperty("--ring-offset", String(circumference * (1 - percent / 100)));
    elements.completionRing.setAttribute("aria-label", `${percent} por cento concluído`);
    elements.completionValue.textContent = `${percent}%`;

    renderProgress();
    elements.stepLayout.classList.remove("is-entering");
    requestAnimationFrame(() => elements.stepLayout.classList.add("is-entering"));
    if (focusTitle) elements.stepTitle.focus?.();
  }

  function startGuide() {
    if (!allowedPlatforms.has(state.platform) || !allowedApps.has(state.app)) return;
    currentSteps = buildSteps(state.platform, state.app);
    state.started = true;
    state.finished = false;
    state.step = Math.min(state.step, currentSteps.length - 1);
    state.completed = state.completed.filter((index) => index < currentSteps.length);
    saveState();
    elements.setup.hidden = true;
    elements.success.hidden = true;
    elements.wizard.hidden = false;
    elements.routeBadge.textContent = `${platformNames[state.platform]} · ${appNames[state.app]}`;
    renderStep();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showSetup() {
    state.started = false;
    state.finished = false;
    saveState();
    elements.wizard.hidden = true;
    elements.success.hidden = true;
    elements.setup.hidden = false;
    updateSetup();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showSuccess() {
    state.finished = true;
    state.started = true;
    state.step = Math.max(0, currentSteps.length - 1);
    saveState("Instalação concluída");
    elements.setup.hidden = true;
    elements.wizard.hidden = true;
    elements.success.hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  elements.platformOptions.addEventListener("click", (event) => {
    const button = event.target.closest("[data-platform]");
    if (!button || !allowedPlatforms.has(button.dataset.platform)) return;
    state.platform = button.dataset.platform;
    state.app = null;
    state.step = 0;
    state.completed = [];
    updateSetup();
    saveState();
  });

  elements.appSelector.addEventListener("click", (event) => {
    const button = event.target.closest("[data-app]");
    if (!button || !allowedApps.has(button.dataset.app)) return;
    state.app = button.dataset.app;
    state.step = 0;
    state.completed = [];
    updateSetup();
    saveState();
  });

  elements.startGuide.addEventListener("click", startGuide);
  elements.changeRoute.addEventListener("click", showSetup);

  elements.previousStep.addEventListener("click", () => {
    if (state.step === 0) return;
    revisitStep(state.step - 1);
  });

  elements.completeStep.addEventListener("click", () => {
    if (!state.completed.includes(state.step)) state.completed.push(state.step);
    if (state.step >= currentSteps.length - 1) return showSuccess();
    state.step += 1;
    saveState();
    renderStep();
  });

  elements.screenshotTrigger.addEventListener("click", () => {
    const source = elements.stepImage.getAttribute("src");
    if (!source) return;
    elements.lightboxImage.src = source;
    elements.lightboxImage.alt = elements.stepImage.alt;
    elements.lightboxCaption.textContent = elements.imageCaption.textContent;
    elements.lightbox.showModal();
    elements.lightboxClose.focus();
  });

  elements.lightboxClose.addEventListener("click", () => elements.lightbox.close());
  elements.lightbox.addEventListener("click", (event) => {
    if (event.target === elements.lightbox) elements.lightbox.close();
  });

  elements.reviewGuide.addEventListener("click", () => {
    state.finished = false;
    state.started = true;
    state.step = Math.max(0, currentSteps.length - 1);
    saveState();
    elements.success.hidden = true;
    elements.wizard.hidden = false;
    renderStep();
  });

  elements.restartGuide.addEventListener("click", () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* armazenamento pode estar indisponível */ }
    Object.assign(state, { platform: null, app: null, step: 0, completed: [], started: false, finished: false });
    currentSteps = [];
    showSetup();
  });

  updateSetup();
  if (state.started && state.platform && state.app) {
    currentSteps = buildSteps(state.platform, state.app);
    if (state.finished) showSuccess();
    else startGuide();
  }
})();
