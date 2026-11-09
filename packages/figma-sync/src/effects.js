/**
 * Een gemeten `box-shadow` omzetten naar Figma effects.
 *
 * Twee soorten schaduw in dit design system, en elk krijgt zijn eigen route:
 *
 * - **Elevatie**: `box-shadow: var(--dsn-drawer-box-shadow)`, een keten die
 *   eindigt bij een schaduwprimitief (`--dsn-box-shadow-lg`). Dat wordt in
 *   Figma een effect style (`box-shadow/lg`), want een designer moet dezelfde
 *   schaduw op zijn eigen lagen kunnen zetten.
 * - **Losse velden**: de focusring (`0 0 0 calc(...) var(--dsn-focus-...)`) en
 *   de dikkere rand van een tekstveld (`inset 0 0 0 var(--spread)
 *   var(--color)`). Daar is geen style voor; die worden effects op de laag,
 *   met een variable-binding op elk veld dat uit één token komt.
 *
 * In beide gevallen staan de gemeten effects in de spec. De style of de
 * binding komt er alleen bij als het token de gemeten waarde reproduceert;
 * zelfde asymmetrie als in bindings.js: een misser kan een binding kosten,
 * maar nooit een verkeerde opleveren.
 */

import { parseBoxShadow } from '../../design-tokens/src/config/shadow.js';
import { parseCssColor } from './css-color.js';

const NUMBER_TOLERANCE = 0.05;
const CHANNEL_TOLERANCE = 0.005;

/** De velden van een schaduw, in de volgorde van de lengtes in CSS. */
const LENGTH_FIELDS = ['offsetX', 'offsetY', 'radius', 'spread'];

/** De gemeten waarde van een effectveld. */
function valueOf(effect, field) {
  if (field === 'offsetX') return effect.offset.x;
  if (field === 'offsetY') return effect.offset.y;
  return effect[field];
}

function sameColor(a, b) {
  if (!a || !b) return false;
  const alphaA = a.a ?? 1;
  const alphaB = b.a ?? 1;
  if (Math.abs(alphaA - alphaB) >= CHANNEL_TOLERANCE) return false;
  // Volledig transparant is transparant, welke kanalen er ook onder zitten.
  if (alphaA === 0) return true;
  return ['r', 'g', 'b'].every(
    (channel) => Math.abs(a[channel] - b[channel]) < CHANNEL_TOLERANCE
  );
}

const sameNumber = (a, b) => Math.abs(a - b) <= NUMBER_TOLERANCE;

/**
 * De gemeten schaduw als Figma effects, zonder bindingen.
 * @returns {Array<object>|null} `null` als de waarde niet te lezen is.
 */
export function measuredEffects(boxShadow) {
  const layers = parseBoxShadow(boxShadow);
  if (!layers) return null;

  const effects = [];
  for (const layer of layers) {
    const [x, y, radius = 0, spread = 0] = layer.lengths.map((length) =>
      Number.parseFloat(length)
    );
    // Zonder kleur tekent de browser in `currentColor`; die staat in de
    // computed waarde altijd uitgeschreven, dus een ontbrekende kleur is hier
    // een waarde die niet te lezen is.
    const color = layer.color ? parseCssColor(layer.color) : null;
    if (!color || ![x, y, radius, spread].every(Number.isFinite)) return null;
    effects.push({
      type: layer.inset ? 'INNER_SHADOW' : 'DROP_SHADOW',
      offset: { x, y },
      radius,
      spread,
      color: { r: color.r, g: color.g, b: color.b, a: color.a ?? 1 },
    });
  }
  return effects;
}

/** Waarom de effects van een style niet de gemeten schaduw zijn, of null. */
function styleMismatch(styleEffects, measured) {
  if (styleEffects.length !== measured.length) {
    return `de style heeft ${styleEffects.length} lagen, gemeten ${measured.length}`;
  }
  for (const [index, effect] of styleEffects.entries()) {
    const actual = measured[index];
    const label = `laag ${index + 1}`;
    if (effect.type !== actual.type) {
      return `${label}: ${effect.type} tegenover ${actual.type}`;
    }
    for (const field of LENGTH_FIELDS) {
      if (!sameNumber(valueOf(effect, field), valueOf(actual, field))) {
        return `${label}: ${field} van de style (${valueOf(effect, field)}) wijkt af van de gemeten ${valueOf(actual, field)}`;
      }
    }
    if (!effect.color) return `${label}: de kleur van de style is onbekend`;
    if (!sameColor(effect.color, actual.color)) {
      return `${label}: de kleur van de style wijkt af van de gemeten kleur`;
    }
  }
  return null;
}

