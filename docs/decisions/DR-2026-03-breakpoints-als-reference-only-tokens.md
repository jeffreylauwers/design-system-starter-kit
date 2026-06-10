# DR-2026-03: Breakpoints als reference-only tokens — hardcoded waarden in CSS @media rules

**ID:** DR-2026-03
**Datum:** Februari 2026
**Status:** Accepted
**Auteurs:** Jeffrey Lauwers

---

## Context

Het design system gebruikt design tokens voor alle visuele waarden: kleuren, spacing, typografie, rondingen. De logische volgende stap is breakpoints ook als tokens te definiëren zodat ze op één plek gewijzigd kunnen worden — `dsn.breakpoint.lg` in plaats van `64em` verspreid over CSS-bestanden.

CSS heeft echter een fundamentele beperking: **CSS custom properties (`var()`) werken niet in `@media` query-condities.** De browser evalueert `@media (min-width: var(--dsn-breakpoint-lg))` niet — de query wordt genegeerd als ongeldig.

Dit is geen implementatiefout maar een specificatiebeslissing in CSS: custom properties worden geresolved na cascade-berekening, maar media queries worden geëvalueerd vóór de cascade.

Op het moment van dit besluit waren er 12 CSS-bestanden met `@media`-queries en 4 unieke breakpoint-waarden in gebruik (sm: 36em, md: 44em, lg: 64em, xl: 74em).

---

## Opties overwogen

### Optie 1: Breakpoints helemaal niet tokeniseren

Breakpoints leven als gedocumenteerde conventies in de CSS-naamgevingsdocumentatie, maar bestaan niet als tokens.

**Voordeel:** Eerlijk — er is geen token als de waarde toch niet gebruikt kan worden.
**Nadeel:** De breakpoint-waarden zijn dan niet machineleesbaar voor tooling, documentatie-generatoren of de manifest. Nieuwe contributors moeten de waarden opzoeken in de CSS-bestanden.

### Optie 2: PostCSS-plugin voor token-substitutie in @media (overwogen, afgewezen)

Een PostCSS-transformatiestap kan `@media (min-width: token(dsn.breakpoint.lg))` tijdens de build omzetten naar `@media (min-width: 64em)`.

**Voordeel:** Broncode gebruikt token-referenties; gecompileerde CSS heeft hardcoded waarden.
**Nadeel:**

- Introduceert een build-afhankelijkheid voor wat een eenvoudige CSS-feature zou moeten zijn.
- De `token()`-syntaxis is niet-standaard — tooling, linters en IDE-ondersteuning begrijpen hem niet.
- Als de PostCSS-stap uitvalt of verandert, breekt de gehele responsieve layout.
- Het systeem benadrukt al dat de twee-lagenarchitectuur (DR-2026-02) plain CSS ondersteunt zonder extra build-stappen voor HTML-consumers.

### Optie 3: CSS `env()` met media query range syntax (experimenteel)

De CSS Media Queries Level 5 spec introduceert environment variables voor breakpoints. Op dit moment niet breed ondersteund.

**Voordeel:** Standaard-gebaseerd, geen tooling nodig.
**Nadeel:** Browser-ondersteuning is begin 2026 onvoldoende voor productiegebruik.

### Optie 4: Reference-only tokens — DTCG JSON, hardcoded CSS (gekozen)

Breakpoints bestaan als tokens in `base.json` met een expliciete `$description` die aangeeft dat ze reference-only zijn:

```json
"breakpoint": {
  "lg": {
    "$value": "64em",
    "$type": "dimension",
    "$description": "Large breakpoint - ~1024px. Reference only; use hardcoded values in CSS @media rules."
  }
}
```

CSS gebruikt de hardcoded waarden direct:

```css
@media (min-width: 64em) {
  /* lg breakpoint styles */
}
```

**Voordeel:**

- De breakpoint-waarden zijn machineleesbaar via de tokens (voor tooling, manifest, documentatiegeneratoren).
- Geen build-afhankelijkheid of niet-standaard syntaxis.
- CSS-bestanden zijn valide, lintbaar en begrijpelijk zonder kennis van het tokensysteem.
- De `$description` is expliciet — er is geen verborgen reden waarom tokens hier niet werken.

**Nadeel:**

- Wijzigen van een breakpoint vereist aanpassingen op twee plaatsen: het token én alle CSS-bestanden. Dit is de bewuste trade-off.
- Er is geen automatische manier om de consistentie te controleren (een token-waarde van 64em die afwijkt van een hardcoded 64em in CSS is een stille inconsistentie).

---

## Beslissing

**Breakpoints worden gedefinieerd als reference-only tokens in `base.json`. CSS-bestanden gebruiken hardcoded `em`-waarden in `@media`-queries. De `$description` van elk breakpoint-token documenteert expliciet dat `var()` niet werkt in media queries.**

De reden is dat de alternatieve aanpakken (PostCSS, experimentele CSS-features) meer complexiteit introduceren dan ze oplossen voor een systeem dat plain CSS ondersteunt. Reference-only tokens bieden machineleesbare documentatie van de breakpoint-waarden zonder build-tooling te vereisen.

De trade-off die we accepteren: de token-waarden en de CSS-waarden kunnen handmatig uit de pas lopen bij een breakpoint-wijziging. Dit risico is beheersbaar omdat (a) breakpoints zelden wijzigen, (b) er slechts 4 unieke waarden zijn verspreid over 12 bestanden, en (c) een eenvoudige `grep` de afwijkingen vindt.

---

## Impact

| Dimension                            | Meting                       |
| ------------------------------------ | ---------------------------- |
| CSS-bestanden met @media queries     | 12                           |
| Unieke breakpoint-waarden in gebruik | 4 (36em, 44em, 64em, 74em)   |
| Token-bestanden geraakt              | 1 (`themes/start/base.json`) |
| Build-stappen toegevoegd             | 0                            |
| Breaking changes                     | Nee                          |

---

## Gevolgen

**Wat makkelijker wordt:**

- CSS-bestanden zijn valide standaard-CSS zonder kennis van het tokensysteem.
- De breakpoint-waarden zijn gedocumenteerd en vindbaar via `base.json`.
- HTML-consumers van `@dsn-starter-kit/components-html` hebben geen build-pipeline nodig.

**Wat moeilijker wordt:**

- Een breakpoint-wijziging vereist aanpassing in `base.json` én in alle betrokken CSS-bestanden. Er is geen automatische synchronisatie.
- De inconsistentie tussen "we tokeniseren alles" en "behalve in @media" is verwarrend voor contributors die het "waarom" niet kennen. Dit is de primaire reden voor dit decision record.

**Nieuwe verplichting voor contributors:**
Bij een breakpoint-aanpassing altijd beide plaatsen bijwerken: (1) de `$value` in `base.json`, en (2) alle hardcoded waarden in CSS-bestanden. De juiste waarden zijn documentatie, niet bron van waarheid voor de build.

---

## Supersedes / superseded by

Herzie dit besluit wanneer:

- CSS environment variables voor media queries brede browser-ondersteuning bereiken (dan: migreer naar native standaard)
- De CSS Houdini custom media spec stabiel is in alle major browsers

---

## Gerelateerde records

- DR-2026-02 (twee-lagenpatroon) — plain CSS zonder build-dependencies is een expliciete architectuurdoelstelling
- Zie ook: CLAUDE.md §2 "Tokens: nooit hardcoded waarden in CSS" — breakpoints zijn de gedocumenteerde uitzondering op deze regel
- Zie ook: `docs/02-design-tokens-reference.md` voor de volledige tokenlijst inclusief breakpoints
