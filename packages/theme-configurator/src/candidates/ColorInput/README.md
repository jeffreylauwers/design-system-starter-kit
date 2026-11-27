# ColorInput

**Status: kandidaat.** Nog geen component van de starter kit; zie [het overzicht](../README.md).

Een kleur intypen in elk CSS-formaat, of kiezen met de kleurkiezer van de browser.

## Waarom nodig

De configurator vraagt per kleurgroep een basiskleur. Een gewone `input type="color"` kent alleen `#rrggbb`, terwijl Start zijn basiskleuren in `oklch()` vastlegt; een TextInput alleen laat de kleur niet zien.

## HTML/CSS

```html
<div class="dsn-color-input">
  <label for="accent-picker" class="dsn-visually-hidden"
    >Kleurkiezer voor accent-1</label
  >
  <input
    id="accent-picker"
    type="color"
    class="dsn-color-input__picker"
    value="#0057b0"
  />
  <input
    id="accent"
    type="text"
    class="dsn-text-input dsn-color-input__text"
    value="oklch(0.468 0.164 255.8)"
    spellcheck="false"
    autocomplete="off"
  />
</div>
```

Het tekstveld is een `dsn-text-input`; `color-input.css` declareert die afhankelijkheid (`@dsn-depends-on: text-input`).

## React

```tsx
<FormField label="Basiskleur" htmlFor="accent">
  <ColorInput
    id="accent"
    value={draft}
    pickerValue="#0057b0"
    pickerLabel="Kleurkiezer voor accent-1"
    invalid={!isValidColor(draft)}
    onChange={setDraft}
  />
</FormField>
```

`pickerValue` is dezelfde kleur als `#rrggbb`. Het omrekenen doet de aanroeper, zodat het component geen kleurbibliotheek nodig heeft.

## Toegankelijkheid

- Het tekstveld krijgt zijn naam van het FormField-label; de kleurkiezer heeft een eigen, visueel verborgen label.
- Een ongeldige waarde krijgt `aria-invalid`; de foutmelding komt van FormField.
- De kleurkiezer is minimaal een pointer target groot.

## Nog te doen voor een systeemcomponent

Component-tokens (`dsn.color-input.*`), de React-CSS die `text-input.css` zelf importeert, een manifest, een Figma-matrix en Storybook-docs.
