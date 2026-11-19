/**
 * Een bestaande variant bijwerken in plaats van vervangen.
 *
 * Elke geplaatste instance hangt aan de node-id van zijn variant, en overrides
 * van andere sets hangen aan de lagen erbinnen. Een tweede import zet de
 * variant daarom terug naar de staat van een vers component, maar bewaart de
 * lagen, geneste instances en slots die op dezelfde plek terugkomen; zie
 * `resetVariant`.
 */

import { SIZE_LIMIT_FIELDS } from './layout.js';
import {
  clearBoundVariables,
  rejoinFlow,
  stepAside,
  SVG_KEY,
} from './nodes.js';

/**
 * De frames en tekstlagen van een variant, op hun pad van indexen.
 *
 * Bij een tweede import bouwt de plugin een variant van binnen opnieuw op.
 * Een laag die daarbij nieuw wordt gemaakt, verliest elke override die een
 * andere set op hem had gelegd: Figma koppelt een override aan de laag zelf.
 * Zo viel de tekst van een Heading in een HeadingGroup terug op HUG, en
 * verloor een MenuLink in PageHeader zijn indicator onderaan na een nieuwe
 * import van menu-link.json. Daarom worden de lagen eerst onthouden en bij
 * het bouwen op dezelfde plek hergebruikt; zie `takeLayer`.
 *
 * Niet binnen een instance (die lagen zijn van zijn eigen component) en niet
 * binnen een slot (dat blijft zelf staan, en zijn inhoud is van de designer).
 */
function collectLayers(component) {
  const layers = new Map();
  const walk = (node, path) => {
    (node.children ?? []).forEach((child, index) => {
      const childPath = [...path, index];
      if (child.type === 'INSTANCE' || child.type === 'SLOT') return;
      if (child.type !== 'FRAME' && child.type !== 'TEXT') return;
      layers.set(childPath.join('/'), child);
      if (child.type === 'FRAME') walk(child, childPath);
    });
  };
  walk(component, []);
  return layers;
}

/**
 * De laag van de vorige import op deze plek, als hij nog past.
 *
 * Passen is: hetzelfde type, en bij een frame dezelfde naam. Zo komt een
 * laag die in de nieuwe spec iets anders voorstelt niet op de verkeerde plek
 * terecht; die wordt gewoon opnieuw gemaakt.
 */
export function takeLayer(context, type, name) {
  const key = (context.layerPath ?? []).join('/');
  const layer = context.reusableLayers?.get(key);
  if (!layer || layer.type !== type) return null;
  if (type === 'FRAME' && layer.name !== name) return null;
  context.reusableLayers.delete(key);
  return layer;
}

/**
 * Zet een hergebruikte laag terug op de stand van een verse laag.
 *
 * Wat de bouw alleen zet als de spec het noemt, moet hier weg; anders houdt
 * de laag een rand, een radius of een verborgen stand uit de vorige import.
 * Dezelfde lijst als voor de variant zelf in `resetVariant`.
 */
function resetLayer(layer) {
  clearBoundVariables(layer);
  layer.componentPropertyReferences = {};
  layer.visible = true;
  if (layer.rotation) layer.rotation = 0;
  if (layer.type === 'TEXT') {
    layer.textDecoration = 'NONE';
    layer.textCase = 'ORIGINAL';
    return;
  }
  for (const field of SIZE_LIMIT_FIELDS) {
    try {
      layer[field] = null;
    } catch {
      // Zonder auto layout is er ook geen minimum-maat.
    }
  }
  layer.strokes = [];
  layer.dashPattern = [];
  layer.cornerRadius = 0;
  layer.effects = [];
  layer.opacity = 1;
  layer.clipsContent = true;
}

/**
 * Hangt een hergebruikte laag op zijn nieuwe plek in de stroom.
 *
 * Wat er nog in een frame hangt en niet hergebruikt wordt, gaat eruit; de
 * bouw zet zijn kinderen opnieuw neer.
 */
export function placeReused(layer, parent, context) {
  parent.appendChild(layer);
  rejoinFlow(layer);
  resetLayer(layer);
  const kept = new Set([
    ...(context.reusableLayers?.values() ?? []),
    ...(context.pooled ?? []),
    ...(context.keptSlots ?? []),
  ]);
  for (const child of [...(layer.children ?? [])]) {
    if (!kept.has(child)) child.remove();
  }
}

/**
 * Het component waar deze instance aan hangt.
 *
 * Onder `documentAccess: dynamic-page` is `mainComponent` geen synchrone
 * eigenschap meer; de oudere API wordt als terugval geprobeerd zodat de plugin
 * niet aan één versie vastzit. Lukt geen van beide, dan is de laag voor
 * hergebruik onbruikbaar en behandelt de aanroeper hem als een gewone laag.
 */
