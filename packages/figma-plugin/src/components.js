/**
 * Bouwt een Figma component set uit een node spec van de generator.
 *
 * De volgorde waarin Figma-eigenschappen gezet worden is niet vrij:
 * - `layoutSizing*` op HUG kan pas als de node zelf een layoutMode heeft
 * - `layoutSizing*` op FILL kan pas als de node in een auto-layout ouder hangt
 * - een tekstnode accepteert pas karakters als het font geladen is
 *
 * Vandaar: node maken, aan de ouder hangen, stijl zetten, layoutMode zetten,
 * kinderen bouwen, en pas als laatste de eigen sizing.
 *
 * De bindingen aan variables komen daar nog achteraan: een `paddingTop` valt
 * pas te binden als de node auto layout heeft, en een paint pas als hij er is.
 */

/** Figma verwacht een style-naam, geen numeriek gewicht. */
const WEIGHT_TO_STYLE = {
  100: 'Thin',
  200: 'ExtraLight',
  300: 'Light',
  400: 'Regular',
  500: 'Medium',
  600: 'SemiBold',
  700: 'Bold',
  800: 'ExtraBold',
  900: 'Black',
};

const FALLBACK_FONT = { family: 'Inter', style: 'Regular' };

function fontFor(node) {
  const style = WEIGHT_TO_STYLE[node.fontWeight] ?? 'Regular';
  return {
    family: node.fontFamily,
    style: node.italic
      ? `${style} Italic`.replace('Regular Italic', 'Italic')
      : style,
  };
}

/** Loopt de spec af en verzamelt elk font dat geladen moet worden. */
function collectFonts(node, into = new Map()) {
  if (node.type === 'TEXT') {
    const font = fontFor(node);
    into.set(`${font.family}|${font.style}`, font);
  }
  for (const child of node.children ?? []) collectFonts(child, into);
  return into;
}

/**
 * Laadt alle benodigde fonts. Ontbrekende fonts worden op de fallback gezet
 * zodat de import doorloopt in plaats van halverwege te stoppen.
 */
async function loadFonts(fonts, log) {
  const available = new Map();
  await figma.loadFontAsync(FALLBACK_FONT);

  for (const [key, font] of fonts) {
    try {
      await figma.loadFontAsync(font);
      available.set(key, font);
    } catch {
      log.warn(
        `Font "${font.family} ${font.style}" is niet beschikbaar in dit bestand; Inter Regular gebruikt`
      );
      available.set(key, FALLBACK_FONT);
    }
  }
  return available;
}

/**
 * Kleurt een uit SVG opgebouwde node.
 *
 * In de browser erven iconen hun kleur van `currentColor`, maar Figma kent dat
 * begrip niet: createNodeFromSvg maakt er zwart van. De gemeten tekstkleur
 * wordt daarom over de vectoren heen gezet, en alleen daar waar de SVG
 * daadwerkelijk een vulling of een lijn had. Zo blijft het verschil tussen een
 * gevuld en een lijn-icoon intact.
 */
function recolorSvg(node, paints) {
  if (!paints || !paints.length) return;

  const visit = (current) => {
    if (Array.isArray(current.fills) && current.fills.length) {
      current.fills = paints;
    }
    if (Array.isArray(current.strokes) && current.strokes.length) {
      current.strokes = paints;
    }
    for (const child of current.children ?? []) visit(child);
  };

  for (const child of node.children ?? []) visit(child);
}

// =============================================================================
// VARIABLE-BINDINGEN
// =============================================================================

/**
 * Een kleur die in de gemeten mode transparant is levert geen paint op, maar
 * kan in een andere mode wel zichtbaar zijn. Zonder paint is er niets om aan
 * te binden, dus die maken we alsnog; de variable bepaalt daarna kleur én
 * alpha.
 */
const PLACEHOLDER_PAINT = {
  type: 'SOLID',
  color: { r: 0, g: 0, b: 0 },
  opacity: 0,
};

