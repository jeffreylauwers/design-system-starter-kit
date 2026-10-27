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
| `design-tokens/dist/figma/variables.json` | `pnpm build:figma-variables`  | Variable collections, modes en aliassen  |
| `figma-sync/dist/icons.json`              | `pnpm build:figma-icons`      | Eén node spec per SVG uit de assets-map  |
| `figma-sync/dist/{component}.json`        | `pnpm build:figma-components` | Node specs per variant van een component |

Naast `variables.json` komt `variables-report.json` te staan met alles wat
níet naar een variable te vertalen was, inclusief reden. Lees dat bestand bij
elke review: het is de plek waar drift zichtbaar wordt.

## Kleuren: OKLCH in de tokens, sRGB in Figma

De kleurtokens mogen in `oklch()` staan. CSS, SCSS en JS krijgen die waarde
ongewijzigd; Figma niet, want een variable is daar altijd sRGB. De vertaling
gebeurt op één plek, `design-tokens/src/config/color.js`, en wordt op twee
momenten gebruikt:

- **Variables.** `figma.js` zet elke `oklch()`-waarde (en hex) om naar het
  RGBA-object dat in `variables.json` komt.
- **Component-specs.** Een browser rekent `oklch()` niet om naar `rgb()`:
  `getComputedStyle` geeft de waarde terug zoals hij geschreven is. De gemeten
  kleur gaat daarom door dezelfde functie, zodat hij exact uitkomt op de waarde
  van het token en de verificatie van de binding slaagt.

Valt een kleur buiten sRGB, dan wordt de chroma teruggebracht tot hij past, bij
gelijke lichtheid en tint. Dat is dezelfde keuze als de hex-voorvertoning in de
color-palette-generator, dus Figma toont de kleur die de generator liet zien
(bij kleuren op de rand van het gamut hooguit één stap van 1/255 verschil). Een
browser op een scherm met een groter gamut (P3) kan zo'n kleur wél verzadigder
tonen dan Figma.

## Fluid typografie en spacing

Een Figma-variable is statisch, dus een `clamp()` moet op een viewport worden
vastgeprikt. In plaats van één willekeurige breedte te kiezen krijgt de
`dsn/Density`-collection een mode per viewport, op de grenzen van de fluid
schaal (`dsn.viewport.min-inline-size` en `max-inline-size`):

| mode                          | viewport | `text/font-size/md` | `space/block/md` |
| ----------------------------- | -------- | ------------------- | ---------------- |
| `default-mobile`              | 360px    | 16px                | 8px              |
| `default-desktop`             | 1440px   | 20px                | 10px             |
| `default-fixed-space-mobile`  | 360px    | 16px                | 8px              |
| `default-fixed-space-desktop` | 1440px   | 20px                | 8px              |
| `information-dense`           | n.v.t.   | 16px                | 8px              |

De twee viewports vallen precies op de grenzen van elke clamp, dus de modes
bevatten exact de ontworpen min- en max-waarden. Een project-type dat niet
fluid is krijgt automatisch één mode in plaats van een mode per viewport, zoals
`information-dense` hierboven.

Naast de font-sizes en de spacing-maten komen ook afgeleide fluid waarden in
deze collection, zolang ze niet per theme verschillen: `form-control/font-size`
en `form-control/padding-inline-*` (als alias naar `text/font-size/md` en
`space/inline/lg`) en `icon/size/4xl`. Component-variables die als alias naar
deze collection wijzen blijven in `dsn/Components`, dus het schakelen van het
artboard laat typografie en ruimte meebewegen zonder dat er iets opnieuw
gebonden hoeft te worden.

Vijftien fluid waarden hangen van theme én viewport af: de icon-sizes sm t/m 3xl
(via de line-height van het theme), `form-control/padding-block-*` (Start en
Wireframe verwijzen naar een andere spacing-maat) en de tokens die daarvan
afgeleid zijn. Geen collection heeft beide assen, dus die zijn op 1440px
vastgeprikt. Ze staan als `viewportPinned` in het report.

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

De meetviewport is **360px**, en blok-componenten krijgen een wrapper van
**328px** (360 min 2 x 16px padding). Dat is bewust: het design system wordt
mobile-first ontworpen, en op 360px lossen alle fluid clamps op hun ondergrens
op. De gemeten typografie komt daarmee exact overeen met de `default-mobile`
mode van de `dsn/Density`-collection, dus component en variable zeggen
hetzelfde. Per matrix te overschrijven met `viewport`.

### Een viewport per variant

Een component met layouts die elkaar per viewport aflossen is op één breedte
niet te meten. De large- en compact-layout van PageHeader zijn onder 64em
`display: none`, en de extractor slaat die over: op 360px komt uitsluitend de
mobiele balk mee.

Zo'n matrix zet daarom `viewports` neer en wijst met `viewportAxis` de as aan
die ertussen kiest:

```js
  axes: {
    layout: ['default', 'compact'],
    colorScheme: ['default', 'inverse'],
    viewport: ['small', 'large'],
  },

  viewportAxis: 'viewport',
  viewports: {
    small: { width: 360, wrapperStyle: 'width: 360px;' },
    large: { width: 1440, wrapperStyle: 'width: 1440px;' },
  },
```

De assen volgen de props van Storybook, zodat een designer dezelfde knoppen
ziet als een developer. Een header loopt van rand tot rand en zet zijn eigen
padding, dus de wrapper is daar net zo breed als de viewport en niet 328.

Belangrijker dan de breedte zijn de modes. `modesForMatrix` leidt uit de
gemeten breedte af welke mode van `dsn/Density` geldt, en die modeset bepaalt
waar de verificatie van een binding tegen afrekent. Er is daarom een
variable-index per gemeten breedte, en elke variant wordt tegen de index van
zijn eigen breedte geverifieerd: de small-varianten tegen `default-mobile`, de
large-varianten tegen `default-desktop`. Dat houdt de eigenschap uit DR-2026-06
intact. Een token moet de gemeten waarde reproduceren in dezelfde theme-,
mode- en viewportstand voordat er gebonden wordt, dus een misrekening kan een
binding missen maar nooit een verkeerde leggen. `bindings.modes` in de spec
vermeldt bij zo'n matrix per breedte welke modes het waren.

Op `viewport=small` is er tussen `layout=default` en `layout=compact` geen
verschil te zien, precies zoals in de browser: beide layouts zijn daar
verborgen. Die varianten zijn met opzet gelijk en niet weggelaten, want de as
hoort bij de prop en niet bij de viewport.

**Ook een container query volgt deze as.** De compacte BreadcrumbNavigation
klapt in zolang het component zelf 32rem of smaller is; dat hangt aan de
wrapper en niet aan de viewport. De viewport schuift toch mee, want een
breadcrumb van 1168px staat in werkelijkheid op een desktoppagina. Zou hij op
360 blijven, dan leverde dat een variant op die in de browser niet bestaat:
desktopbreedte met mobiele typografie. Meetbaar verschil: de tekst gaat van 14
naar 15,6px, en de bindingen gaan van `default-mobile` naar `default-desktop`.

