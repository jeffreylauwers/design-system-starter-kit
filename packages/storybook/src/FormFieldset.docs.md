# Form Fieldset

Container component voor groep controls die fieldset/legend gebruikt voor semantische HTML.

## Doel

De FormFieldset component is de fieldset/legend variant van FormField. Het combineert FormFieldLegend, FormFieldDescription, FormFieldErrorMessage, groep controls (CheckboxGroup, RadioGroup, DateInputGroup), en FormFieldStatus. Gebruikt `<fieldset>` en `<legend>` elementen voor correcte semantiek bij groep controls. De legend hergebruikt FormFieldLabel CSS classes voor consistente styling. Net als FormField krijgt het een dikke rode linker border bij invalid state. Description, error en status worden via `aria-describedby` op het `<fieldset>` zelf gekoppeld: een groep heeft geen enkele control om die koppeling aan te hangen. FormFieldset is specifiek voor groepen - gebruik FormField voor individuele controls.

> **Codevoorbeeld met context**: De HTML/CSS tab toont een `CheckboxGroup` met `CheckboxOption` componenten als representatieve children. `FormFieldset` is een wrapper voor groep controls: de children vormen de daadwerkelijke invoergroep.

<!-- VOORBEELD -->

## Use when

- Je een groep checkboxes hebt (CheckboxGroup).
- Je een groep radio buttons hebt (RadioGroup).
- Je een Date Input Group hebt (later).
- Je semantisch correcte fieldset/legend markup wilt.

## Don't use when

- Je een enkel tekst invoerveld hebt: gebruik [FormField](/docs/components-formfield--docs).
- Je een enkele textarea hebt: gebruik FormField.
- Je een enkel select dropdown hebt: gebruik FormField.

## Structuur

FormFieldset combineert deze sub-componenten in de juiste volgorde:

1. **FormFieldLegend** (verplicht) - Met optionele suffix, hergebruikt FormFieldLabel styling
2. **FormFieldDescription** (optioneel) - Help tekst
3. **FormFieldErrorMessage** (optioneel) - Foutmelding met icoon
4. **Group Control** (verplicht) - CheckboxGroup, RadioGroup, DateInputGroup
5. **FormFieldStatus** (optioneel) - Status feedback met variant

### Invalid state

Wanneer er een `error` prop aanwezig is, krijgt het hele FormFieldset een dikke rode border aan de linkerzijde en extra padding, net als FormField. Dit trekt visueel de aandacht naar het probleem.

## Best practices

### Props

- **legend** - Altijd verplicht, houd kort (1-3 woorden)
- **legendSuffix** - Gebruik "(niet verplicht)" of "(verplicht)" waar nodig
- **description** - Voor hulptekst die altijd zichtbaar is
- **error** - Voor validatie fouten, toon alleen na interactie
- **status** - Voor realtime feedback
- **statusVariant** - 'default' (subtle), 'positive' (success), 'warning' (caution)
- **statusLive** - Alleen aanzetten wanneer de statustekst tijdens interactie verandert. Een statische status als live region wordt dubbel voorgelezen.
- **id** - Optioneel. Wordt de basis voor de gegenereerde ID's van description, error en status. Zonder `id` valt dit terug op `useId()`.

### Timing

- **Description**: Altijd zichtbaar vanaf start
- **Error**: Alleen na blur of submit van de groep
- **Status**: Afhankelijk van variant (zie FormFieldStatus docs)

### Groepering

- **CheckboxGroup**: Voor meerdere selecties mogelijk
- **RadioGroup**: Voor één selectie uit meerdere (verplicht `name` attribuut op RadioOptions!)
- **DateInputGroup**: Later, voor dag/maand/jaar inputs

## Design tokens

FormFieldset hergebruikt FormField design tokens:

| Token                                                | Beschrijving                                              |
| ---------------------------------------------------- | --------------------------------------------------------- |
| `--dsn-form-field-invalid-border-inline-start-color` | Linker border kleur bij invalid state (rode error border) |
| `--dsn-form-field-invalid-border-inline-start-width` | Linker border breedte bij invalid state (medium)          |
| `--dsn-form-field-invalid-padding-inline-start`      | Linker padding bij invalid state (voor border ruimte)     |

Plus fieldset reset styling (geen default border/padding/margin).

Plus de tokens van de sub-componenten:

- FormFieldLabel tokens voor legend styling (hergebruikt!)
- FormFieldDescription tokens voor description styling
- FormFieldErrorMessage tokens voor error styling
- FormFieldStatus tokens voor status styling

## Accessibility

- **fieldset/legend** - Semantisch correct voor groep controls
- **legend element** - Wordt door screenreaders aangekondigd als groepslabel
- **aria-describedby op het fieldset** - FormFieldset genereert ID's voor description, error en status en zet `aria-describedby` op het `<fieldset>`, in de volgorde description → error → status. Bij een groep is dat de juiste plek: er is geen enkele control om de koppeling aan te hangen, en de beschrijving geldt voor de hele groep.
- **Groepering** - Screenreaders kondigen aan: "groep: [legend], [aantal opties]"
- **Navigatie** - Tab key navigeert tussen opties in de groep
- **Radio groups** - Pijltjestoetsen navigeren binnen de groep
- **Invalid state** - Border + error message communiceren het probleem
- **Disabled fieldset** - Disablet alle controls binnen de groep (gebruik met zorg)

## Voorbeelden

```tsx
// Basic checkbox group
<FormFieldset legend="Interesses">
  <CheckboxGroup>
    <CheckboxOption label="Sport" value="sport" />
    <CheckboxOption label="Muziek" value="music" />
  </CheckboxGroup>
</FormFieldset>

// Radio group met alles
<FormFieldset
  legend="Verzendmethode"
  legendSuffix="(verplicht)"
  description="Kies hoe je bestelling wilt ontvangen"
  error="Selecteer een optie"
  status="Gratis vanaf €50"
  id="verzendmethode"
>
  <RadioGroup>
    <RadioOption name="shipping" label="Standaard" value="standard" />
    <RadioOption name="shipping" label="Express" value="express" />
  </RadioGroup>
</FormFieldset>
```

De gerenderde HTML van dat laatste voorbeeld:

```html
<fieldset
  class="dsn-form-field dsn-form-field--invalid"
  id="verzendmethode"
  aria-describedby="verzendmethode-description verzendmethode-error verzendmethode-status"
>
  <legend class="dsn-form-field-label">
    Verzendmethode
    <span class="dsn-form-field-label-suffix">(verplicht)</span>
  </legend>
  <p class="dsn-form-field-description" id="verzendmethode-description">
    Kies hoe je bestelling wilt ontvangen
  </p>
  <p class="dsn-form-field-error-message" id="verzendmethode-error">
    <svg class="dsn-icon" aria-hidden="true"><!-- exclamation-circle --></svg>
    Selecteer een optie
  </p>
  <div class="dsn-radio-group"><!-- RadioOptions --></div>
  <p class="dsn-form-field-status" id="verzendmethode-status">
    Gratis vanaf €50
  </p>
</fieldset>
```
