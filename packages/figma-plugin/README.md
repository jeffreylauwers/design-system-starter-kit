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

| Bestand                                   | Wat er gebeurt                               |
| ----------------------------------------- | -------------------------------------------- |
| `design-tokens/dist/figma/variables.json` | Variable collections, modes en aliassen      |
| `figma-sync/dist/icons.json`              | 51 icooncomponenten op de pagina `dsn/Icons` |
| `figma-sync/dist/{component}.json`        | Eén component set met al zijn varianten      |

Hetzelfde bestand nog een keer kiezen werkt gewoon: de bestandskiezer wordt na
elke keuze leeggemaakt, want anders vuurt de `change`-event niet een tweede keer
en lijkt de plugin niet te reageren. Dat is precies de handeling die er sinds
het bijwerken van bestaande sets toe doet.

Het `$schema`-veld bepaalt wat er geïmporteerd wordt, niet de bestandsnaam.
Sleep je meerdere bestanden tegelijk, dan zet de plugin ze zelf op volgorde
(variables, iconen, componenten) en verwerkt ze één voor één.

**Draai `variables.json` als eerste.** De lagen van een component en de
vectoren van een icoon worden aan variables gebonden, dus die moeten al
bestaan. De plugin controleert dat en **weigert** een import in een bestand
zonder de benodigde collections. Doorgaan zou een component set opleveren die er goed uitziet maar
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

Een transparante kleur (`dsn.color.transparent`) heeft geen gemeten paint om
aan te binden. De plugin maakt die dan aan, zodat de laag laat zien wélk token
de kleur stuurt in plaats van een lege Fill te tonen. De variable bepaalt
daarna kleur én alpha. Voor strokes gebeurt dat niet: een frame zonder rand
heeft wel een standaard `strokeWeight`, dus daar zou een lijn ontstaan.

## Pagina's

Elke component set komt op een eigen pagina, `dsn/{Component}`; de iconset
staat op `dsn/Icons`. De plugin maakt die pagina aan als hij nog niet bestaat
en zet daarna de `dsn/`-pagina's alfabetisch.

Alleen die pagina's. Een pagina zonder de prefix is van de designer en blijft
staan waar hij stond: de plugin herschikt de beheerde pagina's binnen de
plekken die ze al innamen, in plaats van de hele lijst om te gooien.

De componentimport laat zijn pagina open staan, want dat is de pagina waar de
designer naartoe wil. De iconimport doet het omgekeerde: die opent `dsn/Icons`
alleen om te kunnen bouwen (`createNodeFromSvg` werkt op de huidige pagina) en
zet daarna terug wat er openstond.

## Het canvas onder de varianten

De component set krijgt verticale auto layout met 48px ruimte eromheen en
ertussen, en als achtergrond de documentachtergrond van het design system,
gebonden aan `dsn/Primitives → color/neutral/bg-document`.

Zonder die binding staat de set op het grijs van Figma: schakelt een designer
de mode naar `start-dark`, dan worden de componenten donker terwijl de plaat
licht blijft en is geen enkele variant meer te lezen.

De maten komen uit `componentSet.canvas` in de spec. Ontbreekt dat blok (een
oudere `dist/{component}.json`), dan valt de plugin terug op alleen de
verticale stapeling.

## Laagstructuur

Het root-element van de spec wordt niet in een frame gezet maar **is** het
component; alle eigenschappen (fills, auto layout, padding, radius) en hun
bindingen komen op de component-node zelf. Een wrapper zou een lege laag met
dezelfde auto layout toevoegen.

De naam van de component-node blijft de variantlabel, want daar leidt
`combineAsVariants` de variant properties uit af. De naam van de _set_ komt uit
de spec en volgt de CSS-klasse: `dsn-button`.

## De iconset

`icons.json` levert 51 losse componenten op een eigen pagina `dsn/Icons`, elk
24 x 24 en genoemd naar de icoonnaam uit `icon-registry.generated.ts`. Geen
component set met een `icon`-as: een instance swap property kiest uit
componenten, en een set van 51 varianten levert in die keuzelijst één regel op
waarna je alsnog via de variant-dropdown moet zoeken.

