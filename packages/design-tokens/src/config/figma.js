/**
 * Figma Variables platform
 *
 * Zet de Style Dictionary tokens om naar een JSON die een Figma-plugin
 * rechtstreeks kan inlezen om variable collections aan te maken/bij te werken.
 *
 * Waarom een eigen platform en geen Style Dictionary format?
 * Figma-variables zijn niet plat: ze zitten in collections met modes, en een
 * component-token wordt een *alias* naar een primitive-variable. Dat vraagt om
 * meerdere builds (een per theme x mode x density) die daarna worden
 * samengevoegd, en dat past niet in een enkel format-callback.
 *
 * Figma kent maar vier variable-types: COLOR, FLOAT, STRING en BOOLEAN.
 * Alles wat daar niet in past (transitions, easings, breakpoints) wordt
 * overgeslagen en verantwoord in het report-bestand. Schaduwen passen er ook
 * niet in, maar die worden een effect style; zie `buildEffectStyles`.
 */

import { parseColor } from './color.js';
import { parseBoxShadow } from './shadow.js';

// =============================================================================
// CONSTANTEN
// =============================================================================

/** Basis voor rem -> px conversie. */
const ROOT_FONT_SIZE = 16;

/**
 * Viewports waarop fluid waarden (clamp met vw) worden uitgerekend.
 *
 * Een Figma-variable is statisch, dus een clamp() moet op een breedte worden
 * vastgeprikt. In plaats van één willekeurige breedte te kiezen krijgt de
 * typografieschaal een mode per viewport: de designer schakelt het artboard en
 * de hele schaal volgt. De twee breedtes zijn gelijk aan dsn.viewport.min- en
 * max-inline-size, dus de modes bevatten exact de ontworpen min- en max-waarden.
 */
export const VIEWPORTS = { 'vp-small': 360, 'vp-large': 1440 };

/**
 * Hoe de viewports in de mode-namen heetten vóór #328. Alleen nodig om modes in
 * een bestaand Figma-bestand te hernoemen (zie `renamedModes`).
 */
const LEGACY_VIEWPORT_NAMES = {
  'vp-small': 'mobile',
  'vp-large': 'desktop',
};

/**
 * Viewport voor waarden buiten de Density-collection. Die zitten in collections
 * zonder viewport-as. Elke fluid waarde hoort in Density te belanden; wat toch
 * hierop wordt vastgeprikt komt als `viewportPinned` in het report te staan.
 */
const DEFAULT_VIEWPORT = VIEWPORTS['vp-large'];

/**
 * Maximum aantal modes per collection op Figma Professional. Daarboven weigert
 * Figma `addMode`, en een half geïmporteerde collection is erger dan een build
 * die stopt.
 */
export const FIGMA_MODE_LIMIT = 10;

/**
 * Maximale lengte van een mode-naam in Figma. Een langere naam weigert Figma
 * bij `addMode` en `renameMode`; de plugin meldt dat pas tijdens de import.
 * `wireframe-default-fixed-space-viewport-large` (44) liep hier tegenaan.
 */
export const FIGMA_MODE_NAME_LIMIT = 40;

export const COLLECTIONS = {
  primitives: 'dsn/Primitives',
  density: 'dsn/Density',
  components: 'dsn/Components',
};

// =============================================================================
// WAARDE-CONVERSIE
// =============================================================================

/**
 * Vervangt CSS-eenheden door pixelwaarden zodat de rest een kale som wordt.
 * vw wordt uitgerekend op de meegegeven viewport, ch heeft geen betrouwbare
 * conversie (hangt van het lettertype af) en levert daarom null op.
 */
function unitsToPixels(expression, viewport) {
  if (/[\d.]ch\b/.test(expression)) return null;
  if (/[\d.]e[m]\b/.test(expression)) return null;

  return expression
    .replace(/(-?[\d.]+)rem\b/g, (_, n) => String(Number(n) * ROOT_FONT_SIZE))
    .replace(/(-?[\d.]+)vw\b/g, (_, n) => String((Number(n) / 100) * viewport))
    .replace(/(-?[\d.]+)px\b/g, (_, n) => String(Number(n)));
}

/**
 * Rekent een kale rekenkundige expressie uit.
 * Er wordt eerst gecontroleerd of er uitsluitend cijfers en operatoren in
 * staan, zodat er niets anders dan rekenwerk uitgevoerd kan worden.
 */
function evaluateArithmetic(expression) {
  if (!/^[\d\s.+\-*/()]+$/.test(expression)) return null;
  try {
    const result = Function(`"use strict"; return (${expression});`)();
    return Number.isFinite(result) ? result : null;
  } catch {
    return null;
  }
}

