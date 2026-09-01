# PageHeader

Primaire navigatieheader voor een pagina met menuknop, gecentreerd logo en zoekknop.

## Doel

`PageHeader` is de paginabrede navigatiekop aan de bovenkant van een pagina. De mobile-first implementatie toont drie vaste elementen: een menuknop (inline-start) die een `Drawer` opent, een gecentreerd logo (onafhankelijk van de knopbreedte dankzij CSS-grid `1fr auto 1fr`), en een zoekknop (inline-end) die een zoekpaneel direct onder de header laat verschijnen.

De navigatie-inhoud (primair en service) wordt via props doorgegeven en in de `DrawerBody` gewikkeld in een `<Stack space="5xl">` zodat de ruimte tussen beide navigaties consistent is.

<!-- VOORBEELD -->

## Use when

- Je een globale paginaheader nodig hebt voor een website of applicatie.
- Primaire navigatie via een overlay-lade (`Drawer`) wordt aangeboden.
- De pagina een zoekfunctie heeft die inline in de header wordt getriggerd.

## Don't use when

- Je enkel een large viewport layout nodig hebt zonder mobile fallback: `PageHeader` is altijd responsive en toont altijd beide layouts op de juiste viewport.

## Best practices

### Logo-slot

Het `logoSlot` accepteert vrije inhoud: een `<svg>`, een `<img>`, of een `<a>` die een logo omhult. De CSS past `max-block-size` toe op de directe child via `.dsn-page-header__logo > *`:

```html
<!-- <a> met logo (aanbevolen: navigatielink naar homepage) -->
<div class="dsn-page-header__logo">
  <a href="/">
    <svg class="dsn-logo" aria-hidden="true"><!-- paden --></svg>
    <span class="dsn-visually-hidden"
      >Naam organisatie: terug naar homepage</span
    >
  </a>
</div>
```

### Sticky gedrag

Kies het scrollgedrag via de `sticky`-prop:

```html
<!-- Sticky -->
<header class="dsn-page-header dsn-page-header--sticky">...</header>

<!-- Auto-hide: JS beheert data-hidden; CSS-transitie animeert -->
<header class="dsn-page-header dsn-page-header--auto-hide" data-hidden="false">
  ...
</header>
```

Bij `auto-hide` detecteert de React-component de scrollrichting via een `scroll`-eventlistener en schakelt `data-hidden` om.

### Navigatielade

De navigatielade is een `<Drawer side="left">` die altijd in de DOM aanwezig is. De inhoud wordt via `primaryNavigation` en `secondaryNavigation` meegegeven:

```tsx
<PageHeader
  logoSlot={...}
  primaryNavigation={
    <Menu orientation="vertical">
      <MenuLink href="/home" level={1}>Home</MenuLink>
    </Menu>
  }
  secondaryNavigation={
    <Menu orientation="vertical">
      <MenuLink href="/contact" level={1}>Contact</MenuLink>
    </Menu>
  }
/>
```

### Large viewport layout

Boven `64em` (~1024px) toont de header automatisch een tweebandige layout via CSS `display: none`:

- **Masthead**: neutrale achtergrond met logo (inline-start), servicemenu en inline zoekveld (inline-end)
- **Navigatiebalk**: accent-1 achtergrond met de primaire navigatie

De mobile layout (hamburger + drawer) valt via `display: none` volledig uit de accessibility tree.

```html
<header class="dsn-page-header">
  <!-- Small viewport (verborgen boven 64em) -->
  <div class="dsn-page-header__small-layout">
    <!-- bestaande mobile markup -->
  </div>

  <!-- Large viewport (zichtbaar boven 64em) -->
  <div class="dsn-page-header__large-layout">
    <div class="dsn-page-header__masthead">
      <div class="dsn-page-header__masthead-inner">
        <div class="dsn-page-header__logo">
          <a href="/"><!-- Logo --></a>
        </div>
        <div class="dsn-page-header__secondary-nav">
          <nav aria-label="Service-navigatie">
            <ul class="dsn-menu dsn-menu--horizontal">
              <li><a class="dsn-menu-link" href="/contact">Contact</a></li>
            </ul>
          </nav>
          <div class="dsn-page-header__searchbox">
            <!-- SearchInput + Zoeken-knop -->
          </div>
        </div>
      </div>
    </div>
    <div class="dsn-page-header__navbar">
      <div class="dsn-page-header__navbar-inner">
        <nav aria-label="Hoofd-navigatie">
          <ul class="dsn-menu dsn-menu--horizontal">
            <li><a class="dsn-menu-link" href="/home">Home</a></li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</header>
```

