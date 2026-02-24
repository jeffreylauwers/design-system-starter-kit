# Checkbox Group

Een container voor meerdere CheckboxOption componenten.

## Doel

De CheckboxGroup component is een simpele container die meerdere CheckboxOption componenten groepeert met consistente spacing. Het is puur een presentationele lijst zonder semantische form field markup (geen fieldset/legend). Voor een volledige form field met label en beschrijving wrap je de CheckboxGroup in een FormFieldset component. De gap tussen opties is geoptimaliseerd voor leesbaarheid en touch targets.

> **Codevoorbeeld met context**: De HTML/CSS tab toont `CheckboxOption` componenten als representatieve children. `CheckboxGroup` is puur een lijst-container — de children bepalen de daadwerkelijke functionaliteit.

<!-- VOORBEELD -->

## Use when

- Je meerdere checkbox opties hebt die bij elkaar horen.
- Je consistente spacing tussen checkboxes nodig hebt.
- Je een lijst van checkboxes wilt tonen zonder expliciete groepslabel.

## Don't use when

- Je een complete form field met label nodig hebt — wrap dan CheckboxGroup in [FormFieldset](/docs/components-formfieldset--docs).
- Je maar één checkbox hebt — gebruik dan gewoon [CheckboxOption](/docs/components-checkboxoption--docs).
- Je geen gerelateerde opties hebt — gebruik losse CheckboxOptions.

## Best practices

- **Groepeer logisch gerelateerde opties.** Checkbox opties in een groep zouden conceptueel bij elkaar moeten horen.
- **Gebruik FormFieldset voor labels.** Voor een volledige form field met label, wrap de CheckboxGroup in een FormFieldset met FormFieldLegend.
- **Consistente naming.** Als checkboxes bij elkaar horen, overweeg dan een consistente naming convention voor de `value` attributen.
- **Volgorde.** Zet de meest gebruikte of belangrijkste opties bovenaan.

## Design tokens

| Token                      | Beschrijving                                        |
| -------------------------- | --------------------------------------------------- |
| `--dsn-checkbox-group-gap` | Ruimte tussen checkbox opties (small block spacing) |

## Accessibility

- De component is een simpele div container zonder extra semantiek.
- Voor semantisch correcte form groups gebruik FormFieldset met `<fieldset>` en `<legend>` elementen.
- Elke CheckboxOption is individueel focusbaar en bedienbaar met keyboard.
- Screenreaders lezen elke checkbox individueel voor (zonder groepering, tenzij gewrapt in FormFieldset).
- Spacing zorgt voor voldoende visuele scheiding tussen opties.
