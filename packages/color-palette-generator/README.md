# Color Palette Generator

Interactieve OKLCH kleurenpalet generator voor het Design System Starter Kit. Genereert een volledig semantisch kleurenpalet op basis van één basiskleur per kleurgroep.

## Features

- **10 standaard kleurgroepen** (neutral, accent-1–3, action-1–2, info, positive, negative, warning)
- **OKLCH-gebaseerde kleurafleiding** over drie tracks: backgrounds, borders, tekst/iconen
- **WCAG 2.x contrast enforcement** — L wordt automatisch bijgesteld als een contrasteis niet gehaald wordt
- **Inverse-sectie** voor emphasis-blokken en primaire knoppen
- **Light/dark toggle** — herberekent het volledige palet
- **Intensiteitsslider** — schalt de chroma-curve op of af voor alle groepen tegelijk
- **HEX / OKLCH weergave toggle**
- **Klikken op swatch kopieert kleurwaarde** naar klembord
- **Custom kleurgroepen** — toevoegen, hernoemen, verwijderen
- **Exporteren** in drie formaten: DTCG JSON, Tokens Studio JSON, Generieke JSON

De rekenlogica (kleurgroepen en contrastregels) staat in [`@dsn-starter-kit/theme-engine`](../theme-engine). Daar komen ook de Start-kleuren vandaan.

## Live

De tool is beschikbaar op:
**https://jeffreylauwers.github.io/design-system-starter-kit/color-palette-generator/**

## Lokaal ontwikkelen

```bash
pnpm --filter @dsn-starter-kit/color-palette-generator dev
```

De tool is beschikbaar op `http://localhost:5173` (of `5174` als 5173 bezet is).

## Thema integreren

Na export doe je het volgende:

1. Exporteer `colors-light.json` + `colors-dark.json` via de DTCG-knop
2. Maak `packages/design-tokens/src/tokens/themes/[naam]/` aan
3. Kopieer de geëxporteerde bestanden + `start/base.json` naar die map
4. Voeg de naam toe aan `themes` in `packages/design-tokens/src/config/config.js`
5. Voer `pnpm build:tokens` uit

## Build

```bash
pnpm --filter @dsn-starter-kit/color-palette-generator build
```

De output staat in `dist/` en wordt door de deploy-workflow meegenomen als `/color-palette-generator/` op GitHub Pages.

## Token-structuur

De generator volgt exact dezelfde token-structuur als het bestaande `start`-thema:

```
dsn.color.[groep].[stap]        # bijv. dsn.color.accent-1.bg-default
dsn.color.[groep]-inverse.[stap] # bijv. dsn.color.accent-1-inverse.bg-default
```

Per kleurgroep zijn er 15 tokens (6 backgrounds + 4 borders + 5 colors) + 15 inverse tokens = 30 tokens per groep.
