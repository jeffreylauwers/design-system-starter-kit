# NumberBadge

Compact inline-element dat een getal toont — zoals het aantal ongelezen berichten of openstaande taken.

## Doel

NumberBadge is een puur visueel telbadge-component. Het wordt geplaatst **binnen** een Button of Menu-item, naast het label, en toont een compact getal met een signaalkleur en een afgeronde pill-vorm. Anders dan DotBadge communiceert NumberBadge ook de hoeveelheid; anders dan StatusBadge is het puur numeriek en compact.

De component heeft bewust geen eigen toegankelijkheidsmechanisme. De verantwoordelijkheid voor toegankelijke context ligt bij de implementerende code via `dsn-visually-hidden`.

<!-- VOORBEELD -->

## Use when

- Een gebruiker het aantal ongelezen berichten bij een inbox-button moet zien.
- Het aantal openstaande taken in een navigatie-item of sidebar-link getoond wordt.
- Korte tellingen (1–99+) waarbij de context al duidelijk is vanuit het omliggende element.

## Don't use when

- De status kwalitatief is (bijv. "Goedgekeurd", "Let op") — gebruik dan `StatusBadge`.
- Je alleen de aanwezigheid van een melding wil signaleren zonder getal — gebruik dan `DotBadge`.
- De badge op zichzelf staat zonder parent Button of Link — de badge heeft altijd context nodig.

## Best practices

### Variantkeuze

- **Negative** — standaard, voor foutmeldingen en ongelezen berichten.
- **Positive** — voor succesvolle notificaties.
- **Warning** — voor waarschuwingen die aandacht vragen.
- **Info** — voor informatieve tellingen.
- **Neutral** — voor neutrale tellingen zonder urgentie.

### Afgekapt getal (99+)

Bij grote aantallen toont NumberBadge `{maxCount}+`. De `dsn-visually-hidden` span in de parent geeft het werkelijke getal aan screenreaders:

```html
<button type="button" class="dsn-button dsn-button--subtle">
  <svg class="dsn-icon" aria-hidden="true"><!-- inbox --></svg>
  <span class="dsn-button__label">
    Inbox
    <span class="dsn-visually-hidden">, 128 ongelezen berichten</span>
  </span>
  <span class="dsn-number-badge dsn-number-badge--negative" aria-hidden="true"
    >99+</span
  >
</button>
```

### Toegankelijkheid

NumberBadge heeft altijd `aria-hidden="true"` — screenreaders negeren de badge volledig. Voeg altijd context toe in de parent via `dsn-visually-hidden`:

```html
<!-- Kleine aantallen — optionele screenreader-context -->
<button type="button" class="dsn-button dsn-button--subtle">
  <svg class="dsn-icon" aria-hidden="true"><!-- inbox --></svg>
  <span class="dsn-button__label">Inbox</span>
  <span class="dsn-number-badge dsn-number-badge--negative" aria-hidden="true"
    >5</span
  >
</button>

<!-- Grote aantallen — verplichte screenreader-context -->
<button type="button" class="dsn-button dsn-button--subtle">
  <svg class="dsn-icon" aria-hidden="true"><!-- inbox --></svg>
  <span class="dsn-button__label">
    Inbox
    <span class="dsn-visually-hidden">, 128 ongelezen berichten</span>
  </span>
  <span class="dsn-number-badge dsn-number-badge--negative" aria-hidden="true"
    >99+</span
  >
</button>
```

## Design tokens

| Token                                          | Beschrijving                                                       |
| ---------------------------------------------- | ------------------------------------------------------------------ |
| `--dsn-number-badge-font-size`                 | Lettergrootte (xs)                                                 |
| `--dsn-number-badge-line-height`               | Regelhoogte (xs)                                                   |
| `--dsn-number-badge-font-weight`               | Letterdikte (bold)                                                 |
| `--dsn-number-badge-min-inline-size`           | Minimumbreedte voor cirkelronde ééncijferige badges (1.25rem/20px) |
| `--dsn-number-badge-padding-block`             | Verticale padding (xs)                                             |
| `--dsn-number-badge-padding-inline`            | Horizontale padding (xs)                                           |
| `--dsn-number-badge-border-radius`             | Pill-vorm via round border-radius                                  |
| `--dsn-number-badge-border-width`              | Randbreedte (thin — zichtbaar in High Contrast mode)               |
| `--dsn-number-badge-border-color`              | Randkleur (transparant — zichtbaar in High Contrast mode)          |
| `--dsn-number-badge-negative-color`            | Tekstkleur negative variant                                        |
| `--dsn-number-badge-negative-background-color` | Achtergrondkleur negative variant                                  |
| `--dsn-number-badge-positive-color`            | Tekstkleur positive variant                                        |
| `--dsn-number-badge-positive-background-color` | Achtergrondkleur positive variant                                  |
| `--dsn-number-badge-warning-color`             | Tekstkleur warning variant                                         |
| `--dsn-number-badge-warning-background-color`  | Achtergrondkleur warning variant                                   |
| `--dsn-number-badge-info-color`                | Tekstkleur info variant                                            |
| `--dsn-number-badge-info-background-color`     | Achtergrondkleur info variant                                      |
| `--dsn-number-badge-neutral-color`             | Tekstkleur neutral variant                                         |
| `--dsn-number-badge-neutral-background-color`  | Achtergrondkleur neutral variant                                   |

## Accessibility

- NumberBadge heeft altijd `aria-hidden="true"` — geen semantische betekenis op zichzelf.
- Bij afgekapte getallen (`99+`): verplicht een `dsn-visually-hidden` span in de parent met het werkelijke getal.
- Bij kleine aantallen zonder afkapping is de `dsn-visually-hidden` span optioneel als de buttonlabel voldoende context biedt.
- Gebruik nooit `aria-label` op het badge-element zelf.
- De badge werkt correct in Windows High Contrast mode via de transparante border.
