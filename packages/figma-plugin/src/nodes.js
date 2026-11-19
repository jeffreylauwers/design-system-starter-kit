/**
 * Kleine bewerkingen op een Figma-node die door de hele componentimport
 * gebruikt worden: een laag tijdelijk uit de layout halen en terugzetten,
 * bindingen losmaken, en de naam van een component property uit zijn sleutel
 * lezen.
 */

/** Haalt een laag uit de stroom van zijn ouder, als die auto layout heeft. */
export function stepAside(node, log) {
  const layout = node.parent?.layoutMode;
  if (!layout || layout === 'NONE' || node.layoutPositioning === 'ABSOLUTE') {
    return;
  }
  try {
    node.layoutPositioning = 'ABSOLUTE';
  } catch (error) {
    log.warn(
      `${node.name}: kon niet tijdelijk uit de layout van ${node.parent.name} gehaald worden (${error.message}); hij kan een plek van een ander kind bezet houden`
    );
  }
}

/**
 * Zet een hergebruikte instance terug in de stroom van zijn nieuwe ouder. In
 * een grid krijgt hij daarmee een vrije cel; `applyPlacement` zet hem daarna
 * op de cel uit de spec, of weer absoluut als de spec dat vraagt.
 */
export function rejoinFlow(node) {
  if (node.layoutPositioning !== 'ABSOLUTE') return;
  const layout = node.parent?.layoutMode;
  if (!layout || layout === 'NONE') return;
  node.layoutPositioning = 'AUTO';
}

/** Waar de SVG van een vector zonder icoon onthouden wordt; zie `buildShapes`. */
export const SVG_KEY = 'dsn-svg';

/** Hangt deze laag ergens in een slot, binnen zijn component? */
export function insideContentSlot(node) {
  for (let current = node; current; current = current.parent) {
    if (current.type === 'SLOT') return true;
    if (current.type === 'COMPONENT') return false;
  }
  return false;
}

/**
 * Velden waarvan de binding op de paints zelf zit en niet op de node.
 * `setBoundVariable` weigert ze; ze verdwijnen vanzelf zodra de paints
 * vervangen worden.
 */
const PAINT_FIELDS = new Set(['fills', 'strokes']);

/** Maakt elke variable-binding op deze node los. */
export function clearBoundVariables(node) {
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
 * De naam van een property uit zijn sleutel in `componentPropertyDefinitions`.
 *
 * Die map is gesleuteld op `naam#nodeId:sessionId` (`label#5:0`), en de
 * definitie eronder draagt de naam **niet**: een `ComponentPropertyDefinition`
 * is `{ type, defaultValue, preferredValues?, variantOptions? }`. Uit die
 * definitie de naam willen lezen levert overal `undefined` op, en dan wordt
 * elke property opnieuw aangemaakt in plaats van bijgewerkt. Figma weigert dat
 * niet maar hernoemt de nieuwe naar "label 2", en bij de volgende import naar
 * "label 3".
 *
 * Een variant-as heeft geen achtervoegsel; de sleutel is dan de naam zelf.
 */
export function propertyNameOf(key) {
  const suffix = key.lastIndexOf('#');
  return suffix === -1 ? key : key.slice(0, suffix);
}
