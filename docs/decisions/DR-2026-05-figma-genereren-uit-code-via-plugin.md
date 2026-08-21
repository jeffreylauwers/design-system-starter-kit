# DR-2026-05: Figma-library genereren uit code, geschreven via een plugin

**ID:** DR-2026-05
**Datum:** Augustus 2026
**Status:** Accepted
**Auteurs:** Jeffrey Lauwers

---

## Context

Het design system bestaat in code: tokens, componenten, patronen en templates, allemaal zichtbaar in Storybook. Designers werken in Figma, waar diezelfde tokens en componenten niet bestaan. Elke wijziging in code moet nu met de hand in Figma worden nagevoerd, of andersom, en dat loopt onvermijdelijk uit de pas.

De vraag was hoe we tokens en componenten vanuit code naar Figma krijgen, en of een weg terug haalbaar is.

Twee harde platformgrenzen bepalen het antwoord meer dan onze voorkeuren. Op ons **Figma Professional-plan** is de **Variables REST API niet beschikbaar** (Enterprise-only, ook voor lezen) en is **Code Connect niet beschikbaar** (Organization/Enterprise). De Plugin API kent die beperkingen niet en werkt op elk plan.

---

## Opties overwogen

### Optie 1: De Figma-library met de hand bouwen, alleen tokens automatiseren

Een designer bouwt de componenten in Figma; alleen de variables worden gegenereerd.

**Voordeel:** Beste visuele kwaliteit. Een Figma-component is auto layout, variant-matrices en component properties, en dat is ontwerpwerk.
**Nadeel:** 50+ componenten handwerk, en elke wijziging in code moet opnieuw met de hand worden nagevoerd. Precies het probleem dat we wilden oplossen.

### Optie 2: Componenten genereren door de CSS te parsen

**Voordeel:** Geen browser nodig.
**Nadeel:** Werkt niet. Cascade, custom properties, `clamp()` en media queries bepalen samen pas de eindwaarde; die is uit de CSS-bron niet af te leiden.

### Optie 3: Componenten genereren uit de _computed_ DOM, schrijven via een plugin (gekozen)

Elke variant wordt headless gerenderd, waarna `getComputedStyle` en `getBoundingClientRect` de werkelijke waarden opleveren. Het resultaat is JSON in de repo; een Figma-plugin leest die JSON en bouwt de nodes.

**Voordeel:** Flexbox mapt vrijwel 1-op-1 op Figma auto layout, dus je krijgt componenten die meeschalen in plaats van een dood, absoluut gepositioneerd blok. Alles wat naar Figma gaat staat als JSON in de repo en is dus reviewbaar in een PR. Geen token nodig: een plugin draait in Figma Desktop.
**Nadeel:** Levert ongeveer 85%. Component properties (icon-slots, instance swap, text) en thumbnails blijven handwerk.

### Optie 4: Een third-party MCP of CLI als schrijfpad

Onderzocht: figma-console-mcp (Southleft) en silships/figma-cli.

**Nadeel:** figma-console-mcp draait willekeurige Plugin API-code via een bridge-plugin; bruikbaar om te prototypen, maar niet als vaste infrastructuur. silships/figma-cli patcht de Figma Desktop-app, wat bij elke update breekt. De officiële Figma MCP is nuttig als assistent maar niet-deterministisch, en dus ongeschikt voor een build-pipeline.

---

## Beslissing

**Genereren in de repo, schrijven via een eigen Figma-plugin. Code is de bron van waarheid voor tokens en componentgedrag; Figma is de bron voor visuele compositie.**

```
tokens + HTML/CSS  ──►  JSON in de repo  ──►  Figma-plugin  ──►  Figma
     (bron)              (reviewbaar)          (geen token)
```

Bijbehorende deelbesluiten:

