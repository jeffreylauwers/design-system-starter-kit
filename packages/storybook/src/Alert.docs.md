# Alert

Belangrijk bericht dat de gebruiker informeert over de huidige activiteit of toestand.

## Doel

De Alert component toont een prominent bericht op de pagina — bij een succesvolle actie, een foutmelding, een waarschuwing of een informatief bericht. Vier varianten — **info**, **positive**, **negative** en **warning** — geven elk een eigen signaalkleur, linkerborder en achtergrond. Een decoratief icoon versterkt de status visueel, maar de heading draagt altijd de betekenis.

<!-- VOORBEELD -->

## Use when

- Een gebruiker feedback geven na een actie (formulier ingediend, fout, sessiewaarschuwing).
- Een pagina-breed bericht tonen dat de aandacht vraagt maar geen interactie vereist.
- Validatiefouten samenvatten bovenaan een formulier (negative variant met lijst).
- Contextuele informatie geven die relevant is voor de huidige stap of pagina.

## Don't use when

- De informatie één regel tekst is zonder heading — gebruik een **StatusBadge** of **FormFieldStatus**.
- Het bericht interactief is (bijv. een link of knop vereist) — gebruik een **Alert** met `children` die een link bevatten, of een **Button** als de actie centraal staat.
- Je een klein inline statuslabel wilt — gebruik een **StatusBadge**.
- Het bericht tijdelijk is en na enkele seconden verdwijnt — gebruik een toast/snackbar patroon (nog niet beschikbaar).

## Best practices

### Variantkeuze

- **Info** — standaard, voor informatieve berichten zonder urgentie (`"Uw aanvraag wordt verwerkt"`).
- **Positive** — succesberichten na een geslaagde actie (`"Uw gegevens zijn opgeslagen"`).
- **Negative** — fout- of validatieberichten (`"Er zijn fouten opgetreden"`).
- **Warning** — waarschuwingen die aandacht vragen maar niet blokkerend zijn (`"Uw sessie verloopt binnenkort"`).

### Icoon

- Gebruik de aanbevolen iconen per variant voor consistentie:
  - **info** → `info-circle`
  - **positive** → `circle-check`
  - **negative** → `exclamation-circle`
  - **warning** → `alert-triangle`
- Het icoon is altijd decoratief (`aria-hidden="true"`) — de heading draagt de betekenis.
- Gebruik `iconStart={null}` om het icoon te onderdrukken bij compacte weergave.

### Heading

- De heading is verplicht — het is de primaire informatiedrager.
- Houd de heading beknopt: één zin die de kern van het bericht weergeeft.
- Pas `headingLevel` aan op de documentstructuur (standaard `h2`).

### Content

- Body content (`children`) is optioneel. Gebruik het voor aanvullende uitleg, een opsomming van validatiefouten of een link.
- Bij een lijst met validatiefouten: gebruik een `<ul>` in `children` met één fout per `<li>`.
- Zet geen interactieve elementen in de heading — gebruik `children` voor links of acties.

### Live regions

- `role="alert"` is altijd aanwezig — het is een assertieve live region.
- Gebruik Alert **alleen voor dynamisch toegevoegde berichten** die verschijnen na een gebruikersactie. Bij statische inhoud (al aanwezig bij paginalading) voegt `role="alert"` geen waarde toe.
- Omsluit de Alert met `aria-live="polite"` als je minder urgente meldingen wilt (experimenteel — heeft voorrang op `role="alert"`).

## Design tokens

| Token                                   | Beschrijving                                          |
| --------------------------------------- | ----------------------------------------------------- |
| `--dsn-alert-border-radius`             | Border radius (0px by default; thema-overschrijfbaar) |
| `--dsn-alert-border-width`              | Breedte van de border                                 |
| `--dsn-alert-column-gap`                | Ruimte tussen icoon en tekst                          |
| `--dsn-alert-icon-size`                 | Icoongrootte (ook breedte eerste grid-kolom)          |
| `--dsn-alert-padding-block`             | Verticale padding                                     |
| `--dsn-alert-padding-inline`            | Horizontale padding                                   |
| `--dsn-alert-row-gap`                   | Ruimte tussen heading en body content                 |
| `--dsn-alert-info-background-color`     | Achtergrond info variant                              |
| `--dsn-alert-info-border-color`         | Borderkleur info variant                              |
| `--dsn-alert-info-color`                | Tekstkleur info variant                               |
| `--dsn-alert-info-icon-color`           | Icoonkleur info variant                               |
| `--dsn-alert-negative-background-color` | Achtergrond negative variant                          |
| `--dsn-alert-negative-border-color`     | Borderkleur negative variant                          |
| `--dsn-alert-negative-color`            | Tekstkleur negative variant                           |
| `--dsn-alert-negative-icon-color`       | Icoonkleur negative variant                           |
| `--dsn-alert-positive-background-color` | Achtergrond positive variant                          |
| `--dsn-alert-positive-border-color`     | Borderkleur positive variant                          |
| `--dsn-alert-positive-color`            | Tekstkleur positive variant                           |
| `--dsn-alert-positive-icon-color`       | Icoonkleur positive variant                           |
| `--dsn-alert-warning-background-color`  | Achtergrond warning variant                           |
| `--dsn-alert-warning-border-color`      | Borderkleur warning variant                           |
| `--dsn-alert-warning-color`             | Tekstkleur warning variant                            |
| `--dsn-alert-warning-icon-color`        | Icoonkleur warning variant                            |

## Accessibility

- `role="alert"` maakt de component een assertieve live region — screenreaders lezen het voor zodra het in de DOM verschijnt.
- Het icoon heeft altijd `aria-hidden="true"` — de heading is de informatiedrager.
- De heading (`<strong class="dsn-alert__heading">`) geeft semantisch gewicht aan het bericht.
- Pas `headingLevel` aan op de documenthiërarchie zodat de heading in de juiste nesting valt.
- Alert is niet klikbaar — voor interactieve alertberichten: voeg links of knoppen toe via `children`.
