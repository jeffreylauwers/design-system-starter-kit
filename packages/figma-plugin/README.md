# @dsn-starter-kit/figma-plugin

Schrijft de JSON die `design-tokens` en `figma-sync` genereren weg naar Figma.

Dit is het enige onderdeel van de keten dat Figma daadwerkelijk aanraakt.
Bewust een plugin en geen REST-integratie: de Variables REST API vereist een
Enterprise-plan, terwijl de Plugin API op elk plan werkt.

**Er is geen token of API-key nodig.** De plugin draait in Figma Desktop en
leest alleen bestanden die je zelf in de UI kiest. Het manifest declareert
`networkAccess: none`, dus er gaat niets het netwerk op.

## Installeren

```bash
pnpm build:figma-plugin
```

Daarna in Figma Desktop: **Plugins → Development → Import plugin from
manifest**, en kies `packages/figma-plugin/manifest.json`.

## Gebruiken

1. Genereer de bestanden:

```bash
pnpm build:figma
```

2. Start de plugin in een Figma-bestand en sleep er een JSON in:

| Bestand                                   | Wat er gebeurt                          |
| ----------------------------------------- | --------------------------------------- |
| `design-tokens/dist/figma/variables.json` | Variable collections, modes en aliassen |
| `figma-sync/dist/{component}.json`        | Eén component set met al zijn varianten |

Het `$schema`-veld bepaalt wat er geïmporteerd wordt, niet de bestandsnaam.

**Draai `variables.json` als eerste.** Componenten verwijzen naar tokens, dus
de variables moeten bestaan voordat je ze aan lagen kunt binden.

## Idempotent

Bestaande collections, modes en variables worden hergebruikt en bijgewerkt, niet
gedupliceerd. Dat is een harde eis: dupliceren zou de bindingen verbreken die
designers al gelegd hebben. De smoke test controleert dit expliciet door de
import twee keer te draaien.

Component sets worden wél elke keer opnieuw aangemaakt. Een bestaande set
bijwerken zonder instanties te breken is een apart probleem, zie hieronder.

## Smoke test

```bash
pnpm test:figma-plugin
```

Draait de import-logica tegen de echte gegenereerde JSON met een mock van de
Plugin API (`scripts/figma-mock.js`). De mock dwingt de drie volgorde-eisen af
die in Figma echt fouten geven:

1. `characters` zetten voordat het font geladen is
2. `layoutSizing*` op `FILL` terwijl de ouder geen auto layout heeft
3. `layoutSizing*` op `HUG` terwijl de node zelf geen `layoutMode` heeft

Die eerste ronde vond meteen drie bugs in de generator: `HUG` op nodes zonder
auto layout, `FILL` binnen een niet-auto-layout ouder, en twee variables die
niet in elke mode een waarde hadden. Draai deze test dus voordat je iets in
Figma laadt.

## Wat dit nog niet doet

- **Component sets bijwerken.** Elke import maakt een nieuwe set aan. Bestaande
  instanties in designbestanden koppelen daar niet vanzelf aan.
- **Variables aan lagen binden.** De variables komen erin, maar de gegenereerde
  componenten gebruiken vaste waarden in plaats van `boundVariables`. Daardoor
  volgen ze de theme-schakelaar nog niet.
- **Effect styles.** Box shadows staan in het skip-report en moeten nog
  Figma-effectstijlen worden.
- **Component properties.** Boolean-slots voor iconen, instance swap en text
  properties blijven handwerk.
