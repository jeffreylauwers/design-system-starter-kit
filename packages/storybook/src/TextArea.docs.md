# Text Area

Een multi-line tekst invoerveld met ondersteuning voor verschillende states en width varianten.

## Doel

De TextArea component is een gestandaardiseerd invoerveld voor multi-line tekst. Het ondersteunt resize gedrag (standaard vertical), verschillende row heights, en heeft consistent styling voor alle interaction states (hover, focus, disabled, invalid, read-only). De component heeft verschillende width varianten die je kunt instellen met de `width` prop. Vertical resizing is standaard ingeschakeld maar wordt uitgeschakeld bij disabled state. Default height wordt bepaald door het `rows` attribuut (standaard 4 regels).

<!-- VOORBEELD -->

## Use when

- Je multi-line tekst invoer nodig hebt (beschrijving, opmerking, bio).
- Je gebruikers meerdere regels tekst wilt laten invoeren.
- Je resize gedrag wilt toestaan voor grotere teksten.

## Don't use when

- Je single-line tekst invoer nodig hebt — gebruik dan [TextInput](/docs/components-textinput--docs).
- Je rich text editing nodig hebt — overweeg een rich text editor component.
- Je alleen een label nodig hebt — gebruik FormFieldLabel.

## Best practices

- **Kies de juiste height.** Gebruik `rows` om de standaard hoogte aan te passen:
  - `rows={2-3}` - Korte berichten, opmerkingen
  - `rows={4-6}` - Standaard berichten, beschrijvingen (4 is default)
  - `rows={8+}` - Lange teksten, artikelen
- **Kies de juiste width.** Gebruik `width` om de breedte aan te passen:
  - `md` (32ch) - Standaard, korte teksten
  - `lg` (48ch) - Langere teksten
  - `xl` (64ch) - Zeer lange teksten
  - `full` (100%) - Responsive, neemt volledige breedte
- **Labels zijn verplicht.** Wrap in FormField met FormFieldLabel voor accessibility.
- **Resize gedrag.** Standaard vertical resizing, automatisch disabled bij disabled state.
- **Invalid state alleen na interactie.** Toon invalid state alleen na blur of submit.
- **Vermijd placeholders.** Placeholder tekst verdwijnt zodra de gebruiker begint te typen — daarna is de informatie niet meer zichtbaar. Bovendien kan de lage contrast van placeholders het veld er ingevuld laten uitzien. Gebruik [FormFieldDescription](/docs/components-formfielddescription--docs) voor hints over het verwachte formaat of inhoud.
- **Character/word limits.** Overweeg een character counter te tonen bij lange teksten.

## Row height richtlijnen

| Rows | Gebruik                                                 |
| ---- | ------------------------------------------------------- |
| 2-3  | Korte berichten, opmerkingen, vragen                    |
| 4-6  | **Standaard** - beschrijvingen, feedback (4 is default) |
| 8+   | Lange teksten, artikelen, uitgebreide beschrijvingen    |

## Width varianten

| Variant | Width | Gebruik                                  |
| ------- | ----- | ---------------------------------------- |
| `md`    | 32ch  | **Standaard** - korte tot medium teksten |
| `lg`    | 48ch  | Langere teksten                          |
| `xl`    | 64ch  | Zeer lange teksten                       |
| `full`  | 100%  | Responsive, past zich aan container      |

## Design tokens

| Token                                        | Beschrijving                                       |
| -------------------------------------------- | -------------------------------------------------- |
| `--dsn-text-area-background-color`           | Background color                                   |
| `--dsn-text-area-border-color`               | Border color                                       |
| `--dsn-text-area-border-radius`              | Border radius                                      |
| `--dsn-text-area-border-width`               | Border width                                       |
| `--dsn-text-area-color`                      | Text color                                         |
| `--dsn-text-area-font-family`                | Font family                                        |
| `--dsn-text-area-font-size`                  | Font size                                          |
| `--dsn-text-area-font-weight`                | Font weight                                        |
| `--dsn-text-area-line-height`                | Line height                                        |
| `--dsn-text-area-min-block-size`             | Minimum height (WCAG 24px touch target)            |
| `--dsn-text-area-min-inline-size`            | Minimum width (WCAG 24px touch target)             |
| `--dsn-text-area-padding-block-end`          | Bottom padding                                     |
| `--dsn-text-area-padding-block-start`        | Top padding                                        |
| `--dsn-text-area-padding-inline-end`         | Right padding                                      |
| `--dsn-text-area-padding-inline-start`       | Left padding                                       |
| `--dsn-text-area-resize`                     | Resize behavior (vertical, horizontal, both, none) |
| `--dsn-text-area-disabled-background-color`  | Disabled background color                          |
| `--dsn-text-area-disabled-border-color`      | Disabled border color                              |
| `--dsn-text-area-disabled-color`             | Disabled text color                                |
| `--dsn-text-area-focus-background-color`     | Focus background color                             |
| `--dsn-text-area-focus-border-color`         | Focus border color                                 |
| `--dsn-text-area-focus-color`                | Focus text color                                   |
| `--dsn-text-area-invalid-background-color`   | Invalid background color                           |
| `--dsn-text-area-invalid-border-color`       | Invalid border color                               |
| `--dsn-text-area-invalid-color`              | Invalid text color                                 |
| `--dsn-text-area-placeholder-color`          | Placeholder text color                             |
| `--dsn-text-area-read-only-background-color` | Read-only background color                         |
| `--dsn-text-area-read-only-border-color`     | Read-only border color                             |
| `--dsn-text-area-read-only-color`            | Read-only text color                               |
| `--dsn-form-control-width-xs`                | Extra small width (8ch)                            |
| `--dsn-form-control-width-sm`                | Small width (16ch)                                 |
| `--dsn-form-control-width-md`                | Medium width (32ch)                                |
| `--dsn-form-control-width-lg`                | Large width (48ch)                                 |
| `--dsn-form-control-width-xl`                | Extra large width (64ch)                           |
| `--dsn-form-control-width-full`              | Full width (100%)                                  |

## Accessibility

- Altijd een `<label>` koppelen via `htmlFor` of wrap in FormField.
- Invalid state wordt gecommuniceerd via `aria-invalid="true"`.
- Gebruik `aria-describedby` om error messages te koppelen.
- Focus state is duidelijk zichtbaar met border highlight.
- Gebruik nooit een placeholder als vervanging van een label — placeholder tekst is niet zichtbaar zodra de gebruiker typt, en wordt slecht ondersteund door oudere screenreaders.
- Resize handles zijn keyboard toegankelijk in moderne browsers.
- Minimum touch target size van 24x24px volgens WCAG 2.5.5.
