# PageBody

Structurele inhoudcontainer die de ruimte tussen `PageHeader` en `PageFooter` opvult.

## Doel

`PageBody` is het flex-item met `flex: 1` binnen `PageLayout`. Het zorgt ervoor dat de footer altijd onderaan de viewport staat, ongeacht de hoeveelheid inhoud. In de eenvoudigste template bevat `PageBody` alleen een `<main>`. In complexere templates kan het ook breadcrumbs, een zijnavigatie of andere structurele elementen bevatten die geen onderdeel zijn van `<main>` zelf.

`PageBody` is een transparante structuurlaag zonder eigen visuele stijl.

<!-- VOORBEELD -->

## Wel gebruiken als...

- Je de ruimte tussen `PageHeader` en `PageFooter` wilt opvullen zodat de footer altijd onderaan staat.
- Je structurele elementen zoals `<main>`, breadcrumbs of een side navigation wilt groeperen.
- Je een layoutpunt nodig hebt voor complexere paginastructuren.

## Niet gebruiken als...

- Je `PageBody` buiten een `PageLayout` plaatst: gebruik dan `Stack`, `Grid` of `Container`.
- Je alleen een kaart of sectie wilt opmaken: gebruik dan `Stack` of `Grid`.

## Goed gebruik

### `<main>` en skip-link

De `<main>` met `id="main-content"` is een verantwoordelijkheid van de **template**, niet van `PageBody` zelf. Plaatst `<main id="main-content" tabIndex={-1}>` als directe child zodat de skip-link ernaar kan springen. Het `tabIndex={-1}` is nodig zodat programmatische focus werkt ook al is `<main>` niet natively focusbaar.

```html
<div class="dsn-page-body">
  <main id="main-content" tabindex="-1">
    <!-- pagina-inhoud -->
  </main>
</div>
```

```tsx
<PageBody>
  <main id="main-content" tabIndex={-1}>
    <Container>...</Container>
  </main>
</PageBody>
```

### Toekomstige uitbreiding: side navigation

`dsn-page-body__content` (nog niet geïmplementeerd) biedt straks een inner wrapper voor side nav + main naast elkaar:

```html
<div class="dsn-page-body">
  <nav class="dsn-breadcrumbs" aria-label="Kruimelpad">...</nav>
  <div class="dsn-page-body__content">
    <nav class="dsn-side-nav" aria-label="Sectienavigatie">...</nav>
    <main id="main-content" tabindex="-1">...</main>
  </div>
</div>
```

## Design tokens

`PageBody` heeft geen component-specifieke tokens. `flex: 1` is een layout-constante.

## Toegankelijkheid

### Transparante structuurlaag

`PageBody` heeft geen `role`, `aria-label` of andere ARIA-attributen. Screenreaders navigeren via de children: de `<main>` is het relevante landmark.

### Skip-link bestemming

De skip-link wijst altijd naar de `<main id="main-content">` binnen `PageBody`, niet naar `PageBody` zelf. Zorg dat de `<main>` het `id` heeft en niet de `PageBody`-wrapper.