```tsx
<PageHeader
  logoSlot={
    <a href="/">
      <Logo aria-hidden={true} />
      <span className="dsn-visually-hidden">Terug naar homepage</span>
    </a>
  }
  primaryNavigation={
    <Menu orientation="horizontal">
      <MenuLink href="/home" level={1}>
        Home
      </MenuLink>
    </Menu>
  }
  secondaryNavigation={
    <Menu orientation="horizontal">
      <MenuLink href="/contact" level={1}>
        Contact
      </MenuLink>
    </Menu>
  }
  searchSlot={
    <>
      <SearchInput placeholder="Zoeken…" aria-label="Zoekopdracht" />
      <Button variant="strong">Zoeken</Button>
    </>
  }
/>
```

**Tab-volgorde op large viewport** (visuele leesvolgorde = DOM-volgorde = focus-volgorde):

1. Logo (link naar homepage)
2. Service-navigatie items
3. Inline zoekveld + Zoeken-knop
4. Primaire navigatie items

### Compact layout (large viewport)

De `layout="compact"` variant plaatst logo, primaire navigatie en servicemenu in één enkele rij via CSS-grid `1fr auto 1fr`. Gebruik dit wanneer de primaire navigatie maar één niveau heeft en de branding compacter mag:

```html
<!-- HTML/CSS: compact layout modifier -->
<header class="dsn-page-header dsn-page-header--compact">
  <!-- Small viewport layout (ongewijzigd) -->
  <div class="dsn-page-header__small-layout">...</div>

  <!-- Compact balk (zichtbaar boven 64em) -->
  <div class="dsn-page-header__compact-layout">
    <div class="dsn-page-header__compact-inner">
      <div class="dsn-page-header__logo">
        <a href="/"><!-- Logo --></a>
      </div>
      <div class="dsn-page-header__compact-primary-nav">
        <nav aria-label="Hoofd-navigatie">
          <!-- horizontale Menu met MenuLink items -->
        </nav>
      </div>
      <div class="dsn-page-header__compact-secondary">
        <!-- horizontale Menu met servicemenu items -->
        <button
          type="button"
          class="dsn-button dsn-button--subtle dsn-button--icon-only"
          aria-expanded="false"
          aria-controls="compact-search-panel"
        >
          <svg class="dsn-icon" aria-hidden="true"><!-- search --></svg>
          <span class="dsn-button__label">Zoeken</span>
        </button>
      </div>
    </div>
    <div class="dsn-page-header__search-panel" id="compact-search-panel" hidden>
      <!-- zoekveld + zoekknop -->
    </div>
  </div>
</header>
```

```tsx
<PageHeader
  layout="compact"
  logoSlot={
    <a href="/">
      <Logo aria-hidden={true} />
    </a>
  }
  primaryNavigationLarge={
    <Menu orientation="horizontal">
      <MenuLink href="/home" level={1} current>
        Home
      </MenuLink>
    </Menu>
  }
  secondaryNavigationLarge={
    <Menu orientation="horizontal">
      <MenuLink href="/contact" level={1}>
        Contact
      </MenuLink>
    </Menu>
  }
/>
```

### Inverse kleurvariant

De `colorScheme="inverse"` variant gebruikt `accent-1-inverse` achtergronden op de navbar en compact balk voor prominente branding. Het masthead blijft altijd neutraal (`neutral.bg-document`). Logo-kleuren en menu-items passen zich automatisch aan via CSS context overrides: geen extra klassen nodig.

```html
<!-- HTML/CSS: inverse modifier (combineerbaar met andere modifiers) -->
<header class="dsn-page-header dsn-page-header--inverse">...</header>

<!-- Combinatie met compact layout -->
<header
  class="dsn-page-header dsn-page-header--compact dsn-page-header--inverse"
>
  ...
</header>
```

```tsx
<PageHeader colorScheme="inverse" logoSlot={...} ... />

{/* Combinatie */}
<PageHeader layout="compact" colorScheme="inverse" logoSlot={...} ... />
```

De inverse modifier overschrijft via CSS custom properties:

- `--dsn-page-header-background-color` → `accent-1-inverse.bg-default` (small viewport balk)
- `--dsn-page-header-navbar-background-color` → `accent-1-inverse.bg-default`
- `--dsn-page-header-compact-background-color` → `accent-1-inverse.bg-default`
- `--dsn-page-header-search-panel-background-color` → `accent-1-inverse.bg-document`
- `--dsn-logo-color-primary` / `--dsn-logo-color-label` → wit / achtergrondkleur (reset in masthead)
- `--dsn-menu-item-color` en `--dsn-button-subtle-color` → wit op alle inverse vlakken

### Zoekpaneel (small viewport)

Het zoekpaneel verschijnt direct onder de header-binnenbalk. Het paneel bevat een `SearchInput` en een zoekknop:

