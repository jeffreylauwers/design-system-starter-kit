# PasswordInput

Een invoerveld specifiek voor wachtwoorden.

## Doel

De PasswordInput component is een gespecialiseerd invoerveld voor wachtwoorden. Het gebruikt `type="password"` zodat de ingevoerde tekst wordt gemaskeerd. Via de `passwordAutocomplete` prop geef je wachtwoordmanagers een hint: gebruik `current-password` bij inlogformulieren en `new-password` bij registratie- of wachtwoord wijzigformulieren.

Het tonen en verbergen van het ingevulde wachtwoord is bewust **niet** ingebouwd in dit component. Dit patroon wordt separaat gedefinieerd via een Button naast het invoerveld.

<!-- VOORBEELD -->

## Use when

- Je een wachtwoord van de gebruiker nodig hebt, bijv. bij inloggen of registreren.
- Je het ingevoerde wachtwoord wilt maskeren.

## Don't use when

- Het om een pincode of numerieke code gaat: gebruik dan [NumberInput](/docs/components-numberinput--docs).
- Het om vrije tekst gaat: gebruik dan [TextInput](/docs/components-textinput--docs).

## Best practices

- **Gebruik `passwordAutocomplete` correct.** Stel `current-password` in bij inloggen en `new-password` bij registratie of wachtwoord wijzigen. Dit helpt wachtwoordmanagers de juiste actie te nemen.
- **Voeg een toon/verberg-knop toe via een apart patroon.** Dit component bevat bewust geen toggle: gebruik hiervoor een Button naast het invoerveld.
- **Combineer met FormField.** Gebruik altijd een label via `FormField` of `FormFieldLabel` voor toegankelijkheid.
- **Geef validatie feedback.** Gebruik de `invalid` prop in combinatie met `aria-invalid` en een `FormFieldErrorMessage`.
- **Kies de juiste inline-size.** Gebruik `inlineSize` met `md`, `lg`, `xl` of `full`. `xs` en `sm` bestaan bij PasswordInput niet: een sterk wachtwoord past daar niet in, en een smal veld moedigt korte wachtwoorden aan.

## Accessibility

- `type="password"` maskeert de invoer visueel en verhindert dat de waarde zichtbaar is in de browser history.
- `autocomplete="current-password"` of `autocomplete="new-password"` helpt wachtwoordmanagers en screen readers begrijpen wat het veld verwacht.
- Voeg bij wachtwoordvereisten altijd een beschrijving toe via `aria-describedby` en `FormFieldDescription`.

## States

- **Default**: Leeg, klaar voor invoer
- **Focus**: Actief, gebruiker typt
- **Hover**: Muis over het veld
- **Disabled**: Niet beschikbaar voor invoer
- **Read-only**: Waarde is zichtbaar maar niet aanpasbaar
- **Invalid**: Validatiefout (bijv. wachtwoord te kort of voldoet niet aan vereisten)

## Design tokens

<!-- tokens: password-input -->

PasswordInput erft verder alle tokens van [TextInput](/docs/components-textinput--docs).
