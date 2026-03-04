# Select

Een dropdown selectiemenu waarmee gebruikers één optie kunnen kiezen uit een lijst.

## Doel

Select is een formuliercomponent op basis van het native `<select>` element. Het heeft een aangepast chevron-down icoon aan de rechterkant, consistent met de actiekleur van de Button subtle variant. De native browser pijl is verborgen zodat het icoon uniform eruitziet in alle browsers.

<!-- VOORBEELD -->

## Use when

- De gebruiker één keuze moet maken uit een vooraf bepaalde lijst
- Er meer dan 5 opties zijn (minder opties kunnen beter als RadioGroup worden weergegeven)
- Ruimte beperkt is en een uitklaplijst handiger is dan losse radio buttons

## Don't use when

- Er maar 2-4 opties zijn — gebruik dan RadioOption/RadioGroup
- Meerdere opties tegelijk geselecteerd mogen worden — gebruik dan CheckboxGroup
- De opties dynamisch gefilterd of doorzocht moeten worden — gebruik dan een autocomplete of combobox pattern

## Best practices

- Geef altijd een eerste lege optie of placeholder-optie (bijv. "Kies een optie") zodat de gebruiker bewust een keuze maakt
- Gebruik een `<FormField>` wrapper met een duidelijk label
- Zorg dat opties kort en onderscheidend zijn
- Groepeer gerelateerde opties met `<optgroup>` bij lange lijsten

## Accessibility

- Het `<select>` element is van nature toegankelijk voor toetsenbord en screenreaders
- Gebruik altijd een zichtbaar label via `<FormField>` of `<FormFieldLabel htmlFor="...">`
- De `invalid` prop zet `aria-invalid="true"` — combineer dit met `<FormFieldErrorMessage>` en `aria-describedby`
- Het chevron-icoon heeft `aria-hidden="true"` en is voor screenreaders onzichtbaar

## States

- **Default** — lege selectie of placeholder
- **With value** — een optie is geselecteerd
- **Disabled** — niet bewerkbaar, gereduceerde opaciteit
- **Invalid** — rode border, gebruik samen met foutmelding

## Design tokens

| Token                                       | Beschrijving                                     |
| ------------------------------------------- | ------------------------------------------------ |
| `--dsn-select-icon-color`                   | Kleur van het chevron-icoon                      |
| `--dsn-select-icon-gap`                     | Ruimte tussen icoon en tekst                     |
| `--dsn-select-icon-inset-inline-end`        | Afstand van icoon tot de rechterrand             |
| `--dsn-select-icon-size`                    | Grootte van het chevron-icoon                    |
| `--dsn-select-padding-inline-end-with-icon` | Padding rechts van de select (ruimte voor icoon) |
