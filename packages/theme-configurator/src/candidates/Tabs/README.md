# Tabs

**Status: kandidaat.** Nog geen component van de starter kit; zie [het overzicht](../README.md).

Wisselen tussen panelen die dezelfde plek delen, volgens het WAI-ARIA-patroon voor tabs.

## Waarom nodig

Het instelpaneel van de configurator heeft vijf onderdelen (Kleur, Typografie, Ruimte, Vorm, Schaduw) in een kolom van ongeveer 400px. Onder elkaar wordt dat te lang; tabs houden één onderdeel tegelijk in beeld.

## HTML/CSS

```html
<div class="dsn-tabs">
  <div class="dsn-tabs__list" role="tablist" aria-label="Onderdelen">
    <button
      class="dsn-tabs__tab"
      type="button"
      role="tab"
      id="tab-kleur"
      aria-selected="true"
      aria-controls="panel-kleur"
      tabindex="0"
    >
      Kleur
    </button>
    <button
      class="dsn-tabs__tab"
      type="button"
      role="tab"
      id="tab-typografie"
      aria-selected="false"
      aria-controls="panel-typografie"
      tabindex="-1"
    >
      Typografie
    </button>
  </div>
  <div
    class="dsn-tabs__panel"
    role="tabpanel"
    id="panel-kleur"
    aria-labelledby="tab-kleur"
    tabindex="0"
  >
    …
  </div>
  <div
    class="dsn-tabs__panel"
    role="tabpanel"
    id="panel-typografie"
    aria-labelledby="tab-typografie"
    tabindex="0"
    hidden
  >
    …
  </div>
</div>
```

Het toetsenbordgedrag zit in de React-laag; zonder JavaScript heeft de HTML-laag het zelf nodig.

## React

```tsx
<Tabs
  label="Onderdelen"
  tabs={[
    { id: 'kleur', label: 'Kleur', content: <ColorPanel /> },
    { id: 'typografie', label: 'Typografie', content: <TypePanel /> },
  ]}
/>
```

Ongecontroleerd met `defaultSelectedId`, of gecontroleerd met `selectedId` en `onSelect`.

## Toegankelijkheid

- Alleen de gekozen tab staat in de tabvolgorde. Pijl links en rechts gaan naar de vorige en volgende tab en kiezen die meteen (automatische activatie); Home en End gaan naar de eerste en laatste.
- Een tab krijgt zijn naam van zijn tekst. Het paneel is gekoppeld met `aria-labelledby` en is zelf focusbaar, zodat Tab vanaf de tablijst naar de inhoud gaat.
- Alle panelen blijven in de DOM (met `hidden`), zodat wat je in een paneel invulde blijft staan.
- Past de rij niet, dan scrolt alleen de tablijst, niet de pagina.
- In forced colors krijgt de gekozen tab een onderstreping in `Highlight`.

## Nog te doen voor een systeemcomponent

Component-tokens (`dsn.tabs.*`), een HTML-variant met eigen script of zonder JavaScript, een manifest, een Figma-matrix en Storybook-docs.
