# @dsn-starter-kit/figma-sync

Genereert Figma-input uit de bestaande bron: de tokens en de HTML/CSS-laag.
Dit package schrijft **geen** data naar Figma. Het levert twee JSON-bestanden
die een Figma-plugin inleest.

Waarom die splitsing: op een Figma Professional-plan is de Variables REST API
niet beschikbaar, dus de Plugin API is het enige schrijfpad. Door de generatie
in de repo te houden en het schrijven in de plugin, blijft alles wat naar Figma
gaat reviewbaar in een PR.

## De drie outputs

| Bestand                                   | Wordt gegenereerd door        | Bevat                                    |
| ----------------------------------------- | ----------------------------- | ---------------------------------------- |
| `design-tokens/dist/figma/variables.json` | `pnpm build:tokens`           | Variable collections, modes en aliassen  |
| `figma-sync/dist/icons.json`              | `pnpm build:figma-icons`      | Eén node spec per SVG uit de assets-map  |
| `figma-sync/dist/{component}.json`        | `pnpm build:figma-components` | Node specs per variant van een component |

Naast `variables.json` komt `variables-report.json` te staan met alles wat
níet naar een variable te vertalen was, inclusief reden. Lees dat bestand bij
elke review: het is de plek waar drift zichtbaar wordt.

## Fluid typografie

Een Figma-variable is statisch, dus een `clamp()` moet op een viewport worden
vastgeprikt. In plaats van één willekeurige breedte te kiezen krijgt de
`dsn/Density`-collection een mode per viewport:

| mode                | viewport | `text/font-size/md` |
| ------------------- | -------- | ------------------- |
| `default-mobile`    | 375px    | 16px                |
| `default-desktop`   | 1440px   | 19,4px              |
| `information-dense` | n.v.t.   | 16px                |

375px valt onder elke clamp-ondergrens, dus die mode bevat exact de ontworpen
min-waarden. De bovengrens is bewust géén mode: die wordt pas bereikt vanaf
ongeveer 1733px en komt op geen realistisch artboard voor.

Een project-type dat niet fluid is krijgt automatisch één mode in plaats van
een mode per viewport, zoals `information-dense` hierboven.

35 component-variables aliassen naar deze collection, dus het schakelen van het
artboard laat de hele typografie meebewegen zonder dat er iets opnieuw gebonden
hoeft te worden.

Twaalf fluid waarden staan buiten deze collection (de icon-sizes en vier
`padding-*-with-icon`-tokens). Die hangen van theme én viewport af en zitten in
een collection met een andere mode-as, dus ze zijn op 1440px vastgeprikt. Ze
staan als `viewportPinned` in het report.

## Gebruik

```bash
pnpm build:figma                       # de hele keten in één keer
```

Of per stap:

```bash
pnpm build:tokens                      # de gewone token-build
pnpm build:figma-variables             # variables.json + report
pnpm build:figma-icons                 # icons.json uit de assets-map
pnpm build:figma-components            # alle matrices
pnpm build:figma-components button     # één component
pnpm build:figma-plugin                # de plugin-bundle
```

De Figma-stappen staan bewust los van `build:tokens`. De token-CSS is het
hoofdproduct waar Storybook, de componenten en npm-consumenten van afhangen;
die hoort niet om te vallen door een fout in een generator die er alleen maar
naast draait. Faalt de Figma-keten, dan faalt alleen de Figma-keten.

### `dist/` wordt opgeruimd, maar alleen bij een volledige build

Een volledige `build:figma-components` verwijdert elke `dist/{component}.json`
waar geen matrix meer bij hoort, en meldt wat er weg is. `icons.json` blijft
staan: dat bestand komt van `build-icons.js` en heeft geen matrix.

Dat is nodig omdat `dist/` in `.gitignore` staat en dus een branchwissel
overleeft. Een matrix die op de ene branch bestaat en op de andere niet laat
daar zijn JSON achter, en die wordt daarna gewoon opgepakt door
`pnpm test:figma-plugin` en door de plugin. Je test dan een spec van de ene
branch tegen een plugin van de andere, en dat ziet er precies uit als een echte
regressie: een bindingsaantal dat één afwijkt, of een component set die op de
verkeerde plek belandt.

