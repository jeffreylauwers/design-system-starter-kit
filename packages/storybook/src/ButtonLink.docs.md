# ButtonLink

Een link die semantisch een `<a>` is, maar visueel het uiterlijk van een [Button](/docs/components-button--docs) heeft.

## Doel

`ButtonLink` verhoogt de attentiewaarde van een navigatieactie op plekken waar een gewone [Link](/docs/components-link--docs) te weinig prominentie heeft. Gebruik het wanneer een actie naar een andere pagina of URL navigeert — dus een echte `<a href>` nodig is — maar de visuele prominentie van een Button beter aansluit bij de context.

<!-- VOORBEELD -->

## Use when

- De actie naar een andere pagina of URL navigeert en de visuele prominentie van een Button gewenst is.
- Je een primaire call-to-action wilt tonen die de gebruiker doorstuurt naar een volgende stap, zoals "Start aanvraag" of "Download rapport".
- Je in een landingspagina of een meerstappenformulier een prominente CTA nodig hebt die wél een echte link is.

## Don't use when

- De actie een JavaScript-handler of form-submit vereist en niet navigeert — gebruik dan de [Button](/docs/components-button--docs) component.
- Je een knop wilt met een lage attentiewaarde die navigeert — gebruik dan de [Link](/docs/components-link--docs) component.
- Je JS-acties met een lage visuele prominentie wilt — gebruik dan de [LinkButton](/docs/components-linkbutton--docs) component.
- Je een echte `<button>` nodig hebt maar het eruit wil laten zien als een link — gebruik dan `LinkButton`, nooit een `<button>` met `href`.

## Best practices

- **Gebruik beschrijvende teksten.** Vermijd "klik hier". Gebruik teksten die de bestemming of actie beschrijven, zoals "Download rapport" of "Start aanvraag".
- **Gebruik `strong` voor primaire CTA's.** Gebruik `default` of `subtle` voor secundaire navigatieacties die minder nadruk nodig hebben.
- **Gebruik `external` voor links die in een nieuw tabblad openen.** De prop voegt automatisch `target="_blank"`, `rel="noopener noreferrer"` en de zichtbare aanduiding "(opent nieuw tabblad)" toe.
- **Iconen verduidelijken betekenis.** Gebruik `iconEnd` met een pijl voor "volgende stap"-acties, `iconStart` voor downloads of specifieke acties.
- **Geen `loading` state.** `ButtonLink` navigeert naar een URL. Een laadspinner past niet bij een navigatieactie; gebruik Button als je een loading state nodig hebt.

## Accessibility

- Semantisch een `<a>` — screenreaders kondigen het element aan als "link", niet als "knop". Gebruikers weten daardoor dat de actie navigatie veroorzaakt.
- `disabled` werkt via `aria-disabled="true"` + `tabIndex={-1}` — `<a>` heeft geen native `disabled` attribuut.
- `iconOnly` via `dsn-button__label` — tekst visueel verborgen maar beschikbaar voor screenreaders. Gebruik altijd beschrijvende `children` als toegankelijke naam.
- Iconen zijn altijd decoratief (`aria-hidden="true"`).
- `external` voegt zichtbare tekst "(opent nieuw tabblad)" toe voor alle gebruikers, niet alleen screenreaders.

## Design tokens

`ButtonLink` erft alle `--dsn-button-*` tokens van het [Button](/docs/components-button--docs) component via de `dsn-button` en `dsn-button--{variant}` klassen. Er zijn geen eigen componenttokens.

| Token                                   | Beschrijving                        |
| --------------------------------------- | ----------------------------------- |
| `--dsn-button-default-background-color` | Achtergrondkleur default variant    |
| `--dsn-button-default-color`            | Tekstkleur default variant          |
| `--dsn-button-strong-background-color`  | Achtergrondkleur strong variant     |
| `--dsn-button-strong-border-color`      | Randkleur strong variant            |
| `--dsn-button-strong-color`             | Tekstkleur strong variant           |
| `--dsn-button-subtle-background-color`  | Achtergrondkleur subtle variant     |
| `--dsn-button-subtle-color`             | Tekstkleur subtle variant           |
| `--dsn-button-size-default-*`           | Grootte-tokens voor default variant |
| `--dsn-button-size-large-*`             | Grootte-tokens voor large variant   |
| `--dsn-button-size-small-*`             | Grootte-tokens voor small variant   |
