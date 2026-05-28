# PreHeading

Een contextueel label dat visueel boven een heading staat en er semantisch deel van uitmaakt.

<!-- VOORBEELD -->

## Doel

PreHeading is een `<span>` met `display: block` die als eerste kind binnen een `<hx class="dsn-heading">` staat. De span heeft geen eigen ARIA-rol: de inhoud wordt onderdeel van de accessible name van de bovenliggende heading. Screenreaders lezen pre-heading en heading als één heading.

Gebruik PreHeading voor:

- Stap-indicatoren in meerstappenformulieren: "Stap 2" boven "Uw gegevens"
- Sectie-categorisering: "Diensten" boven "We helpen u groeien"
- Processtap-context: "Stap 1 van 4" boven de staptitel

## Use when

- Je een stap-indicator of categorielabel visueel boven een heading wilt tonen dat ook semantisch bij die heading hoort.
- De pre-heading en de heading samen één betekenisvolle heading vormen voor screenreaders.
- Je gebruik maakt van meerstappenformulieren waarbij de staptitel én het stapnummer samen de accessible name van de heading moeten zijn.

## Don't use when

- De pre-heading een semantisch zelfstandige sectie aanduidt. Gebruik dan een structureel lagere heading (`<h3>` onder een `<h2>`), nooit een hogere of gelijkwaardige heading visueel boven de andere.
- De tekst puur decoratief is en niet bijdraagt aan de accessible name van de heading.
- Je een subtitle wilt die niet bij de accessible name hoort; gebruik dan een afzonderlijke [Paragraph](/docs/components-paragraph--docs).

## Best practices

### Gebruik altijd binnen een Heading

PreHeading staat altijd als eerste kind van een `<hx>` element. Gebruik het nooit als zelfstandig element buiten een heading.

```html
<!-- ✅ Correct: PreHeading als eerste kind van een heading -->
<h2 class="dsn-heading dsn-heading--heading-2">
  <span class="dsn-pre-heading"
    >Stap 2<span class="dsn-visually-hidden">:</span></span
  >
  Uw gegevens
</h2>

<!-- ❌ Nooit: PreHeading als zelfstandig element -->
<span class="dsn-pre-heading">Stap 2</span>
<h2 class="dsn-heading dsn-heading--heading-2">Uw gegevens</h2>
```

### Interpunctie voor screenreaders

Bij stap-indicatoren: sluit de pre-heading af met een visueel verborgen dubbele punt. Dit zorgt voor een duidelijke scheiding in de accessible name ("Stap 2: Uw gegevens" in plaats van "Stap 2 Uw gegevens").

```html
<span class="dsn-pre-heading">
  Stap 2<span class="dsn-visually-hidden">:</span>
</span>
```

Bij categorielabels zonder directe koppeling is geen dubbele punt nodig.

### HeadingGroup als alternatief

Wanneer je de pre-heading en heading altijd samen gebruikt, overweeg dan de [HeadingGroup](/docs/components-headinggroup--docs) component. Die combineert beide in één API via de `preHeading` prop.

## Design tokens

| Token                                | Beschrijving                               |
| ------------------------------------ | ------------------------------------------ |
| `--dsn-pre-heading-color`            | Tekstkleur                                 |
| `--dsn-pre-heading-font-family`      | Lettertypefamilie                          |
| `--dsn-pre-heading-font-size`        | Lettergrootte (md, gelijk aan body)        |
| `--dsn-pre-heading-font-weight`      | Font weight (bold)                         |
| `--dsn-pre-heading-line-height`      | Regelafstand                               |
| `--dsn-pre-heading-margin-block-end` | Ruimte tussen pre-heading en heading-tekst |

## Accessibility

- De `<span class="dsn-pre-heading">` heeft geen eigen ARIA-rol. De inhoud wordt onderdeel van de accessible name van de bovenliggende heading.
- Screenreaders (NVDA, JAWS, VoiceOver) lezen de volledige heading inclusief pre-heading als één heading.
- Bij heading-navigatie horen gebruikers de complete heading: "Stap 2: Uw gegevens (niveau 2)".
- `display: block` heeft geen effect op de semantische heading; het is puur visueel.
- Gebruik `<span class="dsn-visually-hidden">:</span>` bij stap-indicatoren voor een duidelijke scheidingstekst in de accessible name.