### CSS Grid

`grid-template-columns: <maat> 1fr` wordt in Figma `FIXED` + `FLEX`, waarbij
`FLEX` overeenkomt met de `fr`-eenheid. De browser lost `fr` op naar pixels
voordat wij kunnen meten, dus welke track flexibel was is uit één meting niet
af te lezen. De extractor rendert een component met een grid daarom een tweede
keer in een bredere wrapper: een track die meegroeit was flexibel.

Rijen worden `HUG`. CSS-gridrijen zijn standaard `auto`, en een vaste
rijhoogte zou betekenen dat het component niet meegroeit als tekst afbreekt.

Rijen aan het eind waar geen enkele laag in staat gaan eraf. Een Note zonder
kop houdt in de computed waarde twee rijen over terwijl er één gevuld is: het
icoon spant met `grid-row: 1 / span 2` in de tweede, en bij de varianten met
een voorleeslabel staat dat visueel verborgen spanje er ook nog in. Dat label
is in Figma geen laag, maar de rij bleef wel staan als lege track. Alleen aan
het eind: een lege rij tussen twee gevulde in houdt de nummering van de cellen
overeind.

**Figma kent geen subgrid.** Een rij die in CSS de kolommen van zijn ouder
overneemt (`grid-template-columns: subgrid`, zoals de rij van DataList in de
brede weergave) geeft uit de browser geen pixelmaten terug maar het woord
`subgrid`: gemeten is dat `subgrid [] [] [] []`, en daar is niets uit te lezen.
Zo'n laag wordt gemarkeerd en krijgt na het omzetten van de kinderen de tracks
van zijn ouder opgelegd. De sizing van de kinderen in die rij wordt dan
opnieuw bepaald, want die is eerst beslist toen de tracks nog leeg waren.

**Een negatieve gridlijn telt van achteren.** `-1` is de laatste lijn, dus in
een grid van drie kolommen is dat lijn 4 en spant `grid-column: 1 / -1` over
alles. Zonder die omrekening werd zo'n kind één kolom breed.

**Een expliciete kolom zonder expliciete rij** komt in twee vormen voor. Heeft
het grid precies één rij, dan is die rij de plek: zo staan de key, de value en
de acties in de rij van DataList (`grid-column: 1|2|3` zonder `grid-row`).
Zijn er meer rijen en pakt het kind alle kolommen, dan is het autoplaatsing
over de rijen, zoals de rijen van DataList zelf, en gaat het via de span
hieronder.

Een kind zonder expliciete cel maar mét een span is autoplaatsing. `grid-column:
span 3` komt uit de browser als `grid-column-start: "span 3"` met
`grid-column-end: "auto"`, dus er is geen cel om te noemen. Zo werken de
GridItems van PageFooter (`colSpan=12`, `colSpanLg=3`). De span gaat dan op het
kind en de ouder krijgt `gridItemsPositioning: 'ROW_AUTO_FLOW'`, zodat Figma zelf
plaatst in dezelfde leesvolgorde als `grid-auto-flow: row`. Zulke kinderen
krijgen FILL en niet hun gemeten breedte: een grid-kind rekt in CSS standaard
op tot zijn cel (`justify-items: stretch`), en de gemeten breedte hoort bij de
viewport waarop gemeten is.

In de plugin staat de span los van de plaatsing: zonder anchor wordt er niets
gepositioneerd, maar de span hoort er wél op, anders is een GridItem van twaalf
kolommen in Figma één kolom breed.

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
| `fontFamily`                                 | `font-family`                                            |
| `fontWeight`                                 | `font-weight`                                            |

Een font-family-variable is in Figma één familienaam, geen stack:
`Fira Sans, sans-serif` bestaat daar niet als lettertype. De
variables-export zet er daarom de eerste echte familie in (`Fira Sans`),
zonder quotes en zonder generieke sleutelwoorden als `sans-serif` of
`ui-monospace`. In Figma is er geen terugval, dus die familie moet op de machine
van de designer geïnstalleerd zijn, ook `Comic Sans MS` voor `wireframe`.

`line-height` wordt **niet** gebonden, maar komt als **procent** mee. Het token
is een verhouding (`1.5`), en Figma leest een getal-variable op `lineHeight` als
pixels: binden zou elke regel 1,5px hoog maken, en een procent-variable bestaat
niet. Een vaste procentwaarde kan wel. `1.5` wordt `150%`, en die schaalt net
als in CSS mee met de font-size, dus ook met de viewport-modes van
`dsn/Density`.

Of een regelhoogte een verhouding is staat niet in de computed style, want die
is altijd in pixels. De generator haalt het uit de cascade: een unitless
declaratie, of een token in de `var()`-keten met een verhouding als waarde. Die
verhouding wordt geverifieerd: font-size maal verhouding moet de gemeten
regelhoogte opleveren, anders blijft het de gemeten pixelwaarde.

Wat een vaste procentwaarde niet doet, is de theme-schakelaar volgen: `start`
gebruikt 1.5, `wireframe` 1.4. Daarvoor is een variable in pixels nodig, per
theme én per viewport, en dat is dezelfde keuze als in issue #328.

Typografie erft over. Declareert een element zelf geen `font-family` of
`font-weight`, dan telt die van de dichtstbijzijnde voorouder, tot en met
`.dsn-body`. Zo bindt SkipLink aan `text/font-family/default` zonder eigen
token.

Een element dat tot één tekstlaag inklapt houdt daarbij zijn **eigen** tokens.
Het label van DateInputGroup wijst naar `form-field-label/*`; die van zijn
ouder overnemen leverde daar de generieke `text/*` op. Een kale tekstnode erft
wél van het element waarin hij staat, en een `<option>` ook: de browser tekent
een dichte `<select>` met de stijl van het veld, niet met die van de optie.

Een gewicht dat uit de stylesheet van de browser komt bindt niet. StatusBadge is
een `<strong>`, en dat is vet zonder declaratie. De voorouder levert dan
`text/font-weight/default` (400) terwijl er 700 gemeten is, en de verificatie
weigert de binding. Dat staat in het report en klopt: er is geen token.

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

### Wat niet rendert wordt overgeslagen

De extractor slaat een element over als het `dsn-visually-hidden` draagt,
`opacity: 0` heeft, `display: none` is of `visibility: hidden`. De laatste twee
kwamen erbij met BreadcrumbNavigation: de compacte variant is een container
query die alle items op één na verbergt, en zonder die regel kwamen die items
als 0x0-lagen in Figma terecht, mét hun kinderen eronder.

Dat is niet alleen opruimen. Bij Table stonden alle drie de sorteericonen in
elke variant over elkaar heen; nu draagt elke variant precies het icoon dat bij
zijn `aria-sort` hoort.