async function mainComponentOf(instance, context) {
  try {
    if (typeof instance.getMainComponentAsync === 'function') {
      return await instance.getMainComponentAsync();
    }
    return instance.mainComponent ?? null;
  } catch (error) {
    context.log.warn(
      `De laag "${instance.name}" is een instance maar zijn component is niet op te vragen (${error.message}); hij wordt opnieuw opgebouwd en verliest zijn overrides`
    );
    return null;
  }
}

/** Haalt een bewaarde instance van dit component uit de pool, of niets. */
export function takeReusable(context, component) {
  const pool = context.reusable?.get(component.id);
  return pool && pool.length ? pool.shift() : null;
}

/**
 * Ruimt op wat er na het bouwen in de pool is blijven liggen.
 *
 * Een variant die in de nieuwe spec minder iconen heeft, of een ander icoon op
 * die plek, houdt anders een laag over die nergens meer bij hoort. Ze hangen op
 * dat moment nog gewoon in de variant, want `resetVariant` heeft ze juist láten
 * staan.
 */
export function dropUnusedIcons(context) {
  for (const pool of context.reusable?.values() ?? []) {
    for (const instance of pool) instance.remove();
  }
  context.reusable = new Map();
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
 * **Op één laag na: de geneste instances blijven staan.** Een icoon in een
 * variant is een instance van het icooncomponent, en zijn kleur is een override
 * op de geneste `Group > Shape`. Die override hangt aan de node-id van de
 * icoon-instance. Gooit deze functie hem weg en maakt `buildIcon` een nieuwe,
 * dan klopt de kleur op de variant nog steeds (dat is in Figma gemeten) maar
 * moet een geplaatste instance zijn spiegel van die geneste laag opnieuw
 * afleiden, en daarbij gaat de override verloren: het icoon valt terug op
 * `color/neutral/color-default`, de eigen kleur van het icooncomponent.
 *
 * Gemeten in Figma Desktop: na een tweede import droeg elke laag ín de variant
 * de kleur uit de spec, en op een geplaatste instance waren precies de twee
 * icoonlagen fout terwijl de tekstlaag aan dezelfde variable goed bleef. Een
 * tekstlaag heeft die tussenlaag niet; zijn vulling is een eigenschap van de
 * laag zelf en spiegelt gewoon mee. Zie issue #388.
 *
 * De instances gaan daarom naar `context.reusable`, waar `buildIcon` ze weer
 * ophaalt. Wat daar niet uit opgehaald wordt gaat na het bouwen alsnog weg; zie
 * `dropUnusedIcons`.
 *
 * Alles wat `applyFrame` alleen zet wanneer de spec het noemt moet hier weg.
 * Anders houdt een variant een rand, een radius of een gap uit de vorige
 * import die in de nieuwe spec niet meer voorkomt.
 */
export async function resetVariant(
  component,
  context,
  { keepText = false, keepSvg = null } = {}
) {
  context.reusable = new Map();
  context.reusableText = null;
  context.keptSvgShapes = null;

  // Elk frame en elke tekstlaag op zijn plek in de variant, vóórdat er iets
  // verhuist; zie `takeLayer`. Een component dat tot één tekstlaag of één
  // SVG inklapt heeft daar `keepText` en `keepSvg` voor.
  const layers = keepText || keepSvg ? new Map() : collectLayers(component);
  context.reusableLayers = layers;
  const keptLayers = new Set(layers.values());
  for (const layer of keptLayers) {
    if (layer.parent !== component) component.appendChild(layer);
    stepAside(layer, context.log);
  }

  // Een slot blijft staan; zie `buildContentSlot`. Ook een slot dieper in de
  // variant, zoals de navigatie van PageHeader: dat wordt eerst naar de
  // variant zelf verhangen, net als de geneste instances hieronder, anders
  // verdwijnt het met zijn ouder en is wat een designer erin zette weg. Niet
  // in een instance (die lagen zijn van zijn eigen component) en niet in een
  // ander slot (dat blijft zelf staan). Zijn standaardinhoud gaat er bij het
  // bouwen uit.
  const slots = [];
  const collectSlots = (node) => {
    for (const child of node.children ?? []) {
      if (child.type === 'SLOT') slots.push(child);
      else if (child.type !== 'INSTANCE') collectSlots(child);
    }
  };
  collectSlots(component);
  for (const slot of slots) {
    if (slot.parent !== component) component.appendChild(slot);
  }
  context.reusableSlots = new Map(slots.map((slot) => [slot.name, slot]));
  const keptSlots = new Set(context.reusableSlots.values());
  context.keptSlots = keptSlots;
  // Een slot dat blijft staan houdt anders zijn cel bezet; zie `stepAside`.
  for (const slot of keptSlots) stepAside(slot, context.log);

  // Een component dat in zijn geheel tot één tekstlaag inklapt (Heading,
  // Paragraph, PreHeading) houdt die laag, in plaats van hem weg te gooien en
  // opnieuw te maken. Elke instance ervan in een andere set (een Heading in
  // een HeadingGroup) heeft overrides op precies die laag, zoals FILL zodat de
  // tekst afbreekt. Figma zoekt zo'n override terug via de laag, en een nieuwe
  // laag heeft hem niet: gemeten in Figma Desktop, waar de tekst in de
  // HeadingGroup na een nieuwe import van heading.json op HUG terugviel.
  //
  // Dat kan hier wel en bij een gewone variant niet, omdat de identiteit
  // eenduidig is: er is één laag, en die hoort bij de ene tekstlaag in de spec.
  if (keepText) {
    const text = component.children.find((child) => child.type === 'TEXT');
    if (text) {
      clearBoundVariables(text);
      context.reusableText = text;
    }
  }

  // Hetzelfde voor een component dat tot één SVG inklapt die geen icoon is
  // (Logo): een instance in PageHeader heeft overrides op die vector en zijn
  // vormen (de maat, de kleuren in inverse). Alleen als de SVG niet
  // veranderd is; anders kloppen de vormen niet meer met de spec.
  if (keepSvg && component.getPluginData?.(SVG_KEY) === keepSvg) {
    context.keptSvgShapes = new Set(component.children);
  }

  // Ook de instances die dieper zitten, in een frame binnen de variant: een
  // Paragraph in de content van een Alert, een icoon in de control van een
  // Checkbox. Ze worden naar de variant zelf verhangen voordat de rest weggaat,
  // anders verdwijnen ze met hun ouder en is hun node-id alsnog kwijt. Binnen
  // een instance wordt niet gezocht: die lagen zijn van zijn eigen component.
  const instances = [];
  const collect = (node) => {
    for (const child of node.children ?? []) {
      if (child.type === 'INSTANCE') instances.push(child);
      else collect(child);
    }
  };
  collect(component);

  const pooled = new Set();
  for (const instance of instances) {
    // `mainComponent` is onder `documentAccess: dynamic-page` niet synchroon te
    // lezen, vandaar dat de pool hier wordt opgebouwd en niet in `buildIcon`.
    const main = await mainComponentOf(instance, context);
    if (!main) continue;
    // De standaardinhoud van een slot blijft in zijn slot: dat blijft staan,
    // dus daar verdwijnt hij niet mee.
    if (instance.parent !== component && instance.parent?.type !== 'SLOT') {
      component.appendChild(instance);
    }
    // Uit de stroom, zodat hij geen cel of plek bezet houdt terwijl de
    // variant opnieuw wordt opgebouwd. Een volle grid maakt voor een
    // instance die erbij komt anders een rij bij, en die rij kon daarna niet
    // meer weg: "Cannot delete occupied row/column".
    if (instance.parent === component) stepAside(instance, context.log);
    const pool = context.reusable.get(main.id) ?? [];
    pool.push(instance);
    context.reusable.set(main.id, pool);
    pooled.add(instance);
  }
  context.pooled = pooled;

  for (const child of [...component.children]) {
    if (pooled.has(child) || keptSlots.has(child) || keptLayers.has(child)) {
      continue;
    }
    if (context.keptSvgShapes?.has(child)) continue;
    if (child !== context.reusableText) child.remove();
  }

  clearBoundVariables(component);
  component.componentPropertyReferences = {};

  // Zoals een vers frame: geen minimum-maat. Zet de spec er een, dan komt
  // die terug in `applyMinimumSizes`.
  for (const field of SIZE_LIMIT_FIELDS) {
    try {
      component[field] = null;
    } catch {
      // Stond er geen auto layout op, dan staat er ook geen minimum-maat.
    }
  }

  // De layout blijft staan. Wisselen van layout gaat in Figma mis zodra er
  // nog een kind in een gridcel staat: dan breekt de import hier af, nadat
  // de bindingen al losgemaakt zijn, en houdt de variant vaste waarden.
  // `applyAutoLayout` zet de layout uit de spec, en elk veld ervan expliciet.
  component.fills = [];
  component.strokes = [];
  component.dashPattern = [];
  component.cornerRadius = 0;
  // Haalt ook een effect style eraf; die komt terug uit de spec.
  component.effects = [];
  component.opacity = 1;
  component.clipsContent = true;
}
