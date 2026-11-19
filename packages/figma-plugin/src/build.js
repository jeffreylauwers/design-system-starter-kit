/**
 * Bouwt de lagen van een variant uit de spec: frames, tekst, iconen, SVG's die
 * geen icoon zijn, instances van andere sets en slots.
 *
 * `buildNode` en `applyFrame` roepen elkaar aan (een frame bouwt zijn
 * kinderen), en staan daarom in hetzelfde bestand.
 */

import {
  applyBindings,
  applyEffects,
  applySizeBindings,
  paintsForVector,
} from './bindings.js';
import { ICON_PAGE } from './contract.js';
import { FALLBACK_FONT, fontFor } from './fonts.js';
import { applyOverrides } from './instances.js';
import {
  applyAutoLayout,
  applyCorners,
  applyMeasuredSize,
  applyMinimumSizes,
  applyPaints,
  applyPlacement,
  applyRotation,
  applySizing,
} from './layout.js';
import {
  clearBoundVariables,
  insideContentSlot,
  propertyNameOf,
  rejoinFlow,
  SVG_KEY,
} from './nodes.js';
import { placeReused, takeLayer, takeReusable } from './reuse.js';
import { recolorVectors } from './svg.js';

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
    // Eerst kijken of de vorige import hier al een instance van ditzelfde
    // icooncomponent had staan. Die hergebruiken houdt zijn node-id intact, en
    // daar hangt de kleuroverride aan die een geplaatste instance moet erven;
    // zie `resetVariant`.
    const instance =
      takeReusable(context, component) ?? component.createInstance();
    parent.appendChild(instance);
    rejoinFlow(instance);
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
 * Een SVG die geen icoon is, zoals de cirkels van Spinner of de vlakken van
 * Logo.
 *
 * Die staat niet in de iconset, dus er valt niets op te zoeken of te wisselen.
 * De SVG uit de spec draagt zijn stijl al als attributen (zie `readShapes` in
 * de extractor); hier krijgt elke vorm daarbovenop zijn kleuren en lijndikte
 * uit de spec, met de bindingen erop. Zo volgt een Spinner de
 * theme-schakelaar, net als in de browser.
 *
 * Figma maakt van elke vorm een eigen laag, in de volgorde van de SVG. Komt
 * het aantal lagen niet overeen met de spec, dan is niet te zeggen welke laag
 * welke vorm is, en blijft het bij wat de SVG zelf meegaf.
 */
function buildShapes(spec, parent, context) {
  const node = figma.createNodeFromSvg(spec.svg);
  parent.appendChild(node);
  node.setPluginData?.(SVG_KEY, spec.svg);
  node.name = spec.name ?? 'vector';
  if (spec.width && spec.height) node.resize(spec.width, spec.height);

  const layers = [];
  const collect = (current) => {
    if (current.children?.length) current.children.forEach(collect);
    else layers.push(current);
  };
  node.children.forEach(collect);

  if (layers.length !== spec.shapes.length) {
    context.log.warn(
      `${spec.name}: Figma maakte ${layers.length} lagen van ${spec.shapes.length} vormen; de kleuren zijn niet aan tokens gebonden`
    );
    return node;
  }

  paintShapes(layers, spec, context);
  return node;
}

/** Zet de kleuren en lijndiktes uit de spec op de vormen, met bindingen. */
function paintShapes(layers, spec, context) {
  spec.shapes.forEach((shape, index) => {
    const layer = layers[index];
    layer.name = shape.name;
    layer.fills = shape.fills ?? [];
    layer.strokes = shape.strokes ?? [];
    if (shape.strokeWeight !== undefined) {
      layer.strokeWeight = shape.strokeWeight;
    }
    applyBindings(layer, shape, context);
  });
}

