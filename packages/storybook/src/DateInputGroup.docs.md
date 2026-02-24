# DateInputGroup

Drie losse invoervelden voor dag, maand en jaar.

## Doel

DateInputGroup biedt een toegankelijke, consistente manier om een datum in te voeren via drie afzonderlijke tekstvelden (dag, maand, jaar). Dit patroon werkt beter dan een native `<input type="date">` omdat het op alle browsers en apparaten hetzelfde eruitziet, ook gedeeltelijke invoer ondersteunt, en makkelijker te lezen is voor gebruikers met een screenreader.

Gebruik `FormFieldset` als wrapper voor een volledig formulierveld met legend, beschrijving en foutmelding.

> **Codevoorbeeld met context**: De HTML/CSS tab toont de volledige drie-velden structuur (dag, maand, jaar). `DateInputGroup` rendert altijd alle drie de velden samen.

<!-- VOORBEELD -->

## Use when

- De gebruiker een specifieke datum moet invoeren (bijv. geboortedatum, startdatum)
- Je een browser-onafhankelijke, consistente datuminvoer nodig hebt
- Gedeeltelijke invoer (bijv. alleen jaar) een geldige usecase is

## Don't use when

- De gebruiker een datum uit een kalender moet kiezen (gebruik dan `DateInput`)
- Het om een datum in de nabije toekomst gaat die makkelijk te selecteren is — een datumkiezer is dan handiger

## Best practices

- Gebruik altijd `<FormFieldset legend="...">` als wrapper — dit geeft de groep een naam voor screenreaders
- Geef de `description` prop mee met een voorbeelddatum, bijv. `"Bijvoorbeeld: 15 3 1990"`
- Geef de `id` prop mee zodat de labels correct gekoppeld zijn aan de inputs
- Geef bij een fout de `error` prop mee aan `FormFieldset` — de foutmelding verschijnt dan automatisch bóven de invoervelden

## Accessibility

- Elk veld heeft een zichtbaar label ("Dag", "Maand", "Jaar") gekoppeld via `htmlFor`
- De `id` prop genereert automatisch `{id}-dag`, `{id}-maand` en `{id}-jaar` als input-id's
- De `invalid` prop zet `aria-invalid="true"` op alle drie de inputs
- De foutmelding van `FormFieldset` is via `aria-describedby` automatisch gekoppeld aan de fieldset
- De `legend` verbindt de drie velden semantisch voor screenreaders via het `<fieldset>` element

## States

- **Default** — lege velden
- **With value** — datum ingevuld
- **Invalid** — alle drie de velden tonen een foutstate, gebruik samen met foutmelding
- **Disabled** — alle velden niet bewerkbaar

## Design tokens

| Token                              | Beschrijving                          |
| ---------------------------------- | ------------------------------------- |
| `--dsn-date-input-group-gap`       | Ruimte tussen de drie velden          |
| `--dsn-date-input-group-label-gap` | Ruimte tussen label en input per veld |
