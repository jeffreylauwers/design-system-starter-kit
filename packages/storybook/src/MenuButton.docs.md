# MenuButton

Navigatieknop voor JavaScript-acties met icoon- en badge-ondersteuning.

## Doel

MenuButton is een navigatie-item dat semantisch een `<button>`-element is en visueel consistent is met MenuLink. Het wordt gebruikt wanneer een actie in het navigatiemenu geen URL-navigatie is maar een JavaScript-handeling triggert — zoals uitloggen, een modal openen of een instellingenpaneel tonen.

<!-- VOORBEELD -->

## Use when

- De actie een JavaScript-handeling is (geen URL-navigatie).
- Je een navigatie-item wil tonen in een menu of sidebar dat een JS-actie triggert.
- Je statusindicatie wil tonen bij een navigatie-item via een `DotBadge`.

## Don't use when

- De actie naar een URL navigeert — gebruik dan `MenuLink`.
- Je buiten een nav-context werkt — gebruik dan een reguliere `Button` of `LinkButton`.

## Best practices

### HTML-structuur

MenuButton genereert een `<li>`-element en moet altijd binnen een `<ul>` geplaatst worden:

```html
<nav aria-label="Primaire navigatie">
  <ul>
    <li class="dsn-menu-button">
      <button type="button" class="dsn-menu-button__button">
        <svg class="dsn-icon" aria-hidden="true"><!-- settings --></svg>
        <span class="dsn-menu-button__label">Instellingen</span>
      </button>
    </li>
    <li class="dsn-menu-button">
      <button type="button" class="dsn-menu-button__button">
        <svg class="dsn-icon" aria-hidden="true"><!-- logout --></svg>
        <span class="dsn-menu-button__label">Uitloggen</span>
      </button>
    </li>
  </ul>
</nav>
```

### DotBadge

Gebruik `dotBadge` voor statusindicatie zonder getal (bijv. nieuwe meldingen). De `DotBadge` wordt gerenderd in de label-span en zweeft rechtsboven de tekst. Voeg altijd screenreader-context toe via `dsn-visually-hidden` in het label wanneer de badge betekenis draagt:

```html
<button type="button" class="dsn-menu-button__button">
  <svg class="dsn-icon" aria-hidden="true"><!-- bell --></svg>
  <span class="dsn-menu-button__label">
    Meldingen
    <span class="dsn-visually-hidden">, nieuwe meldingen beschikbaar</span>
    <span
      class="dsn-dot-badge dsn-dot-badge--negative"
      aria-hidden="true"
    ></span>
  </span>
</button>
```

### Iconen

Gebruik `iconStart` voor contextuele iconen links van het label. Gebruik `iconEnd` voor navigatieve iconen (bijv. een pijl) rechts van het label:

```html
<button type="button" class="dsn-menu-button__button">
  <svg class="dsn-icon" aria-hidden="true"><!-- settings --></svg>
  <span class="dsn-menu-button__label">Instellingen</span>
  <svg class="dsn-icon" aria-hidden="true"><!-- arrow-right --></svg>
</button>
```

## Design tokens

MenuButton gebruikt uitsluitend de gedeelde `--dsn-menu-item-*` tokens. Deze tokens zijn ook van toepassing op `MenuLink` — wijzigingen hier gelden voor beide componenten.

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

## Accessibility

- MenuButton is semantisch een `<button type="button">` — screenreaders kondigen het aan als knop.
- Het icoon heeft altijd `aria-hidden="true"` — de toegankelijke naam komt van de knoptekst.
- Wanneer `dotBadge` betekenis draagt (bijv. ongelezen berichten), voeg dan context toe via `dsn-visually-hidden` in het label — de `DotBadge` zelf heeft altijd `aria-hidden="true"`.
- Gebruik nooit `aria-label` op de knop — gebruik altijd zichtbare tekst in `dsn-menu-button__label`.
- Zorg dat de omliggende `<ul>` in een `<nav>` staat met een beschrijvende `aria-label`.
