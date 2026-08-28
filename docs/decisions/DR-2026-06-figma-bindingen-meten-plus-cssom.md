# DR-2026-06: Figma-bindingen uit een gemeten waarde plus een naam uit de CSSOM

**ID:** DR-2026-06
**Datum:** Augustus 2026
**Status:** Accepted
**Auteurs:** Jeffrey Lauwers

---

## Context

[DR-2026-05](DR-2026-05-figma-genereren-uit-code-via-plugin.md) zette twee dingen in Figma neer die niets van elkaar wisten: 1318 variables in drie collections, en component sets met vaste waarden. Een gegenereerde Button had een fill van `#1b59a4` in plaats van een verwijzing naar `dsn/Components → button/strong/background-color`. Schakelde je in Figma naar `start-dark`, dan bewoog de tokenbibliotheek mee en het component niet.

De Plugin API kan die koppeling wel leggen: `setBoundVariable(field, variable)` voor onder meer padding, cornerRadius, itemSpacing en fontSize, en `setBoundVariableForPaint(paint, 'color', variable)` voor fills en strokes. Het probleem zit een stap eerder. De generator meet de _uitgerekende_ waarde, en daar staat geen naam bij:

```
gemeten     rgb(27, 89, 164)
nodig       --dsn-button-strong-background-color
```

Die naam bestaat alleen in de authored CSS. En juist het lezen van authored CSS is in DR-2026-05 als optie afgeschoten, omdat cascade, custom properties, `clamp()` en media queries samen pas de eindwaarde bepalen.

---

## Opties overwogen

### Optie 1: Terugzoeken op waarde

Voor elk `--dsn-*` token de computed waarde opvragen en die vergelijken met de gemeten waarde van de property.

**Voordeel:** Geen CSS-parsing nodig; alles blijft gemeten.
**Nadeel:** Werkt niet. Tientallen tokens delen dezelfde waarde. `--dsn-button-strong-background-color` en `--dsn-link-color` zijn allebei `#1b59a4`, en er is niets dat de juiste aanwijst. Een gok die er 90% van de tijd naast zit op precies de plek waar een designer hem niet controleert.

### Optie 2: De tokennaam in de matrix opschrijven

Elke matrix een tabel meegeven van property naar token.

**Voordeel:** Expliciet en simpel.
**Nadeel:** Een tweede bron van waarheid naast de CSS, per component, per variant, per state. Bij Button alleen al 27 varianten × 13 eigenschappen. Dat loopt uit de pas met de CSS zodra iemand een modifier toevoegt, en dan wijst Figma stilzwijgend het verkeerde token aan.

### Optie 3: De naam uit de CSSOM lezen, de waarde blijven meten (gekozen)

De cascade in de browser naspelen om te bepalen wélke declaratie wint voor `background-color`, daar de `var()`-naam uit halen, en de gemeten waarde onaangeroerd laten.

**Voordeel:** Eén bron van waarheid (de CSS), en de naam volgt automatisch elke modifier, pseudo-state en media query.
**Nadeel:** Er wordt alsnog CSS gelezen, met een eigen specificiteitsberekening. Een fout daarin zou een verkeerd token aanwijzen.

---

## Beslissing

**De waarde blijft gemeten, de naam komt uit de CSSOM, en het token moet de gemeten waarde reproduceren voordat er gebonden wordt.**

Dat laatste is wat optie 3 draagbaar maakt. Het verschil met de afgeschoten CSS-parsing uit DR-2026-05 is niet de techniek maar de rol: de CSSOM vervangt de meting niet, hij geeft er een herkomst bij. En die herkomst wordt geverifieerd.

```
browser        winnende declaratie  ──►  var()-keten  ──►  --dsn-button-strong-background-color
variables.json                                             button/strong/background-color = rgb(27, 89, 164)
gemeten                                                    rgb(27, 89, 164)
                                                           └── gelijk? dan pas binden
```

Wijkt de waarde van het token af van wat er gemeten is, dan wordt er niet gebonden en komt de eigenschap in het report. Een misrekening in de specificiteit kan daardoor wel een binding _missen_, maar geen verkeerde binding _leggen_. Dat is de asymmetrie die deze keuze verantwoord maakt: het foutgeval is zichtbaar en conservatief.

Bijbehorende deelbesluiten:

**De keten wordt afgelopen tot het eerste token dat een Figma-variable is.** Component-CSS zet een waarde soms door via een lokale custom property (`--dsn-x-background-color: var(--dsn-x-strong-background-color)`). Alleen de laatste schakel bestaat als token; de tussenliggende zijn CSS-intern.

