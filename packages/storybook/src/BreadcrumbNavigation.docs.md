# BreadcrumbNavigation

Toont de hiërarchische locatie van de gebruiker en biedt navigatie naar bovenliggende pagina's.

## Doel

De BreadcrumbNavigation component geeft gebruikers inzicht in hun positie binnen de sitestructuur. Elke stap in het pad is een link naar het bijbehorende niveau. De huidige pagina wordt visueel onderscheiden en is gemarkeerd met `aria-current="page"`. De component ondersteunt een compacte variant die via een container query automatisch terugvalt naar enkel het ouder-niveau met een terug-pijl wanneer de beschikbare ruimte te klein is.

<!-- VOORBEELD -->

## Use when

- Op pagina's dieper dan één niveau in de sitestructuur.
- Als aanvulling op de primaire navigatie — nooit als vervanging.
- Wanneer gebruikers baat hebben bij context over waar zij zich bevinden in de hiërarchie.

## Don't use when

- Op de homepage of op pagina's van één niveau diep — voeg geen broodkruimel toe zonder hiërarchische context.
- Als de sitestructuur plat is (minder dan twee niveaus) — de component is dan overbodig.

## Best practices

### Plaatsing

- Zet de BreadcrumbNavigation na de primaire navigatie, vóór `<main>`. Zo kan een skip-link de volledige navigatie (inclusief breadcrumb) in één keer overslaan.

### Inhoud

- Gebruik de paginatitels als linktekst — consistent met de `<h1>` van elke pagina.
- Voeg de huidige pagina altijd toe als laatste item met `current`, zelfs als het een link is. Dit geeft gebruikers bevestiging van hun locatie.

### Compact variant

- Gebruik `variant="compact"` wanneer de breadcrumb in een mogelijk smalle context staat (sidebar, modal, embedded component). De container query zorgt automatisch voor de juiste weergave.
- De compacte modus toont enkel het directe ouder-niveau met een terug-pijl (`← Ouder`). Dit houdt de hiërarchische context intact conform WCAG 1.4.10 Reflow.

## Design tokens

| Token                                                          | Beschrijving                                          |
| -------------------------------------------------------------- | ----------------------------------------------------- |
| `--dsn-breadcrumb-navigation-font-size`                        | Lettergrootte — `sm` (consistent met Link size small) |
| `--dsn-breadcrumb-navigation-line-height`                      | Regelafstand — `sm`                                   |
| `--dsn-breadcrumb-navigation-font-weight`                      | Lettergewicht                                         |
| `--dsn-breadcrumb-navigation-column-gap`                       | Ruimte tussen items in de lijst                       |
| `--dsn-breadcrumb-navigation-current-color`                    | Kleur van het huidige pagina-item                     |
| `--dsn-breadcrumb-navigation-item-min-block-size`              | Minimale klikhoogte van een item                      |
| `--dsn-breadcrumb-navigation-item-padding-block`               | Verticale padding van een item                        |
| `--dsn-breadcrumb-navigation-item-padding-inline`              | Horizontale padding van een item                      |
| `--dsn-breadcrumb-navigation-link-color`                       | Linkkleur (standaard)                                 |
| `--dsn-breadcrumb-navigation-link-column-gap`                  | Ruimte tussen icoon en linktekst                      |
| `--dsn-breadcrumb-navigation-link-text-decoration-line`        | Onderstreping standaard                               |
| `--dsn-breadcrumb-navigation-link-text-underline-offset`       | Offset van de onderstreping                           |
| `--dsn-breadcrumb-navigation-link-text-decoration-thickness`   | Dikte van de onderstreping                            |
| `--dsn-breadcrumb-navigation-link-hover-color`                 | Linkkleur bij hover                                   |
| `--dsn-breadcrumb-navigation-link-hover-text-decoration-line`  | Onderstreping bij hover                               |
| `--dsn-breadcrumb-navigation-link-active-color`                | Linkkleur bij active                                  |
| `--dsn-breadcrumb-navigation-link-active-text-decoration-line` | Onderstreping bij active                              |
| `--dsn-breadcrumb-navigation-separator-color`                  | Kleur van het scheidingsteken                         |
| `--dsn-breadcrumb-navigation-separator-size`                   | Grootte van het scheidingsteken — `icon.sm`           |
| `--dsn-breadcrumb-navigation-icon-size`                        | Grootte van het terug-pijl icoon — `icon.sm`          |

## Accessibility

- `<nav>` met `aria-label` identificeert de breadcrumb als navigatielandmark. Gebruik een beschrijvend label (standaard: `"Broodkruimelpad"`) zodat deze te onderscheiden is van andere `<nav>` landmarks op de pagina.
- `<ol>` signaleert aan screenreaders dat de volgorde van items semantisch betekenisvol is.
- `aria-current="page"` op de link van de huidige pagina informeert hulptechnologie over de huidige locatie.
- Alle scheidingstekens en het terug-pijl icoon zijn decoratief en hebben `aria-hidden="true"`.
- Alle links zijn volledig toetsenbordtoegankelijk via Tab — geen extra ARIA of tabindex vereist.
