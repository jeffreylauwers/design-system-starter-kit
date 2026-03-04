# Option Label

Een label component voor checkbox en radio button opties.

## Doel

De OptionLabel component is een gespecialiseerd label element voor gebruik met checkbox en radio buttons. Het heeft typografie en kleuren geoptimaliseerd voor inline gebruik naast form controls. Deze component wordt meestal niet direct gebruikt, maar via CheckboxOption en RadioOption componenten die de label automatisch combineren met de bijbehorende control. De disabled state past automatisch de kleur aan om de disabled status visueel te communiceren.

<!-- VOORBEELD -->

## Use when

- Je een label nodig hebt voor een checkbox of radio button.
- Je een custom layout maakt met checkbox/radio controls en labels.
- Je volledige controle wilt over de positioning van label en control.

## Don't use when

- Je een checkbox met label nodig hebt — gebruik dan [CheckboxOption](/docs/components-checkboxoption--docs).
- Je een radio button met label nodig hebt — gebruik dan [RadioOption](/docs/components-radiooption--docs).
- Je een label voor andere form inputs nodig hebt — gebruik dan FormFieldLabel.

## Best practices

- **Gebruik duidelijke tekst.** Labels moeten kort maar beschrijvend zijn en duidelijk aangeven wat de optie doet.
- **Consistent met controls.** OptionLabel wordt meestal gecombineerd met Checkbox of Radio componenten.
- **Disabled state.** Gebruik de `disabled` prop wanneer de bijbehorende control disabled is.
- **Click area.** In CheckboxOption/RadioOption wordt de hele label klikbaar gemaakt voor betere UX.

## Design tokens

| Token                               | Beschrijving                             |
| ----------------------------------- | ---------------------------------------- |
| `--dsn-option-label-color`          | Tekstkleur default state                 |
| `--dsn-option-label-font-family`    | Font family voor option labels           |
| `--dsn-option-label-font-size`      | Font size voor option labels (medium)    |
| `--dsn-option-label-font-weight`    | Font weight voor option labels (default) |
| `--dsn-option-label-line-height`    | Line height voor option labels (medium)  |
| `--dsn-option-label-disabled-color` | Tekstkleur disabled state                |

## Accessibility

- De component gebruikt een `<span>` element en is semantisch bedoeld als inline text.
- Voor echte label functionaliteit (klikken activeert control) gebruik CheckboxOption of RadioOption.
- Disabled state wordt visueel gecommuniceerd via kleur.
- Labels zijn selecteerbaar met de muis voor copy-paste.
