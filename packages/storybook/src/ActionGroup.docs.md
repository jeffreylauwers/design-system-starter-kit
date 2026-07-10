# ActionGroup

Groepeert gerelateerde acties en verzorgt de lay-out van Buttons en Links.

## Doel

ActionGroup is een lay-outprimitief voor het groeperen van één of meer gerelateerde acties. De groep regelt de onderlinge spacing en richting: horizontaal met automatisch wrappen (default) of verticaal als kolom. De ActionGroup bevat directe children: `Button`- en/of `Link`-componenten.

<!-- VOORBEELD -->

## Use when

- Primaire en secundaire actie naast elkaar in een formulier (bijv. "Opslaan" + "Annuleren").
- Navigatieacties onderaan een wizardstap.
- Combinatie van een button en een link als zachte uitweg (GOV.UK patroon).
- Meerdere gerelateerde acties die automatisch moeten wrappen bij smalle viewports.

## Don't use when

- Acties geen directe relatie met elkaar hebben: gebruik dan losse Buttons.
- Navigatie-items in een menu of navbar: gebruik andere navigatiepatronen.
- Er slechts één actie is die niet in een groepscontext staat: een losse Button volstaat.

## Best practices

### Volgorde van acties

- Plaats de primaire actie altijd als eerste child: dit bepaalt zowel de visuele volgorde als de lees- en tabvolgorde.
- De secundaire actie (bijv. "Annuleren") volgt na de primaire actie.

### Richting

- Gebruik `direction="horizontal"` (default) voor de meeste use cases: de items wrappen automatisch bij te weinig ruimte.
- Gebruik `direction="vertical"` wanneer de acties beter als kolom gepresenteerd worden (bijv. mobiele formulieren of stacked layouts).

### Button als uitweg met Link

- Combineer een `Button` met een `Link` voor het GOV.UK-patroon: de primaire actie is de button, de `Link` biedt een zachte uitweg (bijv. "Terug naar overzicht").
- De `Link` wordt automatisch verticaal gecentreerd naast de button via `align-items: center`.

### Aria-label

- ActionGroup krijgt standaard `aria-label="Acties"` mee, zodat screenreaders altijd een zinnige groepsnaam en het aantal acties aankondigen, ook als je zelf niets instelt.
- Geef in specifiekere contexten een preciezer label mee, bijvoorbeeld `aria-label="Formulierknoppen"` in een formulier of `aria-label="Dialoogacties"` in een modal.

```tsx
<ActionGroup aria-label="Formulierknoppen">
  <Button variant="strong" type="submit">
    Verstuur
  </Button>
  <Button variant="subtle">Annuleren</Button>
</ActionGroup>
```

## Design tokens

| Token                           | Beschrijving                                                   |
| ------------------------------- | -------------------------------------------------------------- |
| `--dsn-action-group-column-gap` | Horizontale ruimte tussen acties in horizontale richting       |
| `--dsn-action-group-row-gap`    | Verticale ruimte tussen gewrapte rijen in horizontale richting |

## Accessibility

- ActionGroup rendert als `<ul aria-label="...">` met elke actie in een eigen `<li>`. Screenreaders kondigen zo het aantal acties én de groepsnaam aan wanneer de groep focus krijgt.
- `role="group"` is bewust niet gekozen: in VoiceOver en NVDA geeft dit inconsistent gedrag, waarbij de toegankelijke naam van de eerste knop soms wordt overgeslagen. Een `<ul>` met `aria-label` is de robuustere ARIA-oplossing en voorkomt dit.
- Geef via `aria-label` altijd een groepsnaam mee die past bij de context; zonder eigen keuze valt ActionGroup terug op `"Acties"`.
- De volgorde van children bepaalt de lees- en tabvolgorde: primaire actie altijd als eerste child.
- Icon-only Buttons in een ActionGroup hebben hun label verborgen via `dsn-button__label` + `dsn-button--icon-only`: de ActionGroup zelf hoeft hier niets voor te doen.

### Focusvolgorde bij verschillende schermweergaves

De tabvolgorde van Buttons en Links in een ActionGroup moet altijd overeenkomen met de visuele volgorde, ongeacht de breedte of weergave van het scherm. ActionGroup gebruikt `flex-wrap` om acties automatisch te laten wrappen bij smalle viewports, maar wijzigt daarbij nooit de DOM-volgorde: de tabvolgorde blijft dus gelijk aan de volgorde van de children, op elke breakpoint.

- Gebruik de CSS property `order` niet op children van ActionGroup: dit ontkoppelt de visuele volgorde van de DOM-volgorde en daarmee ook van de tabvolgorde.
- Controleer bij een nieuwe of aangepaste ActionGroup met het toetsenbord (Tab) of de focusvolgorde overeenkomt met de visuele volgorde, op elke schermweergave (mobiel/tablet/desktop).
- Gerelateerd WCAG-succescriterium: [2.4.3 Focus Order (Level A)](https://www.w3.org/WAI/WCAG22/quickref/#focus-order)
