# Grid

Het Grid component biedt een 12-koloms CSS Grid layout systeem met consistente gutter, margin en optionele max-width. Gebruik het samen met `GridItem` om content op een voorspelbare manier te positioneren.

## Doel

Grid legt een 12-koloms structuur vast als basis voor paginalayouts. Alle children zijn onderdeel van hetzelfde grid, waardoor kolommen altijd op één lijn staan: ook over meerdere rijen heen.

- **`Grid`**: de container die de 12 kolommen definieert
- **`GridItem`**: directe child voor kolomspanning (1–12) met responsive varianten

<!-- VOORBEELD -->

## Use when

- Je een paginabrede layout wilt structureren met kolommen
- Content naast elkaar moet staan (twee kolommen, drie kolommen, etc.)
- Je responsive kolomverdeling nodig hebt via breakpoints
- Je een sectie "edge-to-edge" wilt laten lopen binnen een `contained` grid

## Don't use when

- Je alleen verticale stapeling nodig hebt → gebruik `Stack`
- Je een kleine, component-interne layout wilt → gebruik inline CSS of `display: flex`
- De content geen kolom-gebaseerde structuur heeft

## Best practices

- Gebruik `contained` voor paginalayouts waarbij de maximale breedte bepaald wordt door `--dsn-grid-max-width`
- Gebruik geen `GridItem` als directe child niet nodig is: gewone `<div>` elementen werken ook (ze beslaan standaard de volledige breedte via `grid-column: 1 / -1`)
- Combineer `colSpan` met `colSpanMd` en `colSpanLg` voor responsive layouts die op mobiel stapelen (col-12) en breder uitkomen op grotere schermen
- Gebruik `fullBleed` alleen voor elementen die een achtergrondkleur of -afbeelding edge-to-edge willen tonen
- Nest geen `Grid` in `Grid` tenzij noodzakelijk: de gutter en margin gelden per grid-instantie

## Breakpoints

| Naam | Waarde         | Omschrijving                                    |
| ---- | -------------- | ----------------------------------------------- |
| `sm` | 36em (~576px)  | `colSpanSm` / `dsn-col-sm-*`                    |
| `md` | 44em (~704px)  | `colSpanMd` / `dsn-col-md-*`                    |
| `lg` | 64em (~1024px) | `colSpanLg` / `dsn-col-lg-*`                    |
| `xl` | 74em (~1184px) | Grens waarop `contained` grid max-width bereikt |

De breakpoint-waarden zijn ook beschikbaar als design tokens (`--dsn-breakpoint-sm` t/m `--dsn-breakpoint-xl`) voor gebruik in JavaScript (bijv. `matchMedia`). In CSS media queries zijn ze hardcoded omdat CSS custom properties niet werken in `@media` regels.

## ColStart en ColEnd

Gebruik `colStart` en `colEnd` (1–13) om een GridItem op een nauwkeurige kolompositie te plaatsen, zonder lege blinde GridItems te hoeven toevoegen. `colStart` stelt `grid-column-start` in; `colEnd` stelt `grid-column-end` in.

```html
<!-- HTML/CSS -->
<div class="dsn-grid dsn-grid--contained">
  <!-- Start op kolom 3, eindigt voor kolom 11 (8 kolommen breed) -->
  <div class="dsn-col-start-3 dsn-col-end-11">Gecentreerde content</div>

  <!-- Linkerhelft -->
  <div class="dsn-col-start-1 dsn-col-end-7">Links</div>
  <!-- Rechterhelft -->
  <div class="dsn-col-start-7 dsn-col-end-13">Rechts</div>
</div>
```

```tsx
// React
<Grid contained>
  <GridItem colStart={3} colEnd={11}>
    Gecentreerde content
  </GridItem>
  <GridItem colStart={1} colEnd={7}>
    Links
  </GridItem>
  <GridItem colStart={7} colEnd={13}>
    Rechts
  </GridItem>
</Grid>
```

Responsive varianten werken hetzelfde als bij `colSpan`: suffix `Sm`, `Md` of `Lg` voor de bijbehorende breakpoints.

```html
<!-- Volledig breed op mobiel, gepositioneerd op large -->
<div class="dsn-col-12 dsn-col-start-lg-3 dsn-col-end-lg-11">Content</div>
```

```tsx
<GridItem colSpan={12} colStartLg={3} colEndLg={11}>
  Content
</GridItem>
```

> `colEnd={13}` is geldig in een 12-kolomsgrid: het item eindigt na de laatste kolom.

## Full-bleed

Een `GridItem` met `fullBleed` (of `<div class="dsn-full-bleed">`) breekt visueel uit tot de buitenrand van de grid container. Het item beslaat de volle breedte inclusief de `--dsn-grid-padding-inline`. Dit is handig voor achtergrondvlakken die "edge-to-edge" lopen.

```html
<div class="dsn-grid dsn-grid--contained">
  <div class="dsn-col-8">Normale content</div>
  <div class="dsn-full-bleed">
    <div
      style="background: var(--dsn-color-neutral-bg-subtle); padding: 1.5rem var(--dsn-grid-padding-inline);"
    >
      Edge-to-edge sectie
    </div>
  </div>
  <div class="dsn-col-8">Vervolg content</div>
</div>
```

## Accessibility

Grid en GridItem zijn puur visuele layout utilities. Ze voegen geen ARIA-attributen of semantische HTML toe. Gebruik passende semantische elementen (`<main>`, `<aside>`, `<section>`) als wrapper of als `className`-drager.

## Design tokens

| Token                       | Standaard waarde                    | Omschrijving                                                                                                                                                                             |
| --------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--dsn-grid-gutter`         | `var(--dsn-space-column-xl)` (16px) | Horizontale ruimte tussen kolommen; 8px in information-dense                                                                                                                             |
| `--dsn-grid-row-gap`        | `var(--dsn-space-column-xl)` (16px) | Verticale ruimte tussen rijen; 8px in information-dense                                                                                                                                  |
| `--dsn-grid-padding-inline` | `0px`                               | Outer padding-inline van de grid container. Standaard 0: grids staan doorgaans binnen `dsn-page-body__inner` die al voor horizontale padding zorgt. Zet expliciet voor standalone grids. |
| `--dsn-grid-max-width`      | `74rem` (~1184px)                   | Maximale breedte bij `contained` variant                                                                                                                                                 |
| `--dsn-breakpoint-sm`       | `36em`                              | Referentiewaarde small breakpoint (niet te gebruiken in CSS @media)                                                                                                                      |
| `--dsn-breakpoint-md`       | `44em`                              | Referentiewaarde medium breakpoint                                                                                                                                                       |
| `--dsn-breakpoint-lg`       | `64em`                              | Referentiewaarde large breakpoint                                                                                                                                                        |
| `--dsn-breakpoint-xl`       | `74em`                              | Referentiewaarde extra large breakpoint                                                                                                                                                  |
