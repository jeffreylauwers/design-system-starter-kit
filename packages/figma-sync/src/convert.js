/**
 * Zet een gemeten DOM-boom om naar een Figma node spec, element voor element.
 *
 * `convertNode` en `convertElement` roepen elkaar aan (een element zet zijn
 * kinderen om), en staan daarom in hetzelfde bestand, samen met de plaatsing
 * van een kind in zijn ouder.
 */

import { bindingsFor } from './bindings.js';
import { effectsFor } from './effects.js';
import { blockOf } from './instances.js';
import {
  autoLayoutFrom,
  maxWidthFrom,
  minimumSizesFrom,
  ownAlignment,
  selfAlignment,
} from './layout-from-css.js';
import {
  cornerRadiusFrom,
  rotationFrom,
  strokesFrom,
  textStyleFrom,
} from './styles-from-css.js';
import { paintFrom, px, svgWithHexColors } from './values.js';

/** Heeft de spec afgeronde hoeken? */
function hasRoundedCorners(figmaNode) {
  return [
    figmaNode.cornerRadius,
    figmaNode.topLeftRadius,
    figmaNode.topRightRadius,
    figmaNode.bottomRightRadius,
    figmaNode.bottomLeftRadius,
  ].some((radius) => radius > 0);
}

/**
 * Vallen alle kinderen binnen dit element? Dan kan `clipsContent` aan zonder
 * iets weg te snijden dat in de browser wél zichtbaar is.
 *
 * Twee redenen om te clippen. Een afgeronde root: zonder clip steken de
 * rechthoekige secties van ModalDialog en Popover over de ronde hoeken heen.
 * En een schaduw met spread: die tekent Figma op een frame alleen met clip.
 */
function childrenWithin(node) {
  const tolerance = 0.5;
  return (node.children ?? []).every((child) => {
    if (!child.rect) return true;
    return (
      child.rect.x >= node.rect.x - tolerance &&
      child.rect.y >= node.rect.y - tolerance &&
      child.rect.x + child.rect.width <=
        node.rect.x + node.rect.width + tolerance &&
      child.rect.y + child.rect.height <=
        node.rect.y + node.rect.height + tolerance
    );
  });
}

/** Heeft dit element een schaduw? Dan klapt het niet in tot een tekstlaag. */
function hasShadow(boxShadow) {
  return Boolean(boxShadow) && boxShadow !== 'none';
}

/**
 * De naam van elke tekstlaag.
 *
 * Eén vaste naam in plaats van de klasse (`dsn-heading`) of de eerste woorden
 * van de tekst. Een designer herkent een tekstlaag aan zijn type, en een naam
 * die meeverandert met de inhoud maakt een laagpad onvoorspelbaar.
 */
const TEXT_LAYER_NAME = 'Tekst';

/**
 * De tekstlaag die de extractor onder een tekstveld heeft gezet: de ingevulde
 * waarde of de placeholder. Zie "Tekst in een tekstveld" in de README.
 */
function isFieldText(child) {
  return (
    child?.kind === 'text' &&
    (child.slot === 'value' || child.slot === 'placeholder')
  );
}

/**
 * Mag de tekst aan het eind van deze rij de resterende breedte vullen?
 *
 * In CSS is tekst in een flex-rij een item dat mag krimpen, en dus afbreekt
 * zodra hij niet meer past. In Figma breekt tekst alleen af als de laag een
 * breedte heeft: op HUG groeit hij de rij uit. FILL is daar het equivalent.
 *
 * Alleen in een rij die zelf een blok is (`flex`, geen `inline-flex`): een
 * inline rij hugt, en FILL in een HUG-ouder kan Figma niet. En alleen als de
 * rij vooraan uitlijnt, anders schuift het vullen de uitlijning op.
 */
function fillsRemainingRow(styles, layout) {
  return (
    layout.layoutMode === 'HORIZONTAL' &&
    styles.display === 'flex' &&
    (layout.primaryAxisAlignItems ?? 'MIN') === 'MIN' &&
    layout.layoutWrap !== 'WRAP'
  );
}

/**
 * Zet de plaatsing van een kind binnen zijn ouder.
 *
 * Twee gevallen die niet in de gewone auto layout-stroom passen:
 * een absoluut gepositioneerd kind (Figma: layoutPositioning ABSOLUTE) en een
 * kind met een expliciete cel in een grid (Figma: grid anchors).
 */
