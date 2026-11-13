# Image

Performante, toegankelijke wrapper rond het native `<img>` element met ingebakken lazy loading en ondersteuning voor vaste beeldverhoudingen.

## Doel

De Image component biedt een semantisch correcte afbeeldingcontainer op basis van `<figure>` en `<img>`. Gebruik het voor contentafbeeldingen waarbij CLS-preventie, laadprioriteit of vaste beeldverhoudingen vereist zijn. Het component biedt ingebakken lazy loading, expliciete ondersteuning voor LCP/hero-afbeeldingen via een `priority` prop, en drie vaste beeldverhoudingen via de CSS `aspect-ratio` property.

<!-- VOORBEELD -->

## Wel gebruiken als...

- Je contentafbeeldingen toont in artikelen, cards en hero-secties.
- Een vaste beeldverhouding vereist is (bijv. 16:9 voor video-thumbnails).
- Het een LCP-afbeelding is waarbij laadprioriteit expliciet gestuurd moet worden.
- Een optioneel bijschrift (`<figcaption>`) bij de afbeelding gewenst is.

## Niet gebruiken als...

- Het om decoratieve SVG-iconen of UI-iconen gaat: gebruik daarvoor het **Icon** component.
- De afbeelding via CSS als achtergrond gezet wordt (`background-image`).

## Goed gebruik

### Alt-tekst

- Schrijf beschrijvende alt-tekst die de betekenis van de afbeelding overbrengt, niet de inhoud letterlijk beschrijft.
- Gebruik `alt=""` (lege string) voor puur decoratieve afbeeldingen: de React-component voegt dan automatisch `aria-hidden="true"` toe aan de `<figure>`.
- Laat `alt` nooit weg: een ontbrekend `alt` attribuut is een WCAG 2.2 SC 1.1.1 overtreding.

### Breedte en hoogte

- Geef altijd `width` en `height` mee met de intrinsieke pixelafmetingen van de afbeelding.
- De browser reserveert daardoor de ruimte vooraf en voorkomt layout shift (CLS).
- De werkelijke weergavegrootte wordt bepaald door CSS: de attributen zijn alleen een hint voor de browser.

### Beeldverhoudingen

- Gebruik `ratio` om een vaste beeldverhouding te forceren. Dit is nuttig bij wisselende bronafbeeldingen (bijv. gebruikersuploads).
- `object-fit: cover` (standaard) snijdt de afbeelding bij zodat deze het kader vult.
- Gebruik `objectFit="contain"` als de volledige afbeelding zichtbaar moet blijven (bijv. voor logo's of diagrammen).

### Priority (LCP)

- Gebruik `priority` **maximaal één keer per pagina**, alleen voor de grootste bovenste-viewport-afbeelding (LCP).
- `priority` stelt `loading="eager"` en `fetchpriority="high"` in, waardoor de browser de afbeelding met hoge prioriteit laadt.
- Gebruik `priority` **nooit** voor afbeeldingen buiten de initiële viewport.

### Bijschrift

- Gebruik `caption` voor tekst die de afbeelding toelicht of van bron voorziet.
- De `<figcaption>` is semantisch gelinkt aan de `<figure>`: geen extra `aria-labelledby` nodig.

### srcSet en sizes

- Gebruik `srcSet` en `sizes` voor responsieve afbeeldingen met meerdere formaten.
- Het component berekent deze waarden niet intern: dit is afhankelijk van de asset pipeline van de applicatie (Next.js, Cloudinary, etc.).

## Design tokens

<!-- tokens: image -->

## Toegankelijkheid

- `alt` is altijd verplicht aanwezig als attribuut. Een ontbrekend `alt` is een WCAG 2.2 SC 1.1.1 overtreding.
- `alt=""` (lege string) is correct voor decoratieve afbeeldingen: de React-component voegt automatisch `aria-hidden="true"` toe aan de `<figure>`.
- Gebruik **nooit** `role="presentation"` in combinatie met `alt=""`: dit is een HTML-validatiefout.
- `<figure>` heeft de impliciete ARIA-rol `figure`: geen extra `role` attribuut nodig.
- `<figcaption>` is semantisch gelinkt aan de `<figure>`: geen extra `aria-labelledby` nodig.
- `<figure>` en `<img>` zijn niet focusbaar. Als de afbeelding klikbaar moet zijn, wrap dan met `Link` of `ButtonLink` buiten dit component.
- `decoding="async"` wordt altijd toegepast om de hoofdthread niet te blokkeren.
