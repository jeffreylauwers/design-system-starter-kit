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

import {
  applyBindings,
  createStats,
  loadVariableIndex,
  paintsForVector,
  requireCollections,
} from './bindings.js';
import { recolorVectors } from './svg.js';
import { ICON_PAGE, loadIconIndex } from './icons.js';

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

/**
 * Minimum-maten uit de CSS.
 *
 * Een HUG-frame rekent zijn maat opnieuw uit content plus padding, dus zonder
 * deze zou een `min-block-size` uit de CSS in Figma verdwijnen en zou de button
 * onder zijn aanraakdoel uitkomen.
 */
function applyMinimumSizes(frame, spec, log) {
  for (const field of ['minWidth', 'minHeight']) {
    if (spec[field] === undefined) continue;
    try {
      frame[field] = spec[field];
    } catch (error) {
      log.warn(
        `${spec.name ?? spec.type}: ${field} niet toegestaan: ${error.message}`
      );
    }
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
 * Het icoon als instance van het icooncomponent, of anders ingebakken.
 *
 * Een instance is het verschil tussen een icoon dat meebeweegt met de iconset
 * en 81 losse kopieën. Het is bovendien de harde eis van een instance swap
 * property: die verwisselt het `mainComponent` van een instance, en een uit SVG
 * opgebouwd frame heeft er geen.
 *
 * Staat het icoon niet in de index, dan valt dit terug op de ingebakken SVG.
 * Dat levert hetzelfde plaatje op; alleen het wisselen en het meebewegen
 * vervallen. De melding gaat één keer per icoonnaam de log in, niet 81 keer.
 */
function buildIcon(spec, parent, context) {
  const component = context.icons.get(spec.name);

  if (component) {
    const instance = component.createInstance();
    parent.appendChild(instance);
    instance.name = spec.name;
    if (spec.width && spec.height) instance.resize(spec.width, spec.height);
    return instance;
  }

  if (spec.name && !context.inlinedIcons.has(spec.name)) {
    context.inlinedIcons.add(spec.name);
    context.log.warn(
      `Icoon "${spec.name}" staat niet op de pagina ${ICON_PAGE} en is ingebakken. Importeer eerst icons.json; anders is dit icoon niet te wisselen en volgt het geen iconwijziging.`
    );
  }

  // createNodeFromSvg levert een frame met de vectoren erin: één node die het
  // icoon voorstelt.
  const node = figma.createNodeFromSvg(spec.svg);
  parent.appendChild(node);
  node.name = spec.name ?? 'icon';
  if (spec.width && spec.height) node.resize(spec.width, spec.height);
  return node;
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
    registerSlot(text, spec, context);
    return text;
  }

  if (spec.type === 'VECTOR') {
    const node = buildIcon(spec, parent, context);
    // De kleur zit op de vectoren binnenin, niet op het frame eromheen, dus de
    // binding moet mee in de paints die eroverheen worden gezet. Bij een
    // instance is dat een override op de geneste lagen, precies zoals een
    // designer die met de hand zou leggen.
    recolorVectors(node.children ?? [], paintsForVector(spec, context));
    applyPlacement(node, spec, log);
    registerSlot(node, spec, context);
    return node;
  }

  const frame = figma.createFrame();
  parent.appendChild(frame);
  applyFrame(frame, spec, context);

  applyPlacement(frame, spec, log);
  applySizing(frame, spec, log);
  registerSlot(frame, spec, context);
  return frame;
}

/**
 * Onthoudt welke gebouwde laag bij welk `data-figma-slot` uit de matrix hoort.
 *
 * De koppeling loopt via de spec en niet via de laagnaam: een naam is niet
 * uniek en verandert zodra de CSS-klasse verandert, en dan zou een property
 * stilletjes aan de verkeerde laag komen te hangen.
 */
function registerSlot(node, spec, context) {
  if (spec.componentSlot) context.slots.set(spec.componentSlot, node);
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
  // Na applyAutoLayout: padding, itemSpacing en de minimum-maten bestaan pas
  // als het frame een layoutMode heeft.
  applyMinimumSizes(frame, spec, context.log);
  applyBindings(frame, spec, context);

  for (const child of spec.children ?? []) buildNode(child, frame, context);
}

// =============================================================================
// COMPONENT PROPERTIES
// =============================================================================

/** Het veld dat elk propertytype op een laag aanstuurt. */
const FIELD_FOR_TYPE = {
  TEXT: 'characters',
  BOOLEAN: 'visible',
  INSTANCE_SWAP: 'mainComponent',
};

/**
 * De standaardwaarde die Figma bij dit propertytype verwacht.
 *
 * INSTANCE_SWAP is het lastige geval: de generator noemt een icoon bij naam,
 * en Figma wil een verwijzing naar het component. De Plugin API accepteert
 * daar historisch zowel de `key` als de node-id, afhankelijk van versie en van
 * of het component gepubliceerd is. Beide worden daarom geprobeerd, en welke
 * het werd staat in de log; stil de verkeerde kiezen zou een property
 * opleveren die pas in Figma zelf blijkt te weigeren.
 */
function defaultValuesFor(property, targets, context) {
  if (property.type === 'TEXT') {
    return [property.default ?? targets[0].characters ?? ''];
  }
  if (property.type === 'BOOLEAN') {
    return [property.default ?? true];
  }

  const component = context.icons.get(property.default);
  if (!component) return null;
  return [component.key, component.id].filter(Boolean);
}

/**
 * De iconen die de swap-lijst als eerste toont. Zonder dit moet een designer
 * elk icoon uit het hele bestand bij elkaar zoeken.
 */
function preferredIcons(context) {
  const values = [...context.icons.values()]
    .filter((component) => component.key)
    .map((component) => ({ type: 'COMPONENT', key: component.key }));
  return values.length ? { preferredValues: values } : undefined;
}

/**
 * Legt de gedeclareerde component properties op de set en koppelt de lagen.
 *
 * Alles wat hier niet lukt gaat als fout de log in. Een property die stil
 * wegvalt is precies het handwerk dat na elke import opnieuw gedaan moet
 * worden, en dat is niet te zien aan een set die er verder goed uitziet.
 */
function applyComponentProperties(set, properties, variants, context) {
  const { log } = context;
  const applied = [];

  for (const property of properties ?? []) {
    const targets = variants.map((variant) => variant.slots.get(property.slot));
    const missing = targets.filter((target) => !target).length;
    if (missing) {
      log.error(
        `Property "${property.name}": slot "${property.slot}" ontbreekt in ${missing} van de ${variants.length} varianten; niet gelegd`
      );
      continue;
    }

    if (property.type === 'INSTANCE_SWAP') {
      const notInstances = targets.filter(
        (target) => target.type !== 'INSTANCE'
      ).length;
      if (notInstances) {
        log.error(
          `Property "${property.name}" kan niet gelegd worden: de laag in slot "${property.slot}" is in ${notInstances} varianten geen instance maar een ingebakken SVG. Importeer eerst icons.json.`
        );
        continue;
      }
    }

    const defaults = defaultValuesFor(property, targets, context);
    if (!defaults) {
      log.error(
        `Property "${property.name}": icoon "${property.default}" staat niet op de pagina ${ICON_PAGE}; niet gelegd`
      );
      continue;
    }

    const options =
      property.type === 'INSTANCE_SWAP' ? preferredIcons(context) : undefined;

    let id;
    let lastError;
    for (const value of defaults) {
      try {
        id = set.addComponentProperty(
          property.name,
          property.type,
          value,
          options
        );
        break;
      } catch (error) {
        lastError = error;
      }
    }

    if (!id) {
      log.error(
        `Property "${property.name}" (${property.type}) kon niet aangemaakt worden: ${lastError?.message ?? 'onbekende fout'}`
      );
      continue;
    }

    // De lagen op de standaardstand zetten vóór de koppeling: daarna bepaalt
    // de property de waarde, en een laag die daar niet mee overeenkomt laat de
    // set iets anders zien dan de property zegt.
    const field = FIELD_FOR_TYPE[property.type];
    let failed = 0;
    for (const target of targets) {
      try {
        if (property.type === 'BOOLEAN') target.visible = defaults[0];
        target.componentPropertyReferences = {
          ...target.componentPropertyReferences,
          [field]: id,
        };
      } catch (error) {
        failed += 1;
        lastError = error;
      }
    }

    if (failed) {
      log.error(
        `Property "${property.name}" is aangemaakt maar niet gekoppeld aan ${failed} van de ${targets.length} lagen: ${lastError.message}`
      );
      continue;
    }

    applied.push(property.name);
  }

  if (applied.length) {
    log.info(`Component properties gelegd: ${applied.join(', ')}`);
  }

  return applied;
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

  // De variables moeten er zijn vóórdat er lagen aan gebonden worden.
  const variables = await loadVariableIndex();
  requireCollections(payload.bindings?.collections ?? [], variables);

  // De icooncomponenten uit een eerdere icons.json-import. Ontbreken ze, dan
  // worden de iconen ingebakken en meldt buildIcon dat.
  const icons = await loadIconIndex();

  const stats = createStats();
  const context = {
    fonts: loaded,
    log,
    variables,
    stats,
    icons,
    inlinedIcons: new Set(),
    // Per variant opnieuw gevuld; zie de bouwlus hieronder.
    slots: new Map(),
  };

  const page = figma.currentPage;
  const components = [];
  let cursorX = 0;
  let rowHeight = 0;

  const variantSlots = [];

  for (const [index, component] of spec.components.entries()) {
    const wrapper = figma.createComponent();
    page.appendChild(wrapper);

    // Elke variant heeft zijn eigen lagen, dus ook zijn eigen slots.
    context.slots = new Map();

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
    variantSlots.push({ component: wrapper, slots: context.slots });

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

  // Na combineAsVariants: component properties horen op de set, niet op de
  // losse varianten.
  const properties = applyComponentProperties(
    set,
    spec.componentProperties,
    variantSlots,
    context
  );

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
    properties,
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
