# With Sidebar Page

Paginatemplate met een vaste zijkolom voor subnavigatie, zichtbaar vanaf het large breakpoint.

## Doel

Het With Sidebar Page template bouwt voort op de Base Page-structuur en voegt een `dsn-sidebar-layout` toe: een flexbox-tweekoloms splitsing waarbij de linkerzijde een vaste breedte heeft voor subnavigatie en de rechterkolom de hoofdinhoud bevat.

De sidebar is alleen zichtbaar op large viewport (>= 64em), hetzelfde moment waarop `dsn-page-header__large-layout` actief wordt en de Level 1 navigatie horizontaal in de header verschijnt. Op kleinere viewports staat de sidebar verborgen (`display: none`) en vult de hoofdinhoud de volledige breedte.

Templates zijn Storybook-only composities van bestaande componenten. De `dsn-sidebar-layout` CSS staat in `page-body.css`.

<!-- VOORBEELD -->

## Layout-structuur

```html
<!-- Met sidebar (pagina met sub-items) -->
<div class="dsn-sidebar-layout">
  <aside class="dsn-sidebar-layout__sidebar">
    <nav aria-label="Sub-navigatie">
      <!-- Menu met level-2 MenuLinks -->
    </nav>
  </aside>
  <main id="main-content" class="dsn-sidebar-layout__main">
    <!-- 12-koloms grid identiek aan Base Page -->
  </main>
</div>

<!-- Zonder sidebar (pagina zonder sub-items) -->
<main id="main-content">
  <!-- 12-koloms grid identiek aan Base Page -->
</main>
```

```tsx
{
  /* Met sidebar */
}
<PageBody>
  <div className="dsn-sidebar-layout">
    <aside className="dsn-sidebar-layout__sidebar">
      <nav aria-label="Sub-navigatie">
        <Menu orientation="vertical">
          <MenuLink href="/sub-1" level={2} current>
            Overzicht
          </MenuLink>
          <MenuLink href="/sub-2" level={2}>
            Sub-item 1
          </MenuLink>
        </Menu>
      </nav>
    </aside>
    <main id="main-content" tabIndex={-1} className="dsn-sidebar-layout__main">
      {/* grid-inhoud */}
    </main>
  </div>
</PageBody>;

{
  /* Zonder sidebar */
}
<PageBody>
  <main id="main-content" tabIndex={-1}>
    {/* grid-inhoud */}
  </main>
</PageBody>;
```

| Viewport | Sidebar                                                                     | Hoofdinhoud   |
| -------- | --------------------------------------------------------------------------- | ------------- |
| < 64em   | verborgen                                                                   | volle breedte |
| >= 64em  | vaste breedte (`--dsn-sidebar-layout-sidebar-inline-size`, default `16rem`) | `flex: 1`     |

## Sidebar breedte aanpassen

De sidebar breedte is instelbaar via een CSS custom property:

```html
<div
  class="dsn-sidebar-layout"
  style="--dsn-sidebar-layout-sidebar-inline-size: 20rem;"
></div>
```

```tsx
<div
  className="dsn-sidebar-layout"
  style={{ '--dsn-sidebar-layout-sidebar-inline-size': '20rem' } as React.CSSProperties}
>
```

## Wel gebruiken als...

- De pagina subnavigatie heeft (Level 2 menu-items) die naast de hoofdinhoud getoond moet worden.
- Je dezelfde paginastructuur als Base Page wilt, aangevuld met een zijkolom.

## Niet gebruiken als...

- De pagina geen Level 2 sub-items heeft: gebruik dan Base Page rechtstreeks.
- Je sidebar-content wilt tonen op alle viewports: dit patroon verbergt de sidebar op small en medium viewports.

## Toegankelijkheid

- De `<aside>` bevat een `<nav>` met een beschrijvend `aria-label` (bijv. `"Sub-navigatie"`).
- De sidebar-inhoud is alleen zichtbaar op large viewport. Zorg dat de subnavigatie op small/medium viewports op een andere manier bereikbaar is als dat inhoudelijk noodzakelijk is.
- De `<main>` heeft `id="main-content"` en `tabIndex={-1}` voor de SkipLink focus.