### Eén vorm voor alle 51: `Group > Shape`

Elk icooncomponent heeft precies dezelfde laagstructuur:

```
chevron-right            (component, 24 x 24)
└── Group
    └── Shape            (één vector, kleur op fills)
```

Dat is geen cosmetiek maar de voorwaarde voor een werkende instance swap. Figma
zoekt de overrides op een instance terug via het **laagpad**. Verschilt dat pad
per icoon, dan landt de kleuroverride na een swap op een andere laag dan
bedoeld: het glyph houdt de standaardkleur van het icooncomponent en een andere
laag krijgt de kleur die voor het glyph bedoeld was. Zichtbaar als een donker
icoon met een wit kadertje eromheen.

Drie stappen brengen elk icoon in die vorm:

1. **De 24x24-hulppath eruit.** Tabler levert in 31 van de 51 bestanden een
   `<path stroke="none" d="M0 0h24v24H0z" fill="none"/>` mee die niets tekent
   en alleen de afmeting vastzet. In Figma is dat wél een extra vectorlaag. De
   maat komt uit de expliciete `width`/`height`, dus hij kan weg. Dat gebeurt in
   de generator, zodat het in de JSON-diff te zien is.
2. **`outlineStroke()`.** Zonder deze stap zit de kleur bij een lijn-icoon op
   `strokes` en bij een vlak-icoon op `fills`. Een swap tussen die twee laat de
   override op `fills` nergens landen. Na het omzetten heeft élk icoon één
   `fills` en geen enkele stroke meer.
3. **`figma.flatten()` naar één `Shape`, in een `Group`.** Eén override-doel per
   icoon, en dezelfde vorm die met de hand ook wordt aangehouden, zodat een swap
   tussen een gegenereerd en een handgemaakt icoon net zo goed werkt.

Het bouwen gebeurt volledig binnen het frame dat `createNodeFromSvg` oplevert;
pas de afgeronde `Group` verhuist naar het component. Zo wisselt er één node van
ouder in plaats van alle losse vectoren.

Het gevolg van stap 2 is dat de lijndikte meeschaalt in plaats van vast te
blijven wanneer een instance kleiner wordt. Voor een icoon is dat het gewenste
gedrag: een chevron van 21px hoort dunnere lijnen te hebben dan een van 24px.

Twee dingen die anders gaan dan bij een component set:

- **Het component wordt bijgewerkt, niet vervangen.** `createNodeFromSvg`
  levert een frame; de vectoren daaruit worden in het bestaande component
  gehangen en het frame gaat weg. De node-id blijft daarmee gelijk, en dat is
  precies wat elke geplaatste instance nodig heeft om eraan te blijven hangen.
  Een nieuw component met dezelfde naam is voor Figma een ánder component.
- **De pagina wordt tijdelijk geopend en daarna teruggezet.** Dat moet wel:
  `createNodeFromSvg` zet zijn frame op de **huidige** pagina, en
  `outlineStroke()` blijkt zijn resultaat daar ook neer te kunnen zetten.
  Bouwen terwijl een andere pagina open staat geeft `flatten` en `group` dus
  nodes en ouder op verschillende pagina's, en Figma weigert dat met
  _"Grouped nodes must be in the same page as the parent"_. De pagina die de
  designer openhad gaat er na afloop weer overheen, want een component-import
  zet zijn set op `figma.currentPage`; zou de iconpagina open blijven staan,
  dan belandde een Button tussen de iconen.

De iconen krijgen de neutrale tekstkleur, gebonden aan
`dsn/Primitives → color/neutral/color-default`, zodat ze de theme-schakelaar
volgen. Een instance mag die kleur overschrijven; dat is het Figma-equivalent
van `currentColor`. Het verschil tussen een gevuld en een lijn-icoon zit na het
omzetten naar vlakken in de vórm, niet meer in het veld waar de kleur op staat.

Een icoon dat uit de assets-map verdwijnt blijft in Figma staan, met een
melding in de log. Automatisch verwijderen zou elke instance ervan detachen, en
dat is een beslissing van een mens.