function applyChildPlacement(
  converted,
  child,
  parentLayout,
  warnings,
  label,
  parentContentWidth
) {
  // Een tekstlaag in een tekstveld heeft geen eigen styles, maar wel een
  // gemeten contentvlak; daarmee kan hij net als een blok FILL krijgen.
  const styles = child.styles ?? (child.rect ? {} : null);
  if (!styles) return;

  // Een absoluut kind staat buiten de auto-layout stroom, dus meerekken is er
  // niet bij: zijn maat komt uit zijn eigen insets. FILL en ABSOLUTE zijn in
  // Figma tegenstrijdig, en de control van een Checkbox is allebei tegelijk.
  const outOfFlow =
    styles.position === 'absolute' || styles.position === 'fixed';

  // Een kind dat precies de binnenbreedte van zijn ouder vult is een
  // blok-element. In Figma hoort dat FILL te zijn: met een vaste breedte
  // schaalt het niet mee als de ouder groeit. FILL kan alleen binnen een
  // auto-layout ouder; anders weigert de API het.
  if (
    !outOfFlow &&
    parentLayout.layoutMode &&
    parentLayout.layoutMode !== 'NONE' &&
    parentContentWidth !== undefined &&
    Math.abs(child.rect.width - parentContentWidth) < 1
  ) {
    converted.layoutSizingHorizontal = 'FILL';
  }

  // Een blok met een maximale breedte dat CSS in het midden zet: FILL, en de
  // `maxWidth` houdt hem op een brede pagina smal. Zie `maxWidthFrom`.
  if (
    !outOfFlow &&
    converted.maxWidth !== undefined &&
    parentLayout.layoutMode &&
    parentLayout.layoutMode !== 'NONE' &&
    parentLayout.layoutMode !== 'GRID'
  ) {
    converted.layoutSizingHorizontal = 'FILL';
  }

  // Een kind in een `fr`-kolom van een grid dat een rij werd; zie
  // `rowGridLayoutFrom`.
  if (
    !outOfFlow &&
    parentLayout.layoutMode === 'HORIZONTAL' &&
    child.gridTrack
  ) {
    // Een `auto`-kolom is zo breed als zijn inhoud: HUG, als de laag zelf
    // auto layout heeft. Anders houdt hij zijn gemeten breedte.
    if (child.gridTrack === 'FLEX') {
      converted.layoutSizingHorizontal = 'FILL';
    } else if (converted.layoutMode && converted.layoutMode !== 'NONE') {
      converted.layoutSizingHorizontal = 'HUG';
    }
  }

  // `flex-grow` in een rij is in Figma FILL: het kind neemt de ruimte die
  // over is. Zonder dit stond de kop in de header van ModalDialog op HUG en
  // schoof de sluitknop mee met de lengte van de titel.
  if (
    !outOfFlow &&
    parentLayout.layoutMode === 'HORIZONTAL' &&
    Number.parseFloat(styles.flexGrow) > 0
  ) {
    converted.layoutSizingHorizontal = 'FILL';
  }

  // Visually hidden: in de browser onzichtbaar maar er wel, voor
  // screenreaders. In Figma een verborgen laag in de stroom; een verborgen
  // laag neemt in auto layout geen ruimte in. Zo blijft het label van een
  // icon-only Button aan zijn TEXT-property hangen, als toegankelijke naam.
  if (isVisuallyHidden(styles)) {
    converted.visible = false;
    return;
  }

  if (styles.position === 'absolute' || styles.position === 'fixed') {
    // Een absoluut kind valt buiten de stroom; Figma houdt het op zijn plek
    // ten opzichte van de ouder in plaats van het mee te laten stromen.
    converted.layoutPositioning = 'ABSOLUTE';
    return;
  }

  if (parentLayout.layoutMode !== 'GRID') return;

  const columnStart = Number.parseInt(styles.gridColumnStart, 10);
  const rowStart = Number.parseInt(styles.gridRowStart, 10);

  if (!Number.isFinite(columnStart) || !Number.isFinite(rowStart)) {
    // Een kind zonder expliciete cel maar mét een span is autoplaatsing:
    // `grid-column: span 3` komt uit de browser als
    // `grid-column-start: "span 3"` met `grid-column-end: "auto"`. Dat is hoe
    // de GridItems van PageFooter werken (`colSpan=12`, `colSpanLg=3`), en
    // Figma kan dat ook: de span gaat op het kind en de ouder plaatst zelf, in
    // dezelfde leesvolgorde als `grid-auto-flow: row`.
    // Een expliciete kolom zonder expliciete rij. Zo staan de key, de value en
    // de acties in de rij van DataList: `grid-column: 1|2|3` zonder
    // `grid-row`, want de rij heeft er maar één. Heeft het grid precies één
    // rij, dan is die rij de plek; anders zou CSS-autoplaatsing nagebootst
    // moeten worden en dat is het niet waard.
    if (Number.isFinite(columnStart) && !Number.isFinite(rowStart)) {
      const columns = parentLayout.gridColumnCount ?? 1;
      const end = Number.parseInt(styles.gridColumnEnd, 10);
      const columnEnd = Number.isFinite(end)
        ? end < 0
          ? columns + 2 + end
          : end
        : undefined;
      const span =
        columnEnd !== undefined && columnEnd - columnStart > 1
          ? columnEnd - columnStart
          : 1;

      // Eén rij in het grid: dan is die rij de plek. Zo staan de key, de value
      // en de acties in de rij van DataList (`grid-column: 1|2|3` zonder
      // `grid-row`, want de rij heeft er maar één).
      if ((parentLayout.gridRowCount ?? 1) === 1) {
        converted.gridColumnAnchorIndex = columnStart - 1;
        converted.gridRowAnchorIndex = 0;
        if (span > 1) converted.gridColumnSpan = span;
        const tracks = (parentLayout.gridColumnSizes ?? []).slice(
          columnStart - 1,
          columnStart - 1 + span
        );
        if (tracks.some((track) => track.type === 'FLEX')) {
          converted.layoutSizingHorizontal = 'FILL';
        }
        return;
      }

      // Meer rijen, en dit kind pakt ze allemaal in de breedte: dat is
      // autoplaatsing over de rijen, zoals de rijen van DataList met
      // `grid-column: 1 / -1`. De span gaat mee en de ouder plaatst zelf, net
      // als bij een kind met alleen een span.
      if (span === columns) {
        converted.gridColumnSpan = span;
        converted.layoutSizingHorizontal = 'FILL';
        return;
      }
    }

    const autoSpan = /^span (\d+)$/.exec(styles.gridColumnStart ?? '');
    if (autoSpan) {
      converted.gridColumnSpan = Number.parseInt(autoSpan[1], 10);
      // Een grid-kind rekt in CSS standaard op tot zijn cel
      // (`justify-items: stretch`), dus FILL en niet de gemeten breedte: die
      // hoort bij de viewport waarop gemeten is, niet bij het component.
      converted.layoutSizingHorizontal = 'FILL';
      return;
    }

    warnings.push(
      `${label}: geen expliciete grid-cel, Figma plaatst dit kind zelf in leesvolgorde`
    );
    return;
  }

  // CSS-gridlijnen tellen vanaf 1, Figma's anchors vanaf 0.
  converted.gridColumnAnchorIndex = columnStart - 1;
  converted.gridRowAnchorIndex = rowStart - 1;

  // Een negatieve lijn telt van achteren: `-1` is de laatste lijn, dus in een
  // grid van drie kolommen is dat lijn 4. `grid-column: 1 / -1` (de rij van
  // DataList, de inhoud van Note) spant daarmee over alles.
  const lineOf = (value, count) => {
    const line = Number.parseInt(value, 10);
    if (!Number.isFinite(line)) return undefined;
    return line < 0 ? count + 2 + line : line;
  };

  const columnEnd = lineOf(
    styles.gridColumnEnd,
    parentLayout.gridColumnCount ?? 1
  );
  const rowEnd = lineOf(styles.gridRowEnd, parentLayout.gridRowCount ?? 1);
  const columnSpan =
    columnEnd !== undefined && columnEnd - columnStart > 1
      ? columnEnd - columnStart
      : 1;
  if (columnSpan > 1) converted.gridColumnSpan = columnSpan;
  if (rowEnd !== undefined && rowEnd - rowStart > 1) {
    converted.gridRowSpan = rowEnd - rowStart;
  }

  // Een kind in een grid vult zijn *cel*, niet de hele ouder. De vergelijking
  // met de ouderbreedte hierboven slaat daar dus altijd op mis; hier wordt hij
  // alsnog tegen de juiste tracks gedaan.
  const tracks = (parentLayout.gridColumnSizes ?? []).slice(
    columnStart - 1,
    columnStart - 1 + columnSpan
  );

  // Een flexibele track heeft geen pixelmaat om tegen af te zetten: wie daarin
  // staat groeit per definitie mee.
  if (tracks.some((track) => track.type === 'FLEX')) {
    converted.layoutSizingHorizontal = 'FILL';
    return;
  }

  const cellWidth = tracks.reduce(
    (total, track, index) =>
      total + track.value + (index > 0 ? parentLayout.gridColumnGap : 0),
    0
  );

  if (cellWidth > 0 && Math.abs(child.rect.width - cellWidth) < 1) {
    converted.layoutSizingHorizontal = 'FILL';
  }
}

