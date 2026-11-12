# Logo

Theme-aware SVG logo component dat zich automatisch aanpast aan het actieve thema en de kleurmodus.

## Doel

Logo rendert het Starter Kit-logo als inline SVG. De twee kleurlagen: de primaire merkkleur (achtergrondrechthoek + letterpaden) en de labelkleur (binnenste rechthoek): zijn gekoppeld aan design tokens die per thema gedefinieerd worden. Hierdoor past het logo zich automatisch aan bij elk thema en elke kleurmodus, zonder componentcode aan te raken.

Het component is bedoeld als bouwsteen voor de toekomstige `PageHeader`- en `PageFooter`-componenten.

<!-- VOORBEELD -->

## Use when

- Merkidentificatie in de paginaheader.
- Merkidentificatie in de paginafooter.
- Standalone branding op specifieke pagina's (inlogpagina, foutpagina's).

## Don't use when

- Je een extern organisatielogo wil tonen dat buiten de token-structuur valt: gebruik dan een `<img>` element met een passend `alt`-attribuut.

## Best practices

### Standalone vs. decoratief gebruik

Het Logo heeft twee toegankelijkheidspatronen:

**Standalone**: het logo staat op zichzelf en levert zijn eigen accessible name via een `<title>`:

```html
<svg
  class="dsn-logo"
  xmlns="http://www.w3.org/2000/svg"
  width="186"
  height="48"
  viewBox="0 0 186 48"
  fill="none"
  role="img"
  aria-labelledby="logo-title"
>
  <title id="logo-title">Starter Kit</title>
  <path class="dsn-logo__primary" d="M0 0h185.491v48H0z" />
  <path class="dsn-logo__label" d="M8 8h169.491v32H8z" />
  <!-- letterpaden met dsn-logo__primary -->
</svg>
```

**Decoratief**: het logo staat in een link of naast tekst die de accessible name al levert:

```html
<a href="/">
  <svg
    class="dsn-logo"
    xmlns="http://www.w3.org/2000/svg"
    width="186"
    height="48"
    viewBox="0 0 186 48"
    fill="none"
    aria-hidden="true"
  >
    <!-- geen <title>: de link levert de accessible name -->
    <path class="dsn-logo__primary" d="M0 0h185.491v48H0z" />
    <path class="dsn-logo__label" d="M8 8h169.491v32H8z" />
    <!-- letterpaden... -->
  </svg>
  <span class="dsn-visually-hidden">Starter Kit: terug naar homepage</span>
</a>
```

### Grootte

Het Logo heeft een intrinsieke afmeting van 186×48px (ratio ≈ 3.875:1). Afmetingen worden gecontroleerd door de consumerende component (bijv. PageHeader). Gebruik `width` en `height` SVG-attributen of CSS om de grootte aan te passen.

### Thema en kleurmodus

Het logo reageert automatisch op thema- en moduswisselingen via design tokens:

- `--dsn-logo-color-primary`: merkkleur van het actieve thema (blauw in Start, zwart in Wireframe)
- `--dsn-logo-color-label`: documentachtergrondkleur (creëert het doorkijkje-effect)

## Design tokens

<!-- tokens: logo -->

## Accessibility

- **Standalone**: `role="img"` + `<title>` binnenin + `aria-labelledby`-koppeling op `<svg>`: geeft de beste cross-browser/screenreader ondersteuning.
- **Decoratief (in link of met omringende tekst)**: `aria-hidden="true"` op `<svg>`, géén `<title>`.
- De combinatie van `role="img"` + `<title>` + `aria-labelledby` is robuuster dan `aria-label` alleen.
- Bij meerdere Logo-instanties op één pagina garandeert `useId()` (React 18+) dat elke `<title>` een uniek id heeft.
