import type {
  ColorMode,
  ThemeConfig,
  TokenTree,
} from '@dsn-starter-kit/theme-engine';
import baseJson from '../../../design-tokens/src/tokens/themes/start/base.json';
import colorsLightJson from '../../../design-tokens/src/tokens/themes/start/colors-light.json';
import colorsDarkJson from '../../../design-tokens/src/tokens/themes/start/colors-dark.json';
import themeConfigJson from '../../../design-tokens/src/tokens/themes/start/theme.config.json';

/**
 * The Start theme as it is in the repository. The configurator starts from
 * it, and its files are the template for the export: whatever the
 * configurator does not set goes along unchanged.
 */

// The project type `default` (fluid text and space), as the build uses it for
// the standard configuration. Globbed, so a new file there is picked up.
const projectTypeModules = import.meta.glob<TokenTree>(
  '../../../design-tokens/src/tokens/project-types/default/*.json',
  { eager: true, import: 'default' }
);

export const START = {
  base: baseJson as unknown as TokenTree,
  colors: {
    light: colorsLightJson as unknown as TokenTree,
    dark: colorsDarkJson as unknown as TokenTree,
  } satisfies Record<ColorMode, TokenTree>,
  config: themeConfigJson as ThemeConfig,
  /** Sorted by file name, the order in which Style Dictionary reads them. */
  projectType: Object.keys(projectTypeModules)
    .sort()
    .map((file) => projectTypeModules[file]),
};

/** The color groups that exist in Start's token structure. */
export const START_GROUP_NAMES = Object.keys(START.config.colors.groups);