/**
 * Zet één DOM-node om naar een Figma-node.
 *
 * @param {object} node computed DOM-node
 * @param {string[]} warnings verzamelt alles wat niet exact vertaald kon worden
 * @param {string} pathLabel leesbaar pad voor in de waarschuwing
 * @param {object} [bindings] variable-index en report, zie bindings.js
 */
export function convertNode(
  node,
  wideNode,
  warnings,
  pathLabel,
  bindings,
  options = {}
) {
  const converted = convertElement(
    node,
    wideNode,
    warnings,
    pathLabel,
    bindings,
    options
  );
  // `data-figma-slot` uit de matrix: hier hangt straks een component property
  // aan. Het reist als `componentSlot` mee tot in de plugin, die de laag erop
  // terugvindt in plaats van hem op klassenaam te moeten raden.
  if (node.slot) converted.componentSlot = node.slot;
  return converted;
}

/**
 * Geeft een subgrid-rij de kolommen van zijn ouder.
 *
 * Figma kent geen subgrid: een rij die in CSS de kolommen van de lijst
 * overneemt moet in Figma dezelfde tracks zelf dragen. De ouder is de enige
 * die ze kent, en pas nadat zijn eigen tracks bepaald zijn, dus dit gebeurt na
 * het omzetten van de kinderen.
 *
 * De kinderen van die rij hebben hun cel al gekregen, maar hun sizing is
 * bepaald toen de tracks nog leeg waren. Een kind in een flexibele track hoort
 * mee te groeien, dus die beslissing wordt hier opnieuw genomen.
 */
