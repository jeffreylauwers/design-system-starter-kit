# PageLayout

Structurele full-page layout container die `PageHeader`, `PageBody` en `PageFooter` verticaal stapelt.

## Doel

`PageLayout` is de buitenste wrapper voor elke pagina in de applicatie. Het component zorgt via `display: flex; flex-direction: column` en `min-block-size: 100dvh` dat de pagina altijd de volledige viewport vult. In combinatie met `PageBody` (dat `flex: 1` heeft) staat `PageFooter` altijd onderaan de viewport, ongeacht de hoeveelheid content.

`PageLayout` bevat geen eigen visuele stijl: geen kleur, padding of border. Het is een transparante structuurlaag.

<!-- VOORBEELD -->

## Use when

- Je de basisstructuur van een pagina opzet met `PageHeader`, `PageBody` en `PageFooter`.
- De footer altijd onderaan de viewport moet staan, ook als de pagina weinig content heeft.
- Je de drie pagina-onderdelen in één consistente wrapper wilt samenbrengen.

## Don't use when

- Je een gedeelte van een pagina opmaakt, zoals een kaart of sectie: gebruik dan `Stack`, `Grid` of `Container`.
- Je geen volledige viewport-hoogte nodig hebt.

## Best practices

### Skip-link (aanbevolen)

Templates die `PageLayout` gebruiken moeten een skip-link als **eerste focusbaar element** bevatten, vóór `PageLayout`. Dit voldoet aan WCAG 2.4.1 (Bypass Blocks). De `SkipLink`-component staat buiten `PageLayout`:

```html
<a href="#main-content" class="dsn-skip-link">Ga direct naar de hoofdinhoud</a>
<div class="dsn-page-layout">
  <header class="dsn-page-header">...</header>
  <div class="dsn-page-body">
    <main id="main-content" tabindex="-1">...</main>
  </div>
  <footer class="dsn-page-footer">...</footer>
</div>
```

```tsx
<SkipLink href="#main-content" />
<PageLayout>
  <PageHeader logoSlot={<Logo />} />
  <PageBody>
    <main id="main-content" tabIndex={-1}>
      <Container>...</Container>
    </main>
  </PageBody>
  <PageFooter slot1={<Logo />} />
</PageLayout>
```

### `main`-element en `id="main-content"`

Geef de `<main>` altijd een `id="main-content"` zodat de skip-link er naartoe kan springen. Voeg `tabIndex={-1}` toe zodat programmatische focus werkt ook als `<main>` niet natively focusbaar is.

### Semantische landmarks

`PageLayout` zelf is een neutrale `<div>` zonder semantische rol. De landmarks komen van de children:

- `PageHeader` rendert een `<header>` (impliciet `role="banner"`)
- `PageBody` rendert een `<div>` zonder rol — de semantische `<main>` ligt binnenin als child
- `PageFooter` rendert een `<footer>` (impliciet `role="contentinfo"`)

## Design tokens

`PageLayout` heeft geen component-specifieke tokens. De `min-block-size: 100dvh` is een structurele constante, geen designbeslissing.

## Accessibility

### Transparante structuurlaag

`PageLayout` heeft geen `role`, `aria-label` of andere ARIA-attributen. Screenreaders navigeren via de landmarks in de children: `<header>`, `<main>` en `<footer>`.

### Skip-link vereiste

Elke template die `PageLayout` gebruikt moet een `<SkipLink href="#main-content">` als eerste focusbaar element bevatten (vóór `PageLayout`). Dit is een template-vereiste, niet ingebouwd in `PageLayout` zelf, zodat de skip-link flexibel blijft voor meerdere talen en bestemmingen.
