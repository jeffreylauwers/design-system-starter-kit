# Form Field Description

Optionele help tekst die onder het label en boven de form control wordt getoond.

## Doel

De FormFieldDescription component toont aanvullende informatie of instructies voor een form field. Het heeft een subtiele tekstkleur om het te onderscheiden van het label en gebruikt standaard een `<p>` element. Gebruik `as="div"` wanneer de description block-level content bevat zoals een lijst — een `<ul>` mag niet binnen een `<p>` staan. De description komt altijd tussen het label en de form control. Voor accessibility moet de description gekoppeld worden aan de form control via `aria-describedby`.

<!-- VOORBEELD -->

## Use when

- Je aanvullende informatie of context nodig hebt bij een form field.
- Je wilt uitleggen wat er verwacht wordt in het veld.
- Je format requirements of beperkingen wilt communiceren.
- Je privacy of gebruik van data wilt uitleggen.

## Don't use when

- Je een foutmelding wilt tonen: gebruik [FormFieldErrorMessage](/docs/components-formfielderrormessage--docs).
- Je status feedback wilt geven: gebruik [FormFieldStatus](/docs/components-formfieldstatus--docs).
- De informatie essentieel is: voeg het toe aan het label zelf.
- Je een label nodig hebt: gebruik [FormFieldLabel](/docs/components-formfieldlabel--docs).

## Best practices

- **Houd het kort.** Descriptions moeten bondig zijn (1-2 zinnen meestal).
- **Wees specifiek.** Geef concrete voorbeelden of requirements ("Minimaal 8 tekens" in plaats van "Kies een sterk wachtwoord").
- **Gebruik aria-describedby.** Geef de description een `id` en koppel het aan de form control. Binnen [FormField](/docs/components-formfield--docs) of [FormFieldset](/docs/components-formfieldset--docs) gebeurt dat automatisch: die genereren het ID en zetten `aria-describedby`.
- **Gebruik `as="div"` voor lijsten.** Als de description een `UnorderedList` of andere block-level elementen bevat, render dan als `<div>` — een `<ul>` is geen geldig kind van een `<p>`.
- **Niet voor errors.** Gebruik FormFieldErrorMessage voor validatie feedback.
- **Niet voor status.** Gebruik FormFieldStatus voor success/info/warning feedback.
- **Timing.** Descriptions zijn altijd zichtbaar, niet alleen na interactie.

## Design tokens

| Token                                           | Beschrijving                              |
| ----------------------------------------------- | ----------------------------------------- |
| `--dsn-form-field-description-color`            | Text color (subtle)                       |
| `--dsn-form-field-description-font-family`      | Font family                               |
| `--dsn-form-field-description-font-size`        | Font size (medium)                        |
| `--dsn-form-field-description-font-weight`      | Font weight (normal)                      |
| `--dsn-form-field-description-line-height`      | Line height (medium)                      |
| `--dsn-form-field-description-margin-block-end` | Margin below description (medium spacing) |

## Accessibility

- Gebruik `id` attribuut op de description.
- Koppel de description aan de form control met `aria-describedby`. Gebruik je FormField of FormFieldset, dan is dat al geregeld.
- Screenreaders lezen de description voor na het label.
- Descriptions moeten altijd zichtbaar zijn (niet verbergen achter tooltips).
- Zorg dat kleurcontrast voldoende is (subtiele kleur maar nog leesbaar).