function resolveSubgrid(frame) {
  for (const child of frame.children ?? []) {
    if (!child.subgridColumns) continue;

    delete child.subgridColumns;
    child.gridColumnSizes = frame.gridColumnSizes;
    child.gridColumnCount = frame.gridColumnCount;

    for (const grandchild of child.children ?? []) {
      const anchor = grandchild.gridColumnAnchorIndex;
      if (anchor === undefined) continue;
      const span = grandchild.gridColumnSpan ?? 1;
      const tracks = child.gridColumnSizes.slice(anchor, anchor + span);
      if (tracks.some((track) => track.type === 'FLEX')) {
        grandchild.layoutSizingHorizontal = 'FILL';
      }
    }
  }
}

/**
 * Laat rijen aan het eind van een grid weg waar geen enkele laag in staat.
 *
 * Een Note zonder kop houdt twee rijen over terwijl er maar één gevuld is. In
 * de computed `grid-template-rows` staan ze er allebei: het icoon spant met
 * `grid-row: 1 / span 2` in de tweede, en bij de varianten met een voorlees-
 * label staat dat visueel verborgen spanje er ook nog in. Dat label haalt de
 * walker eruit (het is in Figma geen laag), maar de rij bleef staan, en in het
 * grid van Figma is dat een lege track.
 *
 * Alleen aan het eind: een lege rij tussen twee gevulde in houdt de nummering
 * overeind, en de kinderen dragen hun eigen rijnummer.
 */
function trimEmptyTrailingRows(frame) {
  const rows = frame.gridRowSizes;
  if (!rows || rows.length < 2) return;

  const used = (frame.children ?? []).reduce((max, child) => {
    if (child.gridRowAnchorIndex === undefined) return max;
    return Math.max(max, child.gridRowAnchorIndex + (child.gridRowSpan ?? 1));
  }, 0);

  if (used < 1 || used >= rows.length) return;

  frame.gridRowSizes = rows.slice(0, used);
  frame.gridRowCount = frame.gridRowSizes.length;
}

/** Zet een declaratie een maat, of krimpt hij om de inhoud? */
const INTRINSIC_SIZES = /^\s*(fit-content|max-content|min-content|auto)\s*$/;
function declaresSize(source) {
  if (!source) return false;
  return !INTRINSIC_SIZES.test(String(source.value ?? ''));
}

