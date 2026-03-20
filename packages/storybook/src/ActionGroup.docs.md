# ActionGroup

Groepeert gerelateerde acties en verzorgt de lay-out van Buttons en Links.

## Doel

ActionGroup is een lay-outprimitief voor het groeperen van één of meer gerelateerde acties. De groep regelt de onderlinge spacing en richting — horizontaal met automatisch wrappen (default) of verticaal als kolom. De ActionGroup bevat directe children: `Button`- en/of `Link`-componenten.

<!-- VOORBEELD -->

## Use when

- Primaire en secundaire actie naast elkaar in een formulier (bijv. "Opslaan" + "Annuleren").
- Navigatieacties onderaan een wizardstap.
- Combinatie van een button en een link als zachte uitweg (GOV.UK patroon).
- Meerdere gerelateerde acties die automatisch moeten wrappen bij smalle viewports.

## Don't use when

- Acties geen directe relatie met elkaar hebben — gebruik dan losse Buttons.
- Navigatie-items in een menu of navbar — gebruik andere navigatiepatronen.
- Er slechts één actie is die niet in een groepscontext staat — een losse Button volstaat.

## Best practices

### Volgorde van acties

- Plaats de primaire actie altijd als eerste child — dit bepaalt zowel de visuele volgorde als de lees- en tabvolgorde.
- De secundaire actie (bijv. "Annuleren") volgt na de primaire actie.

### Richting

- Gebruik `direction="horizontal"` (default) voor de meeste use cases — de items wrappen automatisch bij te weinig ruimte.
- Gebruik `direction="vertical"` wanneer de acties beter als kolom gepresenteerd worden (bijv. mobiele formulieren of stacked layouts).

### Button als uitweg met Link

- Combineer een `Button` met een `Link` voor het GOV.UK-patroon: de primaire actie is de button, de `Link` biedt een zachte uitweg (bijv. "Terug naar overzicht").
- De `Link` wordt automatisch verticaal gecentreerd naast de button via `align-items: center`.

## Design tokens

| Token                           | Beschrijving                                                   |
| ------------------------------- | -------------------------------------------------------------- |
| `--dsn-action-group-column-gap` | Horizontale ruimte tussen acties in horizontale richting       |
| `--dsn-action-group-row-gap`    | Verticale ruimte tussen gewrapte rijen in horizontale richting |

## Accessibility

- ActionGroup heeft geen eigen ARIA-rol — de groepering is puur lay-out, geen semantische eenheid.
- De volgorde van children bepaalt de lees- en tabvolgorde — primaire actie altijd als eerste child.
- Icon-only Buttons in een ActionGroup hebben hun label verborgen via `dsn-button__label` + `dsn-button--icon-only` — de ActionGroup zelf hoeft hier niets voor te doen.
- Gebruik nooit `role="group"` of `aria-label` op de ActionGroup — dit voegt geen waarde toe voor screenreaders.