/**
 * Een component dat in zijn geheel één SVG is die geen icoon is (Logo).
 *
 * De vormen hangen direct in het component, zonder frame ertussen: dat frame
 * (wat `createNodeFromSvg` oplevert) was een laag die niets toevoegde. Elke
 * vorm schaalt mee (`SCALE`) en de verhouding staat vast, zodat een instance
 * die kleiner of groter wordt gezet, zoals het logo van 124x32 in PageHeader,
 * niet uitrekt.
 *
 * Bij een tweede import met dezelfde SVG blijven de vormen staan: een
 * instance in PageHeader heeft er overrides op (de kleuren in inverse). Zie
 * `resetVariant`.
 */
export function buildSvgComponent(component, spec, context) {
  component.layoutMode = 'NONE';
  component.fills = [];
  component.clipsContent = false;
  component.name = spec.name ?? component.name;

  const kept =
    component.getPluginData?.(SVG_KEY) === spec.svg &&
    component.children.length === spec.shapes.length;

  let layers;
  if (kept) {
    layers = [...component.children];
    for (const layer of layers) clearBoundVariables(layer);
  } else {
    for (const child of [...component.children]) child.remove();
    component.resize(spec.width, spec.height);
    const source = figma.createNodeFromSvg(spec.svg);
    layers = [];
    const collect = (current) => {
      if (current.children?.length) current.children.forEach(collect);
      else layers.push(current);
    };
    source.children.forEach(collect);
    for (const layer of layers) component.appendChild(layer);
    source.remove();
  }

  if (layers.length !== spec.shapes.length) {
    context.log.warn(
      `${spec.name}: Figma maakte ${layers.length} lagen van ${spec.shapes.length} vormen; de kleuren zijn niet aan tokens gebonden`
    );
  } else {
    paintShapes(layers, spec, context);
  }

  for (const layer of layers) {
    layer.constraints = { horizontal: 'SCALE', vertical: 'SCALE' };
  }
  if (typeof component.lockAspectRatio === 'function') {
    component.lockAspectRatio();
  } else {
    component.constrainProportions = true;
  }
  component.setPluginData?.(SVG_KEY, spec.svg);
}

/**
 * Een instance van een andere set uit de bibliotheek.
 *
 * Net als bij de iconen eerst kijken of de vorige import hier al een instance
 * van precies deze variant had staan: die hergebruiken houdt zijn node-id
 * gelijk, en daar hangen de overrides aan die een geplaatste instance van deze
 * host moet erven. Zie `resetVariant` en issue #388.
 *
 * Een hergebruikte instance krijgt eerst zijn overrides teruggezet. Anders
 * blijft een override uit de vorige import staan die de nieuwe spec niet meer
 * noemt. Of dat op een geplaatste instance van de host goed gaat, is een van
 * de dingen die alleen in Figma zelf te meten zijn.
 */
function buildInstance(spec, parent, context, parentSpec) {
  const component = context.instanceTargets.get(
    `${spec.component}|${spec.variant}`
  );
  if (!component) {
    // `resolveInstanceTargets` heeft dit vooraf al geweigerd; dit is de
    // vangrail voor een spec die tussendoor veranderde.
    throw new Error(
      `${spec.component} (${spec.variant}) staat niet in dit bestand; importeer die set eerst`
    );
  }

  const reused = takeReusable(context, component);
  const instance = reused ?? component.createInstance();
  parent.appendChild(instance);
  if (reused) rejoinFlow(instance);
  if (reused && typeof instance.resetOverrides === 'function') {
    instance.resetOverrides();
  }
  instance.name = spec.name ?? component.name;

  // Eerst de plek en de maat in de host, dan de overrides. Een override die
  // een laag binnen de instance op FILL zet vraagt een ouder die zelf niet
  // hugt, en een instance erft de HUG van zijn component tot hij hier een
  // eigen maat krijgt. Een CheckboxOption in een CheckboxGroup is daar het
  // voorbeeld van: in de groep vult zijn label de breedte.
  applyPlacement(instance, spec, context.log, parentSpec, context.pinned);
  applyMeasuredSize(instance, spec, context.log);
  // Een maat die aan een token hangt, zoals de hoogte van een Logo in
  // PageHeader. Die telt mee: er is geen `applyBindings` voor de instance.
  applySizeBindings(instance, spec, context, { count: true });

  applyOverrides(instance, spec, context);

  applyInstanceProperties(instance, spec, context);
  applyRotation(instance, spec, context.log);

  // "Exposed": de properties van het geneste component (de `label` van een
  // Heading) staan dan in het paneel van de host, zonder dat de host ze
  // opnieuw hoeft te declareren.
  // In een slot kan dat niet, ook niet dieper erin (gemeten bij #450); de
  // generator zet het daar al uit.
  if (spec.exposed && !insideContentSlot(parent)) {
    try {
      instance.isExposedInstance = true;
    } catch (error) {
      context.log.warn(
        `${spec.name}: kon de instance niet exposen (${error.message}); zijn properties staan niet in het paneel van de host`
      );
    }
  }

  registerSlot(instance, spec, context);
  return instance;
}

