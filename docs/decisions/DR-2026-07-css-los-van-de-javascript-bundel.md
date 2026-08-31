# DR-2026-07: CSS los van de JavaScript-bundel — geen automatische stijlen, wel laadbaar in Node

**ID:** DR-2026-07
**Datum:** Augustus 2026
**Status:** Accepted
**Auteurs:** Jeffrey Lauwers

---

## Context

Tot en met v2.0.0 werd `@dsn-starter-kit/components-react` gepubliceerd met kale `tsc`. Elk component-bestand bevatte een side-effect import van zijn eigen stijlen:

```ts
// Button.tsx
import './Button.css';
```

Voor de consument was dat comfortabel: importeer `Button`, krijg de stijlen erbij. Er was daarnaast een `./css`-export met alle stijlen gebundeld, die `docs/00-getting-started.md` al voorschreef, maar wie hem oversloeg merkte daar niets van.

Het probleem kwam aan het licht toen een developer het package van npm installeerde. Node kan een `.css`-bestand niet als module laden. In combinatie met twee andere gebreken van de `tsc`-publicatie (ESM-syntaxis zonder `"type": "module"`, en directory-imports als `export * from './ActionGroup'`) was het package in het geheel niet laadbaar door Node:

```
Error: Directory import '.../dist/ActionGroup' is not supported resolving ES modules
```

Zowel `import` als `require` faalden. Alleen bundlers konden ermee overweg, omdat die CSS-imports zelf afvangen en directory-imports oplossen. Server-side rendering, Jest en elk `require()` liepen vast.

Binnen de monorepo was hier niets van te zien: Storybook en vitest resolven de bronbestanden via Vite-aliassen en raken `dist/` nooit aan. CI was groen.

---

## Opties overwogen

### Optie 1: Assets meeleveren en de imports laten staan

De CSS-bestanden meepubliceren en de per-component imports behouden.

**Voordeel:** Geen enkele wijziging voor bestaande consumenten.
**Nadeel:** Lost het kernprobleem niet op. Een `import './Button.css'` in de JS blijft onlaadbaar voor Node, ongeacht of het bestand bestaat. Het package blijft daarmee bundler-only.

### Optie 2: tsdown met `css.inject: true`

tsdown extraheert de CSS en laat een import naar het geëxtraheerde bestand in de JS staan.

**Voordeel:** Het gemak blijft: stijlen komen automatisch mee. Geen breaking change.
**Nadeel:** Precies dezelfde blokkade. De import staat er nog, dus Node kan de module nog steeds niet laden. Het lost de bestandsnamen en de module-formaten op, maar niet waar het om begonnen was.

### Optie 3: CSS-in-JS of `<style>`-injectie op runtime

De stijlen als string meebundelen en op runtime in het document injecteren.

**Voordeel:** Eén import, stijlen komen mee, en de JS blijft laadbaar.
**Nadeel:** Breekt de twee-lagenarchitectuur (DR-2026-02): de CSS is dan geen los, leesbaar artifact meer. Injectie op runtime geeft bovendien een flash of unstyled content bij SSR, werkt niet met een strikte Content Security Policy zonder nonce-werk, en maakt het onmogelijk om de stijlen te overschrijven met een eigen stylesheet die later in de cascade komt.

### Optie 4: `css.inject: false` — JS zonder CSS-imports (gekozen)

De JavaScript bevat geen enkele CSS-import. Alle component-CSS komt in `dist/index.css`, bereikbaar via de bestaande `./css`-export. De consument importeert die zelf, één keer, in het entry point.

**Voordeel:**

- De JS is laadbaar door Node. Server-side rendering werkt zonder bundler, geverifieerd met `renderToString` op een kale Node-installatie.
- Het is de conventie die de meeste React-componentbibliotheken volgen, dus het is wat consumenten verwachten.
- De CSS blijft een los, leesbaar en overschrijfbaar artifact, in lijn met de twee-lagenarchitectuur.
- Het is de opzet die de eigen getting-started al voorschreef.

