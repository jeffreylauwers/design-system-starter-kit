# Ordered List

Een lijst met items in een specifieke volgorde, weergegeven met nummers.

## Doel

De OrderedList component biedt een consistente, toegankelijke manier om lijsten met items weer te geven waar de volgorde belangrijk is. De component gebruikt genummerde markers die automatisch worden bijgewerkt, zelfs bij geneste lijsten. OrderedLists ondersteunen HTML attributen zoals `start` (startnummer) en `reversed` (omgekeerde volgorde) en zorgen voor consistente spacing tussen items.

<!-- VOORBEELD -->

## Use when

- Je een reeks stappen of instructies wilt tonen waar de volgorde belangrijk is.
- Je items wilt rangschikken (bijv. top 10 lijst).
- Je naar specifieke stappen wilt verwijzen via hun nummer ("zie stap 3").
- Je geneste geordende lijsten nodig hebt (1.1, 1.2, 2.1, etc.).

## Don't use when

- De volgorde van items niet uitmaakt — gebruik dan de [Unordered List](/docs/components-unorderedlist--docs) component.
- Je maar één enkel item hebt — gebruik dan gewoon tekst of een paragraph.
- De items geen opeenvolgende stappen zijn maar losse punten.

## Best practices

- **Gebruik voor sequenties.** Ordered lists zijn ideaal voor stappen, instructies, procedures, of rankings waar de volgorde betekenis heeft.
- **Houd items actionable.** Voor instructielijsten, start elk item met een werkwoord ("Klik", "Voer in", "Selecteer").
- **Verwijs naar nummers.** Een voordeel van ordered lists is dat je kunt verwijzen naar "stap 2" of "zie punt 3". Gebruik dit voordeel.
- **Gebruik `start` voor gedeelde lijsten.** Als je een lijst opdeelt met tussentekst, gebruik dan `start={n}` om de nummering te continueren.
- **Combineer met andere componenten.** Lijstitems kunnen links, code, of andere inline elementen bevatten.

## Design tokens

| Token                                     | Beschrijving                     |
| ----------------------------------------- | -------------------------------- |
| `--dsn-ordered-list-color`                | Tekstkleur                       |
| `--dsn-ordered-list-font-family`          | Lettertypefamilie                |
| `--dsn-ordered-list-font-size`            | Font size (md)                   |
| `--dsn-ordered-list-font-weight`          | Font weight                      |
| `--dsn-ordered-list-gap`                  | Ruimte tussen list items         |
| `--dsn-ordered-list-line-height`          | Line height                      |
| `--dsn-ordered-list-margin-block-end`     | Bottom margin van de lijst       |
| `--dsn-ordered-list-marker-color`         | Kleur van de nummers             |
| `--dsn-ordered-list-padding-inline-start` | Linker inspringing voor de lijst |

## Accessibility

- De component gebruikt het semantische `<ol>` HTML element voor correcte structuur.
- Screenreaders kondigen het aantal items in de lijst aan.
- Geneste lijsten worden correct aangekondigd als sub-lijsten.
- Het `start` attribuut wordt correct aangekondigd door screenreaders.
- Lijstitems (`<li>`) moeten directe children zijn van `<ol>` voor correcte semantiek.

## HTML attributes

De OrderedList component ondersteunt standaard HTML `<ol>` attributen:

- **start**: Startnummer voor de lijst (bijv. `start={5}` begint bij 5)
- **reversed**: Omgekeerde nummering (van hoog naar laag)
- **type**: Nummeringstijl ("1", "A", "a", "I", "i") — standaard is "1" (decimaal)
