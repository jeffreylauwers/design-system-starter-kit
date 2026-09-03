/**
 * Iconen voor in een matrix, uit dezelfde bron als de iconset.
 *
 * De matrices tekenden hun iconen eerst met de hand overgetypte paden. Dat
 * werkt zolang het er twee zijn, maar het is een tweede waarheid: een icoon dat
 * in `assets/icons` wordt bijgewerkt verandert dan wel in de iconset en niet in
 * de componenten die hem tonen. Hier wordt hetzelfde bestand gelezen dat
 * `build-icons.js` leest.
 *
 * Het `data-icon`-attribuut is het koppelstuk: het wordt de naam van de laag in
 * Figma, en de plugin zoekt daarmee het icooncomponent op `dsn/Icons` op om er
 * een instance van te plaatsen.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const iconsDir = path.resolve(
  __dirname,
  '..',
  '..',
  'components-html',
  'assets',
  'icons'
);

/**
 * De tekenende paden van een icoon.
 *
 * De 24x24-hulppath die Tabler meelevert (`<path stroke="none" d="M0 0h24v24H0z"
 * fill="none"/>`) gaat eruit, net als in `build-icons.js`: hij tekent niets en
 * levert in Figma alleen een extra lege vectorlaag op.
 */
function drawingPaths(name) {
  const file = path.join(iconsDir, `${name}.svg`);
  if (!fs.existsSync(file)) {
    throw new Error(
      `Icoon "${name}" bestaat niet in components-html/assets/icons. Gebruik een naam uit die map, anders vindt de plugin het icooncomponent niet.`
    );
  }

  const source = fs.readFileSync(file, 'utf8');
  return [...source.matchAll(/<path\b[^>]*\/>/g)]
    .map((match) => match[0])
    .filter((tag) => !/stroke="none"/.test(tag))
    .join('');
}

/**
 * Eén icoon als inline SVG, klaar voor de meetpagina.
 *
 * @param {string} name bestandsnaam uit de assets-map, zonder `.svg`
 * @param {{modifier?: string, slot?: string}} [options]
 *   `modifier` is een `dsn-icon--*`-maatklasse, `slot` een `data-figma-slot`
 *   waar een component property aan hangt.
 */
export function icon(name, { modifier, slot } = {}) {
  const classes = ['dsn-icon', modifier && `dsn-icon--${modifier}`]
    .filter(Boolean)
    .join(' ');
  const slotAttribute = slot ? ` data-figma-slot="${slot}"` : '';

  return `<svg class="${classes}" data-icon="${name}"${slotAttribute} aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${drawingPaths(name)}</svg>`;
}