Draait er een filter mee (`build:figma-components button`), dan wordt er niets
opgeruimd. Het ontbreken van de andere bestanden zegt daar niets over hun
bestaansrecht, en opruimen zou weggooien wat er hoort te staan.

## Hoe de componentgeneratie werkt

De CSS parsen om Figma-nodes te bouwen werkt niet: cascade, custom properties,
`clamp()` en media queries bepalen samen pas de eindwaarde. In plaats daarvan
rendert `extract.js` elke variant in een echte browser en leest de _computed_
styles uit. Dat levert meteen de flexbox-informatie op die vrijwel 1-op-1 op
Figma auto layout past:

| CSS                                  | Figma                               |
| ------------------------------------ | ----------------------------------- |
| `display: flex` + `flex-direction`   | `layoutMode` HORIZONTAL / VERTICAL  |
| `gap`                                | `itemSpacing`                       |
| `padding-*`                          | `padding*`                          |
| `justify-content` / `align-items`    | `primary` / `counterAxisAlignItems` |
| `display: inline-flex`               | `layoutSizingHorizontal: HUG`       |
| `display: grid` + `grid-column`      | `layoutMode: GRID` + grid anchors   |
| `position: absolute`                 | `layoutPositioning: ABSOLUTE`       |
| `min-block-size` / `min-inline-size` | `minHeight` / `minWidth`            |
| kind vult de binnenbreedte           | `layoutSizingHorizontal: FILL`      |

Een element dat alleen tekst bevat en zelf niets tekent, wordt één TEXT-node in
plaats van een frame met een tekstnode erin. Zonder die stap krijgt elke `<span>`
een eigen frame en ontstaat de diepe nesting die een Figma-library onwerkbaar
maakt.

### Wat er wordt overgeslagen

Elementen met de klasse `dsn-visually-hidden` en elementen met `opacity: 0`
(zoals de native input onder een custom checkbox-control) leveren in Figma
alleen een onzichtbare node op en worden daarom niet meegenomen.

### Mobile-first meten

De meetviewport is **375px**, en blok-componenten krijgen een wrapper van
**343px** (375 min 2 x 16px padding). Dat is bewust: het design system wordt
mobile-first ontworpen, en op 375px lossen alle fluid clamps op hun ondergrens
op. De gemeten typografie komt daarmee exact overeen met de `default-mobile`
mode van de `dsn/Density`-collection, dus component en variable zeggen
hetzelfde. Per matrix te overschrijven met `viewport`.

### CSS Grid

`grid-template-columns: <maat> 1fr` wordt in Figma `FIXED` + `FLEX`, waarbij
`FLEX` overeenkomt met de `fr`-eenheid. De browser lost `fr` op naar pixels
voordat wij kunnen meten, dus welke track flexibel was is uit één meting niet
af te lezen. De extractor rendert een component met een grid daarom een tweede
keer in een bredere wrapper: een track die meegroeit was flexibel.

Rijen worden `HUG`. CSS-gridrijen zijn standaard `auto`, en een vaste
rijhoogte zou betekenen dat het component niet meegroeit als tekst afbreekt.

De plaatsing per cel gaat via `setGridChildPosition(rowIndex, columnIndex)`;
`gridColumnAnchorIndex` is read-only. De trackmaten horen in `gridColumnSizes`
en `gridRowSizes`, niet in `gridAutoTracks` (dat gaat over automatisch rijen
toevoegen).

### Bindingen aan variables

De gemeten waarde alleen levert een dood component op: een fill van `#1b59a4`
verandert niet als je in Figma naar `start-dark` schakelt. Daarom draagt elke
node ook de _naam_ van het token dat de waarde leverde, zodat de plugin de laag
aan de variable kan binden in plaats van aan een getal.

Die naam staat alleen in de authored CSS, dus daar wordt hij gelezen: de
extractor speelt in de browser de cascade na, bepaalt welke declaratie wint
voor bijvoorbeeld `background-color`, en haalt daar de `var()`-keten uit.

```
.dsn-button--strong:hover:not(:disabled) {
  background-color: var(--dsn-button-strong-hover-background-color);
}
                        │
                        ▼
dsn/Components → button/strong/hover/background-color
```

