/* ═══════════════════════════════════════════════
   formations.js — Smartech Formations Mahdia
   Filtres, recherche texte, reveal, navigation
═══════════════════════════════════════════════ */

/* ── Menu responsive (partagé) ──────────────── */
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.getElementById("site-nav");

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Fermer le menu" : "Ouvrir le menu");
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Ouvrir le menu");
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && siteNav.classList.contains("is-open")) {
      siteNav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.focus();
    }
  });
}

/* ── Filtres + recherche ─────────────────────── */
const filterBtns = document.querySelectorAll(".filter-btn");
const categoryBlocks = document.querySelectorAll(".category-block");
const searchInput = document.getElementById("catalogue-search");
const resultsStatus = document.getElementById("catalogue-results-status");
const emptyState = document.getElementById("catalogue-empty");

let activeFilter = "all";
let searchQuery = "";

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function cardMatchesSearch(card, query) {
  if (!query) return true;
  const hay = normalizeText(
    [
      card.getAttribute("data-search"),
      card.querySelector("h3")?.textContent,
      card.querySelector(".card-desc")?.textContent,
      card.querySelector(".card-category-tag")?.textContent,
      card.querySelector(".card-levels")?.textContent,
      ...Array.from(card.querySelectorAll(".card-details li")).map((li) => li.textContent),
    ]
      .filter(Boolean)
      .join(" ")
  );
  return query.split(/\s+/).every((token) => hay.includes(token));
}

function updateUrlState() {
  const url = new URL(window.location.href);
  if (activeFilter === "all") url.searchParams.delete("categorie");
  else url.searchParams.set("categorie", activeFilter);

  if (searchQuery) url.searchParams.set("q", searchQuery);
  else url.searchParams.delete("q");

  history.replaceState(null, "", url.toString());
}

function applyCatalogueView(options = {}) {
  const { scrollToFilter = false } = options;
  const q = normalizeText(searchQuery);
  let visibleCards = 0;

  filterBtns.forEach((btn) => {
    const isActive = btn.dataset.filter === activeFilter;
    btn.classList.toggle("is-active", isActive);
    btn.setAttribute("aria-selected", String(isActive));
  });

  categoryBlocks.forEach((block) => {
    const catOk = activeFilter === "all" || block.dataset.category === activeFilter;
    const cards = block.querySelectorAll(".formation-card");
    let blockVisible = 0;

    cards.forEach((card) => {
      const show = catOk && cardMatchesSearch(card, q);
      card.classList.toggle("is-hidden", !show);
      card.toggleAttribute("hidden", !show);
      if (show) {
        blockVisible += 1;
        visibleCards += 1;
      }
    });

    const showBlock = catOk && (q ? blockVisible > 0 : true);
    block.classList.toggle("is-hidden", !showBlock);
    block.toggleAttribute("hidden", !showBlock);
  });

  if (emptyState) {
    emptyState.hidden = visibleCards > 0;
  }

  if (resultsStatus) {
    const filterLabel =
      document.querySelector(`.filter-btn[data-filter="${activeFilter}"]`)?.textContent?.replace(/\d+/g, "").trim() ||
      "toutes";
    resultsStatus.textContent =
      visibleCards === 0
        ? "Aucune formation ne correspond à votre recherche."
        : `${visibleCards} formation${visibleCards > 1 ? "s" : ""} — filtre : ${filterLabel}${
            q ? ` · « ${searchQuery} »` : ""
          }`;
  }

  updateUrlState();

  if (scrollToFilter && activeFilter !== "all" && !q) {
    const target = document.querySelector(`#cat-${activeFilter}`);
    if (target && !target.hidden) {
      const offset = target.getBoundingClientRect().top + window.scrollY - 150;
      window.scrollTo({ top: offset, behavior: "smooth" });
    }
  }
}

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    activeFilter = btn.dataset.filter || "all";
    applyCatalogueView({ scrollToFilter: true });
  });
});

if (searchInput) {
  let debounce;
  searchInput.addEventListener("input", () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      searchQuery = searchInput.value.trim();
      applyCatalogueView();
    }, 160);
  });

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      searchInput.value = "";
      searchQuery = "";
      applyCatalogueView();
    }
  });
}

const clearSearchBtn = document.getElementById("catalogue-search-clear");
if (clearSearchBtn && searchInput) {
  clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    searchQuery = "";
    searchInput.focus();
    applyCatalogueView();
  });
}

/* Restaurer filtre + recherche depuis l’URL */
(function restoreFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const saved = params.get("categorie");
  const q = params.get("q");
  if (saved && document.querySelector(`.filter-btn[data-filter="${saved}"]`)) {
    activeFilter = saved;
  }
  if (q && searchInput) {
    searchInput.value = q;
    searchQuery = q;
  }
  applyCatalogueView();
})();

/* ── Sticky filters bar offset ─────────────── */
const header = document.querySelector(".site-header");
const filtersBar = document.getElementById("filters-bar-wrap");

function updateFiltersBarTop() {
  if (header && filtersBar) {
    filtersBar.style.top = `${header.offsetHeight - 1}px`;
  }
}

updateFiltersBarTop();
window.addEventListener("resize", updateFiltersBarTop);

/* ── Reveal on scroll ───────────────────────── */
const revealEls = document.querySelectorAll(".reveal");
const revealObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-visible");
      revealObs.unobserve(e.target);
    });
  },
  { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
);
revealEls.forEach((el) => revealObs.observe(el));

/* ── Header scrolled shadow ─────────────────── */
if (header) {
  const sentinel = document.createElement("div");
  sentinel.style.cssText =
    "position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none;";
  document.body.prepend(sentinel);

  new IntersectionObserver(([entry]) => {
    header.classList.toggle("is-scrolled", !entry.isIntersecting);
  }).observe(sentinel);
}

/* ── Smooth scroll ──────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const href = this.getAttribute("href");
    if (!href || href === "#") return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const hH = header ? header.offsetHeight : 0;
    const fH = filtersBar ? filtersBar.offsetHeight : 0;
    const top = target.getBoundingClientRect().top + window.scrollY - hH - fH - 12;
    window.scrollTo({ top, behavior: "smooth" });
  });
});

/* ── Year ───────────────────────────────────── */
const yearNode = document.getElementById("year");
if (yearNode) yearNode.textContent = `© ${new Date().getFullYear()}`;
