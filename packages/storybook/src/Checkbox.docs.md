# Checkbox

Een vierkant invoerelement voor het selecteren van één of meerdere opties (zonder label).

## Doel

De Checkbox component is een standalone checkbox zonder label - alleen het vierkantje met vinkje. Gebruik deze component wanneer je volledige controle wilt over de layout, of gebruik CheckboxOption voor een checkbox met geïntegreerd label. De component ondersteunt drie states: unchecked, checked, en indeterminate (voor "select all" scenarios). Het vinkje wordt weergegeven met het check.svg icoon, en de indeterminate state toont een minus icoon. Alle interactive states (hover, focus, active) zijn geïmplementeerd met design tokens.

<!-- VOORBEELD -->

## Use when

- Je een checkbox nodig hebt zonder label (voor custom layouts).
- Je volledige controle wilt over de positioning van label en checkbox.
- Je een "select all" checkbox implementeert (gebruik `indeterminate` state).
- Je checkboxes in een tabel of grid wilt plaatsen.

## Don't use when

- Je een checkbox met label nodig hebt — gebruik dan [CheckboxOption](/docs/components-checkboxoption--docs).
- Je een groep gerelateerde checkboxes hebt — gebruik dan [CheckboxGroup](/docs/components-checkboxgroup--docs).
- Je een ja/nee keuze hebt — overweeg een toggle/switch (indien beschikbaar in je design system).
- Je een enkele optie uit meerdere wilt selecteren — gebruik dan [Radio](/docs/components-radio--docs).

## Best practices

- **Gebruik altijd een label.** Zelfs als de Checkbox component zelf geen label heeft, moet er altijd een zichtbaar of toegankelijk label zijn. Gebruik `aria-label` of koppel aan een `<label>` element met `htmlFor`.
- **Indeterminate voor "select all".** Gebruik de `indeterminate` state voor "select all" checkboxes wanneer sommige (maar niet alle) child items geselecteerd zijn.
- **Groepeer gerelateerde checkboxes.** Gebruik CheckboxGroup of een `<fieldset>` om gerelateerde checkboxes te groeperen.
- **Gebruik `invalid` voor validatie.** Toon de invalid state alleen na gebruikersinteractie of form submit, niet standaard.
- **Test keyboard navigatie.** Checkboxes moeten focusbaar zijn met Tab en toggle-baar met Space.

## Design tokens

| Token                                      | Beschrijving                                             |
| ------------------------------------------ | -------------------------------------------------------- |
| `--dsn-checkbox-background-color`          | Achtergrondkleur default state                           |
| `--dsn-checkbox-border-color`              | Border kleur default state                               |
| `--dsn-checkbox-border-radius`             | Hoekafronding (0px - vierkant)                           |
| `--dsn-checkbox-border-width`              | Border dikte default state                               |
| `--dsn-checkbox-size`                      | Grootte van de checkbox (fluid, gekoppeld aan text size) |
| `--dsn-checkbox-active-background-color`   | Achtergrondkleur active state                            |
| `--dsn-checkbox-active-border-color`       | Border kleur active state                                |
| `--dsn-checkbox-active-border-width`       | Border dikte active state                                |
| `--dsn-checkbox-checked-background-color`  | Achtergrondkleur checked state (accent)                  |
| `--dsn-checkbox-checked-border-color`      | Border kleur checked state (transparent)                 |
| `--dsn-checkbox-checked-border-width`      | Border dikte checked state                               |
| `--dsn-checkbox-checked-color`             | Icoon kleur checked state (wit)                          |
| `--dsn-checkbox-disabled-background-color` | Achtergrondkleur disabled state                          |
| `--dsn-checkbox-disabled-border-color`     | Border kleur disabled state                              |
| `--dsn-checkbox-focus-background-color`    | Achtergrondkleur focus state                             |
| `--dsn-checkbox-focus-border-color`        | Border kleur focus state                                 |
| `--dsn-checkbox-focus-border-width`        | Border dikte focus state                                 |
| `--dsn-checkbox-hover-background-color`    | Achtergrondkleur hover state                             |
| `--dsn-checkbox-hover-border-color`        | Border kleur hover state                                 |
| `--dsn-checkbox-hover-border-width`        | Border dikte hover state                                 |
| `--dsn-checkbox-invalid-background-color`  | Achtergrondkleur invalid state                           |
| `--dsn-checkbox-invalid-border-color`      | Border kleur invalid state                               |
| `--dsn-checkbox-invalid-border-width`      | Border dikte invalid state                               |
| `--dsn-checkbox-checked-active-*`          | Checked + active combinatie                              |
| `--dsn-checkbox-checked-disabled-*`        | Checked + disabled combinatie                            |
| `--dsn-checkbox-checked-focus-*`           | Checked + focus combinatie                               |
| `--dsn-checkbox-checked-hover-*`           | Checked + hover combinatie                               |
| `--dsn-checkbox-indeterminate-*`           | Indeterminate state (alle combinaties)                   |
| `--dsn-checkbox-indeterminate-disabled-*`  | Indeterminate + disabled combinatie                      |
| `--dsn-checkbox-icon-size`                 | Grootte van het check icoon (67% van checkbox size)      |

## Accessibility

- De component gebruikt een native `<input type="checkbox">` voor volledige toegankelijkheid.
- Checkboxes zonder zichtbaar label hebben een `aria-label` nodig.
- De indeterminate state wordt correct aangekondigd door screenreaders.
- Focus states zijn duidelijk zichtbaar met outline.
- Invalid state wordt gecommuniceerd via `aria-invalid="true"`.
- Checkboxes zijn keyboard toegankelijk: Tab (focus), Space (toggle).
