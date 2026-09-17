/**
 * Show Value en Show Placeholder voor de tekstvelden.
 *
 * Een designer wil een tekstveld leeg, ingevuld of met placeholder kunnen
 * tonen, en de tekst zelf in het properties panel kunnen typen. In de browser
 * is dat een attribuut van het element, dus er valt niets van te meten; de
 * matrix zet daarom `data-figma-value` of `data-figma-placeholder`, en de
 * extractor maakt daar een tekstlaag van. Zie "Tekst in een tekstveld" in de
 * README.
 *
 * Twee assen met `false` en `true`, geen booleans: Figma toont zo'n as als
 * schakelaar, en de placeholder heeft een andere kleur dan de waarde. Een
 * boolean kan alleen een laag aan- of uitzetten. Staan ze allebei aan, dan
 * toont de variant de waarde, net als in de browser.
 */

export const FIELD_TEXT_AXES = {
  showValue: ['false', 'true'],
  showPlaceholder: ['false', 'true'],
};

/**
 * De tekst-properties. `optional`: de laag bestaat alleen in de varianten waar
 * die tekst zichtbaar is.
 */
export const FIELD_TEXT_PROPERTIES = [
  { name: 'value', type: 'TEXT', slot: 'value', optional: true },
  { name: 'placeholder', type: 'TEXT', slot: 'placeholder', optional: true },
];

/**
 * De attributen voor het veld.
 *
 * @param {{showValue: string, showPlaceholder: string}} variant
 * @param {{value: string, placeholder: string, native?: boolean}} texts
 *   `native: false` voor een veld waar de browser `value` en `placeholder`
 *   niet als tekst toont (`type="date"`, `type="time"`); dan gaan alleen de
 *   meet-attributen mee.
 */
export function fieldTextAttributes(
  { showValue, showPlaceholder },
  { value, placeholder, native = true }
) {
  const attributes = [];
  if (showValue === 'true') {
    if (native) attributes.push(`value="${value}"`);
    attributes.push(`data-figma-value="${value}"`);
  }
  if (showPlaceholder === 'true') {
    if (native) attributes.push(`placeholder="${placeholder}"`);
    attributes.push(`data-figma-placeholder="${placeholder}"`);
  }
  return attributes.length ? ` ${attributes.join(' ')}` : '';
}