**Nadeel:**

- Breaking change: wie de per-component import-side-effect gebruikte, krijgt een ongestileerde pagina tot hij de CSS-import toevoegt.
- Het faalt stil. Een vergeten import geeft geen foutmelding, alleen ongestileerde componenten.

---

## Beslissing

**De gepubliceerde JavaScript bevat geen CSS-imports. `css.inject` staat op `false` in `packages/components-react/tsdown.config.ts`. Consumenten importeren `@dsn-starter-kit/components-react/css` zelf, na `@dsn-starter-kit/core/css`.**

De reden is dat het comfort van optie 1 en 2 precies het gebrek is dat het package onbruikbaar maakte buiten een bundler. Een design system dat niet server-side gerenderd kan worden, sluit een groot deel van het moderne React-landschap uit: Next.js App Router, Remix, Astro. Dat weegt zwaarder dan één regel import in het entry point van de consument.

De trade-off die we accepteren: een vergeten CSS-import geeft geen foutmelding, alleen een ongestileerde pagina. Dat risico is beheersbaar omdat het symptoom onmiddellijk en onmiskenbaar is, en omdat de eerste stap van de getting-started er expliciet over gaat.

---

## Impact

| Dimensie                                   | Meting                                                    |
| ------------------------------------------ | --------------------------------------------------------- |
| Publiceerbare packages omgezet naar tsdown | 4 (core, components-react, components-web, design-tokens) |
| Uitgeleverde module-formaten per package   | 2 (ESM + CommonJS), met eigen types per formaat           |
| CSS-imports in de gepubliceerde JS         | 0 (was: één per component)                                |
| Class-selectors in `dist/index.css`        | 476, identiek aan de bron                                 |
| Breaking changes voor React-consumenten    | 2 (CSS-import, `IconName`-importpad)                      |
| Eerste versie met deze opzet               | 3.0.0                                                     |

---

## Gevolgen

**Wat makkelijker wordt:**

- Server-side rendering werkt, zonder bundler en zonder configuratie.
- `require()` werkt, dus Jest en CommonJS-configuratie kunnen het package gebruiken.
- De volgorde van de stijlen is expliciet en bepaalbaar door de consument, in plaats van af te hangen van de volgorde waarin componenten toevallig geïmporteerd worden.

**Wat moeilijker wordt:**

- De consument moet één regel toevoegen die hij eerder niet nodig had, en krijgt geen foutmelding als hij het vergeet.
- Per-component CSS laden kan niet meer via de React-laag. Wie alleen de stijlen van één component wil, haalt ze uit `@dsn-starter-kit/components-html/{component}`.

**Nieuwe verplichting voor contributors:**
Zet `css.inject` niet op `true`, hoe redelijk het ook klinkt om consumenten de import te besparen. Dat is precies de wijziging die SSR opnieuw breekt, en de monorepo laat het niet zien: Storybook en vitest gebruiken de bron, niet `dist/`. Verifieer een wijziging aan de build altijd tegen het gepubliceerde artifact, niet tegen de broncode. `docs/04-development-workflow.md` beschrijft de stappen.

---

## Supersedes / superseded by

Herzie dit besluit wanneer:

- CSS Module Scripts (`import styles from './x.css' with { type: 'css' }`) brede ondersteuning krijgen in Node én in de gangbare bundlers. Dan kan de JS de stijlen weer zelf meenemen zonder onlaadbaar te worden.

---

## Gerelateerde records

- DR-2026-02 (twee-lagenpatroon) — de CSS blijft een los artifact; dat is hier de reden om runtime-injectie af te wijzen
- Zie ook: `docs/00-getting-started.md` §2 en §7 voor de consumentenkant
- Zie ook: `docs/04-development-workflow.md` voor de verificatiestappen na een publish
