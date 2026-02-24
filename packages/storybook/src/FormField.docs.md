# Form Field

Container component dat label, description, error message, form control en status combineert.

## Doel

De FormField component is een complete form field container die alle onderdelen samenbrengt: FormFieldLabel (met optionele suffix), FormFieldDescription, FormFieldErrorMessage, de form control zelf, en FormFieldStatus. Het zorgt voor correcte volgorde, spacing en koppeling via aria-attributen. De component gebruikt een `<div>` wrapper met `<label>` element. Voor groep controls (CheckboxGroup, RadioGroup) gebruik je later de FormFieldset component die `<fieldset>` en `<legend>` gebruikt. FormField handelt automatisch ID's af voor aria-describedby koppelingen.

> **Codevoorbeeld met context**: De HTML/CSS tab toont een `EmailInput` als representatief child. `FormField` is een wrapper — het form control dat je als child meegeeft bepaalt de daadwerkelijke invoer.

<!-- VOORBEELD -->

## Use when

- Je een complete form field nodig hebt met label en control.
- Je een consistente form field structuur wilt in je formulieren.
- Je automatische aria-describedby koppelingen wilt voor accessibility.

## Don't use when

- Je een groep controls hebt (CheckboxGroup, RadioGroup) — gebruik [FormFieldset](/docs/components-formfieldset--docs) (komt later).
- Je alleen een label zonder control nodig hebt — gebruik [FormFieldLabel](/docs/components-formfieldlabel--docs).
- Je volledige controle wilt over de markup — gebruik de sub-componenten direct.

## Structuur

FormField combineert deze sub-componenten in de juiste volgorde:

1. **FormFieldLabel** (verplicht) - Met optionele suffix
2. **FormFieldDescription** (optioneel) - Help tekst
3. **FormFieldErrorMessage** (optioneel) - Foutmelding met icoon
4. **Form Control** (verplicht) - TextInput, TextArea, CheckboxGroup, etc.
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

- **htmlFor prop** - Koppelt label aan control via ID
- **Automatische IDs** - FormField genereert IDs voor description/error/status
- **aria-describedby** - Form controls krijgen automatisch aria-describedby met description/error/status IDs
- **Logische volgorde** - Screenreaders lezen: label → description → error → control → status
- **Invalid state** - Zet `invalid` prop op de control zelf, niet op FormField
- **Required** - Gebruik labelSuffix + aria-required op de control

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
>
  <TextInput id="password" type="password" invalid />
</FormField>
```
