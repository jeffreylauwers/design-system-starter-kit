/**
 * Zet een computed DOM-boom om naar een Figma node spec.
 *
 * De kern van de vertaling is flexbox -> auto layout. Dat is de reden dat deze
 * route werkt waar CSS-parsing faalt: `display:flex` met gap, padding en
 * alignment bevat exact de informatie die Figma nodig heeft om een frame te
 * laten meeschalen in plaats van een dood, absoluut gepositioneerd blok.
 */

import { bindingsFor, createBindingReport } from './bindings.js';

// =============================================================================
// WAARDE-CONVERSIE
// =============================================================================

/** `rgb(27, 89, 164)` of `rgba(0, 0, 0, 0)` -> Figma RGBA (kanalen 0..1). */
export function parseCssColor(input) {
  const match = String(input).match(
    /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.%]+))?\s*\)/i
  );
  if (!match) return null;

  const [, r, g, b, a] = match;
  let alpha = 1;
  if (a !== undefined) {
    alpha = a.endsWith('%') ? Number(a.slice(0, -1)) / 100 : Number(a);
  }

  return {
    r: Number(r) / 255,
    g: Number(g) / 255,
    b: Number(b) / 255,
    a: alpha,
  };
}

/** `12px` -> 12. `normal` en lege waarden -> fallback. */
function px(value, fallback = 0) {
  const number = Number.parseFloat(value);
  return Number.isFinite(number) ? Math.round(number * 100) / 100 : fallback;
}

const PRIMARY_AXIS_ALIGN = {
  'flex-start': 'MIN',
  start: 'MIN',
  center: 'CENTER',
  'flex-end': 'MAX',
  end: 'MAX',
  'space-between': 'SPACE_BETWEEN',
};

const COUNTER_AXIS_ALIGN = {
  'flex-start': 'MIN',
  start: 'MIN',
  center: 'CENTER',
  'flex-end': 'MAX',
  end: 'MAX',
  baseline: 'BASELINE',
  // Figma kent geen STRETCH op de counter axis van de parent; dat wordt op het
  // kind gezet via layoutAlign. Zie stretchChildren verderop.
  stretch: 'MIN',
};

// =============================================================================
// NODE-CONVERSIE
// =============================================================================

/**
 * Telt de tracks in een computed grid-template.
 * De browser lost `1fr` op naar pixels, dus de tracks komen er als
 * pixelwaarden uit: `"32px 500px"`.
 */
function trackSizes(template) {
  if (!template || template === 'none') return [];
  return template
    .split(/\s+/)
    .map((track) => Number.parseFloat(track))
    .filter((track) => Number.isFinite(track));
}

/**
 * Bepaalt per track of hij vast of flexibel is.
 *
 * De browser lost `1fr` op naar pixels voordat wij kunnen meten, dus uit één
 * meting is `fr` niet van een vaste maat te onderscheiden. Door hetzelfde
 * component ook in een bredere container te meten wordt het wel zichtbaar:
 * een track die meegroeit was flexibel, een track die gelijk blijft was vast.
 */
function trackSizesFrom(template, wideTemplate, fallbackType = 'FIXED') {
  const sizes = trackSizes(template);
  const wide = trackSizes(wideTemplate ?? '');

  return sizes.map((value, index) => {
    const grew = wide.length === sizes.length && wide[index] - value > 0.5;
    // Figma's FLEX-waarde komt overeen met de fr-eenheid in CSS.
    if (grew) return { type: 'FLEX', value: 1 };
    return fallbackType === 'HUG' ? { type: 'HUG' } : { type: 'FIXED', value };
  });
}

/**
 * CSS Grid naar Figma's GRID auto layout.
 *
 * Figma kent sinds 2025 een grid-layoutmodus met expliciete plaatsing per kind.
 * Dat past op een grid met expliciete `grid-column` / `grid-row`, zoals Alert.
 */