/**
 * Zet de properties die de generator voor deze instance meegeeft: een ander
 * icoon via een instance swap, zoals `x` op de sluitknop van ModalDialog
 * (issue #451), of een boolean uit `data-figma-properties`. Bij een icoon is de
 * waarde de naam van het icoon; Figma wil het id van het icooncomponent.
 *
 * Na `applyOverrides`: een hergebruikte instance is daar met
 * `resetOverrides` teruggezet, en dat zet ook zijn properties terug.
 */
function applyInstanceProperties(instance, spec, context) {
  const { log } = context;
  for (const [name, iconName] of Object.entries(spec.properties ?? {})) {
    const label = `${spec.name} > ${name}`;
    const current = instance.componentProperties ?? {};
    const key = Object.keys(current).find(
      (candidate) => propertyNameOf(candidate) === name
    );
    if (!key) {
      log.error(
        `${label}: ${spec.component} heeft geen property "${name}"; ${iconName} is niet gezet. Importeer ${spec.component} opnieuw.`
      );
      continue;
    }
    // Een boolean uit `data-figma-properties`, zoals `showIconStart` op de
    // verwijderknop van File: die zet een laag aan of uit, geen icoon.
    if (typeof iconName === 'boolean') {
      if (current[key].value === iconName) continue;
      try {
        instance.setProperties({ [key]: iconName });
      } catch (error) {
        log.error(`${label}: ${iconName} niet gezet: ${error.message}`);
      }
      continue;
    }
    const icon = context.icons.get(iconName);
    if (!icon) {
      log.error(
        `${label}: icoon "${iconName}" staat niet op de pagina ${ICON_PAGE}; importeer eerst icons.json`
      );
      continue;
    }
    if (current[key].value === icon.id) continue;
    try {
      instance.setProperties({ [key]: icon.id });
    } catch (error) {
      log.error(`${label}: icoon ${iconName} niet gezet: ${error.message}`);
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
export function buildNode(spec, parent, context, parentSpec) {
  const { fonts, log } = context;

  if (spec.type === 'TEXT') {
    // Een component dat uit één tekstlaag bestaat houdt die laag bij een
    // tweede import; zie `resetVariant`.
    const reused = context.reusableText;
    context.reusableText = null;
    const layer = reused ? null : takeLayer(context, 'TEXT');
    const text = reused ?? layer ?? figma.createText();
    if (layer) placeReused(layer, parent, context);
    else if (!reused) parent.appendChild(text);

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
    // Ook terugzetten: een hergebruikte tekstlaag houdt anders een
    // verborgen stand die in de nieuwe spec niet meer staat.
    text.visible = spec.visible ?? true;

    applyBindings(text, spec, context);
    applyPlacement(text, spec, log, parentSpec, context.pinned);
    applySizing(text, spec, log);
    applyRotation(text, spec, log);
    registerSlot(text, spec, context);
    registerColorCheck(text, spec, context);
    return text;
  }

  if (spec.type === 'INSTANCE') {
    return buildInstance(spec, parent, context, parentSpec);
  }

  if (spec.type === 'SLOT') {
    return buildContentSlot(spec, parent, context, parentSpec);
  }

  if (spec.type === 'VECTOR' && spec.shapes) {
    const node = buildShapes(spec, parent, context);
    applyPlacement(node, spec, log, parentSpec, context.pinned);
    applySizeBindings(node, spec, context, { count: true });
    applyRotation(node, spec, log);
    registerSlot(node, spec, context);
    return node;
  }

  if (spec.type === 'VECTOR') {
    const node = buildIcon(spec, parent, context);
    // De kleur zit op de vectoren binnenin, niet op het frame eromheen, dus de
    // binding moet mee in de paints die eroverheen worden gezet. Bij een
    // instance is dat een override op de geneste lagen, precies zoals een
    // designer die met de hand zou leggen.
    //
    // De opdracht wordt onthouden en aan het eind van de import herhaald; zie
    // `recolorIcons`. `paintsForVector` telt mee in de statistieken en wordt
    // daarom maar één keer aangeroepen.
    const paints = paintsForVector(spec, context);
    recolorVectors(node.children ?? [], paints);
    context.recolors.push({ node, paints, name: spec.name, spec });
    applyPlacement(node, spec, log, parentSpec, context.pinned);
    // Een icoon komt niet langs applyBindings of applySizing; zijn maat (de
    // fluid icon-size) wordt hier gebonden, ná de resize in buildIcon.
    applySizeBindings(node, spec, context, { count: true });
    applyRotation(node, spec, log);
    registerSlot(node, spec, context);
    registerColorCheck(node, spec, context);
    return node;
  }

  const layer = takeLayer(context, 'FRAME', spec.name ?? 'Frame');
  const frame = layer ?? figma.createFrame();
  if (layer) placeReused(layer, parent, context);
  else parent.appendChild(frame);
  applyFrame(frame, spec, context);

  applyPlacement(frame, spec, log, parentSpec, context.pinned);
  applySizing(frame, spec, log, context);
  applyRotation(frame, spec, log);
  registerSlot(frame, spec, context);
  return frame;
}

/**
 * Een Figma-slot: de plek in een component waar een designer zelf items of
 * opties toevoegt en weghaalt (`data-figma-children` in de matrix).
 *
 * Niet te verwarren met `registerSlot` hieronder: dat gaat over de lagen waar
 * een component property aan hangt. Vandaar `contentSlot` in de namen.
 *
 * Gemeten in Figma (issue #450): wat een designer in het slot van een instance
 * zette, blijft een tweede import alleen staan als het slot zelf blijft
 * staan. Een slot weggooien en opnieuw maken zet elke instance terug op de
 * standaardinhoud, en laat bovendien de oude property als wees achter. Een
 * bestaand slot wordt daarom hergebruikt (zie `resetVariant`): alleen zijn
 * standaardinhoud en zijn layout worden vervangen.
 *
 * Een nieuw slot kan alleen via `createSlot()` op het component zelf. Dat legt
 * meteen een SLOT-property aan die naar het slot heet; de naam uit de spec
 * hernoemt hem. Varianten met een slot van dezelfde naam delen in de set één
 * property.
 */
function buildContentSlot(spec, parent, context, parentSpec) {
  let slot = context.reusableSlots?.get(spec.name);
  if (slot) {
    context.reusableSlots.delete(spec.name);
    // Alles behalve de instances in de pool: die haalt het bouwen hieronder
    // weer op, en wat er niet opgehaald wordt ruimt `dropUnusedIcons` op.
    for (const child of [...slot.children]) {
      if (!context.pooled?.has(child)) child.remove();
    }
    clearBoundVariables(slot);
    parent.appendChild(slot);
    rejoinFlow(slot);
  } else {
    const component = context.component;
    if (typeof component?.createSlot !== 'function') {
      throw new Error(
        `Slot "${spec.name}": deze Figma kent geen slots (createSlot ontbreekt). Werk Figma bij.`
      );
    }
    slot = component.createSlot();
    if (slot.parent !== parent) parent.appendChild(slot);
  }

  applyFrame(slot, spec, context);
  applyPlacement(slot, spec, context.log, parentSpec, context.pinned);
  applySizing(slot, spec, context.log, context);
  registerSlot(slot, spec, context);
  return slot;
}

/**
 * Ruimt slots op die niet meer in de spec staan, met hun property.
 *
 * Figma laat de SLOT-property staan als het slot weggaat (gemeten bij #450).
 * Zonder deze stap houdt de set een knop in het paneel die nergens meer naar
 * wijst. Alleen als geen enkele variant nog een slot met die naam heeft: in een
 * set delen de varianten er één.
 */
export function dropStaleContentSlots(owner, names, log) {
  if (!owner || !names.size) return;

  const remaining = new Set();
  const walk = (node) => {
    for (const child of node.children ?? []) {
      if (child.type === 'SLOT') remaining.add(child.name);
      if (child.type !== 'INSTANCE') walk(child);
    }
  };
  walk(owner);

  for (const name of names) {
    if (remaining.has(name)) continue;
    const key = Object.keys(owner.componentPropertyDefinitions ?? {}).find(
      (propertyId) =>
        owner.componentPropertyDefinitions[propertyId].type === 'SLOT' &&
        propertyNameOf(propertyId) === name
    );
    if (key) owner.deleteComponentProperty(key);
    log.warn(
      `Slot "${name}" staat niet meer in de spec en is verwijderd, met zijn property. Wat designers erin hadden gezet, is weg.`
    );
  }
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
 * Onthoudt elke laag waarvan de spec een kleur-variable noemt.
 *
 * Alleen voor `diagnoseColors`, en dus voor de tekstlagen net zo goed als voor
 * de iconen: die twee hangen aan dezelfde variable, en of ze zich hetzelfde
 * gedragen is precies wat er gemeten moet worden. `recolors` is hier niet
 * bruikbaar voor, want daar staan alleen de iconen in.
 */
function registerColorCheck(node, spec, context) {
  if (!spec.boundVariables?.fills) return;
  context.colorChecks.push({ node, spec });
}

/**
 * Zet een frame-spec op een bestaande node en bouwt zijn kinderen.
 *
 * Staat los van `buildNode` omdat het root-element van een component geen eigen
 * frame krijgt: het *is* het component. Zie `importComponentSet`.
 *
 * `name` staat daarom apart van de spec: de wrapper van een variant heet naar
 * zijn variantlabel en niet naar het root-element.
 */
export function applyFrame(frame, spec, context, name = spec.name ?? 'Frame') {
  frame.name = name;

  // Een nieuw frame heeft een witte vulling; die overschrijven we altijd,
  // ook met een lege lijst, anders krijgt elk transparant element wit.
  frame.fills = spec.fills ?? [];
  applyPaints(frame, spec);
  applyCorners(frame, spec);
  if (spec.opacity !== undefined) frame.opacity = spec.opacity;
  if (spec.clipsContent !== undefined) frame.clipsContent = spec.clipsContent;
  // Na clipsContent: zonder clip negeert Figma de spread van een schaduw.
  applyEffects(frame, spec, context);
  if (spec.width && spec.height) frame.resize(spec.width, spec.height);

  applyAutoLayout(frame, spec, context.log, context);
  // Na applyAutoLayout: padding, itemSpacing en de minimum-maten bestaan pas
  // als het frame een layoutMode heeft.
  applyMinimumSizes(frame, spec, context.log);
  applyBindings(frame, spec, context);

  // Het pad naar elk kind, voor `takeLayer`.
  const path = context.layerPath ?? [];
  (spec.children ?? []).forEach((child, index) => {
    context.layerPath = [...path, index];
    buildNode(child, frame, context, spec);
  });
  context.layerPath = path;
}