### De juiste schakel in de var()-keten

Een variant werkt vaak door een custom property te _herdefiniëren_ in plaats van
de property opnieuw te zetten:

```css
.dsn-page-footer {
  background-color: var(--dsn-page-footer-background-color);
}
.dsn-page-footer--inverse {
  --dsn-page-footer-background-color: var(
    --dsn-color-accent-1-inverse-bg-default
  );
}
```

De winnende declaratie blijft dan die van de basisklasse, en de eerste schakel
in de keten (`page-footer/background-color`) bestáát als variable, maar draagt
de standaardwaarde. Binden op "de eerste schakel die bestaat" leverde daar dus
de verkeerde kleur op, en de verificatie weigerde terecht.

De keten wordt daarom helemaal afgelopen, en de eerste schakel wint waarvan de
waarde met de meting klopt. Klopt er geen enkele, dan komt de eerste in het
rapport, zodat de melding blijft wijzen naar wat de CSS bedoelde.

### CSS-afhankelijkheden en imports

Sinds [DR-2026-09](../../docs/decisions/DR-2026-09-css-afhankelijkheden-declareren-per-laag.md)
declareert elke component-CSS bovenaan van welke andere lagen hij afhangt. De
extractor leest die `@dsn-depends-on` en waarschuwt als zo'n laag niet in de
`css`-lijst van de matrix staat. Een matrix die te weinig CSS laadt meet een
component dat er half uitziet, en dat valt niet op: de meting slaagt gewoon,
alleen met de verkeerde waarden. Table ging van 97 naar 181 bindingen toen
`button.css` erbij kwam.

`@import` in een stylesheet wordt opgelost voordat de CSS de meetpagina in gaat,
want in een inline `<style>` lost een relatief `@import` nooit op. Dat gaat ook
via de `exports`-map van het package, want daar wijkt de exportnaam soms af van
de bestandsnaam: `hero.css` importeert
`@dsn-starter-kit/design-tokens/css/scoped/start-hero-image-light`, en dat is
`dist/css/scoped/start-light-hero-image.css`. Bestaat het doel niet, dan gooit
de build: liever stuklopen dan een component dat er is maar leeg.

### Layoutmodellen die Figma niet kent

Een `<table>` is `display: table`, en `<tr>` en `<td>` zijn `table-row` en
`table-cell`. Figma kent daar niets van. Wat een tabel echter _is_, is een
verticale stapel rijen waarvan de cellen naast elkaar staan, en dat is precies
verticale en horizontale auto layout.

De promotie van blokelementen hierboven kijkt daarom naar beide richtingen. Ze
staan onder elkaar met gelijke gaten, of naast elkaar met gelijke gaten, of
geen van beide: in dat laatste geval blijft het frame zonder auto layout en
komt de padding in het rapport. Zonder de horizontale variant verloor elke
`<tr>` zijn padding-bindingen.

Hetzelfde geldt voor de overlays. Een `<dialog>` en een `[popover]` bestaan
alleen in hun open stand: zonder `[open]` of `showPopover()` geldt de
`display: none` uit de UA-stylesheet en valt er niets te meten. De matrices
zetten dat attribuut of doen die aanroep in `domSetup`.

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
  `--dsn-checkbox-size`), of hun logische tegenhangers `inline-size` en
  `block-size`;
- de node absoluut gepositioneerd is, en zijn maat dus uit zijn insets haalt;
- de node geen kinderen heeft die meestromen. HUG zonder inhoud klapt in tot de
  padding: een `<input>`, een lege DotBadge, de wrapper van Popover met alleen
  een absoluut kind.

`fit-content`, `max-content`, `min-content` en `auto` tellen daarbij niet als
maat: dat is een instructie om om de inhoud te krimpen, het tegendeel van
vast. Een CheckboxOption is `width: fit-content` en kwam daardoor op een vaste
69px in een CheckboxGroup te staan. RadioOption is hetzelfde. In de groep
vult een optie nu de breedte (`fillRootChildren` op CheckboxGroup en
RadioGroup), want Figma kent geen maximale breedte die met de ouder
meebeweegt; zo breekt een lang label af op de breedte van de groep, net als in
de browser.

`width` en `height` zijn daarvoor toegevoegd aan de gevolgde properties. Niet
om te binden, maar omdat de computed waarde altijd een pixelgetal is: daaruit
valt niet af te lezen of de maat van een declaratie komt of van de inhoud. Uit
de cascade wel.

Horizontaal hugt een node alleen als hij in CSS ook om zijn inhoud krimpt:
`inline-flex`, `inline-block`, of een absoluut gepositioneerde **root** zonder
eigen breedte. Die root is de uitzondering op de absolute-regel hierboven. Hij
is in Figma het component zelf, en er is niets waartegen zijn insets gelden.
SkipLink is alleen absoluut om zich buiten beeld te zetten, en stond daardoor
op een vaste 241×40 terwijl hij net als Button met zijn tekst hoort mee te
groeien. Naar `display` kijken is daar niet genoeg: de browser rekent
`inline-block` op een absoluut element om naar `block`.

Een kind met `flex-grow` in een rij krijgt FILL: het neemt de ruimte die over
is, zoals de kop in de header van ModalDialog, Drawer en Popover, en de link in
MenuLink. Zonder dit schoof de sluitknop in de header mee met de lengte van de
titel.

Tekst aan het eind van een rij krijgt FILL. In CSS is tekst in een flex-rij een
item dat mag krimpen en dan afbreekt; in Figma breekt tekst alleen af als de
laag een breedte heeft, en op HUG groeit hij de rij uit. Dat geldt alleen in een
rij die zelf een blok is (`flex`, geen `inline-flex`, want FILL in een HUG-ouder
kan Figma niet), die vooraan uitlijnt, en voor het laatste kind dat meestroomt.
Zo loopt de tekst van IconList, CheckboxOption en MenuLink door tot de rand.

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
en komt de padding als vanouds in het rapport.

Elk kind van zo'n frame draagt zijn gemeten `x` en `y`, ook een tekstlaag, en
de plugin zet ze relatief aan de ouder. Tot #369 gebeurde dat alleen voor
absoluut gepositioneerde kinderen, en lag de rest op 0,0: bij een FormField
met beschrijving stonden het label, de beschrijving en het veld over elkaar. Dat gebeurt bijvoorbeeld bij de
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

Eén uitzondering: een onderdeel dat alleen binnen zijn component gebruikt
wordt, zoals het item van een lijst. Dat draagt `partOf` en staat op de
pagina van dat component (zie "Onderdelen van een component"). De plugin zet
een nieuwe set rechts naast wat er al op de pagina staat, met 80px ertussen;
het item wordt eerst geïmporteerd, dus het staat links en de lijst rechts. Een
set die er al stond verplaatst hij niet.

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

