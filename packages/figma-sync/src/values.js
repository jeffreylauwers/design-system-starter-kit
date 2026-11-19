/**
 * Een gemeten CSS-waarde omzetten naar wat Figma verwacht: pixels, afgeronde
 * getallen, kleuren als paints, en een SVG met hexkleuren.
 */

import { parseCssColor } from './css-color.js';

// =============================================================================
// WAARDE-CONVERSIE
// =============================================================================

/** `12px` -> 12. `normal` en lege waarden -> fallback. */
export function px(value, fallback = 0) {
  const number = Number.parseFloat(value);
  return Number.isFinite(number) ? Math.round(number * 100) / 100 : fallback;
}

/** Figma scheidt kleur en alpha: opacity zit op de paint, niet in de kleur. */
export function rgbOf({ r, g, b }) {
  return { r, g, b };
}

/**
 * Zet de kleuren in de attributen van een SVG om naar hex.
 *
 * De extractor schrijft de computed kleur in de SVG, en die is in dit design
 * system vaak `oklch()`. Of `figma.createNodeFromSvg` dat leest is niet
 * zeker; hex leest elke SVG-parser. Een doorzichtige kleur zet zijn alpha in
 * het bijbehorende `-opacity`-attribuut.
 */
export function svgWithHexColors(svg) {
  const hex = (channel) =>
    Math.round(channel * 255)
      .toString(16)
      .padStart(2, '0');

  return svg.replace(/<[^>]+>/g, (tag) => {
    let result = tag;
    for (const attribute of ['fill', 'stroke']) {
      const pattern = new RegExp(`\\s${attribute}="([^"]+)"`);
      const value = result.match(pattern)?.[1];
      const color = value && value !== 'none' ? parseCssColor(value) : null;
      if (!color) continue;
      result = result.replace(
        pattern,
        ` ${attribute}="#${hex(color.r)}${hex(color.g)}${hex(color.b)}"`
      );
      if (color.a === undefined || color.a >= 1) continue;
      const opacity = new RegExp(`\\s${attribute}-opacity="([^"]+)"`);
      const current = Number(result.match(opacity)?.[1] ?? 1);
      const combined = Math.round(current * color.a * 1000) / 1000;
      result = opacity.test(result)
        ? result.replace(opacity, ` ${attribute}-opacity="${combined}"`)
        : result.replace(
            /\s*\/?>$/,
            (end) => ` ${attribute}-opacity="${combined}"${end}`
          );
    }
    return result;
  });
}

export function paintFrom(cssColor) {
  const color = parseCssColor(cssColor);
  if (!color || color.a === 0) return [];
  return [{ type: 'SOLID', color: rgbOf(color), opacity: color.a }];
}

/** Twee decimalen, zoals de meting ze ook levert. */
export function round(value) {
  return Math.round(value * 100) / 100;
}