## Component properties

De generator declareert per component welke lagen een component property worden
(`componentSet.componentProperties` in de spec, met een `slot` die naar een
`data-figma-slot` in de markup wijst). De plugin legt ze na
`combineAsVariants` op de **set**, niet op de losse varianten, en koppelt in
elke variant de bijbehorende laag:

| Type            | Veld op de laag | Vereist                      |
| --------------- | --------------- | ---------------------------- |
| `TEXT`          | `characters`    | een tekstnode                |
| `BOOLEAN`       | `visible`       | niets                        |
| `INSTANCE_SWAP` | `mainComponent` | een **instance**, geen frame |

Button levert daarmee `label`, `showIconStart` / `iconStart` en `showIconEnd` /
`iconEnd`. De twee icoonslots staan standaard uit; de lagen worden vóór de
koppeling op die stand gezet, want een laag die niet overeenkomt met de
standaardwaarde laat de set iets anders zien dan de property zegt.

### Iconen worden instances

Een instance swap verwisselt het `mainComponent` van een instance, dus de
icoonlagen moeten instances zijn. De plugin zoekt per icoonnaam een component op
de pagina `dsn/Icons` en plaatst daar een instance van; staat het icoon er niet,
dan valt hij terug op de ingebakken SVG en meldt dat één keer per icoonnaam.

Dat geldt voor élk icoon in élke component set, niet alleen voor de slots. Een
Button had zo 81 losse kopieën van dezelfde chevron; nu volgen ze allemaal het
icooncomponent.

De gemeten kleur blijft er als override overheen liggen, zoals een designer die
met de hand zou leggen: een icoon in een `strong` Button is wit, niet de
neutrale tekstkleur van het icooncomponent.

### Alles wat niet lukt is een fout, geen stilte

Een property die niet gelegd kan worden gaat als `error` de log in, met de
reden: slot ontbreekt in zoveel varianten, laag is geen instance, icoon staat
niet op `dsn/Icons`, of Figma weigerde de property zelf. Stil overslaan zou
precies het handwerk opleveren dat na elke import opnieuw gedaan moet worden,
en dat is aan een set die er verder goed uitziet niet te zien.

### Eén onzekerheid: de waarde van een instance swap

De Plugin API accepteert als standaardwaarde van een `INSTANCE_SWAP` een
verwijzing naar een component, maar of dat de `key` of de node-id moet zijn
verschilt per API-versie en per publicatiestatus van het component. De plugin
probeert daarom eerst de `key` en dan de id, en meldt het als geen van beide
wordt geaccepteerd. De mock kan dit niet beslissen: dit is het ene punt dat
alleen in Figma zelf te bevestigen is.

## Idempotent

Bestaande collections, modes, variables, icooncomponenten en component sets
worden hergebruikt en bijgewerkt, niet gedupliceerd. Dat is een harde eis:
dupliceren zou de bindingen en de instances verbreken die designers al gelegd
hebben. De smoke test controleert dit expliciet door élke import twee keer te
draaien en de node-ids te vergelijken.

### Hoe een component set wordt bijgewerkt

De plugin zoekt op de pagina van het component een set met dezelfde naam. Staat
die er, dan wordt hij bijgewerkt in plaats van dat er een tweede naast komt:

| Wat                                          | Wat er gebeurt                                    |
| -------------------------------------------- | ------------------------------------------------- |
| Variant staat in de spec en in Figma         | Het component blijft, zijn inhoud wordt vervangen |
| Variant staat in de spec, nog niet in Figma  | Wordt toegevoegd aan de bestaande set             |
| Variant staat in Figma, niet meer in de spec | Blijft staan, met een melding in de log           |
| Property staat in de spec en op de set       | Wordt bijgewerkt, houdt zijn property-id          |
| Property staat op de set, niet in de spec    | Blijft staan, met een melding in de log           |

