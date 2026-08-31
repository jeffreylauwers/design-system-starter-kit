# DR-2026-02: Twee-lagenpatroon — HTML/CSS als bron van waarheid, React als wrapper

**ID:** DR-2026-02
**Datum:** December 2025
**Status:** Accepted
**Auteurs:** Jeffrey Lauwers

---

## Context

Het design system moest van het begin af aan meerdere consumptiemodellen ondersteunen: teams die vanilla HTML/CSS gebruiken, teams die React gebruiken, en toekomstige Web Components. De vraag was: waar zit de stijllogica, en wat is de relatie tussen de lagen?

Er zijn drie fundamenteel verschillende architectuurkeuzes denkbaar:

1. CSS-only: één CSS-bestand per component, geen opiniative JavaScript-laag.
2. React-first: componenten zijn primair React, CSS is een bijproduct (CSS Modules, styled-components, Tailwind).
3. Twee-lagen: HTML/CSS is de bron van waarheid, React is een dunne wrapper die de juiste klassen genereert.

De keuze hier heeft langetermijngevolgen voor adoptie, theming, Web Components, en de vraag of het systeem overdraagbaar is naar andere frameworks.

---

## Opties overwogen

### Optie 1: CSS-only (geen React-laag)

Componenten leven als CSS-klassen. Frameworks gebruiken de klassen direct.

**Voordeel:** Framework-agnostisch van nature. Geen lock-in. Eenvoudig te begrijpen.
**Nadeel:** Geen TypeScript-props, geen autocompletion, geen compile-time fouten. Elke React-ontwikkelaar moet de BEM-klassen kennen en correct samenstellen. Moeilijk om complexe conditionals (loading + disabled + fullWidth tegelijk) consistent te houden.

### Optie 2: React-first met CSS Modules of styled-components

CSS leeft dicht bij de React-component, gegenereerd of geïmporteerd als module.

**Voordeel:** Standaard React DX, goede tooling, autocompletion.
**Nadeel:** CSS is niet meer los importeerbaar voor HTML-teams. Web Components zouden de CSS moeten dupliceren of van React afhangen. Theming via design tokens werkt minder goed: CSS custom properties zijn de standaard voor theming, maar CSS-in-JS kan die niet altijd correct doorgeven. Het systeem wordt React-afhankelijk.

### Optie 3: Twee-lagen — HTML/CSS als bron van waarheid (gekozen)

```
packages/components-html/src/button/button.css   ← bron van waarheid
packages/components-react/src/Button/Button.tsx  ← wrapper, importeert .css, genereert klassen
packages/components-web/src/button/               ← wrapper, importeert dezelfde .css
```

React doet niets meer dan de juiste BEM-klassen samenstellen op basis van props:

```tsx
const classes = classNames(
  'dsn-button',
  `dsn-button--${variant}`,
  `dsn-button--size-${size}`,
  loading && 'dsn-button--loading'
);
```

**Voordeel:**

- HTML/CSS-teams en React-teams gebruiken hetzelfde visuele systeem — er is geen "React-versie" en "HTML-versie" die kunnen divergeren.
- Web Components kunnen dezelfde CSS importeren zonder extra abstractielaag.
- Theming via CSS custom properties werkt in alle lagen identiek.
- De CSS is de specificatie: als je wilt weten wat een component kan, lees je de CSS.

**Nadeel:**

- Contributors moeten twee bestanden bijhouden per component (CSS + TSX).
- Sommige form-componenten (Checkbox, Radio, Select) hebben geen HTML/CSS-tegenpartij in `components-html` omdat hun JS-gedrag (show/hide, custom styling) niet zinvol is zonder React. Dit creëert een lichte asymmetrie in het systeem. **Achterhaald sinds DR-2026-08:** deze componenten hebben alsnog een HTML/CSS-laag gekregen.

---

## Beslissing

**Het design system gebruikt het twee-lagenpatroon. HTML/CSS is de bron van waarheid; React genereert de juiste klassen zonder eigen stijllogica toe te voegen.**

De primaire reden is portabiliteit: de CSS-laag werkt in elk framework en in Web Components zonder aanpassing. De React-laag is een DX-verbetering bovenop een systeem dat zonder React volledig functioneel is. Dit maakt het systeem ook bruikbaar als "design system starter kit" voor teams die React misschien later wisselen voor iets anders.

De trade-off die we accepteren: twee bestanden per component in plaats van één. Dit is expliciete overhead, maar de betaalbaarheid is hoog: de CSS-bestanden zijn klein, de React-wrappers zijn dunne klassen-assemblers, en de structuur is volledig voorspelbaar.

---

## Impact

| Dimension                          | Meting                                                                   |
| ---------------------------------- | ------------------------------------------------------------------------ |
| Componenten met beide lagen        | 73 (alle componenten; was 50 tot DR-2026-08)                             |
| Componenten React-only             | 0 (waren er 19 tot DR-2026-08)                                           |
| Componenten met Web Component laag | 7 (button, heading, icon, link, ordered-list, paragraph, unordered-list) |
| Manifest-registratie               | `packages/components-html/manifest.json` — platforms-veld per component  |
| Breaking changes                   | Nee — architectuurkeuze bij aanvang van het project                      |

---

## Gevolgen

**Wat makkelijker wordt:**

- Een component debuggen: de CSS-klasse is de bron van waarheid, niet de component-output.
- Theming: CSS custom properties werken in alle lagen identiek — één token-definitie, drie platforms.
- Web Components toevoegen: de CSS is al klaar, de Web Component schrijft alleen een klassen-assembler.
- Adoptie door niet-React teams: ze gebruiken `components-html` direct.

**Wat moeilijker wordt:**

- Nieuwe contributors moeten begrijpen dat ze bij een bug in de visuele uitvoer de CSS moeten aanpassen, niet de TSX.
- De asymmetrie bij form-componenten (geen HTML/CSS counterpart voor Checkbox etc.) is verwarrend als je het patroon niet kent. Dit staat gedocumenteerd in `manifest.json` via het `platforms`-veld. **Opgeheven in DR-2026-08:** alle componenten staan nu op `["html-css", "react"]`.

**Nieuwe verplichting voor contributors:**
Bij elk nieuw component moeten beide lagen worden uitgewerkt. Een PR met alleen een React-component of alleen een CSS-bestand is incompleet. Dit staat als vaste checklist in `new-component-issue.md`.

---

## Supersedes / superseded by

De uitzondering voor formuliercontrols is vervangen door DR-2026-08. Het twee-lagenpatroon zelf blijft ongewijzigd van kracht.

---

## Gerelateerde records

- DR-2026-01 (button label) — de twee-lagenstructuur is de reden waarom de label-span in HTML bestaat, niet als React-prop
- DR-2026-03 (breakpoints) — dezelfde reden dat breakpoints als CSS-waarden leven, niet als React-props
- DR-2026-08 (formuliercontrols) — heft de uitzondering op die hier was genoteerd
- Zie ook: CLAUDE.md §"Twee-lagen implementatiepatroon: ALTIJD"

---

## Review trigger

Herzie dit besluit als een groot deel van de productteams overschakelt naar een framework waarvan de integratie met plain CSS significant slechter is, of als Web Components voldoende marktpositie hebben om de React-laag als primaire laag te vervangen.
