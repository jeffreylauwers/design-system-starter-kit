/**
 * Bewerkingen op de omgezette boom van een hele variant, ná het omzetten.
 *
 * Sommige beslissingen kunnen pas genomen worden als de hele boom er staat:
 * of een ouder hugt, welke grid-tracks hun item precies omvatten, of een veld
 * met zijn versiering één frame wordt. Welke daarvan een matrix aanzet, staat
 * in de matrix (`mergeAdornments`, `hugRoot`, `fillRootChildren`,
 * `absoluteConstraints`).
 */

import { px, round } from './values.js';

/**
 * Meldt een schaduw met spread op een frame dat niet clipt; Figma tekent die
 * spread niet. Op de opgeleverde boom, want een tussenlaag kan nog opgaan in
 * een frame dat wel clipt (het veld en het icoon van Select).
 */
export function checkSpreadClip(node, warnings, label) {
  const spreads = (node.effects ?? []).some((effect) => effect.spread);
  if (spreads && !node.clipsContent && node.type !== 'INSTANCE') {
    warnings.push(
      `${label} > ${node.name}: de schaduw heeft een spread, maar clip content kan niet aan zonder lagen af te snijden; Figma tekent de spread dan niet`
    );
  }
  for (const child of node.children ?? []) {
    checkSpreadClip(child, warnings, label);
  }
}

/**
 * Een instance op FILL in een ouder die op HUG staat, krijgt zijn eigen breedte.
 *
 * Het veld in DateInputGroup vult in de browser zijn kolom, maar de kolom is
 * zo breed als het veld: de breedte komt van het veld (`inline-size-xs`), niet
 * van de kolom. Gemeten is dat niet te onderscheiden, dus kwam de instance op
 * FILL, en in een HUG-ouder rekent Figma dan niet met de breedte van het
 * component. Daar stonden de velden op de verkeerde breedte, tot een designer
 * "reset size" koos. Een vaste breedte gelijk aan de gemeten breedte is
 * precies wat die reset doet.
 *
 * Alleen in de breedte en alleen voor instances: een tekstlaag op FILL breekt
 * af op de breedte die de andere kinderen geven, en dat is wat hij moet doen.
 */
export function fixInstancesInHuggingParents(node) {
  if (node.type === 'INSTANCE') return;
  for (const child of node.children ?? []) {
    if (
      node.layoutSizingHorizontal === 'HUG' &&
      node.layoutMode &&
      node.layoutMode !== 'NONE' &&
      child.type === 'INSTANCE' &&
      child.layoutSizingHorizontal === 'FILL' &&
      child.layoutPositioning !== 'ABSOLUTE'
    ) {
      child.layoutSizingHorizontal = 'FIXED';
    }
    fixInstancesInHuggingParents(child);
  }
}

/**
 * Een vaste grid-kolom die precies de maat van zijn item heeft, wordt HUG.
 *
 * Alert en Note schrijven `grid-template-columns: var(--dsn-alert-icon-size)
 * 1fr`. In Figma wordt de eerste kolom een vaste 30px, en een track kan niet
 * aan een variable gebonden worden. Het icoon vult die kolom, dus ook zijn
 * gebonden maat zou op `vp-large` niet breder kunnen worden dan 30.
 *
 * Komt de breedte van het item uit een token en is die gelijk aan de kolom,
 * dan bepaalt het item de kolom en niet andersom: de kolom hugt, het item
 * krijgt een vaste, gebonden breedte. Hetzelfde resultaat bij elke viewport,
 * zonder een track te hoeven binden.
 */
export function hugTracksOfSizedItems(node) {
  const tracks = node.layoutMode === 'GRID' ? node.gridColumnSizes : null;
  for (const child of node.children ?? []) {
    const index = child.gridColumnAnchorIndex;
    const track = tracks?.[index];
    if (
      track?.type === 'FIXED' &&
      (child.gridColumnSpan ?? 1) === 1 &&
      child.layoutSizingHorizontal === 'FILL' &&
      child.boundVariables?.width &&
      Math.abs(track.value - child.width) < 0.5
    ) {
      tracks[index] = { type: 'HUG' };
      child.layoutSizingHorizontal = 'FIXED';
    }
    hugTracksOfSizedItems(child);
  }
}

