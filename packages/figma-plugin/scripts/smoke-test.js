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
const { importIconSet } = await import('../src/icons.js');

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

/**
 * De paint die de kleur van een icoon draagt.
 *
 * Niet `children[0]`: een icoon uit de iconset is een instance met `Group >
 * Shape` erin, terwijl een ingebakken icoon een frame met losse vectoren is.
 * De eerste laag mét een paint is in beide gevallen de laag die de kleur
 * bepaalt.
 */
function iconPaint(node) {
  if (!node) return undefined;
  const paint = node.fills?.[0] ?? node.strokes?.[0];
  if (paint) return paint;
  for (const child of node.children ?? []) {
    const found = iconPaint(child);
    if (found) return found;
  }
  return undefined;
}

const componentFiles = fs
  .readdirSync(path.join(monorepoRoot, 'packages/figma-sync/dist'))
  .filter((file) => file.endsWith('.json'))
  // icons.json heeft een eigen schema en een eigen sectie hieronder.
  .filter((file) => file !== 'icons.json');

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

let iconsRefused = false;
try {
  await importIconSet(read('packages/figma-sync/dist/icons.json'), log);
} catch (error) {
  iconsRefused = /variables\.json/.test(error.message);
}
check('iconen importeren zonder variables wordt geweigerd', iconsRefused);

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
// Volgorde: componenten zonder iconset
// =============================================================================

// Een instance swap property verwisselt het mainComponent van een instance.
// Zonder iconset zijn de icoonlagen ingebakken SVG's en is er niets te
// verwisselen. Dat moet gemeld worden, niet stil overgeslagen: stil overslaan
// is precies het handwerk dat na elke import opnieuw gedaan moet worden.
console.log('\n=== import zonder iconset ===');
const buttonSpec = read('packages/figma-sync/dist/button.json');
const declared = buttonSpec.componentSet.componentProperties ?? [];
check(
  'button.json declareert component properties',
  declared.length > 0,
  declared.map((property) => property.name).join(', ')
);

const beforeIconless = problems.length;
const iconless = await importComponentSet(buttonSpec, log);
const iconlessProblems = problems.slice(beforeIconless);

check(
  'de ingebakken iconen worden gemeld',
  iconlessProblems.some(
    (problem) => problem.level === 'warn' && /icons\.json/.test(problem.message)
  ),
  'waarschuwing over icons.json'
);
check(
  'instance swap properties worden gerapporteerd als niet gelegd',
  declared
    .filter((property) => property.type === 'INSTANCE_SWAP')
    .every((property) =>
      iconlessProblems.some(
        (problem) =>
          problem.level === 'error' && problem.message.includes(property.name)
      )
    ),
  'fout per instance swap'
);
check(
  'de properties die wél kunnen worden gewoon gelegd',
  iconless.properties.includes('label') &&
    iconless.properties.includes('showIconStart'),
  iconless.properties.join(', ')
);

// =============================================================================
// Iconen
// =============================================================================

// Vóór de componenten: straks zijn de iconen in een Button instances van deze
// componenten, en dan moeten ze er al staan.
console.log('\n=== icons.json ===');
const iconsPayload = read('packages/figma-sync/dist/icons.json');
const icons = await importIconSet(iconsPayload, log);

const iconsPage = state.root.children.find(
  (page) => page.name === iconsPayload.iconSet.page
);
check(
  'eigen pagina aangemaakt',
  Boolean(iconsPage),
  iconsPage ? iconsPage.name : 'ontbreekt'
);
check(
  'alle iconen als component',
  iconsPage &&
    iconsPage.children.filter((node) => node.type === 'COMPONENT').length ===
      iconsPayload.iconSet.icons.length,
  `${iconsPage?.children.length ?? 0}/${iconsPayload.iconSet.icons.length}`
);

// De component-import zet zijn set op figma.currentPage. Zou de iconimport de
// pagina omzetten, dan belandde een Button tussen de iconen.
check(
  'de iconimport laat de open pagina met rust',
  figma.currentPage === state.page,
  figma.currentPage.name
);

// De namen zijn het koppelstuk tussen code en Figma: een instance swap wijst
// straks een icoon aan op naam.
const registrySource = fs.readFileSync(
  path.join(
    monorepoRoot,
    'packages/components-react/src/Icon/icon-registry.generated.ts'
  ),
  'utf8'
);
const registryNames = [
  ...registrySource
    .match(/export type IconName =([\s\S]*?);/)[1]
    .matchAll(/'([^']+)'/g),
].map((match) => match[1]);
const figmaNames = (iconsPage?.children ?? []).map((node) => node.name);
check(
  'namen komen overeen met icon-registry.generated.ts',
  registryNames.length === figmaNames.length &&
    registryNames.every((name) => figmaNames.includes(name)),
  `${figmaNames.length} in Figma, ${registryNames.length} in de registry`
);

