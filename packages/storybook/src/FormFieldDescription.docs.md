# Form Field Description

Optionele help tekst die onder het label en boven de form control wordt getoond.

## Doel

De FormFieldDescription component toont aanvullende informatie of instructies voor een form field. Het heeft een subtiele tekstkleur om het te onderscheiden van het label en gebruikt standaard een `<p>` element. De description komt altijd tussen het label en de form control. Voor accessibility moet de description gekoppeld worden aan de form control via `aria-describedby`.

Schrijf een description als lopende tekst. Een screenreader leest de inhoud van een `aria-describedby`-koppeling voor als één platte tekst: lijststructuur en links verliezen daarbij hun betekenis. VoiceOver in Safari leest een lijst in een description zelfs helemaal niet voor, dus die informatie bereikt die gebruikers niet. Heb je een opsomming nodig, zet die dan als gewone inhoud boven het form field.

<!-- VOORBEELD -->

## Use when

- Je aanvullende informatie of context nodig hebt bij een form field.
- Je wilt uitleggen wat er verwacht wordt in het veld.
- Je format requirements of beperkingen wilt communiceren.
- Je privacy of gebruik van data wilt uitleggen.

## Don't use when

- Je een foutmelding wilt tonen: gebruik [FormFieldErrorMessage](/docs/components-formfielderrormessage--docs).
- Je status feedback wilt geven: gebruik [FormFieldStatus](/docs/components-formfieldstatus--docs).
- Je een opsomming of een link wilt aanbieden: zet die buiten de description, zie [Best practices](#best-practices).
- De informatie essentieel is: voeg het toe aan het label zelf.
- Je een label nodig hebt: gebruik [FormFieldLabel](/docs/components-formfieldlabel--docs).

## Best practices

- **Houd het kort.** Descriptions moeten bondig zijn (1-2 zinnen meestal).
- **Wees specifiek.** Geef concrete voorbeelden of requirements ("Minimaal 8 tekens" in plaats van "Kies een sterk wachtwoord").
- **Gebruik aria-describedby.** Geef de description een `id` en koppel het aan de form control. Binnen [FormField](/docs/components-formfield--docs) of [FormFieldset](/docs/components-formfieldset--docs) gebeurt dat automatisch: die genereren het ID en zetten `aria-describedby`.
- **Alleen tekst.** Een screenreader leest de inhoud van `aria-describedby` voor als één platte tekst. Opmaak, lijststructuur en links gaan daarbij verloren. Lopende tekst is de enige vorm die betrouwbaar overkomt.
- **Geen lijst in een description.** VoiceOver in Safari leest een lijst in een description helemaal niet voor: de items ontbreken volledig in wat de gebruiker hoort. Andere screenreaders lezen de items wel, maar zonder lijstsemantiek. Heb je een opsomming nodig, zet die dan als gewone inhoud boven het form field, buiten de `aria-describedby`-koppeling. Daar houdt de `<ul>` zijn lijstsemantiek en wordt hij wel voorgelezen.
- **Geen links in een description.** Een link in een description wordt niet als link voorgelezen en is vanuit de aankondiging niet te activeren: hooguit hoort de gebruiker de linktekst als gewone tekst. Zet de link buiten de description, bijvoorbeeld in de tekst boven het formulier of als los element onder de form control.
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
- De inhoud van een `aria-describedby`-koppeling wordt platgeslagen tot één tekst. Lijsten, koppen en links verliezen daarbij hun rol: er klinkt geen "lijst met 3 items" en een link is niet als link te herkennen of te activeren.
- Gebruik geen links in een description. Zet ze buiten de description, zodat ze in de tabvolgorde staan en wel als link worden aangekondigd.
- Zet geen lijst in een description. VoiceOver in Safari leest die helemaal niet voor, waardoor de informatie voor die gebruikers ontbreekt. Een `<ul>` boven het form field, buiten de `aria-describedby`-koppeling, wordt wel als lijst voorgelezen.
- Descriptions moeten altijd zichtbaar zijn (niet verbergen achter tooltips).
- Zorg dat kleurcontrast voldoende is (subtiele kleur maar nog leesbaar).
