# SegmentedControl

**Status: kandidaat.** Nog geen component van de starter kit; zie [het overzicht](../README.md).

Eén keuze uit een paar opties, als aaneengesloten knoppen. Voor een keuze die direct iets omzet, met twee tot vijf korte opties.

## Waarom nodig

De configurator heeft veel van zulke keuzes: light of dark, de viewport, de dichtheid, HEX of OKLCH, en op een klein scherm Instellen of Voorbeeld. Een RadioGroup neemt daarvoor te veel ruimte in en leest als formuliervraag; een Select verbergt de opties.

## HTML/CSS

```html
<fieldset class="dsn-segmented-control">
  <legend class="dsn-segmented-control__legend">Modus</legend>
  <div class="dsn-segmented-control__options">
    <label class="dsn-segmented-control__option">
      <input
        class="dsn-segmented-control__input"
        type="radio"
        name="mode"
        value="light"
        checked
      />
      <span class="dsn-segmented-control__label">Light</span>
    </label>
    <label class="dsn-segmented-control__option">
      <input
        class="dsn-segmented-control__input"
        type="radio"
        name="mode"
        value="dark"
      />
      <span class="dsn-segmented-control__label">Dark</span>
    </label>
  </div>
</fieldset>
```

Verberg de legend alleen visueel met `dsn-visually-hidden` als de context de groep al benoemt.

## React

```tsx
<SegmentedControl
  legend="Modus"
  options={[
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
  ]}
  value={mode}
  onChange={setMode}
/>
```

## Toegankelijkheid

- Native radioknoppen in een fieldset: de legend is de naam van de groep, pijltjestoetsen kiezen, en de status "geselecteerd" komt van de browser.
- De radioknop ligt onzichtbaar over het label en blijft focusbaar; de focusstijl staat op het label.
- Elk segment is minimaal een pointer target groot. Past de rij niet, dan lopen de segmenten door naar de volgende regel; een label breekt nooit midden in een woord.
- In forced colors krijgt het gekozen segment een omlijning in `Highlight`.

## Nog te doen voor een systeemcomponent

Component-tokens (`dsn.segmented-control.*`), een size-modifier, een manifest, een Figma-matrix en Storybook-docs.
