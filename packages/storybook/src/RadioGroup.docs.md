# Radio Group

Een container voor meerdere RadioOption componenten.

## Doel

De RadioGroup component is een simpele container die meerdere RadioOption componenten groepeert met consistente spacing. Het is puur een presentationele lijst zonder semantische form field markup (geen fieldset/legend). Voor een volledige form field met label en beschrijving wrap je de RadioGroup in een FormFieldset component. De gap tussen opties is geoptimaliseerd voor leesbaarheid en touch targets. Radio buttons in dezelfde groep moeten hetzelfde `name` attribuut hebben zodat slechts één optie tegelijk geselecteerd kan zijn.

> **Codevoorbeeld met context**: De HTML/CSS tab toont `RadioOption` componenten als representatieve children. `RadioGroup` is puur een lijst-container — de children bepalen de daadwerkelijke functionaliteit.

<!-- VOORBEELD -->

## Use when

- Je meerdere radio button opties hebt die bij elkaar horen.
- Je consistente spacing tussen radio buttons nodig hebt.
- Je een lijst van mutually exclusive opties wilt tonen.

## Don't use when

- Je een complete form field met label nodig hebt — wrap dan RadioGroup in [FormFieldset](/docs/components-formfieldset--docs).
- Je maar één radio button hebt — een enkele radio button is zinloos, minimaal 2 opties nodig.
- Je meerdere opties tegelijk wilt selecteren — gebruik dan [CheckboxGroup](/docs/components-checkboxgroup--docs).

## Best practices

- **Zelfde name attribuut.** Alle RadioOptions in een groep MOETEN hetzelfde `name` attribuut hebben.
- **Groepeer logisch gerelateerde opties.** Radio opties in een groep zouden conceptueel bij elkaar moeten horen en elkaar uitsluiten.
- **Gebruik FormFieldset voor labels.** Voor een volledige form field met label, wrap de RadioGroup in een FormFieldset met FormFieldLegend.
- **Pre-select een default.** Radio groups hebben meestal een default geselecteerde optie.
- **Volgorde.** Zet de meest gebruikte of logische default optie bovenaan.
- **Minimaal 2 opties.** Een enkele radio button heeft geen zin.

## Design tokens

| Token                   | Beschrijving                                     |
| ----------------------- | ------------------------------------------------ |
| `--dsn-radio-group-gap` | Ruimte tussen radio opties (small block spacing) |

## Accessibility

- De component is een simpele div container zonder extra semantiek.
- Voor semantisch correcte form groups gebruik FormFieldset met `<fieldset>` en `<legend>` elementen.
- Elke RadioOption is individueel focusbaar met Tab.
- Binnen een radio group (zelfde `name`) kun je met pijltjestoetsen navigeren tussen opties.
- Screenreaders lezen elke radio button individueel voor (zonder groepering, tenzij gewrapt in FormFieldset).
- Spacing zorgt voor voldoende visuele scheiding tussen opties.
