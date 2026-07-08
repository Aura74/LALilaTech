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

  /* ---------- Änglakorten — kortlek som slumpas ---------- */
  var ANGEL_IMAGES = [
    "img/png/angel1.jpg",
    "img/png/helene_magical_angel_woman_white_0e575e13-bbe1-4118-b45b-17987ab2c8c5.jpg",
    "img/png/helene_magical_angel_woman_white_4af3a52f-219a-4bd9-bc3c-3e9f7d2e518b.jpg",
  ];
  var DECK = [
    { word: "Frid", msg: "Släpp det som tynger. Du får vila nu — allt sker i sin rätta tid." },
    { word: "Mod", msg: "Ta steget du länge tvekat inför. Du är mer buren än du tror." },
    { word: "Hopp", msg: "Ett nytt ljus är på väg in i ditt liv. Håll dörren öppen." },
    { word: "Tillit", msg: "Du behöver inte se hela vägen — bara nästa steg." },
    { word: "Vila", msg: "Ingenting växer i ständig rörelse. Ge dig själv en paus utan dåligt samvete." },
    { word: "Klarhet", msg: "Svaret du söker finns redan inom dig. Lyssna i stillheten." },
    { word: "Kärlek", msg: "Var lika mild mot dig själv som du är mot andra." },
    { word: "Ljus", msg: "Även den minsta låga skingrar mörker. Dela ditt ljus idag." },
    { word: "Tacksamhet", msg: "Räkna det som bär dig — det växer när det uppmärksammas." },
  ];

  var cards = document.querySelectorAll(".angel-card");
  var shuffleBtn = document.getElementById("shuffle");

  function dealCards() {
    var pool = DECK.slice();
    cards.forEach(function (card, i) {
      var pick = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
      card.querySelector(".angel-card__word").textContent = pick.word;
      card.querySelector(".angel-card__message").textContent = pick.msg;
      card.querySelector(".angel-card__front").style.backgroundImage =
        "url('" + ANGEL_IMAGES[i % ANGEL_IMAGES.length] + "')";
    });
  }
  dealCards();

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
      // vänta tills korten hunnit vändas tillbaka innan nya delas ut
      setTimeout(dealCards, 450);
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
    if (typeof syncParticles === "function") syncParticles();
    if (typeof syncSwiperAutoplay === "function") syncSwiperAutoplay();
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

  /* ---------- FAQ-accordion ---------- */
  document.querySelectorAll(".faq__item").forEach(function (item) {
    var q = item.querySelector(".faq__q");
    var a = item.querySelector(".faq__a");
    q.addEventListener("click", function () {
      var open = item.classList.toggle("is-open");
      q.setAttribute("aria-expanded", String(open));
      a.style.maxHeight = open ? a.scrollHeight + "px" : "0";
    });
  });

  /* ---------- Bokningsmodal (demo — Calendly/Cal.com i skarp drift) ---------- */
  var modal = document.getElementById("booking-modal");
  var backBtn = document.getElementById("booking-back");
  var daysWrap = document.getElementById("booking-days");
  var timesWrap = document.getElementById("booking-times");
  var TIMES = ["10:00", "11:30", "13:00", "15:00", "16:30"];
  var booking = { service: null, day: null, time: null };
  var lastFocus = null;

  function gotoStep(n) {
    modal.querySelectorAll(".modal__step").forEach(function (step) {
      step.hidden = step.getAttribute("data-step") !== String(n);
    });
    backBtn.hidden = n === 1 || n === 4;
  }

  function openModal(preselectedService) {
    lastFocus = document.activeElement;
    booking = { service: preselectedService || null, day: null, time: null };

    // dagar: de kommande 7 dagarna
    daysWrap.innerHTML = "";
    var fmt = new Intl.DateTimeFormat("sv-SE", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    for (var i = 1; i <= 7; i++) {
      var d = new Date();
      d.setDate(d.getDate() + i);
      var chip = document.createElement("button");
      chip.className = "chip";
      chip.type = "button";
      chip.textContent = fmt.format(d);
      chip.addEventListener("click", function (e) {
        selectChip(daysWrap, e.currentTarget);
        booking.day = e.currentTarget.textContent;
        maybeGotoDetails();
      });
      daysWrap.appendChild(chip);
    }

    // tider
    timesWrap.innerHTML = "";
    TIMES.forEach(function (t) {
      var chip = document.createElement("button");
      chip.className = "chip";
      chip.type = "button";
      chip.textContent = t;
      chip.addEventListener("click", function (e) {
        selectChip(timesWrap, e.currentTarget);
        booking.time = t;
        maybeGotoDetails();
      });
      timesWrap.appendChild(chip);
    });

    modal.hidden = false;
    root.style.overflow = "hidden";
    gotoStep(preselectedService ? 2 : 1);
    modal.querySelector(".modal__close").focus();
  }

  function closeModal() {
    modal.hidden = true;
    root.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  function selectChip(wrap, chosen) {
    wrap.querySelectorAll(".chip, .choice").forEach(function (c) {
      c.classList.toggle("is-selected", c === chosen);
    });
  }

  function maybeGotoDetails() {
    if (!booking.day || !booking.time) return;
    document.getElementById("booking-summary").textContent =
      booking.service + " — " + booking.day + " kl " + booking.time;
    gotoStep(3);
  }

  document.querySelectorAll("#booking-services .choice").forEach(function (c) {
    c.addEventListener("click", function () {
      booking.service = c.getAttribute("data-service");
      gotoStep(2);
    });
  });

  backBtn.addEventListener("click", function () {
    var current = modal.querySelector(".modal__step:not([hidden])");
    gotoStep(Number(current.getAttribute("data-step")) - 1);
  });

  modal.querySelectorAll("[data-modal-close]").forEach(function (el) {
    el.addEventListener("click", closeModal);
  });

  var bookingForm = document.getElementById("booking-form");
  bookingForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var record = {
      service: booking.service,
      day: booking.day,
      time: booking.time,
      name: document.getElementById("b-name").value,
      email: document.getElementById("b-email").value,
      created: new Date().toISOString(),
    };
    var saved = [];
    try {
      saved = JSON.parse(localStorage.getItem("lalilatech:bookings")) || [];
    } catch (err) {}
    saved.push(record);
    localStorage.setItem("lalilatech:bookings", JSON.stringify(saved));

    document.getElementById("booking-confirm-text").textContent =
      record.service + " — " + record.day + " kl " + record.time +
      ". En bekräftelse skickas till " + record.email + ".";
    gotoStep(4);
    bookingForm.reset();
  });

  var bookBtn = document.getElementById("book-btn");
  if (bookBtn) {
    bookBtn.addEventListener("click", function () {
      openModal();
    });
  }

  document.querySelectorAll(".service__book").forEach(function (btn) {
    btn.addEventListener("click", function () {
      openModal(btn.getAttribute("data-book-service"));
    });
  });

  /* ---------- Escape stänger modal, meny + popover ---------- */
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (!modal.hidden) closeModal();
    if (document.body.classList.contains("menu-open")) setMenu(false);
    closePerfPopover();
  });

  /* ---------- Demo: kontaktformulär + nyhetsbrev (ingen backend) ---------- */
  var form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      showToast("Tack för ditt meddelande! (Demo — inget skickades.)");
      form.reset();
    });
  }

  var newsForm = document.getElementById("news-form");
  if (newsForm) {
    newsForm.addEventListener("submit", function (e) {
      e.preventDefault();
      showToast("Välkommen! Månadens meditation kommer till din inkorg. (Demo)");
      newsForm.reset();
    });
  }

  /* ---------- Kundröst-karusell (Swiper) ---------- */
  var quotesSwiper = null;
  if (typeof window.Swiper === "function") {
    quotesSwiper = new window.Swiper(".quotes-swiper", {
      slidesPerView: 1,
      spaceBetween: 24,
      loop: true,
      autoplay: {
        delay: 6500,
        pauseOnMouseEnter: true,
        disableOnInteraction: false,
      },
      pagination: { el: ".quotes-swiper .swiper-pagination", clickable: true },
      breakpoints: { 768: { slidesPerView: 2 } },
    });
  }

  function syncSwiperAutoplay() {
    if (!quotesSwiper || !quotesSwiper.autoplay) return;
    if (
      root.getAttribute("data-perf") === "essential" ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      quotesSwiper.autoplay.stop();
    } else {
      quotesSwiper.autoplay.start();
    }
  }
  syncSwiperAutoplay();

  /* ---------- Presentkort (demo — Stripe Checkout i skarp drift) ---------- */
  var giftAmount = document.getElementById("gift-amount");
  var giftChips = document.querySelectorAll("#gift-amounts .chip");
  var giftBuy = document.getElementById("gift-buy");
  var chosenAmount = "450 kr";

  giftChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      giftChips.forEach(function (c) {
        c.classList.toggle("is-selected", c === chip);
      });
      chosenAmount = chip.getAttribute("data-amount");
      giftAmount.textContent = chosenAmount;
    });
  });

  if (giftBuy) {
    giftBuy.addEventListener("click", function () {
      showToast(
        "Demo — här skulle Stripe Checkout öppnas för presentkortet (" +
          chosenAmount +
          ")."
      );
    });
  }

  /* ---------- Stämningsljud: genererade vindspel (Web Audio) ----------
     Ingen ljudfil behövs — pentatoniska klockor med lång utklingning +
     mjuk bordunton. Startar bara på användarens klick (autoplay-policy). */
  var soundToggle = document.getElementById("sound-toggle");
  var audio = { ctx: null, master: null, timer: null, drone: null, on: false };
  var CHIME_NOTES = [440, 523.25, 587.33, 659.25, 783.99, 880]; // A-pentatonisk

  function chime() {
    var ctx = audio.ctx;
    var freq = CHIME_NOTES[Math.floor(Math.random() * CHIME_NOTES.length)];
    var now = ctx.currentTime;
    var dur = 4 + Math.random() * 3;

    [1, 2.76].forEach(function (partial, i) {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq * partial;
      osc.detune.value = (Math.random() - 0.5) * 8;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(i === 0 ? 0.16 : 0.04, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      osc.connect(gain).connect(audio.master);
      osc.start(now);
      osc.stop(now + dur + 0.1);
    });

    audio.timer = setTimeout(chime, 2500 + Math.random() * 5000);
  }

  function startSound() {
    if (!audio.ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      audio.ctx = new AC();
      audio.master = audio.ctx.createGain();
      audio.master.gain.value = 0.12;
      audio.master.connect(audio.ctx.destination);
    }
    audio.ctx.resume();

    // mjuk bordunton i botten
    audio.drone = audio.ctx.createGain();
    audio.drone.gain.value = 0.025;
    audio.drone.connect(audio.master);
    [110, 110.7].forEach(function (f) {
      var osc = audio.ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = f;
      osc.connect(audio.drone);
      osc.start();
      audio.drone["osc" + f] = osc;
    });

    chime();
    audio.on = true;
  }

  function stopSound() {
    clearTimeout(audio.timer);
    if (audio.drone) {
      audio.drone.disconnect();
      audio.drone = null;
    }
    if (audio.ctx) audio.ctx.suspend();
    audio.on = false;
  }

  if (soundToggle) {
    soundToggle.addEventListener("click", function () {
      if (audio.on) {
        stopSound();
        soundToggle.setAttribute("aria-pressed", "false");
        soundToggle.setAttribute("aria-label", "Slå på stämningsljud");
      } else {
        startSound();
        soundToggle.setAttribute("aria-pressed", "true");
        soundToggle.setAttribute("aria-label", "Stäng av stämningsljud");
        showToast("Stämningsljud på — stilla vindspel. 🔔");
      }
    });
  }

  /* ---------- Ljuspartiklar i heron — endast Cinematic ---------- */
  var pCanvas = document.getElementById("hero-particles");
  var particles = { raf: null, dots: [], heroVisible: true };

  function particlesAllowed() {
    return (
      pCanvas &&
      root.getAttribute("data-perf") === "cinematic" &&
      !matchMedia("(prefers-reduced-motion: reduce)").matches &&
      particles.heroVisible &&
      !document.hidden
    );
  }

  function resizeParticles() {
    if (!pCanvas) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    pCanvas.width = pCanvas.clientWidth * dpr;
    pCanvas.height = pCanvas.clientHeight * dpr;
    pCanvas.getContext("2d").setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function seedParticles() {
    particles.dots = [];
    var count = Math.round(pCanvas.clientWidth / 34); // ~42 st på desktop
    for (var i = 0; i < count; i++) {
      particles.dots.push({
        x: Math.random() * pCanvas.clientWidth,
        y: Math.random() * pCanvas.clientHeight,
        r: 0.8 + Math.random() * 1.8,
        speed: 0.12 + Math.random() * 0.3,
        sway: 0.2 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  function particleLoop() {
    if (!particlesAllowed()) {
      particles.raf = null;
      return;
    }
    var ctx = pCanvas.getContext("2d");
    var w = pCanvas.clientWidth;
    var h = pCanvas.clientHeight;
    ctx.clearRect(0, 0, w, h);
    var t = performance.now() / 1000;

    particles.dots.forEach(function (d) {
      d.y -= d.speed;
      if (d.y < -6) {
        d.y = h + 6;
        d.x = Math.random() * w;
      }
      var x = d.x + Math.sin(t * d.sway + d.phase) * 14;
      var twinkle = 0.35 + 0.3 * Math.sin(t * 1.4 + d.phase * 3);

      ctx.globalAlpha = twinkle * 0.35;
      ctx.fillStyle = "#f0dfba";
      ctx.beginPath();
      ctx.arc(x, d.y, d.r * 2.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = twinkle;
      ctx.fillStyle = "#fdf6e6";
      ctx.beginPath();
      ctx.arc(x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    particles.raf = requestAnimationFrame(particleLoop);
  }

  function syncParticles() {
    if (particlesAllowed()) {
      if (!particles.raf) {
        resizeParticles();
        if (!particles.dots.length) seedParticles();
        particles.raf = requestAnimationFrame(particleLoop);
      }
    } else if (particles.raf) {
      cancelAnimationFrame(particles.raf);
      particles.raf = null;
      if (pCanvas) {
        var c = pCanvas.getContext("2d");
        c.clearRect(0, 0, pCanvas.clientWidth, pCanvas.clientHeight);
      }
    }
  }

  if (pCanvas && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      particles.heroVisible = entries[0].isIntersecting;
      syncParticles();
    }).observe(pCanvas);
    window.addEventListener("resize", function () {
      resizeParticles();
      seedParticles();
    });
    document.addEventListener("visibilitychange", syncParticles);
    syncParticles();
  }

  /* ---------- Månfas i footern ---------- */
  var moonEl = document.getElementById("moon");
  if (moonEl) {
    var SYNODIC = 29.53058867;
    var NEW_MOON = Date.UTC(2000, 0, 6, 18, 14); // känd nymåne
    var days = (Date.now() - NEW_MOON) / 86400000;
    var phase = ((days % SYNODIC) + SYNODIC) % SYNODIC;
    var idx = Math.round(phase / (SYNODIC / 8)) % 8;
    var NAMES = [
      "Nymåne", "Växande skära", "Växande halvmåne", "Växande måne",
      "Fullmåne", "Avtagande måne", "Avtagande halvmåne", "Avtagande skära",
    ];
    var EMOJI = ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"];
    moonEl.textContent = "Månen i natt: " + NAMES[idx] + " " + EMOJI[idx];
  }
})();