// Zonder wrapper: createNodeFromSvg levert een frame op, en dat frame hoort er
// niet tussen te blijven staan.
const wrapped = (iconsPage?.children ?? []).filter((component) =>
  component.children.some((child) => child.isSvg)
);
check(
  'geen wrapperframe rond de vectoren',
  wrapped.length === 0,
  wrapped.length ? `${wrapped.length} iconen` : ''
);

// Bouwrommel. `createNodeFromSvg` zet zijn frame op de huidige pagina en
// `outlineStroke()` kan dat ook doen; blijft daar iets van staan, dan is dat
// een half opgebouwd icoon dat op de pagina is achtergebleven.
const leftovers = (iconsPage?.children ?? []).filter(
  (node) => node.type !== 'COMPONENT'
);
check(
  'geen losse lagen op de iconpagina',
  leftovers.length === 0,
  leftovers.length
    ? `${leftovers.length}x, o.a. ${leftovers[0].type} "${leftovers[0].name}"`
    : ''
);

// Dit is de controle die de swap-bug had gevangen. Figma zoekt de overrides op
// een instance terug via het **laagpad**. Verschilt dat pad per icoon, dan
// landt de kleuroverride na een swap op een andere laag dan bedoeld: het glyph
// houdt de standaardkleur en een andere laag krijgt de kleur die voor het glyph
// bedoeld was. Dat is precies wat er gebeurde toen het aantal vectorlagen per
// icoon varieerde van 1 tot 4.
const shapes = [];
for (const component of iconsPage?.children ?? []) {
  const path = [];
  let node = component;
  while (node.children.length) {
    node = node.children[0];
    path.push(`${node.type}:${node.name}`);
  }
  const layers = (function count(current) {
    return current.children.reduce((total, child) => total + count(child), 1);
  })(component);
  shapes.push({ name: component.name, path: path.join(' > '), layers });
}
const wrongShape = shapes.filter(
  (icon) => icon.path !== 'GROUP:Group > VECTOR:Shape' || icon.layers !== 3
);
check(
  'elk icoon heeft dezelfde laagstructuur (Group > Shape)',
  wrongShape.length === 0,
  wrongShape.length
    ? `${wrongShape.length}x afwijkend, o.a. ${wrongShape[0].name}: ${wrongShape[0].path} (${wrongShape[0].layers} lagen)`
    : `${shapes.length} iconen`
);

// Een lijn-icoon en een vlak-icoon moeten hun kleur uit hetzelfde veld halen,
// anders komt een override op `fills` bij het ene icoon wel en bij het andere
// niet terecht.
const withStrokes = (iconsPage?.children ?? []).filter((component) => {
  const walk = (node) =>
    (Array.isArray(node.strokes) && node.strokes.length) ||
    node.children.some(walk);
  return walk(component);
});
check(
  'geen enkel icoon draagt zijn kleur nog op een stroke',
  withStrokes.length === 0,
  withStrokes.length
    ? `${withStrokes.length}x, o.a. ${withStrokes[0].name}`
    : 'alles is een vulling'
);

// Een icoon dat niet aan een variable hangt blijft zwart als het bestand naar
// dark schakelt.
check(
  'iconen aan een kleur-variable gebonden',
  icons.bindings.bound === iconsPayload.iconSet.icons.length,
  `${icons.bindings.bound}/${iconsPayload.iconSet.icons.length}`
);
check(
  'geen ontbrekende variables',
  icons.bindings.missing.length === 0,
  icons.bindings.missing.join(', ')
);

// Idempotent, en strenger dan bij de variables: de node-id moet gelijk blijven.
// Een nieuw component met dezelfde naam is voor Figma een ander component, en
// dan raakt elke geplaatste instance los.
const idsBefore = new Map(
  (iconsPage?.children ?? []).map((node) => [node.name, node.id])
);
const moved = iconsPage.children[0];
moved.x = 999;

