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
 * Alles wat daar niet in past (transitions, easings, shadows, breakpoints)
 * wordt overgeslagen en verantwoord in het report-bestand.
 */

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
 * de hele schaal volgt. 375px valt onder elke clamp-ondergrens, dus die mode
 * bevat exact de ontworpen min-waarden.
 */
export const VIEWPORTS = { mobile: 375, desktop: 1440 };

/**
 * Viewport voor waarden buiten de typografieschaal. Die zitten in collections
 * met een andere mode-as (theme, light/dark) en kunnen er dus geen viewport-as
 * bij hebben. Wat hierdoor wordt vastgeprikt komt in het report te staan.
 */
const DEFAULT_VIEWPORT = VIEWPORTS.desktop;

export const COLLECTIONS = {
  primitives: 'dsn/Primitives',
  density: 'dsn/Density',
  components: 'dsn/Components',
};

// =============================================================================
// WAARDE-CONVERSIE
// =============================================================================

/**
 * Zet een hex-kleur om naar Figma's RGBA-object (kanalen 0..1).
 * Ondersteunt #RGB, #RGBA, #RRGGBB en #RRGGBBAA.
 */
function parseColor(input) {
  const value = String(input).trim();
  if (!value.startsWith('#')) return null;

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
 * Vervangt `var(--dsn-x-y)` door de al bekende pixelwaarde van dat token.
 *
 * Een handvol tokens verwijst rechtstreeks naar een CSS custom property in
 * plaats van naar een tokenreferentie (`{dsn.x.y}`). Die waarden zijn niet via
 * de tokengraaf te resolven, maar wel via de naam van de custom property.
 */
function substituteCssVars(expression, pixelsByCssName) {
  if (!expression.includes('var(')) return expression;
  if (!pixelsByCssName) return null;

  let resolved = expression;
  for (let guard = 0; guard < 5 && resolved.includes('var('); guard += 1) {
    resolved = resolved.replace(
      /var\(\s*--([a-z0-9-]+)\s*\)/gi,
      (match, name) =>
        pixelsByCssName.has(name) ? String(pixelsByCssName.get(name)) : match
    );
    if (!/var\(/.test(resolved)) break;
    // Geen voortgang meer? Dan is de verwijzing onbekend.
    if (resolved === expression) return null;
    expression = resolved;
  }

  return resolved.includes('var(') ? null : resolved;
}

/**
 * Zet een lengte-achtige tokenwaarde om naar een getal in pixels.
 * Retourneert null als de waarde niet betrouwbaar te herleiden is.
 */
function toPixels(input, pixelsByCssName, viewport = DEFAULT_VIEWPORT) {
  const value = String(input).trim();

  if (/^-?[\d.]+$/.test(value)) return Number(value);

  const substituted = substituteCssVars(value, pixelsByCssName);
  if (substituted === null) return null;

  const withPixels = unitsToPixels(substituted, viewport);
  if (withPixels === null) return null;

  return resolveFunctions(withPixels);
}

// =============================================================================
// TOKEN -> FIGMA VARIABLE
// =============================================================================

/** Tokengroepen die geen zinnige tegenhanger in Figma hebben. */
const UNSUPPORTED_GROUPS = new Set([
  'transition', // Figma kent geen duration/easing variables
  'box-shadow', // hoort een Figma effect style te worden, geen variable
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

/** Duur-eenheden bestaan niet als Figma variable. */
const DURATION_PATTERN = /^-?[\d.]+m?s$/;

/**
 * Bepaalt type en waarde voor Figma.
 * Retourneert `{ skip: reden }` als het token niet te mappen is.
 *
 * @param {object} token Style Dictionary token
 * @param {Map<string, number>} [pixelsByCssName] Lookup om `var(--dsn-x)`
 *   binnen een tokenwaarde alsnog te kunnen uitrekenen.
 */
export function mapTokenValue(token, pixelsByCssName, viewport) {
  const type = token.$type ?? token.type;
  const raw = token.$value ?? token.value;
  // Op elk padsegment matchen, niet alleen op de groep: `dsn.backdrop.z-index`
  // is net zo goed een z-index als `dsn.z-index.400`.
  const unsupported = token.path.find((segment) =>
    UNSUPPORTED_GROUPS.has(segment)
  );
  if (unsupported) {
    return { skip: `"${unsupported}" heeft geen Figma-variable equivalent` };
  }

  if (type === 'color' || (typeof raw === 'string' && raw.startsWith('#'))) {
    const color = parseColor(raw);
    if (!color) {
      return {
        skip: `kleurwaarde "${raw}" is geen hex (color-mix of keyword)`,
      };
    }
    return { figmaType: 'COLOR', value: color };
  }

  if (
    STRING_TYPES.has(type) ||
    token.path.some((segment) => STRING_PATH_SEGMENTS.has(segment))
  ) {
    return { figmaType: 'STRING', value: String(raw) };
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
  const pixels = toPixels(raw, pixelsByCssName, viewport);
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
 * Bouwt een lookup van CSS custom property-naam naar pixelwaarde.
 *
 * Meerdere passes, omdat een token dat `var(--x)` gebruikt kan verwijzen naar
 * een token dat zelf ook nog opgelost moet worden.
 */
function buildPixelLookup(tokens, viewport) {
  const lookup = new Map();
  const pending = [];

  for (const token of tokens) {
    const cssName = token.path.join('-');
    const raw = String(token.$value ?? token.value);
    if (raw.includes('var(')) {
      pending.push({ cssName, raw });
      continue;
    }
    const pixels = toPixels(raw, undefined, viewport);
    if (pixels !== null) lookup.set(cssName, pixels);
  }

  // Elke ronde lost minstens één laag var()-verwijzingen op.
  for (let round = 0; round < 5 && pending.length > 0; round += 1) {
    let resolvedThisRound = 0;
    for (let index = pending.length - 1; index >= 0; index -= 1) {
      const pixels = toPixels(pending[index].raw, lookup, viewport);
      if (pixels === null) continue;
      lookup.set(pending[index].cssName, pixels);
      pending.splice(index, 1);
      resolvedThisRound += 1;
    }
    if (resolvedThisRound === 0) break;
  }

  return lookup;
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

  // Fluid waarden buiten de typografieschaal. Die collections hebben een andere
  // mode-as (theme, light/dark), dus daar kan geen viewport-as bij. Ze worden
  // op DEFAULT_VIEWPORT vastgeprikt en hier verantwoord.
  const viewportPinned = [];

  // ---------------------------------------------------------------------------
  // 1. Primitives: een mode per theme x light/dark combinatie.
  // ---------------------------------------------------------------------------
  const primitiveModes = [];
  const primitives = new Map();

  for (const theme of themes) {
    for (const mode of modes) {
      const modeName = `${theme}-${mode}`;
      primitiveModes.push(modeName);

      const tokens = await loadTokens(theme, mode, densities[0]);
      const pixels = buildPixelLookup(tokens);
      for (const token of tokens) {
        if (collectionForToken(token) !== COLLECTIONS.primitives) continue;

        const mapped = mapTokenValue(token, pixels);
        const name = toVariableName(token);
        if (mapped.skip) {
          if (modeName === primitiveModes[0]) noteSkip(token, mapped.skip);
          continue;
        }

        if (mapped.fluidSource && modeName === primitiveModes[0]) {
          viewportPinned.push({
            variable: name,
            collection: COLLECTIONS.primitives,
            source: mapped.fluidSource,
          });
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
  // 2. Density: een mode per project-type (typografieschaal en overrides).
  // ---------------------------------------------------------------------------
  const density = new Map();
  const densityModes = [];
  const viewportNames = Object.keys(VIEWPORTS);

  // Per project-type x viewport de hele tokenset uitrekenen. We houden alle
  // waarden bij, niet alleen die van de Density-collection: een token als
  // dsn.grid.gutter komt in het ene project-type uit een override en in het
  // andere uit het component-bestand. Zonder de volledige set zou het in de
  // default-modes geen waarde krijgen.
  const measured = new Map();
  const densityNames = new Set();

  for (const densityName of densities) {
    for (const viewportName of viewportNames) {
      const tokens = await loadTokens(themes[0], modes[0], densityName);
      const viewport = VIEWPORTS[viewportName];
      const pixels = buildPixelLookup(tokens, viewport);
      const values = new Map();

      for (const token of tokens) {
        const isDensityToken =
          collectionForToken(token) === COLLECTIONS.density;
        const mapped = mapTokenValue(token, pixels, viewport);
        const name = toVariableName(token);

        if (mapped.skip) {
          if (
            isDensityToken &&
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

      measured.set(`${densityName}|${viewportName}`, values);
    }
  }

  for (const densityName of densities) {
    const valuesFor = (viewportName) =>
      measured.get(`${densityName}|${viewportName}`);

    // Levert elke viewport identieke waarden op? Dan is dit project-type niet
    // fluid en zou een mode per viewport alleen maar ruis toevoegen.
    const [first, ...rest] = viewportNames;
    const isFluid = rest.some((viewportName) =>
      [...densityNames].some(
        (name) =>
          valuesFor(viewportName).get(name)?.mapped.value !==
          valuesFor(first).get(name)?.mapped.value
      )
    );

    const modesForDensity = isFluid
      ? viewportNames.map((viewportName) => ({
          mode: `${densityName}-${viewportName}`,
          viewportName,
        }))
      : [{ mode: densityName, viewportName: first }];

    for (const { mode, viewportName } of modesForDensity) {
      densityModes.push(mode);
      for (const name of densityNames) {
        const entry = valuesFor(viewportName).get(name);
        if (!entry) continue;

        if (!density.has(name)) {
          density.set(name, {
            name,
            type: entry.mapped.figmaType,
            description: entry.token.$description ?? entry.token.comment ?? '',
            fluidSource: entry.mapped.fluidSource,
            valuesByMode: {},
          });
        }
        density.get(name).valuesByMode[mode] = entry.mapped.value;
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 3. Components: één mode. Verwijst waar mogelijk als alias naar 1 of 2,
  //    zodat de theme- en density-schakelaars automatisch doorwerken.
  // ---------------------------------------------------------------------------
  const components = new Map();
  const baseTokens = await loadTokens(themes[0], modes[0], densities[0]);
  const basePixels = buildPixelLookup(baseTokens);

  // Eerste pass: alle component-variables met hun letterlijke waarde, plus de
  // referentie uit de bron. Een component-token mag naar een ander
  // component-token verwijzen, dus de alias kan pas worden gelegd als de hele
  // collection bestaat.
  for (const token of baseTokens) {
    if (collectionForToken(token) !== COLLECTIONS.components) continue;

    const name = toVariableName(token);
    // Een token dat al als density-variant bestaat hoort daar thuis, niet hier.
    if (density.has(name)) continue;

    const mapped = mapTokenValue(token, basePixels);
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
        variables: [...density.values()],
      },
      {
        name: COLLECTIONS.components,
        modes: ['default'],
        variables: [...components.values()],
      },
    ],
    skipped,
    danglingReferences,
    viewportPinned,
  };
}