/**
 * De variables in dit bestand, op collection + naam.
 * De generator wijst met die twee namen aan, want een variable-naam is alleen
 * binnen zijn eigen collection uniek.
 *
 * @returns {Promise<{byName: Map<string, Variable>, collections: Set<string>}>}
 */
async function loadVariableIndex() {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const nameById = new Map(
    collections.map((collection) => [collection.id, collection.name])
  );

  const byName = new Map();
  for (const variable of await figma.variables.getLocalVariablesAsync()) {
    const collection = nameById.get(variable.variableCollectionId);
    byName.set(`${collection}|${variable.name}`, variable);
  }

  return { byName, collections: new Set(nameById.values()) };
}

/** Zoekt de variable die de generator heeft aangewezen. */
function variableFor(reference, context) {
  const variable = context.variables.byName.get(
    `${reference.collection}|${reference.name}`
  );
  if (!variable) {
    context.stats.missing.add(`${reference.collection} / ${reference.name}`);
    return null;
  }
  return variable;
}

/**
 * Paints zijn immutable: binden levert een nieuwe paint op, en die moet als
 * nieuwe lijst terug op de node.
 */
function paintsBoundTo(paints, variable) {
  const rest = paints && paints.length ? paints.slice(1) : [];
  const base = paints && paints.length ? paints[0] : PLACEHOLDER_PAINT;
  return [
    figma.variables.setBoundVariableForPaint(base, 'color', variable),
    ...rest,
  ];
}

/**
 * Bindt de velden die de generator heeft aangewezen.
 *
 * `fills` en `strokes` zijn geen node-velden in de Plugin API maar paints; die
 * krijgen hun eigen route. De rest gaat via `setBoundVariable`.
 */
function applyBindings(node, spec, context) {
  for (const [field, reference] of Object.entries(spec.boundVariables ?? {})) {
    const variable = variableFor(reference, context);
    if (!variable) continue;

    try {
      if (field === 'fills' || field === 'strokes') {
        node[field] = paintsBoundTo(node[field], variable);
      } else {
        node.setBoundVariable(field, variable);
      }
      context.stats.bound += 1;
    } catch (error) {
      context.stats.failed += 1;
      context.log.warn(
        `${spec.name ?? spec.type}: ${field} kon niet aan ${reference.name} gebonden worden: ${error.message}`
      );
    }
  }
}

/**
 * De paints voor een icoon, met de tekstkleur-variable eraan gebonden.
 * Een icoon is in Figma een frame met vectoren erin; de kleur hoort op die
 * vectoren, dus de binding gaat niet via het frame maar via de paints zelf.
 */
function vectorPaints(spec, context) {
  const reference = spec.boundVariables?.fills;
  if (!reference) return spec.fills;

  const variable = variableFor(reference, context);
  if (!variable) return spec.fills;

  try {
    const paints = paintsBoundTo(spec.fills, variable);
    context.stats.bound += 1;
    return paints;
  } catch (error) {
    context.stats.failed += 1;
    context.log.warn(
      `${spec.name ?? 'icon'}: kleur kon niet aan ${reference.name} gebonden worden: ${error.message}`
    );
    return spec.fills;
  }
}

function applyPaints(target, spec) {
  if (spec.fills) target.fills = spec.fills;
  if (spec.strokes) {
    target.strokes = spec.strokes;
    if (spec.strokeWeight !== undefined)
      target.strokeWeight = spec.strokeWeight;
    if (spec.dashPattern) target.dashPattern = spec.dashPattern;
  }
}

function applyCorners(target, spec) {
  if (spec.cornerRadius !== undefined) {
    target.cornerRadius = spec.cornerRadius;
    return;
  }
  for (const corner of [
    'topLeftRadius',
    'topRightRadius',
    'bottomRightRadius',
    'bottomLeftRadius',
  ]) {
    if (spec[corner] !== undefined) target[corner] = spec[corner];
  }
}

