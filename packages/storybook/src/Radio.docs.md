# Radio

Een rond invoerelement voor het selecteren van één optie uit meerdere (zonder label).

## Doel

De Radio component is een standalone radio button zonder label - alleen het rondje met inner circle. Gebruik deze component wanneer je volledige controle wilt over de layout, of gebruik RadioOption voor een radio button met geïntegreerd label. Radio buttons worden altijd gebruikt in groepen waar slechts één optie tegelijk geselecteerd kan zijn (via het `name` attribuut). De inner circle verschijnt wanneer de radio geselecteerd is. Alle interactive states (hover, focus, active) zijn geïmplementeerd met design tokens.

<!-- VOORBEELD -->

## Use when

- Je een radio button nodig hebt zonder label (voor custom layouts).
- Je volledige controle wilt over de positioning van label en radio.
- Je radio buttons in een groep wilt plaatsen waar slechts één optie tegelijk geselecteerd kan zijn.
- Je radio buttons in een tabel of grid wilt plaatsen.

## Don't use when

- Je een radio button met label nodig hebt — gebruik dan [RadioOption](/docs/components-radiooption--docs).
- Je een groep gerelateerde radio buttons hebt — gebruik dan [RadioGroup](/docs/components-radiogroup--docs).
- Je meerdere opties tegelijk wilt selecteren — gebruik dan [Checkbox](/docs/components-checkbox--docs).
- Je een aan/uit toggle nodig hebt — overweeg een toggle/switch (indien beschikbaar).

## Best practices

- **Gebruik altijd een label.** Zelfs als de Radio component zelf geen label heeft, moet er altijd een zichtbaar of toegankelijk label zijn. Gebruik `aria-label` of koppel aan een `<label>` element met `htmlFor`.
- **Groepeer met name attribuut.** Radio buttons in dezelfde groep moeten hetzelfde `name` attribuut hebben, zodat slechts één tegelijk geselecteerd kan zijn.
- **Minimaal 2 opties.** Een enkele radio button is zinloos - gebruik minimaal 2 opties in een groep.
- **Pre-select een standaard optie.** Radio groups moeten normaal gesproken een default geselecteerde optie hebben (behalve als "geen keuze" een geldige staat is).
- **Gebruik `invalid` voor validatie.** Toon de invalid state alleen na gebruikersinteractie of form submit, niet standaard.
- **Test keyboard navigatie.** Radio buttons moeten focusbaar zijn met Tab en selecteerbaar met Space of pijltjestoetsen.

## Design tokens

| Token                                   | Beschrijving                                                 |
| --------------------------------------- | ------------------------------------------------------------ |
| `--dsn-radio-background-color`          | Achtergrondkleur default state                               |
| `--dsn-radio-border-color`              | Border kleur default state                                   |
| `--dsn-radio-border-width`              | Border dikte default state                                   |
| `--dsn-radio-color`                     | Inner circle kleur default state                             |
| `--dsn-radio-size`                      | Grootte van de radio button (fluid, gekoppeld aan text size) |
| `--dsn-radio-active-background-color`   | Achtergrondkleur active state                                |
| `--dsn-radio-active-border-color`       | Border kleur active state                                    |
| `--dsn-radio-active-border-width`       | Border dikte active state                                    |
| `--dsn-radio-checked-background-color`  | Achtergrondkleur checked state (accent)                      |
| `--dsn-radio-checked-border-color`      | Border kleur checked state (transparent)                     |
| `--dsn-radio-checked-border-width`      | Border dikte checked state                                   |
| `--dsn-radio-checked-color`             | Inner circle kleur checked state (wit)                       |
| `--dsn-radio-disabled-background-color` | Achtergrondkleur disabled state                              |
| `--dsn-radio-disabled-border-color`     | Border kleur disabled state                                  |
| `--dsn-radio-focus-background-color`    | Achtergrondkleur focus state                                 |
| `--dsn-radio-focus-border-color`        | Border kleur focus state                                     |
| `--dsn-radio-focus-border-width`        | Border dikte focus state                                     |
| `--dsn-radio-hover-background-color`    | Achtergrondkleur hover state                                 |
| `--dsn-radio-hover-border-color`        | Border kleur hover state                                     |
| `--dsn-radio-hover-border-width`        | Border dikte hover state                                     |
| `--dsn-radio-invalid-background-color`  | Achtergrondkleur invalid state                               |
| `--dsn-radio-invalid-border-color`      | Border kleur invalid state                                   |
| `--dsn-radio-invalid-border-width`      | Border dikte invalid state                                   |
| `--dsn-radio-checked-active-*`          | Checked + active combinatie                                  |
| `--dsn-radio-checked-disabled-*`        | Checked + disabled combinatie                                |
| `--dsn-radio-checked-focus-*`           | Checked + focus combinatie                                   |
| `--dsn-radio-checked-hover-*`           | Checked + hover combinatie                                   |
| `--dsn-radio-icon-size`                 | Grootte van de inner circle (33% van radio size)             |

## Accessibility

- De component gebruikt een native `<input type="radio">` voor volledige toegankelijkheid.
- Radio buttons zonder zichtbaar label hebben een `aria-label` nodig.
- Radio buttons in dezelfde groep hebben hetzelfde `name` attribuut.
- Focus states zijn duidelijk zichtbaar met outline.
- Invalid state wordt gecommuniceerd via `aria-invalid="true"`.
- Radio buttons zijn keyboard toegankelijk: Tab (focus), Space (select), pijltjestoetsen (navigeren tussen opties in een groep).
- Screenreaders kondigen aan hoeveel opties er zijn in een groep en welke geselecteerd is.
