# Form Field Error Message

Foutmelding die onder de description en boven de form control wordt getoond.

## Doel

De FormFieldErrorMessage component toont validatie foutmeldingen bij form fields. Het gebruikt een negatieve (error) kleur voor hoge zichtbaarheid en toont standaard een exclamation-circle icoon voor visuele nadruk. De component gebruikt flexbox om icoon en tekst naast elkaar te tonen met correcte alignment. Voor accessibility moet de error message gekoppeld worden aan de form control via `aria-describedby` en moet de invalid state op de control zelf staan via `aria-invalid="true"`. Error messages worden getoond na validatie (bij blur of submit), niet standaard.

<!-- VOORBEELD -->

## Use when

- Je validatie fouten wilt communiceren aan de gebruiker.
- Een form field een ongeldige waarde heeft na gebruikersinteractie.
- Je specifieke feedback wilt geven over wat er fout is.

## Don't use when

- Je algemene help tekst wilt tonen — gebruik [FormFieldDescription](/docs/components-formfielddescription--docs).
- Je status feedback wilt geven (success, info, warning) — gebruik [FormFieldStatus](/docs/components-formfieldstatus--docs).
- Voor preventieve feedback — toon errors alleen na interactie (blur) of submit.

## Best practices

### Timing

- **Na interactie.** Toon errors na blur of submit, niet tijdens typen (te opdringerig).
- **Niet standaard.** Error messages zijn niet standaard zichtbaar, alleen na validatie.
- **Direct feedback.** Zodra de fout opgelost is, verwijder de error message direct.

### Content

- **Specifiek.** Vertel exact wat er fout is en hoe het op te lossen ("Vul een geldig e-mailadres in" in plaats van "Ongeldige waarde").
- **Kort maar compleet.** 1-2 zinnen meestal, met concrete actie.
- **Positieve toon.** Focus op oplossing, niet op beschuldiging.
- **Voorbeelden geven.** Bij complexe formats, toon een voorbeeld ("bijv. +31 6 12345678").

### Technisch

- **Icon standaard aan.** Laat het icoon zichtbaar tenzij er een goede reden is (meestal wel).
- **Gebruik ID + aria-describedby.** Geef de error message een `id` en koppel het aan de form control.
- **aria-invalid="true".** Zet dit attribuut op de form control zelf.
- **Meerdere errors.** Gebruik meerdere FormFieldErrorMessage componenten voor verschillende fouten.

## Design tokens

| Token                                             | Beschrijving                                |
| ------------------------------------------------- | ------------------------------------------- |
| `--dsn-form-field-error-message-color`            | Text color (negative/error red)             |
| `--dsn-form-field-error-message-font-family`      | Font family                                 |
| `--dsn-form-field-error-message-font-size`        | Font size (medium)                          |
| `--dsn-form-field-error-message-font-weight`      | Font weight (normal)                        |
| `--dsn-form-field-error-message-gap`              | Space between icon and text (small)         |
| `--dsn-form-field-error-message-icon-size`        | Icon size (medium)                          |
| `--dsn-form-field-error-message-line-height`      | Line height (medium)                        |
| `--dsn-form-field-error-message-margin-block-end` | Margin below error message (medium spacing) |

## Accessibility

- Gebruik `id` attribuut op de error message.
- Koppel de error message aan de form control met `aria-describedby`.
- Zet `aria-invalid="true"` op de form control zelf (niet op de error message).
- Screenreaders kondigen errors aan wanneer de gebruiker naar het veld navigeert.
- Het icoon heeft `aria-hidden="true"` omdat de tekst zelf al voldoende context geeft.
- Error kleur alleen is niet voldoende — het icoon helpt ook bij kleurenblindheid.
- Zorg voor voldoende kleurcontrast (error red moet goed leesbaar zijn).