function convertElement(
  node,
  wideNode,
  warnings,
  pathLabel,
  bindings,
  { root = false } = {}
) {
  if (node.kind === 'text') {
    // Een kale tekstnode erft zijn stijl van de ouder; die wordt daar gezet.
    return { type: 'TEXT', characters: node.text };
  }

  if (node.kind === 'vector') {
    const vector = {
      type: 'VECTOR',
      // `iconName` komt uit `data-icon` en is het koppelstuk met de iconset.
      // Een SVG die géén icoon uit die set is (de cirkel van Spinner) valt
      // terug op zijn eigen klassenaam: "icon" zou een designer het bestand
      // laten opentrekken om te zien wat de laag voorstelt.
      name: node.iconName ?? node.classes[0] ?? 'icon',
      width: node.rect.width,
      height: node.rect.height,
      // De plugin importeert dit met figma.createNodeFromSvg().
      svg: node.shapes ? svgWithHexColors(node.svg) : node.svg,
    };
    if (node.shapes) {
      // Geen icoon: de kleuren en lijndiktes zitten per vorm, elk met een
      // eigen token. De plugin zoekt zo'n SVG niet op in de iconset.
      vector.shapes = node.shapes.map((shape) => {
        const strokes = paintFrom(shape.stroke);
        const spec = {
          type: 'SHAPE',
          name: shape.name,
          fills: paintFrom(shape.fill),
          strokes,
          // Zonder lijn is er geen dikte om te zetten of te binden.
          ...(strokes.length ? { strokeWeight: shape.strokeWeight } : {}),
        };
        spec.boundVariables = bindVariables(spec, shape.tokens, bindings);
        return spec;
      });
    } else {
      vector.fills = paintFrom(node.styles.color);
    }
    const vectorRotation = rotationFrom(
      node.styles.transform,
      warnings,
      pathLabel
    );
    if (vectorRotation) vector.rotation = vectorRotation;
    vector.boundVariables = bindVariables(vector, node.tokens, bindings);
    return vector;
  }

  const { styles } = node;

  // Wat de walker niet kon tekenen, zoals een marker in een lijststijl die de
  // generator niet kent. Hoort in de build, niet stil weg.
  for (const note of node.notes ?? []) warnings.push(`${pathLabel}: ${note}`);

  const layout = autoLayoutFrom(
    node,
    styles,
    wideNode?.styles,
    warnings,
    pathLabel
  );
  const strokes = strokesFrom(styles, warnings, pathLabel);

  // Een element dat alleen tekst bevat en zelf niets tekent, wordt in Figma
  // één TEXT-node. Zonder deze stap krijgt elke <span> een eigen frame en
  // ontstaat precies de diepe nesting die een Figma-library onwerkbaar maakt.
  const onlyChildIsText =
    node.children.length === 1 && node.children[0].kind === 'text';
  const drawsNothing =
    paintFrom(styles.backgroundColor).length === 0 &&
    !strokes &&
    !hasShadow(styles.boxShadow) &&
    px(styles.borderTopLeftRadius) === 0;

  // De markerkolom van een list item is de uitzondering: die tekent niets,
  // maar zijn breedte is de inspringing van de lijst. Ingeklapt tot tekst
  // zou hij die maat en zijn token verliezen.
  if (onlyChildIsText && drawsNothing && node.synthetic !== 'marker') {
    // Bewust zonder bindingen: de ouder overschrijft de tekststijl zo meteen
    // met de zijne, en dan zou een hier gelegde binding een andere waarde
    // aanwijzen dan er in de spec staat. De ouder legt ze.
    return {
      type: 'TEXT',
      name: TEXT_LAYER_NAME,
      characters: node.children[0].text,
      // De plek in de ouder. Alleen nodig als die ouder geen auto layout
      // heeft; zonder komt de laag daar op 0,0 te staan.
      x: node.rect.x,
      y: node.rect.y,
      ...textStyleFrom(styles, node.tokens, bindings?.index),
    };
  }

  const shadow = effectsFor(
    styles.boxShadow,
    node.tokens?.['box-shadow'],
    bindings
  );
  if (shadow.unreadable) {
    warnings.push(
      `${pathLabel}: box-shadow "${styles.boxShadow}" is niet als schaduw te lezen, niet meegenomen`
    );
  }

  const { stretchChildren, reversed, ...autoLayout } = layout;

  // Kinderen aan hun tegenhanger in de brede meting koppelen op index; beide
  // bomen komen uit dezelfde DOM en hebben dus dezelfde volgorde.
  const paired = (node.children ?? []).map((child, index) => ({
    child,
    wide: wideNode?.children?.[index],
  }));

  // Binnenbreedte van dit element: de rect min padding en randen.
  const contentWidth =
    node.rect.width -
    px(styles.paddingLeft) -
    px(styles.paddingRight) -
    px(styles.borderLeftWidth) -
    px(styles.borderRightWidth);
  const children = reversed ? [...paired].reverse() : paired;

  // Het laatste kind dat meestroomt; een absoluut kind staat buiten de rij.
  const lastInFlowIndex = children.reduce(
    (last, { child }, index) =>
      child.styles?.position === 'absolute' ||
      child.styles?.position === 'fixed'
        ? last
        : index,
    -1
  );

  // Een tekstveld met een waarde of placeholder erin. De tekstlaag hugt en
  // loopt daarmee buiten het veld zodra hij te lang is, precies zoals in de
  // browser, waar het veld de tekst afknipt en niet meegroeit. Dat afknippen
  // doet `clipsContent`. Een textarea doet dit níet: daar breekt de tekst af
  // en groeit hij naar beneden, dus die houdt FILL en lijnt bovenaan uit.
  const fieldText =
    node.tag !== 'textarea' && children.some(({ child }) => isFieldText(child));

  const figmaNode = {
    type: 'FRAME',
    name: node.classes[0] ?? node.tag,
    width: node.rect.width,
    height: node.rect.height,
    x: node.rect.x,
    y: node.rect.y,
    ...autoLayout,
    // Tekst in een veld staat verticaal gecentreerd en links, zoals de browser
    // hem zet. In een verticale auto layout is dat de hoofdas voor het
    // centreren en de kruisas voor links.
    ...(fieldText && autoLayout.layoutMode === 'VERTICAL'
      ? { primaryAxisAlignItems: 'CENTER', counterAxisAlignItems: 'MIN' }
      : {}),
    ...minimumSizesFrom(styles, autoLayout),
    ...maxWidthFrom(styles, node.tokens),
    ...cornerRadiusFrom(styles, node.rect),
    fills: paintFrom(styles.backgroundColor),
    ...(strokes ?? {}),
    ...(shadow.effects && { effects: shadow.effects }),
    ...(shadow.effectStyle && { effectStyle: shadow.effectStyle }),
    opacity: Number(styles.opacity) === 1 ? undefined : Number(styles.opacity),
    clipsContent: fieldText || styles.overflow === 'hidden',
    children: children.map(({ child, wide }, index) => {
      const childLabel = `${pathLabel} > ${child.classes?.[0] ?? child.kind ?? child.tag ?? index}`;
      const converted = convertNode(
        child,
        wide,
        warnings,
        childLabel,
        bindings
      );
      if (converted.type === 'TEXT') {
        // Een kále tekstnode erft de typografie van het element waarin hij
        // staat, dus ook de tokens daarvan. Zo wijzen spec en binding dezelfde
        // waarde aan. De placeholder van een tekstveld is de uitzondering: die
        // heeft zijn eigen stijl en tokens, uit `::placeholder`.
        //
        // Een élement dat tot tekst inklapt houdt zijn eigen tokens. Het label
        // van DateInputGroup wijst naar `form-field-label/*`; die van zijn
        // ouder overnemen leverde daar de generieke `text/*` op.
        // Een `<option>` is de uitzondering: de browser tekent een dichte
        // `<select>` met de stijl van het veld zelf, niet met de UA-stijl van
        // de optie. De tokens van de ouder zijn daar dus de juiste.
        const collapsed = child.kind !== 'text' && child.tag !== 'option';
        const textStyles = child.textStyles ?? (collapsed ? null : styles);
        const textTokens =
          child.textTokens ?? (collapsed ? child.tokens : node.tokens);
        if (textStyles) {
          Object.assign(
            converted,
            textStyleFrom(textStyles, textTokens, bindings?.index)
          );
        }
        converted.name = TEXT_LAYER_NAME;
        converted.boundVariables = bindVariables(
          converted,
          textTokens,
          bindings
        );
      }
      // `align-self` op het kind gaat voor `align-items` van de ouder. Een
      // kind dat zichzelf centreert rekt dus niet mee, ook niet in een ouder
      // die uitrekt; zie `selfAlignment` hieronder.
      if (
        ownAlignment(child)
          ? child.styles.alignSelf === 'stretch'
          : stretchChildren
      ) {
        converted.layoutAlign = 'STRETCH';
      }
      applyChildPlacement(
        converted,
        child,
        autoLayout,
        warnings,
        childLabel,
        contentWidth
      );
      if (
        converted.type === 'TEXT' &&
        index === lastInFlowIndex &&
        fillsRemainingRow(styles, autoLayout)
      ) {
        converted.layoutSizingHorizontal = 'FILL';
      }
      if (shrinksInRow(converted, child, autoLayout, styles)) {
        converted.layoutSizingHorizontal = 'HUG';
      }
      // De tekst in een veld hugt: te lange tekst loopt het veld uit in plaats
      // van af te breken. Het veld knipt hem af, zie `clipsContent` hierboven.
      if (fieldText && isFieldText(child)) {
        converted.layoutSizingHorizontal = 'HUG';
      }
      // Een subboom die een ander component ís wordt een instance daarvan.
      // Pas hier, nu de gemeten laag zijn plek in deze ouder heeft: die plek
      // gaat mee naar de instance. Zie instances.js.
      const block = bindings?.instances
        ? blockOf(child, bindings.instances.own)
        : null;
      if (block) {
        return bindings.instances.resolve(block, converted, child, childLabel);
      }
      return converted;
    }),
  };

  selfAlignment(figmaNode, children, stretchChildren, warnings, pathLabel);

  if (root && hasRoundedCorners(figmaNode) && childrenWithin(node)) {
    figmaNode.clipsContent = true;
  }

  // Figma gebruikt de spread van een schaduw op een frame alleen als dat frame
  // zijn inhoud afknipt; anders staat het veld grijs op 0. De rand van een leeg
  // tekstveld (`inset 0 0 0 3px`) verdween daardoor helemaal, net als de
  // highlight-laag van Drawer. Kan het niet zonder iets weg te snijden, dan
  // meldt `checkSpreadClip` het, op de opgeleverde boom.
  const spreads = (figmaNode.effects ?? []).some((effect) => effect.spread);
  if (spreads && !figmaNode.clipsContent && childrenWithin(node)) {
    figmaNode.clipsContent = true;
  }

  // HUG kan Figma alleen op een node met een eigen layoutMode; zonder
  // auto layout is er niets om naar te huggen en weigert de API het.
  const hasAutoLayout =
    autoLayout.layoutMode && autoLayout.layoutMode !== 'NONE';

  // HUG laat Figma de maat opnieuw uitrekenen uit de inhoud, en gooit de
  // gemeten maat dus weg. Dat is precies de bedoeling bij een knop of een
  // alert, die met zijn tekst moet meegroeien, maar fout zodra de CSS de maat
  // zélf vastzet. Twee gevallen waarin dat zo is:
  //
  //  - de CSS zet een `width` of `height` (`.dsn-checkbox` is 24x24 via
  //    `--dsn-checkbox-size`);
  //  - de node is absoluut gepositioneerd, en haalt zijn maat dus uit zijn
  //    insets en niet uit zijn inhoud.
  //
  // Checkbox liep op allebei stuk. De control hugde naar het vinkje van 16px
  // in plaats van de 24 aan te houden, en de root hugde naar niets, want een
  // absoluut kind telt in Figma niet mee voor de maat van zijn ouder.
  //
  // De root van een variant telt niet als absoluut. Hij is in Figma het
  // component zelf, en er is niets waartegen zijn insets gelden. SkipLink is
  // alleen absoluut om zich buiten beeld te zetten; zijn maat komt gewoon uit
  // zijn tekst.
  const absolute = styles.position === 'absolute' && !root;
  // `fit-content`, `max-content` en `min-content` zijn geen maat maar een
  // instructie om om de inhoud te krimpen, dus het tegendeel van vast. Een
  // CheckboxOption is `width: fit-content`, en kwam daardoor op een vaste
  // 69px in een CheckboxGroup te staan, waar een lang label dan in een smalle
  // kolom afbrak.
  const fixedWidth = absolute || declaresSize(node.tokens?.width);
  // Een textarea haalt zijn hoogte uit `rows`, niet uit zijn inhoud: met één
  // regel tekst erin zou HUG hem laten krimpen.
  const fixedHeight =
    absolute || declaresSize(node.tokens?.height) || node.tag === 'textarea';

  // Krimpt om zijn inhoud: `inline-block` net als `inline-flex`, en een
  // absoluut gepositioneerde root zonder eigen breedte ook. Voor die laatste
  // kijken naar `display` werkt niet: de browser rekent `inline-block` op een
  // absoluut element om naar `block`.
  const positioned =
    styles.position === 'absolute' || styles.position === 'fixed';
  const shrinkWraps =
    styles.display === 'inline-flex' ||
    styles.display === 'inline-block' ||
    (root && positioned);

  // HUG zonder iets om naar te huggen klapt in tot 0. Een DotBadge is een lege
  // stip, en de wrapper van Popover heeft alleen een absoluut kind.
  const canHug = hasAutoLayout && lastInFlowIndex >= 0;

  figmaNode.layoutSizingHorizontal =
    canHug && shrinkWraps && !fixedWidth ? 'HUG' : 'FIXED';
  figmaNode.layoutSizingVertical = canHug && !fixedHeight ? 'HUG' : 'FIXED';

  // `flex-grow` in een kolom is in Figma FILL in de hoogte: het kind neemt de
  // hoogte die over is. De body van Drawer is `flex: 1` tussen een header en
  // een footer in een drawer van vaste hoogte. Alleen in een ouder met een
  // vaste hoogte: in een ouder die hugt is er geen hoogte over, en dan blijft
  // het kind op HUG. Zo houdt de body van ModalDialog, ook `flex: 1 1 auto`,
  // zijn HUG.
  if (
    figmaNode.layoutMode === 'VERTICAL' &&
    figmaNode.layoutSizingVertical === 'FIXED'
  ) {
    children.forEach(({ child }, index) => {
      const converted = figmaNode.children[index];
      const outOfFlow =
        child.styles?.position === 'absolute' ||
        child.styles?.position === 'fixed';
      if (
        converted &&
        !outOfFlow &&
        Number.parseFloat(child.styles?.flexGrow) > 0
      ) {
        converted.layoutSizingVertical = 'FILL';
      }
    });
  }

  // Pas als de kinderen omgezet zijn is te zien welke grid-rijen gevuld zijn,
  // en kan een subgrid-rij de tracks van zijn ouder krijgen.
  if (figmaNode.layoutMode === 'GRID') {
    resolveSubgrid(figmaNode);
    trimEmptyTrailingRows(figmaNode);
  }

  // En of de kinderen hun eigen cel dragen. Doet geen enkel kind dat, terwijl
  // ze wel een span hebben, dan is het autoplaatsing en moet Figma zelf
  // plaatsen; met MANUAL zou elk kind in cel 1 belanden.
  if (figmaNode.layoutMode === 'GRID') {
    const children = figmaNode.children ?? [];
    const anchored = children.some(
      (child) => child.gridColumnAnchorIndex !== undefined
    );
    const spanned = children.some(
      (child) => child.gridColumnSpan !== undefined
    );
    // `ROW_AUTO_FLOW` is wat Figma kent; de API accepteert alleen 'MANUAL' en
    // 'ROW_AUTO_FLOW'. Het staat voor hetzelfde als `grid-auto-flow: row`.
    if (!anchored && spanned) {
      figmaNode.gridItemsPositioning = 'ROW_AUTO_FLOW';
    }
  }

  const rotation = rotationFrom(styles.transform, warnings, pathLabel);
  if (rotation) figmaNode.rotation = rotation;

  // Als laatste: de bindingen worden geverifieerd tegen de waarden die
  // hierboven in de spec terecht zijn gekomen.
  figmaNode.boundVariables = bindVariables(figmaNode, node.tokens, bindings);

  if (node.contentSlot) {
    return withContentSlot(figmaNode, node.contentSlot, root, pathLabel);
  }
  return figmaNode;
}

