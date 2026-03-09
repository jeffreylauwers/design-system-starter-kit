# Table

Toegankelijke datatable voor het weergeven van tweedimensionale tabeldata met kolomkoppen, optionele rijkoppen, voettekst en sorteerfunctionaliteit.

## Doel

De Table component structureert tabeldata semantisch correct zodat schermlezers kolom- en rijrelaties automatisch voorlezen. Borders (geen achtergrondkleuren) zorgen voor visuele scheiding. Een optionele `<tfoot>` biedt een stijlvaste plek voor samenvattings- of totaalrijen. Sorteerknoppen gebruiken de bestaande `dsn-button--size-small dsn-button--subtle` stijlen, aangevuld met `dsn-table__sort-button` voor tabelspecifieke overrides.

<!-- VOORBEELD -->

## Use when

- Tabulaire data weergeven met een duidelijke kolomstructuur.
- Data vergelijken over meerdere dimensies (rijen × kolommen).
- Een overzicht tonen waarbij kolommen gesorteerd kunnen worden.
- Een totaal- of samenvattingsrij toevoegen onderaan de tabel.

## Don't use when

- De data één-dimensionaal is — gebruik een lijst (`UnorderedList`, `OrderedList`).
- Je paginalayout wilt opbouwen — gebruik `Grid` of `Stack`.
- Er slechts één kolom is zonder relationele data — gebruik een lijst of `Paragraph`.

## Best practices

### Caption

De `caption` prop is verplicht. Het bijschrift is zichtbaar boven de tabel en dient als toegankelijke naam voor schermlezers. Bij `scrollable` wordt de caption-ID ook gebruikt voor `aria-labelledby` op de scroll-container.

### Kolomkoppen en rijkoppen

Gebruik altijd `<th scope="col">` voor kolomkoppen en `<th scope="row">` voor rijkoppen. Gebruik nooit een gestylede `<td>` als vervanging — `scope` is essentieel voor schermlezersnavigatie.

### Voettekst (`<tfoot>`)

Voeg `<tfoot>` toe als children voor een totaal- of samenvattingsrij. De stijl (vetgedrukte tekst, sterkere bovenborder) wordt automatisch via CSS toegepast — geen aparte prop nodig.

```html
<tfoot>
  <tr>
    <th scope="row">Totaal</th>
    <td>—</td>
    <td>130</td>
  </tr>
</tfoot>
```

### Scrollable tabellen

Gebruik `scrollable` voor tabellen die potentieel breder zijn dan hun container. De tabel wordt gewikkeld in een `<div role="region" aria-labelledby="..." tabindex="0">` zodat toetsenbordgebruikers horizontaal kunnen scrollen.

### Sorteerknoppen

Sorteerfunctionaliteit (state management, data manipulatie) valt buiten de scope van dit component. De HTML/CSS biedt de markup-patronen:

- Voeg `aria-sort="ascending"`, `aria-sort="descending"` of `aria-sort="none"` toe aan `<th>` elementen die sorteerbaar zijn.
- Laat `aria-sort` weg op niet-sorteerbare kolommen.
- Gebruik `dsn-button dsn-button--size-small dsn-button--subtle dsn-button--icon-only dsn-table__sort-button` als klasse op de knop.
- Geef de knop een toegankelijke naam via `dsn-button__label` — gebruik geen `aria-label`.
- Voeg drie sorteericonen toe in de knop — de CSS toont het juiste icoon op basis van `aria-sort`:

```html
<th scope="col" aria-sort="ascending">
  <span class="dsn-table__header-content">
    Naam
    <button
      class="dsn-button dsn-button--size-small dsn-button--subtle dsn-button--icon-only dsn-table__sort-button"
      type="button"
    >
      <svg class="dsn-icon dsn-table__sort-icon--none" aria-hidden="true">
        <!-- arrows-sort -->
      </svg>
      <svg class="dsn-icon dsn-table__sort-icon--ascending" aria-hidden="true">
        <!-- sort-ascending -->
      </svg>
      <svg class="dsn-icon dsn-table__sort-icon--descending" aria-hidden="true">
        <!-- sort-descending -->
      </svg>
      <span class="dsn-button__label">Sorteer op Naam</span>
    </button>
  </span>
</th>
```

