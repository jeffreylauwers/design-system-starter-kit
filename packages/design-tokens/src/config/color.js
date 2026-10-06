/**
 * Kleurwaarden omzetten naar Figma's RGBA-object (sRGB, kanalen 0..1).
 *
 * De tokens leggen kleuren vast in OKLCH. CSS begrijpt dat rechtstreeks, Figma
 * niet: een variable is daar altijd sRGB. Deze module is de enige plek waar die
 * vertaling gebeurt, voor zowel de variables-build (`figma.js`) als de gemeten
 * component-specs in `figma-sync`. Twee conversies die elk net anders afronden
 * zouden de verificatie in `figma-sync/src/bindings.js` laten omvallen.
 *
 * Bewust zonder dependency: de wiskunde is klein en staat vast (CSS Color 4).
 */

const clamp01 = (value) => Math.min(1, Math.max(0, value));

/** Marge waarbinnen een kanaal nog als "in gamut" telt (afrondingsruis). */
const GAMUT_EPSILON = 1e-4;

/** Lineair-licht sRGB -> gamma-gecodeerd sRGB. */
function gammaEncode(channel) {
  const abs = Math.abs(channel);
  const encoded =
    abs <= 0.0031308 ? 12.92 * abs : 1.055 * Math.pow(abs, 1 / 2.4) - 0.055;
  return Math.sign(channel) * encoded;
}

/** OKLCH -> sRGB zonder gamut-correctie; kanalen kunnen buiten 0..1 vallen. */
function oklchToSrgbUnclamped(l, c, h) {
  const hue = (h * Math.PI) / 180;
  const a = c * Math.cos(hue);
  const b = c * Math.sin(hue);

  const lRoot = l + 0.3963377774 * a + 0.2158037573 * b;
  const mRoot = l - 0.1055613458 * a - 0.0638541728 * b;
  const sRoot = l - 0.0894841775 * a - 1.291485548 * b;

  const lCone = lRoot ** 3;
  const mCone = mRoot ** 3;
  const sCone = sRoot ** 3;

  return [
    4.0767416621 * lCone - 3.3077115913 * mCone + 0.2309699292 * sCone,
    -1.2684380046 * lCone + 2.6097574011 * mCone - 0.3413193965 * sCone,
    -0.0041960863 * lCone - 0.7034186147 * mCone + 1.707614701 * sCone,
  ].map(gammaEncode);
}

const inGamut = (channels) =>
  channels.every(
    (channel) => channel >= -GAMUT_EPSILON && channel <= 1 + GAMUT_EPSILON
  );

/**
 * OKLCH -> sRGB (kanalen 0..1).
 *
 * Valt de kleur buiten sRGB, dan wordt de chroma teruggebracht tot hij past,
 * bij gelijke lichtheid en tint. Dat is dezelfde keuze die de
 * color-palette-generator maakt voor zijn hex-voorvertoning (`clampChroma`),
 * zodat Figma toont wat de generator liet zien. Kanalen los afkappen zou de
 * tint verschuiven.
 */
export function oklchToSrgb(l, c, h) {
  let channels = oklchToSrgbUnclamped(l, c, h);

  if (!inGamut(channels)) {
    let low = 0;
    let high = c;
    for (let step = 0; step < 24; step++) {
      const mid = (low + high) / 2;
      if (inGamut(oklchToSrgbUnclamped(l, mid, h))) low = mid;
      else high = mid;
    }
    channels = oklchToSrgbUnclamped(l, low, h);
  }

  const [r, g, b] = channels.map(clamp01);
  return { r, g, b };
}

/** `50%` -> 0.5 (maal `percentReference`), `0.5` -> 0.5, `none` -> 0. */
function component(raw, percentReference = 1) {
  if (raw === 'none') return 0;
  if (raw.endsWith('%'))
    return (Number(raw.slice(0, -1)) / 100) * percentReference;
  return Number(raw);
}

/** `#RGB`, `#RGBA`, `#RRGGBB` of `#RRGGBBAA`. */
function parseHex(value) {
  let hex = value.slice(1);
  if (hex.length === 3 || hex.length === 4) {
    hex = hex
      .split('')
      .map((char) => char + char)
      .join('');
  }
  if (hex.length !== 6 && hex.length !== 8) return null;
  if (!/^[0-9a-fA-F]+$/.test(hex)) return null;

  const channel = (offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255;
  return {
    r: channel(0),
    g: channel(2),
    b: channel(4),
    a: hex.length === 8 ? channel(6) : 1,
  };
}

/** `oklch(L C H)` of `oklch(L C H / A)`; L en C mogen een percentage zijn. */
function parseOklch(value) {
  const match = value.match(
    /^oklch\(\s*([^\s/]+)\s+([^\s/]+)\s+([^\s/]+?)(?:deg)?\s*(?:\/\s*([^\s/]+)\s*)?\)$/i
  );
  if (!match) return null;

  const l = clamp01(component(match[1]));
  // 100% chroma is in CSS gedefinieerd als 0.4.
  const c = Math.max(0, component(match[2], 0.4));
  const h = component(match[3]);
  const a = match[4] === undefined ? 1 : clamp01(component(match[4]));
  if (![l, c, h, a].every(Number.isFinite)) return null;

  return { ...oklchToSrgb(l, c, h), a };
}

/**
 * Zet een tokenwaarde om naar Figma's RGBA-object.
 * Ondersteunt hex en `oklch()`. Al het andere (color-mix, keywords) geeft
 * `null`: dat is niet statisch naar één kleur te herleiden.
 */
export function parseColor(input) {
  const value = String(input).trim();
  if (value.startsWith('#')) return parseHex(value);
  if (/^oklch\(/i.test(value)) return parseOklch(value);
  return null;
}