Het hergebruiken van het component zélf is de kern. Elke geplaatste instance
hangt aan de **node-id** van zijn variant; een nieuw component met dezelfde naam
is voor Figma een ánder component en laat elke instance los. Hetzelfde geldt
voor een component property: Figma bewaart de waarde die een instance eraan
geeft onder de **property-id**, dus een property weggooien en opnieuw aanmaken
zet elke instance terug op de standaardwaarde. Daarom wordt hij bijgewerkt met
`editComponentProperty` in plaats van opnieuw aangemaakt.

Let bij het opzoeken van een bestaande property op de vorm van
`componentPropertyDefinitions`: die map is gesleuteld op `naam#nodeId:sessionId`
(`label#5:0`) en de definitie eronder draagt de naam **niet**. Uit de definitie
de naam willen lezen levert overal `undefined` op, en dan wordt elke property
opnieuw aangemaakt. Figma weigert dat niet maar hernoemt de nieuwe naar
"label 2", bij de volgende import naar "label 3".

**Wat wél verloren gaat:** overrides die een designer op de geneste lagen van
een instance heeft gelegd. De lagen binnen een variant worden opnieuw
opgebouwd, en Figma zoekt die overrides terug via het laagpad. Dat is de prijs
van een import die de CSS daadwerkelijk doorzet; het alternatief (de bestaande
lagen één voor één bijwerken) vereist een betrouwbare identiteit per laag die
een gemeten boom niet heeft. De instance blijft wel aan zijn component hangen,
en dát is het verschil tussen een import die je kunt draaien en een die je niet
kunt draaien.

**De icoonkleur wordt als laatste geschreven.** Een icoon is een instance van
het icooncomponent en zijn kleur is een override op de geneste `Group > Shape`.
Het koppelen van een instance swap property zet het `mainComponent` van die
laag, en bij zo'n verwisseling gooit Figma de overrides erop weg: het icoon valt
terug op de neutrale kleur van het icooncomponent. Zichtbaar geweest als een
Link waarvan het icoon na een tweede import op
`color/neutral/color-default` stond in plaats van op `link/color`.

De kleuren worden daarom na afloop van álles nog een keer gezet, en daarna
teruggelezen: een icoonlaag die zijn variable alsnog niet draagt gaat als
waarschuwing de log in. Wie het laatst schrijft wint, en dan doet de volgorde
van de stappen ervóór er niet meer toe.

**De standaardwaarde van een bestaande `INSTANCE_SWAP` blijft staan.** Wat Figma
daar opslaat is niet per se de `key` of de node-id die de plugin aanleverde, dus
erop vergelijken helpt niet, en hem opnieuw zetten is weer een verwisseling. Het
icoon dat een designer als standaard kiest is bovendien zijn keuze en niet die
van de volgende import. Een property die verder niet verandert wordt helemaal
niet aangeraakt.

Na afloop worden de varianten in de volgorde van de spec gezet. Een variant die
opnieuw wordt toegevoegd hangt anders achteraan in de kinderlijst, en dan staat
een teruggezette `state=hover` onderaan de plaat in plaats van bij zijn eigen
maat. Varianten die niet meer in de spec staan schuiven daarmee naar achteren.

**Wat nooit vanzelf verdwijnt:** een variant of een property die uit de spec
valt. Automatisch verwijderen zou elke instance ervan detachen, en dat is een
beslissing van een mens. Dezelfde afweging als bij een icoon dat uit de
assets-map verdwijnt.

De variantnaam staat op de wrapper vanaf het moment dat hij bestaat, en blijft
er de hele bouw op staan. Een component set leidt zijn variant-assen af uit de
namen van zijn kinderen, en op de update-route hangt de wrapper daar al in: een
wrapper die ook maar even naar zijn root-element heet (`dsn-link`) is daar geen
geldige variant, en Figma gaat dat dan zelf herstellen. Vandaar dat `applyFrame`
de naam als los argument krijgt in plaats van hem uit de spec te halen.

Tijdens het bouwen haalt de plugin de auto layout van de set tijdelijk weg.
Anders hangt een variant in een auto-layout ouder waar hij bij een verse import
los op de pagina staat, en gelden er andere sizing-regels: dan zou een tweede
import iets anders opleveren dan de eerste. Het canvas wordt daarna weer gezet.

## Smoke test

```bash
pnpm test:figma-plugin
```

