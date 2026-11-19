/**
 * De stijl van één laag uit de computed styles: randen, hoekradius, tekststijl
 * en rotatie.
 */

import { parseCssColor } from './css-color.js';
import { paintFrom, px, rgbOf } from './values.js';

/** De vier randen, in de volgorde die CSS aanhoudt. */
const SIDES = ['top', 'right', 'bottom', 'left'];

/** `top` -> `strokeTopWeight`. */
function weightFieldFor(side) {
  return `stroke${side[0].toUpperCase()}${side.slice(1)}Weight`;
}

/**
 * Randen naar een Figma stroke.
 *
 * Een rand hoeft niet rondom te lopen. Note tekent alleen een accentrand aan de
 * inline-start, en Table en DataList scheiden hun rijen met één lijn. Zo'n
 * rand als uniforme stroke overnemen zou in Figma een kader om het hele
 * component zetten: niet een waarschuwing waard maar een verkeerd component.
 *
 * Figma kent daarom per zijde een `stroke*Weight`. Die worden gezet zodra de
 * zijden verschillen; de zijden zonder rand komen op 0 en tekenen dus niets.
 * `strokeWeight` blijft de dikste waarde, want dat is wat Figma teruggeeft
 * zolang er nog niets per zijde gezet is.
 */
export function strokesFrom(styles, warnings, pathLabel) {
  const widths = SIDES.map((side) =>
    px(styles[`border${side[0].toUpperCase()}${side.slice(1)}Width`])
  );
  // Bij verschillende randen per zijde geeft de browser de shorthand terug
  // ("none none none solid"); per zijde uitlezen is de betrouwbare route.
  const borderStyles = SIDES.map(
    (side) => styles[`border${side[0].toUpperCase()}${side.slice(1)}Style`]
  );

  const drawn = SIDES.map(
    (_, index) => widths[index] > 0 && borderStyles[index] !== 'none'
  );
  if (!drawn.some(Boolean)) return null;

  // De zijde die de rand daadwerkelijk tekent levert kleur, dikte en stijl.
  // Bij Note is dat `left`, en `border-top-color` bestaat daar niet eens.
  const reference = drawn.indexOf(true);
  const side = SIDES[reference];
  const style = borderStyles[reference];

  if (style !== 'solid' && style !== 'dashed') {
    warnings.push(
      `${pathLabel}: border-style ${style} wordt in Figma een doorlopende lijn`
    );
  }

  const color = parseCssColor(
    styles[`border${side[0].toUpperCase()}${side.slice(1)}Color`]
  );
  if (!color) return null;

  const effective = widths.map((width, index) => (drawn[index] ? width : 0));
  const uniform = effective.every((width) => width === effective[0]);

  const spec = {
    strokeWeight: Math.max(...effective),
    strokes: [{ type: 'SOLID', color: rgbOf(color), opacity: color.a }],
    dashPattern: style === 'dashed' ? [4, 4] : [],
    // Waar de rand vandaan komt; bindings.js bindt aan de tokens van díe zijde.
    strokeSide: side,
  };

  if (!uniform) {
    spec.strokeWeights = Object.fromEntries(
      SIDES.map((name, index) => [weightFieldFor(name), effective[index]])
    );
  }

  return spec;
}

/**
 * Hoekafronding, met percentages omgerekend naar pixels.
 *
 * `border-radius: 50%` komt als "50%" uit getComputedStyle. Zou je dat als 50
 * doorgeven, dan klopt de waarde alleen zolang Figma hem toevallig klemt op de
 * helft van de kortste zijde; bij een breder element wordt het een afgeronde
 * rechthoek in plaats van een pil.
 */
const FULLY_ROUND = 999;

export function cornerRadiusFrom(styles, rect) {
  // Figma kent één radius per hoek, CSS twee (horizontaal en verticaal).
  // Voor een percentage nemen we de kortste zijde, wat voor de ronde controls
  // in dit systeem (vierkant) exact klopt.
  const shortestSide = Math.min(rect.width, rect.height);
  const toPixels = (value) => {
    const percentage = String(value)
      .trim()
      .match(/^([\d.]+)%$/);
    if (!percentage) return px(value);
    // 50% of meer is in CSS volledig rond, op elke maat. Omgerekend naar de
    // gemeten pixels zou de Radio op `vp-large` (30px, radius 12) een
    // afgeronde rechthoek worden. Figma begrenst een radius zelf tot de helft
    // van de kortste zijde, dus 999 (de waarde van `border-radius.round`) blijft
    // rond, hoe de maat ook meeschaalt.
    if (Number(percentage[1]) >= 50) return FULLY_ROUND;
    return (Number(percentage[1]) / 100) * shortestSide;
  };

  const corners = [
    toPixels(styles.borderTopLeftRadius),
    toPixels(styles.borderTopRightRadius),
    toPixels(styles.borderBottomRightRadius),
    toPixels(styles.borderBottomLeftRadius),
  ];
  const uniform = corners.every((corner) => corner === corners[0]);
  return uniform
    ? { cornerRadius: corners[0] }
    : {
        topLeftRadius: corners[0],
        topRightRadius: corners[1],
        bottomRightRadius: corners[2],
        bottomLeftRadius: corners[3],
      };
}

/** Zoveel pixels mag font-size maal verhouding afwijken van de gemeten regelhoogte. */
const LINE_HEIGHT_TOLERANCE = 0.5;

