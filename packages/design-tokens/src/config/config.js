import StyleDictionary from 'style-dictionary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const packageRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..'
);

// =============================================================================
// FLUID SCALE
// =============================================================================

// Een fluid token schrijf je in JSON als `fluid({min-token}, {max-token})`.
// Style Dictionary lost de twee referenties op, waarna de transform hieronder
// er een clamp() van maakt: de min-waarde op de kleinste viewport, de
// max-waarde op de grootste, en daartussen een rechte lijn.
//
// We rekenen dit tijdens de build uit en niet in de browser (zoals met de
// tan(atan2())-truc kan): het resultaat is hetzelfde, maar een gewone clamp()
// kan de Figma-export omrekenen naar vaste waarden per viewport.
const FLUID_PATTERN = /^fluid\((.*)\)$/s;
const ROOT_FONT_SIZE = 16;

function isFluid(token) {
  const original = token.original?.$value ?? token.original?.value;
  return typeof original === 'string' && FLUID_PATTERN.test(original.trim());
}

// Splitst op komma's die niet binnen haakjes staan: `calc(a, b), c` -> 2 delen.
function splitTopLevel(input) {
  const parts = [];
  let depth = 0;
  let current = '';
  for (const char of input) {
    if (char === '(') depth++;
    if (char === ')') depth--;
    if (char === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  parts.push(current.trim());
  return parts;
}

// Rekent een waarde als `1rem`, `8px` of `calc(0.5rem * 1.5 * 1.25)` om naar
// pixels. Meer dan vermenigvuldigen en delen is voor de schaal niet nodig.
function toPx(value) {
  const expression = String(value)
    .trim()
    .replace(/^calc\((.*)\)$/s, '$1');
  const terms = expression.split(/\s*([*/])\s*/);
  let result = null;
  let unit = null;
  for (let index = 0; index < terms.length; index += 2) {
    const match = terms[index].match(/^(-?[\d.]+)(rem|px)?$/);
    if (!match) {
      throw new Error(`fluid(): kan "${value}" niet omrekenen naar px`);
    }
    let number = Number(match[1]);
    if (match[2]) {
      if (unit) throw new Error(`fluid(): "${value}" heeft twee eenheden`);
      unit = match[2];
      if (unit === 'rem') number *= ROOT_FONT_SIZE;
    }
    const operator = terms[index - 1];
    if (result === null) result = number;
    else if (operator === '*') result *= number;
    else result /= number;
  }
  if (!unit) throw new Error(`fluid(): "${value}" heeft geen eenheid`);
  return result;
}

const round = (number) => Number(number.toFixed(5));

/**
 * Leest het viewport-bereik van de fluid schaal uit het thema.
 * Deze tokens moeten vaste px-waarden zijn: de build rekent ermee.
 */
function readFluidViewport(theme) {
  const file = path.join(packageRoot, `src/tokens/themes/${theme}/base.json`);
  const viewport = JSON.parse(fs.readFileSync(file, 'utf8')).dsn.viewport;
  const min = toPx(viewport['min-inline-size'].$value);
  const max = toPx(viewport['max-inline-size'].$value);
  if (!(max > min)) {
    throw new Error(
      `${theme}: dsn.viewport.max-inline-size moet groter zijn dan min-inline-size`
    );
  }
  return { min, max };
}

StyleDictionary.registerTransform({
  name: 'dsn/fluid',
  type: 'value',
  transitive: true,
  filter: isFluid,
  transform: (token, platform) => {
    const value = String(token.$value ?? token.value).trim();
    const [minValue, maxValue, ...rest] = splitTopLevel(
      value.match(FLUID_PATTERN)[1]
    );
    if (!maxValue || rest.length) {
      throw new Error(`${token.name}: fluid() verwacht precies twee waarden`);
    }
    const viewport = platform.fluidViewport;
    if (!viewport) {
      throw new Error(`${token.name}: platform mist fluidViewport`);
    }

    const min = toPx(minValue);
    const max = toPx(maxValue);
    // Gelijke min en max: niets om te schalen, de waarde blijft zoals hij is.
    if (min === max) return minValue;

    const slope = (max - min) / (viewport.max - viewport.min);
    const intercept = min - slope * viewport.min;
    const lower = Math.min(min, max) / ROOT_FONT_SIZE;
    const upper = Math.max(min, max) / ROOT_FONT_SIZE;
    return `clamp(${round(lower)}rem, ${round(intercept / ROOT_FONT_SIZE)}rem + ${round(slope * 100)}vw, ${round(upper)}rem)`;
  },
});

// De standaardgroepen plus de fluid transform.
for (const group of ['css', 'scss', 'js']) {
  StyleDictionary.registerTransformGroup({
    name: `dsn/${group}`,
    transforms: [...StyleDictionary.hooks.transformGroups[group], 'dsn/fluid'],
  });
}

// Een fluid token houdt in de CSS geen var()-referenties: de clamp() is het
// resultaat, de min- en max-tokens staan er als losse custom properties naast.
const outputReferences = (token) => !isFluid(token);

// =============================================================================
// CUSTOM FORMATS
// =============================================================================

// Custom format for class-scoped CSS variables
// Generates CSS variables under a custom selector instead of :root
// When outputReferences is true, keeps var(--token) references for unresolved tokens
StyleDictionary.registerFormat({
  name: 'css/variables-scoped',
  format: function ({ dictionary, options }) {
    const selector = options.selector || ':root';
    const outputReferences = options.outputReferences || false;

    const lines = dictionary.allTokens.map((token) => {
      const comment = token.description ? ` /* ${token.description} */` : '';
      let value = token.value ?? token.$value;

      // If outputReferences is enabled and the original value had references,
      // convert them to CSS custom property references
      const keepReferences =
        typeof outputReferences === 'function'
          ? outputReferences(token)
          : outputReferences;
      if (keepReferences && token.original && token.original.$value) {
        const originalValue = token.original.$value;
        // Check if the original value contains Style Dictionary references like {dsn.color.x}
        if (typeof originalValue === 'string' && originalValue.includes('{')) {
          // Convert {dsn.token.path} to var(--dsn-token-path)
          value = originalValue.replace(
            /\{([^}]+)\}/g,
            (match, tokenPath) => `var(--${tokenPath.replace(/\./g, '-')})`
          );
        }
      }

      return `  --${token.name}: ${value};${comment}`;
    });
    return `/**\n * Do not edit directly\n * Generated on ${new Date().toUTCString()}\n */\n\n${selector} {\n${lines.join('\n')}\n}\n`;
  },
});

// Token-naam naar PascalCase constante: dsn-text-font-family-default -> DsnTextFontFamilyDefault
function toConstantName(tokenName) {
  return tokenName
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

// JavaScript-output: de geneste default export van javascript/esm, plus een platte
// benoemde constante per token.
//
// De .d.ts beloofde altijd al die benoemde exports, maar javascript/esm levert
// alleen een default export. Wie `import { DsnTextFontFamilyDefault } from
// '@dsn-starter-kit/design-tokens'` schreef, kwam door de type-check en kreeg
// op runtime `undefined`. Beide vormen bestaan nu echt.
StyleDictionary.registerFormat({
  name: 'javascript/esm-with-named',
  format: async function (args) {
    const nested = await StyleDictionary.hooks.formats['javascript/esm'](args);
    const named = args.dictionary.allTokens.map((token) => {
      const value = token.$value ?? token.value;
      return `export const ${toConstantName(token.name)} = ${JSON.stringify(String(value))};`;
    });
    return `${nested.trimEnd()}\n\n${named.join('\n')}\n`;
  },
});

// Custom format for TypeScript declarations
// Beschrijft beide exportvormen van javascript/esm-with-named
StyleDictionary.registerFormat({
  name: 'typescript/declarations',
  format: function ({ dictionary }) {
    const lines = dictionary.allTokens.map((token) => {
      const comment = token.description ? ` // ${token.description}` : '';
      return `export declare const ${toConstantName(token.name)}: string;${comment}`;
    });
    // De default export is de geneste Style Dictionary-structuur, met per token
    // een object dat naast $value ook $description en filePath draagt.
    const defaultExport = [
      '',
      'export interface DesignToken {',
      '  $value: string;',
      '  $description?: string;',
      '  filePath?: string;',
      '  [key: string]: unknown;',
      '}',
      '',
      'export type DesignTokenGroup = {',
      '  [key: string]: DesignToken | DesignTokenGroup;',
      '};',
      '',
      'declare const tokens: DesignTokenGroup;',
      'export default tokens;',
    ];
    return [...lines, ...defaultExport].join('\n') + '\n';
  },
});

// =============================================================================
// CONFIGURATION AXES
// =============================================================================

// Available themes (branding/visual identity)
const themes = ['start', 'wireframe'];

// Available modes (light/dark - affects only colors)
const modes = ['light', 'dark'];

// Available project types (density: welke schalen meegroeien met de viewport)
// - default:             fluid tekst + fluid ruimte
// - default-fixed-space: fluid tekst, vaste ruimte (de min-waarden)
// - information-dense:   vaste tekst en vaste ruimte (de min-waarden)
const projectTypes = ['default', 'default-fixed-space', 'information-dense'];

// Bronbestanden per project type. default-fixed-space is default zonder
// space.json, zodat de ruimte terugvalt op de vaste waarden uit het thema.
const projectTypeSources = {
  default: ['src/tokens/project-types/default/*.json'],
  'default-fixed-space': ['src/tokens/project-types/default/typography.json'],
  'information-dense': ['src/tokens/project-types/information-dense/*.json'],
};

// Klasse waarmee een density op runtime gekozen wordt (zie createProjectTypeScopedConfig).
const densitySelectors = {
  default: ':root',
  'default-fixed-space': '.dsn-density-fixed-space',
  'information-dense': '.dsn-density-dense',
};

// =============================================================================
// CONFIGURATION GENERATORS
// =============================================================================

/**
 * Creates a Style Dictionary configuration for a specific Theme × Mode × Project Type combination
 */
function createFullConfig(theme, mode, projectType) {
  const configName = `${theme}-${mode}-${projectType}`;
  const fluidViewport = readFluidViewport(theme);

  return {
    source: [
      // Theme base tokens (typography excl font-size, spacing, sizing, borders, focus)
      `src/tokens/themes/${theme}/base.json`,
      // Theme color tokens for this mode
      `src/tokens/themes/${theme}/colors-${mode}.json`,
      // Component tokens (reference core tokens)
      'src/tokens/components/*.json',
      // Project type overrides (font-sizes, fluid spacing + component overrides, e.g. grid gutter)
      // Must come AFTER components so project-type values win over component defaults
      ...projectTypeSources[projectType],
    ],
    platforms: {
      css: {
        transformGroup: 'dsn/css',
        fluidViewport,
        buildPath: 'dist/css/',
        files: [
          {
            destination: `${configName}.css`,
            format: 'css/variables',
            options: { outputReferences },
          },
        ],
      },
      scss: {
        transformGroup: 'dsn/scss',
        fluidViewport,
        buildPath: 'dist/scss/',
        files: [
          {
            destination: `_${configName}.scss`,
            format: 'scss/variables',
            options: { outputReferences },
          },
        ],
      },
      js: {
        transformGroup: 'dsn/js',
        fluidViewport,
        buildPath: 'dist/js/',
        files: [
          {
            destination: `${configName}.js`,
            format: 'javascript/esm-with-named',
          },
          {
            destination: `${configName}.d.ts`,
            format: 'typescript/declarations',
          },
        ],
      },
      json: {
        transformGroup: 'dsn/js',
        fluidViewport,
        buildPath: 'dist/json/',
        files: [
          {
            destination: `${configName}.json`,
            format: 'json/flat',
          },
        ],
      },
    },
  };
}

/**
 * Creates a scoped CSS configuration for mode switching
 * These files contain ONLY color overrides for class-based mode switching.
 * They use outputReferences to keep CSS custom property references intact,
 * allowing them to work as overlays on top of a full config.
 */
function createModeScopedConfig(theme, mode) {
  const selector =
    mode === 'light'
      ? `.dsn-theme-${theme}`
      : `.dsn-theme-${theme}.dsn-mode-dark, .dsn-mode-dark .dsn-theme-${theme}`;

  return {
    source: [
      // Only color tokens for this theme/mode
      `src/tokens/themes/${theme}/colors-${mode}.json`,
    ],
    platforms: {
      css: {
        transformGroup: 'css',
        buildPath: 'dist/css/scoped/',
        files: [
          {
            destination: `${theme}-${mode}.css`,
            format: 'css/variables-scoped',
            options: { selector, outputReferences: true },
          },
        ],
      },
    },
  };
}

/**
 * Creates a scoped CSS configuration for project type switching
 * Deze bestanden bevatten alleen de schalen die per density verschillen: de
 * font-sizes, de spacing-maten en de overrides uit de project-type map.
 *
 * Het start-thema zit in de source zodat de referenties naar min/max-tokens
 * oplossen (de kleuren alleen omdat base.json ernaar verwijst), maar alleen
 * bovenstaande tokens komen in de output. Het viewport-bereik komt ook uit
 * het start-thema.
 */
function isScaleToken(token) {
  const [, group, category, size] = token.path;
  if (group === 'text')
    return (
      category === 'font-size' &&
      token.path.length === 4 &&
      size !== 'min' &&
      size !== 'max'
    );
  return (
    group === 'space' &&
    token.path.length === 4 &&
    size !== 'min' &&
    size !== 'max'
  );
}

function createProjectTypeScopedConfig(projectType) {
  const selector = densitySelectors[projectType];

  return {
    source: [
      'src/tokens/themes/start/base.json',
      'src/tokens/themes/start/colors-light.json',
      ...projectTypeSources[projectType],
    ],
    platforms: {
      css: {
        transformGroup: 'dsn/css',
        fluidViewport: readFluidViewport('start'),
        buildPath: 'dist/css/scoped/',
        files: [
          {
            destination: `density-${projectType}.css`,
            format: 'css/variables-scoped',
            filter: (token) =>
              isScaleToken(token) || token.filePath.includes('/project-types/'),
            options: { selector, outputReferences },
          },
        ],
      },
    },
  };
}

/**
 * Creates a scoped CSS configuration for theme base tokens (non-color, non-font-size)
 * Used for theme switching without rebuilding everything.
 * Uses outputReferences to keep CSS custom property references intact.
 */
function createThemeBaseScopedConfig(theme) {
  return {
    source: [`src/tokens/themes/${theme}/base.json`],
    platforms: {
      css: {
        transformGroup: 'css',
        buildPath: 'dist/css/scoped/',
        files: [
          {
            destination: `theme-${theme}-base.css`,
            format: 'css/variables-scoped',
            options: {
              selector: `.dsn-theme-${theme}`,
              outputReferences: true,
            },
          },
        ],
      },
    },
  };
}

/**
 * Creates a scoped CSS file per thema met light-mode kleurwaarden gescoopt op .dsn-hero--image.
 * Dit zorgt dat de image/image-blend Hero altijd in light-mode kleuren rendert,
 * ongeacht of de pagina in dark mode staat. De :root dark-mode waarden worden
 * lokaal overschreven — in light mode zijn de waarden identiek aan :root (geen effect).
 *
 * CSS-erfenis-toelichting: component-tokens zoals --dsn-hero-color-inverse erven van
 * :root als resolved waarden (#000000 in dark mode). Door ze expliciet op het element
 * te declareren, resolven var()-referenties opnieuw met de lokale lichte kleurwaarden.
 */
function createHeroImageForceLightConfigForTheme(theme) {
  return {
    source: [
      `src/tokens/themes/${theme}/base.json`,
      `src/tokens/themes/${theme}/colors-light.json`,
      'src/tokens/components/*.json',
      ...projectTypeSources.default,
    ],
    platforms: {
      css: {
        transformGroup: 'dsn/css',
        fluidViewport: readFluidViewport(theme),
        buildPath: 'dist/css/scoped/',
        files: [
          {
            destination: `${theme}-light-hero-image.css`,
            format: 'css/variables-scoped',
            // Primitieve kleurschaal (dsn.color.*) + hero-specifieke tokens (dsn.hero.*).
            // Generieke component-tokens zoals --dsn-heading-* en --dsn-button-* zijn
            // uitgesloten — die beheert hero.css zelf via var(--dsn-hero-color-*).
            filter: (token) =>
              token.$type === 'color' &&
              (token.name.startsWith('dsn-color-') ||
                token.name.startsWith('dsn-hero-')),
            options: {
              selector: `.dsn-theme-${theme} .dsn-hero--image`,
              outputReferences: false,
            },
          },
        ],
      },
    },
  };
}

export function createHeroImageForceLightConfigs() {
  return themes.map((theme) => createHeroImageForceLightConfigForTheme(theme));
}

// =============================================================================
// BACKWARD COMPATIBILITY ALIASES
// =============================================================================

// For backward compatibility, create aliases to the default configuration
// These match the old file names (variables.css, variables-dark-scoped.css, etc.)
function createLegacyConfig() {
  return {
    // Legacy "light" = start-light-default
    light: createFullConfig('start', 'light', 'default'),
    // Legacy "dark" = start-dark-default
    dark: createFullConfig('start', 'dark', 'default'),
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

// Generate all full configurations (Theme × Mode × Project Type)
const fullConfigs = {};
themes.forEach((theme) => {
  modes.forEach((mode) => {
    projectTypes.forEach((projectType) => {
      const name = `${theme}-${mode}-${projectType}`;
      fullConfigs[name] = createFullConfig(theme, mode, projectType);
    });
  });
});

// Generate scoped configurations for runtime switching
// Note: Some scoped configs have cross-file token references that prevent standalone building.
// Currently working scoped configs:
// - density configs (font-sizes + spacing, referenties naar het start-thema)
// - wireframe color configs (simple aliases)
// Non-working due to cross-references:
// - theme-base configs (icon.size references font-size from typography)
// - start color configs (form-control.read-only.border-color references dsn.color.transparent from base)
const scopedConfigs = {
  // Density configs: font-sizes en spacing per project type
  ...Object.fromEntries(
    projectTypes.map((pt) => [
      `density-${pt}`,
      createProjectTypeScopedConfig(pt),
    ])
  ),
  // Kleurconfigs per thema en mode, voor runtime omschakelen zonder herbouw.
  'start-light-scoped': createModeScopedConfig('start', 'light'),
  'start-dark-scoped': createModeScopedConfig('start', 'dark'),
  'wireframe-light-scoped': createModeScopedConfig('wireframe', 'light'),
  'wireframe-dark-scoped': createModeScopedConfig('wireframe', 'dark'),
};

// Legacy aliases for backward compatibility
const legacyConfigs = createLegacyConfig();

export {
  // Configuration axes (for build script)
  themes,
  modes,
  projectTypes,
  projectTypeSources,
  readFluidViewport,

  // All configurations
  fullConfigs,
  scopedConfigs,

  // Legacy aliases (backward compatibility)
  createFullConfig,
  createModeScopedConfig,
  createProjectTypeScopedConfig,
  createThemeBaseScopedConfig,
};

export const light = legacyConfigs.light;
export const dark = legacyConfigs.dark;
