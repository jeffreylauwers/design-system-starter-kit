/**
 * Een CSS `box-shadow` opsplitsen in lagen.
 *
 * Gedeeld door de variables-build (die de schaduwtokens leest, `0 1px 2px 0
 * {dsn.color.shadow.direct}`) en `figma-sync` (die de gemeten waarde leest,
 * `rgba(0, 0, 0, 0.12) 0px 1px 2px 0px`). De twee vormen verschillen in de
 * volgorde: een browser zet de kleur vooraan, de tokens zetten hem achteraan.
 * De grammatica staat beide toe, dus hier wordt op vorm geclassificeerd en
 * niet op positie.
 *
 * Er wordt niets omgerekend: de lengtes en de kleur komen als tekst terug, en
 * elke kant rekent ze om met zijn eigen middelen (een tokenreferentie is voor
 * de browser niets, een `var()` voor de build ook niet).
 */

/** Splitst op een scheidingsteken buiten haakjes en accolades. */
function splitTop(input, isSeparator) {
  const parts = [];
  let depth = 0;
  let current = '';
  for (const char of String(input)) {
    if (char === '(' || char === '{') depth += 1;
    if (char === ')' || char === '}') depth -= 1;
    if (depth === 0 && isSeparator(char)) {
      if (current.trim()) parts.push(current.trim());
      current = '';
      continue;
    }
    current += char;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

/**
 * Is dit deel een lengte? Een getal met of zonder eenheid, of een rekensom.
 * Een `var()` is het allebei niet zeker; die beslist de aanroeper.
 */
export function isLengthPart(part) {
  return (
    /^-?[\d.]+[a-z%]*$/i.test(part) || /^(calc|clamp|min|max)\(/i.test(part)
  );
}

/**
 * @param {string} value een `box-shadow`-waarde
 * @param {(part: string) => boolean} [isColorVar] beslist bij een `var()` of
 *   het de kleur is. Zonder: een `var()` op de laatste of eerste plek, naast
 *   vier lengtes, is de kleur.
 * @returns {Array<{inset: boolean, lengths: string[], color: string|null,
 *   parts: Array<{text: string, role: string}>}>|null} `[]` voor `none`,
 *   `null` als de waarde niet als schaduw te lezen is.
 */
export function parseBoxShadow(value, isColorVar) {
  const text = String(value ?? '').trim();
  if (!text || text === 'none') return [];

  const layers = [];
  for (const layer of splitTop(text, (char) => char === ',')) {
    const parts = splitTop(layer, (char) => /\s/.test(char));
    let inset = false;
    let color = null;
    const lengths = [];
    const roles = [];

    const candidates = parts.filter((part) => {
      if (part.toLowerCase() === 'inset') {
        inset = true;
        roles.push({ text: part, role: 'inset' });
        return false;
      }
      return true;
    });

    for (const [index, part] of candidates.entries()) {
      let role;
      if (/^var\(/i.test(part)) {
        const decided = isColorVar?.(part);
        if (decided !== undefined) {
          role = decided ? 'color' : 'length';
        } else {
          // Vier lengtes is het maximum, dus bij vijf delen is er één de
          // kleur: het laatste, of het eerste als het laatste een lengte is.
          const last = index === candidates.length - 1;
          const colorFirst =
            index === 0 && isLengthPart(candidates[candidates.length - 1]);
          role =
            candidates.length === 5 && (last || colorFirst)
              ? 'color'
              : 'length';
        }
      } else {
        role = isLengthPart(part) ? 'length' : 'color';
      }

      if (role === 'color') {
        if (color !== null) return null;
        color = part;
      } else {
        lengths.push(part);
      }
      roles.push({ text: part, role });
    }

    if (lengths.length < 2 || lengths.length > 4) return null;
    layers.push({ inset, lengths, color, parts: roles });
  }
  return layers;
}
