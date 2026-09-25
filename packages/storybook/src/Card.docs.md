# Card

Configureerbare container met vier optionele secties: pre-header, header, body en footer.

## Doel

Het Card component presenteert een zelfstandig inhoudsblok, zoals een artikel, product of onderwerp. Een Card bestaat uit maximaal vier secties, die je als slots vult met sub-componenten:

- **Pre-header**: afbeelding, badge, logo of icoon. Staat visueel bovenaan.
- **Header**: de `CardHeading` of `CardLabel`, eventueel met een badge.
- **Body**: beschrijving, meta-gegevens of andere inhoud.
- **Footer**: een affordance ("Lees meer") of links en knoppen. Staat altijd onderaan, zodat call-to-actions in een rij cards op gelijke hoogte staan.

Geef je `Card` een `href`, dan wordt de heading een stretched link: de hele card is klikbaar, terwijl screenreaders alleen de heading-tekst als linknaam voorlezen. Gebruik `CardGroup` voor groepen van cards met gelijke hoogte.

<!-- VOORBEELD -->

## Use when

- Overzichtspagina's met navigeerbare content-items (artikelen, producten, nieuwsberichten).
- Zoekresultaten met een preview van afbeelding, titel en samenvatting.
- Dashboards met samenvattende blokken die doorlinken naar detailpagina's.
- Groepen van gelijksoortige items waarbij visuele consistentie (gelijke hoogte, uitgelijnde footer) vereist is.

## Don't use when

- De inhoud geen navigatie-actie heeft en geen zelfstandig blok vormt: gebruik dan **Note** of **Alert**.
- Het gaat om losse KPI-statistieken zonder navigatie-actie.
- Een eenvoudige container zonder gestructureerde secties vereist is: gebruik dan een `<div>` met padding.

## Best practices

### Volgorde van de secties

- Zet `CardHeader` in de code altijd **vóór** `CardPreHeader`. Een screenreader leest de heading dan eerst, en daarna pas de afbeelding of badge die erbij hoort (WCAG 1.3.2). De CSS zet de pre-header visueel bovenaan via `order: -1`.
- Zet geen links of knoppen in de pre-header. Door `order` zou de focusvolgorde anders afwijken van wat je ziet.
- Elke sectie is optioneel. Een card kan ook alleen een header en footer hebben: de footer blijft onderaan staan.

### Afbeelding en placeholder

- Een `Image` als direct kind van `CardPreHeader` loopt door tot de rand van de card. Overige inhoud in de pre-header, zoals een badge, houdt zijn padding.
- Decoratieve afbeelding: geef `alt=""` mee. Staat er tekst op de afbeelding of heeft hij betekenis, geef dan een alt-tekst. Dankzij de DOM-volgorde komt die ná de heading.
- Gebruik de `Image` component met `ratio="16:9"` voor consistente beeldverhoudingen in een groep.
- Een `CardPreHeader` zonder children toont automatisch een afbeeldingsplaceholder met `aria-hidden="true"`.

### Heading of label

- Gebruik `CardHeading` wanneer de card een zelfstandig onderwerp introduceert, zoals een nieuwsbericht, product of evenement.
- Gebruik `CardLabel` wanneer de card vooral een compacte aanduiding of navigatie-element is, zoals een login-optie of instelling. Een label is een `<p>`, geen heading.
- Kies het `level` van `CardHeading` op basis van de documenthiërarchie: een `h2` direct onder de `h1` van de pagina, een `h3` binnen een sectie met een `h2`. De visuele grootte is altijd gelijk.
- Badges die bij het onderwerp horen (zoals "Nieuw") zet je in de header, direct na de heading.

### Stretched link en affordance

- Met `href` op `Card` krijgen `CardHeading` en `CardLabel` automatisch een `<a class="dsn-card__link">`. Het `::before` pseudo-element daarvan dekt de volledige card.
- Een visuele "Lees meer" naar dezelfde bestemming: gebruik `CardAffordance`. Dat is een `<span aria-hidden="true">` die eruitziet als een link. Er komt geen tweede tabstop bij.
- Wil je de call-to-action in de footer als de echte link gebruiken? Laat `href` op `Card` dan weg, en geef de link in de footer de class `dsn-card__link`. Maak de linktekst uniek, eventueel met een `dsn-visually-hidden` aanvulling, zodat een screenreader niet bij elke card "Bekijk artikel" voorleest.
- Links en knoppen naar een **andere** bestemming staan boven de stretched link en blijven zelfstandig klikbaar.

### Beschrijving en meta

- `CardDescription` en `CardMeta` zijn `<p>`-elementen met eigen typografie-tokens, zonder marges. Zet ze in de body.
- Gebruik voor een datum in `CardMeta` een `<time>`-element met `dateTime`.

### CardGroup

- Gebruik `CardGroup` met `as="ul"` (standaard) voor cards die een lijst van gelijksoortige items vormen: geeft screenreadergebruikers de context "Lijst, [n] items".
- Gebruik `as="div"` wanneer cards geen lijst-context hebben (bijv. featured cards op een homepage).

## Design tokens