/**
 * Zet de kinderen van een frame in een Figma-slot (`data-figma-children`).
 *
 * Een slot laat een designer zelf items of opties toevoegen en weghalen in een
 * instance, zonder te detachen. Gemeten in Figma (issue #450):
 *
 * - de root van een component kan zelf geen slot zijn;
 * - een slot kan auto layout dragen, maar geen grid;
 * - een instance in een slot kan niet exposed zijn;
 * - wat een designer in een slot zette blijft een tweede import alleen
 *   staan als het slot zelf blijft staan.
 *
 * Daarom twee vormen. Staat de markering op de root (een lijst, een groep),
 * dan komt er binnen de root een frame `slot` met de richting en de
 * tussenruimte van de root, inclusief de binding; de root houdt zijn padding.
 * Staat hij op een kind van de root (de footer van ModalDialog), dan wórdt dat
 * kind het slot, met zijn eigen padding en rand. Dieper wordt het element
 * zelf het slot, zoals de navigatie van PageHeader; de plugin bewaart het bij
 * een herimport net zo (zie `resetVariant`).
 */
export function withContentSlot(frame, name, root, label) {
  if (frame.layoutMode === 'GRID') {
    throw new Error(
      `${label}: data-figma-children op een grid. Een slot kan in Figma geen grid zijn.`
    );
  }
  if (!frame.layoutMode || frame.layoutMode === 'NONE') {
    throw new Error(
      `${label}: data-figma-children op een element zonder auto layout. Een slot moet zijn items zelf onder of naast elkaar zetten.`
    );
  }

  // Figma weigert een exposed instance in een slot, ook dieper erin (de
  // knoppen in de ActionGroup van de footer van ModalDialog).
  const notExposed = (node) =>
    node.type === 'INSTANCE'
      ? { ...node, exposed: false }
      : node.children
        ? { ...node, children: node.children.map(notExposed) }
        : node;
  const children = (frame.children ?? []).map(notExposed);

  if (!root) return { ...frame, type: 'SLOT', name, children };

  const {
    itemSpacing: spacingBinding,
    counterAxisSpacing: crossBinding,
    ...rootBindings
  } = frame.boundVariables ?? {};
  const slotBindings = {
    ...(spacingBinding ? { itemSpacing: spacingBinding } : {}),
    ...(crossBinding ? { counterAxisSpacing: crossBinding } : {}),
  };

  const slot = {
    type: 'SLOT',
    name,
    width: frame.width - (frame.paddingLeft ?? 0) - (frame.paddingRight ?? 0),
    height: frame.height - (frame.paddingTop ?? 0) - (frame.paddingBottom ?? 0),
    x: frame.paddingLeft ?? 0,
    y: frame.paddingTop ?? 0,
    layoutMode: frame.layoutMode,
    layoutWrap: frame.layoutWrap,
    itemSpacing: frame.itemSpacing,
    ...(frame.layoutWrap === 'WRAP'
      ? { counterAxisSpacing: frame.counterAxisSpacing }
      : {}),
    itemReverseZIndex: false,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    primaryAxisAlignItems: frame.primaryAxisAlignItems,
    counterAxisAlignItems: frame.counterAxisAlignItems,
    cornerRadius: 0,
    fills: [],
    clipsContent: false,
    children,
    layoutSizingHorizontal: 'FILL',
    layoutSizingVertical: 'HUG',
    ...(Object.keys(slotBindings).length
      ? { boundVariables: slotBindings }
      : {}),
  };

  // Het afbreken en de gaps zitten nu in het slot; de root heeft één kind.
  const rootFrame = { ...frame };
  delete rootFrame.counterAxisSpacing;
  return {
    ...rootFrame,
    layoutWrap: 'NO_WRAP',
    itemSpacing: 0,
    boundVariables: Object.keys(rootBindings).length ? rootBindings : undefined,
    children: [slot],
  };
}

