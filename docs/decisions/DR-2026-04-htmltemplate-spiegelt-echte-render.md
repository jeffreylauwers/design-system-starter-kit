# DR-2026-04: htmlTemplate spiegelt de echte component-render

**ID:** DR-2026-04
**Datum:** Juli 2026
**Status:** Accepted
**Auteurs:** Jeffrey Lauwers

---

## Context

Elke Storybook docs-pagina toont onder de preview een twee-tabs codeblok (`CodeTabs`): een React-tab en een HTML/CSS-tab. De HTML/CSS-tab wordt gegenereerd door een `htmlTemplate(args)`-functie in `parameters.dsn` van het stories-bestand. Deze templates werden met de hand geschreven en dreven in de loop van de tijd af van de werkelijke component-markup: Alert en Note toonden een `<strong>` waar de component een `<h2>`/`<h3>` rendert, er stonden niet-bestaande klassen in (`dsn-button--size-medium`, `dsn-heading--level-1`) en zes componenten hadden helemaal geen template, waardoor hun codeblok statisch bleef als een gebruiker props wijzigde via Controls.

Voor een design system met een twee-lagenpatroon (DR-2026-02) is de HTML/CSS-tab de primaire documentatie van de HTML/CSS-laag. Een codeblok dat afwijkt van wat de component werkelijk rendert, leidt tot foutieve eigen implementaties bij consumenten.

---

## Opties overwogen

### Optie 1: HTML automatisch genereren uit de live render

De HTML/CSS-tab zou de daadwerkelijke DOM van de preview kunnen serialiseren.

**Voordeel:** Kan nooit afwijken van de werkelijkheid.
**Nadeel:** Toont React-implementatiedetails die in een HTML-voorbeeld niet thuishoren (`useId`-waarden zoals `:R2:`, ontbrekende `onclick`-gedrag omdat React events niet in de DOM zichtbaar zijn) en volledige inline SVG-paden die het voorbeeld onleesbaar maken. Het voorbeeld is dan correct maar onbruikbaar als documentatie.

### Optie 2: Handgeschreven templates die de render spiegelen, met expliciete bewuste afwijkingen (gekozen)

`htmlTemplate(args)` blijft handgeschreven, maar moet structureel exact overeenkomen met de echte render (elementen, klassen, attributen) en de story-args volgen zodat het codeblok live meebeweegt met Controls. Een beperkte, gedocumenteerde lijst afwijkingen is toegestaan.

**Voordeel:** Leesbare, didactisch correcte HTML-voorbeelden die kloppen met de werkelijkheid.
**Nadeel:** Vereist discipline: elke markup-wijziging in een component moet ook in de template landen.

---

## Beslissing

**Elke `htmlTemplate` spiegelt de daadwerkelijke component-render en volgt de story-args. Elk component met een docs-pagina én een HTML/CSS-laag heeft een `htmlTemplate` (geen statische fallback). Zie het amendement hieronder voor componenten zonder HTML/CSS-laag.**

De toegestane, bewuste afwijkingen van de letterlijke render zijn:

1. **Statische id's in plaats van React `useId`-waarden**: `id="dialog-title"` in plaats van `:R2:`. De koppeling (`aria-labelledby` ↔ `id`) moet binnen het voorbeeld kloppen.
2. **SVG-inhoud als comment**: `<svg class="dsn-icon" aria-hidden="true"><!-- icoon-naam --></svg>` in plaats van de volledige path-data. Het svg-element zelf, inclusief klassen zoals `dsn-icon--xl`, staat wél in het voorbeeld.
3. **Didactische interactie-attributen voor de HTML/CSS-laag**: `onclick="this.closest('dialog').close()"`, `popovertarget`, `aria-expanded` mogen in het voorbeeld staan waar de React-laag dit via props/refs regelt.
4. **Story-scaffolding blijft buiten het codeblok**: wrappers, paddings en gesimuleerde paginacontext uit de Default story horen niet in het voorbeeld; alleen de component-markup zelf.