Draait de import-logica tegen de echte gegenereerde JSON met een mock van de
Plugin API (`scripts/figma-mock.js`). De mock dwingt de volgorde-, vorm- en type-eisen
af die in Figma echt fouten geven:

1. `characters` zetten voordat het font geladen is
2. `layoutSizing*` op `FILL` terwijl de ouder geen auto layout heeft
3. `layoutSizing*` op `HUG` terwijl de node zelf geen `layoutMode` heeft
4. `setBoundVariable` op een veld dat niet bindbaar is, of met een variable van
   het verkeerde type (een kleur is geen padding)
5. padding en `itemSpacing` binden op een frame zonder auto layout
6. `createNodeFromSvg` en `outlineStroke()` zetten hun resultaat op de huidige
   pagina, en `flatten` en `group` weigeren nodes die op een andere pagina staan
   dan hun ouder
7. een component property koppelen aan een veld dat de node niet heeft
   (`mainComponent` op iets anders dan een instance), of aan een property die
   niet op de omvattende set staat
8. `componentPropertyDefinitions` is gesleuteld op `naam#id` en de definitie
   eronder heeft geen `name`; een botsende naam wordt hernoemd naar "label 2",
   niet geweigerd
9. een kind van een component set draagt een geldige, unieke variantnaam
   (`as=waarde, as=waarde`)
10. een instance swap property koppelen verwisselt de laag, en dat wist de
    overrides op zijn geneste lagen

Punt 8, 9 en 10 staan er sinds ze in Figma zelf misgingen terwijl de smoke test
groen stond. De mock zette destijds een `name` op de definitie en wierp een
fout bij een dubbele naam, allebei anders dan de echte API, en dekte daarmee
precies de twee bugs af die hij had moeten vangen. Waar de mock en de Plugin
API uit elkaar lopen, is de mock waardeloos: hij is dan strenger op het
verkeerde en blind voor het echte.

Voor de bindingen controleert de test niet alleen het aantal maar leest hij per
veld de naam van de variable terug uit de gebouwde boom. Anders zou een import
die alles aan het verkeerde token hangt net zo groen zijn. Ook getest: een
import zonder variables in het bestand wordt geweigerd, en de tweede
iconimport houdt de node-ids gelijk in plaats van te vervangen.

Elk component wordt **twee keer** geïmporteerd, en alle controles kijken naar
het resultaat van de tweede. Een import die alleen op een leeg bestand klopt is
voor een library die al in gebruik is niets waard: de tweede is de import die
een designer in de praktijk draait. Daarbovenop staat er een eigen sectie voor
het bijwerken zelf, met een geplaatste instance die de import moet overleven,
een variant die uit de spec is gevallen en een variant die er nieuw bij komt.

Die eerste ronde vond meteen drie bugs in de generator: `HUG` op nodes zonder
auto layout, `FILL` binnen een niet-auto-layout ouder, en twee variables die
niet in elke mode een waarde hadden. Draai deze test dus voordat je iets in
Figma laadt.

## Wat dit nog niet doet

- **Overrides op geneste lagen bewaren.** Een bijgewerkte variant wordt van
  binnen opnieuw opgebouwd, en overrides die een designer op de lagen van een
  instance heeft gelegd zoekt Figma terug via het laagpad. De instance blijft
  aan zijn component hangen; wat erop lag niet. Zie "Idempotent" hierboven.
- **Een droogloop.** Er is nog geen stand waarin de plugin eerst toont wat er
  zou veranderen voordat hij het doet.
- **Geneste componenten hergebruiken.** De Heading en Paragraph in een Alert of
  een Note zijn gemeten lagen, geen instances van de losse component sets. Voor
  iconen gebeurt dat wél.
- **Effect styles.** Box shadows staan in het skip-report en moeten nog
  Figma-effectstijlen worden.
- **Booleans die tokens veranderen.** `iconOnly`, `loading` en `fullWidth` bij
  Button hebben eigen tokens en horen daarom op een variant-as, niet op een
  property; zie de README van `figma-sync`.
- **Thumbnails.** De thumbnail van een component set blijft handwerk.