function gridLayoutFrom(styles, wideStyles, warnings, pathLabel) {
  const columns = trackSizesFrom(
    styles.gridTemplateColumns,
    wideStyles?.gridTemplateColumns
  );
  // Rijen in CSS Grid zijn standaard `auto`, dus inhoudsgestuurd. Uit de
  // computed waarde is dat niet te zien (die is altijd een pixelmaat), maar
  // een vaste rijhoogte zou betekenen dat het component niet meegroeit als
  // tekst afbreekt. HUG is daarom de juiste standaard.
  const rows = trackSizesFrom(
    styles.gridTemplateRows,
    wideStyles?.gridTemplateRows,
    'HUG'
  );

  if (columns.length > 1 && !wideStyles) {
    warnings.push(
      `${pathLabel}: geen tweede meting beschikbaar, alle grid-tracks zijn vast; controleer in Figma welke flexibel moet zijn`
    );
  }

  return {
    layoutMode: 'GRID',
    gridColumnCount: Math.max(columns.length, 1),
    gridRowCount: Math.max(rows.length, 1),
    gridColumnGap: px(styles.columnGap ?? styles.gap),
    gridRowGap: px(styles.rowGap ?? styles.gap),
    // Let op de namen: gridAutoTracks is iets anders (automatisch rijen
    // toevoegen). De maten van de tracks zelf horen hier.
    gridColumnSizes: columns,
    gridRowSizes: rows,
    // De kinderen dragen hun eigen cel, dus Figma moet niet zelf plaatsen.
    gridItemsPositioning: 'MANUAL',
    paddingTop: px(styles.paddingTop),
    paddingRight: px(styles.paddingRight),
    paddingBottom: px(styles.paddingBottom),
    paddingLeft: px(styles.paddingLeft),
    stretchChildren: false,
    reversed: false,
  };
}

/** Bouwt de auto layout-eigenschappen uit de flexbox computed styles. */
function autoLayoutFrom(styles, wideStyles, warnings, pathLabel) {
  if (styles.display === 'grid' || styles.display === 'inline-grid') {
    return gridLayoutFrom(styles, wideStyles, warnings, pathLabel);
  }

  const isFlex = styles.display === 'flex' || styles.display === 'inline-flex';
  if (!isFlex) {
    return { layoutMode: 'NONE' };
  }

  const vertical = styles.flexDirection.startsWith('column');
  const reversed = styles.flexDirection.endsWith('-reverse');
  if (reversed) {
    warnings.push(
      `${pathLabel}: ${styles.flexDirection} kent Figma niet, kinderen zijn in omgekeerde volgorde gezet`
    );
  }
  if (styles.flexWrap === 'wrap') {
    warnings.push(`${pathLabel}: flex-wrap:wrap wordt layoutWrap WRAP`);
  }

  const gap = px(
    vertical ? (styles.rowGap ?? styles.gap) : (styles.columnGap ?? styles.gap),
    0
  );

  return {
    layoutMode: vertical ? 'VERTICAL' : 'HORIZONTAL',
    layoutWrap: styles.flexWrap === 'wrap' ? 'WRAP' : 'NO_WRAP',
    itemSpacing: gap,
    itemReverseZIndex: false,
    paddingTop: px(styles.paddingTop),
    paddingRight: px(styles.paddingRight),
    paddingBottom: px(styles.paddingBottom),
    paddingLeft: px(styles.paddingLeft),
    primaryAxisAlignItems: PRIMARY_AXIS_ALIGN[styles.justifyContent] ?? 'MIN',
    counterAxisAlignItems: COUNTER_AXIS_ALIGN[styles.alignItems] ?? 'MIN',
    // Kinderen krijgen layoutAlign STRETCH als de parent ze uitrekt.
    stretchChildren: styles.alignItems === 'stretch',
    reversed,
  };
}

/** De vier randen, in de volgorde die CSS aanhoudt. */
const SIDES = ['top', 'right', 'bottom', 'left'];

