/* ÄNGLALJUS — main.js
   Tema, fullskärmsmeny, scroll-reveals, änglakort, effektväljare,
   FPS-test, Lenis (endast Cinematic), hero-video, demo-formulär. */

(function () {
  "use strict";

  var root = document.documentElement;
  var PERF_KEY = "lalilatech:perfMode";

  /* ---------- Toast ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;

  function showToast(message, action) {
    if (!toastEl) return;
    toastEl.textContent = message;
    if (action) {
      var btn = document.createElement("button");
      btn.className = "toast__action";
      btn.type = "button";
      btn.textContent = action.label;
      btn.addEventListener("click", function () {
        hideToast();
        action.onClick();
      });
      toastEl.appendChild(btn);
    }
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, action ? 10000 : 4000);
  }

  function hideToast() {
    toastEl.classList.remove("is-visible");
  }

  /* ---------- Tema ---------- */
  var themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var dark = root.getAttribute("data-theme") === "dark";
      if (dark) {
        root.removeAttribute("data-theme");
        localStorage.setItem("theme", "light");
      } else {
        root.setAttribute("data-theme", "dark");
        localStorage.setItem("theme", "dark");
      }
    });
  }

  /* ---------- Topprad: solid bakgrund efter hero ---------- */
  var nav = document.getElementById("nav");

  function onScroll() {
    nav.classList.toggle("is-scrolled", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Fullskärmsmeny ---------- */
  var burger = document.getElementById("burger");
  var menu = document.getElementById("menu");

  function setMenu(open) {
    document.body.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Stäng meny" : "Öppna meny");
    menu.setAttribute("aria-hidden", String(!open));
    root.style.overflow = open ? "hidden" : "";
  }

  burger.addEventListener("click", function () {
    setMenu(!document.body.classList.contains("menu-open"));
  });

  menu.querySelectorAll(".menu__link").forEach(function (link) {
    link.addEventListener("click", function () {
      setMenu(false);
    });
  });

  /* ---------- Scroll-reveals ---------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            var delay = el.getAttribute("data-reveal-delay");
            if (delay) el.style.transitionDelay = delay + "ms";
            el.classList.add("is-visible");
            revealObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ---------- Änglakorten ---------- */
  var cards = document.querySelectorAll(".angel-card");
  var shuffleBtn = document.getElementById("shuffle");

  function updateShuffle() {
    var anyFlipped = document.querySelector(".angel-card.is-flipped");
    shuffleBtn.hidden = !anyFlipped;
  }

  cards.forEach(function (card) {
    card.addEventListener("click", function () {
      var flipped = card.classList.toggle("is-flipped");
      card.setAttribute("aria-pressed", String(flipped));
      updateShuffle();
    });
  });

  if (shuffleBtn) {
    shuffleBtn.addEventListener("click", function () {
      cards.forEach(function (card) {
        card.classList.remove("is-flipped");
        card.setAttribute("aria-pressed", "false");
      });
      updateShuffle();
    });
  }

  /* ---------- Hero-video: pausa utanför skärmen + effektläge ---------- */
  var heroVideo = document.querySelector(".hero__video");

  function syncVideo() {
    if (!heroVideo) return;
    if (root.getAttribute("data-perf") === "essential") {
      heroVideo.pause();
    } else {
      heroVideo.play().catch(function () {});
    }
  }

  if (heroVideo && "IntersectionObserver" in window) {
    var videoObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (root.getAttribute("data-perf") === "essential") {
            heroVideo.pause();
          } else if (entry.isIntersecting) {
            heroVideo.play().catch(function () {});
          } else {
            heroVideo.pause();
          }
        });
      },
      { threshold: 0.1 }
    );
    videoObserver.observe(heroVideo);
  }

  /* ---------- Lenis — endast Cinematic ---------- */
  var lenis = null;

  function startLenis() {
    if (lenis || typeof window.Lenis !== "function") return;
    lenis = new window.Lenis({ lerp: 0.1 });
    function raf(time) {
      if (!lenis) return;
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  function stopLenis() {
    if (!lenis) return;
    lenis.destroy();
    lenis = null;
  }

  function syncLenis() {
    if (root.getAttribute("data-perf") === "cinematic") {
      startLenis();
    } else {
      stopLenis();
    }
  }
  syncLenis();

  /* ---------- Effektväljare ---------- */
  var perfToggle = document.getElementById("perf-toggle");
  var perfPopover = document.getElementById("perf-popover");
  var perfOptions = document.querySelectorAll(".perf__option");
  var MODE_NAMES = {
    essential: "Essential",
    balanced: "Balanced",
    cinematic: "Cinematic",
  };

  function markActiveOption() {
    var current = root.getAttribute("data-perf");
    perfOptions.forEach(function (opt) {
      opt.classList.toggle(
        "is-active",
        opt.getAttribute("data-perf-mode") === current
      );
    });
  }

  function setPerfMode(mode, silent) {
    root.setAttribute("data-perf", mode);
    root.removeAttribute("data-perf-auto");
    localStorage.setItem(PERF_KEY, mode);
    markActiveOption();
    syncVideo();
    syncLenis();
    if (!silent) showToast("Effektnivå: " + MODE_NAMES[mode]);
  }

  function closePerfPopover() {
    if (!perfPopover || perfPopover.hidden) return;
    perfPopover.hidden = true;
    perfToggle.setAttribute("aria-expanded", "false");
  }

  if (perfToggle && perfPopover) {
    perfToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = perfPopover.hidden;
      perfPopover.hidden = !open;
      perfToggle.setAttribute("aria-expanded", String(open));
      if (open) markActiveOption();
    });

    perfOptions.forEach(function (opt) {
      opt.addEventListener("click", function () {
        setPerfMode(opt.getAttribute("data-perf-mode"));
        closePerfPopover();
      });
    });

    document.addEventListener("click", function (e) {
      if (!perfPopover.hidden && !perfPopover.contains(e.target)) {
        closePerfPopover();
      }
    });
  }

  /* ---------- FPS-test: bara vid auto-valt Cinematic ---------- */
  if (
    root.hasAttribute("data-perf-auto") &&
    root.getAttribute("data-perf") === "cinematic"
  ) {
    window.addEventListener("load", function () {
      setTimeout(function () {
        var frames = 0;
        var start = performance.now();
        var DURATION = 2000;

        function tick(now) {
          frames++;
          if (now - start < DURATION) {
            requestAnimationFrame(tick);
          } else {
            var fps = frames / ((now - start) / 1000);
            if (fps < 45) {
              showToast("Sidan verkar hacka på din dator.", {
                label: "Byt till Balanced",
                onClick: function () {
                  setPerfMode("balanced");
                },
              });
            }
          }
        }
        requestAnimationFrame(tick);
      }, 1500);
    });
  }

  /* ---------- Escape stänger meny + popover ---------- */
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (document.body.classList.contains("menu-open")) setMenu(false);
    closePerfPopover();
  });

  /* ---------- Demo: formulär + bokning (ingen backend) ---------- */
  var form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      showToast("Tack för ditt meddelande! (Demo — inget skickades.)");
      form.reset();
    });
  }

  var bookBtn = document.getElementById("book-btn");
  if (bookBtn) {
    bookBtn.addEventListener("click", function () {
      showToast("Demo — här skulle Calendly/Cal.com öppnas.");
    });
  }
})();
