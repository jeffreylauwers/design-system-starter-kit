# Heading

Een koptekst die secties structureert en hiërarchie creëert binnen de interface.

## Doel

De Heading component biedt een consistente, toegankelijke manier om koppen weer te geven. De component scheidt semantische betekenis (`level` prop: h1-h6) van visuele verschijning (`appearance` prop: heading-1 tot heading-6). Dit maakt het mogelijk om de documentstructuur correct te houden voor toegankelijkheid, terwijl je toch volledige controle hebt over de visuele hiërarchie. Alle headings gebruiken responsive fluid type scaling voor optimale leesbaarheid op alle schermformaten.

<!-- VOORBEELD -->

## Wel gebruiken als...

- Je secties wilt markeren en structuur wilt aanbrengen in je content.
- Je een duidelijke visuele hiërarchie wilt creëren tussen verschillende contentlagen.
- Je de semantische documentstructuur correct wilt houden voor screenreaders en SEO.
- Je een visuele kop nodig hebt die niet matcht met de semantische level (gebruik `appearance`).

## Niet gebruiken als...

- Je lopende tekst wilt weergeven: gebruik dan de [Paragraph](/docs/components-paragraph--docs) component.
- Je interactieve elementen wilt tonen: gebruik dan buttons of links.
- De tekst puur decoratief is zonder structurele betekenis.

## Goed gebruik

- **Eén h1 per pagina.** Gebruik precies één `level={1}` per pagina voor de hoofdtitel. Dit is belangrijk voor toegankelijkheid en SEO.
- **Respecteer de heading hiërarchie.** Spring geen levels over (bijv. niet direct van h2 naar h5). Dit helpt screenreaders de documentstructuur te begrijpen.
- **Gebruik `appearance` voor visuele flexibiliteit.** Als je een h3 visueel kleiner wilt maken, gebruik dan `<Heading level={3} appearance="heading-5">` in plaats van `level={5}` te gebruiken.
- **Houd headings kort en beschrijvend.** Goede headings zijn 1-6 woorden en beschrijven duidelijk wat volgt.
- **Gebalanceerde regelafbrekingen.** Alle headings gebruiken `text-wrap: balance` zodat tekst gelijkmatig over regels verdeeld wordt en weeswoorden worden vermeden.
- **Combineer met paragraphs.** Gebruik headings om secties te markeren en paragraphs voor de lopende tekst binnen die secties.
- **Test met screenreaders.** Verifieer dat de heading structuur logisch is wanneer je door de headings navigeert (NVDA, JAWS, VoiceOver).

## Design tokens

<!-- tokens: heading -->

## Toegankelijkheid

- De component gebruikt semantische HTML heading elementen (h1-h6) voor correcte documentstructuur.
- Screenreaders kunnen door headings navigeren om snel een overzicht van de pagina te krijgen.
- De scheiding tussen `level` (semantiek) en `appearance` (visueel) maakt het mogelijk om zowel toegankelijk als visueel aantrekkelijk te zijn.
- Alle headings schalen met gebruikersvoorkeuren voor lettergrootte (relative units).
- Heading levels moeten een logische hiërarchie vormen (niet springen, bijv. h2 → h3, niet h2 → h5).
