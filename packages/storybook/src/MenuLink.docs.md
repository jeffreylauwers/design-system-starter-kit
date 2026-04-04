# MenuLink

Navigatielink met niveau-hiërarchie, actieve staat en uitklapbare subnavigatie.

## Doel

MenuLink is een navigatie-item dat semantisch een `<a>`-element is en visueel consistent is met MenuButton. Het wordt gebruikt in primaire en secundaire navigatie — zoals een Page Header of Drawer.

De `level`-prop (1–4) geeft de paginahiërarchie weer via toenemende `padding-inline-start`. De `current`-prop markeert de actieve pagina. Een uitklapknop verschijnt wanneer een pagina subpagina's heeft.

<!-- VOORBEELD -->

## Use when

- Je een navigatielink wil tonen in een menu of sidebar.
- De link naar een URL navigeert (in tegenstelling tot `MenuButton` voor JS-acties).
- Je een hiërarchie van paginaniveaus wil uitdrukken (niveau 1 t/m 4).
- Je de actieve/huidige pagina wil markeren in de navigatie.
- Een pagina subpagina's heeft die uitgevouwen kunnen worden.

## Don't use when

- De actie een JavaScript-handeling is (geen URL-navigatie) — gebruik dan `MenuButton`.
- Je buiten een nav-context werkt — gebruik dan een reguliere `Button`, `ButtonLink` of `Link`.

## Best practices

### HTML-structuur

MenuLink genereert een `<li>`-element en moet altijd binnen een `<ul>` geplaatst worden:

```html
<nav aria-label="Primaire navigatie">
  <ul>
    <li class="dsn-menu-link">
      <a class="dsn-menu-link__link" href="/dashboard">
        <svg class="dsn-icon" aria-hidden="true"><!-- home --></svg>
        <span class="dsn-menu-link__label">Dashboard</span>
      </a>
    </li>
    <li class="dsn-menu-link">
      <a class="dsn-menu-link__link" href="/rapporten" aria-current="page">
        <svg class="dsn-icon" aria-hidden="true"><!-- chart-bar --></svg>
        <span class="dsn-menu-link__label">Rapporten</span>
      </a>
      <span class="dsn-menu-link__divider" aria-hidden="true"></span>
      <button
        type="button"
        class="dsn-button dsn-button--subtle dsn-button--size-small dsn-button--icon-only dsn-menu-link__expand-button"
        aria-expanded="true"
      >
        <svg class="dsn-icon" aria-hidden="true"><!-- chevron-down --></svg>
        <span class="dsn-button__label">
          Inklappen
          <span class="dsn-visually-hidden"> voor Rapporten</span>
        </span>
      </button>
    </li>
    <li class="dsn-menu-link dsn-menu-link--level-2">
      <a class="dsn-menu-link__link" href="/rapporten/maandelijks">
        <span class="dsn-menu-link__label">Maandelijks</span>
      </a>
    </li>
  </ul>
</nav>
```

### Niveau-hiërarchie

Gebruik `level` om de hiërarchische positie van een pagina uit te drukken. Level 1 is de basislaag — geen modifier-klasse in de DOM. Elk hoger niveau voegt een `padding-inline-start` toe via `dsn-menu-link--level-{n}`.

```html
<!-- Level 1 (standaard, geen modifier) -->
<li class="dsn-menu-link">...</li>

<!-- Level 2 -->
<li class="dsn-menu-link dsn-menu-link--level-2">...</li>

<!-- Level 3 -->
<li class="dsn-menu-link dsn-menu-link--level-3">...</li>
```

### Actieve pagina (current)

Gebruik `current` om de actieve pagina te markeren. Dit voegt `aria-current="page"` toe aan het `<a>`-element en past de visuele stijl aan.

```html
<a class="dsn-menu-link__link" href="/rapporten" aria-current="page">
  <span class="dsn-menu-link__label">Rapporten</span>
</a>
```

### NumberBadge

Gebruik `numberBadge` om een telbadge rechts van het label te tonen. Voeg screenreader-context toe via `dsn-visually-hidden` in het label wanneer het getal afgekapt is:

```html
<a class="dsn-menu-link__link" href="/inbox">
  <svg class="dsn-icon" aria-hidden="true"><!-- mail --></svg>
  <span class="dsn-menu-link__label">
    Inbox
    <span class="dsn-visually-hidden">, 128 ongelezen berichten</span>
  </span>
  <span class="dsn-number-badge dsn-number-badge--negative" aria-hidden="true"
    >99+</span
  >
</a>
```

