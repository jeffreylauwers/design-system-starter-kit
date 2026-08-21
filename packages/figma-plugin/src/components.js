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
      node.gridColumnAnchorIndex = spec.gridColumnAnchorIndex;
      node.gridRowAnchorIndex = spec.gridRowAnchorIndex;
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
 * @returns {SceneNode}
 */
function buildNode(spec, parent, fonts, log) {
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
    applyPlacement(node, spec, log);
    return node;
  }

  const frame = figma.createFrame();
  parent.appendChild(frame);
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
  for (const child of spec.children ?? []) buildNode(child, frame, fonts, log);

  applyPlacement(frame, spec, log);
  applySizing(frame, spec, log);
  return frame;
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

  const page = figma.currentPage;
  const components = [];
  let cursorX = 0;
  let rowHeight = 0;

  for (const [index, component] of spec.components.entries()) {
    const wrapper = figma.createComponent();
    page.appendChild(wrapper);
    // De naam bepaalt de variant properties zodra combineAsVariants draait.
    wrapper.name = component.name;
    wrapper.layoutMode = 'HORIZONTAL';
    wrapper.primaryAxisSizingMode = 'AUTO';
    wrapper.counterAxisSizingMode = 'AUTO';
    wrapper.fills = [];

    buildNode(component.node, wrapper, loaded, log);

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
    return { name: spec.name, variants: components.length, combined: false };
  }

  log.info(`${spec.name}: ${components.length} varianten gecombineerd`);

  if (payload.warnings && payload.warnings.length) {
    for (const warning of payload.warnings) log.warn(warning);
  }

  figma.currentPage.selection = [set];
  figma.viewport.scrollAndZoomIntoView([set]);

  return { name: spec.name, variants: components.length, combined: true };
}
