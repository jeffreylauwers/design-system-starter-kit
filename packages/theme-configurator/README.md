# Theme Configurator

Interactieve theme configurator voor het Design System Starter Kit, de opvolger van de color palette generator. Links stel je het thema in, rechts zie je het direct in een voorbeeld met echte componenten. Nu stel je de kleuren in: een volledig semantisch kleurenpalet op basis van één basiskleur per kleurgroep. Typografie, ruimte, hoekafronding en schaduw volgen (epic #520).

De configurator is zelf gebouwd met de componenten van de starter kit, in Start dark. Alleen het voorbeeld toont het thema dat je instelt.

## Features

- **Begint bij Start:** de basiskleuren en verwijzingen uit `packages/design-tokens/src/tokens/themes/start/theme.config.json`
- **10 kleurgroepen van Start** (neutral, accent-1–3, action-1–2, info, positive, negative, warning); een groep kan naar een andere verwijzen, zoals accent-2 naar accent-1
- **OKLCH-gebaseerde kleurafleiding** over drie tracks: backgrounds, borders, tekst/iconen
- **WCAG 2.x contrast enforcement**: L wordt automatisch bijgesteld als een contrasteis niet gehaald wordt
- **Inverse-sectie** voor emphasis-blokken en primaire knoppen
- **Live voorbeeld** in vier scènes (Componenten, Pagina, Formulier, Artikel), in light of dark, op 360, 768 of 1280 pixels breed of passend, en in de dichtheid standaard of compact
- **Light/dark**: in het voorbeeld; het palet in het paneel volgt mee
- **Intensiteit**: schaalt de chroma-curve op of af voor alle groepen tegelijk
- **HEX / OKLCH weergave toggle**
- **Een swatch activeren kopieert de kleurwaarde**; een live region meldt het
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

De tool is beschikbaar op `http://localhost:5173`. De configurator gebruikt de gebouwde `dist` van `design-tokens`, `core` en `components-react`: draai eerst `pnpm build`, en opnieuw na een wijziging in die packages.

## Thema integreren

De kleuren van Start vervangen:

1. Exporteer `theme.config.json`
2. Vervang `packages/design-tokens/src/tokens/themes/start/theme.config.json`
3. Voer `pnpm build:tokens` uit: de build schrijft `colors-light.json` en `colors-dark.json` uit de config

Een eigen groep krijgt geen `$description`; vul die aan in de JSON. Een thema naast Start toevoegen wordt eenvoudiger met #523; de zip-export volgt in #528.

## Opbouw

| Map of bestand    | Wat                                                                                                                                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/App.tsx`     | De layout: tot `lg` (64em) één kolom met een keuze tussen Instellen en Voorbeeld, vanaf `lg` het paneel links (25rem, scrolt los) en het voorbeeld rechts                                                                 |
| `src/main.tsx`    | Laadt Start dark voor de configurator zelf, en de CSS van core en componenten                                                                                                                                             |
| `src/panel/`      | Het instelpaneel: kleurgroepen, export en uitleg                                                                                                                                                                          |
| `src/preview/`    | Het voorbeeld: de toolbar, de iframe (`PreviewFrame`) en de vier scènes                                                                                                                                                   |
| `src/candidates/` | Kandidaat-componenten (SegmentedControl, Tabs, ColorInput, ColorSwatch): definitieve `dsn-`-namen, beide lagen, nog geen systeemcomponent. Zie [het overzicht](src/candidates/README.md)                                  |
| `src/model/`      | `start.ts`: het thema Start uit `design-tokens`. `theme.ts`: `resolveTheme(config, mode)` en `changedTokens` (alle semantische tokens, of alleen wat afwijkt van Start) en `exportTheme(config)`. `storage.ts`: de sessie |

### Waarom het voorbeeld een iframe is

Het voorbeeld rendert met React via een portal in een iframe met een eigen document. Daardoor:

- **Eigen `:root`:** de iframe laadt de volledige Start-configuratie voor de gekozen modus en dichtheid (`start-{mode}-{density}.css`), met daarna de afwijkingen uit `changedTokens`. Componenttokens zijn `var()`-verwijzingen naar semantische tokens, dus de componenten volgen vanzelf.
- **Eigen viewport:** de media queries van de componenten reageren op de breedte van de iframe. Een viewport breder dan de beschikbare ruimte wordt verkleind getoond.
- **Niets lekt:** de configurator zelf blijft Start dark. `App.test.tsx` bewijst dat een wijziging alleen de iframe raakt.

De configurator gebruikt bewust de volledige dark-configuratie (`design-tokens/css/dark`) en niet de klassen `dsn-theme-start dsn-mode-dark` met `css/scoped/start-dark`. Die scoped bestanden bevatten alleen kleurtokens, en componenttokens lossen hun `var()` op `:root` op: met de klassen blijven de componenten Start light.

### Tests

`src/model/theme.test.ts` controleert dat `resolveTheme` met de Start-config dezelfde waarden geeft als `dist/css/start-*-default.css`, en dat de export dan byte voor byte gelijk is aan de bestanden van Start. `export-build.test.ts` bouwt de export met de Style Dictionary-config van `design-tokens`. `App.test.tsx` controleert de layout, de landmarks en dat een wijziging alleen het voorbeeld raakt. Elke kandidaat heeft eigen tests.

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
