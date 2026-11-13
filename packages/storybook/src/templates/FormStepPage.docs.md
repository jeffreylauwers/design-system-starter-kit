# Form Step Page

Paginatemplate voor een stap-voor-stap formulierflow met gecentreerde content en een vereenvoudigde header.

## Doel

Het Form Step Page template is bedoeld voor meerstappenformulieren waarbij de gebruiker gefocust door een reeks stappen wordt geleid. De header toont alleen het logo — navigatie en zoekveld worden weggelaten om afleiding te minimaliseren. De formulierinhoud wordt op grote viewports gecentreerd via `colStartLg` en `colEndLg` op het `GridItem`.

Templates zijn Storybook-only composities van bestaande componenten. Ze bevatten geen eigen CSS of React component.

<!-- VOORBEELD -->

## Grid-structuur

```html
<!-- Klein viewport: volle breedte -->
<div class="dsn-col-12 dsn-col-start-lg-3 dsn-col-end-lg-11">
  ...formulierinhoud...
</div>
```

```tsx
{
  /* Klein: 12 kolommen — groot: kolommen 3 t/m 10 */
}
<GridItem colSpan={12} colStartLg={3} colEndLg={11}>
  ...formulierinhoud...
</GridItem>;
```

| Viewport      | Kolommen              |
| ------------- | --------------------- |
| Klein (< lg)  | 12/12 (volle breedte) |
| Groot (>= lg) | kolommen 3 t/m 10     |

## Header

De `PageHeader` gebruikt `layout="compact"` en verbergt zowel de menuknop als de zoekknop via `hideMenuButton` en `hideSearchButton`. Op alle viewports is daardoor alleen het logo zichtbaar.

```tsx
<PageHeader
  logoSlot={logoSlot}
  layout="compact"
  hideMenuButton
  hideSearchButton
/>
```

## Inhoudsstructuur

De `<main>` bevat een `Stack space="3xl"` met de volgende elementen in volgorde:

1. `Heading` level 1 — formuliertitel
2. `Link` met `arrow-left` icoon — "Vorige stap"
3. `Stack space="sm"` met daarin:
   - `<h2 className="dsn-heading dsn-heading--heading-2">` — staptitel
   - `Paragraph` — instructietekst
4. `<form>` met een `Stack space="3xl"` met daarin:
   - `FormField` voor een tekstveld
   - `FormFieldset` met een `RadioGroup`
   - `FormField` met `labelSuffix="(niet verplicht)"`
   - `ActionGroup direction="vertical"` met extra `marginBlockStart`

## ActionGroup

```tsx
<ActionGroup
  direction="vertical"
  style={{ marginBlockStart: 'var(--dsn-space-block-3xl)' }}
>
  <Button variant="strong" type="submit">
    Volgende stap
  </Button>
  <LinkButton>Opslaan en later verder</LinkButton>
  <LinkButton>Stoppen met het formulier</LinkButton>
</ActionGroup>
```

## Wel gebruiken als...

- Je een meerstappenformulier bouwt waarbij de gebruiker stap voor stap door een aanvraag of invoerflow wordt geleid.
- Je de gebruiker wilt focussen op de taak door navigatie weg te laten.

## Niet gebruiken als...

- Je een informatieve pagina toont: gebruik dan het Base Page template.
- Het formulier uit slechts één stap bestaat zonder stap-voor-stap navigatie.

## Toegankelijkheid

- De `<main>` heeft `id="main-content"` zodat de skip-link werkt voor toetsenbordgebruikers.
- Het `<form>`-element heeft `noValidate` om de browser-validatie te onderdrukken; valideer in plaats daarvan via de design system form-componenten.
- De formuliertitel is een `<h1>`, de staptitel een `<h2>` — dit geeft een correcte koppenstructuur per stap.
- De staptitel en de bijbehorende instructietekst zitten samen in een `Stack space="sm"` om de visuele koppeling te benadrukken.