### Numerieke kolommen

Voeg de klasse `dsn-table__cell--numeric` toe aan `<th>` en `<td>` voor kolommen met cijfers of geldbedragen. Dit lijnt de inhoud rechts uit en gebruikt `font-variant-numeric: tabular-nums` zodat getallen netjes onder elkaar uitlijnen.

```html
<th scope="col" class="dsn-table__cell--numeric">Prijs</th>
<!-- ... -->
<td class="dsn-table__cell--numeric">€999</td>
```

## Design tokens

| Token                                         | Beschrijving                                   |
| --------------------------------------------- | ---------------------------------------------- |
| `--dsn-table-caption-color`                   | Tekstkleur van het bijschrift                  |
| `--dsn-table-caption-font-family`             | Lettertype van het bijschrift (heading font)   |
| `--dsn-table-caption-font-size`               | Lettergrootte van het bijschrift               |
| `--dsn-table-caption-font-weight`             | Gewicht van het bijschrift                     |
| `--dsn-table-caption-line-height`             | Regelafstand van het bijschrift                |
| `--dsn-table-cell-padding-block-start`        | Verticale padding bovenkant van cellen         |
| `--dsn-table-cell-padding-block-end`          | Verticale padding onderkant van cellen         |
| `--dsn-table-cell-padding-inline-start`       | Horizontale padding begin van cellen           |
| `--dsn-table-cell-padding-inline-end`         | Horizontale padding einde van cellen           |
| `--dsn-table-header-background-color`         | Achtergrondkleur van de header (`transparent`) |
| `--dsn-table-header-border-block-end-color`   | Kleur van de scheiding onder de header         |
| `--dsn-table-header-border-block-end-width`   | Breedte van de scheiding onder de header (2px) |
| `--dsn-table-header-color`                    | Tekstkleur van de header                       |
| `--dsn-table-header-cell-font-weight`         | Gewicht van kolomkoppen en rijkoppen           |
| `--dsn-table-row-border-block-end-color`      | Kleur van de rij-scheiding in de body          |
| `--dsn-table-row-border-block-end-width`      | Breedte van de rij-scheiding in de body (1px)  |
| `--dsn-table-footer-background-color`         | Achtergrondkleur van de footer (`transparent`) |
| `--dsn-table-footer-border-block-start-color` | Kleur van de scheiding boven de footer         |
| `--dsn-table-footer-border-block-start-width` | Breedte van de scheiding boven de footer (2px) |
| `--dsn-table-footer-color`                    | Tekstkleur van de footer                       |
| `--dsn-table-footer-font-weight`              | Gewicht van footercellen (vet)                 |
| `--dsn-table-wrapper-scroll-shadow-color`     | Kleur van de scroll-affordance schaduw         |

## Accessibility

- Gebruik **altijd** `scope="col"` op kolomkoppen en `scope="row"` op rijkoppen — dit is de kern van toegankelijke tabellen. Zonder `scope` kunnen schermlezers de relatie tussen cellen en koppen niet vaststellen.
- De `<caption>` staat altijd als eerste kind van `<table>` en is zowel zichtbaar als machine-leesbaar.
- Bij `scrollable`: de wrapper krijgt `role="region"` en `aria-labelledby` zodat schermlezers de scrollbare regio kunnen herkennen en benoemen.
- Sorteericonen zijn **altijd** decoratief (`aria-hidden="true"`). De sorteerknop heeft een toegankelijke naam via `dsn-button__label` — bijv. `"Sorteer op Naam"`. Gebruik geen `aria-label`. De `aria-sort` waarde op `<th>` communiceert de sorteerrichting; de richting hoef je niet te herhalen in de `dsn-button__label`.
- Gebruik **nooit** `display: grid` of `display: flex` op tabel-elementen — dit verwijdert de ingebouwde toegankelijkheidssemantiek van de browser.
- Schermlezers (NVDA, JAWS) navigeren door tabellen met `Ctrl+Alt+pijltjestoetsen`. Bij elke cel wordt de bijbehorende kolomkop en/of rijkop automatisch voorgelezen.
- Maak individuele cellen (`<td>`, `<th>`) nooit focusbaar via `tabindex` — dit belemmert de standaard schermlezernavigatie.