/** Splitst de argumenten van een functie op komma's op het buitenste niveau. */
function splitArguments(input) {
  const parts = [];
  let depth = 0;
  let current = '';

  for (const char of input) {
    if (char === '(') depth += 1;
    if (char === ')') depth -= 1;
    if (char === ',' && depth === 0) {
      parts.push(current);
      current = '';
      continue;
    }
    current += char;
  }
  parts.push(current);
  return parts;
}

/**
 * Lost clamp() en calc() van binnen naar buiten op tot er een getal overblijft.
 * De vw-eenheden zijn op dat moment al door unitsToPixels vervangen.
 */
function resolveFunctions(expression) {
  // calc() is puur rekenwerk, dus het keyword kan weg: de haakjes die
  // overblijven zijn precies de groepering die de som nodig heeft. Dat maakt
  // geneste calc's met eigen haakjesgroepen vanzelf oplosbaar.
  let current = expression.replace(/\bcalc\b/g, '');

  // Werk de binnenste functie-aanroep steeds als eerste weg.
  for (let guard = 0; guard < 20; guard += 1) {
    const match = current.match(/(clamp|min|max)\(([^()]*)\)/);
    if (!match) break;

    const [full, name, rawArgs] = match;
    const args = splitArguments(rawArgs).map((part) =>
      evaluateArithmetic(part.trim())
    );
    if (args.some((value) => value === null)) return null;

    let resolved;
    if (name === 'clamp') {
      const [minimum, preferred, maximum] = args;
      resolved = Math.min(Math.max(preferred, minimum), maximum);
    } else if (name === 'min') {
      resolved = Math.min(...args);
    } else {
      resolved = Math.max(...args);
    }

    current = current.replace(full, String(resolved));
  }

  return evaluateArithmetic(current);
}

/**
 * Zet een lengte-achtige tokenwaarde om naar een getal in pixels.
 * Retourneert null als de waarde niet betrouwbaar te herleiden is.
 */
function toPixels(input, viewport = DEFAULT_VIEWPORT) {
  const value = String(input).trim();

  if (/^-?[\d.]+$/.test(value)) return Number(value);

  const withPixels = unitsToPixels(value, viewport);
  if (withPixels === null) return null;

  return resolveFunctions(withPixels);
}

// =============================================================================
// TOKEN -> FIGMA VARIABLE
// =============================================================================

/** Tokengroepen die geen zinnige tegenhanger in Figma hebben. */
const UNSUPPORTED_GROUPS = new Set([
  'transition', // Figma kent geen duration/easing variables
  'box-shadow', // wordt een Figma effect style, geen variable
  'breakpoint', // een designtijd-concept, niet iets om aan een laag te binden
  'z-index', // Figma bepaalt stapelvolgorde via de laagvolgorde
]);

/** Tokennamen die per se een STRING moeten blijven. */
const STRING_TYPES = new Set(['fontFamily', 'string', 'other']);

/**
 * Padsegmenten die een STRING aanduiden wanneer het token geen $type heeft.
 * base.json laat $type vaak weg, waardoor font-family anders als getal
 * geïnterpreteerd zou worden en zou afvallen.
 */
const STRING_PATH_SEGMENTS = new Set(['font-family']);

/**
 * CSS-sleutelwoorden in een font-stack die geen lettertype zijn maar een
 * categorie. Figma zoekt een variable-waarde letterlijk op als familienaam, dus
 * `sans-serif` of `ui-monospace` levert daar een ontbrekend font op.
 */
const GENERIC_FONT_FAMILIES = new Set([
  'serif',
  'sans-serif',
  'monospace',
  'cursive',
  'fantasy',
  'math',
  'emoji',
  'fangsong',
  'system-ui',
  'ui-serif',
  'ui-sans-serif',
  'ui-monospace',
  'ui-rounded',
  '-apple-system',
  'blinkmacsystemfont',
]);

/**
 * De ene familienaam die Figma kan gebruiken, uit een CSS font-stack.
 *
 * Een Figma-variable voor `fontFamily` is één familienaam, geen stack:
 * `Fira Sans, sans-serif` bestaat in Figma niet als lettertype. Dat is de
 * eerste echte familie uit de stack, zonder quotes. De fallbacks erachter zijn
 * voor de browser; in Figma is er geen terugval.
 */
export function figmaFontFamily(stack) {
  const families = String(stack)
    .split(',')
    .map((family) => family.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean);
  return (
    families.find(
      (family) => !GENERIC_FONT_FAMILIES.has(family.toLowerCase())
    ) ??
    families[0] ??
    String(stack)
  );
}