/**
 * Laat een maat-token winnen van meerekken, en laat een absolute laag die zijn
 * ouder bedekt de maat van die ouder volgen.
 *
 * Twee gevallen waarin een maat anders aan geen variable zou hangen:
 *
 * - Een laag met een maat-token die even breed is als zijn ouder, wordt als
 *   blok gemeten en krijgt FILL. In CSS rekt een element met een gedeclareerde
 *   maat nooit op, dus de token is de echte maat. Het icoon in Alert en Note
 *   (`.dsn-icon--xl` in `.dsn-alert__icon`) verloor zo zijn breedtebinding en
 *   schaalde alleen in de hoogte mee. Bij een vaste ouder levert FIXED met de
 *   token dezelfde maat op, en die schaalt wel mee. Een grid-ouder blijft hier
 *   buiten: daar regelt `hugTracksOfSizedItems` het via de track.
 * - Een absolute laag met `inset: 0`, zoals `.dsn-checkbox__control`, heeft
 *   geen eigen maat-token: zijn maat ís die van de ouder. Hij neemt dan de
 *   maatbindingen van die ouder over; de waarde klopt per definitie, want de
 *   twee maten zijn gelijk gemeten.
 */
export function sizeFromTokens(node) {
  const flex =
    node.layoutMode === 'HORIZONTAL' || node.layoutMode === 'VERTICAL';
  const axes = [
    ['width', 'layoutSizingHorizontal'],
    ['height', 'layoutSizingVertical'],
  ];
  for (const child of node.children ?? []) {
    for (const [field, axis] of axes) {
      if (
        flex &&
        child.layoutPositioning !== 'ABSOLUTE' &&
        child[axis] === 'FILL' &&
        child.boundVariables?.[field] &&
        (node[axis] ?? 'FIXED') === 'FIXED'
      ) {
        child[axis] = 'FIXED';
      }

      if (
        child.layoutPositioning === 'ABSOLUTE' &&
        !child.boundVariables?.[field] &&
        node.boundVariables?.[field] &&
        (node[axis] ?? 'FIXED') === 'FIXED' &&
        (child.x ?? 0) === 0 &&
        (child.y ?? 0) === 0 &&
        Math.abs(child[field] - node[field]) < 0.5
      ) {
        child.boundVariables = {
          ...child.boundVariables,
          [field]: node.boundVariables[field],
        };
      }
    }
    sizeFromTokens(child);
  }
}

/**
 * Geeft absolute lagen met een `data-figma-slot` hun constraints.
 *
 * Zonder constraints hangt een absolute laag in Figma links bovenaan: de dot
 * in de hoek van MenuButton bleef zo op zijn gemeten plek staan als een
 * designer de knop breder maakte. Net als bij `absoluteAdornments` staan de
 * constraints in de matrix en niet in de meting: de browser geeft insets terug
 * als pixels, en daaraan is niet te zien aan welke rand de laag hangt.
 *
 * @param {object} node de root van een variant
 * @param {Record<string, {horizontal: string, vertical: string}>} bySlot
 */
export function pinAbsoluteSlots(node, bySlot, label) {
  const visit = (current) => {
    const constraints = current.componentSlot
      ? bySlot[current.componentSlot]
      : undefined;
    if (constraints) {
      if (current.layoutPositioning !== 'ABSOLUTE') {
        throw new Error(
          `${label}: absoluteConstraints noemt het slot "${current.componentSlot}", maar die laag is niet absoluut gepositioneerd`
        );
      }
      current.constraints = constraints;
    }
    if (current.type !== 'INSTANCE') current.children?.forEach(visit);
  };
  visit(node);
}

/**
 * Hoe een laag zich in de layout van zijn ouder gedraagt: sizing, uitlijning
 * en positionering. Niet te verwarren met `HOST_PLACEMENT_FIELDS` in
 * `instances.js`, dat over de plek van een instance in de host gaat.
 */
const PARENT_LAYOUT_FIELDS = [
  'layoutSizingHorizontal',
  'layoutSizingVertical',
  'layoutGrow',
  'layoutAlign',
  'layoutPositioning',
  'constraints',
];

export function placementOf(spec) {
  return Object.fromEntries(
    PARENT_LAYOUT_FIELDS.filter((field) => spec[field] !== undefined).map(
      (field) => [field, spec[field]]
    )
  );
}

