/**
 * De plaat waar de varianten op staan: de component set zelf, of het
 * canvasframe rond een los component, en de plek ervan op de pagina.
 */

import { applyBindings } from './bindings.js';
import { PADDING_FIELDS } from './layout.js';
import { clearBoundVariables } from './nodes.js';

/** De ruimte tussen twee sets die op dezelfde pagina staan. */
const PAGE_SPACING = 80;

/**
 * Zet een nieuwe set of een nieuw canvasframe rechts naast wat er al op de
 * pagina staat.
 *
 * Normaal staat er één set per pagina, en dan maakt de plek niet uit. Het item
 * van een lijst staat op de pagina van die lijst (`page` in de matrix), en
 * zonder deze stap kwamen beide op 0,0, over elkaar heen. De items worden eerst
 * geïmporteerd (ze zijn een afhankelijkheid), dus het item staat links en de
 * lijst rechts.
 *
 * Alleen bij het aanmaken. Een bestaande set blijft waar de designer hem
 * neerzette.
 */
export function placeBesideOthers(page, node) {
  const others = page.children.filter((child) => child !== node);
  if (!others.length) return;
  node.x =
    Math.max(...others.map((child) => child.x + child.width)) + PAGE_SPACING;
  node.y = Math.min(...others.map((child) => child.y));
}

/**
 * Het canvasframe van een los component, opgezocht of aangemaakt.
 *
 * Een component set is zelf de plaat waar zijn varianten op staan. Een los
 * component (een matrix zonder assen) heeft die plaat niet, en zonder frame
 * eromheen staat hij in `start-dark` onleesbaar op het grijs van Figma. Het
 * frame draagt dezelfde naam als het component, net zoals een set dat doet.
 */
export function findOrCreateCanvasFrame(page, name) {
  const existing = page.children.find(
    (node) => node.type === 'FRAME' && node.name === name
  );
  if (existing) return existing;

  const frame = figma.createFrame();
  frame.name = name;
  page.appendChild(frame);
  placeBesideOthers(page, frame);
  return frame;
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
export function applyCanvas(set, canvas, context) {
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
  for (const side of PADDING_FIELDS) {
    set[side] = canvas.padding;
  }

  if (canvas.fills) set.fills = canvas.fills;
  // Met de naam van de set erbij, zodat een mislukte binding te herleiden is.
  applyBindings(set, { ...canvas, name: set.name }, context);
}