Het paneel klapt open en dicht met een CSS-transitie: `grid-template-rows` gaat van `0fr` naar `1fr`, met `padding-block` en `opacity` mee. `display` transitioneert met `allow-discrete`, zodat het paneel zichtbaar blijft terwijl het dichtklapt in plaats van meteen te verdwijnen. Er is geen JavaScript voor nodig: het `hidden`-attribuut blijft de enige schakelaar. Bij `prefers-reduced-motion: reduce` verschijnt en verdwijnt het paneel direct.

```html
<div class="dsn-page-header__search-panel" id="search-panel" hidden>
  <div class="dsn-page-header__search-inner">
    <div class="dsn-search-input-wrapper">
      <input
        type="search"
        class="dsn-text-input dsn-search-input"
        placeholder="Zoeken…"
        aria-label="Zoekopdracht"
      />
    </div>
    <button type="button" class="dsn-button dsn-button--strong">
      <span class="dsn-button__label">Zoeken</span>
    </button>
  </div>
</div>
```

## Design tokens

| Token                                             | Standaard                            | Omschrijving                              |
| ------------------------------------------------- | ------------------------------------ | ----------------------------------------- |
| `--dsn-page-header-background-color`              | `{dsn.color.neutral.bg-document}`    | Achtergrondkleur                          |
| `--dsn-page-header-border-block-end-width`        | `{dsn.border.width.thick}`           | Breedte onderkantrand (4px)               |
| `--dsn-page-header-border-block-end-color`        | `{dsn.color.accent-1.color-default}` | Kleur onderkantrand (merkkleur)           |
| `--dsn-page-header-padding-block`                 | `{dsn.space.block.md}`               | Verticale padding binnenbalk              |
| `--dsn-page-header-padding-inline`                | `{dsn.space.inline.xl}`              | Horizontale padding binnenbalk            |
| `--dsn-page-header-z-index`                       | `300`                                | Z-index voor sticky: onder backdrop (400) |
| `--dsn-page-header-logo-max-block-size`           | `2rem`                               | Maximale hoogte logo (32px)               |
| `--dsn-page-header-search-panel-background-color` | `{dsn.color.accent-1.bg-default}`    | Achtergrond zoekpaneel (small)            |
| `--dsn-page-header-search-panel-padding-block`    | `{dsn.space.block.md}`               | Verticale padding zoekpaneel (small)      |
| `--dsn-page-header-search-panel-padding-inline`   | `{dsn.space.inline.xl}`              | Horizontale padding zoekpaneel (small)    |
| `--dsn-page-header-masthead-background-color`     | `{dsn.color.neutral.bg-document}`    | Masthead achtergrond (large)              |
| `--dsn-page-header-masthead-padding-block`        | `{dsn.space.block.xl}`               | Verticale padding masthead (large)        |
| `--dsn-page-header-masthead-padding-inline`       | `{dsn.space.inline.xl}`              | Horizontale padding masthead (large)      |
| `--dsn-page-header-navbar-background-color`       | `{dsn.color.accent-1.bg-default}`    | Navigatiebalk achtergrond (large)         |
| `--dsn-page-header-navbar-padding-inline`         | `{dsn.space.inline.xl}`              | Horizontale padding navigatiebalk (large) |
| `--dsn-page-header-secondary-nav-gap`             | `{dsn.space.column.3xl}`             | Gap servicemenu ↔ zoekveld (large)        |
| `--dsn-page-header-compact-background-color`      | `{dsn.color.neutral.bg-document}`    | Compact balk achtergrond                  |
| `--dsn-page-header-compact-padding-block`         | `{dsn.space.block.xl}`               | Verticale padding compact balk            |
| `--dsn-page-header-compact-padding-inline`        | `{dsn.space.inline.xl}`              | Horizontale padding compact balk          |

## Accessibility

- `<header>` heeft impliciete `role="banner"`: geen extra ARIA nodig.
- De menuknop en zoekknop gebruiken altijd een `dsn-button__label` span voor de toegankelijke naam: nooit `aria-label`.
- Zoekknop heeft `aria-expanded` (false/true) en `aria-controls` gericht op het zoekpaneel-ID.
- Bij openen zoekpaneel: focus verplaatst automatisch naar het `<input>` van de `SearchInput`.
- Bij sluiten zoekpaneel: focus keert terug naar de zoek-/sluitknop.
- Alle `<nav>`-elementen (zowel in de Drawer als op large viewport) gebruiken `aria-label` ("Hoofd-navigatie", "Service-navigatie"): geen verborgen headings, zodat de heading-hiërarchie van de pagina niet vervuild wordt vóór de `<h1>`.
- Drawer-focusbeheer wordt verzorgd door het bestaande `Drawer`-component.
- Op large viewport: `dsn-page-header__small-layout` en `dsn-page-header__large-layout` worden geswitcht met `display: none`: de inactieve sectie valt automatisch uit de accessibility tree.
