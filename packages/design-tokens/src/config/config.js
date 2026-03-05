const StyleDictionary = require('style-dictionary');

// =============================================================================
// CUSTOM FORMATS
// =============================================================================

// Custom format for class-scoped CSS variables
// Generates CSS variables under a custom selector instead of :root
// When outputReferences is true, keeps var(--token) references for unresolved tokens
StyleDictionary.registerFormat({
  name: 'css/variables-scoped',
  formatter: function ({ dictionary, options }) {
    const selector = options.selector || ':root';
    const outputReferences = options.outputReferences || false;

    const lines = dictionary.allProperties.map((token) => {
      const comment = token.comment ? ` /* ${token.comment} */` : '';
      let value = token.value;

      // If outputReferences is enabled and the original value had references,
      // convert them to CSS custom property references
      if (outputReferences && token.original && token.original.value) {
        const originalValue = token.original.value;
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

// Custom format for TypeScript declarations
// Generates typed exports matching the javascript/es6 output
StyleDictionary.registerFormat({
  name: 'typescript/declarations',
  formatter: function ({ dictionary }) {
    const lines = dictionary.allProperties.map((token) => {
      const name = token.name
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
      const comment = token.comment ? ` // ${token.comment}` : '';
      return `export declare const ${name}: string;${comment}`;
    });
    return lines.join('\n') + '\n';
  },
});

// =============================================================================
// CONFIGURATION AXES
// =============================================================================

// Available themes (branding/visual identity)
const themes = ['start', 'wireframe'];

// Available modes (light/dark - affects only colors)
const modes = ['light', 'dark'];

// Available project types (typography density)
const projectTypes = ['default', 'information-dense'];

// =============================================================================
// CONFIGURATION GENERATORS
// =============================================================================

/**
 * Creates a Style Dictionary configuration for a specific Theme × Mode × Project Type combination
 */
function createFullConfig(theme, mode, projectType) {
  const configName = `${theme}-${mode}-${projectType}`;

  return {
    source: [
      // Theme base tokens (typography excl font-size, spacing, sizing, borders, focus)
      `src/tokens/themes/${theme}/base.json`,
      // Theme color tokens for this mode
      `src/tokens/themes/${theme}/colors-${mode}.json`,
      // Component tokens (reference core tokens)
      'src/tokens/components/*.json',
      // Project type overrides (typography font-sizes + component overrides, e.g. grid gutter)
      // Must come AFTER components so project-type values win over component defaults
      `src/tokens/project-types/${projectType}/*.json`,
    ],
    platforms: {
      css: {
        transformGroup: 'css',
        buildPath: 'dist/css/',
        files: [
          {
            destination: `${configName}.css`,
            format: 'css/variables',
            options: { outputReferences: true },
          },
        ],
      },
      scss: {
        transformGroup: 'scss',
        buildPath: 'dist/scss/',
        files: [
          {
            destination: `_${configName}.scss`,
            format: 'scss/variables',
            options: { outputReferences: true },
          },
        ],
      },
      js: {
        transformGroup: 'js',
        buildPath: 'dist/js/',
        files: [
          {
            destination: `${configName}.js`,
            format: 'javascript/es6',
          },
          {
            destination: `${configName}.d.ts`,
            format: 'typescript/declarations',
          },
        ],
      },
      json: {
        transformGroup: 'js',
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
 * These files contain ONLY typography overrides for class-based density switching.
 * They use outputReferences to keep CSS custom property references intact.
 */
function createProjectTypeScopedConfig(projectType) {
  const selector = projectType === 'default' ? ':root' : '.dsn-density-dense';

  return {
    source: [`src/tokens/project-types/${projectType}/*.json`],
    platforms: {
      css: {
        transformGroup: 'css',
        buildPath: 'dist/css/scoped/',
        files: [
          {
            destination: `density-${projectType}.css`,
            format: 'css/variables-scoped',
            options: { selector, outputReferences: true },
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
// - density configs (font-size only, no cross-references)
// - wireframe color configs (simple aliases)
// Non-working due to cross-references:
// - theme-base configs (icon.size references font-size from typography)
// - start color configs (form-control.read-only.border-color references dsn.color.transparent from base)
const scopedConfigs = {
  // Density configs work - they only contain font-size tokens with no external references
  ...Object.fromEntries(
    projectTypes.map((pt) => [
      `density-${pt}`,
      createProjectTypeScopedConfig(pt),
    ])
  ),
  // Wireframe color configs work - they use simple value aliases
  'wireframe-light-scoped': createModeScopedConfig('wireframe', 'light'),
  'wireframe-dark-scoped': createModeScopedConfig('wireframe', 'dark'),
};

// Legacy aliases for backward compatibility
const legacyConfigs = createLegacyConfig();

module.exports = {
  // Configuration axes (for build script)
  themes,
  modes,
  projectTypes,

  // All configurations
  fullConfigs,
  scopedConfigs,

  // Legacy aliases (backward compatibility)
  light: legacyConfigs.light,
  dark: legacyConfigs.dark,

  // Helper functions (for custom builds)
  createFullConfig,
  createModeScopedConfig,
  createProjectTypeScopedConfig,
  createThemeBaseScopedConfig,
};