/** `top` -> `strokeTopWeight`. */
function weightFieldFor(side) {
  return `stroke${side[0].toUpperCase()}${side.slice(1)}Weight`;
}

/**
 * Randen naar een Figma stroke.
 *
 * Een rand hoeft niet rondom te lopen. Note tekent alleen een accentrand aan de
 * inline-start, en Table en SummaryList scheiden hun rijen met één lijn. Zo'n
 * rand als uniforme stroke overnemen zou in Figma een kader om het hele
 * component zetten: niet een waarschuwing waard maar een verkeerd component.
 *
 * Figma kent daarom per zijde een `stroke*Weight`. Die worden gezet zodra de
 * zijden verschillen; de zijden zonder rand komen op 0 en tekenen dus niets.
 * `strokeWeight` blijft de dikste waarde, want dat is wat Figma teruggeeft
 * zolang er nog niets per zijde gezet is.
 */
function strokesFrom(styles, warnings, pathLabel) {
  const widths = SIDES.map((side) =>
    px(styles[`border${side[0].toUpperCase()}${side.slice(1)}Width`])
  );
  // Bij verschillende randen per zijde geeft de browser de shorthand terug
  // ("none none none solid"); per zijde uitlezen is de betrouwbare route.
  const borderStyles = SIDES.map(
    (side) => styles[`border${side[0].toUpperCase()}${side.slice(1)}Style`]
  );

  const drawn = SIDES.map(
    (_, index) => widths[index] > 0 && borderStyles[index] !== 'none'
  );
  if (!drawn.some(Boolean)) return null;

  // De zijde die de rand daadwerkelijk tekent levert kleur, dikte en stijl.
  // Bij Note is dat `left`, en `border-top-color` bestaat daar niet eens.
  const reference = drawn.indexOf(true);
  const side = SIDES[reference];
  const style = borderStyles[reference];

  if (style !== 'solid' && style !== 'dashed') {
    warnings.push(
      `${pathLabel}: border-style ${style} wordt in Figma een doorlopende lijn`
    );
  }

  const color = parseCssColor(
    styles[`border${side[0].toUpperCase()}${side.slice(1)}Color`]
  );
  if (!color) return null;

  const effective = widths.map((width, index) => (drawn[index] ? width : 0));
  const uniform = effective.every((width) => width === effective[0]);

  const spec = {
    strokeWeight: Math.max(...effective),
    strokes: [{ type: 'SOLID', color: rgbOf(color), opacity: color.a }],
    dashPattern: style === 'dashed' ? [4, 4] : [],
    // Waar de rand vandaan komt; bindings.js bindt aan de tokens van díe zijde.
    strokeSide: side,
  };

  if (!uniform) {
    spec.strokeWeights = Object.fromEntries(
      SIDES.map((name, index) => [weightFieldFor(name), effective[index]])
    );
  }

  return spec;
}

/**
 * Minimum-maten uit de CSS.
 *
 * Zonder deze wordt een `min-block-size` stil weggegooid: het frame is in Figma
 * HUG, dus die rekent de hoogte opnieuw uit content plus padding en komt lager
 * uit dan de browser. Bij Button scheelt dat het verschil tussen 42px en het
 * aanraakdoel van 48px uit WCAG 2.5.5.
 *
 * Alleen een pixelmaat telt: `auto` is de standaard voor een flex-item, en een
 * percentage is in Figma layoutgedrag en geen maat.
 */
function minimumSizesFrom(styles, layout) {
  // In Figma bestaan minWidth en minHeight alleen op een auto-layout frame.
  if (!layout.layoutMode || layout.layoutMode === 'NONE') return {};

  const pixels = (value) =>
    /^-?[\d.]+px$/.test(String(value).trim()) && px(value) > 0
      ? px(value)
      : undefined;

  return {
    minWidth: pixels(styles.minWidth),
    minHeight: pixels(styles.minHeight),
  };
}

