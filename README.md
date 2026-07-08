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
| 1 | `#hero` | Fullskärms-video (strand) + scrim + eyebrow + Cormorant-titel + CTA |
| 2 | `#filosofi` | Text + kollage med tre överlappande änglabilder |
| 3 | `#tjanster` | 3 tjänstekort (bild, titel, text, "Från X kr") |
| 4 | `#anglakort` | **Dra ett änglakort** — 3 klick-vändbara kort (Frid/Mod/Hopp) + "Blanda om" |
| 5 | `#roster` | 2 citatkort med avatarer |
| 6 | `#kontakt` | Formulär + bokningsknapp (demo — toast; i produktion: Calendly/Cal.com) |
| 7 | Footer | Wordmark, länkar, attribution |

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
Oanvända bilder från gamla sidan ligger kvar i `img/png/` (zeus, brothers_grim,
mango, mask_rose, blahoghusvatten, pngegg-logga).
