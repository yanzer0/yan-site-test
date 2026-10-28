(() => {
  "use strict";
  const form = document.getElementById("acesso-guias") || document.getElementById("preferencias-guias");
  if (form) {
    const button = document.getElementById("enviar-cadastro");
    const summary = document.getElementById("erro-formulario");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      summary.hidden = true;
      form.querySelectorAll("[aria-invalid]").forEach((field) => field.removeAttribute("aria-invalid"));
      form.querySelectorAll(".field-error").forEach((message) => { message.textContent = ""; });
      if (!form.reportValidity()) return;
      const label = button.firstElementChild.textContent;
      button.disabled = true;
      button.firstElementChild.textContent = "Abrindo o seu material...";
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 18000);
      try {
        const payload = Object.fromEntries(new FormData(form));
        payload.consentimentos = { comercial: form.elements.namedItem("consent_comercial")?.checked === true, publicidade: form.elements.namedItem("consent_publicidade")?.checked === true };
        if (payload.consentimentos.publicidade && form.id === "acesso-guias") payload.marketing = window.infuserGuiasMarketing();
        const response = await fetch(form.action, { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), signal: controller.signal });
        const result = await response.json();
        if (!response.ok) {
          Object.entries(result.campos || {}).forEach(([name, message]) => {
            const field = form.elements.namedItem(name);
            const error = document.getElementById(`erro-${name}`);
            if (field instanceof HTMLElement) field.setAttribute("aria-invalid", "true");
            if (error) error.textContent = String(message);
          });
          throw new Error(result.erro || "Confira os campos e tente novamente.");
        }
        if (typeof result.destino !== "string" || !/^\/(?!\/)/.test(result.destino)) throw new Error("Atualize a página e tente novamente.");
        if (form.id === "preferencias-guias") window.infuserGuiasPreferenciasAlteradas(payload.consentimentos.publicidade);
        window.location.assign(result.destino);
      } catch (error) {
        summary.textContent = error instanceof Error && error.name !== "AbortError" ? error.message : "O envio demorou mais do que o esperado. Confira a sua conexão e tente novamente.";
        summary.hidden = false;
        const invalid = form.querySelector("[aria-invalid=true]");
        (invalid || summary).focus();
        button.disabled = false;
        button.firstElementChild.textContent = label;
      } finally { clearTimeout(timeout); }
    });
  }

  const search = document.getElementById("buscar-guias");
  if (!search) return;
  const cards = Array.from(document.querySelectorAll("[data-guia]"));
  const filters = Array.from(document.querySelectorAll("[data-filtro]"));
  let category = "todos";
  const filterCards = () => {
    const query = search.value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    let visible = 0;
    cards.forEach((card) => {
      card.hidden = !((category === "todos" || card.dataset.categoria === category) && card.dataset.busca.includes(query));
      if (!card.hidden) visible += 1;
    });
    document.getElementById("resultado-busca").textContent = `${visible} ${visible === 1 ? "guia disponível" : "guias disponíveis"}`;
    document.getElementById("sem-guias").hidden = visible !== 0;
  };
  search.addEventListener("input", filterCards);
  filters.forEach((filter) => filter.addEventListener("click", () => {
    category = filter.dataset.filtro;
    filters.forEach((item) => { const active = item === filter; item.classList.toggle("active", active); item.setAttribute("aria-pressed", String(active)); });
    filterCards();
  }));
  document.getElementById("limpar-busca").addEventListener("click", () => { search.value = ""; filters[0].click(); search.focus(); });
})();
