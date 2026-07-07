# Base Page

Eerste paginatemplate: de basisstructuur voor elke pagina in de applicatie.

## Doel

Het Base Page template combineert `Body`, `SkipLink`, `PageLayout`, `PageHeader`, `PageBody` en `PageFooter` tot een complete, toegankelijke paginastructuur. Het template dient als fundament voor alle volgende templates (Homepage, Detailpagina, Formulierpagina, etc.).

Templates zijn Storybook-only composities van bestaande componenten. Ze bevatten geen eigen CSS of React component.

<!-- VOORBEELD -->

## Verantwoordelijkheidsverdeling

Elk onderdeel van het template heeft een afgebakende taak:

| Onderdeel    | Element                         | Verantwoordelijkheid                                                    |
| ------------ | ------------------------------- | ----------------------------------------------------------------------- |
| `Body`       | `<div class="dsn-body">`        | font-family, achtergrondkleur, basistypografie via CSS-overerving       |
| `SkipLink`   | `<a href="#main-content">`      | WCAG 2.4.1 — eerste focusbaar element, verborgen totdat het gefocust is |
| `PageLayout` | `<div class="dsn-page-layout">` | `display: flex; flex-direction: column; min-block-size: 100dvh`         |
| `PageHeader` | `<header>`                      | logo, navigatie, zoeken (impliciet `role="banner"`)                     |
| `PageBody`   | `<div class="dsn-page-body">`   | `flex: 1` — vult ruimte tussen header en footer                         |
| `<main>`     | `<main id="main-content">`      | Primaire pagina-inhoud (impliciet `role="main"`)                        |
| `PageFooter` | `<footer>`                      | links, logo, colofon (impliciet `role="contentinfo"`)                   |

## Waarom `<main>` in het template en niet in `PageBody`?

`PageBody` is een flexibele container die in complexere templates ook `SideNavigation` en `Breadcrumbs` kan bevatten — elementen die buiten `<main>` vallen. De `<main>` is daarom een expliciete child in het template, niet ingebakken in `PageBody`:

```html
<!-- Base Page: alleen main -->
<div class="dsn-page-body">
  <main id="main-content" tabindex="-1">...</main>
</div>

<!-- Later: Detailpagina met side navigation -->
<div class="dsn-page-body">
  <nav class="dsn-breadcrumbs" aria-label="Kruimelpad">...</nav>
  <div class="dsn-page-body__content">
    <nav class="dsn-side-nav" aria-label="Sectienavigatie">...</nav>
    <main id="main-content" tabindex="-1">...</main>
  </div>
</div>
```

## Padding op `<main>`

Dit template plaatst padding direct als inline style op `<main>`, zonder gebruik van de `Container`-component:

```tsx
<main
  id="main-content"
  tabIndex={-1}
  style={{
    paddingBlock: 'var(--dsn-space-block-6xl)',   // 64px boven en onder
    paddingInline: 'var(--dsn-space-inline-xl)',   // 16px links en rechts
  }}
>
```

**Waarom geen `Container`?** De `Container`-component voegt een `max-inline-size` toe en centreert de content. Voor templates die een andere breedtebeperking nodig hebben (of geen), is directe padding op `<main>` flexibeler. Andere templates kiezen hun eigen spacing-strategie.

**Waarom inline style en niet een CSS-klasse?** De padding is template-specifiek. Een herbruikbare klasse zou suggereren dat dit het standaard patroon is voor alle templates — dat is niet het geval.

## Grid-structuur

Gebruik de `Base Page: with Grid` en `Base Page: Full Width + Grid` stories als startpunt voor pagina's met responsive kolomindeling.

```html
<main id="main-content">
  <!-- Rij 1: volle breedte -->
  <div class="dsn-grid">
    <div class="dsn-col-12">...</div>
  </div>

  <!-- Rij 2: 2 kolommen vanaf md -->
  <div class="dsn-grid">
    <div class="dsn-col-12 dsn-col-md-6">...</div>
    <div class="dsn-col-12 dsn-col-md-6">...</div>
  </div>

  <!-- Rij 3: 3 kolommen vanaf md -->
  <div class="dsn-grid">
    <div class="dsn-col-12 dsn-col-md-4">...</div>
    <div class="dsn-col-12 dsn-col-md-4">...</div>
    <div class="dsn-col-12 dsn-col-md-4">...</div>
  </div>
</main>
```

```tsx
<main id="main-content" tabIndex={-1}>
  <Stack space="2xl">
    <Grid>
      <GridItem colSpan={12}>...</GridItem>
    </Grid>
    <Grid>
      <GridItem colSpan={12} colSpanMd={6}>
        ...
      </GridItem>
      <GridItem colSpan={12} colSpanMd={6}>
        ...
      </GridItem>
    </Grid>
    <Grid>
      <GridItem colSpan={12} colSpanMd={4}>
        ...
      </GridItem>
      <GridItem colSpan={12} colSpanMd={4}>
        ...
      </GridItem>
      <GridItem colSpan={12} colSpanMd={4}>
        ...
      </GridItem>
    </Grid>
  </Stack>
</main>
```

| Rij | Klein (< md) | Medium en groter (>= md) |
| --- | ------------ | ------------------------ |
| 1   | 12/12        | 12/12                    |
| 2   | 12/12 elk    | 6/12 elk                 |
| 3   | 12/12 elk    | 4/12 elk                 |

## Use when

- Je een volledige pagina opbouwt met header, inhoud en footer.
- Je een startpunt nodig hebt voor een nieuw paginatype.

## Don't use when

- Je een gedeelte van een pagina opmaakt: gebruik dan `Stack`, `Grid` of `Container`.
- Je geen `PageHeader` of `PageFooter` nodig hebt.

## Best practices

### Skip-link in het template

De skip-link hoort **niet** in `PageLayout` of `PageHeader` — die components weten niets van de `<main>` verderop in de DOM. Het template is de juiste plek omdat het de volledige paginastructuur overziet. De `SkipLink` moet het **eerste focusbare element** in de DOM zijn:

```tsx
<Body>
  <SkipLink href="#main-content" />  {/* altijd als eerste */}
  <PageLayout>
    <PageHeader ... />
    ...
  </PageLayout>
</Body>
```

### `<main>` met `tabIndex={-1}`

Geef de `<main>` altijd `tabIndex={-1}` zodat de skip-link er programmatisch naartoe kan springen. Zonder dit werkt de focus-sprong niet in alle browsers.

### Zichtbare `<h1>` verplicht

Elke pagina moet een zichtbare `<h1>` bevatten (WCAG 2.4.6). Gebruik de `Heading`-component met `level={1}` als eerste heading in `<main>`.

## Accessibility

### Landmarks

De template biedt alle vereiste ARIA-landmarks automatisch via de semantische HTML-elementen:

- `<header>` → impliciet `role="banner"`
- `<main>` → impliciet `role="main"`
- `<footer>` → impliciet `role="contentinfo"`

Screenreadergebruikers kunnen via landmark-navigatie direct naar elk onderdeel springen.

### Skip-link (WCAG 2.4.1)

De skip-link is verborgen totdat de gebruiker er met Tab op focust, waarna hij zichtbaar wordt. Bij activeren springt de focus naar `<main id="main-content">`. Dit voldoet aan WCAG 2.2 succescriterium 2.4.1 (Bypass Blocks, Level A).
