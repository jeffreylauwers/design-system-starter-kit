# Menu

Containercomponent voor `MenuLink`- en `MenuButton`-items in een verticale of horizontale navigatielijst.

## Doel

`Menu` groepeert navigatie-items in een semantisch correcte `<ul>`-lijst. Het biedt via de `orientation`-prop keuze tussen een verticale (standaard) en horizontale oriëntatie. Bij verticale oriëntatie pakken items de volledige breedte; bij horizontaal zijn ze zo breed als hun inhoud.

`Menu` is bewust eenvoudig gehouden — het beheert geen expand/collapse logica voor sub-navigatie. Dat is een verantwoordelijkheid van de applicatielaag.

<!-- VOORBEELD -->

## Use when

- Je meerdere `MenuLink`- en/of `MenuButton`-items wilt groeperen in een navigatielijst.
- Je een verticale navigatielijst wilt in een zijbalk, Drawer of sub-navigatie.
- Je een horizontale navigatielijst wilt in een Page Header bij grote viewports.

## Don't use when

- Je slechts één enkel navigatie-item wilt tonen — gebruik dan `Link` of `Button` direct.
- Je `<li>`-elementen wilt tonen zonder navigatiecontext — `MenuLink` en `MenuButton` zijn `<li>`-elementen en vereisen altijd een omliggend `<ul>`.

## Best practices

### Nav-context is verantwoordelijkheid van de ouder

`Menu` rendert zelf geen `<nav>`. Wrap `Menu` altijd in een `<nav>` met een beschrijvende `aria-label`:

```html
<nav aria-label="Hoofdnavigatie">
  <ul class="dsn-menu">
    <li class="dsn-menu-link">...</li>
    <li class="dsn-menu-button">...</li>
  </ul>
</nav>
```

### Oriëntatie

Kies de oriëntatie op basis van de context:

```html
<!-- Verticaal (standaard) — zijbalk of sub-navigatie -->
<ul class="dsn-menu">
  <li class="dsn-menu-link">...</li>
</ul>

<!-- Horizontaal — Page Header of tab-navigatie -->
<ul class="dsn-menu dsn-menu--horizontal">
  <li class="dsn-menu-link">...</li>
</ul>
```

### Items

`MenuLink` en `MenuButton` zijn `<li>`-elementen en worden direct als children van `Menu` geplaatst:

```html
<nav aria-label="Primaire navigatie">
  <ul class="dsn-menu">
    <li class="dsn-menu-link dsn-menu-link--level-1">
      <a class="dsn-menu-link__link" href="/home" aria-current="page">
        <span class="dsn-menu-link__label">Home</span>
      </a>
    </li>
    <li class="dsn-menu-button">
      <button type="button" class="dsn-menu-button__button">
        <span class="dsn-menu-button__label">Uitloggen</span>
      </button>
    </li>
  </ul>
</nav>
```

## Design tokens

| Token                       | Beschrijving                                                                       |
| --------------------------- | ---------------------------------------------------------------------------------- |
| `--dsn-menu-gap-vertical`   | Ruimte tussen items in verticale oriëntatie (0 — items hebben eigen padding-block) |
| `--dsn-menu-gap-horizontal` | Ruimte tussen items in horizontale oriëntatie                                      |

## Accessibility

- `Menu` rendert een `<ul>` — screenreaders kondigen de lijst aan met het aantal items.
- `Menu` rendert zelf **geen `<nav>`** — de ouder is verantwoordelijk voor de navigatielandmark.
- De `<nav>` moet een toegankelijke naam hebben via `aria-label` of `aria-labelledby`.
- Elk `MenuLink`- en `MenuButton`-item is een `<li>` — de directe kinderen van `Menu`.
