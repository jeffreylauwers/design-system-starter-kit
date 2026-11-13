# BreadcrumbNavigation

Toont de hiërarchische locatie van de gebruiker en biedt navigatie naar bovenliggende pagina's.

## Doel

De BreadcrumbNavigation component geeft gebruikers inzicht in hun positie binnen de sitestructuur. Elke stap in het pad is een link naar het bijbehorende niveau. De huidige pagina is bewust geen link, wordt visueel onderscheiden en is gemarkeerd met `aria-current="page"`. De component ondersteunt een compacte variant die via een container query automatisch terugvalt naar enkel het ouder-niveau met een terug-pijl wanneer de beschikbare ruimte te klein is.

<!-- VOORBEELD -->

## Wel gebruiken als...

- De pagina dieper dan één niveau in de sitestructuur ligt.
- De broodkruimel een aanvulling is op de primaire navigatie, nooit een vervanging.
- Gebruikers baat hebben bij context over waar zij zich bevinden in de hiërarchie.

## Niet gebruiken als...

- Het om de homepage of een pagina van één niveau diep gaat: voeg geen broodkruimel toe zonder hiërarchische context.
- De sitestructuur plat is (minder dan twee niveaus): de component is dan overbodig.

## Goed gebruik

### Plaatsing

- Zet de BreadcrumbNavigation na de primaire navigatie, vóór `<main>`. Zo kan een skip-link de volledige navigatie (inclusief breadcrumb) in één keer overslaan.

### Inhoud

- Gebruik de paginatitels als linktekst: consistent met de `<h1>` van elke pagina.
- Voeg de huidige pagina altijd toe als laatste item met `current`. Dit geeft gebruikers bevestiging van hun locatie.
- Geef het huidige item geen `href`: het wordt als platte tekst gerenderd. Een link naar de pagina waar je al bent doet niets, terwijl hij er wel uitziet als de andere items in het pad.

### Compact variant

- Gebruik `variant="compact"` wanneer de breadcrumb in een mogelijk smalle context staat (sidebar, modal, embedded component). De container query zorgt automatisch voor de juiste weergave.
- De compacte modus toont enkel het directe ouder-niveau met een terug-pijl (`← Ouder`). Dit houdt de hiërarchische context intact conform WCAG 1.4.10 Reflow.

## Design tokens

<!-- tokens: breadcrumb-navigation -->

## Toegankelijkheid

- `<nav>` met `aria-label` identificeert de breadcrumb als navigatielandmark. Gebruik een beschrijvend label (standaard: `"Broodkruimelpad"`) zodat deze te onderscheiden is van andere `<nav>` landmarks op de pagina.
- `<ol>` signaleert aan screenreaders dat de volgorde van items semantisch betekenisvol is.
- `aria-current="page"` op de `<li>` van de huidige pagina informeert hulptechnologie over de huidige locatie.
- Het huidige item is geen link. Elementen die hetzelfde doen moeten er hetzelfde uitzien, en een link die niet navigeert breekt die verwachting (WCAG 3.2.4 Consistent Identification). Dat scheelt screenreader- en toetsenbordgebruikers ook een zinloze tabstop.
- Alle scheidingstekens en het terug-pijl icoon zijn decoratief en hebben `aria-hidden="true"`.
- Alle links zijn volledig toetsenbordtoegankelijk via Tab: geen extra ARIA of tabindex vereist. Het huidige item krijgt geen tabstop omdat het geen link is.