function applyAutoLayout(frame, spec) {
  if (!spec.layoutMode || spec.layoutMode === 'NONE') return;
  frame.layoutMode = spec.layoutMode;

  if (spec.layoutMode === 'GRID') {
    if (spec.gridColumnCount) frame.gridColumnCount = spec.gridColumnCount;
    if (spec.gridRowCount) frame.gridRowCount = spec.gridRowCount;
    if (spec.gridColumnGap !== undefined)
      frame.gridColumnGap = spec.gridColumnGap;
    if (spec.gridRowGap !== undefined) frame.gridRowGap = spec.gridRowGap;
    if (spec.gridItemsPositioning) {
      frame.gridItemsPositioning = spec.gridItemsPositioning;
    }
    // Zonder deze twee blijft Figma bij zijn eigen standaard (alle tracks
    // FLEX) en worden alle kolommen even breed, ongeacht de CSS.
    if (spec.gridColumnSizes) frame.gridColumnSizes = spec.gridColumnSizes;
    if (spec.gridRowSizes) frame.gridRowSizes = spec.gridRowSizes;
  } else {
    if (spec.itemSpacing !== undefined) frame.itemSpacing = spec.itemSpacing;
    if (spec.layoutWrap) frame.layoutWrap = spec.layoutWrap;
    if (spec.primaryAxisAlignItems) {
      frame.primaryAxisAlignItems = spec.primaryAxisAlignItems;
    }
    if (spec.counterAxisAlignItems) {
      frame.counterAxisAlignItems = spec.counterAxisAlignItems;
    }
  }

  for (const side of [
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
  ]) {
    if (spec[side] !== undefined) frame[side] = spec[side];
  }
}

/** Plaatsing van een kind binnen zijn ouder: absoluut of in een gridcel. */
function applyPlacement(node, spec, log) {
  try {
    if (spec.layoutPositioning === 'ABSOLUTE') {
      node.layoutPositioning = 'ABSOLUTE';
      if (spec.x !== undefined) node.x = spec.x;
      if (spec.y !== undefined) node.y = spec.y;
      return;
    }
    if (spec.gridColumnAnchorIndex !== undefined) {
      // gridColumnAnchorIndex en gridRowAnchorIndex zijn read-only; plaatsing
      // gaat via deze methode, en die neemt de rij als eerste argument.
      node.setGridChildPosition(
        spec.gridRowAnchorIndex,
        spec.gridColumnAnchorIndex
      );
      if (spec.gridColumnSpan) node.gridColumnSpan = spec.gridColumnSpan;
      if (spec.gridRowSpan) node.gridRowSpan = spec.gridRowSpan;
    }
    if (spec.layoutAlign) node.layoutAlign = spec.layoutAlign;
  } catch (error) {
    log.warn(`${spec.name ?? spec.type}: plaatsing mislukt: ${error.message}`);
  }
}

/** Sizing als laatste: HUG vereist een eigen layoutMode, FILL een auto-layout ouder. */
function applySizing(node, spec, log) {
  for (const axis of ['layoutSizingHorizontal', 'layoutSizingVertical']) {
    const value = spec[axis];
    if (!value) continue;
    try {
      node[axis] = value;
    } catch {
      // Niet elke combinatie is geldig (FILL zonder auto-layout ouder,
      // HUG zonder layoutMode). De gemeten afmeting blijft dan staan.
      log.warn(`${spec.name ?? spec.type}: ${axis}=${value} niet toegestaan`);
    }
  }
}

/**
 * Bouwt één node uit de spec en hangt hem aan `parent`.
 *
 * @param {object} spec node spec uit de generator
 * @param {BaseNode} parent
 * @param {object} context `{ fonts, log, variables, stats }`
 * @returns {SceneNode}
 */