Elke tekstlaag heet **Tekst**, niet naar zijn klasse (`dsn-heading`) of naar de
eerste woorden van de inhoud. Een designer herkent een tekstlaag aan zijn type,
en een naam die meeverandert met de inhoud maakt het laagpad onvoorspelbaar.

De component set heet naar de **CSS-klasse van de root** (`dsn-button`), niet
naar de matrixnaam. Dat is de naam waarop een designer in de code zoekt. Die
klasse komt uit de DOM en niet uit de laagnaam: een root die tot tekst inklapt,
zoals Heading, heet als laag "Tekst". De plugin zoekt een bestaande set op naam
op, dus een setnaam die verschuift levert een tweede set naast de oude op.

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
drukken is. Er zijn er drie:

| Waarde   | Wat de extractor doet                                 |
| -------- | ----------------------------------------------------- |
| `hover`  | de muis over het mikpunt bewegen                      |
| `focus`  | één keer Tab indrukken                                |
| `active` | de muis over het mikpunt bewegen en de knop indrukken |

Bij `focus` is dat bewust een echte toetsaanslag en geen `.focus()`: Chromium
zet `:focus-visible` alleen bij toetsenbordfocus, en juist die selector draagt
de focusstijl. Tab landt op het eerste focusbare element van de pagina, dus een
matrix met een focus-as hoort er precies één te renderen. SkipLink is daar het
voorbeeld van: die is standaard weggeklipt en krijgt zijn hele verschijning pas
op `:focus-visible`.

Bij `active` moet er echt een muisknop ingedrukt staan; `:active` is niet te
zetten. Daar horen twee dingen bij. De knop gaat na de meting weer los, want
een ingedrukte knop blijft tussen varianten staan, net als de cursorpositie.
En in de browser geldt tijdens het indrukken ook `:hover`: de CSS rekent
daarop (eerst de hover-regel, daarna de active-regel), dus de active-variant
is precies wat een gebruiker tijdens het klikken ziet.

Het mikpunt is standaard het midden van `[data-figma-root]`, en dat werkt
zolang de root zelf de stijl draagt. Bij CheckboxOption niet: de hover- en
active-stijlen hangen aan het `<input>`, dat over de control heen ligt, terwijl
het midden van de root in de labeltekst valt. Een input is een sibling van de
control en geen ancestor, dus hoveren op de tekst levert daar geen enkele
toestand op. `pseudoTarget: '.dsn-checkbox__input'` op de matrix richt de muis
dan op de laag die de toestand wél heeft. Bij Checkbox zelf is dat niet nodig:
de root is 24x24 en het midden daarvan is de input.

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

### Geneste componenten worden instances

Een CheckboxOption bevat een Checkbox, een Alert een Heading en een Paragraph,
een ModalDialog een Button. Zolang die subbomen opnieuw gemeten en nagebouwd
worden, kunnen ze stil uit elkaar lopen met het component dat ze voorstellen:
bij Checkbox gebeurde dat al met een overgetypt vinkje. Als instance volgt de
laag zijn set, en werkt een wijziging aan Heading overal door. Het patroon is
hetzelfde als bij de iconen, maar dan voor elke set uit de bibliotheek, en op
elke diepte: Checkbox in CheckboxOption in CheckboxGroup.

`src/instances.js` doet dat in drie stappen.

**1. Herkennen.** Een element waarvan een klasse precies een `cssBlock` uit
`components-html/manifest.json` is, ís dat component: `dsn-checkbox` binnen
een `dsn-checkbox-option`. Dat is geen raden op klassenaam.
`dsn-checkbox__control` is een BEM-element en geen blok, en matcht dus niet;
een `dsn-card__image-placeholder` blijft daarom ook een gemeten laag. De
layoutcomponenten en `dsn-icon` doen niet mee: de eerste hebben bewust geen
set, en een icoon heeft al zijn eigen route via `data-icon`.

Wat niet in de klassen te zien is, wijst de matrix aan:

| Attribuut                                   | Wanneer                                                                 |
| ------------------------------------------- | ----------------------------------------------------------------------- |
| `data-figma-instance="dsn-heading"`         | het component is niet aan een eigen element te herkennen (HeadingGroup) |
| `data-figma-variant="appearance=heading-3"` | de variant is uit de meting niet eenduidig te bepalen                   |
| `data-figma-instance="none"`                | dit element is bewust een eigen laag en geen instance                   |

HeadingGroup is het voorbeeld van de eerste. De Heading is daar de root zelf
(`<h2 class="dsn-heading … dsn-heading-group">`) en de tekst hangt direct in
die `<h2>`; er is geen kind met `dsn-heading` om te herkennen. De matrix zet
daarom `data-figma-instance` op een span om de tekst.

**2. De variant kiezen.** Uit de klassen is die niet altijd af te lezen: of een
Checkbox aangevinkt is zit in het `<input>`, en hover is een pseudo-toestand.
De subboom wordt daarom gewoon gemeten, en daarna vergeleken met elke variant
van de doelset. De variant met de minste verschillen wint. Twee varianten die
even dichtbij zitten maar wel van elkaar verschillen laten de build stoppen:
dat is een gok, en die hoort niet stil in een library te belanden. Een
subboom met een andere opbouw dan elke variant (een ander aantal lagen,
een ander icoon) stopt de build ook, want daar is geen override op te leggen.

Dat vergelijken is de reden dat de build nu eerst álle matrices meet en pas
daarna omzet: een samenstelling heeft de spec van zijn doelsets nodig, en
welke dat zijn blijkt pas uit de meting.

**Een vaste breedte gelijk aan de natuurlijke breedte is geen vaste breedte.**
Staat een instance in de host op FIXED, en is die breedte precies wat het
component zelf op HUG meet, dan hugt de instance. De knoppen in de footer van
ModalDialog stonden anders op een vaste 129px, gemeten mét de chevrons die in
Figma via `showIconStart` en `showIconEnd` uit staan.

**Een ander token weegt lichter dan een andere waarde.** Bij het kiezen van
een variant telt een verschil in waarde zwaarder dan dezelfde waarde aan een
ander token. Een kop met eigen tokens die op de maat van `heading-4`
uitkomen, hoort bij `heading-4`, niet bij een variant die net zo veel tokens
deelt maar een andere maat heeft. De eigen tokens gaan dan als override mee,
zodat de laag aan het token van de host blijft hangen.

