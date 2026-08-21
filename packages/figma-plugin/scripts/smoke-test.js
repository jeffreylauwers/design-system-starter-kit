/**
 * Draait de import-logica tegen de echte gegenereerde JSON, met een mock van
 * de Figma Plugin API. Vangt volgorde- en aliasfouten voordat de plugin in
 * Figma geladen wordt.
 *
 *   node scripts/smoke-test.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { figma, state } from './figma-mock.js';

// De modules praten tegen een globale `figma`, net als in de sandbox.
globalThis.figma = figma;

const { importVariables } = await import('../src/variables.js');
const { importComponentSet } = await import('../src/components.js');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(__dirname, '..', '..', '..');

const problems = [];
const log = {
  info: () => {},
  warn: (message) => problems.push({ level: 'warn', message }),
  error: (message) => problems.push({ level: 'error', message }),
};

function check(label, condition, detail) {
  const mark = condition ? '  ✓' : '  ✗';
  console.log(`${mark} ${label}${detail ? `  ${detail}` : ''}`);
  if (!condition) process.exitCode = 1;
}

function read(relative) {
  return JSON.parse(fs.readFileSync(path.join(monorepoRoot, relative), 'utf8'));
}

// =============================================================================
// Variables
// =============================================================================

console.log('\n=== variables.json ===');
const variablesPayload = read(
  'packages/design-tokens/dist/figma/variables.json'
);
const result = await importVariables(variablesPayload, log);

const expectedVariables = variablesPayload.collections.reduce(
  (total, collection) => total + collection.variables.length,
  0
);

check(
  'collections aangemaakt',
  state.collections.length === variablesPayload.collections.length,
  `${state.collections.length}/${variablesPayload.collections.length}`
);
check(
  'variables aangemaakt',
  state.variables.length === expectedVariables,
  `${state.variables.length}/${expectedVariables}`
);

const density = state.collections.find((c) => c.name === 'dsn/Density');
check(
  'Density heeft 3 modes',
  density && density.modes.length === 3,
  density ? density.modes.map((m) => m.name).join(', ') : 'ontbreekt'
);

// Elke variable moet voor elke mode van zijn collection een waarde hebben.
let missingValues = 0;
for (const collection of state.collections) {
  const modeIds = collection.modes.map((m) => m.modeId);
  for (const variable of state.variables.filter(
    (v) => v.variableCollectionId === collection.id
  )) {
    for (const modeId of modeIds) {
      if (variable.valuesByMode[modeId] === undefined) missingValues += 1;
    }
  }
}
check(
  'elke variable heeft een waarde per mode',
  missingValues === 0,
  `${missingValues} gaten`
);

// Aliassen moeten naar een bestaande variable wijzen.
const byId = new Map(state.variables.map((v) => [v.id, v]));
let brokenAliases = 0;
let aliasValues = 0;
for (const variable of state.variables) {
  for (const value of Object.values(variable.valuesByMode)) {
    if (value && value.type === 'VARIABLE_ALIAS') {
      aliasValues += 1;
      if (!byId.has(value.id)) brokenAliases += 1;
    }
  }
}
check(
  'aliassen wijzen naar bestaande variables',
  brokenAliases === 0,
  `${aliasValues} aliaswaarden`
);
check(
  'aliassen gelegd',
  result.aliasFailed === 0,
  `${result.aliasCount} variables`
);

// Steekproef: een component-token moet doorverwijzen naar de typografieschaal.
const paragraph = state.variables.find(
  (v) => v.name === 'paragraph/default/font-size'
);
const paragraphTarget =
  paragraph && byId.get(Object.values(paragraph.valuesByMode)[0]?.id);
check(
  'paragraph/default/font-size aliast naar text/font-size/md',
  paragraphTarget && paragraphTarget.name === 'text/font-size/md',
  paragraphTarget ? paragraphTarget.name : 'geen alias'
);

// Idempotent: nog een keer draaien mag niets dupliceren.
const beforeRerun = state.variables.length;
await importVariables(variablesPayload, log);
check(
  'tweede import dupliceert niets',
  state.variables.length === beforeRerun,
  `${state.variables.length} variables`
);

// =============================================================================
// Componenten
// =============================================================================

const componentFiles = fs
  .readdirSync(path.join(monorepoRoot, 'packages/figma-sync/dist'))
  .filter((file) => file.endsWith('.json'));

for (const file of componentFiles) {
  console.log(`\n=== ${file} ===`);
  const payload = read(`packages/figma-sync/dist/${file}`);
  const before = problems.length;
  const imported = await importComponentSet(payload, log);

  check(
    'alle varianten gebouwd',
    imported.variants === payload.componentSet.components.length,
    `${imported.variants}/${payload.componentSet.components.length}`
  );
  check('component set gecombineerd', imported.combined === true);

  const fresh = problems
    .slice(before)
    .filter((p) => !payload.warnings.includes(p.message));
  const errors = fresh.filter((p) => p.level === 'error');
  check(
    'geen importfouten',
    errors.length === 0,
    errors.map((e) => e.message).join(' | ')
  );

  const sizingWarnings = fresh.filter((p) =>
    p.message.includes('layoutSizing')
  );
  check(
    'geen ongeldige sizing',
    sizingWarnings.length === 0,
    sizingWarnings.length ? sizingWarnings[0].message : ''
  );

  const placementWarnings = fresh.filter((p) =>
    p.message.includes('plaatsing')
  );
  check(
    'geen mislukte plaatsingen',
    placementWarnings.length === 0,
    placementWarnings.length ? placementWarnings[0].message : ''
  );

  // Iconen erven in de browser currentColor; Figma maakt er zwart van als de
  // kleur niet expliciet wordt doorgezet.
  const black = [];
  const visit = (node, spec) => {
    if (spec?.type === 'VECTOR' && spec.fills?.length) {
      const vector = node.children?.[0];
      const paint = vector?.strokes?.[0] ?? vector?.fills?.[0];
      const expected = spec.fills[0].color;
      if (
        !paint ||
        paint.color.r !== expected.r ||
        paint.color.g !== expected.g ||
        paint.color.b !== expected.b
      ) {
        black.push(spec.name ?? 'icon');
      }
    }
    (spec?.children ?? []).forEach((childSpec, index) =>
      visit(node.children?.[index], childSpec)
    );
  };
  for (const [index, component] of payload.componentSet.components.entries()) {
    // Het component-wrapperframe zit één niveau boven de gebouwde boom.
    visit(
      state.page.children.at(-1)?.children[index]?.children[0],
      component.node
    );
  }
  check(
    'iconen dragen de tekstkleur',
    black.length === 0,
    black.length ? `${black.length} zwart gebleven` : ''
  );

  // Zonder gridColumnSizes houdt Figma zijn eigen standaard aan (alle tracks
  // FLEX) en worden alle kolommen even breed, ongeacht de CSS.
  const gridMismatch = [];
  const checkGrid = (node, spec) => {
    if (spec?.layoutMode === 'GRID') {
      const applied = node?.gridColumnSizes ?? [];
      if (
        applied.length !== spec.gridColumnSizes.length ||
        applied.some((track, i) => track.type !== spec.gridColumnSizes[i].type)
      ) {
        gridMismatch.push(spec.name ?? 'grid');
      }
    }
    (spec?.children ?? []).forEach((childSpec, index) =>
      checkGrid(node?.children?.[index], childSpec)
    );
  };
  for (const [index, component] of payload.componentSet.components.entries()) {
    checkGrid(
      state.page.children.at(-1)?.children[index]?.children[0],
      component.node
    );
  }
  check(
    'grid-tracks toegepast',
    gridMismatch.length === 0,
    gridMismatch.length ? `${gridMismatch.length} niet overgenomen` : ''
  );
}

console.log(
  `\n${process.exitCode ? '✗ smoke test gefaald' : '✓ smoke test geslaagd'}\n`
);
