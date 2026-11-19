/**
 * De fonts van een componentimport: welke er nodig zijn, en ze laden voordat
 * er een tekstlaag gebouwd wordt.
 */

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

export const FALLBACK_FONT = { family: 'Inter', style: 'Regular' };

export function fontFor(node) {
  const style = WEIGHT_TO_STYLE[node.fontWeight] ?? 'Regular';
  return {
    family: node.fontFamily,
    style: node.italic
      ? `${style} Italic`.replace('Regular Italic', 'Italic')
      : style,
  };
}

/** Loopt de spec af en verzamelt elk font dat geladen moet worden. */
export function collectFonts(node, into = new Map()) {
  if (node.type === 'TEXT') {
    const font = fontFor(node);
    into.set(`${font.family}|${font.style}`, font);
  }
  // Een override die het font van een geneste tekstlaag verandert heeft dat
  // font net zo goed nodig.
  for (const override of node.overrides ?? []) {
    if (override.fontFamily === undefined) continue;
    const font = fontFor(override);
    into.set(`${font.family}|${font.style}`, font);
  }
  for (const child of node.children ?? []) collectFonts(child, into);
  return into;
}

/**
 * Laadt alle benodigde fonts. Ontbrekende fonts worden op de fallback gezet
 * zodat de import doorloopt in plaats van halverwege te stoppen.
 */
export async function loadFonts(fonts, log) {
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