**Wat (nog) geen variant heeft, blijft gemeten.** De sluitknop van ModalDialog
is icon-only, en daar heeft de Button-set geen variant voor (issue #451). Hij
draagt `data-figma-instance="none"`.

**3. Overrides.** Wat na die keuze nog verschilt, gaat als override mee: per
laag, met het pad zoals het in Figma staat. Een component dat tot één
tekstlaag inklapt (Heading, Paragraph) krijgt in de plugin een frame om zich
heen, dus de tekst zit dan op `[0]` binnen de instance. De bindingen in die
overrides zijn tijdens het meten al geverifieerd, dus de eigenschap uit
DR-2026-06 blijft staan: een misrekening kan een binding missen, maar geen
verkeerde leggen.

De maat en de plek van de instance komen uit de host. Staat een Heading in de
host op FILL, dan krijgt zijn tekstlaag ook een FILL-override, anders breekt
de tekst niet af.

Een instance van een set met eigen component properties is **exposed**: de
`label` van de Heading staat dan in het paneel van de HeadingGroup. De host
declareert die properties dus niet opnieuw.

#### Volgorde

Elke spec met instances draagt `componentSet.dependsOn`: de sets die er al
moeten staan, met hun pagina. De build zet de matrices zelf in die volgorde.
De plugin weigert een set waarvan een doelset nog niet in het bestand staat,
en de UI sorteert bestanden die tegelijk binnenkomen op dezelfde volgorde.

Een gefilterde build (`build-components heading-group`) haalt de doelsets uit
een eerdere build in `dist/`. Ontbreekt er één, dan bouw die matrix eerst.

#### Per matrix aan te zetten

Een matrix gaat pas op instances met `instances: true`. Zolang dat er niet
staat, blijft alles gemeten en meldt de build wat er een instance zou kunnen
worden:

```
   CheckboxGroup  …
                  nog gemeten, kan instance worden: dsn-checkbox, dsn-checkbox-option, dsn-option-label
```

Dat staat ook in de spec, als `instanceCandidates`. Zo kan het patroon per
component aan, en is in Figma te bevestigen dat het werkt voordat de hele
bibliotheek omgaat. HeadingGroup, Alert, Note, FormField, ModalDialog, de
drie lijsten en de ketens van Checkbox en Radio (Option en Group) staan erop.

**De matrix rendert de opbouw van het component, niet een kortere versie.**
FormFieldLabel heeft in zijn eigen set een suffix-laag die via `showSuffix`
standaard uit staat. Liet de FormField-matrix die laag weg, dan verschilde de
opbouw en stopte de build. Met de suffix erbij koppelt het label zonder
verschillen, en staat de suffix in de instance uit, net als in de losse set.

**Breedte kiest geen variant.** De varianten van `inlineSize` bij TextInput
verschillen alleen in breedte, en breedte hoort bij de plek in de host, dus de
vergelijking kijkt er niet naar. Zonder markering zou de eerste variant in de
lijst winnen. FormField zet daarom `data-figma-variant="inlineSize=auto"` op
het veld; de rest van de variant (invalid, state) komt nog steeds uit de
meting.

Bij Alert en Note komt er geen enkele kleur- of typografie-override mee, en
dat klopt: `heading.css` en `paragraph.css` zetten hun kleur met hun eigen
tokens, en Alert en Note overschrijven die niet. Alleen de FILL op de
tekstlaag gaat mee, zodat de tekst in de cel afbreekt.

**Sizing is een override, geen andere opbouw.** In een losse CheckboxOption
hugt het label, in een CheckboxGroup vult het de breedte. Dat is dezelfde
CheckboxOption op een andere plek. Bij het vergelijken telt de sizing van een
geneste instance daarom niet mee, en wat verschilt gaat als override op de
laag binnen die instance, met het pad erdoorheen: `[1, 0]` is de tekst in het
label in de optie.

**De variant komt uit de meting, ook voor pseudo-toestanden.** De hover van
een CheckboxOption hangt aan het `<input>` van zijn Checkbox, en de vergelijking
koppelt die zonder markering aan `interaction=hover` van de Checkbox-set.

`dependsOn` noemt alleen wat er werkelijk in de set staat. Een CheckboxGroup
hangt af van `dsn-checkbox-option`; de Checkbox zit binnen die instance en is
een afhankelijkheid van die set. De volgorde klopt via de keten.

Zet een keten **van onderaf** aan. In een CheckboxGroup op instances wordt ook
de Checkbox binnen elke optie een instance, en dan moet de CheckboxOption-set
zelf ook al instances van Checkbox bevatten: anders verschilt de opbouw en
stopt de build.

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
  fonts: ['https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;700'],
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
- **`data-figma-value` en `data-figma-placeholder`** op een tekstveld maken er
  een tekstlaag van, zie "Tekst in een tekstveld".
- **`skipVariant(combination)`** laat combinaties weg die niets betekenen. Een
  uitgeschakelde knop heeft geen hover, en een veld is niet tegelijk `disabled`
  en `invalid`. `skipFlagCombinations` in `src/flags.js` bouwt zo'n functie.
- **`optional: true`** op een component property laat hem alleen hangen in de
  varianten die de laag hebben. Zonder is een property die niet in elke variant
  een laag heeft een fout.
- **`instances: true`** maakt van geneste componenten instances in plaats van
  gemeten lagen; zie "Geneste componenten worden instances".
- **`data-figma-children="slot"`** zet de kinderen van een element in een
  Figma-slot, zodat een designer er zelf items of opties bij zet of uit haalt;
  zie "Slots".
- **`warnings`** zet een vaste waarschuwing in de spec, voor een beperking die
  de generator zelf niet kán zien. `::file-selector-button` is het voorbeeld:
  de knop van FileInput is een pseudo-element en dus geen DOM-node, dus er valt
  niets te meten en niets in de meting valt daarover op te merken.
- **`partOf`** maakt van de set een onderdeel van een ander component: hij
  staat op de pagina daarvan en heet in Figma `__{element}`, zodat Figma hem
  niet publiceert. Zie "Onderdelen van een component".
- **`data-figma-marker-slot`** op een list item hangt een component property
  aan de markerlaag die de extractor tekent. Die laag heeft geen element in de
  markup, dus `data-figma-slot` kan er niet op. OrderedListItem gebruikt het
  voor `number`; zie "Markers van lijsten".

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
Een `iconOnly`-as staat nu als
[#451](https://github.com/jeffreylauwers/design-system-starter-kit/issues/451)
op de backlog.

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

Vijftien fluid waarden hangen van theme én viewport af en zijn daarom op 1440px
vastgeprikt (zie "Fluid typografie en spacing"). De matrices meten op 360px. De
verificatie uit DR-2026-06 vergelijkt beide, ziet een verschil, en weigert de
binding.

Dat is het systeem dat werkt zoals bedoeld, maar het gevolg is wel dat die
waarden in Figma een vaste waarde houden. In de huidige build raakt het de vier
`padding-*-with-icon`-tokens van Select, SearchInput, DateInput en TimeInput:
175 bindingen.

Zichtbaar in de build als:

```
padding-left  de waarde van het token (55) wijkt af van de gemeten 44 (search-input/padding-inline-start-with-icon)
```

Dit hoort bij issue #328. Zolang die openstaat is het geen regressie maar een
bekende post.

### Pseudo-elementen komen niet mee, op `::marker` na

De extractor loopt de DOM af, en een pseudo-element is geen DOM-node. Op twee
plekken staat dat als vaste `warnings`-regel in de matrix, in plaats van dat
het stil blijft:

| Pseudo-element           | Component           | Wat ontbreekt             |
| ------------------------ | ------------------- | ------------------------- |
| `::file-selector-button` | FileInput           | de knop "Bestand kiezen"  |
| `::backdrop`             | ModalDialog, Drawer | de verduistering erachter |

`::marker` was de derde. Die tekent de extractor nu zelf als laag, omdat een
marker één teken is dat uit de computed style en de positie van het item volgt;
zie "Markers van lijsten". Een knop met een eigen rand en padding of een
verduistering over het hele viewport valt zo niet na te tekenen.

### Markers van lijsten

Een `<li>` met een bolletje of nummer heeft in de DOM geen element voor dat
teken: het is `::marker`. `getComputedStyle(li, '::marker')` geeft wel de kleur
en de maat, en de tokenlezer kent de regel `.dsn-unordered-list ::marker`. De
extractor maakt daaruit een laag, en het item wordt in Figma een rij:

```
li                    HORIZONTAL
├── marker            HUG, minWidth = inspringing van de lijst, rechts uitgelijnd
│   └── Tekst "1."    kleur gebonden aan ordered-list/marker-color
└── Tekst "Tekst"     FILL
```

- **De inspringing verhuist naar het item.** In de browser staat de marker in
  de `padding-inline-start` van de lijst. In Figma is die padding de `minWidth`
  van de markerkolom, met hetzelfde token, en heeft de lijst zelf geen padding
  meer. Anders sprong alles twee keer in.
- **Het teken komt uit `list-style-type`.** `content` geeft voor een marker
  alleen `normal` terug. `disc` wordt `•`, `decimal` het rangnummer met een
  punt, en `start`, `reversed` en `value` tellen mee zoals in de browser. Een
  type dat de generator niet kent levert een melding op, geen verzonnen teken.
- **De spatie na het teken is padding.** De browser zet het teken plus een
  spatie tegen de tekst. Die spatie is de `paddingRight` van de kolom, los
  gemeten, zodat elk item dezelfde waarde heeft en een instance geen override
  krijgt alleen omdat "1." en "2." anders kernen.
- **Een genest item draagt de inspringing van de lijsten erboven.** Een matrix
  die een geneste lijst rendert en het diepste item meet, krijgt die
  inspringing als padding, met het padding-token van elke lijst. Het eerste
  niveau erboven is de padding van het item zelf; elk volgend niveau is een
  frame `indent` om marker en tekst heen. Zo komt `level` bij
  UnorderedListItem en OrderedListItem tot stand:

  ```
  level=1   li                      [marker] [Tekst]
  level=2   li (padding)            [marker] [Tekst]
  level=3   li (padding) > indent (padding) > [marker] [Tekst]
  ```

  Bewust geen lege laag die alleen uit padding bestaat. Zo'n laag kan in Figma
  niet om zijn padding huggen en bleef op de standaardmaat van 100 bij 100
  staan. Een frame met inhoud hugt wel, en volgt dus het token.

Dit geldt voor elke `<li>` met een marker, niet alleen voor de lijsten zelf:
TableOfContents en PageFooter hebben er ook bolletjes door gekregen.

`IconList` gebruikt dit niet. Die zet `list-style: none` en tekent zijn
markering met een echt `<svg>`.

#### Lijsten bestaan uit list items

UnorderedList, OrderedList en IconList bestaan uit instances van één list
item, dat in Figma `__item` heet en op de pagina van zijn lijst staat (zie
"Onderdelen van een component"). De items staan in een slot, met drie als
standaardinhoud; een designer zet er zelf items bij of haalt ze weg (zie
"Slots"). De tekst zet hij per item in het paneel van dat item.

| Item                                                    | Varianten       | Properties             |
| ------------------------------------------------------- | --------------- | ---------------------- |
| `__item` van UnorderedList (`dsn-unordered-list__item`) | `level` 1, 2, 3 | `label`                |
| `__item` van OrderedList (`dsn-ordered-list__item`)     | `level` 1, 2, 3 | `label`, `number`      |
| `__item` van IconList (`dsn-icon-list__item`)           | geen            | `label`, `icon` (swap) |

- **Het nummer is een property.** In de browser volgt het uit de plek van het
  item; een instance weet niet waar hij staat. De OrderedList zet 1 tot en met
  3 neer, als override op de markerlaag. Wie een item toevoegt of weghaalt,
  nummert zelf door.
- **Het icoon van IconList is een swap, geen as.** Welk icoon er staat
  verandert geen token, alleen welke laag er staat. De `icon`-as die IconList
  had is daarmee weg.
- **Een geneste OrderedList begint weer bij 1.** Zo zet de CSS het: elk niveau
  heeft zijn eigen `decimal`-teller. `level` verandert dus alleen de
  inspringing, ook bij UnorderedList, waar het bolletje op elk niveau `disc`
  blijft.

Een item is geen `cssBlock` uit de manifest (een kale `<li>`, of bij IconList
het BEM-element `dsn-icon-list__item`), dus de generator herkent hem niet
vanzelf. `data-figma-instance` wijst hem aan.

### Disabled en invalid zijn eigen assen

In code is `disabled` geen waarde van een toestand maar een eigen schakelaar:
een veld kan tegelijk hover en invalid zijn. Zolang ze waarden van de
`state`-as waren, moest een designer kiezen.

`disabled` en `invalid` zijn daarom eigen assen met `false` en `true`. Figma
toont een as met precies die twee waarden als schakelaar, dus in het properties
panel is het verschil met een boolean er niet. Een echte BOOLEAN-property kan
het niet zijn: die toont of verbergt alleen een laag, en deze toestanden
veranderen kleuren en randen.

Zonder meer zou elke as het aantal varianten verdubbelen met standen die niemand
kiest, zoals hover én disabled. `skipVariant` laat die weg: een vlag staat
alleen aan met de andere assen in hun basisstand, en twee vlaggen tegelijk
bestaan niet. Daardoor blijft het aantal varianten gelijk aan wat het met de
oude `state`-as was.

Dit geldt voor Button, Link, de zeven formuliervelden, FormField,
DateInputGroup, OptionLabel, Checkbox, Radio, CheckboxOption en RadioOption.

### Een matrix zonder assen

Een component set in Figma moet minstens één variant-as hebben. Een component
dat niets heeft dat per variant verschilt kreeg daarom een kunstmatige as
(`appearance: ['default']`), en die stond in het panel als een keuzelijst met
één optie: een property waar een designer niets aan kan doen.

Zo'n matrix laat `axes` nu gewoon weg. De spec levert dan één component zonder
variant-properties, en de plugin maakt daar geen set van maar een los
component. Het staat in een frame met dezelfde naam, want een set is zelf de
plaat waar zijn varianten op staan en een los component heeft die plaat nodig
om in `start-dark` niet onleesbaar op het grijs van Figma te vallen. De
component properties hangen aan het component zelf; het frame eromheen is geen
component en kan ze niet dragen.

Dit geldt voor PreHeading, Logo, FormFieldLabel, FormFieldDescription en
FormFieldErrorMessage. De omschakeling kost eenmalig de instances van die vijf:
een set en een component zijn in Figma verschillende node-types, dus de oude
set kan niet bijgewerkt worden en wordt verwijderd. De plugin meldt dat met
zoveel woorden.

### Een variant met andere assen wordt verwijderd

Varianten die uit de spec verdwijnen blijven staan, met een waarschuwing: ze
weggooien detacht elke instance ervan, en dat is een beslissing van een mens.

Op één geval geldt dat niet, en dat is geen voorzichtigheid maar een kapotte
set: een variant die andere assen draagt dan de spec. Figma eist dat elk kind
van een set precies dezelfde variant-properties heeft. Een kind met een as die
niet meer bestaat, of zonder een as die erbij gekomen is, zet de set in een
fouttoestand, en dan gooit `componentPropertyDefinitions` eruit en komen de
component properties er die import niet op. Zichtbaar geweest bij
FormFieldLabel: na het verdwijnen van de as `suffix` hielden twee oude
varianten de set stuk.

### Een blok dat met zijn eigen inhoud meegroeit

Een component dat in CSS een blok is pakt de volle breedte van de meetwrapper.
Die breedte is `wrapperStyle` en zegt niets over het component, maar in Figma
staat het frame er wel op vast: 328px, ook als er "Tekst" in staat.

`hugRoot: true` op de matrix zet de root in de breedte op HUG. Het frame groeit
dan mee met de tekst die de designer zelf typt. Een kind dat de wrapperbreedte
precies vulde stond op FILL, en FILL in een HUG-ouder weigert Figma; die
kinderen gaan mee naar HUG.

Daarmee vervalt ook de reden voor een as op de tekstlengte. CheckboxOption,
RadioOption, FormFieldDescription en FormFieldErrorMessage hadden een
`length`-as met een korte en een lange variant; die laten op HUG hetzelfde zien
met één variant. NumberBadge had om dezelfde reden een `count`-as: het frame
hugt om zijn tekst en houdt zijn `minWidth`, dus wie "99+" typt ziet de pilvorm
in dezelfde variant.

Een root die tot één tekstlaag inklapt (FormFieldDescription) groeit al met zijn
inhoud mee; daar doet de vlag niets. Een root zonder auto layout kan niet huggen
en levert een waarschuwing op.

### De plaatsingsstand van een grid heet ROW_AUTO_FLOW

Figma's `gridItemsPositioning` kent precies twee waarden: `MANUAL` en
`ROW_AUTO_FLOW`. Die laatste doet wat `grid-auto-flow: row` doet. Een andere
waarde (`AUTO` leek logisch) wordt door de API geweigerd, en dat gooit tijdens
het bouwen: bij PageFooter bleef er één variant van de vier staan en bij
DataList een halve set. De mock dwingt de enum nu af, de plugin maakt er een
waarschuwing van in plaats van het einde van de import, en de smoke test
controleert dat de stand ook echt op de node landt.

### Een rotatie uit de CSS

Een `transform: rotate()` werd niet gemeten, dus de chevron van Details wees in
de open en de dichte variant dezelfde kant op. De extractor leest `transform`
nu mee en `rotationFrom` haalt er de hoek uit.

De browser geeft een matrix terug en niet de geschreven functie. Uit
`matrix(a, b, c, d, e, f)` is de hoek `atan2(b, a)`, met de klok mee omdat de
y-as van het scherm omlaag loopt; Figma rekent de andere kant op, dus het teken
klapt, en een halve draai wordt 180 in plaats van -180. Zit er schaal of skew
in de matrix, dan komt er een waarschuwing in plaats van een halve vertaling.

De plugin zet de rotatie ná de sizing: `resize` rekent langs de assen van de
node zelf, dus een node die al gedraaid staat krijgt zijn gemeten maat op de
verkeerde as.

### Kinderen die met het component meerekken

`fillRootChildren: true` zet de directe kinderen van de root in de breedte op
FILL. Bij Details rekt anders niets mee: de summary is in CSS
`width: fit-content` en de content houdt een eigen `margin-inline-start`, dus
beide komen op een vaste breedte in de spec en een designer die het component
breder trekt houdt een summary van 88px over.

Dat is bewust geen nageleefde CSS maar een keuze voor de bibliotheek, en er
hangt een prijs aan: een auto-layout kind heeft in Figma geen marges, dus de
randlijn van de content staat op de linkerrand van het component en niet onder
het midden van de chevron.

### Een veld met een icoon wordt één frame

In de DOM is een SearchInput een wrapper met een absoluut geplaatst icoon en
daaronder het veld, dat met een extra `padding-inline-start` ruimte voor dat
icoon vrijhoudt. Eén op één vertaald levert dat in Figma drie lagen op waarin
het icoon achter het veld verdwijnt, en tekst die langer wordt schuift niets
op.

`mergeAdornments: true` op de matrix maakt er één frame van: het veld levert
zijn achtergrond, rand, radius en bindingen, en het icoon of de knop komt als
gewoon kind in een horizontale auto layout te staan. De volgorde en de ruimte
komen uit de meting: de padding is de afstand van de rand tot het eerste kind,
`itemSpacing` de afstand ertussen. Alleen de zijde met versiering wordt
herrekend; de andere houdt de padding van het veld, en daarmee zijn binding.

Staat de versiering achter de tekst (Select, DateInput, TimeInput), dan vult de
tekst de rij en lijnt de versiering rechts uit. Staat hij ervoor (SearchInput),
dan hugt de tekst. Een variant zonder versiering, zoals de disabled-stand van
Select, wordt hetzelfde frame zonder die laag, zodat alle varianten dezelfde
opbouw houden.

De set heet in die gevallen naar het component en niet naar de wrapper-div:
`setName: 'dsn-select'` in plaats van `dsn-select-wrapper`.

### Tekst in een tekstveld

Een tekstveld heeft geen tekst in de DOM. Een ingevulde waarde is een
eigenschap van het `<input>`, en de placeholder is `::placeholder`. Zonder meer
kwam het veld in Figma daarom als leeg frame binnen, en kon een designer er
geen tekst in zetten.

De vijf tekstvelden (TextInput, TextArea, SearchInput, DateInput en TimeInput)
krijgen daarom twee assen, `showValue` en `showPlaceholder`, met `false` en
`true`. Figma toont zo'n as als schakelaar. Het zijn assen en geen booleans,
want de placeholder heeft een andere kleur dan de waarde, en een boolean kan
alleen een laag aan- of uitzetten. Select hoort er niet bij: die toont een
gekozen optie, geen getypte waarde of placeholder.

De matrix zet `data-figma-value` of `data-figma-placeholder` op het veld, en de
extractor maakt daar een tekstlaag van in het contentvlak:

| Variant                | Tekstlaag                                                        |
| ---------------------- | ---------------------------------------------------------------- |
| beide `false`          | geen; het veld is leeg, gelijk aan de variant van vóór de assen  |
| `showValue=true`       | de waarde, in de stijl en met de tokens van het veld             |
| `showPlaceholder=true` | de placeholder, in de stijl en met de tokens van `::placeholder` |
| beide `true`           | de waarde, want in de browser verbergt een waarde de placeholder |

Om de placeholder te binden leest de cascade-lezer ook regels voor
`::placeholder`. DateInput en TimeInput hebben geen placeholder die de browser
zo tekent: hun formaathint (`dd-mm-jjjj`, `--:--`) staat in de tekstkleur van het
veld, dus daar krijgt de hint de stijl van het veld zelf.

De tekst zelf komt uit twee TEXT-properties, `value` en `placeholder`. Die zijn
**optioneel**: ze hangen alleen in de varianten waar die laag bestaat.

De tekstlaag **hugt**, en het veld eromheen krijgt `clipsContent`. Te lange
tekst loopt daarmee het veld uit en wordt afgeknipt, precies zoals in de
browser: een `<input>` groeit niet mee en breekt niet af. De tekst staat
verticaal gecentreerd en links, zoals de browser hem ook zet.

TextArea doet dit alles níet. Daar breekt tekst wél af en groeit hij naar
beneden, dus de tekstlaag houdt FILL, lijnt bovenaan uit en het veld houdt zijn
gemeten hoogte: die komt uit `rows` en niet uit de tekst.

Het aantal varianten gaat daarmee maal vier: TextInput van 35 naar 140. Bij een
herimport gaat een bestaande variant over in de variant met beide assen op
`false`, dus geplaatste instances blijven aan hun variant hangen. Zie
"Hoe een component set wordt bijgewerkt" in de README van de plugin.

## Welke componenten wel en niet een matrix krijgen

De regel: **elk component uit `components-html/manifest.json` krijgt een
matrix, behalve wat hieronder staat.** Wat er af is, staat in `src/matrices/`;
dat is de lijst, niet een tabel in dit bestand die naast de code kan gaan
staan.

Een component overslaan is een besluit en geen achterstand, dus het staat hier
met naam en reden.

Andersom kan ook: een matrix voor iets dat in code geen eigen component is.
Dat zijn de list items; zie "Onderdelen van een component".

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

## Slots

Een slot is de plek in een Figma-component waar een designer zelf lagen bij
zet of uit haalt, in een instance, zonder te detachen. Voor een lijst of een
groep is dat precies wat een variant-as niet kan: hoeveel items of opties er
staan, is geen keuze uit een vast rijtje.

De matrix wijst het aan met `data-figma-children`, op het element waarvan de
kinderen in het slot horen. De waarde is de naam van het slot, en daarmee van
de property in het paneel. `data-figma-slot` was al bezet: dat wijst de laag
aan waar een component property aan hangt.

```html
<ul class="dsn-unordered-list" data-figma-root data-figma-children="slot">
  <li data-figma-instance="dsn-unordered-list__item">…</li>
</ul>
```

Wat er in Figma mee kan en niet kan, is eerst gemeten in Figma Desktop (issue
[#450](https://github.com/jeffreylauwers/design-system-starter-kit/issues/450)),
en daar volgt de opbouw uit:

- **De root van een component kan geen slot zijn.** Staat de markering op de
  root (de lijsten, CheckboxGroup, RadioGroup), dan komt er binnen de root een
  frame `slot`. Dat neemt de richting en de tussenruimte van de root over,
  met de binding; de root houdt zijn padding.
- **Een kind van de root kan zelf het slot zijn.** Zo zijn de body en de
  footer van ModalDialog de slots `body` en `footer`, elk met hun eigen
  padding; de footer houdt ook de lijn erboven. De header is bewust geen
  slot: in code zet ModalDialogHeader de sluitknop er altijd zelf in, en een
  slot zou toelaten dat een designer die weghaalt.
- **Dieper niet.** Bij een tweede import bouwt de plugin een variant van
  binnen opnieuw op. Wat een designer in het slot van een instance zette
  blijft alleen staan als het slot zelf blijft staan, en een slot in een frame
  dat opnieuw wordt opgebouwd krijgt een ander pad. De generator weigert een
  dieper slot daarom met een fout.
- **Geen grid.** Figma weigert een slot met grid-layout, en de generator ook.
- **Geen exposed instances.** Een instance in een slot kan in Figma niet
  exposed zijn. De `label` van een item staat dus niet in het paneel van de
  lijst maar in dat van het item zelf. Een bewuste prijs: het slot is meer
  waard dan het doorzetten van de tekst.

Met een slot vervalt de as die het aantal regelde: `options` bij CheckboxGroup
en RadioGroup, `footer` bij ModalDialog. Die drie zijn daarmee een los
component, net als de lijsten.

## Onderdelen van een component

Sommige sets bestaan alleen om in één ander component te staan. Het item van
een lijst is het voorbeeld: in code is een lijst een `<ul>` met kale
`<li>`-elementen, in Figma moet hij uit instances van één item bestaan, en
daar is een set voor nodig. Een afnemer van de bibliotheek plaatst zo'n item
nooit los; hij gebruikt de hele lijst.

Zo'n matrix draagt `partOf` en een `setName` met een BEM-element:

```js
export default {
  component: 'UnorderedListItem',
  setName: 'dsn-unordered-list__item',
  partOf: 'UnorderedList',
  // ...
};
```

Daaruit volgt de rest:

- **De naam in Figma is `__item`.** Het BEM-element met `__` ervoor. Figma
  publiceert een component waarvan de naam met `_` begint niet naar de
  bibliotheek, dus afnemers zien hem niet in hun assets. Binnen dit bestand
  werkt hij gewoon, en de instances in de lijst volgen hem.
- **Hij staat op de pagina van zijn component**, links ervan.
- **De setnaam blijft intern de sleutel.** `__item` staat op de pagina van
  elke lijst, dus de generator wijst het item aan met de volledige naam
  (`data-figma-instance="dsn-unordered-list__item"`), en de spec draagt die
  als `key`. De plugin zoekt zo'n set alleen op zijn eigen pagina: op een
  andere pagina is `__item` een ander item.
- **Geen entry in de manifest.** Het is in code geen component.

## Wat de generator niet levert

Thumbnails, en de booleans die gemeten tokens veranderen (`iconOnly`, `loading`,
`fullWidth` bij Button). Die blijven handwerk in Figma.
