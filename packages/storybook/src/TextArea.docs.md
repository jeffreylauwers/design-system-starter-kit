# Text Area

Een multi-line tekst invoerveld met ondersteuning voor verschillende states en inline-size varianten.

## Doel

De TextArea component is een gestandaardiseerd invoerveld voor multi-line tekst. Het ondersteunt resize gedrag (standaard vertical), verschillende row heights, en heeft consistent styling voor alle interaction states (hover, focus, disabled, invalid, read-only). De component heeft verschillende inline-size varianten die je kunt instellen met de `inlineSize` prop. Vertical resizing is standaard ingeschakeld maar wordt uitgeschakeld bij disabled state. Default height wordt bepaald door het `rows` attribuut (standaard 4 regels).

<!-- VOORBEELD -->

## Wel gebruiken als...

- Je multi-line tekst invoer nodig hebt (beschrijving, opmerking, bio).
- Je gebruikers meerdere regels tekst wilt laten invoeren.
- Je resize gedrag wilt toestaan voor grotere teksten.

## Niet gebruiken als...

- Je single-line tekst invoer nodig hebt: gebruik dan [TextInput](/docs/components-textinput--docs).
- Je rich text editing nodig hebt: overweeg een rich text editor component.
- Je alleen een label nodig hebt: gebruik FormFieldLabel.

## Goed gebruik

- **Kies de juiste height.** Gebruik `rows` om de standaard hoogte aan te passen:
  - `rows={2-3}` - Korte berichten, opmerkingen
  - `rows={4-6}` - Standaard berichten, beschrijvingen (4 is default)
  - `rows={8+}` - Lange teksten, artikelen
- **Kies de juiste inline-size.** Gebruik `inlineSize` om de inline-size aan te passen. `xs` en `sm` bestaan bij TextArea niet: die zijn te smal voor meerdere regels tekst.
  - `md` (20ch) - Korte teksten
  - `lg` (32ch) - Langere teksten
  - `xl` (48ch) - Zeer lange teksten
  - `full` (100%) - Responsive, neemt volledige inline-size
- **Labels zijn verplicht.** Wrap in FormField met FormFieldLabel voor accessibility.
- **Resize gedrag.** Standaard vertical resizing, automatisch disabled bij disabled state.
- **Invalid state alleen na interactie.** Toon invalid state alleen na blur of submit.
- **Vermijd placeholders.** Placeholder tekst verdwijnt zodra de gebruiker begint te typen: daarna is de informatie niet meer zichtbaar. Bovendien kan de lage contrast van placeholders het veld er ingevuld laten uitzien. Gebruik [FormFieldDescription](/docs/components-formfielddescription--docs) voor hints over het verwachte formaat of inhoud.
- **Character/word limits.** Overweeg een character counter te tonen bij lange teksten.

## Richtlijnen voor rijhoogte

| Rows | Gebruik                                                 |
| ---- | ------------------------------------------------------- |
| 2-3  | Korte berichten, opmerkingen, vragen                    |
| 4-6  | **Standaard** - beschrijvingen, feedback (4 is default) |
| 8+   | Lange teksten, artikelen, uitgebreide beschrijvingen    |

## Inline-size varianten

| Variant | Inline-size | Gebruik                             |
| ------- | ----------- | ----------------------------------- |
| `md`    | 20ch        | Korte tot medium teksten            |
| `lg`    | 32ch        | Langere teksten                     |
| `xl`    | 48ch        | Zeer lange teksten                  |
| `full`  | 100%        | Responsive, past zich aan container |

## Design tokens

<!-- tokens: text-area --dsn-form-control-inline-size-md --dsn-form-control-inline-size-lg --dsn-form-control-inline-size-xl --dsn-form-control-inline-size-full -->

## Toegankelijkheid

- Altijd een `<label>` koppelen via `htmlFor` of wrap in FormField.
- Invalid state wordt gecommuniceerd via `aria-invalid="true"`.
- Gebruik `aria-describedby` om error messages te koppelen.
- Focus state is duidelijk zichtbaar met border highlight.
- Gebruik nooit een placeholder als vervanging van een label: placeholder tekst is niet zichtbaar zodra de gebruiker typt, en wordt slecht ondersteund door oudere screenreaders.
- Resize handles zijn keyboard toegankelijk in moderne browsers.
- Minimum touch target size van 24x24px volgens WCAG 2.5.5.
