# EmailInput

Een invoerveld specifiek voor e-mailadressen.

## Doel

De EmailInput component is een gespecialiseerd invoerveld voor e-mailadressen. Het gebruikt `type="email"` voor ingebouwde browservalidatie en `inputmode="email"` voor een geoptimaliseerd toetsenbord op mobiel (met @-teken en .com direct beschikbaar). Browser-autocomplete staat standaard aan via `autocomplete="email"`, zodat gebruikers snel hun opgeslagen e-mailadres kunnen invullen.

<!-- VOORBEELD -->

## Use when

- Je een e-mailadres van de gebruiker nodig hebt, bijv. voor een inlogformulier, registratie of contactformulier.
- Je wilt dat de browser het e-mailadres valideert en autocomplete aanbiedt.

## Don't use when

- Je meerdere e-mailadressen wilt invoeren: overweeg dan een TagInput of tekstinvoer met eigen validatie.
- Het om een vrij tekstveld gaat: gebruik dan [TextInput](/docs/components-textinput--docs).

## Best practices

- **Gebruik FormFieldDescription voor formaathints.** Als het e-mailadresformaat toelichting behoeft, gebruik dan [FormFieldDescription](/docs/components-formfielddescription--docs): niet een placeholder. Placeholder tekst verdwijnt bij typen en is daarna niet meer zichtbaar.
- **Laat browser-autocomplete aan.** De standaard `autocomplete="email"` helpt gebruikers snel invullen. Zet alleen op `off` als daar een goede reden voor is.
- **Combineer met FormField.** Gebruik altijd een label via `FormField` of `FormFieldLabel` voor toegankelijkheid.
- **Geef validatie feedback.** Gebruik de `invalid` prop in combinatie met `aria-invalid` en een `FormFieldErrorMessage`.
- **Kies de juiste inline-size.** Gebruik `inlineSize` met `md`, `lg`, `xl` of `full`. `xs` en `sm` bestaan bij EmailInput niet: een e-mailadres past daar vrijwel nooit in.

## Accessibility

- `type="email"` zorgt voor ingebouwde browservalidatie en een geoptimaliseerd mobiel toetsenbord.
- `inputmode="email"` geeft op mobiel een toetsenbord met @-teken en veelgebruikte domeinsuffixen.
- `autocomplete="email"` maakt het voor gebruikers eenvoudig om hun e-mailadres in te vullen zonder te typen.

## States

- **Default**: Leeg, klaar voor invoer
- **Filled**: Bevat een e-mailadres
- **Focus**: Actief, gebruiker typt
- **Hover**: Muis over het veld
- **Disabled**: Niet beschikbaar voor invoer
- **Read-only**: Waarde is zichtbaar maar niet aanpasbaar
- **Invalid**: Validatiefout (bijv. ongeldig e-mailadres)

## Design tokens

EmailInput erft alle tokens van [TextInput](/docs/components-textinput--docs):

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