/** Duur-eenheden bestaan niet als Figma variable. */
const DURATION_PATTERN = /^-?[\d.]+m?s$/;

/**
 * Bepaalt type en waarde voor Figma.
 * Retourneert `{ skip: reden }` als het token niet te mappen is.
 *
 * @param {object} token Style Dictionary token
 */
export function mapTokenValue(token, viewport) {
  const type = token.$type ?? token.type;
  const raw = token.$value ?? token.value;
  // Op elk padsegment matchen, niet alleen op de groep: `dsn.backdrop.z-index`
  // is net zo goed een z-index als `dsn.z-index.400`.
  const unsupported = token.path.find((segment) =>
    UNSUPPORTED_GROUPS.has(segment)
  );
  // Een schaduw wordt een effect style (zie `buildEffectStyles`). Op het type
  // en niet alleen op de groep: `card.box-shadow-hover` heet anders, en
  // `text-input.focus.box-shadow-spread` is wél een gewoon getal.
  if (unsupported === 'box-shadow' || type === 'shadow') {
    return {
      skip: 'een schaduw wordt een Figma effect style, geen variable',
    };
  }
  if (unsupported) {
    return { skip: `"${unsupported}" heeft geen Figma-variable equivalent` };
  }

  // Niet elk kleurtoken draagt `$type: color`; de waarde zelf verraadt het dan.
  if (
    type === 'color' ||
    (typeof raw === 'string' && /^(#|oklch\()/i.test(raw))
  ) {
    const color = parseColor(raw);
    if (!color) {
      return {
        skip: `kleurwaarde "${raw}" is geen hex of oklch (color-mix of keyword)`,
      };
    }
    return { figmaType: 'COLOR', value: color };
  }

  if (
    STRING_TYPES.has(type) ||
    token.path.some((segment) => STRING_PATH_SEGMENTS.has(segment))
  ) {
    const isFontFamily =
      type === 'fontFamily' || token.path.includes('font-family');
    return {
      figmaType: 'STRING',
      value: isFontFamily ? figmaFontFamily(raw) : String(raw),
    };
  }

  if (DURATION_PATTERN.test(String(raw).trim())) {
    return { skip: `duur "${raw}" heeft geen Figma-variable equivalent` };
  }

  // Percentages zijn alleen zinnig als ze een verhouding uitdrukken.
  // Een layout-percentage (flex-basis, breedte) heeft in Figma geen
  // variable-equivalent en hoort een constraint te zijn.
  const percentage = String(raw)
    .trim()
    .match(/^([\d.]+)%$/);
  if (percentage) {
    if (type === 'opacity' || token.path.includes('opacity')) {
      return { figmaType: 'FLOAT', value: Number(percentage[1]) / 100 };
    }
    return {
      skip: `percentage "${raw}" is layout-gedrag, geen variable (gebruik een constraint)`,
    };
  }

  // Alles wat overblijft proberen we als getal te lezen.
  const pixels = toPixels(raw, viewport);
  if (pixels === null) {
    return { skip: `waarde "${raw}" is niet naar een getal te herleiden` };
  }

  // Unitloze verhoudingen (line-height, opacity) niet afronden,
  // pixelmaten wel op 3 decimalen om drijvende-kommaruis te vermijden.
  const isRatio = type === 'lineHeight' || type === 'opacity';
  return {
    figmaType: 'FLOAT',
    value: isRatio ? pixels : Math.round(pixels * 1000) / 1000,
    // Bewaar de bron-expressie zodat een designer in Figma kan zien
    // dat de waarde is vastgeprikt op een referentie-viewport.
    fluidSource: /clamp|vw/.test(String(raw)) ? String(raw) : undefined,
  };
}

/** `dsn.color.neutral.bg-default` -> `color/neutral/bg-default` */
export function toVariableName(token) {
  return token.path.slice(1).join('/');
}

/**
 * Zet een tokenreferentie `{dsn.border.radius.md}` om naar een variable-naam.
 * Retourneert null als de waarde geen enkele referentie is.
 */
export function referenceToVariableName(originalValue) {
  if (typeof originalValue !== 'string') return null;
  const match = originalValue.trim().match(/^\{([^}]+)\}$/);
  if (!match) return null;
  return match[1].split('.').slice(1).join('/');
}

// =============================================================================
// SCHADUW -> FIGMA EFFECT STYLE
// =============================================================================

/**
 * Een schaduwprimitief (`dsn.box-shadow.md`). De component-tokens
 * (`dsn.card.box-shadow-hover`) verwijzen daar alleen naar; een effect style
 * kan in Figma niet naar een andere style verwijzen, dus een eigen style per
 * component-token zou een kopie zijn die niet meeverandert. De generator volgt
 * de var()-keten van een component tot aan deze primitieven.
 */
function isShadowPrimitive(token) {
  return token.path[1] === 'box-shadow' && token.path.length === 3;
}

/** Een effect style geeft de kleur per laag op; 0..1, op 4 decimalen. */
function sameColor(a, b) {
  return ['r', 'g', 'b', 'a'].every(
    (channel) => Math.abs((a[channel] ?? 1) - (b[channel] ?? 1)) < 0.0005
  );
}

/**
 * Zet de schaduwprimitieven om naar Figma effect styles.
 *
 * Een effect style heeft geen modes, een variable wel. De kleur van elke laag
 * wordt daarom aan de Primitives-variable gebonden waar het token naar
 * verwijst (`color/shadow/direct`), en die volgt de theme- en
 * light/dark-schakelaar. Wat niet kan variëren is de geometrie: offset, blur
 * en spread staan als getal in de style. Die moet dus in elke mode gelijk
 * zijn, anders zou de style in een van de modes een andere schaduw tekenen
 * dan de CSS.
 *
 * Een mode waarin de schaduw `none` is (het wireframe-theme) kan alleen als
 * elke gebonden kleur daar volledig transparant is: dan tekenen dezelfde
 * lagen niets. Ook dat wordt gecontroleerd en niet aangenomen; zelfde
 * asymmetrie als bij de variable-bindingen in figma-sync: een style die niet
 * in elke mode de CSS reproduceert wordt niet gemaakt.
 */
export function buildEffectStyles({ shadows, modes, primitives }) {
  const effectStyles = [];
  const skipped = [];
  const skip = (name, reason) => skipped.push({ style: name, reason });

  for (const [name, { description, byMode }] of shadows) {
    const missing = modes.filter((mode) => !byMode[mode]);
    if (missing.length) {
      skip(name, `ontbreekt in ${missing.join(', ')}`);
      continue;
    }

    const parsed = Object.fromEntries(
      modes.map((mode) => [
        mode,
        {
          resolved: parseBoxShadow(byMode[mode].value),
          original: parseBoxShadow(byMode[mode].original),
        },
      ])
    );
    const unreadable = modes.filter(
      (mode) => !parsed[mode].resolved || !parsed[mode].original
    );
    if (unreadable.length) {
      skip(name, `niet als schaduw te lezen in ${unreadable.join(', ')}`);
      continue;
    }

    const visible = modes.filter((mode) => parsed[mode].resolved.length);
    if (!visible.length) {
      // `box-shadow/none`: niets om een style van te maken.
      skip(name, 'tekent in geen enkele mode een schaduw');
      continue;
    }

    // De geometrie in pixels, per laag.
    const geometryOf = (layers) =>
      layers.map((layer) => {
        const [x, y, blur = '0', spread = '0'] = layer.lengths.map((part) =>
          toPixels(part)
        );
        return { inset: layer.inset, x, y, blur, spread };
      });
    const reference = geometryOf(parsed[visible[0]].resolved);
    if (reference.some((layer) => [layer.x, layer.y].includes(null))) {
      skip(name, 'een lengte is niet naar pixels te herleiden');
      continue;
    }
    const geometryKey = (geometry) => JSON.stringify(geometry);
    const differs = visible.filter(
      (mode) =>
        geometryKey(geometryOf(parsed[mode].resolved)) !==
        geometryKey(reference)
    );
    if (differs.length) {
      skip(
        name,
        `offset, blur of spread verschilt per mode (${differs.join(', ')}); een effect style kan alleen de kleur laten meeschakelen`
      );
      continue;
    }

    // Per laag: de variable waar de kleur aan hangt, of een vaste kleur.
    const effects = [];
    let failure = null;
    for (const [index, layer] of reference.entries()) {
      const references = new Set(
        visible.map((mode) =>
          referenceToVariableName(parsed[mode].original[index].color)
        )
      );
      const [variableName] = references;
      const variable =
        references.size === 1 && variableName
          ? primitives.get(variableName)
          : undefined;

      const colorIn = (mode) => {
        if (parsed[mode].resolved.length) {
          return parseColor(parsed[mode].resolved[index].color);
        }
        // Een mode zonder schaduw: alleen de gebonden variable kan daar iets
        // tekenen, dus die moet er transparant zijn.
        return variable ? variable.valuesByMode[mode] : null;
      };

      for (const mode of modes) {
        const color = colorIn(mode);
        if (!color) {
          failure = `laag ${index + 1}: kleur in ${mode} is niet te herleiden`;
          break;
        }
        if (!parsed[mode].resolved.length && (color.a ?? 1) !== 0) {
          failure = `laag ${index + 1}: in ${mode} is de schaduw none, maar ${variableName ?? 'de kleur'} is daar niet transparant`;
          break;
        }
        if (variable && parsed[mode].resolved.length) {
          // De variable moet in elke mode de kleur van de CSS opleveren.
          const value = variable.valuesByMode[mode];
          if (!value || !sameColor(value, color)) {
            failure = `laag ${index + 1}: ${variableName} wijkt in ${mode} af van de schaduwkleur`;
            break;
          }
        }
      }
      if (failure) break;

      if (!variable) {
        // Zonder variable is de kleur vast, en dan moet hij overal gelijk zijn.
        const colors = modes.map(colorIn);
        if (!colors.every((color) => sameColor(color, colors[0]))) {
          failure = `laag ${index + 1}: de kleur verschilt per mode maar is geen Primitives-variable${variableName ? ` (${variableName} bestaat niet in Figma)` : ''}`;
          break;
        }
      }

      effects.push({
        type: layer.inset ? 'INNER_SHADOW' : 'DROP_SHADOW',
        offset: { x: layer.x, y: layer.y },
        radius: layer.blur,
        spread: layer.spread,
        // De waarde in de eerste mode; de binding bepaalt de rest.
        color: colorIn(modes[0]),
        ...(variable && {
          boundVariables: {
            color: { collection: COLLECTIONS.primitives, name: variableName },
          },
        }),
      });
    }
    if (failure) {
      skip(name, failure);
      continue;
    }

    effectStyles.push({ name, description, effects });
  }

  return { effectStyles, skipped };
}

// =============================================================================
// COLLECTION-ASSEMBLAGE
// =============================================================================

/**
 * Bepaalt in welke collection een token thuishoort op basis van het
 * bronbestand. Het bronbestand is betrouwbaarder dan de tokennaam: `dsn.grid.*`
 * staat zowel in components/grid.json als in een project-type override.
 */
function collectionForToken(token) {
  const file = token.filePath.replace(/\\/g, '/');
  if (file.includes('/tokens/project-types/')) return COLLECTIONS.density;
  if (file.includes('/tokens/components/')) return COLLECTIONS.components;
  return COLLECTIONS.primitives;
}

/**
 * Bouwt de volledige Figma-variables payload.
 *
 * @param {object} deps
 * @param {Function} deps.loadTokens async (theme, mode, density) => allTokens[]
 * @param {string[]} deps.themes
 * @param {string[]} deps.modes
 * @param {string[]} deps.densities
 */
export async function buildFigmaVariables({
  loadTokens,
  themes,
  modes,
  densities,
}) {
  const skipped = [];
  const noteSkip = (token, reason) => {
    skipped.push({ token: token.path.join('.'), reason });
  };

  // Fluid waarden die toch buiten Density belanden, bijvoorbeeld omdat ze niet
  // in elke combinatie als getal te meten zijn. Ze worden op DEFAULT_VIEWPORT
  // vastgeprikt en hier verantwoord.
  const viewportPinned = [];

  // ---------------------------------------------------------------------------
  // 1. Primitives: een mode per theme x light/dark combinatie.
  // ---------------------------------------------------------------------------
  const primitiveModes = [];
  const primitives = new Map();
  // De schaduwprimitieven per mode, voor de effect styles.
  const shadows = new Map();

  for (const theme of themes) {
    for (const mode of modes) {
      const modeName = `${theme}-${mode}`;
      primitiveModes.push(modeName);

      const tokens = await loadTokens(theme, mode, densities[0]);
      for (const token of tokens) {
        const collection = collectionForToken(token);
        if (collection === COLLECTIONS.density) continue;

        if (collection !== COLLECTIONS.primitives) continue;

        if (isShadowPrimitive(token)) {
          const name = toVariableName(token);
          if (!shadows.has(name)) {
            shadows.set(name, {
              description: token.$description ?? token.comment ?? '',
              byMode: {},
            });
          }
          shadows.get(name).byMode[modeName] = {
            value: String(token.$value ?? token.value),
            original: String(token.original.$value ?? token.original.value),
          };
        }

        const mapped = mapTokenValue(token);
        const name = toVariableName(token);
        if (mapped.skip) {
          if (modeName === primitiveModes[0]) noteSkip(token, mapped.skip);
          continue;
        }

        if (!primitives.has(name)) {
          primitives.set(name, {
            name,
            type: mapped.figmaType,
            description: token.$description ?? token.comment ?? '',
            fluidSource: mapped.fluidSource,
            valuesByMode: {},
          });
        }
        primitives.get(name).valuesByMode[modeName] = mapped.value;
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 2. Density: een mode per theme x project-type x viewport.
  //
  // Fluid maten hangen van drie assen af. Een icoongrootte is de fluid
  // font-size (viewport, density) maal de line-height van het theme, en
  // form-control/padding-block-* verwijst per theme naar een andere
  // spacing-maat. Een Figma-variable varieert alleen over de modes van zijn
  // eigen collection, dus deze collection draagt het hele kruisproduct. De
  // theme-as staat daardoor op twee plekken (hier en in Primitives); dat is de
  // prijs voor waarden die op elk artboard kloppen (#328).
  // ---------------------------------------------------------------------------
  const density = new Map();
  const densityModes = [];
  const viewportNames = Object.keys(VIEWPORTS);

  // Per theme x project-type x viewport de hele tokenset uitrekenen. We houden
  // alle waarden bij, niet alleen die van de Density-collection: een token als
  // dsn.grid.gutter komt in het ene project-type uit een override en in het
  // andere uit het component-bestand. Zonder de volledige set zou het in de
  // default-modes geen waarde krijgen.
  const measured = new Map();
  const densityNames = new Set();
  const keyOf = (theme, densityName, viewportName) =>
    `${theme}|${densityName}|${viewportName}`;

  for (const theme of themes) {
    for (const densityName of densities) {
      const tokens = await loadTokens(theme, modes[0], densityName);
      for (const viewportName of viewportNames) {
        const viewport = VIEWPORTS[viewportName];
        const values = new Map();

        for (const token of tokens) {
          const isDensityToken =
            collectionForToken(token) === COLLECTIONS.density;
          const mapped = mapTokenValue(token, viewport);
          const name = toVariableName(token);

          if (mapped.skip) {
            if (
              isDensityToken &&
              theme === themes[0] &&
              densityName === densities[0] &&
              viewportName === viewportNames[0]
            ) {
              noteSkip(token, mapped.skip);
            }
            continue;
          }

          if (isDensityToken) densityNames.add(name);
          values.set(name, { token, mapped });
        }

        measured.set(keyOf(theme, densityName, viewportName), values);
      }
    }
  }

  // Fluid waarden buiten de project-types, zoals form-control/padding-* (via
  // space), de icon-sizes (via de typografieschaal) en component-tokens die
  // daarmee rekenen. Ze krijgen in Density een waarde per mode in plaats van
  // een vastgeprikte waarde in Primitives of Components. Een component-token
  // dat al als alias naar een fluid variable wijst blijft waar het is: de alias
  // volgt de mode al.
  const baseValues = measured.get(
    keyOf(themes[0], densities[0], viewportNames[0])
  );
  // Fluid is een waarde die tussen de viewports verschilt, in welk theme of
  // project-type dan ook. Aan de tekst valt het niet altijd te zien:
  // `checkbox/size` schrijft `calc({dsn.text.font-size.md} * ...)`, zonder
  // clamp of vw in de eigen bron, en bleef daardoor ongemerkt op 1440px staan.
  const variesWithViewport = (name) =>
    themes.some((theme) =>
      densities.some((densityName) => {
        const values = viewportNames.map(
          (viewportName) =>
            measured.get(keyOf(theme, densityName, viewportName)).get(name)
              ?.mapped.value
        );
        return values.some((value) => value !== values[0]);
      })
    );

  const movedToDensity = new Set();
  for (const [name, { token, mapped }] of baseValues) {
    if (densityNames.has(name)) continue;
    if (!mapped.fluidSource && !variesWithViewport(name)) continue;
    const collection = collectionForToken(token);
    if (
      collection === COLLECTIONS.components &&
      referenceToVariableName(token.original.$value)
    ) {
      continue;
    }
    const measuredEverywhere = [...measured.values()].every(
      (values) => values.get(name)?.mapped.figmaType === 'FLOAT'
    );
    if (measuredEverywhere) {
      movedToDensity.add(name);
      densityNames.add(name);
    }
  }

  for (const name of movedToDensity) primitives.delete(name);
  for (const variable of primitives.values()) {
    if (!variable.fluidSource) continue;
    viewportPinned.push({
      variable: variable.name,
      collection: COLLECTIONS.primitives,
      source: variable.fluidSource,
    });
  }

  // Levert elke viewport in elk theme identieke waarden op? Dan is het
  // project-type niet fluid en zou een mode per viewport alleen ruis toevoegen.
  // Per project-type over alle themes beslist, zodat elk theme dezelfde rij
  // modes krijgt.
  const [firstViewport, ...otherViewports] = viewportNames;
  const isFluid = (densityName) =>
    themes.some((theme) =>
      otherViewports.some((viewportName) =>
        [...densityNames].some(
          (name) =>
            measured.get(keyOf(theme, densityName, viewportName)).get(name)
              ?.mapped.value !==
            measured.get(keyOf(theme, densityName, firstViewport)).get(name)
              ?.mapped.value
        )
      )
    );

  // De modes heetten vóór #328 zonder theme en met `mobile`/`desktop`
  // (`default-mobile`). Die waarden waren die van het eerste theme, dus een
  // bestaande mode wordt hernoemd naar zijn tegenhanger in dat theme
  // (`start-default-vp-small`). De plugin hernoemt in plaats van toevoegen:
  // de modeId blijft, en daarmee de mode die een designer op een frame koos.
  const renamedModes = {};

  for (const theme of themes) {
    for (const densityName of densities) {
      const modesForDensity = isFluid(densityName)
        ? viewportNames.map((viewportName) => ({
            suffix: `${densityName}-${viewportName}`,
            legacy: `${densityName}-${LEGACY_VIEWPORT_NAMES[viewportName]}`,
            viewportName,
          }))
        : [
            {
              suffix: densityName,
              legacy: densityName,
              viewportName: firstViewport,
            },
          ];

      for (const { suffix, legacy, viewportName } of modesForDensity) {
        const mode = `${theme}-${suffix}`;
        densityModes.push(mode);
        if (theme === themes[0]) renamedModes[legacy] = mode;

        const values = measured.get(keyOf(theme, densityName, viewportName));
        for (const name of densityNames) {
          const entry = values.get(name);
          if (!entry) continue;

          if (!density.has(name)) {
            density.set(name, {
              name,
              type: entry.mapped.figmaType,
              description:
                entry.token.$description ?? entry.token.comment ?? '',
              fluidSource: entry.mapped.fluidSource,
              valuesByMode: {},
            });
          }
          density.get(name).valuesByMode[mode] = entry.mapped.value;
        }
      }
    }
  }

  // Een verplaatst token dat in de bron naar een ander Density-token verwijst
  // (form-control/padding-inline-start -> space/inline/lg) wordt een alias,
  // zodat de delegatieketen in Figma intact blijft. Alleen als elk theme naar
  // hetzelfde token verwijst: een alias geldt voor alle modes tegelijk, en
  // form-control/padding-block-* wijst in Start en Wireframe naar een andere
  // maat. Die houden hun eigen waarden.
  for (const name of movedToDensity) {
    const variable = density.get(name);
    if (!variable) continue;
    const references = new Set(
      themes.map((theme) => {
        const entry = measured
          .get(keyOf(theme, densities[0], firstViewport))
          .get(name);
        return entry
          ? referenceToVariableName(entry.token.original.$value)
          : null;
      })
    );
    if (references.size !== 1) continue;
    const [reference] = references;
    if (!reference || reference === name || !density.has(reference)) continue;
    delete variable.valuesByMode;
    variable.alias = { collection: COLLECTIONS.density, name: reference };
  }

  // ---------------------------------------------------------------------------
  // 3. Components: één mode. Verwijst waar mogelijk als alias naar 1 of 2,
  //    zodat de theme- en density-schakelaars automatisch doorwerken.
  // ---------------------------------------------------------------------------
  const components = new Map();
  const baseTokens = await loadTokens(themes[0], modes[0], densities[0]);

  // Eerste pass: alle component-variables met hun letterlijke waarde, plus de
  // referentie uit de bron. Een component-token mag naar een ander
  // component-token verwijzen, dus de alias kan pas worden gelegd als de hele
  // collection bestaat.
  for (const token of baseTokens) {
    if (collectionForToken(token) !== COLLECTIONS.components) continue;

    const name = toVariableName(token);
    // Een token dat al als density-variant bestaat hoort daar thuis, niet hier.
    if (density.has(name)) continue;

    const mapped = mapTokenValue(token);
    if (mapped.skip) {
      noteSkip(token, mapped.skip);
      continue;
    }

    components.set(name, {
      name,
      type: mapped.figmaType,
      description: token.$description ?? token.comment ?? '',
      valuesByMode: { default: mapped.value },
      reference: referenceToVariableName(token.original.$value),
      fluidSource: mapped.fluidSource,
    });
  }

  // Tweede pass: referenties omzetten naar aliassen. Een alias houdt de
  // delegatieketen in Figma intact, precies zoals in de token-JSON.
  const locate = (variableName) => {
    if (primitives.has(variableName)) return COLLECTIONS.primitives;
    if (density.has(variableName)) return COLLECTIONS.density;
    if (components.has(variableName)) return COLLECTIONS.components;
    return null;
  };

  const danglingReferences = [];
  for (const variable of components.values()) {
    const { reference, fluidSource } = variable;
    delete variable.reference;
    delete variable.fluidSource;

    // Een alias erft de mode van zijn doel en is dus niet vastgeprikt.
    const collection = reference ? locate(reference) : null;
    if (fluidSource && !collection) {
      viewportPinned.push({
        variable: variable.name,
        collection: COLLECTIONS.components,
        source: fluidSource,
      });
    }

    if (!reference) continue;

    if (!collection) {
      // Het doel is zelf niet naar Figma te mappen (bijvoorbeeld een shadow).
      // De letterlijke waarde blijft dan staan.
      danglingReferences.push({ variable: variable.name, reference });
      continue;
    }

    delete variable.valuesByMode;
    variable.alias = { collection, name: reference };
  }

  // Een variable die niet in elke mode een waarde heeft is in Figma kapot:
  // de ontbrekende modes vallen terug op een standaardwaarde. Dat gebeurt bij
  // een token dat maar in één theme bestaat, of dat in de ene mode wel en in
  // de andere niet te mappen is (bijvoorbeeld transparent tegenover
  // color-mix). Zulke variables gaan er alsnog uit, met verantwoording.
  const incomplete = [];
  const dropIncomplete = (map, modeNames, collectionName) => {
    for (const [name, variable] of [...map]) {
      if (!variable.valuesByMode) continue;
      const missing = modeNames.filter(
        (mode) => variable.valuesByMode[mode] === undefined
      );
      if (!missing.length) continue;
      map.delete(name);
      incomplete.push({ variable: name, collection: collectionName, missing });
    }
  };

  dropIncomplete(primitives, primitiveModes, COLLECTIONS.primitives);
  dropIncomplete(density, densityModes, COLLECTIONS.density);

  // Aliassen die naar een zojuist verwijderde variable wezen kunnen niet meer.
  for (const [name, variable] of [...density]) {
    if (!variable.alias || density.has(variable.alias.name)) continue;
    density.delete(name);
    incomplete.push({
      variable: name,
      collection: COLLECTIONS.density,
      missing: [`aliasdoel ${variable.alias.name} is vervallen`],
    });
  }
  for (const [name, variable] of [...components]) {
    if (!variable.alias) continue;
    const target =
      variable.alias.collection === COLLECTIONS.primitives
        ? primitives
        : variable.alias.collection === COLLECTIONS.density
          ? density
          : components;
    if (target.has(variable.alias.name)) continue;
    components.delete(name);
    incomplete.push({
      variable: name,
      collection: COLLECTIONS.components,
      missing: [`aliasdoel ${variable.alias.name} is vervallen`],
    });
  }

  for (const [name, modeNames] of [
    [COLLECTIONS.primitives, primitiveModes],
    [COLLECTIONS.density, densityModes],
  ]) {
    if (modeNames.length > FIGMA_MODE_LIMIT) {
      throw new Error(
        `${name} krijgt ${modeNames.length} modes, Figma Professional staat er ${FIGMA_MODE_LIMIT} toe: ${modeNames.join(', ')}`
      );
    }
    const tooLong = modeNames.filter(
      (modeName) => modeName.length > FIGMA_MODE_NAME_LIMIT
    );
    if (tooLong.length) {
      throw new Error(
        `${name}: mode-namen langer dan ${FIGMA_MODE_NAME_LIMIT} tekens weigert Figma: ${tooLong
          .map((modeName) => `${modeName} (${modeName.length})`)
          .join(', ')}`
      );
    }
  }

  // Pas na het opschonen: een effect style bindt zijn kleuren aan
  // Primitives-variables, en alleen wat daar overbleef bestaat in Figma.
  const { effectStyles, skipped: effectStylesSkipped } = buildEffectStyles({
    shadows,
    modes: primitiveModes,
    primitives,
  });

  return {
    $schema: 'dsn-figma-variables/1',
    generatedAt: new Date().toISOString(),
    meta: {
      rootFontSize: ROOT_FONT_SIZE,
      viewports: VIEWPORTS,
    },
    collections: [
      {
        name: COLLECTIONS.primitives,
        modes: primitiveModes,
        variables: [...primitives.values()],
      },
      {
        name: COLLECTIONS.density,
        modes: densityModes,
        renamedModes,
        variables: [...density.values()],
      },
      {
        name: COLLECTIONS.components,
        modes: ['default'],
        variables: [...components.values()],
      },
    ],
    effectStyles,
    skipped,
    danglingReferences,
    viewportPinned,
    incomplete,
    effectStylesSkipped,
  };
}