**Tokens worden drie collections**, één per as, niet acht losse builds. `dsn/Primitives` (4 modes: theme × light/dark), `dsn/Density` (3 modes) en `dsn/Components` (1 mode). Component-tokens worden waar mogelijk een **alias** naar de primitives, zodat de theme-schakelaar in Figma automatisch doorwerkt, net als de delegatieketen in de token-JSON.

**Fluid typografie krijgt een mode per viewport, geen aparte min/max-tokennamen.** Een Figma-variable is statisch, dus `clamp()` moet op een breedte worden vastgeprikt. Aparte namen zouden betekenen dat 37 component-tokens in 26 bestanden mee moeten splitsen; met modes blijven de aliassen ongewijzigd werken.

**Er wordt mobile-first gemeten**, op een viewport van 375px met blok-componenten van 343px. Op 375px lossen alle clamps op hun ondergrens op, dus de gemeten typografie komt exact overeen met de `default-mobile` mode.

**De weg terug is alleen voor tokens, en alleen als voorstel.** Een export van Figma-variables naar DTCG die een PR opent, nooit een automatische tweerichtingssync: die heeft geen merge-semantiek. Voor componenten is er geen weg terug.

**De Figma-build staat los van de tokenbuild.** De token-CSS is het hoofdproduct waar Storybook, de componenten en npm-consumenten van afhangen, en die hoort niet om te vallen door een generator die er alleen maar naast draait.

---

## Impact

Drie packages:

| Package         | Rol                                                |
| --------------- | -------------------------------------------------- |
| `design-tokens` | `build:figma` schrijft `dist/figma/variables.json` |
| `figma-sync`    | Rendert componenten headless, schrijft node specs  |
| `figma-plugin`  | Leest die JSON en schrijft naar Figma              |

Operationele details staan in de README's van `figma-sync` en `figma-plugin`.

Omvang bij invoering: 1308 variables waarvan 783 aliassen, en vijf componenten (Button, Alert, Card, Checkbox, Radio) met 54 varianten.

---

## Gevolgen

**Wat makkelijker wordt:**

- Een tokenwijziging in code landt met één commando in Figma
- Wat níet naar Figma te vertalen is wordt zichtbaar gemaakt in een report in plaats van stil af te wijken
- Het report legt drift bloot: tokens die in het ene theme wel en in het andere niet bestaan vallen nu op

**Wat moeilijker wordt:**

- Component sets worden bij elke import opnieuw aangemaakt; bestaande instanties koppelen daar niet vanzelf aan
- Zonder Code Connect is de koppeling tussen Figma-component en code-component alleen conventie (naamgeving, een link in de componentbeschrijving)

**Nieuwe verplichting voor contributors:**

- Een nieuw component dat ook in Figma moet landen heeft een matrix in `figma-sync/src/matrices/` nodig, met de variant-assen expliciet. Storybook-stories zijn losse voorbeelden en geen volledige matrix.
- Draai `pnpm test:figma-plugin` voordat je iets in Figma laadt. Die smoke test mockt de Plugin API en dwingt de volgorde-eisen af die in Figma echt fouten geven.

---

## Supersedes / superseded by

Geen.

---

## Gerelateerde records

- [DR-2026-02](DR-2026-02-twee-lagenpatroon-html-css-plus-react.md): de HTML/CSS-laag is de bron waaruit de generator meet
- [DR-2026-03](DR-2026-03-breakpoints-als-reference-only-tokens.md): breakpoints zijn reference-only en worden daarom niet naar Figma-variables gemapt

---

## Review trigger

Herzie dit record wanneer:

- We naar een Organization- of Enterprise-plan gaan. Dan komen Code Connect en (op Enterprise) de Variables REST API beschikbaar, en verandert zowel het schrijfpad als de koppeling tussen design en code.
- Figma de Plugin API voor variables of grid-layout ingrijpend wijzigt.
- Blijkt dat de gegenereerde componenten in de praktijk toch te veel handwerk vragen; dan is optie 1 (met de hand bouwen, alleen tokens automatiseren) alsnog de betere keuze.