/**
 * De visually-hidden techniek: absoluut, en weggeknipt met `clip-path`. Zo
 * verbergen `dsn-visually-hidden` en het label van een icon-only Button hun
 * tekst. `dsn-visually-hidden` zelf slaat de extractie al over; dit vangt de
 * plekken waar dezelfde techniek op een eigen klasse staat.
 */
function isVisuallyHidden(styles) {
  return (
    styles.position === 'absolute' &&
    /^inset\(50%\)$/.test(styles.clipPath ?? '')
  );
}

/**
 * Een flex-item in een rij krimpt in CSS om zijn inhoud.
 *
 * Een kind van `display: flex; flex-direction: row` zonder eigen breedte en
 * zonder `flex-grow` is precies zo breed als zijn inhoud (`flex-basis: auto`).
 * In Figma is dat HUG. Zonder deze regel kwam alleen `inline-flex` of
 * `inline-block` op HUG, en stond een item van BreadcrumbNavigation (een
 * `display: flex`-`<li>` in een `<ol>` die een rij is) op een vaste 61,8px.
 *
 * Alleen als de gemeten breedte ook echt de breedte van de inhoud is. Een item
 * dat door `flex-shrink` smaller is gedrukt, of een tekst die afbreekt, zou
 * met HUG in Figma breder worden dan in de browser.
 */
