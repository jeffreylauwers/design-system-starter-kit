# File

Toont meta-informatie over een bestand (naam, type, grootte) samen met contextafhankelijke acties.

## Doel

File geeft feedback aan de gebruiker over een geselecteerd of geüpload bestand. Het component toont inline-start een gekleurd media-vlak met een bestandsicoon of afbeeldingspreview, gevolgd door de bestandsnaam en meta-informatie (type, grootte). Inline-end staan contextafhankelijke acties: een verwijderknop, een laadindicator, of een bevestigingsicoon.

File ondersteunt vier upload-states (`default`, `loading`, `uploaded`, `error`) en een interactieve variant voor gebruik op controle- of detailpagina's.

<!-- VOORBEELD -->

## Use when

- De gebruiker een bestand heeft geselecteerd of geüpload binnen een formulier, en feedback nodig heeft over de status. Gebruik `File` dan samen met `FileInput`, zie het patroon **Bestanden uploaden** onder Patronen/Formulieren en het template **Form step: Upload**.
- Een eerder geüpload bestand getoond wordt op een controlepagina van een meerstappenformulier, met de mogelijkheid het te bekijken of te downloaden.
- Een downloadbaar bestand aangeboden wordt op een detailpagina.

## Don't use when

- Je enkel een link naar een bestand wilt tonen zonder visueel onderscheid of acties. Gebruik in dat geval een gewone `Link`.

## Best practices

### Bestandsnaam zonder extensie

De bestandsnaam wordt visueel **zonder extensie** getoond. De extensie staat al in het type-veld in de meta (`PDF · 1,2 MB`). De volledige bestandsnaam inclusief extensie wordt gebruikt in de visueel verborgen tekst van de verwijderknop en de `aria-live` aankondiging.

### Verwijderknop — nooit `aria-label`

De verwijderknop bevat altijd de volledige bestandsnaam als visueel verborgen tekst, zodat screenreaders de context begrijpen. Gebruik nooit `aria-label` op de knop.

```html
<button
  type="button"
  class="dsn-button dsn-button--subtle dsn-button--size-small"
>
  <svg class="dsn-icon" aria-hidden="true"><!-- trash.svg --></svg>
  <span class="dsn-button__label">
    Verwijder
    <span class="dsn-visually-hidden"> document.pdf</span>
  </span>
</button>
```

### States

| State      | Wanneer                                                                                                                           |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `default`  | Bestand is geselecteerd of eerder geüpload. Toont naam als link (indien `href` aanwezig) en verwijderknop.                        |
| `loading`  | Upload is in uitvoering. Toont naam als tekst (geen link), Spinner in actions.                                                    |
| `uploaded` | Upload geslaagd. Toont naam als link, check-icoon in actions, `aria-live` aankondiging. Keert na 2 seconden terug naar `default`. |
| `error`    | Upload mislukt. Toont rode randkleur, foutmelding onder de meta, verwijderknop, `aria-live` aankondiging.                         |

### Interactieve variant

Wanneer `href` aanwezig is opent de bestandsnaam altijd in een nieuw tabblad. Wanneer ook `onDelete` ontbreekt en `ctaVariant` niet `'download'` is, schakelt het component over naar de volledig-klikbare interactieve variant: de bestandsnaam wordt een stretched link die de gehele component klikbaar maakt.

```html
<div class="dsn-file dsn-file--interactive">
  <div class="dsn-file__media" aria-hidden="true">
    <svg class="dsn-icon" aria-hidden="true"><!-- file-description.svg --></svg>
  </div>
  <div class="dsn-file__content">
    <a
      class="dsn-file__name dsn-file__name--stretched"
      href="/bestanden/document.pdf"
      target="_blank"
      rel="noopener noreferrer"
      >document</a
    >
    <span class="dsn-file__meta">PDF · 1,2 MB</span>
  </div>
  <div class="dsn-file__actions"></div>
  <span
    class="dsn-visually-hidden"
    aria-live="polite"
    aria-atomic="true"
  ></span>
</div>
```

Bij `ctaVariant="download"` verschijnt er ook een aparte download-knop in de actions-zone. De bestandsnaam opent nog steeds in een nieuw tabblad. De download-link heeft `aria-hidden="true"` en `tabindex="-1"` om een dubbele tabstop te vermijden.

