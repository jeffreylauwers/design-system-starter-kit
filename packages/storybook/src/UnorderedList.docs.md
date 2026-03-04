# Unordered List

Een lijst met items zonder specifieke volgorde, weergegeven met bullets.

## Doel

De UnorderedList component biedt een consistente, toegankelijke manier om lijsten met items weer te geven waar de volgorde niet belangrijk is. De component gebruikt gekleurde bullet markers (via design tokens) om visueel onderscheid te maken met lopende tekst. UnorderedLists ondersteunen geneste lijsten en zorgen voor consistente spacing tussen items.

<!-- VOORBEELD -->

## Use when

- Je een groep gerelateerde items wilt tonen waar de volgorde niet uitmaakt.
- Je opties, kenmerken, of eigenschappen wilt opsommen.
- Je een navigatiemenu wilt structureren (samen met links).
- Je geneste hiërarchieën wilt weergeven (lijsten binnen lijsten).

## Don't use when

- De volgorde van items belangrijk is — gebruik dan de [Ordered List](/docs/components-orderedlist--docs) component.
- Je maar één enkel item hebt — gebruik dan gewoon tekst of een paragraph.
- De items interactieve acties zijn — overweeg dan een menu of button group.
- Je tabeldata wilt tonen — gebruik dan een tabel.

## Best practices

- **Houd items compact en scanbaar.** Lijstitems moeten kort en duidelijk zijn. Voor lange beschrijvingen, overweeg aparte paragraphs of secties.
- **Gebruik consequent.** Als je ergens een lijst gebruikt voor een bepaald type content, doe dat dan overal.
- **Beperk geneste diepte.** Meer dan 3 niveaus diep kan moeilijk te volgen zijn. Overweeg dan de structuur te vereenvoudigen.
- **Combineer met andere componenten.** Lijstitems kunnen links, inline code, of andere inline elementen bevatten.
- **Gebruik parallelle grammatica.** Start elk item met hetzelfde type woord (bijv. alle werkwoorden, of alle zelfstandige naamwoorden).

## Design tokens

| Token                                       | Beschrijving                               |
| ------------------------------------------- | ------------------------------------------ |
| `--dsn-unordered-list-color`                | Tekstkleur                                 |
| `--dsn-unordered-list-font-family`          | Lettertypefamilie                          |
| `--dsn-unordered-list-font-size`            | Font size (md)                             |
| `--dsn-unordered-list-font-weight`          | Font weight                                |
| `--dsn-unordered-list-gap`                  | Ruimte tussen list items                   |
| `--dsn-unordered-list-line-height`          | Line height                                |
| `--dsn-unordered-list-margin-block-end`     | Bottom margin van de lijst                 |
| `--dsn-unordered-list-marker-color`         | Kleur van de bullet markers (accent kleur) |
| `--dsn-unordered-list-padding-inline-start` | Linker inspringing voor de lijst           |

## Accessibility

- De component gebruikt het semantische `<ul>` HTML element voor correcte structuur.
- Screenreaders kondigen het aantal items in de lijst aan.
- Geneste lijsten worden correct aangekondigd als sub-lijsten.
- Lijstitems (`<li>`) moeten directe children zijn van `<ul>` voor correcte semantiek.
