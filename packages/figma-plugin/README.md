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

**Draai `variables.json` als eerste.** De lagen van een component worden aan
variables gebonden, dus die moeten al bestaan. De plugin controleert dat en
**weigert** een component-import in een bestand zonder de benodigde
collections. Doorgaan zou een component set opleveren die er goed uitziet maar
de theme-schakelaar niet volgt, en dat zie je aan een laag niet.

Ontbreekt er een enkele variable, dan is dat geen reden om te stoppen: die laag
houdt zijn vaste waarde en de plugin meldt het in de log.

## Bindingen aan variables

Een gegenereerde laag krijgt geen vaste kleur maar een verwijzing naar de
variable die hem levert, zodat een mode-wissel in Figma het component meeneemt.

De generator wijst per node aan welk veld aan welke variable hoort
(`boundVariables` in de node spec); de plugin legt de koppeling:

| Veld                                                       | Route                                        |
| ---------------------------------------------------------- | -------------------------------------------- |
| `fills`, `strokes`                                         | `figma.variables.setBoundVariableForPaint()` |
| padding, radius, `itemSpacing`, `strokeWeight`, `fontSize` | `node.setBoundVariable()`                    |

Twee dingen die daarbij afwijken van wat je zou verwachten:

- **Paints zijn immutable.** Binden levert een nieuwe paint op, die als nieuwe
  lijst terug op de node moet.
- **Een icoon is een frame met vectoren erin**, en de kleur hoort op die
  vectoren. De binding gaat daarom mee in de paints die over de SVG heen worden
  gezet, niet via het frame.

Een kleur die in de gemeten mode transparant is heeft geen paint om aan te
binden. Is diezelfde variable in een andere mode wél zichtbaar, dan maakt de
plugin de paint alsnog aan; de variable bepaalt daarna kleur én alpha.

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
Plugin API (`scripts/figma-mock.js`). De mock dwingt de volgorde- en type-eisen
af die in Figma echt fouten geven:

1. `characters` zetten voordat het font geladen is
2. `layoutSizing*` op `FILL` terwijl de ouder geen auto layout heeft
3. `layoutSizing*` op `HUG` terwijl de node zelf geen `layoutMode` heeft
4. `setBoundVariable` op een veld dat niet bindbaar is, of met een variable van
   het verkeerde type (een kleur is geen padding)
5. padding en `itemSpacing` binden op een frame zonder auto layout

Voor de bindingen controleert de test niet alleen het aantal maar leest hij per
veld de naam van de variable terug uit de gebouwde boom. Anders zou een import
die alles aan het verkeerde token hangt net zo groen zijn. Ook getest: een
component-import zonder variables in het bestand wordt geweigerd.

Die eerste ronde vond meteen drie bugs in de generator: `HUG` op nodes zonder
auto layout, `FILL` binnen een niet-auto-layout ouder, en twee variables die
niet in elke mode een waarde hadden. Draai deze test dus voordat je iets in
Figma laadt.

## Wat dit nog niet doet

- **Component sets bijwerken.** Elke import maakt een nieuwe set aan. Bestaande
  instanties in designbestanden koppelen daar niet vanzelf aan.
- **Effect styles.** Box shadows staan in het skip-report en moeten nog
  Figma-effectstijlen worden.
- **Component properties.** Boolean-slots voor iconen, instance swap en text
  properties blijven handwerk.