**Alleen een waarde die helemaal uit één `var()` bestaat wordt gebonden.** Een `calc(var(--a) + var(--b))` combineert twee tokens en heeft geen enkele variable die de waarde kan leveren. Dat hoort in het report, niet in een binding.

**De CSS-naam en de variable-naam zijn dezelfde tokennaam in een andere notatie**, dus er is geen extra mapping-bestand nodig:

| notatie | vorm                                       |
| ------- | ------------------------------------------ |
| path    | `dsn . button . strong . background-color` |
| CSS     | `--dsn-button-strong-background-color`     |
| Figma   | `button/strong/background-color`           |

`variables.json` blijft wel de lijst: alleen tokens die het tot een variable geschopt hebben mogen gebonden worden. Wat daar is afgevallen (box shadows, transitions) houdt een vaste waarde.

**Een transparante kleur wordt net zo goed gebonden.** `dsn.color.transparent` is een token als elk ander; een laag die in Figma `button/subtle/background-color` toont laat zien wélk token de achtergrond stuurt, terwijl een weggelaten Fill die relatie onzichtbaar maakt. De plugin maakt de paint dan aan en de variable bepaalt kleur én alpha. Voor strokes gaat dat bewust niet op: een frame zonder rand heeft in Figma wel een standaard `strokeWeight`, dus een aangemaakte stroke zou een lijn tekenen die de CSS niet heeft.

**De plugin weigert componenten te importeren in een bestand zonder de benodigde variables.** Doorgaan zou een component set opleveren die er goed uitziet maar de theme-schakelaar niet volgt: precies het probleem dat deze import moet oplossen, en niet iets wat je aan een laag ziet.

---

## Impact

| Waar                               | Wat                                                                      |
| ---------------------------------- | ------------------------------------------------------------------------ |
| `figma-sync/src/browser-tokens.js` | Speelt de cascade na in de browser en levert de var()-keten per property |
| `figma-sync/src/variable-index.js` | CSS-naam naar variable, plus de waarde in de gemeten mode                |
| `figma-sync/src/bindings.js`       | Kiest het Figma-veld, verifieert de waarde, houdt het report bij         |
| `figma-plugin/src/components.js`   | Legt de bindingen, weigert bij ontbrekende variables                     |

Omvang bij invoering: 683 bindingen over vijf componenten, met 9 eigenschappen die een vaste waarde houden en verantwoord worden in het report.

---

## Gevolgen

**Wat makkelijker wordt:**

- Een theme- of mode-wissel in Figma verandert het uiterlijk van de gegenereerde componenten, zonder dat er iets opnieuw gebonden hoeft te worden
- Wat niet te binden is staat per component in `dist/{component}.json` onder `bindings.unbound`, met reden en aantal

**Wat moeilijker wordt:**

- De generator leest nu CSS, en dus staat er een specificiteitsberekening in de repo die de browser eigenlijk beter weet. `:is()` en `:has()` worden benaderd in plaats van exact berekend; ze komen in dit design system niet voor
- Een shorthand met meerdere `var()`'s (`border: var(--w) solid var(--c)`) wordt op vorm en naam uit elkaar gehaald. Het type van de variable moet daarna bij het veld passen, anders volgt er geen binding

**Nieuwe verplichting voor contributors:**

- Verandert er iets aan de manier waarop een component zijn tokens declareert, draai dan `pnpm build:figma-components` en lees het bindingsreport. Een eigenschap die van gebonden naar vast schuift is een regressie, ook als de build groen is.

---

## Supersedes / superseded by

Geen. Dit record vult DR-2026-05 aan: het nuanceert de daar afgeschoten optie "CSS parsen" tot "CSS lezen voor de naam, blijven meten voor de waarde".

---

## Gerelateerde records

- [DR-2026-05](DR-2026-05-figma-genereren-uit-code-via-plugin.md): het generatiepad waar dit record op voortbouwt
- [DR-2026-02](DR-2026-02-twee-lagenpatroon-html-css-plus-react.md): de HTML/CSS-laag is de bron waaruit zowel de waarde als de naam komt

---

## Review trigger

Herzie dit record wanneer:

- Figma een API krijgt om een laag op tokennaam te binden zonder dat wij de cascade hoeven na te spelen
- Het design system `:is()`, `:has()` of `@layer` gaat gebruiken; dan is de benadering in de specificiteitsberekening niet langer goed genoeg
- Het bindingsreport structureel groeit: dat is het signaal dat de CSS tokens op een manier gebruikt die deze route niet ziet
