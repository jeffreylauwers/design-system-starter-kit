import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import path from 'path';

/**
 * Elk component-token wordt ook echt gebruikt.
 *
 * Een token dat geen component leest, doet niets: wie hem aanpast, ziet geen
 * verschil. Toch stond hij in de npm-dist, in Figma en in de token-tabel in
 * Storybook. Zo bleven onder meer `legend-*`-tokens van CheckboxGroup en
 * RadioGroup en de `box-shadow-x/y/blur`-tokens van TextInput en TextArea
 * jarenlang bestaan zonder effect.
 *
 * Gebruikt betekent: de CSS-naam staat in de broncode van components-html,
 * components-react of components-web, of een ander gebruikt token verwijst
 * ernaar (zoals `icon-gap` in de berekening van `padding-inline-end-with-icon`).
 * Prettier zet `var(` en de naam soms op aparte regels; daarom zoeken we op de
 * naam zelf en niet op `var(--naam`.
 */

const ROOT = path.resolve(__dirname, '..');
const TOKENS_DIR = path.join(ROOT, 'packages/design-tokens/src/tokens');
const SOURCE_DIRS = [
  'packages/components-html/src',
  'packages/components-react/src',
  'packages/components-web/src',
].map((dir) => path.join(ROOT, dir));

type TokenTree = { [key: string]: TokenTree | string };

function files(dir: string, pattern: RegExp): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return files(full, pattern);
    return pattern.test(entry.name) ? [full] : [];
  });
}

/** Alle tokens als `dsn.a.b` → lijst van waarden (een token kan in meerdere bestanden staan). */
function readTokens(file: string, into: Map<string, string[]>) {
  const walk = (node: TokenTree, trail: string[]) => {
    if ('$value' in node) {
      const key = trail.join('.');
      into.set(key, [...(into.get(key) ?? []), String(node.$value)]);
      return;
    }
    for (const [name, child] of Object.entries(node)) {
      if (typeof child === 'object') walk(child, [...trail, name]);
    }
  };
  walk(JSON.parse(readFileSync(file, 'utf8')), []);
}

describe('component-tokens', () => {
  it('worden allemaal gebruikt', () => {
    const all = new Map<string, string[]>();
    for (const file of files(TOKENS_DIR, /\.json$/)) readTokens(file, all);

    const component = new Map<string, string[]>();
    for (const file of files(path.join(TOKENS_DIR, 'components'), /\.json$/)) {
      readTokens(file, component);
    }

    const source = SOURCE_DIRS.flatMap((dir) =>
      files(dir, /\.(css|ts|tsx|js)$/).filter(
        (file) => !/\.test\.|\.generated\./.test(file)
      )
    )
      .map((file) => readFileSync(file, 'utf8'))
      .join('\n');
    const named = new Set(source.match(/--dsn-[a-z0-9-]+/g) ?? []);

    const used = new Set(
      [...all.keys()].filter((key) => named.has(`--${key.replace(/\./g, '-')}`))
    );
    // Een token waar een gebruikt token naar verwijst, is ook gebruikt.
    const queue = [...used];
    while (queue.length) {
      for (const value of all.get(queue.pop()!) ?? []) {
        for (const [, ref] of value.matchAll(/\{([^}]+)\}/g)) {
          if (all.has(ref) && !used.has(ref)) {
            used.add(ref);
            queue.push(ref);
          }
        }
      }
    }

    const unused = [...component.keys()]
      .filter((key) => !used.has(key))
      .map((key) => `--${key.replace(/\./g, '-')}`);
    expect(unused).toEqual([]);
  });
});
