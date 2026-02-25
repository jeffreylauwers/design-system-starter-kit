# TimeInput

Een invoerveld voor tijden met een interactieve klokknop aan de rechterkant.

## Doel

De TimeInput component is een gespecialiseerd invoerveld voor het invoeren van een tijdstip. Een interactieve klokknop staat rechts in het veld (`inline-end`) en opent de native tijdkiezer van de browser of het mobiele apparaat bij klikken. De `padding-inline-end` van het invoerveld wordt automatisch vergroot zodat tekst nooit achter de knop terechtkomt. Het veld heeft een vaste `sm`-breedte (14ch) — tijdvelden hebben een voorspelbare inhoudsbreedte waarvoor dit altijd voldoende is.

<!-- VOORBEELD -->

## Use when

- Je een tijdstip wilt laten invoeren (bijv. aanvangstijd, eindtijd, afspraak).
- Je wilt dat gebruikers de native tijdkiezer van het apparaat kunnen gebruiken.
- Je een tijdveld in een formulier nodig hebt.

## Don't use when

- Je een datumveld nodig hebt — gebruik dan een DateInput.
- Je datum én tijd tegelijk wilt invoeren — gebruik dan een datetime-local input.

## Best practices

- **Combineer met FormField voor een label.** Gebruik `FormFieldLabel` of `FormField` voor een zichtbaar label.
- **Gebruik een duidelijk label.** Benoem wat de tijd betekent (bijv. "Starttijd", "Eindtijd", "Afspraak").
- **Geef een standaardwaarde mee waar van toepassing.** Dit helpt gebruikers het verwachte formaat te begrijpen.

## Accessibility

- De klokknop is volledig toetsenbord- en schermlezertoegankelijk. De tekst "Tijdkiezer openen" is visueel verborgen via het `dsn-button__label` patroon, maar leesbaar voor screenreaders.
- De extra `padding-inline-end` zorgt ervoor dat ingevoerde tekst nooit over de knop heen loopt.
- In `disabled` en `read-only` staat wordt de klokknop niet getoond.

## Anatomy

Een TimeInput bestaat uit:

- **Wrapper div** — regelt de breedte en positioneert de knop relatief aan het veld
- **Klokknop** — `Button` component (`variant="subtle"`, `size="small"`, `iconOnly`) rechts in het veld, opent de native tijdkiezer via `showPicker()`
- **Input element** — `type="time"` met extra padding rechts voor de knop

## States

- **Default**: Leeg, klaar voor invoer
- **Filled**: Bevat een tijd
- **Focus**: Actief, gebruiker typt
- **Hover**: Muis over het veld
- **Disabled**: Niet beschikbaar (klokknop verdwijnt)
- **Read-only**: Waarde is zichtbaar maar niet aanpasbaar (klokknop verdwijnt)
- **Invalid**: Validatiefout

## Design tokens

| Token                                           | Beschrijving                                                          |
| ----------------------------------------------- | --------------------------------------------------------------------- |
| `--dsn-time-input-padding-inline-end-with-icon` | Berekende padding rechts: `icon-size + icon-gap + padding-inline-end` |

TimeInput erft verder alle tokens van [TextInput](/docs/components-textinput--docs):

| Token                                        | Beschrijving              |
| -------------------------------------------- | ------------------------- |
| `--dsn-text-input-color`                     | Tekstkleur                |
| `--dsn-text-input-font-family`               | Lettertypefamilie         |
| `--dsn-text-input-font-size`                 | Font size                 |
| `--dsn-text-input-font-weight`               | Font weight               |
| `--dsn-text-input-line-height`               | Line height               |
| `--dsn-text-input-background-color`          | Achtergrondkleur          |
| `--dsn-text-input-border-color`              | Borderkleur default state |
| `--dsn-text-input-border-width`              | Dikte van de border       |
| `--dsn-text-input-border-radius`             | Border radius             |
| `--dsn-text-input-padding-block-start`       | Padding boven             |
| `--dsn-text-input-padding-block-end`         | Padding onder             |
| `--dsn-text-input-hover-border-color`        | Borderkleur hover state   |
| `--dsn-text-input-focus-border-color`        | Borderkleur focus state   |
| `--dsn-text-input-disabled-background-color` | Achtergrondkleur disabled |
| `--dsn-text-input-disabled-color`            | Tekstkleur disabled       |
| `--dsn-text-input-invalid-border-color`      | Borderkleur invalid state |
| `--dsn-text-input-placeholder-color`         | Placeholder tekstkleur    |