/** Figma scheidt kleur en alpha: opacity zit op de paint, niet in de kleur. */
function rgbOf({ r, g, b }) {
  return { r, g, b };
}

/**
 * Hoekafronding, met percentages omgerekend naar pixels.
 *
 * `border-radius: 50%` komt als "50%" uit getComputedStyle. Zou je dat als 50
 * doorgeven, dan klopt de waarde alleen zolang Figma hem toevallig klemt op de
 * helft van de kortste zijde; bij een breder element wordt het een afgeronde
 * rechthoek in plaats van een pil.
 */
function cornerRadiusFrom(styles, rect) {
  // Figma kent één radius per hoek, CSS twee (horizontaal en verticaal).
  // Voor een percentage nemen we de kortste zijde, wat voor de ronde controls
  // in dit systeem (vierkant) exact klopt.
  const shortestSide = Math.min(rect.width, rect.height);
  const toPixels = (value) => {
    const percentage = String(value)
      .trim()
      .match(/^([\d.]+)%$/);
    if (!percentage) return px(value);
    return (Number(percentage[1]) / 100) * shortestSide;
  };

  const corners = [
    toPixels(styles.borderTopLeftRadius),
    toPixels(styles.borderTopRightRadius),
    toPixels(styles.borderBottomRightRadius),
    toPixels(styles.borderBottomLeftRadius),
  ];
  const uniform = corners.every((corner) => corner === corners[0]);
  return uniform
    ? { cornerRadius: corners[0] }
    : {
        topLeftRadius: corners[0],
        topRightRadius: corners[1],
        bottomRightRadius: corners[2],
        bottomLeftRadius: corners[3],
      };
}