function buildNode(spec, parent, context) {
  const { fonts, log } = context;

  if (spec.type === 'TEXT') {
    const text = figma.createText();
    parent.appendChild(text);

    const key = `${spec.fontFamily}|${fontFor(spec).style}`;
    text.fontName = fonts.get(key) ?? FALLBACK_FONT;
    text.characters = spec.characters ?? '';
    if (spec.fontSize) text.fontSize = spec.fontSize;
    if (spec.letterSpacing !== undefined) {
      text.letterSpacing = { unit: 'PIXELS', value: spec.letterSpacing };
    }
    if (spec.lineHeight) text.lineHeight = spec.lineHeight;
    if (spec.textAlignHorizontal) {
      text.textAlignHorizontal = spec.textAlignHorizontal;
    }
    if (spec.textDecoration) text.textDecoration = spec.textDecoration;
    if (spec.textCase) text.textCase = spec.textCase;
    if (spec.fills) text.fills = spec.fills;
    text.name = spec.name ?? spec.characters ?? 'Text';

    applyBindings(text, spec, context);
    applyPlacement(text, spec, log);
    applySizing(text, spec, log);
    return text;
  }

  if (spec.type === 'VECTOR') {
    // createNodeFromSvg levert een frame met de vectoren erin. Dat is precies
    // wat we willen: één node die het icoon voorstelt.
    const node = figma.createNodeFromSvg(spec.svg);
    parent.appendChild(node);
    node.name = spec.name ?? 'icon';
    if (spec.width && spec.height) node.resize(spec.width, spec.height);
    // De kleur zit op de vectoren binnenin, niet op het frame eromheen, dus de
    // binding moet mee in de paints die recolorSvg doorzet.
    recolorSvg(node, vectorPaints(spec, context));
    applyPlacement(node, spec, log);
    return node;
  }

  const frame = figma.createFrame();
  parent.appendChild(frame);
  applyFrame(frame, spec, context);

  applyPlacement(frame, spec, log);
  applySizing(frame, spec, log);
  return frame;
}

/**
 * Zet een frame-spec op een bestaande node en bouwt zijn kinderen.
 *
 * Staat los van `buildNode` omdat het root-element van een component geen eigen
 * frame krijgt: het *is* het component. Zie `importComponentSet`.
 */
function applyFrame(frame, spec, context) {
  frame.name = spec.name ?? 'Frame';

  // Een nieuw frame heeft een witte vulling; die overschrijven we altijd,
  // ook met een lege lijst, anders krijgt elk transparant element wit.
  frame.fills = spec.fills ?? [];
  applyPaints(frame, spec);
  applyCorners(frame, spec);
  if (spec.opacity !== undefined) frame.opacity = spec.opacity;
  if (spec.clipsContent !== undefined) frame.clipsContent = spec.clipsContent;
  if (spec.width && spec.height) frame.resize(spec.width, spec.height);

  applyAutoLayout(frame, spec);
  // Na applyAutoLayout: padding en itemSpacing bestaan pas als het frame een
  // layoutMode heeft.
  applyBindings(frame, spec, context);

  for (const child of spec.children ?? []) buildNode(child, frame, context);
}

/**
 * Importeert een volledige component set.
 *
 * @param {object} payload de inhoud van een {component}.json
 * @param {object} log verzamelaar met .info/.warn/.error
 */
