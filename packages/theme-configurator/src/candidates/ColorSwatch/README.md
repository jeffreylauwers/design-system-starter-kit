# ColorSwatch

**Status: kandidaat.** Nog geen component van de starter kit; zie [het overzicht](../README.md).

Eén kleur met naam, waarde en eventueel het contrast. De swatch is een knop: de aanroeper bepaalt wat activeren doet, meestal de waarde kopiëren.

## Waarom nodig

De configurator toont per kleurgroep 15 schakeringen, plus 15 inverse. Elke schakering moet te zien, te lezen en te kopiëren zijn, met het contrast erbij.

## HTML/CSS

```html
<button
  type="button"
  class="dsn-color-swatch"
  style="--dsn-color-swatch-color: #1e1930"
>
  <span class="dsn-visually-hidden"
    >color-default: #2f3a8c, contrast 7,8:1, haalt 4,5:1, kopieer</span
  >
  <span class="dsn-color-swatch__chip" aria-hidden="true"></span>
  <span class="dsn-color-swatch__name" aria-hidden="true">color-default</span>
  <span class="dsn-color-swatch__value" aria-hidden="true">#2f3a8c</span>
  <span class="dsn-color-swatch__contrast" aria-hidden="true"
    ><!-- icoon -->7,8:1</span
  >
</button>
```

De kleur komt binnen via `--dsn-color-swatch-color` op het element: dat is data, geen stijlkeuze. Te weinig contrast: `dsn-color-swatch__contrast--fail`. Een opmerking, zoals een fallback: `dsn-color-swatch__note`.

## React

```tsx
<ColorSwatch
  color="#2f3a8c"
  name="color-default"
  value="#2f3a8c"
  contrast={{ ratio: 7.82, required: 4.5 }}
  onClick={() => copy('#2f3a8c')}
/>
```

## Toegankelijkheid

- De toegankelijke naam is één zin in een visueel verborgen span: naam, waarde, contrast, opmerking en actie. Zo hangt hij niet af van hoe een browser losse tekstdelen aan elkaar plakt, en bevat hij de zichtbare tekst.
- Voldoende of onvoldoende contrast staat er met een icoon en een getal, nooit alleen met kleur.
- Het kleurvlak houdt zijn kleur in forced colors (`forced-color-adjust: none`).
- Melden dat er gekopieerd is, doet de aanroeper, met een live region.

## Nog te doen voor een systeemcomponent

Component-tokens (`dsn.color-swatch.*`), een manifest, een Figma-matrix en Storybook-docs.
