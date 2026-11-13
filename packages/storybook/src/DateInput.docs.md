# DateInput

Een invoerveld voor datums met een interactieve kalenderknop aan de rechterkant.

## Doel

De DateInput component is een gespecialiseerd invoerveld voor het invoeren van een datum. Een interactieve kalenderknop staat rechts in het veld (`inline-end`) en opent de native datumkiezer van de browser of het mobiele apparaat bij klikken. De `padding-inline-end` van het invoerveld wordt automatisch vergroot zodat tekst nooit achter de knop terechtkomt. Het veld heeft een vaste `md`-breedte (20ch): datumvelden hebben een voorspelbare inhoudsbreedte waarvoor dit altijd voldoende is.

<!-- VOORBEELD -->

## Wel gebruiken als...

- Je een datum wilt laten invoeren (bijv. geboortedatum, einddatum, afspraakdatum).
- Je wilt dat gebruikers de native datumkiezer van het apparaat kunnen gebruiken.
- Je een datumveld in een formulier nodig hebt.

## Niet gebruiken als...

- Je een tijdstip wilt invoeren: gebruik dan een [TimeInput](/docs/components-timeinput--docs).
- Je datum én tijd tegelijk wilt invoeren: gebruik dan een `datetime-local` input.

## Goed gebruik

- **Combineer met FormField voor een label.** Gebruik `FormFieldLabel` of `FormField` voor een zichtbaar label.
- **Gebruik een duidelijk label.** Benoem wat de datum betekent (bijv. "Geboortedatum", "Einddatum", "Afspraak").
- **Geef een standaardwaarde mee waar van toepassing.** Dit helpt gebruikers het verwachte formaat te begrijpen.
- **Gebruik `min` en `max` attributen** om het bereik van geldige datums te beperken waar nodig.

## Toegankelijkheid

- De kalenderknop is volledig toetsenbord- en schermlezertoegankelijk. De tekst "Datumkiezer openen" is visueel verborgen via het `dsn-button__label` patroon, maar leesbaar voor screenreaders.
- De extra `padding-inline-end` zorgt ervoor dat ingevoerde tekst nooit over de knop heen loopt.
- In `disabled` en `read-only` staat wordt de kalenderknop niet getoond.

## Opbouw

Een DateInput bestaat uit:

- **Wrapper div**: regelt de breedte en positioneert de knop relatief aan het veld
- **Kalenderknop**: `Button` component (`variant="subtle"`, `size="small"`, `iconOnly`) rechts in het veld, opent de native datumkiezer via `showPicker()`
- **Input element**: `type="date"` met extra padding rechts voor de knop

## Toestanden

- **Default**: Leeg, klaar voor invoer
- **Filled**: Bevat een datum
- **Focus**: Actief, gebruiker typt
- **Hover**: Muis over het veld
- **Disabled**: Niet beschikbaar (kalenderknop verdwijnt)
- **Read-only**: Waarde is zichtbaar maar niet aanpasbaar (kalenderknop verdwijnt)
- **Invalid**: Validatiefout

## Design tokens

<!-- tokens: date-input -->

DateInput erft verder alle tokens van [TextInput](/docs/components-textinput--docs).
