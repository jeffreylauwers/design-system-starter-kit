import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Contracttest op de gepubliceerde package-vorm.
 *
 * Twee dingen zijn hier eerder misgegaan en allebei vielen ze pas op bij een
 * consument, niet in de monorepo:
 *
 * 1. Een CSS- of SCSS-export als kale string. TypeScript kan zo'n side-effect
 *    import niet oplossen en meldt TS2882 zodra de consument
 *    `noUncheckedSideEffectImports` aanzet.
 * 2. `"sideEffects": false` in een package dat CSS exporteert. Webpack mag dan
 *    `import '.../css'` weggooien, waardoor de styling stil verdwijnt in een
 *    productiebuild.
 *
 * Zie CLAUDE.md en docs/decisions/ voor het publicatiecontract.
 */

const PACKAGES_DIR = path.resolve(__dirname, '..', 'packages');
const STYLESHEET = /\.(css|scss)$/;

type Exports = Record<string, unknown>;

interface StyleEntry {
  /** De subpath zoals een consument hem importeert, bijvoorbeeld './css'. */
  subpath: string;
  /** Het conditie-object, of null wanneer de entry een kale string is. */
  conditions: Record<string, unknown> | null;
  target: string;
}

/** Verzamelt elke export-entry die naar een stylesheet wijst. */
function collectStyleEntries(exportsMap: Exports): StyleEntry[] {
  const entries: StyleEntry[] = [];

  for (const [subpath, value] of Object.entries(exportsMap)) {
    if (typeof value === 'string') {
      if (STYLESHEET.test(value)) {
        entries.push({ subpath, conditions: null, target: value });
      }
      continue;
    }

    if (value && typeof value === 'object') {
      const conditions = value as Record<string, unknown>;
      for (const conditionValue of Object.values(conditions)) {
        if (
          typeof conditionValue === 'string' &&
          STYLESHEET.test(conditionValue)
        ) {
          entries.push({ subpath, conditions, target: conditionValue });
          break;
        }
      }
    }
  }

  return entries;
}

/** Valt een pad binnen de `files`-lijst, zodat npm het meepubliceert? */
function isPublished(files: string[], target: string): boolean {
  const relative = target.replace(/^\.\//, '');
  return files.some(
    (entry) =>
      entry === relative || relative.startsWith(`${entry.replace(/\/$/, '')}/`)
  );
}

const packages = readdirSync(PACKAGES_DIR)
  .map((name) => ({ name, dir: path.join(PACKAGES_DIR, name) }))
  .filter(({ dir }) => existsSync(path.join(dir, 'package.json')))
  .map(({ name, dir }) => ({
    name,
    dir,
    json: JSON.parse(
      readFileSync(path.join(dir, 'package.json'), 'utf8')
    ) as Record<string, unknown>,
  }))
  .filter(({ json }) => json.private !== true);

describe('package exports: stylesheets', () => {
  it('vindt de packages die stylesheets exporteren', () => {
    const withStyles = packages.filter(
      ({ json }) =>
        collectStyleEntries((json.exports ?? {}) as Exports).length > 0
    );

    expect(withStyles.map((p) => p.name).sort()).toEqual([
      'components-html',
      'components-react',
      'core',
      'design-tokens',
    ]);
  });

  for (const { name, dir, json } of packages) {
    const styleEntries = collectStyleEntries((json.exports ?? {}) as Exports);
    if (styleEntries.length === 0) continue;

    describe(name, () => {
      const files = (json.files ?? []) as string[];

      it.each(styleEntries.map((entry) => [entry.subpath, entry] as const))(
        '%s heeft een types-conditie die naar een bestaande stub wijst',
        (_subpath, entry) => {
          expect(entry.conditions).not.toBeNull();

          const conditions = entry.conditions as Record<string, unknown>;
          const types = conditions.types;

          expect(typeof types).toBe('string');
          expect(types as string).toMatch(/\.d\.ts$/);
          expect(existsSync(path.join(dir, types as string))).toBe(true);

          // Condities worden op volgorde afgelopen: staat `default` eerst, dan
          // pakt TypeScript het CSS-bestand alsnog en verandert er niets.
          expect(Object.keys(conditions)[0]).toBe('types');
        }
      );

      it.each(styleEntries.map((entry) => [entry.subpath, entry] as const))(
        '%s publiceert zowel de stub als het stylesheet',
        (_subpath, entry) => {
          const types = (entry.conditions?.types ?? '') as string;
          expect(isPublished(files, types)).toBe(true);
          expect(isPublished(files, entry.target)).toBe(true);
        }
      );

      it('markeert stylesheets niet als side-effect-vrij', () => {
        expect(json.sideEffects).not.toBe(false);

        if (Array.isArray(json.sideEffects)) {
          const patterns = json.sideEffects as string[];
          const extensions = new Set(
            styleEntries.map((entry) => path.extname(entry.target))
          );

          for (const extension of extensions) {
            expect(patterns).toContain(`**/*${extension}`);
          }
        }
      });
    });
  }
});
