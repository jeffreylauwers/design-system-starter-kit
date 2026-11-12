# Checkbox Option

Een checkbox met geïntegreerd label voor het selecteren van meerdere opties.

## Doel

De CheckboxOption component combineert een Checkbox en OptionLabel in een klikbaar label element. Het hele label is klikbaar, wat de usability verbetert door een groter klikgebied te bieden. Deze component is de standaard manier om checkboxes met labels te gebruiken. De component ondersteunt alle states van Checkbox (checked, indeterminate, disabled, invalid) en past automatisch de label styling aan op basis van de disabled state. Vertical padding zorgt voor voldoende touch target size volgens WCAG 2.5.5 richtlijnen.

<!-- VOORBEELD -->

## Use when

- Je checkboxes met labels nodig hebt voor formulieren.
- Je gebruikers meerdere opties tegelijk wilt laten selecteren.
- Je een groep gerelateerde opties hebt die on/off gezet kunnen worden.
- Je een indeterminate state nodig hebt (bijvoorbeeld "select all" in een lijst).

## Don't use when

- Je alleen het checkbox vierkantje nodig hebt zonder label: gebruik dan [Checkbox](/docs/components-checkbox--docs).
- Je een groep checkboxes met een gezamenlijk label nodig hebt: gebruik dan [CheckboxGroup](/docs/components-checkboxgroup--docs).
- Je maar één optie tegelijk wilt selecteren: gebruik dan [RadioOption](/docs/components-radiooption--docs).
- Je een aan/uit toggle nodig hebt: overweeg een toggle/switch component (indien beschikbaar).

## Best practices

- **Duidelijke labels.** Labels moeten kort en beschrijvend zijn en duidelijk aangeven wat de optie doet.
- **Groepeer gerelateerde opties.** Gebruik CheckboxGroup om een groep checkboxes met een gezamenlijk label te maken.
- **Pre-select met zorg.** Checkboxes zijn meestal standaard niet geselecteerd, behalve als een optie sterk aanbevolen of verplicht is.
- **Gebruik `invalid` voor validatie.** Toon de invalid state alleen na gebruikersinteractie of form submit, niet standaard.
- **Toegankelijk click gebied.** Het hele label is klikbaar dankzij het native `<label>` element.
- **Test keyboard navigatie.** Checkboxes moeten focusbaar zijn met Tab en toggle-baar met Space.

## Design tokens

<!-- tokens: checkbox-option -->

Plus alle tokens van [Checkbox](/docs/components-checkbox--docs) en [OptionLabel](/docs/components-optionlabel--docs).

## Accessibility

- De component gebruikt een native `<label>` element dat gekoppeld is aan de checkbox input.
- Het hele label is klikbaar, wat de usability verbetert.
- Vertical padding zorgt voor voldoende touch target size (minimaal 24x24px volgens WCAG 2.5.5).
- Focus states zijn duidelijk zichtbaar met outline.
- Invalid state wordt gecommuniceerd via `aria-invalid="true"`.
- Checkboxes zijn keyboard toegankelijk: Tab (focus), Space (toggle).
- Screenreaders lezen het label voor en kondigen de checked/indeterminate state aan.
- Labels wrappen correct bij lange tekst en blijven aligned met de checkbox.
