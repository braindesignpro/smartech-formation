/* Filtres page Intelligence artificielle + utilitaires partagés */
(function () {
  const publicSel = document.getElementById("ia-filter-public");
  const niveauSel = document.getElementById("ia-filter-niveau");
  const cards = Array.from(document.querySelectorAll("#ia-cards-grid .ia-card"));
  const status = document.getElementById("ia-filter-status");
  const empty = document.getElementById("ia-empty");
  const resetBtn = document.getElementById("ia-reset-filters");

  if (!cards.length || !publicSel || !niveauSel) return;

  function niveauxOf(card) {
    return String(card.dataset.niveau || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
  }

  function apply() {
    const pub = publicSel.value;
    const niv = niveauSel.value;
    let visible = 0;

    cards.forEach((card) => {
      const okPub = pub === "all" || card.dataset.public === pub;
      const niveaux = niveauxOf(card);
      const okNiv = niv === "all" || niveaux.includes(niv);
      const show = okPub && okNiv;
      card.classList.toggle("is-hidden", !show);
      if (show) visible += 1;
    });

    if (status) {
      status.textContent =
        visible === 0
          ? "Aucune formation pour ces filtres."
          : `${visible} formation${visible > 1 ? "s" : ""} affichée${visible > 1 ? "s" : ""}`;
    }
    if (empty) empty.hidden = visible > 0;
  }

  publicSel.addEventListener("change", apply);
  niveauSel.addEventListener("change", apply);
  resetBtn?.addEventListener("click", () => {
    publicSel.value = "all";
    niveauSel.value = "all";
    apply();
  });

  apply();
})();