```html
<div class="dsn-file">
  <!-- media + content identiek aan bovenstaand -->
  <div class="dsn-file__actions">
    <a
      class="dsn-link"
      href="/bestanden/document.pdf"
      aria-hidden="true"
      tabindex="-1"
      download
    >
      <svg class="dsn-icon" aria-hidden="true"><!-- download.svg --></svg>
      Download
    </a>
  </div>
</div>
```

### FileList

Gebruik `FileList` als wrapper wanneer je meerdere `File` componenten toont. De lijst rendert een `<ul role="list">` met `<li>` wrappers — nodig omdat CSS-resets lijstsemantiek verwijderen.

```html
<ul class="dsn-file-list" role="list">
  <li><!-- File --></li>
  <li><!-- File --></li>
</ul>
```

## Design tokens

| Token                                | Beschrijving                                 |
| ------------------------------------ | -------------------------------------------- |
| `--dsn-file-background-color`        | Achtergrondkleur standaard                   |
| `--dsn-file-background-color-hover`  | Achtergrondkleur bij hover (interactief)     |
| `--dsn-file-background-color-active` | Achtergrondkleur bij active (interactief)    |
| `--dsn-file-border-radius`           | Afgeronde hoeken                             |
| `--dsn-file-border-width`            | Randbreedte                                  |
| `--dsn-file-border-color`            | Randkleur standaard                          |
| `--dsn-file-border-color-hover`      | Randkleur bij hover (interactief)            |
| `--dsn-file-border-color-active`     | Randkleur bij active (interactief)           |
| `--dsn-file-border-color-error`      | Randkleur in error state                     |
| `--dsn-file-box-shadow`              | Schaduw standaard (geen)                     |
| `--dsn-file-box-shadow-hover`        | Schaduw bij hover (interactief)              |
| `--dsn-file-padding-block`           | Verticale padding                            |
| `--dsn-file-padding-inline`          | Horizontale padding                          |
| `--dsn-file-gap`                     | Ruimte tussen media-vlak, content en actions |
| `--dsn-file-content-gap`             | Verticale ruimte in het content-gebied       |
| `--dsn-file-name-color`              | Kleur van de bestandsnaam                    |
| `--dsn-file-name-font-weight`        | Gewicht van de bestandsnaam (bold)           |
| `--dsn-file-meta-color`              | Kleur van de meta-tekst                      |
| `--dsn-file-meta-font-size`          | Tekstgrootte van de meta                     |
| `--dsn-file-media-min-block-size`    | Minimale hoogte van het media-vlak (48px)    |
| `--dsn-file-media-min-inline-size`   | Minimale breedte van het media-vlak (48px)   |
| `--dsn-file-media-border-radius`     | Afgeronde hoeken van het media-vlak          |
| `--dsn-file-media-background-color`  | Achtergrondkleur van het media-vlak          |
| `--dsn-file-media-icon-color`        | Kleur van het icoon in het media-vlak        |
| `--dsn-file-media-icon-size`         | Grootte van het icoon in het media-vlak      |
| `--dsn-file-status-icon-color`       | Kleur van het check-icoon (uploaded state)   |
| `--dsn-file-status-icon-size`        | Grootte van het check-icoon                  |

## Accessibility

- `dsn-file__media` heeft altijd `aria-hidden="true"`: het icoon en de preview zijn decoratief.
- `<img class="dsn-file__preview" alt="">` heeft een lege `alt` — de media-container is toch `aria-hidden`.
- De verwijderknop bevat de bestandsnaam inclusief extensie als visueel verborgen tekst. Gebruik nooit `aria-label`.
- Elk `File` component bevat een visueel verborgen `<span aria-live="polite" aria-atomic="true">`. Zie het kopje "De aria-live regio" hieronder voor wat daar precies in komt.
- In de interactieve variant (stretched link) is de bestandsnaam het enige focuspunt. Bij de download-variant heeft de download-link `aria-hidden="true"` en `tabindex="-1"` — de bestandsnaam is het primaire focuspunt.
- `FileList` rendert `<ul role="list">` met `<li>` wrappers om lijstsemantiek te bewaren bij CSS-resets.

### De aria-live regio

