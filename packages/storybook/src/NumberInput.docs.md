# NumberInput

Een invoerveld voor numerieke waarden, geoptimaliseerd voor zowel desktop als mobiel.

## Doel

De NumberInput component is een gespecialiseerd invoerveld voor het invoeren van getallen. Het gebruikt `type="text"` met `inputmode="numeric"` en `pattern="[0-9]*"`: het GOV.UK-patroon: zodat mobiele gebruikers een cijfertoetsenbord krijgen zonder de nadelen van `type="number"` (zoals ongewenste scroll-interactie en stille validatiefouten). Voor decimale getallen (bijv. bedragen) kan `allowDecimals` worden ingesteld.

<!-- VOORBEELD -->

## Use when

- Je een invoerveld nodig hebt voor gehele getallen, zoals leeftijd, aantal of postcode.
- Je een invoerveld nodig hebt voor bedragen of maten met decimalen (`allowDecimals`).
- Je mobiele gebruikers direct het juiste toetsenbord wil tonen.

## Don't use when

- Het om vrije tekst gaat: gebruik dan [TextInput](/docs/components-textinput--docs).
- Je een datum- of tijdinvoer nodig hebt: gebruik dan DateInput of [TimeInput](/docs/components-timeinput--docs).

## Best practices

- **Gebruik FormFieldDescription voor formaathints.** Als je wilt toelichten wat de verwachte invoer is (bijv. "Voer een bedrag in, gebruik een komma voor decimalen"), gebruik dan [FormFieldDescription](/docs/components-formfielddescription--docs): niet een placeholder. Placeholder tekst verdwijnt bij typen en is daarna niet meer zichtbaar.
- **Gebruik `allowDecimals` voor bedragen.** Dit schakelt `inputmode="decimal"` in zodat ook een kommatoets beschikbaar is op mobiel.
- **Combineer met FormField.** Gebruik altijd een label via `FormField` of `FormFieldLabel` voor toegankelijkheid.
- **Geef validatie feedback.** Gebruik de `invalid` prop in combinatie met `aria-invalid` en een `FormFieldErrorMessage`.
- **Beperk de inline-size.** Gebruik de `inlineSize` prop om de inline-size af te stemmen op de verwachte waarde (bijv. `xs` voor leeftijd, `sm` voor postcode).

## Accessibility

- Gebruikt `type="text"` om problemen met `type="number"` te vermijden (screen reader inconsistenties, stille validatie, scrollwiel-interactie).
- `inputmode="numeric"` zorgt voor een cijfertoetsenbord op mobiel.
- `pattern="[0-9]*"` biedt backwards compatibility voor oudere iOS-apparaten.
- Bij `allowDecimals={true}` wordt `inputmode="decimal"` gebruikt voor een toetsenbord met komma/punt.

## States

- **Default**: Leeg, klaar voor invoer
- **Filled**: Bevat een getal
- **Focus**: Actief, gebruiker typt
- **Hover**: Muis over het veld
- **Disabled**: Niet beschikbaar voor invoer
- **Read-only**: Waarde is zichtbaar maar niet aanpasbaar
- **Invalid**: Validatiefout

## Design tokens

NumberInput erft alle tokens van [TextInput](/docs/components-textinput--docs):

| Token                                        | Beschrijving              |
| -------------------------------------------- | ------------------------- |
| `--dsn-text-input-font-family`               | Lettertypefamilie         |
| `--dsn-text-input-font-size`                 | Font size                 |
| `--dsn-text-input-font-weight`               | Font weight               |
| `--dsn-text-input-line-height`               | Line height               |
| `--dsn-text-input-color`                     | Tekstkleur                |
| `--dsn-text-input-background-color`          | Achtergrondkleur          |
| `--dsn-text-input-border-color`              | Borderkleur default state |
| `--dsn-text-input-border-width`              | Dikte van de border       |
| `--dsn-text-input-border-radius`             | Border radius             |
| `--dsn-text-input-padding-block-start`       | Padding boven             |
| `--dsn-text-input-padding-block-end`         | Padding onder             |
| `--dsn-text-input-hover-border-color`        | Borderkleur hover state   |
| `--dsn-text-input-focus-border-color`        | Borderkleur focus state   |
| `--dsn-text-input-disabled-background-color` | Achtergrondkleur disabled |
| `--dsn-text-input-disabled-color`            | Tekstkleur disabled       |
| `--dsn-text-input-invalid-border-color`      | Borderkleur invalid state |
| `--dsn-text-input-placeholder-color`         | Placeholder tekstkleur    |
