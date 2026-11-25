/* ═══════════════════════════════════════════════
   Smartech Formations Mahdia — app.js
   Menu, reveal, FAQ, form, year
═══════════════════════════════════════════════ */

/* ── Menu responsive ───────────────────────── */
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
      menuToggle.setAttribute("aria-label", "Ouvrir le menu");
      menuToggle.focus();
    }
  });
}

/* ── Reveal on scroll ───────────────────────── */
const revealElements = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.1, rootMargin: "0px 0px -48px 0px" }
);

revealElements.forEach((el) => revealObserver.observe(el));

/* ── Sticky header shadow ───────────────────── */
const header = document.querySelector(".site-header");

if (header) {
  const headerObserver = new IntersectionObserver(
    ([entry]) => {
      header.classList.toggle("is-scrolled", !entry.isIntersecting);
    },
    { threshold: 0 }
  );

  const sentinel = document.createElement("div");
  sentinel.style.cssText = "position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none;";
  document.body.prepend(sentinel);
  headerObserver.observe(sentinel);
}

/* ── Active nav link on scroll ──────────────── */
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".site-nav a[href^='#']");

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.getAttribute("id");
      navLinks.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
      });
    });
  },
  { threshold: 0.35 }
);

sections.forEach((section) => sectionObserver.observe(section));

/* ── Prefill formation depuis ?formation=… ─ */
function normalizeFormationKey(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[''`´ʼ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function prefillLeadForm(form) {
  const params = new URLSearchParams(window.location.search);
  const wanted = params.get("formation");
  if (!wanted) return;

  const select = form.querySelector('select[name="formation"]');
  if (!select) return;

  const wantedKey = normalizeFormationKey(wanted);
  const options = Array.from(select.options);
  let match = options.find((o) => normalizeFormationKey(o.value || o.textContent) === wantedKey);
  if (!match) {
    match = options.find((o) => normalizeFormationKey(o.value || o.textContent).includes(wantedKey));
  }
  if (!match || !match.value && !match.textContent) return;

  select.value = match.value || match.textContent;
  select.dispatchEvent(new Event("change", { bubbles: true }));

  const hint = form.querySelector("[data-prefill-hint]");
  if (hint) {
    hint.hidden = false;
    hint.textContent = `Formation préremplie : ${select.value}`;
  }
}

/* ── Form submission (inscription → PHP send-inscription.php) ─ */
document.querySelectorAll(".lead-form").forEach((leadForm) => {
  const statusEl = leadForm.querySelector(".lead-form-status");
  const endpoint = leadForm.getAttribute("data-send-endpoint") || "send-inscription.php";
  const submitBtn = leadForm.querySelector("[type='submit']");
  if (!submitBtn) return;

  prefillLeadForm(leadForm);

  leadForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!leadForm.reportValidity()) {
      const firstInvalid = leadForm.querySelector(":invalid");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const originalText = submitBtn.textContent;

    if (statusEl) {
      statusEl.hidden = true;
      statusEl.textContent = "";
      statusEl.removeAttribute("data-variant");
    }

    submitBtn.textContent = "Envoi en cours…";
    submitBtn.disabled = true;
    submitBtn.setAttribute("aria-busy", "true");

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body: new FormData(leadForm),
        headers: { Accept: "application/json" },
        credentials: "same-origin",
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      /* Ne jamais afficher un succès si la réponse n’est pas explicitement ok:true */
      if (!res.ok || data.ok !== true) {
        const msg =
          (data && data.error) ||
          "L’envoi n’a pas pu être confirmé. Réessayez ou contactez-nous par téléphone / WhatsApp.";
        if (statusEl) {
          statusEl.textContent = msg;
          statusEl.dataset.variant = "error";
          statusEl.hidden = false;
          statusEl.focus?.();
        }
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        submitBtn.removeAttribute("aria-busy");
        return;
      }

      submitBtn.textContent = "Demande envoyée";
      submitBtn.style.background = "linear-gradient(135deg, var(--success, #15803d), #12875f)";
      if (statusEl) {
        statusEl.textContent =
          data.message ||
          "Merci ! Votre demande a bien été transmise. Nous vous recontactons rapidement.";
        statusEl.dataset.variant = "success";
        statusEl.hidden = false;
      }

      leadForm.reset();
      const hint = leadForm.querySelector("[data-prefill-hint]");
      if (hint) hint.hidden = true;

      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        submitBtn.style.background = "";
        submitBtn.removeAttribute("aria-busy");
      }, 5000);
    } catch {
      if (statusEl) {
        statusEl.textContent =
          "Impossible d’envoyer le formulaire (réseau ou serveur). Appelez le +216 29 70 60 46 ou écrivez sur WhatsApp.";
        statusEl.dataset.variant = "error";
        statusEl.hidden = false;
      }
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      submitBtn.removeAttribute("aria-busy");
    }
  });
});

/* ── Contact bar WhatsApp contextualisé ─ */
document.querySelectorAll("[data-wa-context]").forEach((link) => {
  const ctx = link.getAttribute("data-wa-context");
  if (!ctx) return;
  const base = "https://wa.me/21629706046?text=";
  link.setAttribute(
    "href",
    base + encodeURIComponent(`Bonjour Smartech Formations Mahdia, je souhaite des informations sur : ${ctx}.`)
  );
});

/* ── FAQ keyboard accessibility ─────────────── */
const faqItems = document.querySelectorAll(".faq-item summary");

faqItems.forEach((summary) => {
  summary.addEventListener("click", () => {
    const allDetails = document.querySelectorAll(".faq-item");
    allDetails.forEach((detail) => {
      if (detail !== summary.parentElement) {
        detail.removeAttribute("open");
      }
    });
  });
});

/* ── Year in footer ─────────────────────────── */
const yearNode = document.getElementById("year");
if (yearNode) {
  yearNode.textContent = `© ${new Date().getFullYear()}`;
}

/* ── Smooth scroll for anchor links ─────────── */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (event) {
    const target = document.querySelector(this.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    const headerHeight = header ? header.offsetHeight : 0;
    const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 12;
    window.scrollTo({ top, behavior: "smooth" });
  });
});
