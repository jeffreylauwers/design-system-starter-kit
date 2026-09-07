import { existsSync, readdirSync, readFileSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Contracttest op de CSS-afhankelijkheden tussen componenten.
 *
 * Wat hier eerder misging: een component zet klassen van een ánder component in
 * zijn markup (de sorteerknop van Table draagt `dsn-button`, ButtonLink draagt
 * `dsn-button`, MenuLink heeft een uitklapknop) zonder dat iets die CSS
 * meelaadt. Zolang alle component-CSS in één bundel zat viel dat niet op, want
 * dan was button.css er toch wel. Zodra de bundler per component een CSS-chunk
 * maakt, laadt die chunk alleen wat de modulegraaf aanwijst en verdwijnt de
 * styling stil. Gemeten op de gepubliceerde Storybook: ButtonLink rendert dan
 * met `background-color: rgba(0,0,0,0)` en `padding: 0px`.
 *
 * De HTML/CSS-laag is de bron van waarheid. Die declareert zijn
 * afhankelijkheden met `@dsn-depends-on: <component>` (zie
 * packages/components-html/scripts/build.js, dat er de volgorde in
 * dist/components.css mee bepaalt). React is daarvan afgeleid en moet diezelfde
 * afhankelijkheden ophalen.
 *
 * Deze test bewaakt twee dingen:
 *
 * 1. Elke `dsn-*` klasse die een React-component rendert, moet gedefinieerd
 *    worden in CSS die vanuit dat component bereikbaar is.
 * 2. Elke `@dsn-depends-on` in de components-html CSS van een component moet
 *    ook bereikbaar zijn vanuit de React-CSS van datzelfde component.
 */

const ROOT = path.resolve(__dirname, '..');
const HTML_SRC = path.join(ROOT, 'packages/components-html/src');
const REACT_SRC = path.join(ROOT, 'packages/components-react/src');

const BLOCK_COMMENT = /\/\*[\s\S]*?\*\//g;
const LINE_COMMENT = /^[ \t]*\/\/.*$/gm;
const JSX_COMMENT = /\{\s*\/\*[\s\S]*?\*\/\s*\}/g;

/** Alle componentmappen in components-html die een gelijknamig CSS-bestand hebben. */
const htmlComponents = readdirSync(HTML_SRC, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => existsSync(path.join(HTML_SRC, name, `${name}.css`)))
  .sort();

/** Klasse -> de components-html CSS-bestanden die hem definiëren. */
const definedIn = new Map<string, string[]>();
/** Component -> zijn gedeclareerde @dsn-depends-on. */
const declaredDependencies = new Map<string, string[]>();

for (const name of htmlComponents) {
  const file = path.join(HTML_SRC, name, `${name}.css`);
  const raw = readFileSync(file, 'utf-8');

  const dependsOn = raw.match(/\/\*\s*@dsn-depends-on:\s*([^*]+?)\s*\*\//);
  declaredDependencies.set(
    name,
    (dependsOn?.[1] ?? '')
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)
  );

  // Alleen selectors, niet de declaratieblokken: anders vangen we ook
  // custom properties zoals --dsn-button-border-width op.
  const selectors = raw.replace(BLOCK_COMMENT, '').match(/[^{}]+(?=\{)/g) ?? [];
  for (const selector of selectors) {
    for (const [, className] of selector.matchAll(/\.(dsn-[a-z0-9-]+)/g)) {
      const owners = definedIn.get(className) ?? [];
      if (!owners.includes(file)) owners.push(file);
      definedIn.set(className, owners);
    }
  }
}

/** Volgt @import-ketens en geeft elk bereikbaar CSS-bestand terug. */
function reachableCss(entry: string, seen = new Set<string>()): Set<string> {
  if (!existsSync(entry)) return seen;
  const resolved = realpathSync(entry);
  if (seen.has(resolved)) return seen;
  seen.add(resolved);

  const raw = readFileSync(resolved, 'utf-8');
  for (const [, target] of raw.matchAll(/@import\s+'([^']+)'/g)) {
    if (target.startsWith('.')) {
      reachableCss(path.resolve(path.dirname(resolved), target), seen);
    }
  }
  return seen;
}

/** De React-componenten met een gelijknamig .tsx-bestand. */
const reactComponents = readdirSync(REACT_SRC, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => existsSync(path.join(REACT_SRC, name, `${name}.tsx`)))
  .sort();

/** Alle CSS die een React-component via zijn imports binnenhaalt. */
function cssReachableFrom(component: string): Set<string> {
  const tsx = path.join(REACT_SRC, component, `${component}.tsx`);
  const source = readFileSync(tsx, 'utf-8');
  const reachable = new Set<string>();
  for (const [, target] of source.matchAll(/import\s+'([^']+\.css)'/g)) {
    for (const file of reachableCss(
      path.resolve(REACT_SRC, component, target)
    )) {
      reachable.add(file);
    }
  }
  return reachable;
}

describe('CSS-afhankelijkheden van React-componenten', () => {
  it.each(reactComponents)(
    '%s laadt de CSS van elke klasse die het rendert',
    (component) => {
      const source = readFileSync(
        path.join(REACT_SRC, component, `${component}.tsx`),
        'utf-8'
      )
        .replace(BLOCK_COMMENT, '')
        .replace(JSX_COMMENT, '')
        .replace(LINE_COMMENT, '');

      const reachable = cssReachableFrom(component);
      const missing = new Set<string>();

      for (const [, className] of source.matchAll(/(dsn-[a-z0-9-]+)/g)) {
        const owners = definedIn.get(className);
        if (!owners) continue;
        if (!owners.some((owner) => reachable.has(realpathSync(owner)))) {
          missing.add(`${className} (staat in ${path.basename(owners[0])})`);
        }
      }

      expect([...missing].sort()).toEqual([]);
    }
  );

  it.each(reactComponents)(
    '%s haalt elke @dsn-depends-on uit de HTML/CSS-laag op',
    (component) => {
      const reachable = cssReachableFrom(component);

      // Welke components-html CSS is het eigen bestand van dit component?
      const own = [...reachable].filter((file) =>
        file.startsWith(realpathSync(HTML_SRC))
      );

      const missing: string[] = [];
      for (const file of own) {
        const name = path.basename(file, '.css');
        for (const dependency of declaredDependencies.get(name) ?? []) {
          const target = path.join(HTML_SRC, dependency, `${dependency}.css`);
          if (!reachable.has(realpathSync(target))) {
            missing.push(`${name}.css hangt af van ${dependency}.css`);
          }
        }
      }

      expect(missing.sort()).toEqual([]);
    }
  );
});

describe('@dsn-depends-on in de HTML/CSS-laag', () => {
  it('verwijst alleen naar bestaande componenten', () => {
    const unknown: string[] = [];
    for (const [name, dependencies] of declaredDependencies) {
      for (const dependency of dependencies) {
        if (!htmlComponents.includes(dependency)) {
          unknown.push(`${name}.css -> ${dependency}`);
        }
      }
    }
    expect(unknown).toEqual([]);
  });
});
