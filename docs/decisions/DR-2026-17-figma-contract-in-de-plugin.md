# DR-2026-17: Het contract tussen de Figma-generators en de plugin staat in de plugin

**ID:** DR-2026-17
**Datum:** November 2026
**Status:** Accepted
**Auteurs:** Jeffrey Lauwers

---

## Context

Drie builds schrijven JSON die de Figma-plugin inleest: `design-tokens` (de variables), `figma-sync/build-icons.js` (de iconset) en `figma-sync/build-components.js` (de component sets). Wat die JSON betekent, stond aan beide kanten los uitgeschreven:

- de `$schema`-namen, in de generators en in de plugin
- de paginanamen (`dsn/Button`, `dsn/Icons`), in `to-figma.js`, `build-icons.js` en de plugin
- de volgorde waarin bestanden geïmporteerd moeten worden, in `ui.html`
- de regel hoe de plugin de root van een variant bouwt (het component zelf, een SVG-vlak of een frame eromheen). De generator moet die kennen om de lagen van een instance terug te vinden, en had een eigen kopie.

Loopt zo'n kopie uit de pas, dan merkt niemand het tot er in Figma iets op de verkeerde pagina staat of een override zijn laag niet vindt. Geen test vergeleek de twee kanten.

---

## Opties overwogen

### Optie 1: Kopieën laten staan, met een test die ze vergelijkt

**Voordeel:** Geen afhankelijkheid tussen de packages.
**Nadeel:** De test moet weten welke constanten bij elkaar horen, en de regel voor de root is een functie, geen waarde. Twee implementaties van dezelfde regel testen is meer werk dan er één hebben.

### Optie 2: Een eigen package voor het contract

**Voordeel:** De netste afhankelijkheidsrichting: generators en plugin hangen allebei aan iets neutraals.
**Nadeel:** Een package voor zo'n honderd regels, met een eigen `package.json`, build en workspace-entry. `design-tokens` wordt naar npm gepubliceerd en mag geen afhankelijkheid van een privé-package krijgen, dus ook dan blijft het een relatieve import voor die ene build.

### Optie 3: Eén module in de plugin, relatief geïmporteerd (gekozen)

`packages/figma-plugin/src/contract.js` met gewone functies en constanten. De generators importeren hem met een relatief pad; esbuild bundelt hem mee in de plugin.

**Voordeel:** Eén bron, zonder nieuw package. De plugin heeft geen afhankelijkheden, dus er ontstaat geen kring.
**Nadeel:** Drie packages importeren buiten hun eigen map. Dat mag alleen omdat het build-scripts zijn die niet in een gepubliceerd pakket meegaan.

---

## Beslissing

**`figma-plugin/src/contract.js` is de enige plek waar staat wat de Figma-JSON betekent. De generators importeren het relatief.**

Deelbesluiten:

**Wat erin staat:** `SCHEMAS`, `IMPORT_ORDER`, `kindOf` en `assertSchema`; `PAGE_PREFIX`, `pageNameFor` en `ICON_PAGE`; `rootShapeOf`; `dependencyOrder` en `planImports`.

**Geen `figma` en geen Node.** De module draait in de plugin-sandbox, in Node (de generators) en in de smoke test. Alles wat een van die omgevingen nodig heeft, hoort er niet in.

**De plugin plant de imports, niet de UI.** `ui.html` leest alleen de bestanden en stuurt ze door; `planImports` bepaalt de volgorde (variables, iconen, component sets, en die laatste onderling naar afhankelijkheid) en weigert bestanden met een onbekend schema. Zo is de volgorde te testen zonder de UI.

**Alleen voor build-scripts.** De relatieve import in `design-tokens/src/config/figma.js` zit in een bestand dat niet in het npm-pakket meegaat (`files` is `dist` en `css.d.ts`). Een import vanuit code die wel gepubliceerd wordt, zou de installatie breken.

---

## Impact

| Wat                                 | Waar                                                      |
| ----------------------------------- | --------------------------------------------------------- |
| Het contract                        | `figma-plugin/src/contract.js`                            |
| Schema van `variables.json`         | `design-tokens/src/config/figma.js`                       |
| Schema en pagina van de iconset     | `figma-sync/src/build-icons.js`                           |
| Schema en pagina's van de sets      | `figma-sync/src/to-figma.js`                              |
| Root van een variant (generator)    | `figma-sync/src/build-components.js`                      |
| Root van een variant (plugin)       | `figma-plugin/src/components.js`                          |
| Volgorde van de imports             | `figma-plugin/src/main.js` (via `planImports`), `ui.html` |
| Uitleg voor wie aan de plugin werkt | "Het contract met de generators" in de plugin-README      |

Zie ook [DR-2026-05](DR-2026-05-figma-genereren-uit-code-via-plugin.md).