### Uitklapknop

De uitklapknop is een zelfstandige `<button>` naast de `<a>`. Gebruik altijd `aria-expanded` en geef de knop een toegankelijke naam via `dsn-button__label` met een `dsn-visually-hidden` span voor de paginanaam — nooit `aria-label`.

```html
<span class="dsn-menu-link__divider" aria-hidden="true"></span>
<button
  type="button"
  class="dsn-button dsn-button--subtle dsn-button--size-small dsn-button--icon-only dsn-menu-link__expand-button"
  aria-expanded="false"
>
  <svg class="dsn-icon" aria-hidden="true"><!-- chevron-down --></svg>
  <span class="dsn-button__label">
    Uitklappen
    <span class="dsn-visually-hidden"> voor Rapporten</span>
  </span>
</button>
```

## Design tokens

MenuLink gebruikt twee token-sets. De gedeelde `--dsn-menu-item-*` tokens zijn ook van toepassing op `MenuButton` — wijzigingen hier gelden voor beide componenten.

### Gedeeld met MenuButton (`--dsn-menu-item-*`)

| Token                                     | Beschrijving                 |
| ----------------------------------------- | ---------------------------- |
| `--dsn-menu-item-font-size`               | Lettergrootte                |
| `--dsn-menu-item-font-weight`             | Letterdikte (regular)        |
| `--dsn-menu-item-line-height`             | Regelhoogte                  |
| `--dsn-menu-item-padding-block`           | Verticale padding            |
| `--dsn-menu-item-padding-inline`          | Horizontale padding          |
| `--dsn-menu-item-gap`                     | Ruimte tussen icoon en label |
| `--dsn-menu-item-min-block-size`          | Minimale raakbare hoogte     |
| `--dsn-menu-item-icon-size`               | Icoongrootte                 |
| `--dsn-menu-item-color`                   | Tekstkleur (standaard)       |
| `--dsn-menu-item-background-color`        | Achtergrondkleur (standaard) |
| `--dsn-menu-item-hover-color`             | Tekstkleur bij hover         |
| `--dsn-menu-item-hover-background-color`  | Achtergrondkleur bij hover   |
| `--dsn-menu-item-active-color`            | Tekstkleur bij active        |
| `--dsn-menu-item-active-background-color` | Achtergrondkleur bij active  |

### MenuLink-specifiek (`--dsn-menu-link-*`)

| Token                                             | Beschrijving                                                         |
| ------------------------------------------------- | -------------------------------------------------------------------- |
| `--dsn-menu-link-level-indent`                    | Inspringing per niveau (level 2–4) via margin-inline-start           |
| `--dsn-menu-link-current-font-weight`             | Letterdikte voor de actieve/huidige pagina (bold)                    |
| `--dsn-menu-link-current-color`                   | Tekstkleur voor de actieve/huidige pagina                            |
| `--dsn-menu-link-current-background-color`        | Achtergrondkleur voor de actieve/huidige pagina (action-2.bg-active) |
| `--dsn-menu-link-current-indicator-color`         | Kleur van de border-inline-start indicator                           |
| `--dsn-menu-link-current-indicator-width`         | Breedte van de border-inline-start indicator (3px)                   |
| `--dsn-menu-link-current-hover-color`             | Hover tekstkleur voor de actieve pagina                              |
| `--dsn-menu-link-current-hover-background-color`  | Hover achtergrondkleur voor de actieve pagina                        |
| `--dsn-menu-link-current-active-color`            | Active tekstkleur voor de actieve pagina                             |
| `--dsn-menu-link-current-active-background-color` | Active achtergrondkleur voor de actieve pagina                       |

## Accessibility

- Gebruik `aria-current="page"` (via de `current` prop) om de actieve pagina aan screenreaders door te geven. Gebruik nooit enkel kleur om de actieve staat aan te duiden.
- De uitklapknop gebruikt altijd `dsn-button__label` voor zijn toegankelijke naam — nooit `aria-label`. Voeg de paginanaam toe via een geneste `dsn-visually-hidden` span.
- `aria-expanded` op de uitklapknop geeft de uit-/ingeklapte staat door aan screenreaders.
- Het icoon in de link en de uitklapknop heeft altijd `aria-hidden="true"`.
- Zorg dat de omliggende `<ul>` in een `<nav>` staat met een beschrijvende `aria-label`.