Dat is nadrukkelijk geen CSS-parsing als vervanging van meten. De waarde blijft
gemeten; de CSSOM levert er alleen een herkomst bij. En die herkomst wordt
**geverifieerd**: het token moet in `variables.json` dezelfde waarde opleveren
als er gemeten is, in dezelfde theme-, mode- en viewportstand. Zo niet, dan
wordt er niet gebonden. Een fout in de cascade-nabootsing kan daardoor wel een
binding missen, maar geen verkeerde binding leggen. Zie
[DR-2026-06](../../docs/decisions/DR-2026-06-figma-bindingen-meten-plus-cssom.md).

Wat er gebonden wordt:

| Figma-veld                                   | Uit                                                      |
| -------------------------------------------- | -------------------------------------------------------- |
| `fills`                                      | `background-color`, of `color` bij tekst en iconen       |
| `strokes`                                    | `border-*-color` van de zijde die de rand tekent         |
| `strokeWeight`, of `stroke*Weight` per zijde | `border-*-width` van diezelfde zijde                     |
| `topLeftRadius` en de drie andere hoeken     | `border-*-radius`                                        |
| `paddingTop` / `Right` / `Bottom` / `Left`   | `padding-*`                                              |
| `itemSpacing`                                | `row-gap` of `column-gap`, naar de as van de auto layout |
| `fontSize`                                   | `font-size`                                              |

#### Wat een vaste waarde houdt

Elke `dist/{component}.json` heeft een `bindings`-blok met wat er gebonden is en
wat niet, met reden en aantal. De build print hetzelfde. Lees dat na elke
wijziging aan component-CSS: een eigenschap die van gebonden naar vast schuift
is een regressie, ook als de build groen is.

De vier terugkerende redenen:

| Reden                                     | Voorbeeld                                                                 |
| ----------------------------------------- | ------------------------------------------------------------------------- |
| de waarde komt niet uit één token         | `border-radius: 50%` bij Radio, of een `calc()` die twee tokens optelt    |
| het token bestaat niet als Figma-variable | box shadows en transitions; die staan in het skip-report van de variables |
| het token is in elke mode transparant     | `button/subtle/background-color`; een lege paint in Figma helpt niemand   |
| de node heeft geen auto layout            | Figma kent geen padding op een frame zonder layoutMode                    |

Een kleur die alleen in de _gemeten_ mode transparant is wordt wél gebonden: in
een andere mode is hij zichtbaar, en zonder binding zou het component daar leeg
blijven. De plugin maakt de paint dan aan.

#### Minimum-maten zijn niet optioneel

