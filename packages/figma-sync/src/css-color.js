/**
 * Een gemeten CSS-kleur omzetten naar Figma's RGBA-object.
 *
 * Los van to-figma.js, omdat ook de schaduwen (effects.js) gemeten kleuren
 * lezen.
 */

import { parseColor } from '../../design-tokens/src/config/color.js';

/**
 * Computed kleur -> Figma RGBA (kanalen 0..1).
 *
 * Een browser rekent een kleur niet om naar rgb: wat als `oklch()` is
 * geschreven komt ook als `oklch()` uit `getComputedStyle`. Die vorm gaat door
 * dezelfde conversie als de variables-build, zodat de gemeten kleur en de
 * waarde van het token exact op elkaar uitkomen.
 */
export function parseCssColor(input) {
  const match = String(input).match(
    /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.%]+))?\s*\)/i
  );
  // `oklch()`, en `color(srgb ...)`: zo komt een `color-mix()` uit
  // `getComputedStyle`, bijvoorbeeld de kleur van een schaduw.
  if (!match) return parseColor(input);

  const [, r, g, b, a] = match;
  let alpha = 1;
  if (a !== undefined) {
    alpha = a.endsWith('%') ? Number(a.slice(0, -1)) / 100 : Number(a);
  }

  return {
    r: Number(r) / 255,
    g: Number(g) / 255,
    b: Number(b) / 255,
    a: alpha,
  };
}
