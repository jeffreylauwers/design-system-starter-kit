import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import path from 'path';

/**
 * Elke `var(--dsn-...)` in de component-CSS wijst naar iets dat bestaat.
 *
 * Wat hier misging: de `::backdrop` van ModalDialog en Drawer las
 * `var(--dsn-backdrop-background, rgba(0, 0, 0, 0.5))`. Die token bestaat niet
 * (hij heet `--dsn-backdrop-background-color`), dus in elk thema en elke mode
 * gold de hardgecodeerde fallback, en geen enkele check zag het. Een
 * `var()` naar een onbekende naam faalt in de browser stil: met een fallback
 * wint die, zonder fallback is de declaratie ongeldig en valt de eigenschap
 * terug op zijn beginwaarde.
 *
 * `component-tokens-used.test.ts` bewaakt de andere richting (elk
 * component-token wordt gelezen). Deze test bewaakt:
 *
 * 1. Elke `var(--dsn-...)` in components-html en in de shadow-CSS van
 *    components-web is een token, een custom property die de component-CSS
 *    zelf zet (zoals `--dsn-stack-space` of `--dsn-alert-color`), of staat in
 *    `NOT_A_TOKEN` met een reden.
 * 2. Elke custom property die de component-CSS zet en die geen token is, wordt
 *    ook ergens gelezen. Een tikfout in een override-lijst (zie regel 8 in
 *    CLAUDE.md, inverse context) doet anders stil niets.
 *
 * Tokens komen uit de bron-JSON, niet uit de build: deze test hoeft niet na
 * `pnpm build` te draaien. Prettier zet `var(` en de naam soms op aparte
 * regels; daarom staat er `\s*` tussen.
 */

const ROOT = path.resolve(__dirname, '..');
const TOKENS_DIR = path.join(ROOT, 'packages/design-tokens/src/tokens');
const CSS_DIRS = [
  'packages/components-html/src',
  'packages/components-web/src',
].map((dir) => path.join(ROOT, dir));

/**
 * Custom properties die bewust geen token zijn: je zet ze per instantie, in
 * een `style`-attribuut of via een React-prop.
 */
const NOT_A_TOKEN: Record<string, string> = {
  '--dsn-hero-bg-image':
    'achtergrondafbeelding per Hero, via style of de backgroundImage-prop',
  '--dsn-sidebar-layout-sidebar-inline-size':
    'breedte van de zijbalk in PageBody, per pagina te overschrijven',
  '--dsn-sidebar-layout-toc-inline-size':
    'breedte van de inhoudsopgave in PageBody, per pagina te overschrijven',
};

type TokenTree = { [key: string]: TokenTree | string };

function files(dir: string, pattern: RegExp): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return files(full, pattern);
    return pattern.test(entry.name) ? [full] : [];
  });
}

/** Alle tokens als CSS-naam: `dsn.backdrop.blur` → `--dsn-backdrop-blur`. */
function tokenNames(): Set<string> {
  const names = new Set<string>();
  const walk = (node: TokenTree, trail: string[]) => {
    if ('$value' in node) {
      names.add(`--${trail.join('-')}`);
      return;
    }
    for (const [name, child] of Object.entries(node)) {
      if (typeof child === 'object') walk(child, [...trail, name]);
    }
  };
  for (const file of files(TOKENS_DIR, /\.json$/)) {
    walk(JSON.parse(readFileSync(file, 'utf8')), []);
  }
  return names;
}

const tokens = tokenNames();

/** Naam → de bestanden waarin hij gelezen (`var()`) of gezet (`--naam:`) wordt. */
const read = new Map<string, Set<string>>();
const declared = new Map<string, Set<string>>();

function add(into: Map<string, Set<string>>, name: string, file: string) {
  if (!into.has(name)) into.set(name, new Set());
  into.get(name)!.add(path.relative(ROOT, file));
}

for (const file of CSS_DIRS.flatMap((dir) => files(dir, /\.css$/))) {
  const css = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  for (const [, name] of css.matchAll(/var\(\s*(--dsn-[a-z0-9-]+)/g)) {
    add(read, name, file);
  }
  for (const [, name] of css.matchAll(/(--dsn-[a-z0-9-]+)\s*:/g)) {
    add(declared, name, file);
  }
}

const where = (entries: [string, Set<string>][]) =>
  entries.map(([name, in_]) => `${name} (${[...in_].join(', ')})`);

describe('custom properties in de component-CSS', () => {
  it('lezen alleen tokens, eigen custom properties of bekende uitzonderingen', () => {
    const unknown = [...read].filter(
      ([name]) =>
        !tokens.has(name) && !declared.has(name) && !(name in NOT_A_TOKEN)
    );
    expect(where(unknown)).toEqual([]);
  });

  it('die de CSS zelf zet en geen token zijn, worden ook gelezen', () => {
    const unread = [...declared].filter(
      ([name]) => !tokens.has(name) && !read.has(name)
    );
    expect(where(unread)).toEqual([]);
  });

  it('NOT_A_TOKEN bevat alleen namen die nog gelezen worden en geen token zijn', () => {
    const stale = Object.keys(NOT_A_TOKEN).filter(
      (name) => !read.has(name) || tokens.has(name)
    );
    expect(stale).toEqual([]);
  });
});