/** Tekststijl uit de computed styles van het *ouder*-element. */
function textStyleFrom(styles) {
  const lineHeight = styles.lineHeight;
  return {
    fontFamily: styles.fontFamily.split(',')[0].replace(/['"]/g, '').trim(),
    fontSize: px(styles.fontSize, 16),
    fontWeight: Number.parseInt(styles.fontWeight, 10) || 400,
    italic: styles.fontStyle === 'italic',
    lineHeight:
      lineHeight === 'normal'
        ? { unit: 'AUTO' }
        : { unit: 'PIXELS', value: px(lineHeight) },
    letterSpacing:
      styles.letterSpacing === 'normal' ? 0 : px(styles.letterSpacing),
    textAlignHorizontal: (styles.textAlign === 'start'
      ? 'left'
      : styles.textAlign
    ).toUpperCase(),
    textDecoration:
      styles.textDecorationLine === 'underline' ? 'UNDERLINE' : 'NONE',
    textCase: styles.textTransform === 'uppercase' ? 'UPPER' : 'ORIGINAL',
    fills: paintFrom(styles.color),
  };
}

function paintFrom(cssColor) {
  const color = parseCssColor(cssColor);
  if (!color || color.a === 0) return [];
  return [{ type: 'SOLID', color: rgbOf(color), opacity: color.a }];
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
  const styles = child.styles;
  if (!styles) return;

  // Een kind dat precies de binnenbreedte van zijn ouder vult is een
  // blok-element. In Figma hoort dat FILL te zijn: met een vaste breedte
  // schaalt het niet mee als de ouder groeit. FILL kan alleen binnen een
  // auto-layout ouder; anders weigert de API het.
  if (
    parentLayout.layoutMode &&
    parentLayout.layoutMode !== 'NONE' &&
    parentContentWidth !== undefined &&
    Math.abs(child.rect.width - parentContentWidth) < 1
  ) {
    converted.layoutSizingHorizontal = 'FILL';
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
    warnings.push(
      `${label}: geen expliciete grid-cel, Figma plaatst dit kind zelf in leesvolgorde`
    );
    return;
  }

  // CSS-gridlijnen tellen vanaf 1, Figma's anchors vanaf 0.
  converted.gridColumnAnchorIndex = columnStart - 1;
  converted.gridRowAnchorIndex = rowStart - 1;

  const columnEnd = Number.parseInt(styles.gridColumnEnd, 10);
  const rowEnd = Number.parseInt(styles.gridRowEnd, 10);
  const columnSpan =
    Number.isFinite(columnEnd) && columnEnd - columnStart > 1
      ? columnEnd - columnStart
      : 1;
  if (columnSpan > 1) converted.gridColumnSpan = columnSpan;
  if (Number.isFinite(rowEnd) && rowEnd - rowStart > 1) {
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
function convertNode(node, wideNode, warnings, pathLabel, bindings) {
  const converted = convertElement(
    node,
    wideNode,
    warnings,
    pathLabel,
    bindings
  );
  // `data-figma-slot` uit de matrix: hier hangt straks een component property
  // aan. Het reist als `componentSlot` mee tot in de plugin, die de laag erop
  // terugvindt in plaats van hem op klassenaam te moeten raden.
  if (node.slot) converted.componentSlot = node.slot;
  return converted;
}

function convertElement(node, wideNode, warnings, pathLabel, bindings) {
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
      svg: node.svg,
      fills: paintFrom(node.styles.color),
    };
    vector.boundVariables = bindVariables(vector, node.tokens, bindings);
    return vector;
  }

  const { styles } = node;
  const layout = autoLayoutFrom(styles, wideNode?.styles, warnings, pathLabel);
  const strokes = strokesFrom(styles, warnings, pathLabel);

  // Een element dat alleen tekst bevat en zelf niets tekent, wordt in Figma
  // één TEXT-node. Zonder deze stap krijgt elke <span> een eigen frame en
  // ontstaat precies de diepe nesting die een Figma-library onwerkbaar maakt.
  const onlyChildIsText =
    node.children.length === 1 && node.children[0].kind === 'text';
  const drawsNothing =
    paintFrom(styles.backgroundColor).length === 0 &&
    !strokes &&
    px(styles.borderTopLeftRadius) === 0;

  if (onlyChildIsText && drawsNothing) {
    // Bewust zonder bindingen: de ouder overschrijft de tekststijl zo meteen
    // met de zijne, en dan zou een hier gelegde binding een andere waarde
    // aanwijzen dan er in de spec staat. De ouder legt ze.
    return {
      type: 'TEXT',
      name: node.classes[0] ?? node.children[0].text.slice(0, 24),
      characters: node.children[0].text,
      ...textStyleFrom(styles),
    };
  }

  if (styles.boxShadow && styles.boxShadow !== 'none') {
    warnings.push(
      `${pathLabel}: box-shadow moet een Figma effect style worden, niet meegenomen`
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

  const figmaNode = {
    type: 'FRAME',
    name: node.classes[0] ?? node.tag,
    width: node.rect.width,
    height: node.rect.height,
    x: node.rect.x,
    y: node.rect.y,
    ...autoLayout,
    ...minimumSizesFrom(styles, autoLayout),
    ...cornerRadiusFrom(styles, node.rect),
    fills: paintFrom(styles.backgroundColor),
    ...(strokes ?? {}),
    opacity: Number(styles.opacity) === 1 ? undefined : Number(styles.opacity),
    clipsContent: styles.overflow === 'hidden',
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
        // Tekst erft de typografie van het element waarin hij staat, dus ook
        // de tokens daarvan. Zo wijzen spec en binding dezelfde waarde aan.
        Object.assign(converted, textStyleFrom(styles), {
          name: converted.characters.slice(0, 24),
        });
        converted.boundVariables = bindVariables(
          converted,
          node.tokens,
          bindings
        );
      }
      if (stretchChildren) converted.layoutAlign = 'STRETCH';
      applyChildPlacement(
        converted,
        child,
        autoLayout,
        warnings,
        childLabel,
        contentWidth
      );
      return converted;
    }),
  };

  // HUG kan Figma alleen op een node met een eigen layoutMode; zonder
  // auto layout is er niets om naar te huggen en weigert de API het.
  const hasAutoLayout =
    autoLayout.layoutMode && autoLayout.layoutMode !== 'NONE';
  figmaNode.layoutSizingHorizontal =
    hasAutoLayout && styles.display === 'inline-flex' ? 'HUG' : 'FIXED';
  figmaNode.layoutSizingVertical = hasAutoLayout ? 'HUG' : 'FIXED';

  // Als laatste: de bindingen worden geverifieerd tegen de waarden die
  // hierboven in de spec terecht zijn gekomen.
  figmaNode.boundVariables = bindVariables(figmaNode, node.tokens, bindings);

  return figmaNode;
}

/** Wikkel zodat convertNode niets van de vorm van het bindings-object hoeft te weten. */
function bindVariables(spec, tokens, bindings) {
  if (!bindings) return undefined;
  return bindingsFor(spec, tokens, bindings.index, bindings.report);
}

/**
 * Verzamelt de slots die daadwerkelijk in de gebouwde boom zitten.
 *
 * Een gedeclareerde property die nergens landt is de stille mislukking die dit
 * onderdeel juist moet uitsluiten, dus dat wordt hier al zichtbaar in plaats
 * van pas in Figma.
 */
function collectSlots(node, into = new Set()) {
  if (node.componentSlot) into.add(node.componentSlot);
  for (const child of node.children ?? []) collectSlots(child, into);
  return into;
}

/**
 * Controleert de gedeclareerde component properties tegen de gebouwde boom.
 *
 * Een property moet in **elke** variant een laag hebben. Figma definieert de
 * properties op de component set, en een variant zonder de bijbehorende laag
 * levert daar een property op die de helft van de tijd niets doet.
 */
function checkComponentProperties(declared, components, warnings) {
  if (!declared?.length) return [];

  const perVariant = components.map((component) => ({
    name: component.name,
    slots: collectSlots(component.node),
  }));

  return declared.filter((property) => {
    const missing = perVariant.filter(
      (variant) => !variant.slots.has(property.slot)
    );
    if (!missing.length) return true;

    warnings.push(
      missing.length === perVariant.length
        ? `component property "${property.name}" wijst naar slot "${property.slot}", en geen enkele variant rendert data-figma-slot="${property.slot}"`
        : `component property "${property.name}" mist slot "${property.slot}" in ${missing.length} van de ${perVariant.length} varianten (o.a. ${missing[0].name}); een property op de set moet in elke variant een laag hebben`
    );
    return false;
  });
}

// =============================================================================
// HET CANVAS ROND EEN COMPONENT SET
// =============================================================================

/**
 * De pagina waar een component set op komt te staan.
 *
 * Eén pagina per component, met dezelfde `dsn/`-vorm als `dsn/Icons`. Alles op
 * één pagina zetten werkt alleen zolang het er vijf zijn: bij de volle
 * bibliotheek is een pagina per component de enige indeling waarin een designer
 * een component terugvindt zonder eerst het hele canvas af te scrollen.
 *
 * De naam volgt de matrix en niet de CSS-klasse. De set zelf heet `dsn-button`,
 * want dat is waar een designer in de code op zoekt; een paginalijst leest
 * prettiger als `dsn/Button`, en de plugin sorteert die lijst alfabetisch.
 */
export function pageNameFor(component) {
  return `dsn/${component}`;
}

/**
 * De ruimte rond en tussen de varianten op het canvas.
 *
 * Bewust een vast getal en geen token: dit is de presentatie van de
 * bibliotheekpagina, geen eigenschap van het component. Een spacing-token
 * hieraan hangen zou betekenen dat de afstand tussen twee varianten meebeweegt
 * met een densitywissel, en dat zegt over het component niets.
 */
const CANVAS_SPACING = 48;

/**
 * De achtergrond van het canvas is de documentachtergrond van het design
 * system, gebonden aan zijn variable.
 *
 * Zonder dit staat de set op het grijs van Figma zelf. Dat is niet alleen
 * lelijk: schakelt een designer de `dsn/Primitives`-mode naar `start-dark`, dan
 * worden de componenten donker op een lichte plaat en is er geen enkele variant
 * meer te lezen. Gebonden aan de variable schakelt de plaat mee.
 *
 * Net als de kleur van de iconset is dit een gekozen standaard en geen gemeten
 * binding: er is geen element op het canvas om tegen af te zetten. De
 * verificatie uit DR-2026-06 geldt hier dus niet.
 */
const CANVAS_BACKGROUND = 'dsn-color-neutral-bg-document';

function canvasFor(variableIndex, report) {
  const canvas = { padding: CANVAS_SPACING, itemSpacing: CANVAS_SPACING };

  const variable = variableIndex?.lookup(CANVAS_BACKGROUND);
  if (!variable || variable.type !== 'COLOR' || !variable.value) return canvas;

  const { r, g, b, a = 1 } = variable.value;
  canvas.fills = [{ type: 'SOLID', color: { r, g, b }, opacity: a }];
  canvas.boundVariables = {
    fills: { collection: variable.collection, name: variable.name },
  };
  // Meetellen in hetzelfde rapport als de rest: de plugin legt deze binding via
  // dezelfde route, en de smoke test vergelijkt beide aantallen.
  report.bind(variable.collection);

  return canvas;
}

/**
 * Bouwt een complete Figma component set uit de geëxtraheerde varianten.
 *
 * @param {object} matrix de matrixdefinitie
 * @param {Array<{variant: object, tree: object}>} extracted
 * @param {object} [variableIndex] uit variable-index.js. Ontbreekt hij, dan
 *   worden er geen variables gebonden en houdt alles zijn vaste waarde.
 */
export function toComponentSet(matrix, extracted, variableIndex) {
  const warnings = [];
  const report = createBindingReport();
  const bindings = variableIndex ? { index: variableIndex, report } : undefined;

  const components = extracted.map(({ variant, tree, wideTree }) => {
    const label = Object.entries(variant)
      .map(([axis, value]) => `${axis}=${value}`)
      .join(', ');
    const node = convertNode(
      tree,
      wideTree,
      warnings,
      `${matrix.component}[${label}]`,
      bindings
    );
    // Een component dat in zijn geheel tot tekst inklapt heeft geen ouder die
    // de binding voor hem kan leggen.
    if (node.type === 'TEXT') {
      node.boundVariables = bindVariables(node, tree.tokens, bindings);
    }
    return { name: label, variantProperties: variant, node };
  });

  // Vóór report.summary(): de achtergrondbinding telt mee in hetzelfde rapport.
  const canvas = canvasFor(variableIndex, report);

  return {
    $schema: 'dsn-figma-components/1',
    generatedAt: new Date().toISOString(),
    componentSet: {
      // Eén pagina per component; de plugin maakt hem aan en zet de
      // `dsn/`-pagina's daarna alfabetisch.
      page: pageNameFor(matrix.component),
      canvas,
      // De naam die een designer in Figma terugvindt is de CSS-klasse, niet de
      // matrixnaam: `dsn-button` is waar hij in de code op zoekt. Klapt de root
      // om welke reden dan ook niet naar een `dsn-`-element, dan blijft de
      // matrixnaam over.
      name: components[0]?.node.name?.startsWith('dsn-')
        ? components[0].node.name
        : matrix.component,
      variantAxes: matrix.axes,
      componentProperties: checkComponentProperties(
        matrix.componentProperties,
        components,
        warnings
      ),
      components,
    },
    // Ontdubbeld: dezelfde waarschuwing komt per variant terug.
    warnings: [...new Set(warnings)],
    // Wat er aan variables gebonden is, en wat een vaste waarde hield.
    bindings: { ...report.summary(), modes: variableIndex?.modes },
  };
}