function shrinksInRow(converted, child, parentLayout, parentStyles) {
  if (parentLayout.layoutMode !== 'HORIZONTAL') return false;
  // Alleen een echte flex-rij. Een tabelrij wordt in Figma ook HORIZONTAL,
  // maar daar verdeelt het tabelalgoritme de breedte, niet de inhoud.
  if (!/flex/.test(parentStyles?.display ?? '')) return false;
  if (
    converted.type !== 'FRAME' ||
    converted.layoutSizingHorizontal !== 'FIXED'
  ) {
    return false;
  }
  if (!converted.layoutMode || converted.layoutMode === 'NONE') return false;
  if (converted.layoutPositioning === 'ABSOLUTE') return false;
  const styles = child.styles ?? {};
  if (Number.parseFloat(styles.flexGrow) > 0) return false;
  if (declaresSize(child.tokens?.width)) return false;

  // De breedte van de inhoud uit de meting: elementen met hun `rect`, tekst
  // met zijn `textRect`. Wat buiten de stroom staat telt niet mee.
  const widths = (child.children ?? [])
    .filter((item) =>
      item.kind === 'text'
        ? Boolean(item.textRect)
        : item.rect &&
          !/^(absolute|fixed)$/.test(item.styles?.position ?? '') &&
          !isVisuallyHidden(item.styles ?? {})
    )
    .map((item) => (item.kind === 'text' ? item.textRect : item.rect).width);
  if (!widths.length) return false;
  const content =
    converted.layoutMode === 'HORIZONTAL'
      ? widths.reduce((total, width) => total + width, 0) +
        (converted.itemSpacing ?? 0) * (widths.length - 1)
      : Math.max(...widths);
  const hugged =
    content + (converted.paddingLeft ?? 0) + (converted.paddingRight ?? 0);
  return Math.abs(hugged - converted.width) < 1;
}

/** Wikkel zodat convertNode niets van de vorm van het bindings-object hoeft te weten. */
export function bindVariables(spec, tokens, bindings) {
  if (!bindings?.index) return undefined;
  return bindingsFor(spec, tokens, bindings.index, bindings.report);
}
