(() => {
  "use strict";
  const cookiesPermitidos = ["_fbp", "_fbc", "_ga", "_ga_D7W2XG1MCF", "_gcl_au", "_ttp"];
  const nomesCampanha = ["utm_source", "utm_medium", "utm_campaign", "utm_id", "utm_term", "utm_content", "fbclid", "gclid", "msclkid", "ttclid", "sck"];
  window.infuserGuiasMarketing = () => ({
    campanha: Object.fromEntries(nomesCampanha.flatMap((nome) => { const valor = new URLSearchParams(location.search).get(nome); return valor ? [[nome, valor]] : []; })), referencia: document.referrer,
    navegador: { idioma: navigator.language, idiomas: Array.from(navigator.languages || []), plataforma: navigator.platform, fuso: Intl.DateTimeFormat().resolvedOptions().timeZone, tela: { largura: screen.width, altura: screen.height }, janela: { largura: innerWidth, altura: innerHeight } },
  });
  const canal = typeof BroadcastChannel === "function" ? new BroadcastChannel("infuser-guias-preferencias") : null;
  window.infuserGuiasPreferenciasAlteradas = (publicidade) => {
    canal?.postMessage({ publicidade });
    if (!publicidade) for (const nome of cookiesPermitidos) {
      document.cookie = `${nome}=; Max-Age=0; Path=/; SameSite=Lax`;
      document.cookie = `${nome}=; Max-Age=0; Path=/; Domain=.useinfuser.com; SameSite=Lax`;
    }
  };
  if (canal) canal.onmessage = (event) => { if (event.data?.publicidade === false) location.reload(); };
  if (!document.querySelector('a[href="/guias/preferencias"]')) {
    const a = document.createElement("a"); a.href = "/guias/preferencias"; a.textContent = "Preferências de privacidade"; a.className = "infuser-privacy-link";
    const css = document.createElement("link"); css.rel = "stylesheet"; css.href = "/guias/marketing.css"; document.head.append(css); document.body.append(a);
  }
  if (location.pathname === "/guias/acesso" || location.pathname === "/guias/preferencias") return;
  fetch("/api/guias/preferencias", { credentials: "same-origin", cache: "no-store" }).then((r) => r.ok ? r.json() : null).then((p) => {
    if (!p?.publicidade || window.__infuserGtmLoaded) return;
    window.__infuserGtmLoaded = true;
    window.dataLayer = window.dataLayer || []; window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    const script = document.createElement("script"); script.async = true; script.id = "infuser-gtm";
    script.src = "https://api.useinfuser.com/etrthkooc.js?7=CgtSLDw5X0EwOTcoUUFEUhVSXUVZUhYaXhocDgEaFAEQCh1FCxsf";
    script.onload = () => setTimeout(() => { fetch("/api/guias/preferencias", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ acao: "medicao", navegador: window.infuserGuiasMarketing().navegador }) }).catch(() => {}); }, 2000);
    document.head.append(script);
  }).catch(() => { /* Missing consent state never loads advertising. */ });
})();
