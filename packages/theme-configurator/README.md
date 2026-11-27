# Theme Configurator

Interactieve theme configurator voor het Design System Starter Kit, de opvolger van de color palette generator. Nu stel je er de kleuren mee in: een volledig semantisch kleurenpalet op basis van één basiskleur per kleurgroep. Typografie, ruimte, hoekafronding en schaduw volgen (epic #520).

## Features

- **Begint bij Start:** de basiskleuren en verwijzingen uit `packages/design-tokens/src/tokens/themes/start/theme.config.json`
- **10 kleurgroepen van Start** (neutral, accent-1–3, action-1–2, info, positive, negative, warning); een groep kan naar een andere verwijzen, zoals accent-2 naar accent-1
- **OKLCH-gebaseerde kleurafleiding** over drie tracks: backgrounds, borders, tekst/iconen
- **WCAG 2.x contrast enforcement**: L wordt automatisch bijgesteld als een contrasteis niet gehaald wordt
- **Inverse-sectie** voor emphasis-blokken en primaire knoppen
- **Light/dark toggle**: herberekent het volledige palet
- **Intensiteitsslider**: schaalt de chroma-curve op of af voor alle groepen tegelijk
- **HEX / OKLCH weergave toggle**
- **Klikken op swatch kopieert kleurwaarde** naar klembord
- **Eigen kleurgroepen**: toevoegen, hernoemen, verwijderen (de groepen van Start blijven staan)
- **Sessie bewaard** in localStorage; "Terug naar Start" begint opnieuw
- **Exporteren**: `theme.config.json`, `colors-light.json` / `colors-dark.json` op het sjabloon van Start, en Generieke JSON

De rekenlogica (kleurgroepen, contrastregels, fluid-schaal) staat in [`@dsn-starter-kit/theme-engine`](../theme-engine). Daar komen ook de Start-kleuren vandaan.

## Live

De tool is beschikbaar op:
**https://jeffreylauwers.github.io/design-system-starter-kit/theme-configurator/**

Het oude adres `/color-palette-generator/` stuurt door.

## Lokaal ontwikkelen

```bash
pnpm --filter @dsn-starter-kit/theme-configurator dev
```

De tool is beschikbaar op `http://localhost:5173` (of `5174` als 5173 bezet is).

## Thema integreren

De kleuren van Start vervangen:

1. Exporteer `theme.config.json`
2. Vervang `packages/design-tokens/src/tokens/themes/start/theme.config.json`
3. Voer `pnpm build:tokens` uit: de build schrijft `colors-light.json` en `colors-dark.json` uit de config

Een eigen groep krijgt geen `$description`; vul die aan in de JSON. Een thema naast Start toevoegen wordt eenvoudiger met #523; de zip-export volgt in #528.

## Opbouw

| Bestand                | Wat                                                                                                                                                                                 |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/model/start.ts`   | Het thema Start uit `design-tokens`: de config, de token-JSON en het project type `default`                                                                                         |
| `src/model/theme.ts`   | `resolveTheme(config, mode)`: alle semantische tokens als CSS custom properties, gelijk aan wat de build schrijft. `exportTheme(config)`: de themabestanden, met Start als sjabloon |
| `src/model/storage.ts` | De sessie in localStorage; elke toegang staat in een try/catch                                                                                                                      |

`src/model/theme.test.ts` controleert dat `resolveTheme` met de Start-config dezelfde waarden geeft als `dist/css/start-*-default.css`, en dat de export dan byte voor byte gelijk is aan de bestanden van Start. `export-build.test.ts` bouwt de export met de Style Dictionary-config van `design-tokens`.

## Build

```bash
pnpm --filter @dsn-starter-kit/theme-configurator build
```

De output staat in `dist/` en wordt door de deploy-workflow meegenomen als `/theme-configurator/` op GitHub Pages. Op `/color-palette-generator/` zet hij `redirect/color-palette-generator.html`, die doorstuurt naar het nieuwe adres.

## Token-structuur

De configurator volgt exact dezelfde token-structuur als het bestaande `start`-thema:

```
dsn.color.[groep].[stap]        # bijv. dsn.color.accent-1.bg-default
dsn.color.[groep]-inverse.[stap] # bijv. dsn.color.accent-1-inverse.bg-default
```

Per kleurgroep zijn er 15 tokens (6 backgrounds + 4 borders + 5 colors) + 15 inverse tokens = 30 tokens per groep.
