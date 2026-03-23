# Card

Configureerbare container voor gestructureerde content met een optionele header (afbeelding), een body (heading + beschrijving) en een footer (link of knop).

## Doel

Het Card component presenteert een zelfstandig inhoudsblok — doorgaans een afbeelding, heading, beschrijving en call-to-action — compact en visueel afgebakend. De gehele card is klikbaar via een stretched-link techniek: het `::before` pseudo-element van de link in `CardHeading` dekt de volledige card, terwijl screenreaders alleen de heading-tekst als linknaam voorlezen. Gebruik `CardGroup` voor groepen van cards waarbij gelijke hoogte en uitgelijnde footers vereist zijn.

<!-- VOORBEELD -->

## Use when

- Overzichtspagina's met navigeerbare content-items (artikelen, producten, nieuwsberichten).
- Zoekresultaten met een preview van afbeelding, titel en samenvatting.
- Dashboards met samenvattende blokken die doorlinken naar detailpagina's.
- Groepen van gelijksoortige items waarbij visuele consistentie (gelijke hoogte, uitgelijnde footer) vereist is.
- Content met een duidelijke hiërarchie: afbeelding → heading → beschrijving → actie.

## Don't use when

- De inhoud geen navigatie-actie heeft — gebruik dan **Note** of **Alert**.
- Het gaat om losse KPI-statistieken zonder navigatie-actie.
- Een eenvoudige container zonder gestructureerde secties vereist is — gebruik dan een `<div>` met padding.

## Best practices

### Afbeelding en placeholder

- Geef `alt=""` mee aan de afbeelding in `CardHeader` — de afbeelding is decoratief bij een stretched-link-card. De heading-tekst is de toegankelijke naam.
- Gebruik de `Image` component met `ratio="16:9"` voor consistente beeldverhoudingen in een groep.
- Wanneer `CardHeader` zonder children wordt gerenderd, toont het component automatisch een afbeeldingsplaceholder met `aria-hidden="true"`.

### Stretched link en dubbele tabstop

- De `CardHeading` link dekt de volledige card via een `::before` pseudo-element (`position: absolute; inset: 0; z-index: 1`).
- Een footer-link naar **dezelfde** bestemming als de card: geef `aria-hidden` en `tabIndex={-1}` mee om een dubbele tabstop te voorkomen. De link is visueel zichtbaar maar niet focusbaar.
- Een footer-link naar een **andere** bestemming: geef geen `aria-hidden` mee. De link staat boven de stretched link via `z-index: 2` in CSS en is normaal tabbaar.

### Heading-niveau

- Kies `level` op basis van de documenthiërarchie, niet op basis van de visuele grootte.
- In een lijstpagina met `<h1>` als paginatitel zijn cards typisch `level={2}` of `level={3}`.
- De visuele appearance is altijd gelijk, ongeacht het semantische niveau.

### CardGroup

- Gebruik `CardGroup` met `as="ul"` (standaard) voor cards die een lijst van gelijksoortige items vormen — geeft schermlezergebruikers de context "Lijst, [n] items".
- Gebruik `as="div"` wanneer cards geen lijst-context hebben (bijv. featured cards op een homepage).

## Design tokens

| Token                                     | Beschrijving                              |
| ----------------------------------------- | ----------------------------------------- |
| `--dsn-card-background`                   | Achtergrondkleur standaard (bg-document)  |
| `--dsn-card-background-hover`             | Achtergrondkleur bij hover (bg-elevated)  |
| `--dsn-card-border-radius`                | Afgeronde hoeken (8px)                    |
| `--dsn-card-border-width`                 | Randbreedte                               |
| `--dsn-card-border-color`                 | Randkleur (neutral.border-subtle)         |
| `--dsn-card-box-shadow`                   | Standaard schaduw (none)                  |
| `--dsn-card-box-shadow-hover`             | Schaduw bij hover (md-elevatie)           |
| `--dsn-card-body-padding-block`           | Verticale padding van de body (16px)      |
| `--dsn-card-body-padding-inline`          | Horizontale padding van de body (16px)    |
| `--dsn-card-footer-padding-block-end`     | Onderkant padding van de footer (24px)    |
| `--dsn-card-footer-padding-inline`        | Horizontale padding van de footer (16px)  |
| `--dsn-card-image-placeholder-background` | Achtergrond van de afbeeldingsplaceholder |
| `--dsn-card-image-placeholder-color`      | Kleur van het icoon in de placeholder     |
| `--dsn-card-heading-font-family`          | Lettertype van de card heading            |
| `--dsn-card-heading-font-size`            | Tekstgrootte van de card heading          |
| `--dsn-card-heading-font-weight`          | Vetgedrukt van de card heading            |
| `--dsn-card-heading-line-height`          | Regelafstand van de card heading          |
| `--dsn-card-heading-color`                | Kleur van de card heading                 |
| `--dsn-card-heading-margin-block-end`     | Afstand onder de card heading (12px)      |
| `--dsn-card-group-gap`                    | Ruimte tussen cards in een groep (16px)   |
| `--dsn-card-group-item-min-width`         | Minimale breedte per card (17.5rem)       |

## Accessibility

- De card root is `<article>` — een semantisch zelfstandig inhoudsblok, navigeerbaar via schermlezer-sneltoets (bijv. `A`-toets in NVDA/JAWS).
- De afbeelding in de header is decoratief bij de stretched-link-variant: gebruik `alt=""` op de `Image` component — dit activeert automatisch `aria-hidden="true"` op de `<figure>`.
- De `dsn-card__image-placeholder` heeft `aria-hidden="true"` — puur decoratief.
- `CardGroup` als `<ul role="list">` geeft schermlezergebruikers de context "Lijst, [n] items". `role="list"` is nodig omdat veel CSS-resets de lijstsemantiek van `<ul>` verwijderen.
- Aankondiging door screenreaders: "[Artikeltitel], link" — alleen de heading-tekst, niet de volledige card-inhoud.
- Focus-ring: `:has(.dsn-card-heading__link:focus-visible)` toont een focus-ring rondom de gehele card. De link zelf heeft geen eigen outline wanneer de card-focusstaat actief is.
- CSS `:has()` is vereist voor de hover- en focusstaten (baseline 2023, breed ondersteund).