/**
 * Voegt een veld en zijn versiering samen tot één frame met auto layout.
 *
 * In de DOM is een SearchInput een wrapper met een absoluut geplaatst icoon en
 * daaronder het veld, dat met een extra `padding-inline-start` ruimte voor dat
 * icoon vrijhoudt. Eén op één vertaald levert dat in Figma drie lagen op waarin
 * het icoon achter het veld verdwijnt, en een designer die de tekst langer
 * maakt schuift niets op.
 *
 * Hier wordt het één frame: het veld levert zijn achtergrond, rand, radius en
 * bindingen, en het icoon of de knop komt als gewoon kind in de rij te staan.
 * De volgorde en de ruimte komen uit de meting, niet uit een aanname: de
 * padding is de afstand van de rand tot het eerste kind, en `itemSpacing` de
 * afstand tussen de kinderen.
 *
 * De tekst vult de rest van de rij zodra er versiering áchter staat (Select,
 * DateInput), zodat die rechts uitlijnt. Staat de versiering ervoor
 * (SearchInput), dan hugt de tekst, net als in een gewoon tekstveld.
 */
export function mergeAdornments(root, tree, warnings, label, pinned) {
  const domChildren = tree.children ?? [];
  const outOfFlow = (node) =>
    node.styles?.position === 'absolute' || node.styles?.position === 'fixed';
  const fieldIndex = domChildren.findIndex(
    (child) => child.kind !== 'text' && !outOfFlow(child)
  );
  const field = root.children?.[fieldIndex];
  const allAdornments = (root.children ?? [])
    .map((spec, index) => ({ spec, dom: domChildren[index] }))
    .filter(({ dom }, index) => index !== fieldIndex && dom?.rect);

  // Versiering die absoluut blijft (`absoluteAdornments`), zoals de knop van
  // DateInput: die staat buiten de stroom, op zijn gemeten plek, en blijft
  // met constraints aan de rand van het veld hangen als dat breder wordt.
  const isPinned = ({ dom }) => Boolean(pinned) && outOfFlow(dom);
  const adornments = allAdornments.filter((item) => !isPinned(item));
  const pinnedChildren = allAdornments.filter(isPinned).map(({ spec }) => ({
    ...spec,
    layoutPositioning: 'ABSOLUTE',
    constraints: pinned,
  }));

  if (!field) {
    warnings.push(
      `${label}: samenvoegen tot één frame lukt niet, er is geen veld in de wrapper gevonden`
    );
    return root;
  }

  const naam = (tree.classes?.[0] ?? field.name).replace(/-wrapper$/, '');

  // Zonder versiering valt er niets te herschikken: het veld wórdt het frame.
  // De disabled-varianten van Select en DateInput renderen geen icoon of knop,
  // en die horen dezelfde laagstructuur te houden als de rest.
  if (!adornments.length) {
    return {
      ...field,
      children: [...(field.children ?? []), ...pinnedChildren],
      name: naam,
      width: root.width,
      height: root.height,
      x: root.x,
      y: root.y,
      layoutMode: 'HORIZONTAL',
      layoutWrap: 'NO_WRAP',
      primaryAxisAlignItems: 'MIN',
      counterAxisAlignItems: 'CENTER',
      clipsContent: true,
      layoutSizingHorizontal: 'FIXED',
      layoutSizingVertical: field.layoutSizingVertical ?? 'HUG',
    };
  }

  // De tekst van het veld. Zijn rechthoek komt uit de meting; ontbreekt die
  // (een `<option>` rendert niet), dan telt het contentvlak van het veld.
  const domField = domChildren[fieldIndex];
  const contentStart = domField.rect.x + px(domField.styles?.paddingLeft);
  // Een `<option>` rendert niet en meet dus 0x0. Zo'n rechthoek zegt niets
  // over waar de tekst staat; dan telt het contentvlak van het veld.
  const measured = (rect) => (rect?.width ? rect : null);
  const contentWidth =
    domField.rect.width -
    px(domField.styles?.paddingLeft) -
    px(domField.styles?.paddingRight);

  const items = [
    ...adornments.map(({ spec, dom }) => ({
      spec,
      x: dom.rect.x,
      width: dom.rect.width,
    })),
    ...(field.children ?? []).map((spec, index) => {
      const rect = measured(domField.children?.[index]?.rect);
      return {
        spec,
        x: rect?.x ?? contentStart,
        width: rect?.width ?? contentWidth,
        isText: true,
      };
    }),
  ].sort((a, b) => a.x - b.x);

  const first = items[0];
  const last = items[items.length - 1];
  const gaps = items
    .slice(1)
    .map((item, index) => item.x - (items[index].x + items[index].width));

  const merged = {
    ...field,
    name: naam,
    width: root.width,
    height: root.height,
    x: root.x,
    y: root.y,
    layoutMode: 'HORIZONTAL',
    layoutWrap: 'NO_WRAP',
    primaryAxisAlignItems: 'MIN',
    counterAxisAlignItems: 'CENTER',
    // Alleen de zijde waar versiering staat wordt herrekend. De andere houdt
    // de padding van het veld, en daarmee ook zijn binding.
    paddingLeft: first.isText
      ? field.paddingLeft
      : Math.max(0, round(first.x - tree.rect.x)),
    paddingRight: last.isText
      ? field.paddingRight
      : Math.max(
          0,
          round(tree.rect.x + tree.rect.width - (last.x + last.width))
        ),
    itemSpacing: gaps.length ? Math.max(0, round(Math.min(...gaps))) : 0,
    clipsContent: true,
    layoutSizingHorizontal: 'FIXED',
    layoutSizingVertical: field.layoutSizingVertical ?? 'HUG',
    children: items
      .map(({ spec, isText }, index) => {
        const child = { ...spec };
        delete child.layoutPositioning;
        if (isText) {
          // Staat er versiering áchter de tekst, dan duwt FILL die naar rechts.
          child.layoutSizingHorizontal =
            index < items.length - 1 ? 'FILL' : 'HUG';
        }
        return child;
      })
      .concat(pinnedChildren),
  };

  // De padding aan een zijde met versiering is herrekend en is dus niet meer
  // de waarde van het token dat de ruimte voor dat icoon vrijhield.
  const bindings = { ...(field.boundVariables ?? {}) };
  for (const [side, oud] of [
    ['paddingLeft', field.paddingLeft],
    ['paddingRight', field.paddingRight],
  ]) {
    if (merged[side] !== oud) delete bindings[side];
  }
  merged.boundVariables = Object.keys(bindings).length ? bindings : undefined;

  return merged;
}

