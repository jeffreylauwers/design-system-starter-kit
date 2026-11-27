import { buildColorGroup } from './palette.ts';
import { oklchToCss, parseToOklch } from './oklch.ts';
import { TOKEN_STEPS } from './types.ts';
import type { ColorMode, TokenStep } from './types.ts';

/** A group generated from its own base color. */
export interface ColorGroupSource {
  base: string;
}

/** A group that points at another group, token for token. */
export interface ColorGroupAlias {
  alias: string;
}

export type ColorGroupConfig = ColorGroupSource | ColorGroupAlias;

export interface ThemeColorsConfig {
  /** Scales the chroma of every group; 1 is the generator's default curve. */
  intensity: number;
  /** Keyed by group name, e.g. `accent-1`. Inverse groups follow automatically. */
  groups: Record<string, ColorGroupConfig>;
}

/**
 * The source of a theme, stored as `themes/{name}/theme.config.json`.
 * Only colors for now; typography, space and the rest follow.
 */
export interface ThemeConfig {
  colors: ThemeColorsConfig;
}

/**
 * Token values per group, as they go into `$value`: an `oklch()` string for a
 * generated group, a reference such as `{dsn.color.accent-1.bg-default}` for
 * an alias. Inverse groups are listed under `{group}-inverse`.
 */
export type ColorTokenValues = Record<string, Record<TokenStep, string>>;

function isAlias(group: ColorGroupConfig): group is ColorGroupAlias {
  return 'alias' in group;
}

/** Returns every problem in the config; an empty list means it is usable. */
export function validateThemeConfig(config: unknown): string[] {
  const errors: string[] = [];
  const colors = (config as Partial<ThemeConfig> | null)?.colors;
  if (!colors || typeof colors !== 'object') {
    return ['`colors` ontbreekt'];
  }
  if (typeof colors.intensity !== 'number' || !(colors.intensity > 0)) {
    errors.push('`colors.intensity` moet een getal groter dan 0 zijn');
  }
  const groups = colors.groups;
  if (!groups || typeof groups !== 'object') {
    errors.push('`colors.groups` ontbreekt');
    return errors;
  }

  for (const [name, group] of Object.entries(groups)) {
    const keys = Object.keys(group ?? {});
    if (keys.length !== 1 || !['base', 'alias'].includes(keys[0])) {
      errors.push(`${name}: geef óf \`base\` óf \`alias\` op, en niets anders`);
      continue;
    }
    if (isAlias(group)) {
      const target = groups[group.alias];
      if (group.alias === name) {
        errors.push(`${name}: verwijst naar zichzelf`);
      } else if (!target) {
        errors.push(`${name}: verwijst naar onbekende groep "${group.alias}"`);
      } else if (isAlias(target)) {
        errors.push(
          `${name}: verwijst naar "${group.alias}", die zelf ook een verwijzing is`
        );
      }
    } else if (!parseToOklch(group.base)) {
      errors.push(`${name}: "${group.base}" is geen geldige kleur`);
    }
  }
  return errors;
}

function assertValid(config: ThemeConfig): void {
  const errors = validateThemeConfig(config);
  if (errors.length > 0) {
    throw new Error(`Ongeldige themaconfig:\n  ${errors.join('\n  ')}`);
  }
}

function reference(group: string, step: TokenStep): string {
  return `{dsn.color.${group}.${step}}`;
}

/** Generates the color token values of one mode from a theme config. */
export function generateColorTokens(
  config: ThemeConfig,
  mode: ColorMode
): ColorTokenValues {
  assertValid(config);
  const { intensity, groups } = config.colors;
  const values: ColorTokenValues = {};
  const inverseValues: ColorTokenValues = {};

  for (const [name, group] of Object.entries(groups)) {
    const regular = {} as Record<TokenStep, string>;
    const inverse = {} as Record<TokenStep, string>;

    if (isAlias(group)) {
      for (const step of TOKEN_STEPS) {
        regular[step] = reference(group.alias, step);
        inverse[step] = reference(`${group.alias}-inverse`, step);
      }
    } else {
      const base = parseToOklch(group.base);
      if (!base) throw new Error(`${name}: ongeldige kleur`);
      const generated = buildColorGroup(
        name,
        name,
        group.base,
        base,
        mode,
        intensity
      );
      for (const step of TOKEN_STEPS) {
        regular[step] = oklchToCss(generated.tokens[step].oklch);
        inverse[step] = oklchToCss(
          generated.inverseTokens[`inverse-${step}`].oklch
        );
      }
    }

    values[name] = regular;
    inverseValues[`${name}-inverse`] = inverse;
  }

  return { ...values, ...inverseValues };
}

interface TokenNode {
  $value?: unknown;
  [key: string]: unknown;
}

function isColorGroup(node: unknown): boolean {
  return (
    typeof node === 'object' &&
    node !== null &&
    TOKEN_STEPS.every((step) => step in node)
  );
}

/**
 * Writes generated values into a theme's color JSON. Only `$value` changes:
 * key order, `$type`, `$description` and every token outside the color groups
 * (shadow, transparent, focus, form-control, heading, backdrop) stay as they
 * are. Throws when the JSON and the values do not describe the same groups.
 */
export function applyColorTokens<T>(template: T, values: ColorTokenValues): T {
  // The template is JSON, so a JSON round trip is a complete deep copy.
  const result = JSON.parse(JSON.stringify(template)) as T;
  const color = (result as { dsn?: { color?: Record<string, unknown> } }).dsn
    ?.color;
  if (!color) throw new Error('De JSON heeft geen `dsn.color`');

  const errors: string[] = [];
  for (const [group, steps] of Object.entries(values)) {
    const node = color[group] as Record<string, TokenNode> | undefined;
    if (!node) {
      errors.push(`groep ${group} ontbreekt in de JSON`);
      continue;
    }
    for (const step of TOKEN_STEPS) {
      const token = node[step];
      if (!token || !('$value' in token)) {
        errors.push(`${group}.${step} ontbreekt in de JSON`);
        continue;
      }
      token.$value = steps[step];
    }
    const extra = Object.keys(node).filter(
      (key) => !(TOKEN_STEPS as string[]).includes(key)
    );
    for (const key of extra) {
      errors.push(`${group}.${key} staat in de JSON maar niet in de generator`);
    }
  }
  for (const [group, node] of Object.entries(color)) {
    if (isColorGroup(node) && !(group in values)) {
      errors.push(`groep ${group} staat in de JSON maar niet in de config`);
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `De kleuren passen niet op de JSON:\n  ${errors.join('\n  ')}`
    );
  }
  return result;
}
