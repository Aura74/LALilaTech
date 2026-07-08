# Änglaljus (LALilaTech)

Premium enkelsidig demo för en fiktiv nyandlighetsverksamhet — healing,
meditation och medial vägledning. Byggd 2026-07-08 som en helt ny sida ovanpå
det gamla Natours-kursprojektet; det som togs vidare var idéerna Lars gillade
(vändbara kort, fullskärmsmeny, foto-kollage) i förfinad form.

## Tech Stack

| Del | Val |
|---|---|
| Kod | Ren HTML/CSS/JS — inga ramverk, inga byggverktyg |
| Fonter | Cormorant Garamond (rubriker) + Montserrat (brödtext/UI), Google Fonts `display=swap` |
| Smooth scroll | Lenis 1.1.14 (CDN) — aktiv **endast i Cinematic-läget** |
| Ikoner | Inline-SVG (`stroke: currentColor`) |
| Bilder | AI-genererade änglar (Midjourney) + Pexels, lokala i `img/` |
| Deploy | Azure Static Web Apps (GitHub Actions) |

## Projektstruktur

```
LALilaTech/
├── index.html      # Hela sidan
├── css/style.css   # All styling (variabler, dark mode, effektlägen)
├── js/main.js      # Tema, meny, reveals, änglakort, effektväljare, Lenis, demo-formulär
└── img/            # Bilder + hero-video (img/mp4/)
```

## Sektioner

| # | Sektion | Innehåll |
|---|---|---|
| 1 | `#hero` | Fullskärms-video + scrim + **ljuspartiklar (canvas, endast Cinematic)** + CTA |
| 2 | `#filosofi` | Text + kollage med tre överlappande änglabilder |
| 3 | `#tjanster` | 3 tjänstekort (bild, titel, text, "Från X kr", "Boka →" öppnar modalen) |
| 4 | `#anglakort` | **Dra ett änglakort** — 3 klick-vändbara kort, kortlek på 9 budskap som slumpas, "Blanda om" delar nya |
| 5 | `#roster` | 6 kundröster i **Swiper-karusell** (autoplay 6,5 s, av i Essential; grid-fallback utan CDN) |
| 6 | `#presentkort` | "Ge bort en stund av ro" — beloppschips + live-förhandsvisning av kort med guldram (Stripe Checkout i skarp drift) |
| 7 | `#faq` | Accordion med 5 vanliga frågor (max-height-transition, aria-expanded) |
| 8 | `#kontakt` | Formulär + "Boka ett samtal" (öppnar bokningsmodalen) |
| 9 | Footer | Wordmark, **månfas** (beräknas i JS), nyhetsbrevs-stub, länkar, attribution |

## AI-chatten Selma (`js/chat.js`)

Flytande knapp nere till höger (effektväljaren flyttade till vänster). Gemini
API med modellfallback (`gemini-flash-latest` → `gemini-flash-lite-latest`) +
**lokal offline-hjärna** med Änglaljus-kunskap (priser, tjänster, bokning,
avbokning, presentkort) som tar över när API:t inte svarar. Systemprompten har
en viktig regel: healing ersätter aldrig vård — Selma hänvisar till 1177/112
vid medicinska frågor.

**API-nyckeln ligger i `js/apikey.js` som är GITIGNORAD.** 2026-07-08 spärrade
Google den gamla nyckeln ("reported as leaked" — den låg hårdkodad i publika
GitHub-repon). Ny nyckel: https://aistudio.google.com/apikey → klistra in i
`js/apikey.js`. Committa den ALDRIG. Utan nyckel kör Selma offline-läge.

## Stämningsljud (Web Audio, ingen ljudfil)

Högtalarknapp i toppraden. Genererar stilla vindspel i realtid: slumpade toner
ur A-pentatonisk skala (sinus + överton, 4–7 s utklingning, var 2,5–7,5 s) över
en mjuk bordunton på 110 Hz. Startar endast på klick (autoplay-policy),
mastervolym 0,12.

## Bokningsmodalen (demo — ingen backend)

