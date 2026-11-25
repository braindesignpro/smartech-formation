/**
 * Carrousel hero Smartech — vanilla JS
 *
 * Structure attendue dans [data-offers-carousel] :
 *   .oc-viewport > .oc-track > .oc-slide (×n)
 *   [data-oc-prev] [data-oc-next] après le viewport (recommandé)
 *   .oc-dots (vide, points générés)
 *   .oc-status (live region)
 *
 * Images : définir --oc-bg sur chaque .oc-slide (style) ; sinon CSS utilise --oc-bg-fallback.
 */
(function () {
  const root = document.querySelector("[data-offers-carousel]");
  if (!root) return;

  const track = root.querySelector(".oc-track");
  const slides = track ? Array.from(track.children) : [];
  const btnPrev = root.querySelector("[data-oc-prev]");
  const btnNext = root.querySelector("[data-oc-next]");
  const dotsContainer = root.querySelector(".oc-dots");
  const live = root.querySelector(".oc-status");
  const viewport = root.querySelector(".oc-viewport");

  if (!track || slides.length === 0) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let index = 0;

  /** Applique --oc-bg depuis data-oc-bg (lazy) ou fallback CSS */
  function ensureSlideBackgrounds() {
    const fallback = getComputedStyle(root.closest(".hero-carousel-wrap") || document.documentElement)
      .getPropertyValue("--oc-bg-fallback")
      .trim();
    slides.forEach((slide) => {
      const bg = slide.style.getPropertyValue("--oc-bg").trim();
      if (!bg && fallback && !slide.hasAttribute("data-oc-bg")) {
        slide.style.setProperty("--oc-bg", fallback);
      }
    });
  }

  /** Charge l’image de fond uniquement quand la slide est (presque) visible */
  function loadSlideBackground(slide) {
    if (!slide || slide.dataset.ocBgLoaded === "1") return;
    const preferMobile = window.matchMedia("(max-width: 768px)").matches;
    const deferredMobile = slide.getAttribute("data-oc-bg-mobile");
    const deferred =
      preferMobile && deferredMobile
        ? deferredMobile
        : slide.getAttribute("data-oc-bg");
    if (deferred) {
      slide.style.setProperty("--oc-bg", deferred);
      slide.removeAttribute("data-oc-bg");
      slide.removeAttribute("data-oc-bg-mobile");
    }
    slide.dataset.ocBgLoaded = "1";
  }

  function preloadAround(i) {
    const n = slides.length;
    loadSlideBackground(slides[i]);
    loadSlideBackground(slides[(i + 1) % n]);
    loadSlideBackground(slides[(i - 1 + n) % n]);
  }

  function goTo(i) {
    const n = slides.length;
    index = ((i % n) + n) % n;
    track.style.transform = `translate3d(${-index * 100}%, 0, 0)`;
    preloadAround(index);

    slides.forEach((el, j) => {
      const active = j === index;
      el.setAttribute("aria-hidden", active ? "false" : "true");
      el.querySelectorAll("a[href], button:not([disabled])").forEach((node) => {
        node.tabIndex = active ? 0 : -1;
      });
    });

    root.querySelectorAll(".oc-dot").forEach((dot, j) => {
      if (j === index) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
      dot.tabIndex = j === index ? 0 : -1;
    });

    if (live) {
      live.textContent = slides[index].getAttribute("aria-label") || "";
    }
  }

  function next() {
    goTo(index + 1);
  }

  function prev() {
    goTo(index - 1);
  }

  /* Points */
  if (dotsContainer && dotsContainer.childElementCount === 0) {
    slides.forEach((slide, j) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "oc-dot";
      const heading = slide.querySelector("h1, h2");
      dot.setAttribute("aria-label", heading ? `Afficher : ${heading.textContent}` : `Slide ${j + 1}`);
      dot.addEventListener("click", (e) => {
        e.stopPropagation();
        goTo(j);
      });
      dotsContainer.appendChild(dot);
    });
  }

  /* Navigation : stopPropagation pour ne pas interférer avec d’autres handlers */
  btnNext?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    next();
  });

  btnPrev?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    prev();
  });

  root.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    }
  });

  /* Swipe horizontal (ignore les clics sans déplacement) */
  let startX = null;
  const threshold = 40;

  if (viewport) {
    viewport.addEventListener(
      "pointerdown",
      (e) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        if (e.target.closest("a, button")) return;
        startX = e.clientX;
        try {
          viewport.setPointerCapture(e.pointerId);
        } catch (_) {
          /* ignore */
        }
      },
      { passive: true }
    );

    viewport.addEventListener(
      "pointerup",
      (e) => {
        if (startX == null) return;
        const dx = e.clientX - startX;
        startX = null;
        try {
          viewport.releasePointerCapture(e.pointerId);
        } catch (_) {
          /* ignore */
        }
        if (Math.abs(dx) < threshold) return;
        if (dx < 0) next();
        else prev();
      },
      { passive: true }
    );

    viewport.addEventListener("pointercancel", () => {
      startX = null;
    });
  }

  if (reduceMotion) {
    track.style.transition = "none";
  }

  ensureSlideBackgrounds();
  goTo(0);
})();
