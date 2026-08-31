#!/usr/bin/env node
/**
 * Builds dist/components.css by concatenating all component CSS files.
 *
 * Automatically discovers all component directories in src/ — no manual
 * updates needed when new components are added.
 *
 * Order matters when one component overrides another on equal specificity
 * (select overrides text-input, for example). Such a component declares that
 * with a `@dsn-depends-on: <component>` comment in its CSS, and is emitted
 * after everything it depends on. The declaration is a comment rather than an
 * @import, because an @import here would be inlined a second time by the
 * bundler of components-react, after the overriding rules.
 *
 * Package @imports (design tokens) are hoisted to the top, because @import is
 * only valid before any rule.
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.resolve(__dirname, '../src');
const DIST_DIR = path.resolve(__dirname, '../dist');

const PACKAGE_IMPORT_RE = /^@import\s+['"][^.'"][^'"]*['"]\s*;\s*$/;
const DEPENDS_ON_RE = /\/\*\s*@dsn-depends-on:\s*([^*]+?)\s*\*\//;

fs.mkdirSync(DIST_DIR, { recursive: true });

const components = fs
  .readdirSync(SRC_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => fs.existsSync(path.join(SRC_DIR, name, `${name}.css`)))
  .sort((a, b) => a.localeCompare(b));

/** Reads a component's CSS and its declared dependencies. */
function read(name) {
  const css = fs.readFileSync(path.join(SRC_DIR, name, `${name}.css`), 'utf-8');

  const dependencies = (css.match(DEPENDS_ON_RE)?.[1] ?? '')
    .split(',')
    .map((dependency) => dependency.trim())
    .filter(Boolean);

  for (const dependency of dependencies) {
    if (!components.includes(dependency)) {
      throw new Error(
        `${name}.css: @dsn-depends-on '${dependency}' bestaat niet`
      );
    }
  }

  const packageImports = css
    .split('\n')
    .filter((line) => PACKAGE_IMPORT_RE.test(line));

  return {
    dependencies,
    packageImports,
    body: css
      .split('\n')
      .filter((line) => !PACKAGE_IMPORT_RE.test(line))
      .join('\n'),
  };
}

const parsed = new Map(components.map((name) => [name, read(name)]));

const hoisted = [];
const emitted = [];
const state = new Map();

function visit(name, trail) {
  if (state.get(name) === 'done') return;
  if (state.get(name) === 'visiting') {
    throw new Error(
      `Cyclische @dsn-depends-on: ${[...trail, name].join(' -> ')}`
    );
  }
  state.set(name, 'visiting');

  const component = parsed.get(name);
  for (const dependency of component.dependencies) {
    visit(dependency, [...trail, name]);
  }

  for (const line of component.packageImports) {
    if (!hoisted.includes(line)) hoisted.push(line);
  }

  emitted.push(component.body);
  state.set(name, 'done');
}

for (const name of components) visit(name, []);

fs.writeFileSync(
  path.join(DIST_DIR, 'components.css'),
  [...hoisted, ...emitted].join('\n')
);

console.log(`Built dist/components.css from ${emitted.length} components.`);