/**
 * De regelhoogte, als verhouding waar de CSS dat ook is.
 *
 * In code is line-height unitless (`1.5`): een verhouding die met de font-size
 * meeschaalt. Figma kent dat als procent (`150%`). De computed style is altijd
 * een pixelwaarde, dus of het een verhouding was staat in de cascade: een
 * unitless declaratie, of een token in de `var()`-keten waarvan de waarde een
 * verhouding is.
 *
 * Bewust geen variable. Figma leest een getal-variable op `lineHeight` als
 * pixels, en een procent-variable bestaat niet. Een vaste procentwaarde volgt
 * daardoor wel de viewport-modes (de font-size verandert, de verhouding blijft)
 * maar niet de theme-schakelaar (1.5 in `start`, 1.4 in `wireframe`).
 *
 * Net als bij de bindingen wordt de verhouding geverifieerd: font-size maal
 * verhouding moet de gemeten regelhoogte opleveren. Zo niet, dan blijft het de
 * gemeten pixelwaarde.
 */
function lineHeightFrom(styles, sources, index) {
  if (styles.lineHeight === 'normal') return { unit: 'AUTO' };

  const measured = px(styles.lineHeight);
  const fontSize = px(styles.fontSize, 16);
  const source = sources?.['line-height'];

  const candidates = [];
  if (source && /^\s*\d*\.?\d+\s*$/.test(source.value)) {
    candidates.push(Number(source.value));
  }
  for (const cssName of source?.chain ?? []) {
    const variable = index?.lookup(cssName);
    if (variable?.type === 'FLOAT' && typeof variable.value === 'number') {
      candidates.push(variable.value);
    }
  }

  const ratio = candidates.find(
    (candidate) =>
      Math.abs(fontSize * candidate - measured) <= LINE_HEIGHT_TOLERANCE
  );
  if (ratio === undefined) return { unit: 'PIXELS', value: measured };

  // Twee decimalen: 1.1 is 110%, geen 110.00000000000001%.
  return { unit: 'PERCENT', value: Math.round(ratio * 10000) / 100 };
}

/** Tekststijl uit de computed styles van het *ouder*-element. */
export function textStyleFrom(styles, sources, index) {
  return {
    fontFamily: styles.fontFamily.split(',')[0].replace(/['"]/g, '').trim(),
    fontSize: px(styles.fontSize, 16),
    fontWeight: Number.parseInt(styles.fontWeight, 10) || 400,
    italic: styles.fontStyle === 'italic',
    lineHeight: lineHeightFrom(styles, sources, index),
    letterSpacing:
      styles.letterSpacing === 'normal' ? 0 : px(styles.letterSpacing),
    textAlignHorizontal: (styles.textAlign === 'start'
      ? 'left'
      : styles.textAlign
    ).toUpperCase(),
    textDecoration:
      styles.textDecorationLine === 'underline' ? 'UNDERLINE' : 'NONE',
    textCase: styles.textTransform === 'uppercase' ? 'UPPER' : 'ORIGINAL',
    fills: paintFrom(styles.color),
  };
}

/**
 * De rotatie uit een CSS-transform, in graden voor Figma.
 *
 * Alleen een rotatie wordt overgenomen. Dat is wat er in het design system
 * gebruikt wordt: de chevron van Details klapt om met
 * `transform: rotate(180deg)` zodra het paneel open staat, en zonder deze stap
 * wijzen beide varianten in Figma dezelfde kant op.
 *
 * De browser geeft een matrix terug, niet de geschreven functie. Uit
 * `matrix(a, b, c, d, e, f)` is de hoek `atan2(b, a)`, en die draait met de
 * klok mee omdat de y-as van het scherm omlaag loopt; Figma rekent de andere
 * kant op, dus het teken klapt. Zit er schaal of skew in de matrix, dan is er
 * meer aan de hand dan een rotatie en komt er een waarschuwing: stil de helft
 * overnemen is erger dan het melden.
 */
export function rotationFrom(transform, warnings, label) {
  if (!transform || transform === 'none') return 0;

  const values = transform
    .match(/^matrix\(([^)]+)\)$/)?.[1]
    .split(',')
    .map((value) => Number.parseFloat(value));

  if (!values || values.length !== 6) {
    warnings.push(`${label}: transform "${transform}" is niet overgenomen`);
    return 0;
  }

  const [a, b, c, d] = values;
  const scale = Math.hypot(a, b);
  const pureRotation =
    Math.abs(scale - 1) < 0.01 &&
    Math.abs(Math.hypot(c, d) - 1) < 0.01 &&
    Math.abs(a - d) < 0.01 &&
    Math.abs(b + c) < 0.01;

  if (!pureRotation) {
    warnings.push(
      `${label}: transform "${transform}" bevat meer dan een rotatie en is niet overgenomen`
    );
    return 0;
  }

  const degrees = (-Math.atan2(b, a) * 180) / Math.PI;
  if (Math.abs(degrees) < 0.01) return 0;
  // Een halve draai komt uit atan2 als -180. Dat is in Figma hetzelfde als
  // 180, en 180 is wat een designer in het panel verwacht te lezen.
  if (Math.abs(degrees + 180) < 0.01) return 180;
  return Math.round(degrees * 100) / 100;
}
