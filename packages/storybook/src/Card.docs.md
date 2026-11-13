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

## Wel gebruiken als...

- Je op een overzichtspagina navigeerbare content-items toont (artikelen, producten, nieuwsberichten).
- Je zoekresultaten toont met een preview van afbeelding, titel en samenvatting.
- Je in een dashboard samenvattende blokken toont die doorlinken naar detailpagina's.
- Je een groep gelijksoortige items toont waarbij visuele consistentie (gelijke hoogte, uitgelijnde footer) vereist is.

## Niet gebruiken als...

- De inhoud geen navigatie-actie heeft en geen zelfstandig blok vormt: gebruik dan **Note** of **Alert**.
- Het om losse KPI-statistieken zonder navigatie-actie gaat.
- Een eenvoudige container zonder gestructureerde secties vereist is: gebruik dan een `<div>` met padding.

## Goed gebruik

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

<!-- tokens: card -->

## Toegankelijkheid

- De card root is `<article>`: een semantisch zelfstandig inhoudsblok, navigeerbaar via screenreader-sneltoets.
- De header staat in de DOM vóór de pre-header. Informatie in de pre-header (alt-tekst, badge) wordt dus ná de heading voorgelezen, en wie op koppen navigeert mist niets (WCAG 1.3.2).
- Een decoratieve afbeelding heeft `alt=""`; de `Image` component zet dan zelf `aria-hidden="true"` op de `<figure>`. Een betekenisvolle afbeelding krijgt een alt-tekst en wordt gewoon voorgelezen.
- De `dsn-card__image-placeholder` heeft `aria-hidden="true"`: puur decoratief.
- Aankondiging door screenreaders: "[Artikeltitel], link": alleen de linktekst, niet de volledige card-inhoud.
- `CardAffordance` is `aria-hidden` en niet focusbaar: de stretched link biedt de interactie al, dus er is maar één tabstop per card.
- Focus-ring: `:has(.dsn-card__link:focus-visible)` toont een focus-ring rondom de gehele card. De link zelf heeft dan geen eigen outline.
- `CardGroup` als `<ul role="list">` geeft screenreadergebruikers de context "Lijst, [n] items". `role="list"` is nodig omdat veel CSS-resets de lijstsemantiek van `<ul>` verwijderen.
- CSS `:has()` is vereist voor de hover- en focusstaten (baseline 2023, breed ondersteund).
