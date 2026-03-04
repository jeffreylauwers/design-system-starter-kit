# Form Field Label

Een label voor form controls met optionele suffix voor "(niet verplicht)" of "(verplicht)".

## Doel

De FormFieldLabel component is een gestandaardiseerd label element voor form controls. Het heeft bold font-weight voor duidelijke hiërarchie en ondersteunt een optionele suffix om optionele of verplichte velden te markeren. De suffix heeft normale font-weight om contrast te maken met het label. Deze component werkt op zowel `<label>` elementen (voor enkelvoudige inputs) als `<legend>` elementen (voor fieldsets met checkboxes/radios) door dezelfde CSS classes te gebruiken. Smart margin spacing: kleinere margin wanneer er een FormFieldDescription volgt.

<!-- VOORBEELD -->

## Use when

- Je een label nodig hebt voor een form control (input, textarea, select, etc.).
- Je duidelijk wilt aangeven of een veld optioneel of verplicht is.
- Je een consistent label patroon wilt in je formulieren.

## Don't use when

- Je een inline label nodig hebt binnen een checkbox/radio — gebruik dan [OptionLabel](/docs/components-optionlabel--docs).
- Je een heading nodig hebt — gebruik [Heading](/docs/components-heading--docs).

## Best practices

### Suffix gebruik

**Vraag alleen broodnodige informatie:**

- Houd formulieren kort en vraag alleen wat echt nodig is.
- Hoe minder velden, hoe lager de drempel om het formulier in te vullen.

**Meeste velden verplicht (standaard scenario):**

- Markeer alleen de **optionele** velden met suffix `"(niet verplicht)"`.
- Verplichte velden krijgen geen suffix (standaard verwachting is verplicht).
- Voorbeeld: inschrijfformulier waar naam en email verplicht zijn, telefoonnummer optioneel.

**Meeste velden optioneel (uitzondering):**

- Markeer alleen de **verplichte** velden met suffix `"(verplicht)"`.
- Optionele velden krijgen geen suffix (standaard verwachting is optioneel).
- Voorbeeld: profielinstellingen waar alles optioneel is behalve wachtwoord.

### Algemeen

- **Gebruik altijd htmlFor.** Koppel het label aan een input via `htmlFor` attribuut (of wrap in FormField).
- **Korte, duidelijke tekst.** Labels moeten bondig zijn (1-3 woorden meestal).
- **Geen dubbele punt.** Gebruik geen ":" aan het einde van labels (is verouderd).
- **Geen verplicht sterretje (\*).** Gebruik de suffix "(verplicht)" in plaats van sterretjes.

## Design tokens

| Token                                                      | Beschrijving                                                |
| ---------------------------------------------------------- | ----------------------------------------------------------- |
| `--dsn-form-field-label-color`                             | Text color                                                  |
| `--dsn-form-field-label-font-family`                       | Font family                                                 |
| `--dsn-form-field-label-font-size`                         | Font size (medium)                                          |
| `--dsn-form-field-label-font-weight`                       | Font weight (bold)                                          |
| `--dsn-form-field-label-line-height`                       | Line height (medium)                                        |
| `--dsn-form-field-label-margin-block-end`                  | Margin below label (medium spacing)                         |
| `--dsn-form-field-label-margin-block-end-with-description` | Margin below label when description follows (small spacing) |
| `--dsn-form-field-label-suffix-color`                      | Suffix text color                                           |
| `--dsn-form-field-label-suffix-font-family`                | Suffix font family                                          |
| `--dsn-form-field-label-suffix-font-size`                  | Suffix font size (same as label)                            |
| `--dsn-form-field-label-suffix-font-weight`                | Suffix font weight (normal, not bold)                       |
| `--dsn-form-field-label-suffix-line-height`                | Suffix line height                                          |
| `--dsn-form-field-label-suffix-margin-inline-start`        | Space between label and suffix (small)                      |

## Accessibility

- Labels zijn essentieel voor accessibility — elke form control moet een label hebben.
- Gebruik `htmlFor` attribuut om label te koppelen aan input (of wrap in FormField).
- Screenreaders lezen het label én de suffix voor.
- Suffix tekst is onderdeel van het label en wordt meegelezen.
- Overweeg aria-required="true" op verplichte velden (naast visuele suffix).
- Labels moeten altijd zichtbaar zijn (geen placeholder-only patterns).
