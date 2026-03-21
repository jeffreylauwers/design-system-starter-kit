# Heading

Een koptekst die secties structureert en hiërarchie creëert binnen de interface.

## Doel

De Heading component biedt een consistente, toegankelijke manier om koppen weer te geven. De component scheidt semantische betekenis (`level` prop: h1-h6) van visuele verschijning (`appearance` prop: heading-1 tot heading-6). Dit maakt het mogelijk om de documentstructuur correct te houden voor toegankelijkheid, terwijl je toch volledige controle hebt over de visuele hiërarchie. Alle headings gebruiken responsive fluid type scaling voor optimale leesbaarheid op alle schermformaten.

<!-- VOORBEELD -->

## Use when

- Je secties wilt markeren en structuur wilt aanbrengen in je content.
- Je een duidelijke visuele hiërarchie wilt creëren tussen verschillende contentlagen.
- Je de semantische documentstructuur correct wilt houden voor screenreaders en SEO.
- Je een visuele kop nodig hebt die niet matcht met de semantische level (gebruik `appearance`).

## Don't use when

- Je lopende tekst wilt weergeven — gebruik dan de [Paragraph](/docs/components-paragraph--docs) component.
- Je interactieve elementen wilt tonen — gebruik dan buttons of links.
- De tekst puur decoratief is zonder structurele betekenis.

## Best practices

- **Eén h1 per pagina.** Gebruik precies één `level={1}` per pagina voor de hoofdtitel. Dit is belangrijk voor toegankelijkheid en SEO.
- **Respecteer de heading hiërarchie.** Spring geen levels over (bijv. niet direct van h2 naar h5). Dit helpt screenreaders de documentstructuur te begrijpen.
- **Gebruik `appearance` voor visuele flexibiliteit.** Als je een h3 visueel kleiner wilt maken, gebruik dan `<Heading level={3} appearance="heading-5">` in plaats van `level={5}` te gebruiken.
- **Houd headings kort en beschrijvend.** Goede headings zijn 1-6 woorden en beschrijven duidelijk wat volgt.
- **Gebalanceerde regelafbrekingen.** Alle headings gebruiken `text-wrap: balance` zodat tekst gelijkmatig over regels verdeeld wordt en weeswoorden worden vermeden.
- **Combineer met paragraphs.** Gebruik headings om secties te markeren en paragraphs voor de lopende tekst binnen die secties.
- **Test met screenreaders.** Verifieer dat de heading structuur logisch is wanneer je door de headings navigeert (NVDA, JAWS, VoiceOver).

## Design tokens

| Token                                    | Beschrijving                                         |
| ---------------------------------------- | ---------------------------------------------------- |
| `--dsn-heading-color`                    | Tekstkleur voor alle headings                        |
| `--dsn-heading-font-family`              | Lettertypefamilie voor alle headings (IBM Plex Sans) |
| `--dsn-heading-font-weight`              | Font weight voor alle headings (700 - bold)          |
| `--dsn-heading-level-1-font-size`        | Font size heading 1 (3xl - 40px-53px fluid)          |
| `--dsn-heading-level-1-line-height`      | Line height heading 1                                |
| `--dsn-heading-level-1-margin-block-end` | Bottom margin heading 1                              |
| `--dsn-heading-level-2-font-size`        | Font size heading 2 (2xl - 32px-41px fluid)          |
| `--dsn-heading-level-2-line-height`      | Line height heading 2                                |
| `--dsn-heading-level-2-margin-block-end` | Bottom margin heading 2                              |
| `--dsn-heading-level-3-font-size`        | Font size heading 3 (xl - 24px-31px fluid)           |
| `--dsn-heading-level-3-line-height`      | Line height heading 3                                |
| `--dsn-heading-level-3-margin-block-end` | Bottom margin heading 3                              |
| `--dsn-heading-level-4-font-size`        | Font size heading 4 (lg - 20px-24.5px fluid)         |
| `--dsn-heading-level-4-line-height`      | Line height heading 4                                |
| `--dsn-heading-level-4-margin-block-end` | Bottom margin heading 4                              |
| `--dsn-heading-level-5-font-size`        | Font size heading 5 (md - 16px-20.5px fluid)         |
| `--dsn-heading-level-5-line-height`      | Line height heading 5                                |
| `--dsn-heading-level-5-margin-block-end` | Bottom margin heading 5                              |
| `--dsn-heading-level-6-font-size`        | Font size heading 6 (sm - 14px-17px fluid)           |
| `--dsn-heading-level-6-line-height`      | Line height heading 6                                |
| `--dsn-heading-level-6-margin-block-end` | Bottom margin heading 6                              |

## Accessibility

- De component gebruikt semantische HTML heading elementen (h1-h6) voor correcte documentstructuur.
- Screenreaders kunnen door headings navigeren om snel een overzicht van de pagina te krijgen.
- De scheiding tussen `level` (semantiek) en `appearance` (visueel) maakt het mogelijk om zowel toegankelijk als visueel aantrekkelijk te zijn.
- Alle headings schalen met gebruikersvoorkeuren voor lettergrootte (relative units).
- Heading levels moeten een logische hiërarchie vormen (niet springen, bijv. h2 → h3, niet h2 → h5).
