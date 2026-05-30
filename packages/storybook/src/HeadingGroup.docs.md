# HeadingGroup

Een heading die een pre-heading en heading-tekst combineert in één semantisch element.

<!-- VOORBEELD -->

## Doel

HeadingGroup combineert de functionaliteit van [Heading](/docs/components-heading--docs) en [PreHeading](/docs/components-preheading--docs) in één API. De `preHeading` prop zorgt automatisch voor de juiste markup: de inhoud wordt gewrapped in een `<span class="dsn-pre-heading">`. Het component voegt `dsn-heading-group` toe aan het heading-element, zodat pre-heading en heading-tekst als flex-kolom gestapeld worden weergegeven.

HeadingGroup heeft geen eigen semantische HTML-rol. Het rendert als een `<hx>` element, net als Heading. De accessible name omvat zowel de pre-heading als de heading-tekst.

## Use when

- Je altijd een pre-heading en heading samen wilt gebruiken en de koppeling in de markup wilt bewaken.
- Je in een meerstappenformulier stap-label en paginatitel als één heading wilt presenteren.
- Je niet handmatig `<PreHeading>` binnen `<Heading>` wilt nesten.

## Don't use when

- Je de pre-heading als semantisch losse tekst wilt presenteren (niet bij de accessible name hoort). Gebruik dan afzonderlijke [Heading](/docs/components-heading--docs) en [Paragraph](/docs/components-paragraph--docs) componenten.
- Je de pre-heading en heading onafhankelijk van elkaar wilt positioneren in de layout. Gebruik dan [PreHeading](/docs/components-preheading--docs) direct binnen [Heading](/docs/components-heading--docs).

## Best practices

### preHeading prop

De `preHeading` prop accepteert zowel strings als ReactNode. Gebruik een ReactNode wanneer je een visueel verborgen dubbele punt wilt toevoegen voor screenreaders.

```tsx
// String (categorielabel)
<HeadingGroup level={2} preHeading="Diensten">
  We helpen u groeien
</HeadingGroup>

// ReactNode met visueel verborgen dubbele punt (stap-indicator)
<HeadingGroup
  level={2}
  preHeading={<>Stap 2 van 4<span className="dsn-visually-hidden">:</span></>}
>
  Uw gegevens
</HeadingGroup>
```

### HTML/CSS equivalent

```html
<h2 class="dsn-heading dsn-heading--heading-2 dsn-heading-group">
  <span class="dsn-pre-heading"
    >Stap 2 van 4<span class="dsn-visually-hidden">:</span></span
  >
  Uw gegevens
</h2>
```

### Semantic level vs. visuele appearance

Net als Heading ondersteunt HeadingGroup de `appearance` prop voor ontkoppeling van semantiek en visuele stijl.

```tsx
// Semantisch h1, visueel heading-2 (kleinere pagina in een flow)
<HeadingGroup level={1} appearance="heading-2" preHeading="Stap 1 van 4">
  Persoonlijke gegevens
</HeadingGroup>
```

## Design tokens

HeadingGroup voegt geen nieuwe design tokens toe. Het hergebruikt tokens van `dsn-heading` en `dsn-pre-heading`.

| Token                 | Beschrijving                                                                  |
| --------------------- | ----------------------------------------------------------------------------- |
| `--dsn-heading-*`     | Alle heading tokens (zie [Heading](/docs/components-heading--docs))           |
| `--dsn-pre-heading-*` | Alle pre-heading tokens (zie [PreHeading](/docs/components-preheading--docs)) |

## Accessibility

- HeadingGroup rendert als `<hx>` element. De accessible name omvat zowel de pre-heading als de heading-tekst.
- Dezelfde ARIA-regels als het Heading component zijn van toepassing.
- Screenreaders lezen de volledige heading inclusief pre-heading als één heading: "Stap 2 van 4: Uw gegevens (niveau 2)".
- `dsn-heading-group` voegt alleen `display: flex; flex-direction: column` toe en heeft geen eigen ARIA-rol.
- Gebruik `<span className="dsn-visually-hidden">:</span>` bij stap-indicatoren voor een duidelijke scheidingstekst in de accessible name.