/**
 * Bindt elk veld van de effects dat in de authored CSS uit één token komt.
 *
 * `layers` komt uit de browser (browser-tokens.js): per laag de delen van de
 * declaratie, elk met zijn var()-keten. Welk deel welk veld is volgt uit de
 * grammatica (zie shadow.js); een `var()` is een kleur als zijn token een
 * COLOR-variable is.
 */
function bindEffectFields(effects, layers, index, report) {
  if (layers.length !== effects.length) {
    report.miss(
      'box-shadow',
      `de declaratie heeft ${layers.length} lagen, gemeten ${effects.length}`
    );
    return;
  }

  const candidatesOf = (part) =>
    (part.chain ?? []).map((name) => index.lookup(name)).filter(Boolean);

  for (const [layerIndex, parts] of layers.entries()) {
    const effect = effects[layerIndex];
    const typeByText = new Map(
      parts.map((part) => [part.text, candidatesOf(part)[0]?.type])
    );
    const parsed = parseBoxShadow(
      parts.map((part) => part.text).join(' '),
      (text) =>
        typeByText.get(text) === undefined
          ? undefined
          : typeByText.get(text) === 'COLOR'
    );
    if (!parsed || parsed.length !== 1) {
      report.miss('box-shadow', 'de declaratie is niet als schaduw te lezen');
      continue;
    }

    let lengthIndex = 0;
    for (const [position, { role }] of parsed[0].parts.entries()) {
      if (role === 'inset') continue;
      const field = role === 'color' ? 'color' : LENGTH_FIELDS[lengthIndex++];
      const part = parts[position];
      // Een kaal getal of een kleurwoord is geen token, en dus geen misser.
      if (!/var\(/i.test(part.text)) continue;

      const candidates = candidatesOf(part);
      if (!part.chain?.length) {
        report.miss(`box-shadow ${field}`, 'de waarde komt niet uit één token');
        continue;
      }
      if (!candidates.length) {
        report.miss(
          `box-shadow ${field}`,
          'het token bestaat niet als Figma-variable',
          `--${part.chain[part.chain.length - 1]}`
        );
        continue;
      }

      const measured =
        field === 'color' ? effect.color : valueOf(effect, field);
      const match = candidates.find((candidate) =>
        field === 'color'
          ? candidate.type === 'COLOR' && sameColor(candidate.value, measured)
          : candidate.type === 'FLOAT' &&
            typeof candidate.value === 'number' &&
            sameNumber(candidate.value, measured)
      );
      if (!match) {
        report.miss(
          `box-shadow ${field}`,
          'de waarde van het token wijkt af van de gemeten waarde',
          candidates[0].name
        );
        continue;
      }

      effect.boundVariables = {
        ...effect.boundVariables,
        [field]: { collection: match.collection, name: match.name },
      };
      report.bind(match.collection);
    }
  }
}

/**
 * De effects (en eventueel effect style) voor één node.
 *
 * @param {string} boxShadow de gemeten `box-shadow`
 * @param {object} [source] herkomst van `box-shadow` uit de browser
 * @param {object} [bindings] `{ index, report }`, zoals in to-figma.js
 * @returns {{effects?: object[], effectStyle?: string, unreadable?: boolean}}
 */
export function effectsFor(boxShadow, source, bindings) {
  if (!boxShadow || boxShadow === 'none') return {};

  const effects = measuredEffects(boxShadow);
  if (!effects) return { unreadable: true };

  const index = bindings?.index;
  const report = bindings?.report;

  if (index && report && source?.chain?.length) {
    // Elevatie: de keten loopt van het component-token naar de primitief. De
    // eerste schakel die een style is én de gemeten schaduw oplevert wint.
    let mismatch;
    for (const cssName of source.chain) {
      const style = index.effectStyle(cssName);
      if (!style) continue;
      const reason = styleMismatch(style.effects, effects);
      if (!reason) return { effects, effectStyle: style.name };
      mismatch ??= reason;
    }
    report.miss(
      'box-shadow',
      mismatch ?? 'het token bestaat niet als Figma effect style',
      `--${source.chain[source.chain.length - 1]}`
    );
  } else if (index && report && source?.layers) {
    bindEffectFields(effects, source.layers, index, report);
  }

  // Een laag die niets tekent en aan niets hangt, kan weg. Met een binding
  // blijft hij staan: in een andere mode kan dezelfde variable zichtbaar zijn.
  const visible = effects.filter(
    (effect) => effect.color.a > 0 || effect.boundVariables?.color
  );
  return visible.length ? { effects: visible } : {};
}
