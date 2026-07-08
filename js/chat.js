/* ============================================================
   ÄNGLALJUS — SELMA (AI-vägledare)
   Gemini API med modell-fallback + lokal offline-hjärna.
   Mönster från SpacePlanets/AI_ChatBot_Liten_Version.
   ============================================================ */

(function () {
  "use strict";

  // ── AI-konfiguration ─────────────────────────
  // Nyckeln läses från js/apikey.js (gitignorad — får ALDRIG committas:
  // Google spärrar nycklar som hittas i publika GitHub-repon).
  // Utan nyckel går Selma direkt i offline-läge med lokal kunskap.
  var GEMINI_API_KEY = window.GEMINI_API_KEY || "";
  var GEMINI_MODELS = ["gemini-flash-latest", "gemini-flash-lite-latest"];
  function geminiUrl(model) {
    return (
      "https://generativelanguage.googleapis.com/v1beta/models/" +
      model +
      ":generateContent"
    );
  }

  var SITE_FACTS = [
    "Tjänster och priser:",
    "• Änglahealing — 60 min, från 650 kr. Djup avslappning, varsam beröring, du ligger ner påklädd och ombonad.",
    "• Meditation & andning — 75 min, från 250 kr. Guidad meditation i liten grupp, naturnära, öppen för nybörjare.",
    "• Medial vägledning — 60 min, från 850 kr. Personligt samtal om vägval, relationer eller det som känns oklart. Fungerar lika bra på distans via videosamtal.",
    "• Introsamtal — 15 min, alltid kostnadsfritt och kravlöst.",
    "",
    "Praktiskt:",
    "• Bokning görs via knappen 'Boka ett samtal' på sidan (eller 'Boka' på ett tjänstekort).",
    "• Avbokning senast 24 timmar innan, annars debiteras halva priset.",
    "• Ingen förberedelse behövs: bekväma kläder, gärna utan stark parfym.",
    "• Man behöver INTE tro på änglar eller något särskilt för att komma.",
    "• Presentkort finns från 450 kr till 1 000 kr, gäller i 12 månader, för alla tjänster. Köps via sektionen 'Ge bort en stund av ro'.",
    "• På sidan finns också änglakorten — man kan dra ett kort och få dagens budskap (Frid, Mod, Hopp med flera).",
  ].join("\n");

  var SYSTEM_PROMPT =
    "Du är Selma — Änglaljus varma AI-vägledare. Änglaljus drivs av Lars och erbjuder healing, meditation och medial vägledning. Du pratar svenska.\n\n" +
    "Faktabas (utgå från denna när priser eller praktiska frågor efterfrågas):\n" +
    SITE_FACTS +
    "\n\n" +
    "Personlighet:\n" +
    "- Varm, lugn och jordnära — som en klok vän med mjuk röst. Aldrig flummig, aldrig säljig.\n" +
    "- Kortfattad: 1–4 meningar om inte användaren ber om mer.\n" +
    "- Du får använda **fetstil** för att lyfta tjänster och priser, och någon enstaka ✨ när det känns naturligt.\n\n" +
    "Viktiga regler:\n" +
    "- Svara alltid på svenska om inte användaren skriver på annat språk.\n" +
    "- Healing och vägledning ERSÄTTER ALDRIG sjukvård eller psykolog. Vid frågor om sjukdom, medicin eller psykisk ohälsa: var medkännande men hänvisa alltid till vården (1177). Vid akut kris: hänvisa till 112 eller Mind Självmordslinjen 90101.\n" +
    "- Ge aldrig medicinska löften eller utfästelser om resultat.\n" +
    "- Om frågan ligger helt utanför Änglaljus värld: styr vänligt tillbaka.\n" +
    "- Hitta inte på priser eller tjänster som inte finns i faktabasen.";

  // ── Widget-markup (injiceras så index.html hålls ren) ──
  var ICON_SPARKLE =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4L12 3z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z"/></svg>';
  var ICON_X =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';
  var ICON_RESET =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>';
  var ICON_SEND =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/></svg>';

  function injectWidget() {
    var wrap = document.createElement("div");
    wrap.id = "chatRoot";
    wrap.innerHTML =
      '<button id="chatFab" class="chat-fab" aria-label="Fråga Selma">' +
      '<span class="chat-fab__tip">Fråga Selma</span>' +
      ICON_SPARKLE +
      "</button>" +
      '<section id="chatWidget" class="chat-widget" hidden role="dialog" aria-modal="false" aria-label="Chatt med Selma">' +
      '<header class="chat-head">' +
      '<div class="chat-head__id">' +
      '<span class="chat-orb" aria-hidden="true"></span>' +
      "<div><h3>Selma</h3>" +
      '<p class="chat-status">Vägledare · alltid här</p></div>' +
      "</div>" +
      '<div class="chat-head__actions">' +
      '<button class="chat-iconbtn" id="chatClear" aria-label="Börja om">' +
      ICON_RESET +
      "</button>" +
      '<button class="chat-iconbtn" id="chatClose" aria-label="Stäng chatten">' +
      ICON_X +
      "</button>" +
      "</div></header>" +
      '<div class="chat-box" id="chatBox"><div id="chatMessages"></div>' +
      '<div class="chat-typing" id="chatTyping" hidden><span></span><span></span><span></span></div>' +
      "</div>" +
      '<div class="chat-suggest" id="chatSuggest">' +
      '<button class="chat-chip" data-msg="Vad kostar en session?">Vad kostar det?</button>' +
      '<button class="chat-chip" data-msg="Hur går änglahealing till?">Hur går healing till?</button>' +
      '<button class="chat-chip" data-msg="Kan jag ge bort ett presentkort?">Presentkort?</button>' +
      "</div>" +
      '<footer class="chat-inputrow">' +
      '<textarea id="chatInput" rows="1" maxlength="500" placeholder="Skriv till Selma …" aria-label="Skriv ditt meddelande"></textarea>' +
      '<button id="chatSend" class="chat-send" aria-label="Skicka" disabled>' +
      ICON_SEND +
      "</button>" +
      "</footer></section>";
    document.body.appendChild(wrap);
  }

  // ── Lokal offline-hjärna ─────────────────────
  function normalize(str) {
    return str
      .toLowerCase()
      .replace(/[åä]/g, "a")
      .replace(/ö/g, "o")
      .replace(/[?!.,'"]/g, "");
  }

  function getLocalResponse(input) {
    var n = normalize(input);

    if (/(sjuk|medicin|depression|angest|ont i|smart|diagnos|psykolog|sjalvmord)/.test(n)) {
      return "Jag hör att du bär på något tungt, och jag är glad att du skriver. Men vid sjukdom eller psykisk ohälsa är **vården** rätt väg — ring 1177 för råd, eller 112 om det är akut. Healing hos oss kan vara ett varmt komplement, aldrig en ersättning. 💛";
    }
    if (/(pris|kostar|kostnad|avgift|betala)/.test(n)) {
      return "Så här ser priserna ut: **Änglahealing** 60 min från 650 kr, **Meditation & andning** 75 min från 250 kr, **Medial vägledning** 60 min från 850 kr. Ett första **introsamtal på 15 min är alltid kostnadsfritt**. ✨";
    }
    if (/(boka|bokning|tid|ledig)/.test(n)) {
      return "Du bokar enklast via knappen **Boka ett samtal** här på sidan — välj tjänst, dag och tid så är det klart. Introsamtalet är kostnadsfritt om du vill börja mjukt.";
    }
    if (/(healing|healas)/.test(n)) {
      return "Under en **änglahealing** ligger du ner, påklädd och ombonad, i 60 minuter medan energi och närvaro får flöda. De flesta upplever djup avslappning — en del somnar, och det är helt okej.";
    }
    if (/(meditation|meditera|andning|andas)/.test(n)) {
      return "**Meditation & andning** är 75 minuter guidad stillhet i liten grupp — naturnära, kravlöst och öppet för nybörjare. Från 250 kr.";
    }
    if (/(medial|vagledning|samtal|framtid|vagval)/.test(n)) {
      return "**Medial vägledning** är ett personligt samtal på 60 minuter kring dina frågor — vägval, relationer eller det som känns oklart. Fungerar lika bra på distans via video. Från 850 kr.";
    }
    if (/(distans|video|online|hemifran)/.test(n)) {
      return "Ja! Medial vägledning fungerar lika bra via **videosamtal** — många föredrar att sitta i sin egen trygga miljö. Du bokar på samma sätt och får en länk innan.";
    }
    if (/(presentkort|present|gava|ge bort)/.test(n)) {
      return "Ett **presentkort** är en fin gåva — från 450 kr till 1 000 kr, gäller i tolv månader och kan användas till alla tjänster. Scrolla till *Ge bort en stund av ro* på sidan.";
    }
    if (/(avboka|avbokning|omboka)/.test(n)) {
      return "Avboka gärna senast **24 timmar** innan din tid, så kan någon annan få den. Vid sen avbokning debiteras halva priset.";
    }
    if (/(tro|troende|skeptisk|skeptiker|flum)/.test(n)) {
      return "Du behöver **inte tro på någonting särskilt** för att komma hit. Många besökare är nyfikna skeptiker — det räcker att du vill ge dig själv en lugn stund.";
    }
    if (/(anglakort|kort|dagens budskap|dra ett kort)/.test(n)) {
      return "Prova gärna **änglakorten** här på sidan — stanna upp, tänk på något du bär med dig, och vänd det kort som drar i dig. ✨";
    }
    if (/(hej|halla|tjena|hello|hi|god morgon|god kvall)/.test(n)) {
      return "Hej, och varmt välkommen. 💛 Jag är **Selma**, Änglaljus vägledare. Fråga mig om tjänsterna, priserna, bokning — eller vad du än bär på.";
    }
    if (/(tack|tackar|thanks)/.test(n)) {
      return "Så fint att jag kunde hjälpa. Ta hand om dig — och kom ihåg att vila är en rättighet, inte en belöning. ✨";
    }
    return "Just nu är jag i **offline-läge** och kan bara svara på det jag vet om Änglaljus — prova att fråga om *priser*, *healing*, *bokning* eller *presentkort*.";
  }

  // ── Gemini-anrop med modell-fallback ─────────
  var history = [];

  function callAI(userMessage) {
    history.push({ role: "user", parts: [{ text: userMessage }] });
    var body = {
      contents: history,
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      generationConfig: { temperature: 0.8, topP: 0.95, maxOutputTokens: 1024 },
    };

    var attempt = function (idx) {
      if (idx >= GEMINI_MODELS.length) {
        history.pop(); // rulla tillbaka så historiken inte förgiftas
        return Promise.reject(new Error("Alla modeller misslyckades"));
      }
      return fetch(geminiUrl(GEMINI_MODELS[idx]), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify(body),
      })
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          return res.json();
        })
        .then(function (data) {
          var text =
            (data.candidates &&
              data.candidates[0] &&
              data.candidates[0].content &&
              data.candidates[0].content.parts
                .map(function (p) {
                  return p.text || "";
                })
                .join("")) ||
            "Jag kunde inte formulera ett svar just nu.";
          history.push({ role: "model", parts: [{ text: text }] });
          if (history.length > 40) history = history.slice(-40);
          return text;
        })
        .catch(function () {
          return attempt(idx + 1);
        });
    };
    return attempt(0);
  }

  // ── UI ───────────────────────────────────────
  function $id(id) {
    return document.getElementById(id);
  }
  var isTyping = false;
  var hasOpened = false;
  var apiAvailable = GEMINI_API_KEY.length > 0;

  function formatText(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(?!\*)(.*?)\*(?!\*)/g, "<em>$1</em>")
      .replace(/\n/g, "<br>");
  }

  function scrollToBottom() {
    var box = $id("chatBox");
    box.scrollTop = box.scrollHeight;
  }

  function addMessage(text, sender) {
    var welcome = $id("chatWelcome");
    if (welcome) welcome.remove();

    var msg = document.createElement("div");
    msg.className = "chat-msg chat-msg--" + sender;
    var bubble = document.createElement("div");
    bubble.className = "chat-bubble";
    if (sender === "bot") bubble.innerHTML = formatText(text);
    else bubble.textContent = text;
    msg.appendChild(bubble);
    $id("chatMessages").appendChild(msg);
    scrollToBottom();
    return bubble;
  }

  function typewriter(el, text) {
    // Essential-läge: visa direkt utan animation
    if (document.documentElement.getAttribute("data-perf") === "essential") {
      el.innerHTML = formatText(text);
      scrollToBottom();
      return Promise.resolve();
    }
    return new Promise(function (resolve) {
      var html = formatText(text);
      var tokens = html.split(/(<[^>]+>)/).reduce(function (acc, part) {
        if (part.indexOf("<") === 0) acc.push(part);
        else acc = acc.concat(part.split(""));
        return acc;
      }, []);
      var out = "";
      var i = 0;
      var speed = Math.max(5, Math.min(18, 1100 / tokens.length));
      (function next() {
        if (i < tokens.length) {
          out += tokens[i++];
          el.innerHTML = out;
          scrollToBottom();
          setTimeout(next, tokens[i - 1].indexOf("<") === 0 ? 0 : speed);
        } else resolve();
      })();
    });
  }

  function showWelcome() {
    var div = document.createElement("div");
    div.id = "chatWelcome";
    div.className = "chat-welcome";
    div.innerHTML =
      '<span class="chat-orb chat-orb--big" aria-hidden="true"></span>' +
      "<h4>Hej, jag är Selma</h4>" +
      "<p>Fråga mig om healing, meditation, priser eller bokning — eller berätta bara hur du har det just nu.</p>";
    $id("chatMessages").appendChild(div);
  }

  function sendMessage(raw) {
    var text = (raw || "").trim();
    if (!text || isTyping) return;
    isTyping = true;

    addMessage(text, "user");
    var input = $id("chatInput");
    input.value = "";
    input.style.height = "auto";
    $id("chatSend").disabled = true;
    $id("chatSuggest").hidden = true;
    $id("chatTyping").hidden = false;
    scrollToBottom();

    var respond = apiAvailable
      ? callAI(text).catch(function () {
          apiAvailable = false;
          return (
            getLocalResponse(text) +
            "\n\n*(AI-tjänsten svarar inte just nu — jag använder min lokala kunskap om Änglaljus.)*"
          );
        })
      : new Promise(function (r) {
          setTimeout(function () {
            r(getLocalResponse(text));
          }, 500 + Math.random() * 500);
        });

    respond.then(function (response) {
      $id("chatTyping").hidden = true;
      var bubble = addMessage("", "bot");
      typewriter(bubble, response).then(function () {
        isTyping = false;
      });
    });
  }

  function openWidget() {
    $id("chatWidget").hidden = false;
    $id("chatFab").classList.add("is-hidden");
    if (!hasOpened) {
      showWelcome();
      hasOpened = true;
    }
    setTimeout(function () {
      $id("chatInput").focus();
    }, 250);
  }
  function closeWidget() {
    $id("chatWidget").hidden = true;
    $id("chatFab").classList.remove("is-hidden");
  }
  function clearChat() {
    $id("chatMessages").innerHTML = "";
    history = [];
    $id("chatSuggest").hidden = false;
    showWelcome();
  }

  // ── Init ─────────────────────────────────────
  document.addEventListener("DOMContentLoaded", function () {
    injectWidget();

    $id("chatFab").addEventListener("click", openWidget);
    $id("chatClose").addEventListener("click", closeWidget);
    $id("chatClear").addEventListener("click", clearChat);

    var input = $id("chatInput");
    input.addEventListener("input", function () {
      $id("chatSend").disabled = input.value.trim().length === 0;
      input.style.height = "auto";
      input.style.height = Math.min(input.scrollHeight, 96) + "px";
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage(input.value);
      }
    });
    $id("chatSend").addEventListener("click", function () {
      sendMessage(input.value);
    });
    $id("chatSuggest").addEventListener("click", function (e) {
      var chip = e.target.closest(".chat-chip");
      if (chip) sendMessage(chip.getAttribute("data-msg"));
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !$id("chatWidget").hidden) closeWidget();
    });
  });
})();
