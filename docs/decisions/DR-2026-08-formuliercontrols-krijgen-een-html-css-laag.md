# DR-2026-08: Formuliercontrols krijgen alsnog een HTML/CSS-laag

**ID:** DR-2026-08
**Datum:** Augustus 2026
**Status:** Accepted
**Auteurs:** Jeffrey Lauwers

---

## Context

DR-2026-02 legt het twee-lagenpatroon vast: HTML/CSS is de bron van waarheid, React is een wrapper. Datzelfde record noteert een uitzondering: 19 formuliercontrols zouden geen HTML/CSS-tegenhanger hebben omdat hun JS-gedrag de HTML-laag domineert. `manifest.json` registreerde die 19 met `"platforms": ["react"]`.

Die uitzondering leverde twee problemen op (zie [#320](https://github.com/jeffreylauwers/design-system-starter-kit/issues/320)):

1. **CLAUDE.md sprak het manifest tegen.** CLAUDE.md stelt "elk component heeft altijd twee lagen, geen uitzonderingen"; het manifest registreerde er 19.
2. **Storybook toonde een onbruikbare HTML/CSS-tab.** De docs-pagina's van deze controls hebben een `htmlTemplate` (verplicht sinds DR-2026-04), dus Storybook rendert een HTML/CSS-codeblok met `dsn-checkbox`-markup. Die CSS zat in `components-react`, niet in `components-html`, en `./checkbox` ontbrak in de `exports`-map. Wie de markup kopieerde kreeg ongestyled resultaat.

Bij het natellen bleken de 19 niet gelijkwaardig. Vijf ervan (EmailInput, NumberInput, PasswordInput, TelephoneInput, FormFieldLegend) definiëren geen eigen CSS: ze renderen `dsn-text-input` respectievelijk `dsn-form-field-label`, blokken die al in `components-html` staan. Het echte werk zat in de overige 14, samen ongeveer 580 regels CSS.

Het oorspronkelijke bezwaar tegen verhuizen (uit #265: `components-react` zou een harde runtime-dependency op `components-html` krijgen) is vervallen sinds #351: `@tsdown/css` lost de `@import`-ketens op tijdens de build, `components-html` is build-time only.

---

## Opties overwogen

### Optie 1: React-only vastleggen en de Storybook-tab verbergen

De uitzondering in CLAUDE.md expliciet maken, en bij de 14 de `htmlTemplate` verwijderen zodat de HTML/CSS-tab verdwijnt.

**Voordeel:** Klein, snel, geen CSS verplaatst.
**Nadeel:** Vereist ook een wijziging van DR-2026-04, dat juist een `htmlTemplate` voor elk component met een docs-pagina eist. Het maakt de asymmetrie permanent: HTML/CSS-teams kunnen geen formulier bouwen met dit design system, terwijl formulieren de meest voorkomende toepassing zijn. En de motivering ("JS-gedrag domineert") klopt niet: `<input type="checkbox">` en `<select>` zijn native elementen die zonder JavaScript werken.

### Optie 2: De CSS verhuizen naar `components-html` (gekozen)

De 14 CSS-bestanden verhuizen naar `packages/components-html/src/`, de React-CSS vervangen door een `@import` (het patroon dat de andere 54 componenten al gebruiken), `exports`-entries toevoegen en `platforms` op `["html-css", "react"]` zetten.

**Voordeel:** De twee-lagenregel geldt weer zonder uitzondering. De HTML/CSS-tab in Storybook klopt in plaats van te verdwijnen. HTML/CSS-consumenten kunnen formulieren bouwen. DR-2026-02 en DR-2026-04 blijven ongewijzigd van kracht.
**Nadeel:** Grotere diff, en het legde een cascade-probleem bloot dat opgelost moest worden (zie hieronder).

---

## Beslissing

**Alle 73 componenten hebben een HTML/CSS-laag. De uitzondering uit DR-2026-02 vervalt.**

De 14 CSS-bestanden staan nu in `packages/components-html/src/`, met een `exports`-entry per component. `components-react` importeert ze via een relatieve `@import`, precies zoals de andere 54. Vijf componenten hebben geen eigen CSS-bestand omdat ze het blok van een ander component renderen; hun `platforms` bevat wél `html-css`, want hun markup is volledig gestyled door `components-html`.

### Volgorde in de bundel: `@dsn-depends-on`

`dist/components.css` plakte de component-CSS in alfabetische volgorde aan elkaar. Vier controls overriden `.dsn-text-input` op gelijke specificiteit (`.dsn-select` zet `max-inline-size` en `padding-inline-end`, `.dsn-search-input` zet `padding-inline-start`), en alfabetisch komen `date-input`, `search-input` en `select` vóór `text-input`. Hun overrides zouden dus verliezen.

De voor de hand liggende oplossing, een echte `@import '../text-input/text-input.css'` in die bestanden, werkt niet: `@tsdown/css` dedupliceert geneste imports niet, waardoor `text-input.css` in `components-react/dist/index.css` meerdere keren belandt, waaronder ná `.dsn-select`, wat het probleem daar juist introduceert.

Daarom declareert zo'n component zijn volgorde-afhankelijkheid met een comment:

```css
/* @dsn-depends-on: text-input */
```

Het build-script van `components-html` leest die annotatie, sorteert topologisch en zet de afhankelijkheid eerst. Voor elke bundler is het een gewone comment, dus er verandert niets aan de React-build. Datzelfde script hijst nu ook package-`@import`s (de hero-tokens) naar de top van `dist/components.css`, want `@import` is alleen geldig vóór de eerste regel.

Specificiteit verhogen (`.dsn-text-input.dsn-select`) is overwogen en afgewezen: dat wint dan ook van `.dsn-text-input:focus`, waardoor de focus-styling van een `<select>` verdwijnt.

---

## Impact

| Dimension                    | Meting                                                                    |
| ---------------------------- | ------------------------------------------------------------------------- |
| CSS-bestanden verplaatst     | 14, van `components-react/src/` naar `components-html/src/`               |
| Regels CSS verplaatst        | ongeveer 580                                                              |
| `exports`-entries toegevoegd | 14                                                                        |
| Manifest-wijzigingen         | 19 componenten van `["react"]` naar `["html-css", "react"]`               |
| Componenten React-only       | 0                                                                         |
| Build-script                 | volgorde nu topologisch via `@dsn-depends-on`, package-`@import`s gehoist |
| Breaking changes             | Nee: dezelfde klassen, dezelfde markup, alleen een nieuw beschikbare laag |

---

## Gevolgen

**Wat makkelijker wordt:**

- HTML/CSS-consumenten kunnen formulieren bouwen: checkbox, radio, select, search, date en time zijn er nu.
- De HTML/CSS-tab in Storybook is voor elk component te kopiëren zonder verrassingen.
- `manifest.json` heeft geen uitzonderingen meer, dus de Figma-generator (DR-2026-05) hoeft voor Checkbox en Radio niet meer naar `components-react` te wijzen.

**Wat moeilijker wordt:**

- Een component dat een ander component op gelijke specificiteit overrided moet dat declareren met `@dsn-depends-on`. Vergeet je dat, dan hangt het resultaat af van de alfabetische volgorde.

**Nieuwe verplichting voor contributors:**
Geen. De bestaande regel (beide lagen bij elk nieuw component) geldt nu weer zonder uitzondering.

---

## Supersedes / superseded by

Vervangt de uitzondering uit DR-2026-02 ("sommige form-componenten hebben geen HTML/CSS-tegenpartij"). De rest van DR-2026-02, het twee-lagenpatroon zelf, blijft ongewijzigd van kracht.

---

## Gerelateerde records

- DR-2026-02 (twee-lagenpatroon): dit record heft de uitzondering op die daar was genoteerd
- DR-2026-04 (`htmlTemplate` spiegelt de echte render): blijft ongewijzigd; de templates van deze 14 klopten al, alleen de CSS ontbrak
- DR-2026-07 (CSS los van de JavaScript-bundel): de reden dat de verhuizing geen runtime-dependency oplevert
- Zie ook: issue [#320](https://github.com/jeffreylauwers/design-system-starter-kit/issues/320)

---

## Review trigger

Herzie dit besluit als een formuliercontrol zo veel JS-gedrag krijgt dat de markup zonder JavaScript niet meer werkt, of als de bundler van `components-react` geneste `@import`s wél gaat dedupliceren, waarmee `@dsn-depends-on` vervangen kan worden door een gewone `@import`.
