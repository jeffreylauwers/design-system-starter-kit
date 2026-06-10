# DR-2026-01: Gebruik dsn-button\_\_label span in plaats van aria-label

**ID:** DR-2026-01
**Datum:** Januari 2026
**Status:** Accepted
**Auteurs:** Jeffrey Lauwers

---

## Context

Icon-only buttons hebben een toegankelijke naam nodig zodat screenreadergebruikers begrijpen wat de knop doet. De meest gebruikte aanpak is `aria-label="Sluiten"` direct op het `<button>` element. Dit is eenvoudig, breed ondersteund en staat in veel tutorials als de aanbevolen oplossing.

Er is echter een fundamenteel probleem: `aria-label` wordt **niet vertaald** door browser-vertaaltools zoals Google Translate, Microsoft Translator of ingebouwde mobiele vertalers. Een gebruiker die de interface in het Frans leest, ziet knoppen waarvan de zichtbare tekst is vertaald maar de toegankelijke naam Nederlandstalig blijft — een inconsistentie die screenreadergebruikers in vertaalde contexten discrimineert.

De design system componenten worden gebruikt in publieke Nederlandse overheidsinterfaces die verplicht internationaal toegankelijk moeten zijn.

---

## Opties overwogen

### Optie 1: `aria-label` op het button-element

```html
<button aria-label="Sluiten">
  <svg aria-hidden="true">...</svg>
</button>
```

**Voordeel:** Eenvoudig, geen extra markup, breed gedocumenteerd.
**Nadeel:** Wordt niet vertaald door browsertranslators. Screenreadergebruikers in vertaalde interfaces horen de originele taal, niet de vertaalde taal. Dit is een bekende WCAG-fout bij gebruik van machinevertaling (Success Criterion 3.1.2 Language of Parts).

### Optie 2: `aria-labelledby` met verborgen span

```html
<span id="btn-label" hidden>Sluiten</span>
<button aria-labelledby="btn-label">
  <svg aria-hidden="true">...</svg>
</button>
```

**Voordeel:** Tekst is vertaalbaar.
**Nadeel:** Vereist unieke IDs per instantie, wat in React `useId()` vereist en in plain HTML handmatig beheer. Markup is verspreid over het DOM. Moeilijk schaalbaar bij herhaalde instanties.

### Optie 3: Visueel verborgen span inside de button (gekozen)

```html
<button class="dsn-button dsn-button--icon-only">
  <svg class="dsn-icon" aria-hidden="true">...</svg>
  <span class="dsn-button__label">Sluiten</span>
</button>
```

De `.dsn-button--icon-only` modifier past clip-path/overflow-hidden toe op de `__label` span zodat hij visueel verdwijnt maar in de accessibility tree aanwezig blijft.

**Voordeel:** Tekst zit als zichtbare DOM-node in de button — vertaaltools vinden en vertalen hem. Geen extra IDs nodig. De label is altijd aanwezig bij de knop.
**Nadeel:** Licht meer markup dan `aria-label`. Vereist dat ontwikkelaars de span niet vergeten en er geen verkorte `aria-label` naast zetten.

---

## Beslissing

**Alle buttons in het design system gebruiken altijd een `dsn-button__label` span. `aria-label` op een button-element is verboden.**

De reden is vertaalbaarheid: een `<span>` is een DOM-tekst-node die browser-vertaaltools oppikken. `aria-label` is een attribuutwaarde die buiten de vertaalketen valt. Voor een systeem dat vertaalbare interfaces ondersteunt, is de span de enige correcte aanpak.

De trade-off die we accepteren: iets meer markup en de vereiste dat elke button-implementatie — inclusief die van contributors — de span bevat. Dit wordt gehandhaafd via CLAUDE.md (regel 1), code review en componenttests.

---

## Impact

| Dimension                     | Meting                                                                                                                               |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Bestanden geraakt             | Alle button-achtige componenten: `button.css`, `Button.tsx`, `ButtonLink.tsx`, `LinkButton.tsx`, `menu-button.css`, `MenuButton.tsx` |
| Componenten geraakt           | 4 directe (Button, ButtonLink, LinkButton, MenuButton), indirect alle composites die een button bevatten                             |
| Breaking changes              | Nee — de span was al aanwezig bij introductie van het systeem                                                                        |
| Alternatief dat verwijderd is | `aria-label` op button-elementen — mag niet voorkomen in nieuwe of bijgewerkte componenten                                           |

---

## Gevolgen

**Wat makkelijker wordt:**

- Interfaces zijn correct vertaalbaar zonder extra werk van productteams.
- Er is één consistente aanpak voor accessible naming van buttons in het hele systeem.
- De label-tekst is altijd zichtbaar in de DOM voor debugging en testtools.

**Wat moeilijker wordt:**

- Contributors die gewend zijn aan `aria-label` zullen de regel moeten leren. Dit is documenteerbaar maar vraagt expliciete communicatie bij onboarding.
- Icon-only buttons met rijcontext (bijv. "Verwijder voor product: Laptop Pro") vereisen een geneste `dsn-visually-hidden` span inside de `__label`, wat iets meer markup is dan een enkel `aria-label`.

**Nieuwe verplichting voor contributors:**
Elk icon-only button-patroon in een PR dat `aria-label` gebruikt in plaats van `dsn-button__label` wordt geblokkeerd bij code review. De CLAUDE.md-sessieregel ("NOOIT aria-label") handhaaft dit automatisch bij AI-geassisteerde implementaties.

---

## Supersedes / superseded by

Niet van toepassing — dit is een initieel besluit.

---

## Gerelateerde records

- DR-2026-02 (twee-lagenpatroon) — de span-aanpak werkt in beide lagen identiek
- Zie ook: CLAUDE.md §1 "Button accessible naming: NOOIT aria-label"

---

## Review trigger

Herzie dit besluit als de CSS-specificatie `aria-label`-vertaling introduceert (momenteel niet gepland) of als WCAG een nieuwe SC introduceert die dit patroon wijzigt.