Tre steg: tjänst → dag (kommande 7 dagar, `Intl.DateTimeFormat sv-SE`) + tid →
namn/e-post → bekräftelse. "Boka →" på ett tjänstekort förväljer tjänsten och
hoppar till steg 2. Bokningar sparas i `localStorage` under
`lalilatech:bookings`. Stängs med X, overlay-klick eller Esc; scroll låses.
I skarp drift ersätts detta av **Calendly eller Cal.com**. Nyhetsbrevet är en
toast-stub — i produktion: Mailchimp/Beehiiv/ConvertKit.

## Design system

- **Palett (ljust):** bas `#faf8f5`, tintad `#f3eee8`, text `#6f6478`, rubriker `#2b2130`,
  guld `#a8853b` (mörkare `#77601f` för liten text, WCAG), plommon `#330042` (arv från gamla sidan)
- **Mörkt läge:** bas `#131017`, ytor `#201927`, guld ljusnar till `#d4b26a`
- **Skuggor:** brandtintade flerlagers (`rgba(51,0,66,…)`), aldrig platt svart
- **Radius:** 4px. Hover: `translateY(-2/-3px)` + bildskala 1.03. Eyebrows med flankerande linjer.
- **Breakpoints:** 1200 / 1024 / 768 / 480 (desktop-first)

## Dark mode

Toggle i toppraden (måne/sol). `localStorage`-nyckel `theme` (oprefixad),
inline-script i `<head>` sätter `data-theme` före paint, fallback
`prefers-color-scheme`.

## Effektlägen (Essential / Balanced / Cinematic)

- Väljare: rund knapp nere till höger. Sparas som `lalilatech:perfMode`, styr `data-perf` på `<html>`.
- Auto-val före paint: reduced-motion → Essential; svag CPU/minne/spardata → Balanced; annars Cinematic.
- FPS-test (2 s efter load, bara auto-Cinematic): < 45 fps → toast som föreslår Balanced.
- **Cinematic:** allt + Lenis smooth scroll.
- **Balanced (standard på svag hårdvara):** allt utom Lenis.
- **Essential:** dessutom inga scroll-reveals (allt synligt direkt), hero-videon ersätts
  med stillbild, inga hovertransformer, kortvändning utan animation.
- Lägen byts live utan omladdning (Lenis startas/stoppas i JS).

## Änglakorten

Kort = `<button aria-pressed>`; klick vänder (`rotateY` på `.angel-card__inner`,
`backface-visibility`). Baksida: CSS-ornament (dubbel guldram, vinge-SVG, stjärna).
Framsida: änglabild + mörk veil + budskapsord. "Blanda om" återställer alla.
Fungerar med tangentbord och touch.

## Fullskärmsmenyn

Hamburgare (alla skärmstorlekar, medvetet val) → fullskärmsöverlägg i plommon-
gradient med numrerade serif-länkar som fadear in i sekvens. Burgaren morfar
till X och **ligger ovanpå överlägget** (`body.menu-open .nav { z-index: 940 }` —
menyn själv är 920; sänk inte navens z-index under menyns). Stängs via X,
länkklick eller Esc. Scroll låses medan menyn är öppen.

## How to Run

Öppna `index.html` direkt, eller `npx serve .`

## Kända fallgropar

- `[hidden]{display:none!important}` finns i CSS — annars slår `.btn{display:inline-block}`
  ut UA-stylens `[hidden]` (drabbade "Blanda om"-knappen).
- Vid puppeteer-test: `scroll-behavior:smooth` gör att `window.scrollTo`-loopar aldrig
  når botten — använd `behavior:'instant'`.

## Bildkällor

AI-genererade (Midjourney): änglar, skog, porträtt. Pexels: Tara Winstead
(8386356, hand i blått ljus — hero-poster/Essential-fallback), Mikhail Nilov
(7672262 — bakgrund änglakortssektionen). Hero-video: `img/mp4/video (720p).mp4`.
Oanvända bilder från gamla sidan är samlade i **`img/oanvanda/`** (zeus,
brothers_grim, mango, mask_rose, blahoghusvatten, pngegg-logga) — mappen kan
flyttas eller raderas utan att sidan påverkas. Använda bilder är 31–156 KB
styck (~550 KB totalt); den tunga filen är hero-videon på 11 MB (komprimera
med HandBrake till ~3 MB inför skarp publicering).
