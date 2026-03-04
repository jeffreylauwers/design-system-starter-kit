# Text Input

Een single-line tekst invoerveld met ondersteuning voor verschillende states en width varianten.

## Doel

De TextInput component is een gestandaardiseerd invoerveld voor single-line tekst. Het ondersteunt alle native input types (text, email, url, tel, etc.) en heeft consistent styling voor alle interaction states (hover, focus, disabled, invalid, read-only). De component heeft verschillende width varianten die je kunt instellen met de `width` prop, zodat de breedte semantisch past bij het type data (postcode = xs, email = md, URL = lg). Default styling gebruikt character-based widths (ch units) voor voorspelbare sizing onafhankelijk van font-size.

<!-- VOORBEELD -->

## Use when

- Je een single-line tekst invoer nodig hebt (naam, email, URL, etc.).
- Je native HTML input types wilt gebruiken met consistente styling.
- Je de breedte semantisch wilt aanpassen aan het type data.

## Don't use when

- Je multi-line tekst invoer nodig hebt — gebruik dan [TextArea](/docs/components-textarea--docs).
- Je gespecialiseerde inputs nodig hebt — gebruik NumberInput, EmailInput, etc.
- Je alleen een label nodig hebt — gebruik FormFieldLabel.

## Best practices

- **Kies de juiste width.** Gebruik `width` om de breedte aan te passen aan het type data:
  - `xs` (10ch) - Zeer korte codes (postcode, jaar, CVV)
  - `sm` (14ch) - Korte invoer (tijdstip, korte codes)
  - `md` (20ch) - Medium invoer (datum, telefoonnummer)
  - `lg` (32ch) - Standaard (naam, email) - **DEFAULT**
  - `xl` (48ch) - Langere tekst (URL)
  - `full` (100%) - Responsive, neemt volledige breedte
- **Gebruik het juiste type.** Gebruik native input types: `email`, `url`, `tel`, `search`, etc.
- **Vermijd placeholders.** Placeholder tekst verdwijnt zodra de gebruiker begint te typen — daarna is de informatie niet meer zichtbaar. Bovendien kan de lage contrast van placeholders het veld er ingevuld laten uitzien. Gebruik [FormFieldDescription](/docs/components-formfielddescription--docs) voor hints over het verwachte formaat of type data.
- **Labels zijn verplicht.** Wrap in FormField met FormFieldLabel voor accessibility.
- **Invalid state alleen na interactie.** Toon invalid state alleen na blur of submit, niet direct.
- **Disabled vs read-only.** Gebruik `disabled` als veld niet beschikbaar is, `readOnly` als waarde niet aangepast mag worden.

## Width varianten

| Variant | Width | Gebruik                                            |
| ------- | ----- | -------------------------------------------------- |
| `xs`    | 10ch  | Zeer korte codes (postcode "1234 AB", CVV "123")   |
| `sm`    | 14ch  | Korte invoer (tijdstip "14:30", korte codes)       |
| `md`    | 20ch  | Medium invoer (datum "15-03-2025", telefoonnummer) |
| `lg`    | 32ch  | **Standaard** - naam, email, etc.                  |
| `xl`    | 48ch  | Langere tekst (URL "https://example.com")          |
| `full`  | 100%  | Responsive, past zich aan container                |

## Design tokens

| Token                                         | Beschrijving                            |
| --------------------------------------------- | --------------------------------------- |
| `--dsn-text-input-background-color`           | Background color                        |
| `--dsn-text-input-border-color`               | Border color                            |
| `--dsn-text-input-border-radius`              | Border radius                           |
| `--dsn-text-input-border-width`               | Border width                            |
| `--dsn-text-input-color`                      | Text color                              |
| `--dsn-text-input-font-family`                | Font family                             |
| `--dsn-text-input-font-size`                  | Font size                               |
| `--dsn-text-input-font-weight`                | Font weight                             |
| `--dsn-text-input-line-height`                | Line height                             |
| `--dsn-text-input-min-block-size`             | Minimum height (WCAG 24px touch target) |
| `--dsn-text-input-min-inline-size`            | Minimum width (WCAG 24px touch target)  |
| `--dsn-text-input-padding-block-end`          | Bottom padding                          |
| `--dsn-text-input-padding-block-start`        | Top padding                             |
| `--dsn-text-input-padding-inline-end`         | Right padding                           |
| `--dsn-text-input-padding-inline-start`       | Left padding                            |
| `--dsn-text-input-disabled-background-color`  | Disabled background color               |
| `--dsn-text-input-disabled-border-color`      | Disabled border color                   |
| `--dsn-text-input-disabled-color`             | Disabled text color                     |
| `--dsn-text-input-focus-background-color`     | Focus background color                  |
| `--dsn-text-input-focus-border-color`         | Focus border color                      |
| `--dsn-text-input-focus-color`                | Focus text color                        |
| `--dsn-text-input-invalid-background-color`   | Invalid background color                |
| `--dsn-text-input-invalid-border-color`       | Invalid border color                    |
| `--dsn-text-input-invalid-color`              | Invalid text color                      |
| `--dsn-text-input-placeholder-color`          | Placeholder text color                  |
| `--dsn-text-input-read-only-background-color` | Read-only background color              |
| `--dsn-text-input-read-only-border-color`     | Read-only border color                  |
| `--dsn-text-input-read-only-color`            | Read-only text color                    |
| `--dsn-form-control-width-xs`                 | Extra small width (10ch)                |
| `--dsn-form-control-width-sm`                 | Small width (14ch)                      |
| `--dsn-form-control-width-md`                 | Medium width (20ch)                     |
| `--dsn-form-control-width-lg`                 | Large width (32ch)                      |
| `--dsn-form-control-width-xl`                 | Extra large width (48ch)                |
| `--dsn-form-control-width-full`               | Full width (100%)                       |

## Accessibility

- Altijd een `<label>` koppelen via `htmlFor` of wrap in FormField.
- Invalid state wordt gecommuniceerd via `aria-invalid="true"`.
- Gebruik `aria-describedby` om error messages te koppelen.
- Focus state is duidelijk zichtbaar met border highlight.
- Gebruik nooit een placeholder als vervanging van een label — placeholder tekst is niet zichtbaar zodra de gebruiker typt, en wordt slecht ondersteund door oudere screenreaders.
- Minimum touch target size van 24x24px volgens WCAG 2.5.5.
