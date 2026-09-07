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
import { findOrCreatePage, openPage, sortManagedPages } from './pages.js';

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
    // Na strokeWeight: dat veld zet in Figma alle vier de zijden tegelijk, dus
    // de losse diktes moeten erna komen. Zonder deze stap loopt de accentrand
    // van een Note rondom in plaats van alleen aan de inline-start.
    for (const [field, weight] of Object.entries(spec.strokeWeights ?? {})) {
      target[field] = weight;
    }
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
    // Overal een expliciete waarde, ook als de spec het veld niet noemt. Op een
    // vers frame is dat de standaard en verandert er niets, maar een variant die
    // uit een vorige import wordt hergebruikt houdt anders een gap of een
    // uitlijning die in de nieuwe spec niet meer staat.
    frame.itemSpacing = spec.itemSpacing ?? 0;
    frame.layoutWrap = spec.layoutWrap ?? 'NO_WRAP';
    frame.primaryAxisAlignItems = spec.primaryAxisAlignItems ?? 'MIN';
    frame.counterAxisAlignItems = spec.counterAxisAlignItems ?? 'MIN';
  }

  for (const side of [
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
  ]) {
    frame[side] = spec[side] ?? 0;
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

  // De gemeten maat wordt in applyFrame gezet, maar dat gebeurt vóór de auto
  // layout en vóór de kinderen. Daarna rekent Figma de maat opnieuw uit, en
  // FIXED bevriest dus niet de gemeten waarde maar wat Figma er zelf van
  // maakte. Zichtbaar bij Checkbox als `20.08 x 24`: de breedte was gekrompen
  // naar het vinkje en dáár vastgezet.
  //
  // Een FIXED as krijgt daarom hier zijn gemeten maat terug, ná alles wat hem
  // kon verschuiven.
  const fixedWidth = spec.layoutSizingHorizontal === 'FIXED' && spec.width;
  const fixedHeight = spec.layoutSizingVertical === 'FIXED' && spec.height;
  if (!fixedWidth && !fixedHeight) return;

  try {
    node.resize(
      fixedWidth ? spec.width : node.width,
      fixedHeight ? spec.height : node.height
    );
  } catch (error) {
    log.warn(
      `${spec.name ?? spec.type}: kon de gemeten maat niet terugzetten: ${error.message}`
    );
    return;
  }

  // `resize` zet een as die op HUG stond om naar FIXED. Bij een node die maar
  // op één as vast is (een Alert is FIXED breed en HUG hoog) zou de hoogte
  // daarmee stilletjes bevriezen en niet meer meegroeien met zijn tekst.
  for (const axis of ['layoutSizingHorizontal', 'layoutSizingVertical']) {
    if (spec[axis] !== 'HUG') continue;
    try {
      node[axis] = 'HUG';
    } catch {
      log.warn(
        `${spec.name ?? spec.type}: ${axis}=HUG niet hersteld na resize`
      );
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

/**
 * Velden waarvan de binding op de paints zelf zit en niet op de node.
 * `setBoundVariable` weigert ze; ze verdwijnen vanzelf zodra de paints
 * vervangen worden.
 */
const PAINT_FIELDS = new Set(['fills', 'strokes']);

/** Maakt elke variable-binding op deze node los. */
function clearBoundVariables(node) {
  for (const field of Object.keys(node.boundVariables ?? {})) {
    if (PAINT_FIELDS.has(field)) continue;
    try {
      node.setBoundVariable(field, null);
    } catch {
      // Niet elk veld laat zich losmaken. De spec zet er verderop hoe dan ook
      // een waarde overheen; blijft er een binding op staan, dan wint die, en
      // dat is minder erg dan hier afbreken.
    }
  }
}

/**
 * Zet een hergebruikte variant terug naar de staat van een vers component.
 *
 * Dit is de kern van het bijwerken: het component zélf blijft bestaan, alleen
 * zijn inhoud gaat eruit. Elke geplaatste instance hangt aan de node-id van dit
 * component, en een nieuw component met dezelfde naam is voor Figma een ander
 * component: dan raakt elke instance los. Dezelfde afweging als bij de iconen.
 *
 * De prijs is dat overrides die een designer op de gestapelde lagen van een
 * instance heeft gelegd wegvallen, want Figma zoekt die terug via het laagpad
 * en dat pad wordt opnieuw opgebouwd. De instance blijft wel aan zijn component
 * hangen, en dat is het verschil tussen een import die je kunt draaien en een
 * die je niet kunt draaien.
 *
 * Alles wat `applyFrame` alleen zet wanneer de spec het noemt moet hier weg.
 * Anders houdt een variant een rand, een radius of een gap uit de vorige
 * import die in de nieuwe spec niet meer voorkomt.
 */
function resetVariant(component) {
  for (const child of [...component.children]) child.remove();

  clearBoundVariables(component);
  component.componentPropertyReferences = {};

  // Vóór het weghalen van de auto layout: minWidth en minHeight bestaan
  // daarzonder niet, dus daarna zijn ze niet meer los te maken.
  for (const field of ['minWidth', 'minHeight']) {
    try {
      component[field] = null;
    } catch {
      // Stond er geen auto layout op, dan staat er ook geen minimum-maat.
    }
  }

  component.layoutMode = 'NONE';
  component.fills = [];
  component.strokes = [];
  component.dashPattern = [];
  component.cornerRadius = 0;
  component.opacity = 1;
  component.clipsContent = true;
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
 * De properties die al op de set staan, op naam.
 *
 * De variant-assen (`size`, `variant`, ...) staan hier ook in, maar die komen
 * uit de variantnamen en worden niet door de generator gedeclareerd; ze horen
 * dus niet in deze afweging thuis.
 */
function existingProperties(set) {
  const byName = new Map();
  for (const [propertyId, definition] of Object.entries(
    set.componentPropertyDefinitions ?? {}
  )) {
    if (definition.type === 'VARIANT') continue;
    byName.set(definition.name, { propertyId, ...definition });
  }
  return byName;
}

/**
 * Zorgt dat de property op de set staat en geeft zijn id terug.
 *
 * Bestaat hij al met hetzelfde type, dan wordt hij bijgewerkt in plaats van
 * opnieuw aangemaakt. Dat is niet cosmetisch: Figma bewaart de waarde die een
 * instance aan een property geeft onder de property-id, dus een property
 * weggooien en opnieuw aanmaken zet elke instance terug op de standaardwaarde.
 *
 * Van type wisselen kan niet; dan moet de oude er wel uit, en dat wordt gemeld.
 */
function ensureComponentProperty(set, property, defaults, options, known, log) {
  const existing = known.get(property.name);
  let lastError;

  if (existing && existing.type !== property.type) {
    log.warn(
      `Property "${property.name}" wijzigt van ${existing.type} naar ${property.type}; opnieuw aangemaakt, instances vallen terug op de standaardwaarde`
    );
    try {
      set.deleteComponentProperty(existing.propertyId);
    } catch (error) {
      lastError = error;
    }
  } else if (existing) {
    for (const value of defaults) {
      try {
        return {
          id: set.editComponentProperty(existing.propertyId, {
            defaultValue: value,
            ...(options ?? {}),
          }),
          reused: true,
        };
      } catch (error) {
        lastError = error;
      }
    }
    return { id: null, error: lastError, reused: true };
  }

  for (const value of defaults) {
    try {
      return {
        id: set.addComponentProperty(
          property.name,
          property.type,
          value,
          options
        ),
        reused: false,
      };
    } catch (error) {
      lastError = error;
    }
  }

  return { id: null, error: lastError };
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
  const known = existingProperties(set);

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

    const outcome = ensureComponentProperty(
      set,
      property,
      defaults,
      options,
      known,
      log
    );
    const id = outcome.id;
    let lastError = outcome.error;

    if (!id) {
      log.error(
        `Property "${property.name}" (${property.type}) kon niet ${outcome.reused ? 'bijgewerkt' : 'aangemaakt'} worden: ${lastError?.message ?? 'onbekende fout'}`
      );
      continue;
    }

    known.delete(property.name);

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

  // Wat na de lus in `known` overblijft staat wel op de set maar niet meer in
  // de spec. Verwijderen zou de waarde wegnemen die instances eraan hebben
  // gegeven, dus dat blijft een beslissing van een mens.
  for (const name of known.keys()) {
    log.warn(
      `Property "${name}" staat wel op ${set.name} in Figma maar niet meer in de spec; handmatig verwijderen als dat de bedoeling is`
    );
  }

  return applied;
}

/**
 * De opmaak van de component set zelf: de plaat waar de varianten op staan.
 *
 * Varianten onder elkaar met lucht ertussen, op de documentachtergrond van het
 * design system in plaats van op het grijs van Figma. Die achtergrond wordt aan
 * zijn variable gebonden, zodat een designer die de `dsn/Primitives`-mode naar
 * `start-dark` zet niet naar donkere componenten op een lichte plaat kijkt.
 *
 * Zonder canvas in de spec blijft het gedrag van vóór deze stap: alleen de
 * verticale stapeling, zodat een oudere `dist/{component}.json` niet omvalt.
 */
function applyCanvas(set, canvas, context) {
  set.layoutMode = 'VERTICAL';
  set.counterAxisSizingMode = 'AUTO';
  set.primaryAxisSizingMode = 'AUTO';
  // Bij een bestaande set: wat de vorige import bond en de nieuwe spec niet
  // meer noemt zou anders blijven staan en de nieuwe waarde overrulen.
  clearBoundVariables(set);

  if (!canvas) {
    set.itemSpacing = 24;
    return;
  }

  set.itemSpacing = canvas.itemSpacing;
  // Na layoutMode: Figma kent padding alleen op een auto-layout frame.
  for (const side of [
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
  ]) {
    set[side] = canvas.padding;
  }

  if (canvas.fills) set.fills = canvas.fills;
  // Met de naam van de set erbij, zodat een mislukte binding te herleiden is.
  applyBindings(set, { ...canvas, name: set.name }, context);
}

/**
 * Importeert een volledige component set: nieuw of bijgewerkt.
 *
 * Staat er al een set met deze naam op de pagina, dan wordt die bijgewerkt.
 * Elke geplaatste instance hangt aan de node-id van zijn variant, dus een
 * variant die opnieuw wordt aangemaakt laat elke instance los; zie
 * `resetVariant`.
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

  // Eén pagina per component. `createNodeFromSvg` (voor de ingebakken iconen)
  // en `combineAsVariants` werken op de huidige pagina, dus die moet ook echt
  // open staan en niet alleen bestaan.
  const page = spec.page
    ? await findOrCreatePage(spec.page)
    : figma.currentPage;
  await openPage(page);

  // Een bestaande set wordt bijgewerkt, niet vervangen. Elke geplaatste
  // instance hangt aan de node-id van zijn variant; een nieuwe variant met
  // dezelfde naam is voor Figma een ander component en laat elke instance los.
  const existingSets = page.children.filter(
    (node) => node.type === 'COMPONENT_SET' && node.name === spec.name
  );
  const target = existingSets[0] ?? null;

  if (existingSets.length > 1) {
    log.warn(
      `Er staan ${existingSets.length} sets "${spec.name}" op ${page.name}; alleen de bovenste is bijgewerkt. De rest komt uit een oudere plugin-versie en kan weg zodra de instances zijn overgezet.`
    );
  }

  const knownVariants = new Map(
    (target?.children ?? [])
      .filter((node) => node.type === 'COMPONENT')
      .map((node) => [node.name, node])
  );

  // Tijdens het bouwen mag de set geen auto layout hebben. Een variant die in
  // een auto-layout ouder hangt krijgt andere sizing-regels dan een die los op
  // de pagina staat, en dan zou een tweede import iets anders opleveren dan de
  // eerste. `applyCanvas` zet de stapeling verderop terug.
  if (target) target.layoutMode = 'NONE';

  const components = [];
  const variantSlots = [];
  let created = 0;
  let updated = 0;
  let cursorX = 0;

  for (const [index, component] of spec.components.entries()) {
    const known = knownVariants.get(component.name);
    const wrapper = known ?? figma.createComponent();

    if (known) {
      resetVariant(wrapper);
      updated += 1;
    } else {
      // De naam vóór het aanhangen: een component set leidt zijn variant-assen
      // uit de naam af, en een net aangemaakt component heet "Component 1".
      // Dat is geen geldige variantnaam, en de set zou er in Figma op klagen.
      wrapper.name = component.name;
      // Een nieuwe variant hangt meteen in de set als die er al is; anders op
      // de pagina, waar `combineAsVariants` hem straks ophaalt.
      (target ?? page).appendChild(wrapper);
      created += 1;
    }

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

    // Alleen bij een verse import: varianten naast elkaar leggen zodat
    // combineAsVariants ze kan ophalen. Zit de variant al in een set, dan
    // bepaalt de auto layout van die set zijn plek.
    if (!target) {
      wrapper.x = cursorX;
      wrapper.y = 0;
      cursorX += wrapper.width + 40;
      if ((index + 1) % 6 === 0) cursorX = 0;
    }

    components.push(wrapper);
    variantSlots.push({ component: wrapper, slots: context.slots });
  }

  let set = target;
  if (!set) {
    try {
      set = figma.combineAsVariants(components, page);
      set.name = spec.name;
    } catch (error) {
      log.error(
        `Component set "${spec.name}" kon niet gecombineerd worden: ${error.message}. De losse varianten staan wel op de pagina.`
      );
      return {
        name: spec.name,
        variants: components.length,
        created,
        updated,
        orphans: [],
        combined: false,
        bindings: reportBindings(payload, stats, log),
      };
    }
  }

  // Varianten die uit de spec verdwenen zijn blijven staan. Ze automatisch
  // verwijderen zou elke instance ervan detachen, en dat is een beslissing van
  // een mens. Dezelfde afweging als bij een icoon dat uit de assets-map valt.
  const inSpec = new Set(spec.components.map((component) => component.name));
  const orphans = [...knownVariants.keys()].filter((name) => !inSpec.has(name));
  for (const name of orphans) {
    log.warn(
      `Variant "${name}" staat wel in ${spec.name} in Figma maar niet meer in de spec; handmatig verwijderen als dat de bedoeling is`
    );
  }

  applyCanvas(set, spec.canvas, context);

  log.info(
    `${spec.name}: ${components.length} varianten (${created} nieuw, ${updated} bijgewerkt)`
  );
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

  // Pas nadat de pagina bestaat: de nieuwe pagina moet mee in de sortering.
  await sortManagedPages();

  figma.currentPage.selection = [set];
  figma.viewport.scrollAndZoomIntoView([set]);

  return {
    name: spec.name,
    page: page.name,
    variants: components.length,
    created,
    updated,
    orphans,
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
