# Container

Visuele groepering van gerelateerde content met achtergrond, border en optionele schaduw.

## Doel

Container biedt een afgebakend kader voor content die visueel bij elkaar hoort. Het component combineert een `bg-elevated` achtergrond, een subtiele border en een optionele `box-shadow` tot een herkenbaar geheel. Container is puur visueel — het heeft geen eigen semantische rol en laat de keuze van het HTML-element aan de gebruiker over via de `as` prop.

<!-- VOORBEELD -->

## Use when

- Gerelateerde componenten visueel groeperen (formuliersecties, kaarten, panelen).
- Een duidelijke grens nodig is tussen content en pagina-achtergrond.
- Je een kaart-achtig element wilt met een lichte schaduw (`elevated`).
- Layout componenten (Stack, Grid) een visueel kader geven in een pagina of demo.

## Don't use when

- Je alleen witruimte nodig hebt tussen secties — gebruik Stack of Grid met de juiste spacing tokens.
- Het element navigatie, een formulier of andere semantisch geladen structuur is — geef dan de juiste HTML-semantiek aan de parent zelf mee.
- Je een kleurrijke statusachtergrond wilt — gebruik Alert of Note.

## Best practices

### `as` prop

| Waarde            | Wanneer                                                   |
| ----------------- | --------------------------------------------------------- |
| `'div'` (default) | Generieke groepering zonder extra semantische betekenis   |
| `'section'`       | Benoemde inhoudssectie met een heading als label          |
| `'article'`       | Zelfstandig herbruikbaar stuk content (kaart, nieuwsitem) |
| `'aside'`         | Tangentieel aanvullende content naast de hoofdinhoud      |

### Elevated

Gebruik `elevated` alleen als de Container visueel boven de pagina zweeft — zoals een dropdown-panel, een card in een raster of een demo-wrapper in Storybook. Gebruik het niet voor alle containers, want schaduw werkt op contrast: hoe minder schaduwen, hoe meer impact.

### Nesting

Container kan andere layout-componenten bevatten (Stack, Grid). Container regelt de buitenkant (achtergrond, border, padding), Stack of Grid regelen de binnenste spacing.

## Design tokens

| Token                                 | Beschrijving                               |
| ------------------------------------- | ------------------------------------------ |
| `--dsn-container-background-color`    | Achtergrond — `neutral.bg-elevated`        |
| `--dsn-container-border-color`        | Borderkleur — `neutral.border-subtle`      |
| `--dsn-container-border-radius`       | Afronding — `border.radius.md` (8px)       |
| `--dsn-container-border-width`        | Breedte — `border.width.thin` (1px)        |
| `--dsn-container-box-shadow`          | Standaard geen schaduw (`none`)            |
| `--dsn-container-color`               | Tekstkleur — `neutral.color-document`      |
| `--dsn-container-padding-block`       | Verticale padding — `space.block.3xl`      |
| `--dsn-container-padding-inline`      | Horizontale padding — `space.inline.3xl`   |
| `--dsn-container-elevated-box-shadow` | Schaduw elevated variant — `box-shadow.sm` |

## Accessibility

Container voegt geen ARIA-rollen of labels toe. Gebruik de `as` prop voor semantisch correcte HTML. Bij `as="section"` of `as="aside"` met een heading: voeg zelf `aria-labelledby` toe aan de Container en koppel het aan het `id` van de heading.
