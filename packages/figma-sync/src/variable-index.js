/**
 * Lookup van CSS custom property naar Figma variable.
 *
 * De generator weet na het meten alleen de naam van de custom property
 * (`--dsn-button-strong-background-color`); de plugin heeft de naam van de
 * variable nodig (`button/strong/background-color` in `dsn/Components`). Die
 * twee zijn hetzelfde token in een andere notatie:
 *
 *   token path   dsn . button . strong . background-color
 *   css          --dsn-button-strong-background-color      (path.join('-'))
 *   figma        button/strong/background-color            (path.slice(1).join('/'))
 *
 * De vertaling is dus een tekstomzetting, maar de *lijst* komt uit
 * `variables.json`: alleen tokens die het tot een Figma-variable geschopt
 * hebben mogen gebonden worden. Wat daar is afgevallen (shadows, transitions)
 * moet een vaste waarde houden.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(__dirname, '..', '..', '..');

export const VARIABLES_FILE =
  'packages/design-tokens/dist/figma/variables.json';

/** `button/strong/background-color` -> `dsn-button-strong-background-color`. */
export function cssNameFor(variableName) {
  return `dsn-${variableName.split('/').join('-')}`;
}

/**
 * Kiest per collection de mode waarin de generator meet.
 *
 * De verificatie vergelijkt de waarde van het token met de gemeten waarde, dus
 * beide moeten uit dezelfde hoek komen: dezelfde theme, dezelfde light/dark
 * stand en dezelfde viewport. De matrix zegt met welke token-CSS hij rendert
 * (`start-light-default.css`) en op welke breedte (375px), en dat is precies
 * genoeg om de modes te kiezen.
 */
export function modesForMatrix(matrix, collections) {
  const source = (matrix.css ?? []).find((file) =>
    /dist\/css\/[a-z0-9-]+\.css$/.test(file)
  );
  const parsed = source
    ? path.basename(source, '.css').match(/^(.+?)-(light|dark)-(.+)$/)
    : null;

  const [, theme = 'start', appearance = 'light', density = 'default'] =
    parsed ?? [];

  // De Density-collection krijgt een mode per viewport zodra een project-type
  // fluid is; is het dat niet, dan is er maar één mode met de kale naam.
  const width = matrix.viewport?.width ?? 375;
  const viewport = width > 375 ? 'desktop' : 'mobile';

  const modesOf = (name) =>
    collections.find((collection) => collection.name === name)?.modes ?? [];
  const pick = (name, ...candidates) => {
    const available = modesOf(name);
    return candidates.find((mode) => available.includes(mode)) ?? available[0];
  };

  return {
    'dsn/Primitives': pick('dsn/Primitives', `${theme}-${appearance}`),
    'dsn/Density': pick('dsn/Density', `${density}-${viewport}`, density),
    'dsn/Components': pick('dsn/Components', 'default'),
  };
}

/**
 * Bouwt de index uit een `variables.json`-payload.
 *
 * @param {object} payload
 * @param {Record<string, string>} modes mode per collection, voor de verificatie
 */
export function createVariableIndex(payload, modes) {
  const byKey = new Map();
  const byCssName = new Map();
  const ambiguous = new Set();

  for (const collection of payload.collections) {
    for (const variable of collection.variables) {
      const entry = {
        collection: collection.name,
        name: variable.name,
        type: variable.type,
        alias: variable.alias,
        valuesByMode: variable.valuesByMode,
      };
      byKey.set(`${collection.name}|${variable.name}`, entry);

      const cssName = cssNameFor(variable.name);
      // Twee variables die op dezelfde custom property uitkomen zouden een
      // gok worden; dan liever niets binden.
      if (byCssName.has(cssName)) ambiguous.add(cssName);
      byCssName.set(cssName, entry);
    }
  }

  for (const cssName of ambiguous) byCssName.delete(cssName);

  /** Volgt de aliasketen tot de variable die de waarde daadwerkelijk draagt. */
  const sourceOf = (entry, depth = 0) => {
    if (depth > 10) return undefined;
    if (!entry.alias) return entry;
    const target = byKey.get(`${entry.alias.collection}|${entry.alias.name}`);
    return target ? sourceOf(target, depth + 1) : undefined;
  };

  /** De waarde in de mode waarin de generator meet. */
  const valueOf = (entry) => {
    const source = sourceOf(entry);
    if (!source) return undefined;
    const values = source.valuesByMode ?? {};
    const mode = modes[source.collection];
    return mode in values ? values[mode] : undefined;
  };

  return {
    modes,
    ambiguous: [...ambiguous],
    size: byCssName.size,
    /** @returns {{collection: string, name: string, type: string, value: unknown}|undefined} */
    lookup(cssName) {
      const entry = byCssName.get(cssName);
      if (!entry) return undefined;
      return {
        collection: entry.collection,
        name: entry.name,
        type: entry.type,
        value: valueOf(entry),
      };
    },
  };
}

/**
 * Leest `variables.json` van schijf.
 * Retourneert null als het bestand er nog niet is; de componentbuild moet dan
 * doorlopen zonder bindingen in plaats van om te vallen.
 */
export function loadVariablesPayload() {
  const file = path.join(monorepoRoot, VARIABLES_FILE);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
