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

const componentFiles = fs
  .readdirSync(path.join(monorepoRoot, 'packages/figma-sync/dist'))
  .filter((file) => file.endsWith('.json'));

// =============================================================================
// Volgorde: componenten zonder variables
// =============================================================================

// Dit moet vóór de variables-import, want daarna bestaan ze wel. Een component
// set die op vaste waarden binnenkomt ziet er goed uit maar volgt de
// theme-schakelaar niet; dat stil laten gebeuren is erger dan weigeren.
console.log('\n=== import zonder variables ===');
let refused = false;
try {
  await importComponentSet(
    read(`packages/figma-sync/dist/${componentFiles[0]}`),
    log
  );
} catch (error) {
  refused = /variables\.json/.test(error.message);
}
check('componenten importeren zonder variables wordt geweigerd', refused);

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

  // Het root-element is het component zelf, dus de gebouwde boom begint bij de
  // component-node en niet bij een frame daarbinnen.
  const built = (index) => state.page.children.at(-1)?.children[index];

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
    visit(built(index), component.node);
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
    checkGrid(built(index), component.node);
  }
  check(
    'grid-tracks toegepast',
    gridMismatch.length === 0,
    gridMismatch.length ? `${gridMismatch.length} niet overgenomen` : ''
  );

  // ---------------------------------------------------------------------------
  // Variable-bindingen
  // ---------------------------------------------------------------------------

  check(
    'alle verwachte bindingen gelegd',
    imported.bindings.bound === payload.bindings.bound,
    `${imported.bindings.bound}/${payload.bindings.bound}`
  );
  check(
    'geen mislukte bindingen',
    imported.bindings.failed === 0,
    `${imported.bindings.failed}`
  );
  check(
    'alle aangewezen variables bestaan',
    imported.bindings.missing.length === 0,
    imported.bindings.missing.join(', ')
  );

  // Het aantal alleen zegt niets over de vraag of de juiste variable op het
  // juiste veld terecht is gekomen. Daarom de spec en de gebouwde boom naast
  // elkaar aflopen en per veld de naam van de variable teruglezen.
  const wrongBindings = [];
  const checkBindings = (node, spec) => {
    for (const [field, reference] of Object.entries(
      spec?.boundVariables ?? {}
    )) {
      const alias =
        field === 'fills' || field === 'strokes'
          ? // Bij een icoon zit de kleur op de vectoren, niet op het frame.
            (spec.type === 'VECTOR'
              ? (node?.children?.[0]?.strokes?.[0] ??
                node?.children?.[0]?.fills?.[0])
              : node?.[field]?.[0]
            )?.boundVariables?.color
          : node?.boundVariables?.[field];

      const variable = alias && byId.get(alias.id);
      if (!variable || variable.name !== reference.name) {
        wrongBindings.push(
          `${spec.name ?? spec.type}.${field} -> ${variable ? variable.name : 'niets'} (verwacht ${reference.name})`
        );
      }
    }
    (spec?.children ?? []).forEach((childSpec, index) =>
      checkBindings(node?.children?.[index], childSpec)
    );
  };
  for (const [index, component] of payload.componentSet.components.entries()) {
    checkBindings(built(index), component.node);
  }
  check(
    'bindingen wijzen naar de juiste variable',
    wrongBindings.length === 0,
    wrongBindings.length
      ? `${wrongBindings.length}x, o.a. ${wrongBindings[0]}`
      : ''
  );

  // Zonder dit zou een spec zonder enkele binding hierboven groen zijn.
  check(
    'er is daadwerkelijk gebonden',
    imported.bindings.bound > 0,
    `${imported.bindings.bound} lagen`
  );

  // ---------------------------------------------------------------------------
  // Laagstructuur
  // ---------------------------------------------------------------------------

  // Het root-element hoort het component zélf te zijn. Een frame ertussen levert
  // een lege laag met dezelfde auto layout op, en dus onnodige nesting.
  const doubleWrapped = payload.componentSet.components.filter(
    (component, index) =>
      component.node.type === 'FRAME' &&
      built(index)?.children.length === 1 &&
      built(index)?.children[0].name === component.node.name
  );
  check(
    'geen extra wrapperframe rond de root',
    doubleWrapped.length === 0,
    doubleWrapped.length ? `${doubleWrapped.length} varianten` : ''
  );

  check(
    'de component set heet naar de CSS-klasse',
    payload.componentSet.name.startsWith('dsn-'),
    payload.componentSet.name
  );

  // Een laag die "icon" heet dwingt een designer het bestand open te trekken om
  // te zien wélk icoon het is.
  const unnamedIcons = [];
  const findIcons = (spec) => {
    if (spec?.type === 'VECTOR' && spec.name === 'icon')
      unnamedIcons.push(spec);
    (spec?.children ?? []).forEach(findIcons);
  };
  payload.componentSet.components.forEach((component) =>
    findIcons(component.node)
  );
  check(
    'iconen dragen hun eigen naam',
    unnamedIcons.length === 0,
    unnamedIcons.length ? `${unnamedIcons.length} zonder data-icon` : ''
  );
}

// =============================================================================
// Volgt een gebonden laag de theme-schakelaar?
// =============================================================================

// Dit is de hele reden dat er gebonden wordt. Zonder deze controle zou een
// import die netjes alles aan variables hangt die toevallig in elke mode
// dezelfde waarde hebben er net zo goed uitzien.
console.log('\n=== theme-schakelaar ===');

const collectionOf = (variable) =>
  state.collections.find((c) => c.id === variable.variableCollectionId);

/** Lost een variable op in een mode, door de aliasketen heen. */
const resolveInMode = (variable, modeName, depth = 0) => {
  if (!variable || depth > 10) return undefined;
  const collection = collectionOf(variable);
  // Een collection met één mode (dsn/Components) kent `start-light` niet; de
  // alias die daaruit vertrekt lost verderop wel per mode op.
  const mode =
    collection.modes.find((m) => m.name === modeName) ?? collection.modes[0];
  const value = variable.valuesByMode[mode.modeId];
  if (value && value.type === 'VARIABLE_ALIAS') {
    return resolveInMode(byId.get(value.id), modeName, depth + 1);
  }
  return value;
};

const buttonPayload = read('packages/figma-sync/dist/button.json');
const withFill = buttonPayload.componentSet.components.find(
  (component) => component.node.boundVariables?.fills
);
const fillReference = withFill?.node.boundVariables.fills;
const fillVariable = state.variables.find(
  (variable) =>
    variable.name === fillReference?.name &&
    collectionOf(variable).name === fillReference.collection
);

const inLight = resolveInMode(fillVariable, 'start-light');
const inDark = resolveInMode(fillVariable, 'start-dark');
const channels = (color) =>
  color ? ['r', 'g', 'b'].map((c) => color[c].toFixed(2)).join('/') : 'niets';

check(
  'de achtergrond van een gebonden Button verschilt per mode',
  Boolean(inLight) && JSON.stringify(inLight) !== JSON.stringify(inDark),
  `${fillReference?.name}: light ${channels(inLight)} vs dark ${channels(inDark)}`
);

console.log(
  `\n${process.exitCode ? '✗ smoke test gefaald' : '✓ smoke test geslaagd'}\n`
);