const again = await importIconSet(iconsPayload, log);
check(
  'tweede import dupliceert niets',
  iconsPage.children.length === iconsPayload.iconSet.icons.length,
  `${iconsPage.children.length} componenten`
);
check(
  'tweede import werkt bij in plaats van te vervangen',
  again.updated === iconsPayload.iconSet.icons.length && again.created === 0,
  `${again.updated} bijgewerkt, ${again.created} nieuw`
);
check(
  'instances blijven aan hetzelfde component hangen',
  iconsPage.children.every((node) => idsBefore.get(node.name) === node.id),
  'node-ids ongewijzigd'
);
check(
  'een verplaatst icoon wordt niet teruggeduwd',
  moved.x === 999,
  `x=${moved.x}`
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
      const paint = iconPaint(node);
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
            (spec.type === 'VECTOR' ? iconPaint(node) : node?.[field]?.[0])
              ?.boundVariables?.color
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

  // Een HUG-frame rekent zijn maat opnieuw uit, dus een min-maat die niet
  // aankomt verdwijnt geruisloos: de button wordt dan lager dan zijn aanraakdoel.
  const missingMinimums = [];
  const checkMinimums = (node, spec) => {
    for (const field of ['minWidth', 'minHeight']) {
      if (spec?.[field] === undefined) continue;
      if (node?.[field] !== spec[field]) {
        missingMinimums.push(`${spec.name}.${field}=${spec[field]}`);
      }
    }
    (spec?.children ?? []).forEach((childSpec, index) =>
      checkMinimums(node?.children?.[index], childSpec)
    );
  };
  payload.componentSet.components.forEach((component, index) =>
    checkMinimums(built(index), component.node)
  );
  check(
    'minimum-maten toegepast',
    missingMinimums.length === 0,
    missingMinimums.length
      ? `${missingMinimums.length}x, o.a. ${missingMinimums[0]}`
      : ''
  );

  check(
    'de component set heet naar de CSS-klasse',
    payload.componentSet.name.startsWith('dsn-'),
    payload.componentSet.name
  );

  // ---------------------------------------------------------------------------
  // Component properties
  // ---------------------------------------------------------------------------

  const set = state.page.children.at(-1);
  const definitions = set.componentPropertyDefinitions ?? {};
  const declaredHere = payload.componentSet.componentProperties ?? [];

  if (declaredHere.length) {
    const byName = new Map(
      Object.entries(definitions).map(([propertyId, definition]) => [
        definition.name,
        { propertyId, ...definition },
      ])
    );

    const wrongType = declaredHere.filter(
      (property) => byName.get(property.name)?.type !== property.type
    );
    check(
      'alle gedeclareerde properties staan op de set',
      wrongType.length === 0,
      wrongType.length
        ? wrongType.map((property) => property.name).join(', ')
        : declaredHere.map((property) => property.name).join(', ')
    );

    // Een property op de set die in een variant geen laag heeft doet daar de
    // helft van de tijd niets, en dat zie je aan de set niet.
    const FIELD = {
      TEXT: 'characters',
      BOOLEAN: 'visible',
      INSTANCE_SWAP: 'mainComponent',
    };
    const unlinked = [];
    for (const property of declaredHere) {
      const definition = byName.get(property.name);
      if (!definition) continue;
      const linked = set.children.filter((variant) => {
        const find = (node) =>
          node.componentPropertyReferences?.[FIELD[property.type]] ===
          definition.propertyId
            ? node
            : node.children.map(find).find(Boolean);
        return find(variant);
      });
      if (linked.length !== set.children.length) {
        unlinked.push(
          `${property.name} in ${set.children.length - linked.length} varianten`
        );
      }
    }
    check(
      'elke property hangt in elke variant aan een laag',
      unlinked.length === 0,
      unlinked.join(', ')
    );

    // Een instance swap kan alleen op een instance. Was het icoon ingebakken,
    // dan is er niets te verwisselen.
    const swaps = declaredHere.filter(
      (property) => property.type === 'INSTANCE_SWAP'
    );
    if (swaps.length) {
      const notInstances = [];
      for (const variant of set.children) {
        const walk = (node) => {
          if (
            node.componentPropertyReferences?.mainComponent &&
            node.type !== 'INSTANCE'
          ) {
            notInstances.push(node.name);
          }
          node.children.forEach(walk);
        };
        walk(variant);
      }
      check(
        'de icoonlagen zijn instances van het icooncomponent',
        notInstances.length === 0,
        notInstances.length ? `${notInstances.length} ingebakken` : ''
      );
    }

    // De standaardstand van een boolean moet ook op de laag staan, anders toont
    // de set iets anders dan de property zegt.
    const booleans = declaredHere.filter(
      (property) => property.type === 'BOOLEAN'
    );
    const wrongDefault = [];
    for (const property of booleans) {
      const definition = byName.get(property.name);
      if (!definition) continue;
      for (const variant of set.children) {
        const walk = (node) => {
          if (
            node.componentPropertyReferences?.visible ===
              definition.propertyId &&
            node.visible !== definition.defaultValue
          ) {
            wrongDefault.push(`${property.name} in ${variant.name}`);
          }
          node.children.forEach(walk);
        };
        walk(variant);
      }
    }
    check(
      'de lagen staan op de standaardstand van hun boolean',
      wrongDefault.length === 0,
      wrongDefault.length ? wrongDefault[0] : ''
    );
  }

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
