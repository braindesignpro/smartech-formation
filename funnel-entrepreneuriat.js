/* Tunnel entrepreneur — menu, confirmation, barre mobile */
(function () {
  const menuToggle = document.querySelector(".menu-toggle");
  const siteNav = document.getElementById("site-nav");

  if (menuToggle && siteNav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = siteNav.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        siteNav.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const confirmRoot = document.getElementById("funnel-confirm-root");
  if (confirmRoot) {
    const params = new URLSearchParams(window.location.search);
    const prenom = (params.get("prenom") || "").trim();
    const nameEl = confirmRoot.querySelector("[data-funnel-prenom]");
    const greetLine = document.getElementById("funnel-greet-line");
    if (prenom && nameEl) {
      nameEl.textContent = prenom;
      if (greetLine) greetLine.hidden = false;
    }
  }

  const yearNode = document.getElementById("year");
  if (yearNode) yearNode.textContent = `© ${new Date().getFullYear()}`;

  /* Envoi email — send-inscription.php (même dossier que cette page) */
  const funnelForm = document.querySelector("form.funnel-form[data-send-endpoint]");
  if (funnelForm) {
    const endpoint = funnelForm.getAttribute("data-send-endpoint") || "send-inscription.php";
    const statusEl = funnelForm.querySelector(".funnel-form-status");

    funnelForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!funnelForm.reportValidity()) return;

      const submitBtn = funnelForm.querySelector(".funnel-form-submit");
      const originalText = submitBtn ? submitBtn.textContent : "";

      if (statusEl) {
        statusEl.hidden = true;
        statusEl.textContent = "";
        statusEl.removeAttribute("data-variant");
      }
      if (submitBtn) {
        submitBtn.textContent = "Envoi en cours…";
        submitBtn.disabled = true;
      }

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          body: new FormData(funnelForm),
          headers: { Accept: "application/json" },
          credentials: "same-origin",
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok || data.ok !== true) {
          const msg =
            (data && data.error) ||
            "Envoi non confirmé. Utilisez WhatsApp ou rappelez-nous — aucun succès n’est simulé.";
          if (statusEl) {
            statusEl.textContent = msg;
            statusEl.dataset.variant = "error";
            statusEl.hidden = false;
          }
          if (submitBtn) {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
          }
          return;
        }

        const prenom = (data.prenom && String(data.prenom).trim()) || "";
        const q = prenom ? `?prenom=${encodeURIComponent(prenom)}` : "";
        window.location.href = `entrepreneuriat-confirmation.html${q}`;
      } catch {
        if (statusEl) {
          statusEl.textContent =
            "Erreur réseau. Réessayez ou contactez-nous par WhatsApp.";
          statusEl.dataset.variant = "error";
          statusEl.hidden = false;
        }
        if (submitBtn) {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        }
      }
    });
  }
})();
