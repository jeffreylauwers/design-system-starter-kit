import {
  applyColorTokens,
  buildColorGroup,
  flattenTokens,
  generateColorTokens,
  mergeTokenTrees,
  parseToOklch,
  readFluidViewport,
  TOKEN_STEPS,
} from '@dsn-starter-kit/theme-engine';
import type {
  ColorGroup,
  ColorMode,
  ResolvedToken,
  ThemeConfig,
  TokenTree,
} from '@dsn-starter-kit/theme-engine';
import { START, START_GROUP_NAMES } from './start';

export type { ThemeConfig, ResolvedToken };

/** A deep copy, so the configurator never changes Start's own objects. */
function copy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function defaultConfig(): ThemeConfig {
  return copy(START.config);
}

type ColorNode = Record<string, unknown>;

function isColorGroup(node: unknown): boolean {
  return (
    typeof node === 'object' &&
    node !== null &&
    TOKEN_STEPS.every((step) => step in node)
  );
}

function emptyGroup(): ColorNode {
  return Object.fromEntries(
    TOKEN_STEPS.map((step) => [step, { $value: '', $type: 'color' }])
  );
}

/**
 * Start's color JSON plus an empty group for every group in the config that
 * Start does not have. A new group goes after Start's last group, its
 * inverse group after the last inverse group. Its tokens have no
 * `$description`: that is for whoever adds the group to the repository.
 */
function colorTemplate(config: ThemeConfig, mode: ColorMode): TokenTree {
  const template = copy(START.colors[mode]) as {
    dsn: { color: Record<string, unknown> };
  };
  const extra = Object.keys(config.colors.groups).filter(
    (name) => !(name in template.dsn.color)
  );
  if (extra.length === 0) return template as unknown as TokenTree;

  const entries = Object.entries(template.dsn.color);
  const lastIndex = (inverse: boolean) => {
    let last = -1;
    entries.forEach(([name, node], index) => {
      if (isColorGroup(node) && name.endsWith('-inverse') === inverse) {
        last = index;
      }
    });
    return last;
  };
  const lastRegular = lastIndex(false);
  const lastInverse = lastIndex(true);

  const color: Record<string, unknown> = {};
  entries.forEach(([name, node], index) => {
    color[name] = node;
    if (index === lastRegular) {
      for (const group of extra) color[group] = emptyGroup();
    }
    if (index === lastInverse) {
      for (const group of extra) color[`${group}-inverse`] = emptyGroup();
    }
  });
  template.dsn.color = color;
  return template as unknown as TokenTree;
}

/** The color JSON of one mode: Start's file with the configured groups. */
export function colorTokens(config: ThemeConfig, mode: ColorMode): TokenTree {
  return applyColorTokens(
    colorTemplate(config, mode),
    generateColorTokens(config, mode)
  );
}

/**
 * Every semantic token of the theme in one mode, as the token build writes
 * it to CSS for the standard configuration (project type `default`): a
 * reference stays a `var()`, a fluid token is a clamp().
 *
 * The preview sets these on `:root` of its iframe, over Start's CSS.
 * Component tokens are `var()` references to these tokens, so the
 * components follow. Only set the tokens that differ from Start: Start's CSS
 * also has a `prefers-reduced-motion` block for the durations, and an
 * override on `:root` would win over it.
 */
export function resolveTheme(
  config: ThemeConfig,
  mode: ColorMode
): ResolvedToken[] {
  const tree = mergeTokenTrees(
    START.base,
    colorTokens(config, mode),
    ...START.projectType
  );
  const viewport = readFluidViewport(
    START.base as unknown as Parameters<typeof readFluidViewport>[0]
  );
  return flattenTokens(tree, viewport);
}

/** The tokens of `resolveTheme` whose value differs from Start. */
export function changedTokens(
  config: ThemeConfig,
  mode: ColorMode
): ResolvedToken[] {
  const start = new Map(
    resolveTheme(START.config, mode).map((token) => [token.name, token.value])
  );
  return resolveTheme(config, mode).filter(
    (token) => start.get(token.name) !== token.value
  );
}

function toJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export type ExportFile =
  'base.json' | 'colors-light.json' | 'colors-dark.json' | 'theme.config.json';

/**
 * The files of the theme, for `packages/design-tokens/src/tokens/themes/`.
 * Start's files are the template: only what the configurator sets changes.
 * With Start's own config the files are identical to Start's.
 */
export function exportTheme(config: ThemeConfig): Record<ExportFile, string> {
  return {
    'base.json': toJson(START.base),
    'colors-light.json': toJson(colorTokens(config, 'light')),
    'colors-dark.json': toJson(colorTokens(config, 'dark')),
    'theme.config.json': toJson(config),
  };
}

export interface GroupView extends ColorGroup {
  /** The group this one refers to, token for token. */
  aliasOf?: string;
  /** Part of Start's token structure: cannot be renamed or deleted. */
  standard: boolean;
}

/** The color groups of one mode, for the palette grid. */
export function groupViews(config: ThemeConfig, mode: ColorMode): GroupView[] {
  const { groups, intensity } = config.colors;
  const built = new Map<string, ColorGroup>();
  for (const [name, group] of Object.entries(groups)) {
    if (!('base' in group)) continue;
    const oklch = parseToOklch(group.base);
    if (oklch) {
      built.set(
        name,
        buildColorGroup(name, name, group.base, oklch, mode, intensity)
      );
    }
  }

  return Object.entries(groups).flatMap(([name, group]): GroupView[] => {
    const standard = START_GROUP_NAMES.includes(name);
    if ('alias' in group) {
      const target = built.get(group.alias);
      return target
        ? [{ ...target, id: name, name, aliasOf: group.alias, standard }]
        : [];
    }
    const own = built.get(name);
    return own ? [{ ...own, standard }] : [];
  });
}

const GROUP_NAME = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

/** Why a name cannot be used for a new or renamed group, or null. */
export function groupNameProblem(
  config: ThemeConfig,
  name: string
): string | null {
  if (!GROUP_NAME.test(name)) {
    return 'Gebruik kleine letters, cijfers en streepjes, bijvoorbeeld "brand-2".';
  }
  if (name.endsWith('-inverse')) {
    return 'Een naam mag niet op "-inverse" eindigen.';
  }
  if (name in config.colors.groups) return `"${name}" bestaat al.`;
  return null;
}
