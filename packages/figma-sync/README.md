# @dsn-starter-kit/figma-sync

Genereert Figma-input uit de bestaande bron: de tokens en de HTML/CSS-laag.
Dit package schrijft **geen** data naar Figma. Het levert twee JSON-bestanden
die een Figma-plugin inleest.

Waarom die splitsing: op een Figma Professional-plan is de Variables REST API
niet beschikbaar, dus de Plugin API is het enige schrijfpad. Door de generatie
in de repo te houden en het schrijven in de plugin, blijft alles wat naar Figma
gaat reviewbaar in een PR.

## De twee outputs

| Bestand                                   | Wordt gegenereerd door        | Bevat                                    |
| ----------------------------------------- | ----------------------------- | ---------------------------------------- |
| `design-tokens/dist/figma/variables.json` | `pnpm build:tokens`           | Variable collections, modes en aliassen  |
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
pnpm build:figma-components            # alle matrices
pnpm build:figma-components button     # één component
pnpm build:figma-plugin                # de plugin-bundle
```

De Figma-stappen staan bewust los van `build:tokens`. De token-CSS is het
hoofdproduct waar Storybook, de componenten en npm-consumenten van afhangen;
die hoort niet om te vallen door een fout in een generator die er alleen maar
naast draait. Faalt de Figma-keten, dan faalt alleen de Figma-keten.

## Hoe de componentgeneratie werkt

De CSS parsen om Figma-nodes te bouwen werkt niet: cascade, custom properties,
`clamp()` en media queries bepalen samen pas de eindwaarde. In plaats daarvan
rendert `extract.js` elke variant in een echte browser en leest de _computed_
styles uit. Dat levert meteen de flexbox-informatie op die vrijwel 1-op-1 op
Figma auto layout past:

| CSS                                | Figma                               |
| ---------------------------------- | ----------------------------------- |
| `display: flex` + `flex-direction` | `layoutMode` HORIZONTAL / VERTICAL  |
| `gap`                              | `itemSpacing`                       |
| `padding-*`                        | `padding*`                          |
| `justify-content` / `align-items`  | `primary` / `counterAxisAlignItems` |
| `display: inline-flex`             | `layoutSizingHorizontal: HUG`       |
| `display: grid` + `grid-column`    | `layoutMode: GRID` + grid anchors   |
| `position: absolute`               | `layoutPositioning: ABSOLUTE`       |
| kind vult de binnenbreedte         | `layoutSizingHorizontal: FILL`      |

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

## Wat hier bewust niet in hoort

- **Layoutcomponenten** (`Grid`, `Container`, `PageBody`, `BreakoutSection`).
  Dat is layoutgedrag zonder eigen visuele identiteit. Een designer gebruikt
  daar Figma auto layout voor, een gegenereerd "Stack-component" is een
  anti-patroon.
- **Patronen en templates.** Die componeer je in Figma uit de gegenereerde
  componenten.
- **Box shadows.** Die horen Figma effect styles te worden, geen variables.
  Ze staan daarom in het skip-report.

## Wat de generator niet levert

Component properties (boolean voor icon-slots, instance swap, text properties)
en thumbnails. Die blijven handwerk in Figma. Reken op genereren tot ongeveer
85% en een polijstslag daarna.