Een upload verandert van status zonder dat de gebruiker iets doet: de statuswissel is puur visueel (spinner, vinkje, rode rand). Screenreadergebruikers krijgen die wissel niet mee. Daarom bevat elk `File` component een altijd aanwezige, visueel verborgen live region die de uitkomst van de upload uitspreekt.

```html
<span class="dsn-visually-hidden" aria-live="polite" aria-atomic="true"></span>
```

De regio staat altijd in de DOM, ook als hij leeg is. Dat is een voorwaarde: een live region die pas bij de statuswissel wordt toegevoegd, wordt door de meeste screenreaders genegeerd. Alleen de inhoud verandert.

#### Wat komt er in per state

| State      | Inhoud van de regio                                                                              | Voorbeeld                                            |
| ---------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------- |
| `default`  | Leeg                                                                                             |                                                      |
| `loading`  | Leeg                                                                                             |                                                      |
| `uploaded` | `{fileName} succesvol geüpload`                                                                  | "document.pdf succesvol geüpload"                    |
| `error`    | `{fileName}: {errorMessage}`, of `{fileName} uploaden mislukt` wanneer er geen `errorMessage` is | "document.pdf: Upload mislukt. Probeer het opnieuw." |

Drie principes achter deze teksten:

1. **Altijd de volledige bestandsnaam, inclusief extensie.** Visueel wordt de extensie afgekapt, maar in een lijst met meerdere bestanden is de naam het enige dat de aankondiging koppelt aan het juiste bestand. "Upload mislukt" alleen is onbruikbaar bij drie tegelijk uploadende bestanden.
2. **Bij een fout ook de reden.** De zichtbare foutmelding staat in een gewone `<p>` en wordt dus niet automatisch voorgelezen op het moment dat de fout ontstaat. De live region herhaalt hem daarom, zodat de gebruiker meteen weet wat er mis ging en niet eerst terug hoeft te navigeren.
3. **Geen aankondiging tijdens `loading`.** De Spinner heeft al een visueel verborgen label ("Bezig met uploaden") en het startmoment van een upload is een gebruikersactie: die verrast niemand. Elke tussenstap aankondigen maakt de regio juist onbruikbaar bij meerdere bestanden.

#### Levensduur van de tekst

Bij `uploaded` blijft de tekst 2 seconden staan, waarna het component terugkeert naar `default` en de regio wordt leeggemaakt. Bij `error` blijft de tekst staan zolang de error-state actief is: de fout is niet vanzelf voorbij en de gebruiker moet actie ondernemen. Zodra de status weer `default` of `loading` wordt (bijvoorbeeld na opnieuw proberen), maakt het component de regio leeg.

Gevolg van die keuze: in de error-state staat de foutmelding twee keer in de accessibility tree, één keer zichtbaar en één keer in de live region. Dat is bewust. De aankondiging op het juiste moment weegt zwaarder dan de dubbeling bij lineair doorlezen. Wil je die dubbeling niet, geef dan via `errorLabel` een kortere tekst mee.

#### Teksten overschrijven

| Prop            | State      | Standaardwaarde                                                      |
| --------------- | ---------- | -------------------------------------------------------------------- |
| `uploadedLabel` | `uploaded` | `{fileName} succesvol geüpload`                                      |
| `errorLabel`    | `error`    | `{fileName}: {errorMessage}`, of `{fileName} uploaden mislukt`       |
| `loadingLabel`  | `loading`  | `Bezig met uploaden` (label van de Spinner, niet van de live region) |

```tsx
<File
  fileName="jaarrekening-2024.pdf"
  fileType="PDF"
  status="error"
  errorMessage="Het bestand is groter dan 10 MB."
  errorLabel="jaarrekening-2024.pdf is te groot en niet geüpload"
/>
```

Bij de HTML/CSS-laag regel je dit zelf: schrijf dezelfde tekst in de live region op het moment dat je de status-klasse (`dsn-file--uploaded`, `dsn-file--error`) op de root zet, en maak hem leeg als je die klasse weer verwijdert.

#### Zelf beluisteren

Een live region kondigt alleen aan bij een wijziging van de inhoud, dus de stories hierboven spreken niets uit: die starten al in hun eindtoestand. Wil je de aankondigingen met een screenreader horen, gebruik dan het template **Form step: Upload**. Daar doorloopt elk gekozen bestand een echte cyclus, en levert een bestand groter dan 10 MB of met een niet-toegestane extensie de foutaankondiging op.
