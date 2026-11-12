# Spinner

Cirkelvormige laadindicator voor onbepaalde wachttijden.

## Doel

Spinner geeft aan dat een actie in uitvoering is waarvan de duur niet van tevoren bekend is. De component bestaat uit een animerende boog en een tekstlabel dat de laadtoestand beschrijft. De standaardvariant plaatst het label rechts van de spinner; de grote variant centreert het label eronder.

De spinner heeft `role="status"` zodat screenreaders de laadtoestand aankondigen. Het label is altijd aanwezig in de DOM: ook bij `hideLabel` blijft het beschikbaar voor screenreaders.

<!-- VOORBEELD -->

## Use when

- Een actie loopt en de gebruiker moet wachten, maar de voortgang kan niet worden gemeten.
- Korte laadacties na een gebruikersinteractie: een formulier dat wordt verstuurd, een zoekopdracht die wordt uitgevoerd.
- Een sectie van een pagina laadt asynchroon.

## Don't use when

- De voortgang wel meetbaar is: gebruik dan een voortgangsbalk.
- De wachttijd langer dan een paar seconden duurt: geef dan extra context over wat er gebeurt.
- De spinner enkel decoratief is zonder betekenis voor de gebruiker: gebruik dan een loading skeleton.

## Best practices

### Labelkeuze

Het label beschrijft altijd wat er geladen wordt, niet alleen "Laden...". Geef de gebruiker zoveel mogelijk context:

```html
<!-- Minder informatief -->
<div class="dsn-spinner" role="status">
  <svg class="dsn-spinner__circle" viewBox="0 0 24 24" aria-hidden="true">
    <circle class="dsn-spinner__track" cx="12" cy="12" r="10" />
    <circle class="dsn-spinner__arc" cx="12" cy="12" r="10" />
  </svg>
  <span class="dsn-spinner__label">Laden...</span>
</div>

<!-- Meer informatief -->
<div class="dsn-spinner" role="status">
  <svg class="dsn-spinner__circle" viewBox="0 0 24 24" aria-hidden="true">
    <circle class="dsn-spinner__track" cx="12" cy="12" r="10" />
    <circle class="dsn-spinner__arc" cx="12" cy="12" r="10" />
  </svg>
  <span class="dsn-spinner__label">Zoekresultaten worden geladen</span>
</div>
```

### Visueel verborgen label

Gebruik `hideLabel` (of de CSS-klasse `dsn-visually-hidden` op het label) wanneer de context al duidelijk maakt dat er geladen wordt, maar het label visueel storend zou zijn:

```html
<div class="dsn-spinner" role="status">
  <svg class="dsn-spinner__circle" viewBox="0 0 24 24" aria-hidden="true">
    <circle class="dsn-spinner__track" cx="12" cy="12" r="10" />
    <circle class="dsn-spinner__arc" cx="12" cy="12" r="10" />
  </svg>
  <span class="dsn-spinner__label dsn-visually-hidden">Laden...</span>
</div>
```

### Groottekeuze

- Gebruik de standaardgrootte (24px) voor inline laadstates, zoals na knoppen of binnen formulieren.
- Gebruik de grote variant (48px) voor het laden van een volledige pagina of een groot inhoudsgebied.

```html
<!-- Groot — label onder spinner, gecentreerd -->
<div class="dsn-spinner dsn-spinner--large" role="status">
  <svg class="dsn-spinner__circle" viewBox="0 0 24 24" aria-hidden="true">
    <circle class="dsn-spinner__track" cx="12" cy="12" r="10" />
    <circle class="dsn-spinner__arc" cx="12" cy="12" r="10" />
  </svg>
  <span class="dsn-spinner__label">Pagina wordt geladen</span>
</div>
```

### Animatie en bewegingsvoorkeur

De rotatie-animatie respecteert `prefers-reduced-motion: reduce`. Bij verminderde bewegingsvoorkeur wordt de rotatie vervangen door een subtiel pulserende opaciteitsanimatie. De spinner blijft zichtbaar en toegankelijk.

## Design tokens

<!-- tokens: spinner -->

## Accessibility

- De container heeft altijd `role="status"` zodat screenreaders de laadtoestand aankondigen.
- De SVG-cirkel heeft altijd `aria-hidden="true"`: puur decoratief, geen semantische waarde.
- Het label is altijd aanwezig in de DOM: `hideLabel` verbergt het visueel via `dsn-visually-hidden`, maar houdt het beschikbaar voor screenreaders.
- De rotatie-animatie respecteert `prefers-reduced-motion: reduce`: bij verminderde bewegingsvoorkeur wordt de rotatie vervangen door een subtiel pulseren.
