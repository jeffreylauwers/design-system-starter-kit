# Form Field

Container component dat label, description, error message, form control en status combineert.

## Doel

De FormField component is een complete form field container die alle onderdelen samenbrengt: FormFieldLabel (met optionele suffix), FormFieldDescription, FormFieldErrorMessage, de form control zelf, en FormFieldStatus. Het zorgt voor correcte volgorde, spacing en koppeling via aria-attributen. De component gebruikt een `<div>` wrapper met `<label>` element en is uitsluitend bedoeld voor enkelvoudige inputs. Voor groep controls (CheckboxGroup, RadioGroup) gebruik je [FormFieldset](/docs/components-formfieldset--docs). FormField genereert de ID's voor description, error en status en zet `aria-describedby` op de control, zodat een screenreader die teksten meeneemt.

> **Codevoorbeeld met context**: De tabs tonen een `TextInput` als representatief child. `FormField` is een wrapper: het form control dat je als child meegeeft bepaalt de daadwerkelijke invoer.

<!-- VOORBEELD -->

## Use when

- Je een complete form field nodig hebt met label en control.
- Je een consistente form field structuur wilt in je formulieren.
- Je wilt dat description, error en status automatisch via `aria-describedby` aan de control gekoppeld worden.

## Don't use when

- Je een groep controls hebt (CheckboxGroup, RadioGroup): gebruik [FormFieldset](/docs/components-formfieldset--docs).
- Je alleen een label zonder control nodig hebt: gebruik [FormFieldLabel](/docs/components-formfieldlabel--docs).
- Je volledige controle wilt over de markup: gebruik de sub-componenten direct.

## Structuur

FormField combineert deze sub-componenten in de juiste volgorde:

1. **FormFieldLabel** (verplicht) - Met optionele suffix
2. **FormFieldDescription** (optioneel) - Help tekst
3. **FormFieldErrorMessage** (optioneel) - Foutmelding met icoon
4. **Form Control** (verplicht) - TextInput, TextArea, of een ander enkelvoudig form control
5. **FormFieldStatus** (optioneel) - Status feedback met variant

### Invalid state

Wanneer er een `error` prop aanwezig is, krijgt het hele FormField een dikke rode border aan de linkerzijde en extra padding. Dit trekt visueel de aandacht naar het probleem en groepeert de error message met het field.

## Best practices

### Props

- **label** - Altijd verplicht, houd kort (1-3 woorden)
- **htmlFor** - Verplicht voor accessibility, moet matchen met control ID
- **labelSuffix** - Gebruik "(niet verplicht)" of "(verplicht)" waar nodig
- **description** - Voor hulptekst die altijd zichtbaar is
- **error** - Voor validatie fouten, toon alleen na interactie
- **status** - Voor realtime feedback (character count, password strength)
- **statusVariant** - 'default' (subtle), 'positive' (success), 'warning' (caution)
- **statusLive** - Alleen aanzetten wanneer de statustekst tijdens interactie verandert (character counter). Een statische status als live region wordt dubbel voorgelezen.

### Timing

- **Description**: Altijd zichtbaar vanaf start
- **Error**: Alleen na blur of submit, niet tijdens typen
- **Status default**: Altijd zichtbaar (character counter)
- **Status positive/warning**: Na interactie of real-time tijdens typen

### Combinaties

- Description + Error + Status kunnen allemaal tegelijk (zie volgorde hierboven)
- Error vervangt meestal status feedback (toon één of ander)
- Status kan wel samen met description (bijv. character counter + help text)

## Design tokens

| Token                                                | Beschrijving                                              |
| ---------------------------------------------------- | --------------------------------------------------------- |
| `--dsn-form-field-invalid-border-inline-start-color` | Linker border kleur bij invalid state (rode error border) |
| `--dsn-form-field-invalid-border-inline-start-width` | Linker border breedte bij invalid state (medium)          |
| `--dsn-form-field-invalid-padding-inline-start`      | Linker padding bij invalid state (voor border ruimte)     |

Plus de tokens van de sub-componenten:

- FormFieldLabel tokens voor label styling
- FormFieldDescription tokens voor description styling
- FormFieldErrorMessage tokens voor error styling
- FormFieldStatus tokens voor status styling
- Sub-component margins zorgen voor spacing

## Accessibility

- **htmlFor prop** - Koppelt label aan control via ID. Geef altijd hetzelfde ID mee aan de control zelf.
- **Automatische IDs** - FormField genereert `{htmlFor}-description`, `{htmlFor}-error` en `{htmlFor}-status` voor de teksten die je meegeeft. Zonder `htmlFor` vallen de ID's terug op `useId()`: de koppeling werkt dan nog steeds, maar het label niet meer.
- **aria-describedby** - FormField zet `aria-describedby` op de control, in de volgorde description → error → status. Dat is dezelfde volgorde als de teksten visueel staan, zodat oog en screenreader dezelfde route lopen. Een `aria-describedby` die je zelf op de control zet blijft behouden en wordt achteraan toegevoegd.
- **Enkel element als child** - De koppeling gebeurt door het child-element te klonen. Geef daarom één element mee dat zijn props doorgeeft aan het DOM-element. Bij een fragment of meerdere children kun je `aria-describedby` niet automatisch gezet worden en moet je het zelf zetten.
- **Logische volgorde** - Screenreaders lezen: label → description → error → control → status
- **Invalid state** - Zet `invalid` prop op de control zelf, niet op FormField
- **Required** - Gebruik labelSuffix + aria-required op de control
- **Dynamische status** - Gebruik `statusLive` voor status die verandert tijdens interactie, zoals een character counter. Zonder die prop hoort een screenreadergebruiker de wijziging niet.

## Voorbeelden

```tsx
// Basic
<FormField label="Naam" htmlFor="name">
  <TextInput id="name" />
</FormField>

// Met alles
<FormField
  label="Wachtwoord"
  htmlFor="password"
  labelSuffix="(verplicht)"
  description="Minimaal 8 tekens"
  error="Te kort"
  status="5 van 8 tekens"
  statusLive
>
  <TextInput id="password" type="password" invalid />
</FormField>
```

De gerenderde HTML van dat laatste voorbeeld:

```html
<div class="dsn-form-field dsn-form-field--invalid">
  <label class="dsn-form-field-label" for="password">
    Wachtwoord
    <span class="dsn-form-field-label-suffix">(verplicht)</span>
  </label>
  <p class="dsn-form-field-description" id="password-description">
    Minimaal 8 tekens
  </p>
  <p class="dsn-form-field-error-message" id="password-error">
    <svg class="dsn-icon" aria-hidden="true"><!-- exclamation-circle --></svg>
    Te kort
  </p>
  <input
    type="password"
    class="dsn-text-input"
    id="password"
    aria-invalid="true"
    aria-describedby="password-description password-error password-status"
  />
  <p
    class="dsn-form-field-status"
    id="password-status"
    aria-live="polite"
    aria-atomic="true"
  >
    5 van 8 tekens
  </p>
</div>
```
