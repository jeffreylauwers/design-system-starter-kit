# Form Field Status

Status bericht dat onder de form control wordt getoond met drie varianten: default, positive, en warning.

## Doel

De FormFieldStatus component toont status informatie onder een form control. Het ondersteunt drie varianten: **default** (subtiele tekst zonder icoon voor neutrale info zoals character counters), **positive** (groene tekst met check icoon voor success feedback), en **warning** (oranje tekst met alert-triangle icoon voor waarschuwingen). De component komt altijd onder de form control (na de input/textarea), niet erboven zoals FormFieldErrorMessage. Default variant is altijd zichtbaar, positive en warning verschijnen na interactie/validatie.

<!-- VOORBEELD -->

## Use when

- **Default:** Character counters, format hints, algemene info die altijd zichtbaar is.
- **Positive:** Success feedback na validatie ("Wachtwoord is sterk", "Gebruikersnaam beschikbaar").
- **Warning:** Waarschuwingen die geen blokkerende errors zijn ("Wachtwoord is zwak", "Dit veld is openbaar").

## Don't use when

- Je een blokkerende fout wilt tonen — gebruik [FormFieldErrorMessage](/docs/components-formfielderrormessage--docs) (negatieve variant).
- Je algemene help tekst wilt tonen — gebruik [FormFieldDescription](/docs/components-formfielddescription--docs) (komt boven de input).
- Je informatieve context wilt geven — gebruik FormFieldDescription (informatie variant is hetzelfde als description).

## Best practices

### Variant keuze

**Default variant:**

- Altijd zichtbare, neutrale informatie
- Character counters ("45 van 100 karakters")
- Format hints ("Gebruik formaat DD-MM-JJJJ")
- Geen icoon (houd het subtiel)

**Positive variant:**

- Na succesvolle validatie
- Confirmatieve feedback ("E-mailadres geverifieerd")
- Real-time feedback tijdens typen ("Wachtwoord is sterk genoeg")
- Heeft check icoon voor positieve nadruk

**Warning variant:**

- Niet-blokkerende waarschuwingen
- Zwakke maar toegestane waarden ("Wachtwoord is zwak maar geldig")
- Privacy waarschuwingen ("Let op: dit veld is openbaar")
- Heeft alert-triangle icoon voor aandacht

### Timing

- **Default:** Altijd zichtbaar vanaf het begin
- **Positive/Warning:** Toon na interactie (tijdens typen of na blur)
- **Update dynamisch:** Character counters en strength indicators updaten real-time
- **Verberg bij errors:** Als er een FormFieldErrorMessage is, verberg dan de status

### Content

- **Kort en duidelijk:** 1 zin meestal
- **Real-time info:** Bij counters, toon actuele waarden
- **Positieve toon:** Ook bij warnings, focus op oplossing

### Technisch

- **Icon default aan:** Voor positive/warning, laat icoon zichtbaar (default `showIcon={true}`)
- **Positionering:** Status komt onder de input, ErrorMessage komt boven de input
- **aria-describedby:** Geef status een `id` en koppel aan form control indien nuttig
- **Combineer slim:** Default status (counter) + positive/warning feedback kan samen

## Design tokens

| Token                                        | Beschrijving                            |
| -------------------------------------------- | --------------------------------------- |
| `--dsn-form-field-status-color`              | Text color default variant (subtle)     |
| `--dsn-form-field-status-font-family`        | Font family                             |
| `--dsn-form-field-status-font-size`          | Font size (medium)                      |
| `--dsn-form-field-status-font-weight`        | Font weight (normal)                    |
| `--dsn-form-field-status-line-height`        | Line height (medium)                    |
| `--dsn-form-field-status-margin-block-start` | Margin above status (medium spacing)    |
| `--dsn-color-positive-color-default`         | Text color positive variant (green)     |
| `--dsn-color-warning-color-default`          | Text color warning variant (orange)     |
| `--dsn-icon-size-md`                         | Icon size for positive/warning variants |
| `--dsn-space-text-sm`                        | Gap between icon and text               |

## Accessibility

- Default variant heeft subtiele kleur maar nog voldoende contrast.
- Positive en warning varianten hebben duidelijke kleuren voor zichtbaarheid.
- Gebruik `id` attribuut en koppel met `aria-describedby` indien de status essentiële info bevat.
- Icons hebben `aria-hidden="true"` omdat de tekst zelf voldoende context geeft.
- Kleur alleen is niet voldoende — de icons helpen bij kleurenblindheid.
- Bij character limits, update aria-live regions voor screenreader feedback.
