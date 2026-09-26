# TelephoneInput

Een invoerveld specifiek voor telefoonnummers.

## Doel

De TelephoneInput component is een gespecialiseerd invoerveld voor telefoonnummers. Het gebruikt `type="tel"` voor een geoptimaliseerd toetsenbord op mobiel (met cijfers en koppeltekens direct beschikbaar) en `autocomplete="tel"` zodat de browser opgeslagen telefoonnummers kan aanbieden. Er wordt geen format-validatie afgedwongen: gebruikers kunnen zowel nationale (06 12345678) als internationale (+31 6 12345678) nummers invoeren.

<!-- VOORBEELD -->

## Use when

- Je een telefoonnummer van de gebruiker nodig hebt, bijv. voor een contactformulier of registratie.
- Je wilt dat mobiele gebruikers direct het juiste toetsenbord krijgen.

## Don't use when

- Het om een vrij tekstveld gaat: gebruik dan [TextInput](/docs/components-textinput--docs).
- Je strikte format-validatie wilt afdwingen: doe dit via formuliervalidatie, niet via het inputtype.

## Best practices

- **Gebruik FormFieldDescription voor formaathints.** Als je het verwachte formaat wilt toelichten (bijv. `06 12345678` of `+31 6 12345678`), gebruik dan [FormFieldDescription](/docs/components-formfielddescription--docs): niet een placeholder. Placeholder tekst verdwijnt bij typen en is daarna niet meer zichtbaar.
- **Dwing geen specifiek formaat af.** Gebruikers typen telefoonnummers op verschillende manieren. Valideer lengte en tekens, maar accepteer variaties in opmaak.
- **Laat browser-autocomplete aan.** De standaard `autocomplete="tel"` helpt gebruikers snel invullen.
- **Combineer met FormField.** Gebruik altijd een label via `FormField` of `FormFieldLabel` voor toegankelijkheid.
- **Geef validatie feedback.** Gebruik de `invalid` prop in combinatie met `aria-invalid` en een `FormFieldErrorMessage`.
- **Standaard `md`.** TelephoneInput krijgt standaard `inlineSize="md"` (20ch), genoeg voor een telefoonnummer met landcode. Kies `lg`, `xl` of `full` als dat beter in het formulier past. `xs` en `sm` bestaan bij TelephoneInput niet: een telefoonnummer past daar niet in.

## Accessibility

- `type="tel"` geeft op mobiel een toetsenbord met cijfers, koppeltekens en plusteken.
- `autocomplete="tel"` maakt het voor gebruikers eenvoudig om hun telefoonnummer in te vullen.
- Er wordt geen native browservalidatie afgedwongen: valideer zelf in het formulier.

## States

- **Default**: Leeg, klaar voor invoer
- **Filled**: Bevat een telefoonnummer
- **Focus**: Actief, gebruiker typt
- **Hover**: Muis over het veld
- **Disabled**: Niet beschikbaar voor invoer
- **Read-only**: Waarde is zichtbaar maar niet aanpasbaar
- **Invalid**: Validatiefout (bijv. ongeldig telefoonnummer)

## Design tokens

TelephoneInput erft alle tokens van [TextInput](/docs/components-textinput--docs):

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
