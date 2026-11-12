# BreakoutSection

Layout component dat een sectie laat "uitslaan" buiten een beperkte paginabreedte om de volledige viewportbreedte te beslaan.

## Doel

BreakoutSection lost een specifiek layoutprobleem op: de meeste pagina's beperken de inhoudsbreedte via `dsn-page-body__inner` of `--dsn-page-max-inline-size`, maar soms moet een sectie bewust de volledige viewportbreedte beslaan — denk aan een gekleurde band, een hero-afbeelding of een datavisualisatie van rand tot rand.

De component bereikt dit via de formule `margin-inline: calc(50% - 50vw)`. Dit werkt ongeacht de viewportbreedte: het verschil tussen de halve containerbreedte en de halve viewportbreedte wordt negatief margin, waardoor de sectie aan beide kanten uitsteekt tot aan de viewport-rand.

De parent `.dsn-page-body` heeft `overflow-x: clip` zodat er geen horizontale scrolbalk verschijnt.

<!-- VOORBEELD -->

## Use when

- Een hero-banner de volledige viewportbreedte moet beslaan.
- Een gekleurde call-to-action band van rand tot rand loopt terwijl de rest van de pagina een beperkte breedte heeft.
- Een datavisualisatie, kaart of afbeelding bewust buiten de paginamarges valt.
- Een sectie visueel los moet staan van de rest van de paginainhoud.

## Don't use when

- De hele pagina full-width moet zijn: gebruik dan `--dsn-page-max-inline-size: none` op `PageLayout`.
- Je het component buiten een `PageBody` gebruikt: de formule werkt alleen correct als de directe parent een beperkte breedte heeft.
- De content zelf ook full-width moet zijn zonder beperking: voeg dan een inner container toe met `max-inline-size` en `margin-inline: auto`.

## Best practices

### Herbeperking van de inhoud

De BreakoutSection breekt de containerbreedte open, maar de inhoud erin hoeft niet ook full-width te zijn. Gebruik een inner wrapper om de tekstinhoud opnieuw te beperken:

```html
<section
  class="dsn-breakout-section"
  style="background-color: var(--dsn-color-accent-1-inverse-bg-default); padding-block: var(--dsn-space-block-4xl);"
>
  <div
    style="max-inline-size: var(--dsn-page-max-inline-size); margin-inline: auto; padding-inline: var(--dsn-page-body-padding-inline);"
  >
    <h2>Sectietitel</h2>
    <p>Inhoud die opnieuw beperkt is tot de paginabreedte.</p>
  </div>
</section>
```

### Semantisch element

Kies het juiste HTML-element via de `as` prop. Gebruik `section` (standaard) voor een inhoudssectie met een eigen kop, `div` voor puur visuele bands zonder semantische betekenis.

### Padding en achtergrond

BreakoutSection voegt zelf geen padding, achtergrond of kleur toe. Voeg deze toe via `style` of een eigen CSS-klasse — zo blijft de component maximaal flexibel.

## Accessibility

BreakoutSection heeft geen eigen ARIA-rollen of -labels. Als de sectie een eigen kop heeft (`as="section"`), zorg dan dat die kop aanwezig is zodat screenreadergebruikers de sectiestructuur kunnen navigeren.

## Design tokens

<!-- tokens: breakout-section -->

Voor het opnieuw begrenzen van de inhoud gebruikt BreakoutSection de tokens van de pagina:

<!-- tokens: page page-body -->