Verificatie gebeurt door de `htmlTemplate`-output te vergelijken met `renderToStaticMarkup` van de component met dezelfde args (zoals uitgevoerd in PR #310, waar 28 afwijkende templates zijn gecorrigeerd en 6 ontbrekende zijn toegevoegd).

---

## Amendement (augustus 2026): geen tab zonder HTML/CSS-laag

Het oorspronkelijke besluit ging ervan uit dat elk component een HTML/CSS-laag heeft. Dat klopt niet: DR-2026-02 legt 19 React-only formuliercontrols vast. Voor 14 daarvan verwees de `htmlTemplate` naar klassen (`dsn-checkbox`, `dsn-radio`, `dsn-select`, `dsn-option-label` en verwanten) die nergens in `components-html` gedefinieerd zijn. De HTML/CSS-tab documenteerde daardoor markup die ongestyled rendert zodra iemand hem kopieert (issue #320).

**Aanvulling op het besluit:** een component krijgt alleen een `htmlTemplate` en een HTML/CSS-tab wanneer de voorbeeldmarkup daadwerkelijk door CSS in `components-html` wordt gestyled. Ontbreekt die CSS, dan vervalt de `htmlTemplate` én de `html`-prop op `CodeTabs`, en toont de docs-pagina alleen het React-codeblok zonder tabbalk.

De toets is "bestaat de CSS in `components-html`?", niet "staat er `react` in het manifest?". Dat onderscheid doet ertoe: `EmailInput`, `PasswordInput`, `NumberInput` en `TelephoneInput` zijn React-only, maar renderen `dsn-text-input`, waarvan de CSS wél in `components-html` staat. Hun tab blijft dus bestaan en blijft correct.

Als de 14 controls alsnog een HTML/CSS-laag krijgen, vervalt dit amendement voor die componenten en horen hun templates terug te komen.

---

## Impact

| Dimension                     | Meting                                                                                                   |
| ----------------------------- | -------------------------------------------------------------------------------------------------------- |
| Bestanden geraakt             | Alle `*.stories.tsx` in `packages/storybook/src/` (35 bestanden gecorrigeerd in PR #310)                 |
| Componenten geraakt           | Alle 70+ componenten met een docs-pagina                                                                 |
| Breaking changes              | Nee: alleen documentatie-output                                                                          |
| Alternatief dat verwijderd is | Statische `html`-fallback als enige bron voor het HTML/CSS-tabblad; templates die afwijken van de render |

---

## Gevolgen

**Wat makkelijker wordt:**

- Consumenten van de HTML/CSS-laag kunnen codeblokken letterlijk kopiëren zonder verrassingen.
- Props wijzigen via Controls toont direct het effect op de markup: het codeblok is een levend voorbeeld.
- Afwijkingen zijn machinaal detecteerbaar (template vs `renderToStaticMarkup` vergelijken).

**Wat moeilijker wordt:**

- Elke markup-wijziging in een component (nieuw element, klasse, attribuut) vereist een bijbehorende update van de `htmlTemplate` in het stories-bestand. Dit sluit aan op de bestaande verificatie-grep-werkwijze na markup-wijzigingen.

**Nieuwe verplichting voor contributors:**
Bij een nieuw component hoort een `htmlTemplate` die de render spiegelt en args volgt. Bij een markup-wijziging hoort een template-update in dezelfde PR.

---

## Supersedes / superseded by

Niet van toepassing: dit is een initieel besluit over de codeblok-conventie.

---

## Gerelateerde records

- DR-2026-02 (twee-lagenpatroon): de HTML/CSS-tab documenteert de HTML/CSS-laag; deze conventie houdt die documentatie betrouwbaar. De 19 React-only componenten uit dat besluit zijn de aanleiding voor het amendement hierboven
- Issue [#320](https://github.com/jeffreylauwers/design-system-starter-kit/issues/320): de misleidende HTML/CSS-tab bij React-only formuliercontrols
- Zie ook: PR [#310](https://github.com/jeffreylauwers/design-system-starter-kit/pull/310)

---

## Review trigger

Herzie dit besluit als Storybook een betrouwbare ingebouwde HTML-serialisatie introduceert die leesbare voorbeelden oplevert (zonder React-implementatiedetails), of als het aantal componenten het handmatig onderhouden van templates onwerkbaar maakt.
