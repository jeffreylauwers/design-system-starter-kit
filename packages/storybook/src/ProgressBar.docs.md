# ProgressBar

Horizontale voortgangsbalk voor bepaalde wachttijden.

## Doel

ProgressBar toont de voortgang van een taak als percentage. Het component is bedoeld voor laadacties waarbij de voortgang meetbaar is, zoals bestandsuploads of stapsgewijze processen. Het toont altijd een procentuele waarde boven de balk, en heeft optioneel een beschrijvende tekst eronder.

Het native `<progress>`-element biedt impliciete `role="progressbar"` zodat screenreaders de voortgang automatisch aankondigen. Een visueel verborgen `<label>` koppelt de toegankelijke naam via `for`/`id`.

<!-- VOORBEELD -->

## Use when

- De voortgang van een actie meetbaar is (bestandsupload, export, stapsgewijs proces).
- Het totaal aantal stappen of de bestandsgrootte van tevoren bekend is.
- Achtergrondtaken met een bekende duur worden uitgevoerd.

## Don't use when

- De duur van de actie niet van tevoren bekend is: gebruik dan een **Spinner**.
- De voortgang geen getal oplevert maar een kwalitatieve status: gebruik dan een **StatusBadge**.

## Best practices

### Label

Geef altijd een beschrijvend label mee dat de actie omschrijft, niet het percentage:

```html
<!-- Goed -->
<label class="dsn-visually-hidden" for="pb-1">Bestand uploaden</label>

<!-- Te generiek -->
<label class="dsn-visually-hidden" for="pb-1">Voortgang</label>
```

### Beschrijving

Gebruik de optionele beschrijving voor extra context over de lopende actie:

```html
<p class="dsn-paragraph dsn-progress-bar__description">
  Bestand wordt geüpload, even geduld...
</p>
```

### Aangepast maximum

Gebruik `max` voor stapsgewijze processen waarbij het totaal niet 100 is. Het percentage wordt automatisch berekend:

```tsx
// Stap 3 van 7 — toont 43%
<ProgressBar label="Stap voortgang" value={3} max={7} />
```

In HTML:

```html
<progress class="dsn-progress-bar__bar" value="3" max="7">43%</progress>
```

### Voltooiing

Toon een beschrijving wanneer de balk 100% bereikt:

```tsx
<ProgressBar
  label="Bestand uploaden"
  value={100}
  description="Upload voltooid."
/>
```

## Design tokens

| Token                              | Beschrijving                                                    |
| ---------------------------------- | --------------------------------------------------------------- |
| `--dsn-progress-bar-color-track`   | Achtergrondkleur van de track (neutraal grijs)                  |
| `--dsn-progress-bar-color-fill`    | Kleur van de vulbalk (primaire accentkleur, zelfde als Spinner) |
| `--dsn-progress-bar-block-size`    | Hoogte van de balk (8px)                                        |
| `--dsn-progress-bar-border-radius` | Afronding van track en fill (pill-vorm)                         |
| `--dsn-progress-bar-gap-header`    | Ruimte tussen percentage-tekst en balk                          |
| `--dsn-progress-bar-gap-footer`    | Ruimte tussen balk en beschrijving                              |

## Accessibility

- Het native `<progress>`-element heeft impliciete `role="progressbar"`, `aria-valuenow`, `aria-valuemin` (0) en `aria-valuemax`.
- Een `<label>` is gekoppeld via `for`/`id` — robuuster dan `aria-label`.
- De `description` krijgt een `id` en is via `aria-describedby` aan het `<progress>`-element gekoppeld, zodat een screenreadergebruiker de toelichting hoort en niet alleen het percentage.
- De percentage-tekst heeft `aria-hidden="true"`: screenreaders lezen de native voortgangswaarde al voor via `<progress>`.
- De fallback-tekst binnen `<progress>` (bijv. `35%`) dient als tekstalternatief voor browsers zonder HTML5-ondersteuning.
- Bij dynamische `value`-wijzigingen kondigt de screenreader de nieuwe waarde aan via de ingebouwde live-regiofunctionaliteit van `role="progressbar"`.
- De fill-animatie respecteert `prefers-reduced-motion: reduce`: bij verminderde bewegingsvoorkeur wordt de overgangsanimatie uitgeschakeld.