/**
 * Zet de directe kinderen van de root op FILL in de breedte.
 *
 * Bij Details rekt in Figma niets mee: de summary is in CSS
 * `width: fit-content` en de content houdt een eigen `margin-inline-start`,
 * dus beide komen op een vaste breedte in de spec. Een designer die het
 * component breder trekt houdt dan een summary van 88px en een content van
 * 332px over.
 *
 * Dit is bewust geen nageleefde CSS maar een keuze voor de bibliotheek. De
 * marge van de content kan niet mee: een auto-layout kind heeft in Figma geen
 * marges, dus de randlijn van de content staat op de linkerrand van het
 * component en niet onder het midden van de chevron.
 */
export function fillRootChildren(node, warnings, label) {
  if (!node.layoutMode || node.layoutMode === 'NONE') {
    warnings.push(
      `${label}: fillRootChildren kan niet, de root heeft geen auto layout`
    );
    return;
  }

  for (const child of node.children ?? []) {
    // Een absoluut kind staat buiten de stroom: FILL en ABSOLUTE zijn in Figma
    // tegenstrijdig.
    if (child.layoutPositioning === 'ABSOLUTE') continue;
    child.layoutSizingHorizontal = 'FILL';
    // De opties van een groep staan in zijn slot; die horen ook te vullen.
    if (child.type === 'SLOT') fillRootChildren(child, warnings, label);
  }
}

/**
 * Zet de root van een variant op HUG in de breedte.
 *
 * Een component dat in CSS een blok is pakt de volle breedte van de
 * meetwrapper, en die breedte zegt niets over het component zelf: hij is
 * `wrapperStyle`. In Figma is zo'n frame handiger op HUG, want dan groeit het
 * mee met de tekst die de designer er zelf in typt. Dat is de reden dat de
 * tekstlengte bij deze componenten ook geen as meer is: één variant plus HUG
 * dekt wat twee varianten eerder lieten zien.
 *
 * Een kind dat die wrapperbreedte precies vulde staat op FILL, en FILL in een
 * HUG-ouder weigert Figma. Die kinderen gaan daarom mee naar HUG.
 */
export function hugRootWidth(node, warnings, label) {
  // Een root die tot één tekstlaag inklapt groeit al met zijn inhoud mee; daar
  // is geen frame om op HUG te zetten.
  if (node.type === 'TEXT') return;

  if (!node.layoutMode || node.layoutMode === 'NONE') {
    warnings.push(`${label}: hugRoot kan niet, de root heeft geen auto layout`);
    return;
  }

  node.layoutSizingHorizontal = 'HUG';

  for (const child of node.children ?? []) {
    if (child.layoutSizingHorizontal === 'FILL') {
      child.layoutSizingHorizontal = 'HUG';
    }
  }
}