De tokens van de pre-header verwijzen standaard naar die van de header: pas je de header aan, dan verandert de pre-header mee.

| Token                                                            | Beschrijving                                                      |
| ---------------------------------------------------------------- | ----------------------------------------------------------------- |
| `--dsn-card-background-color`                                    | Achtergrondkleur standaard (bg-document)                          |
| `--dsn-card-background-color-hover`                              | Achtergrondkleur bij hover (bg-elevated)                          |
| `--dsn-card-border-radius`                                       | Afgeronde hoeken (8px)                                            |
| `--dsn-card-border-width`                                        | Randbreedte                                                       |
| `--dsn-card-border-color`                                        | Randkleur (neutral.border-subtle)                                 |
| `--dsn-card-box-shadow`                                          | Standaard schaduw (none)                                          |
| `--dsn-card-box-shadow-hover`                                    | Schaduw bij hover (md-elevatie)                                   |
| `--dsn-card-min-block-size`                                      | Minimale hoogte van de card (auto)                                |
| `--dsn-card-pre-header-padding-block-start` / `-end`             | Verticale padding van de pre-header (volgt de header)             |
| `--dsn-card-pre-header-padding-inline-start` / `-end`            | Horizontale padding van de pre-header (volgt de header)           |
| `--dsn-card-pre-header-row-gap`                                  | Ruimte tussen kinderen van de pre-header (volgt de header)        |
| `--dsn-card-header-padding-block-start`                          | Bovenkant padding van de header (16px)                            |
| `--dsn-card-header-padding-block-end`                            | Onderkant padding van de header (12px), ook de ruimte tot de body |
| `--dsn-card-header-padding-inline-start` / `-end`                | Horizontale padding van de header (16px)                          |
| `--dsn-card-header-row-gap`                                      | Ruimte tussen kinderen van de header (12px)                       |
| `--dsn-card-body-padding-block-start`                            | Bovenkant padding van de body (0)                                 |
| `--dsn-card-body-padding-block-end`                              | Onderkant padding van de body (16px)                              |
| `--dsn-card-body-padding-inline-start` / `-end`                  | Horizontale padding van de body (16px)                            |
| `--dsn-card-body-row-gap`                                        | Ruimte tussen kinderen van de body (12px)                         |
| `--dsn-card-footer-padding-block-start`                          | Bovenkant padding van de footer (0)                               |
| `--dsn-card-footer-padding-block-end`                            | Onderkant padding van de footer (24px)                            |
| `--dsn-card-footer-padding-inline-start` / `-end`                | Horizontale padding van de footer (16px)                          |
| `--dsn-card-footer-column-gap`                                   | Ruimte tussen kinderen van de footer                              |
| `--dsn-card-image-placeholder-background-color`                  | Achtergrond van de afbeeldingsplaceholder                         |
| `--dsn-card-image-placeholder-color`                             | Kleur van het icoon in de placeholder                             |
| `--dsn-card-heading-font-family` / `-font-size` / `-font-weight` | Typografie van de card heading                                    |
| `--dsn-card-heading-line-height` / `-color`                      | Regelafstand en kleur van de card heading                         |
| `--dsn-card-label-font-family` / `-font-size` / `-font-weight`   | Typografie van het card-label                                     |
| `--dsn-card-label-line-height` / `-color`                        | Regelafstand en kleur van het card-label                          |
| `--dsn-card-description-font-size` / `-line-height` / `-color`   | Typografie van de card-description                                |
| `--dsn-card-meta-font-size` / `-line-height` / `-color`          | Typografie van de card-meta                                       |
| `--dsn-card-group-gap`                                           | Ruimte tussen cards in een groep (16px)                           |
| `--dsn-card-group-item-min-width`                                | Minimale breedte per card (17.5rem)                               |

## Accessibility

- De card root is `<article>`: een semantisch zelfstandig inhoudsblok, navigeerbaar via screenreader-sneltoets.
- De header staat in de DOM vóór de pre-header. Informatie in de pre-header (alt-tekst, badge) wordt dus ná de heading voorgelezen, en wie op koppen navigeert mist niets (WCAG 1.3.2).
- Een decoratieve afbeelding heeft `alt=""`; de `Image` component zet dan zelf `aria-hidden="true"` op de `<figure>`. Een betekenisvolle afbeelding krijgt een alt-tekst en wordt gewoon voorgelezen.
- De `dsn-card__image-placeholder` heeft `aria-hidden="true"`: puur decoratief.
- Aankondiging door screenreaders: "[Artikeltitel], link": alleen de linktekst, niet de volledige card-inhoud.
- `CardAffordance` is `aria-hidden` en niet focusbaar: de stretched link biedt de interactie al, dus er is maar één tabstop per card.
- Focus-ring: `:has(.dsn-card__link:focus-visible)` toont een focus-ring rondom de gehele card. De link zelf heeft dan geen eigen outline.
- `CardGroup` als `<ul role="list">` geeft screenreadergebruikers de context "Lijst, [n] items". `role="list"` is nodig omdat veel CSS-resets de lijstsemantiek van `<ul>` verwijderen.
- CSS `:has()` is vereist voor de hover- en focusstaten (baseline 2023, breed ondersteund).
