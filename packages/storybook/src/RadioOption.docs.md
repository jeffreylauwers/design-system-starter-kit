# Radio Option

Een radio button met geïntegreerd label voor het selecteren van één optie uit meerdere.

## Doel

De RadioOption component combineert een Radio en OptionLabel in een klikbaar label element. Het hele label is klikbaar, wat de usability verbetert door een groter klikgebied te bieden. Deze component is de standaard manier om radio buttons met labels te gebruiken. De component ondersteunt alle states van Radio (checked, disabled, invalid) en past automatisch de label styling aan op basis van de disabled state. Radio buttons worden altijd gebruikt in groepen waar slechts één optie tegelijk geselecteerd kan zijn (via het `name` attribuut). Vertical padding zorgt voor voldoende touch target size volgens WCAG 2.5.5 richtlijnen.

<!-- VOORBEELD -->

## Use when

- Je radio buttons met labels nodig hebt voor formulieren.
- Je gebruikers één optie uit meerdere wilt laten selecteren.
- Je een groep opties hebt die elkaar uitsluiten (mutually exclusive).
- Je een duidelijke default selectie wilt tonen.

## Don't use when

- Je alleen het radio rondje nodig hebt zonder label: gebruik dan [Radio](/docs/components-radio--docs).
- Je een groep radio buttons met een gezamenlijk label nodig hebt: gebruik dan [RadioGroup](/docs/components-radiogroup--docs).
- Je meerdere opties tegelijk wilt selecteren: gebruik dan [CheckboxOption](/docs/components-checkboxoption--docs).
- Je een aan/uit toggle nodig hebt: overweeg een toggle/switch component (indien beschikbaar).

## Best practices

- **Duidelijke labels.** Labels moeten kort en beschrijvend zijn en duidelijk aangeven wat de optie doet.
- **Groepeer met name attribuut.** Radio buttons in dezelfde groep moeten hetzelfde `name` attribuut hebben.
- **Minimaal 2 opties.** Een enkele radio button is zinloos - gebruik minimaal 2 opties in een groep.
- **Pre-select een standaard optie.** Radio groups moeten normaal gesproken een default geselecteerde optie hebben (behalve als "geen keuze" een geldige staat is).
- **Gebruik `invalid` voor validatie.** Toon de invalid state alleen na gebruikersinteractie of form submit, niet standaard.
- **Toegankelijk click gebied.** Het hele label is klikbaar dankzij het native `<label>` element.
- **Test keyboard navigatie.** Radio buttons moeten focusbaar zijn met Tab en selecteerbaar met Space of pijltjestoetsen.

## Design tokens

<!-- tokens: radio-option -->

Plus alle tokens van [Radio](/docs/components-radio--docs) en [OptionLabel](/docs/components-optionlabel--docs).

## Accessibility

- De component gebruikt een native `<label>` element dat gekoppeld is aan de radio input.
- Het hele label is klikbaar, wat de usability verbetert.
- Vertical padding zorgt voor voldoende touch target size (minimaal 24x24px volgens WCAG 2.5.5).
- Focus states zijn duidelijk zichtbaar met outline.
- Invalid state wordt gecommuniceerd via `aria-invalid="true"`.
- Radio buttons zijn keyboard toegankelijk: Tab (focus), Space (select), pijltjestoetsen (navigeren tussen opties in een groep).
- Screenreaders lezen het label voor en kondigen aan hoeveel opties er zijn in een groep en welke geselecteerd is.
- Labels wrappen correct bij lange tekst en blijven aligned met de radio button.