export async function importComponentSet(payload, log) {
  if (payload.$schema !== 'dsn-figma-components/1') {
    throw new Error(
      `Onbekend formaat: ${payload.$schema ?? 'geen $schema'}. Verwacht dsn-figma-components/1.`
    );
  }

  const spec = payload.componentSet;

  // Alle fonts van alle varianten in één keer laden.
  const fonts = new Map();
  for (const component of spec.components) collectFonts(component.node, fonts);
  const loaded = await loadFonts(fonts, log);

  // De variables moeten er zijn vóórdat er lagen aan gebonden worden. Zijn ze
  // er niet, dan levert doorgaan een component set op die er goed uitziet maar
  // de theme-schakelaar niet volgt: precies het probleem dat deze import moet
  // oplossen. Dan liever weigeren dan stil een halfbakken library neerzetten.
  const variables = await loadVariableIndex();
  const required = payload.bindings?.collections ?? [];
  if (
    required.length &&
    !required.some((name) => variables.collections.has(name))
  ) {
    throw new Error(
      `Dit bestand heeft nog geen ${required.join(' / ')}. Importeer eerst design-tokens/dist/figma/variables.json; anders krijgen de componenten vaste waarden en volgen ze de theme-schakelaar niet.`
    );
  }

  const stats = { bound: 0, failed: 0, missing: new Set() };
  const context = { fonts: loaded, log, variables, stats };

  const page = figma.currentPage;
  const components = [];
  let cursorX = 0;
  let rowHeight = 0;

  for (const [index, component] of spec.components.entries()) {
    const wrapper = figma.createComponent();
    page.appendChild(wrapper);

    // Het root-element wórdt het component. Een extra frame eromheen zou een
    // lege laag met dezelfde auto layout toevoegen, en dat is precies de
    // nesting die een Figma-library onwerkbaar maakt.
    if (component.node.type === 'FRAME') {
      applyFrame(wrapper, component.node, context);
      applySizing(wrapper, component.node, log);
    } else {
      // Een component dat in zijn geheel tot tekst of een vector inklapt kan
      // zichzelf niet zijn; die krijgt wel een frame om zich heen.
      wrapper.layoutMode = 'HORIZONTAL';
      wrapper.primaryAxisSizingMode = 'AUTO';
      wrapper.counterAxisSizingMode = 'AUTO';
      wrapper.fills = [];
      buildNode(component.node, wrapper, context);
    }

    // Na applyFrame, die de naam van het root-element zet. Deze naam bepaalt de
    // variant properties zodra combineAsVariants draait.
    wrapper.name = component.name;

    // Varianten naast elkaar leggen; combineAsVariants ordent daarna zelf.
    wrapper.x = cursorX;
    wrapper.y = 0;
    cursorX += wrapper.width + 40;
    rowHeight = Math.max(rowHeight, wrapper.height);
    components.push(wrapper);

    if ((index + 1) % 6 === 0) {
      cursorX = 0;
    }
  }

  let set;
  try {
    set = figma.combineAsVariants(components, page);
    set.name = spec.name;
    set.layoutMode = 'VERTICAL';
    set.itemSpacing = 24;
    set.counterAxisSizingMode = 'AUTO';
    set.primaryAxisSizingMode = 'AUTO';
  } catch (error) {
    log.error(
      `Component set "${spec.name}" kon niet gecombineerd worden: ${error.message}. De losse varianten staan wel op de pagina.`
    );
    return {
      name: spec.name,
      variants: components.length,
      combined: false,
      bindings: reportBindings(payload, stats, log),
    };
  }

  log.info(`${spec.name}: ${components.length} varianten gecombineerd`);
  reportBindings(payload, stats, log);

  if (payload.warnings && payload.warnings.length) {
    for (const warning of payload.warnings) log.warn(warning);
  }

  figma.currentPage.selection = [set];
  figma.viewport.scrollAndZoomIntoView([set]);

  return {
    name: spec.name,
    variants: components.length,
    combined: true,
    bindings: { ...stats, missing: [...stats.missing] },
  };
}

/**
 * Meldt hoeveel lagen aan een variable hangen, en wat er niet gelukt is.
 * Een ontbrekende variable is geen fout maar wel iets om te zien: die laag
 * houdt een vaste waarde en volgt de theme-schakelaar niet.
 */
function reportBindings(payload, stats, log) {
  const expected = payload.bindings?.bound;
  log.info(
    `${stats.bound} lagen aan een variable gebonden${expected !== undefined ? ` van de ${expected} verwachte` : ''}`
  );

  for (const name of stats.missing) {
    log.warn(
      `Variable ${name} bestaat niet in dit bestand; vaste waarde blijft staan`
    );
  }

  return { ...stats, missing: [...stats.missing] };
}