Een frame in Figma staat op HUG en rekent zijn maat dus opnieuw uit content plus
padding. De gemeten hoogte wordt daarbij weggegooid. Bij Button betekende dat
42px in plaats van de 48px die `min-block-size` in de browser afdwingt, en
daarmee een aanraakdoel onder [WCAG 2.5.5](https://www.w3.org/WAI/WCAG22/quickref/#target-size-minimum).

`minWidth` en `minHeight` gaan daarom expliciet mee in de spec, en worden net als
de rest aan hun token gebonden. Ze bestaan in Figma alleen op een auto-layout
frame; op een frame zonder layoutMode komen ze in het report.

### HUG mag de gemeten maat niet weggooien

Een auto-layout frame staat in Figma standaard op HUG, en rekent zijn maat dus
opnieuw uit content plus padding. Bij een knop is dat precies de bedoeling: die
moet met zijn tekst meegroeien. Maar zodra de CSS de maat zélf vastzet, is HUG
fout, en dat blijft onzichtbaar zolang de inhoud toevallig even groot is.

Checkbox liep er op twee manieren tegelijk op stuk. De control hugde naar het
vinkje van 16px in plaats van de 24 aan te houden, en de root hugde naar niets,
want een absoluut gepositioneerd kind telt in Figma niet mee voor de maat van
zijn ouder. Het gevolg was een aangevinkte checkbox die kleiner was dan een
lege.

Een node blijft daarom FIXED wanneer:

- de CSS een `width` of een `height` zet (`.dsn-checkbox` is 24x24 via
  `--dsn-checkbox-size`);
- de node absoluut gepositioneerd is, en zijn maat dus uit zijn insets haalt.

`width` en `height` zijn daarvoor toegevoegd aan de gevolgde properties. Niet
om te binden, maar omdat de computed waarde altijd een pixelgetal is: daaruit
valt niet af te lezen of de maat van een declaratie komt of van de inhoud. Uit
de cascade wel.

Om dezelfde reden krijgt een absoluut kind nooit `FILL`. Dat kind staat buiten
de auto-layout stroom, dus meerekken met de ouder is er niet bij; FILL en
ABSOLUTE zijn in Figma tegenstrijdig.

### Blokken krijgen alsnog auto layout

Figma kent padding, `minWidth` en `minHeight` uitsluitend op een auto-layout
frame. Een element dat in CSS gewoon een blok is (een `<input>`, een `<ol>`, de
footer van een Card) verloor daardoor al zijn spacing-bindingen. De maat klopte
visueel, want die is gemeten, maar het token erachter was weg: veruit de
grootste post in het bindingsrapport.

Zo'n element wordt daarom alsnog op verticale auto layout gezet, maar alleen
als aantoonbaar is dat er niets van verschuift:

| Geval                                             | Waarom het veilig is                    |
| ------------------------------------------------- | --------------------------------------- |
| geen kinderen                                     | er valt niets te ordenen                |
| kinderen staan al onder elkaar, met gelijke gaten | dat is precies wat auto layout ook doet |

Overlappen de kinderen, staan ze naast elkaar, verschillen de gaten, of is er
een absoluut gepositioneerd kind bij, dan blijft het frame zonder auto layout
en komt de padding als vanouds in het rapport. Dat gebeurt bijvoorbeeld bij de
`invalid`-variant van FormField, waar de marge onder het label verandert zodra
er een beschrijving achter staat.

Eén ding blijft daarbij liggen: de ruimte tussen blokken komt uit de marges van
de kinderen en niet uit een `gap`, en de binder leest alleen gaps. De waarde
klopt dus wel, maar `itemSpacing` hangt aan niets. Dat wordt per variant als
waarschuwing gemeld in plaats van stil overgeslagen.

### Randen die niet rondom lopen

Een rand hoeft niet alle vier de zijden te raken. Note tekent alleen een
accentrand aan de inline-start, en een tabelrij scheidt zich met één lijn
onderaan. Zo'n rand als uniforme stroke overnemen levert in Figma een kader om
het hele component op, en dat is geen waarschuwing waard maar een verkeerd
component.

Figma kent per zijde een `strokeTopWeight` en zijn drie broers. Die worden
gezet zodra de zijden verschillen; de zijden zonder rand komen op 0. De
binding gaat dan naar de zijde die de rand tekent: `border-left-width` en
`border-left-color` bij Note, want `border-top-color` bestaat daar niet eens.

Let op de volgorde in de plugin: `strokeWeight` zet in Figma álle vier de
zijden, dus de losse diktes moeten daarna komen.

### Pagina per component

Elke component set komt op een eigen pagina, `dsn/{Component}`. Alles op één
pagina zetten werkt zolang het er vijf zijn; bij de volle bibliotheek is een
pagina per component de enige indeling waarin een designer iets terugvindt
zonder het canvas af te scrollen.

De plugin zet de `dsn/`-pagina's daarna alfabetisch, en alleen die: pagina's
zonder de prefix blijven staan waar de designer ze had. `dsn/Icons` schuift
gewoon mee in die volgorde.

De set zelf heet naar de CSS-klasse (`dsn-button`) en de pagina naar het
component (`dsn/Button`). Dat is geen inconsistentie: de setnaam is waar een
designer in de code op zoekt, de paginanaam is wat er in een lijst prettig
leest.

### Het canvas onder de varianten

De varianten staan onder elkaar, met 48px ruimte eromheen en ertussen, op de
documentachtergrond van het design system in plaats van op het grijs van Figma.

Die achtergrond wordt gebonden aan `dsn/Primitives →
color/neutral/bg-document`. Zonder die binding schakelt een designer de mode
naar `start-dark` en kijkt naar donkere componenten op een lichte plaat, waar
geen enkele variant meer op te lezen is.

De 48px is bewust een vast getal en geen token: dit is de presentatie van de
bibliotheekpagina, geen eigenschap van het component. Een spacing-token zou
betekenen dat de afstand tussen twee varianten meebeweegt met een
densitywissel, en dat zegt over het component niets.

### Laagstructuur

Het root-element van een matrix wordt in Figma niet in een frame gezet maar
**wórdt** het component. Een wrapper eromheen zou een lege laag met dezelfde
auto layout opleveren, en dat is precies de nesting die een Figma-library
onwerkbaar maakt.

```
dsn-button                         (component set)
└── variant=strong, size=small…    (component: fills, padding, radius, gap)
    ├── Tekst                      (text)
    └── chevron-right              (icoon)
```

De component set heet naar de **CSS-klasse van de root** (`dsn-button`), niet
naar de matrixnaam. Dat is de naam waarop een designer in de code zoekt.

Een icoon krijgt zijn naam uit `data-icon` op de `<svg>`. Zonder dat heet elke
icoonlaag "icon" en moet een designer het bestand opentrekken om te zien welk
icoon het is:

```html
<svg class="dsn-icon" data-icon="chevron-right" aria-hidden="true" …></svg>
```

Het icoon blijft in een component set wel een frame met de vectoren erin: dat
is wat `createNodeFromSvg` oplevert, en het platslaan tot één vector zou de
lijndikte van onze stroke-iconen niet meeschalen. In de iconset gaat dat frame
er wél af, omdat het component daar zelf het icoon is.

### Drie valkuilen bij het meten

Deze drie leverden allemaal stilzwijgend verkeerde waarden op en zijn de reden
dat de extractor eruitziet zoals hij eruitziet:

1. **Transitions.** `getComputedStyle` leest tijdens een transition de
   tussenwaarde, niet de eindwaarde. Een hover-kleur werd zo halverwege
   gemeten. De pagina zet daarom `transition` en `animation` op `none`.
2. **De cursor blijft staan.** Na een hover-variant staat de muis er nog, dus
   elke volgende variant meet óók als hover. De cursor gaat nu voor elke
   variant terug naar (0, 0).
3. **Webfonts.** Zonder `document.fonts.ready` meet de eerste variant met een
   systeemfont en wijken de breedtes af van de rest.

Plus een vierde die geen meetfout is maar wel dezelfde vorm heeft: `body.css`
hangt aan de klasse `.dsn-body`, niet aan het element. Zonder die klasse op de
meetpagina erft alles zonder eigen font-family-token het browserstandaard­
lettertype, en meet je Times.

### Pseudo-toestanden

`pseudoStates` koppelt een as-waarde aan een toestand die niet in markup uit te
drukken is. Er zijn er twee:

| Waarde  | Wat de extractor doet                    |
| ------- | ---------------------------------------- |
| `hover` | de muis over `[data-figma-root]` bewegen |
| `focus` | één keer Tab indrukken                   |

Bij `focus` is dat bewust een echte toetsaanslag en geen `.focus()`: Chromium
zet `:focus-visible` alleen bij toetsenbordfocus, en juist die selector draagt
de focusstijl. Tab landt op het eerste focusbare element van de pagina, dus een
matrix met een focus-as hoort er precies één te renderen. SkipLink is daar het
voorbeeld van: die is standaard weggeklipt en krijgt zijn hele verschijning pas
op `:focus-visible`.

### `color: inherit` is geen waarde

`inherit` is een verwijzing: het element neemt de berekende waarde van zijn
ouder over. Als winnende declaratie heeft het geen `var()`-keten, en zonder
extra stap valt het dus weg als "de waarde komt niet uit één token".

De cascade-nabootsing loopt daarom bij `inherit` door naar de ouder, net als de
browser. Zonder die stap kreeg het icoon in een StatusBadge een vaste kleur en
volgde het de theme-schakelaar niet, puur omdat de CSS daar een expliciete
`color: inherit` heeft staan.

### Iconen in een matrix

`icon('chevron-right')` uit `src/icons.js` leest hetzelfde SVG-bestand uit
`components-html/assets/icons` dat ook de iconset vult, en zet er meteen het
`data-icon`-attribuut op waarmee de plugin het icooncomponent terugvindt.

Paden met de hand overtypen in een matrix werkt, maar levert een tweede
waarheid op: een icoon dat in de assets-map wordt bijgewerkt verandert dan wel
in de iconset en niet in de componenten die hem tonen.

Een SVG die géén icoon uit die set is (de cirkel van Spinner) heeft geen
`data-icon` en krijgt zijn laagnaam uit zijn eigen klasse.

## Hoe de icongeneratie werkt

`build-icons.js` is een ander type generator dan `build-components.js`. Daar
wordt in een browser gemeten omdat de eindwaarde pas uit de cascade volgt; hier
is de bron een SVG-bestand met een vaste `viewBox`. Er valt niets te meten, dus
er wordt niet gemeten.

De generator leest `components-html/assets/icons/*.svg`, normaliseert de
`<svg>`-tag (Tabler-klassen eruit, `width` en `height` expliciet op 24) en
schrijft één spec per icoon. Een nieuw icoon in die map komt er zonder verdere
stap bij, precies zoals bij `icon-registry.generated.ts`.

De 24x24-hulppath die Tabler in 31 van de 51 bestanden meelevert
(`<path stroke="none" d="M0 0h24v24H0z" fill="none"/>`) gaat eruit. Hij tekent
niets en zet alleen de afmeting vast, maar in Figma is het wél een extra
vectorlaag, en dan verschilt het aantal lagen per icoon. Dat is precies wat een
instance swap laat mislukken; zie
[de README van figma-plugin](../figma-plugin/README.md) voor waarom de
laagstructuur van elk icoon gelijk moet zijn.

De namen komen uit de bestandsnamen, net als in die registry, en worden er
daarna **tegenaan gehouden**: staat er iets in de een en niet in de ander, dan
komt dat als waarschuwing in de build. Anders zou een instance swap straks een
icoon aanwijzen dat in Figma anders heet dan in de code.

### Kleur: een gekozen standaard, geen gemeten binding

De vectoren krijgen `dsn/Primitives → color/neutral/color-default`. Dat is
bewust géén afgeleide van een meting: een losstaand icooncomponent heeft geen
tekstouder om zijn kleur van te erven, dus er is niets om tegen af te zetten.
De verificatie uit [DR-2026-06](../../docs/decisions/DR-2026-06-figma-bindingen-meten-plus-cssom.md)
geldt hier dus niet; dit is de standaardkleur waar een instance overheen mag
schrijven, zoals `currentColor` in de browser.

Wat de plugin er verder mee doet (idempotentie, laagstructuur, de pagina
`dsn/Icons`) staat in [de README van figma-plugin](../figma-plugin/README.md).

## Een component toevoegen

Zet een matrix in `src/matrices/{component}.js`. De assen daarin worden de
variant properties van de Figma component set. Definieer ze expliciet: stories
zijn losse voorbeelden, een component set heeft een volledige matrix nodig.

```js
export default {
  component: 'Badge',
  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700',
  ],
  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/badge/badge.css',
  ],
  axes: { variant: ['info', 'warning'], size: ['small', 'default'] },
  pseudoStates: { hover: 'hover' },
  render: ({ variant, size }) =>
    `<span class="dsn-badge dsn-badge--${variant} dsn-badge--size-${size}" data-figma-root>Label</span>`,
};
```

De `fonts`-lijst is niet optioneel als het component tekst bevat: zonder
geladen webfont meet de browser met een systeemfont en kloppen de breedtes niet.
De fontnaam moet ook in Figma beschikbaar zijn.

### Wat een matrix zelf kan meegeven

Twee velden die je zelden nodig hebt, maar zonder welke een component niet
klopt:

- **`setName`** overschrijft de naam van de component set. Die komt normaal uit
  de eerste CSS-klasse van de root, en dat gaat mis zodra de root meerdere
  blokklassen draagt: HeadingGroup is `class="dsn-heading dsn-heading--2
dsn-heading-group"`, dus zonder override zouden Heading en HeadingGroup
  allebei `dsn-heading` heten.
- **`warnings`** zet een vaste waarschuwing in de spec, voor een beperking die
  de generator zelf niet kán zien. `::marker` is het voorbeeld: de bolletjes van
  een UnorderedList zijn een pseudo-element en dus geen DOM-node, dus er valt
  niets te meten en niets in de meting valt daarover op te merken. Wat er wél
  in Figma landt is de typografie, de inspringing en de afstand tussen items.

## Component properties

Naast de assen kan een matrix component properties declareren: de text-, boolean-
en instance-swap-knoppen die een designer in het rechterpaneel van Figma ziet.

```js
componentProperties: [
  { name: 'label', type: 'TEXT', slot: 'label' },
  { name: 'showIconEnd', type: 'BOOLEAN', slot: 'icon-end', default: false },
  {
    name: 'iconEnd',
    type: 'INSTANCE_SWAP',
    slot: 'icon-end',
    default: 'chevron-right',
  },
],
```

`slot` verwijst naar een `data-figma-slot` in de gerenderde markup:

```html
<span class="dsn-button__label" data-figma-slot="label">Tekst</span>
```

Die markering staat er omdat de plugin de laag anders op klassenaam zou moeten
raden, en dan komt een property stilletjes aan de verkeerde laag te hangen zodra
de CSS-klasse verandert.

Twee dingen die daaruit volgen:

- **Een slot moet in élke variant gerenderd worden**, ook als de property hem
  standaard uitzet. Figma definieert properties op de component set, en een
  variant zonder de laag levert een property op die daar niets doet. De
  generator controleert dit en zet een waarschuwing in de build in plaats van
  een halve property te leveren.
- **Een instance swap heeft de iconset nodig.** De property verwisselt het
  `mainComponent` van een instance, en een uit SVG opgebouwd frame heeft er
  geen. De plugin maakt van een icoon een instance zodra het op de pagina
  `dsn/Icons` staat; anders bakt hij het in en meldt dat de property niet
  gelegd kon worden.

### Wat wordt een as en wat wordt een property?

Beide kunnen dezelfde eigenschap uitdrukken, dus de keuze is niet vanzelf
duidelijk. De regel:

| Kies                   | Wanneer                                                  | Voorbeeld                  |
| ---------------------- | -------------------------------------------------------- | -------------------------- |
| **Variant-as**         | de waarde verandert gemeten tokens: kleur, padding, maat | `variant`, `size`, `state` |
| **Component property** | de waarde verandert alleen of, en welke, laag er staat   | `label`, `iconStart`       |

De reden is de meting. Elke variant wordt in de browser gemeten en aan zijn
tokens gebonden. Een as levert per waarde een eigen meting op en dus de juiste
padding en kleuren. Een property zet alleen een laag aan of uit binnen een
bestaande meting; verandert die stand ook de tokens, dan blijft de padding van
de andere stand staan en klopt het component niet meer.

Daarom is `iconOnly` bij Button géén property: `dsn-button--icon-only` heeft
eigen `padding-inline`-tokens, dus als boolean zou de knop de padding van de
tekstvariant houden. Als as zou hij de set verdrievoudigen. Zolang geen van
beide bevalt is niets doen het eerlijkste antwoord; zie issue
[#323](https://github.com/jeffreylauwers/design-system-starter-kit/issues/323).

### Naamgeving

De namen volgen de React-props, zodat een designer en een developer hetzelfde
woord gebruiken. Dat levert één afwijking op: `iconStart` en `iconEnd` _zijn_ in
code het icoon, dus dat zijn hier de instance swaps. De boolean die ze aan- en
uitzet krijgt `show` ervoor (`showIconStart`), omdat twee properties in Figma
niet dezelfde naam kunnen dragen.

En één afspraak die niet uit de props volgt: de tekst van een component heet
altijd `label`, ook waar de React-prop `children` is. `children` is een
React-begrip; in het rechterpaneel van Figma zegt het niets.

Een TEXT-property hangt aan een tekstlaag, dus de `data-figma-slot="label"`
hoort op het element dat de tekst draagt en niet op de root, tenzij de root
zelf tot tekst inklapt. Bij NumberBadge en SkipLink staat de markering daarom
op een `<span>` binnen het component; die kost in Figma geen extra laag, want
een element dat alleen tekst bevat wordt één TEXT-node.

### Een fluid token dat op de verkeerde viewport vastgeprikt staat, bindt niet

Twaalf fluid waarden staan in een collection waarvan de mode-as het theme is en
niet de viewport, en zijn daarom op 1440px vastgeprikt (zie "Fluid typografie").
De matrices meten op 375px. De verificatie uit DR-2026-06 vergelijkt beide, ziet
een verschil, en weigert de binding.

Dat is het systeem dat werkt zoals bedoeld, maar het gevolg is wel dat die
waarden in Figma een vaste waarde houden. Het raakt onder meer
`form-control/font-size`, en daarmee de tekst in élk formulierveld, plus de vier
`padding-*-with-icon`-tokens van Select, SearchInput, DateInput en TimeInput.

Zichtbaar in de build als:

```
font-size  de waarde van het token (19.4) wijkt af van de gemeten 16
```

Dit hoort bij issue #328. Zolang die openstaat is het geen regressie maar een
bekende post: 55 bindingen over vier componenten.

### Pseudo-elementen komen nooit mee

De extractor loopt de DOM af, en een pseudo-element is geen DOM-node. Dat raakt
drie plekken, en op alle drie staat het als vaste `warnings`-regel in de matrix
in plaats van dat het stil blijft:

| Pseudo-element           | Component                  | Wat ontbreekt            |
| ------------------------ | -------------------------- | ------------------------ |
| `::marker`               | UnorderedList, OrderedList | bolletjes en nummers     |
| `::file-selector-button` | FileInput                  | de knop "Bestand kiezen" |

`IconList` laat zien wat het alternatief is: die zet `list-style: none` en
tekent zijn markering met een echt `<svg>`, en komt daardoor wel volledig over.

## Welke componenten wel en niet een matrix krijgen

De regel: **elk component uit `components-html/manifest.json` krijgt een
matrix, behalve wat hieronder staat.** Wat er af is, staat in `src/matrices/`;
dat is de lijst, niet een tabel in dit bestand die naast de code kan gaan
staan.

Een component overslaan is een besluit en geen achterstand, dus het staat hier
met naam en reden.

### Layoutcomponenten

`ActionGroup`, `BreakoutSection`, `Container`, `Grid`, `PageBody`,
`PageLayout`, `Stack`.

Layoutgedrag zonder eigen visuele identiteit: ze tekenen niets, ze plaatsen
alleen wat erin zit. Een designer gebruikt daar Figma auto layout voor, en een
gegenereerd "Stack-component" is een anti-patroon: het levert een lege laag op
die precies doet wat het frame eromheen ook al kan.

### Componenten die het canvas zelf zijn

- **`Body`.** De documentwortel. Zijn achtergrond- en tekstkleur zitten al in
  Figma: dat is de plaat waar elke component set op staat, gebonden aan
  `dsn/Primitives → color/neutral/bg-document`.
- **`Icon`.** Dat is de iconset. Die komt uit `build-icons.js` en staat als 51
  losse componenten op `dsn/Icons`, want een instance swap kiest uit
  componenten en niet uit varianten van één set.

### Dezelfde CSS, een ander HTML-element

Figma kent geen HTML-elementen. Twee componenten die op dezelfde klassen
uitkomen leveren dus twee identieke component sets op, en een designer die er
één van de twee kiest maakt geen keuze maar een fout die niet te zien is.

| Overgeslagen                                                   | Levert hetzelfde op als | Verschil                           |
| -------------------------------------------------------------- | ----------------------- | ---------------------------------- |
| `ButtonLink`                                                   | `Button`                | `<a>` in plaats van `<button>`     |
| `LinkButton`                                                   | `Link`                  | `<button>` in plaats van `<a>`     |
| `FormFieldLegend`                                              | `FormFieldLabel`        | `<legend>` in plaats van `<label>` |
| `FormFieldset`                                                 | `FormField`             | `<fieldset>` in plaats van `<div>` |
| `EmailInput`, `NumberInput`, `PasswordInput`, `TelephoneInput` | `TextInput`             | alleen een andere `type`-attribuut |

`DateInput`, `TimeInput`, `SearchInput` en `Select` staan hier níet tussen:
die hebben wel eigen CSS (een kalenderknop, een kruisje, een chevron) en dus
een eigen verschijning.

### Overig

- **`Backdrop`.** Een verduistering over het hele viewport, waarvan de enige
  eigenschap een achtergrondkleur is. In Figma is dat een rechthoek met een
  variable, geen component.
- **Patronen en templates.** Die componeer je in Figma uit de gegenereerde
  componenten.
- **Box shadows.** Die horen Figma effect styles te worden, geen variables.
  Ze staan daarom in het skip-report.

## Wat de generator niet levert

Thumbnails, en de booleans die gemeten tokens veranderen (`iconOnly`, `loading`,
`fullWidth` bij Button). Die blijven handwerk in Figma.
