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
  // Bestaat zodat de voortgangsmeldingen in de import hier ook echt langskomen
  // en een tikfout erin opvalt.
  progress: () => {},
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

/**
 * De naam van een component property uit zijn sleutel.
 *
 * Figma sleutelt `componentPropertyDefinitions` op `naam#nodeId:sessionId` en
 * zet de naam niet op de definitie. De plugin doet dit dus ook, en de test moet
 * langs dezelfde route lezen als wat hij controleert.
 */
function propertyNameOf(key) {
  const suffix = key.lastIndexOf('#');
  return suffix === -1 ? key : key.slice(0, suffix);
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
// De iconimport opent de iconpagina om te kunnen bouwen en hoort daarna terug
// te zetten wat de designer openhad.
const pageBeforeIcons = figma.currentPage;
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

// De iconimport opent zijn eigen pagina om te kunnen bouwen, maar hoort de
// designer niet te verslepen: bij afloop staat weer open wat er openstond.
check(
  'de iconimport laat de open pagina met rust',
  figma.currentPage === pageBeforeIcons,
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

  // Elk component wordt twee keer geïmporteerd, en alle controles hieronder
  // kijken naar het resultaat van de tweede. Een import die alleen op een leeg
  // bestand klopt is voor een library die al in gebruik is niets waard: de
  // tweede is de import die een designer in de praktijk draait.
  await importComponentSet(payload, log);

  const componentPage = state.root.children.find(
    (page) => page.name === payload.componentSet.page
  );
  const setsHere = () =>
    (componentPage?.children ?? []).filter(
      (node) =>
        node.type === 'COMPONENT_SET' && node.name === payload.componentSet.name
    );
  const firstSet = setsHere()[0];
  const idsAfterFirst = new Map(
    (firstSet?.children ?? []).map((variant) => [variant.name, variant.id])
  );

  const imported = await importComponentSet(payload, log);

  check(
    'alle varianten gebouwd',
    imported.variants === payload.componentSet.components.length,
    `${imported.variants}/${payload.componentSet.components.length}`
  );
  check('component set gecombineerd', imported.combined === true);

  // Elk component krijgt zijn eigen pagina. Zonder die scheiding groeit één
  // pagina met 73 component sets dicht en is er niets meer terug te vinden.
  check(
    'er staat precies één set met deze naam op zijn eigen pagina',
    setsHere().length === 1,
    `${setsHere().length}x op ${payload.componentSet.page}`
  );
  check(
    'de plugin meldt op welke pagina de set staat',
    imported.page === payload.componentSet.page,
    imported.page
  );

  const setNode = setsHere()[0];

  // De kern van het bijwerken: een variant die opnieuw wordt aangemaakt heeft
  // dezelfde naam maar een andere node-id, en dan laat elke geplaatste
  // instance los.
  check(
    'de tweede import werkt de varianten bij in plaats van ze te vervangen',
    imported.created === 0 &&
      imported.updated === payload.componentSet.components.length &&
      setNode?.id === firstSet?.id &&
      (setNode?.children ?? []).every(
        (variant) => idsAfterFirst.get(variant.name) === variant.id
      ),
    `${imported.updated} bijgewerkt, ${imported.created} nieuw`
  );

  // Het root-element is het component zelf, dus de gebouwde boom begint bij de
  // component-node en niet bij een frame daarbinnen. Uitzondering: een root die
  // in zijn geheel tot tekst of een vector inklapt kán zichzelf niet zijn, dus
  // daar zet de plugin wél een frame omheen en zit de spec een laag dieper.
  const built = (index) => {
    const variant = setNode?.children[index];
    const rootType = payload.componentSet.components[index].node.type;
    return rootType === 'FRAME' ? variant : variant?.children[0];
  };

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

  // Een hergebruikte variant moet leeggemaakt worden voordat hij opnieuw wordt
  // opgebouwd. Gebeurt dat niet, dan komen de nieuwe lagen bovenop de oude en
  // is dat structureel niet te zien: de oude lagen zijn identiek. Aan het
  // aantal wel.
  const extraLayers = [];
  const checkChildCount = (node, spec) => {
    // Een VECTOR wordt in Figma een instance met `Group > Shape` erin of een
    // ingebakken SVG; die kinderen staan niet in de spec.
    if (!spec || spec.type === 'VECTOR') return;
    if (node && node.children.length !== (spec.children ?? []).length) {
      extraLayers.push(
        `${spec.name ?? spec.type}: ${node.children.length} lagen i.p.v. ${(spec.children ?? []).length}`
      );
    }
    (spec.children ?? []).forEach((childSpec, index) =>
      checkChildCount(node?.children?.[index], childSpec)
    );
  };
  payload.componentSet.components.forEach((component, index) =>
    checkChildCount(built(index), component.node)
  );
  check(
    'geen lagen uit de vorige import blijven staan',
    extraLayers.length === 0,
    extraLayers.length ? `${extraLayers.length}x, o.a. ${extraLayers[0]}` : ''
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

  // Een FIXED as hoort de gemeten maat te houden. Figma rekent een auto-layout
  // frame op een HUG-as opnieuw uit, en dat gebeurt ná de resize in applyFrame:
  // zonder herstel bevriest FIXED niet de gemeten waarde maar wat Figma ervan
  // maakte. Zichtbaar geweest als een Checkbox van 20.08 breed in plaats van 24.
  const wrongSizes = [];
  const checkFixedSizes = (node, spec) => {
    if (spec?.layoutSizingHorizontal === 'FIXED' && spec.width) {
      if (Math.abs(node?.width - spec.width) > 0.5) {
        wrongSizes.push(
          `${spec.name}: breedte ${node?.width} i.p.v. ${spec.width}`
        );
      }
    }
    if (spec?.layoutSizingVertical === 'FIXED' && spec.height) {
      if (Math.abs(node?.height - spec.height) > 0.5) {
        wrongSizes.push(
          `${spec.name}: hoogte ${node?.height} i.p.v. ${spec.height}`
        );
      }
    }
    (spec?.children ?? []).forEach((childSpec, index) =>
      checkFixedSizes(node?.children?.[index], childSpec)
    );
  };
  payload.componentSet.components.forEach((component, index) =>
    checkFixedSizes(built(index), component.node)
  );
  check(
    'een FIXED as houdt de gemeten maat',
    wrongSizes.length === 0,
    wrongSizes.length ? `${wrongSizes.length}x, o.a. ${wrongSizes[0]}` : ''
  );

  // ---------------------------------------------------------------------------
  // Het canvas rond de set
  // ---------------------------------------------------------------------------

  const canvas = payload.componentSet.canvas;
  check(
    'de varianten staan onder elkaar met lucht ertussen',
    setNode?.layoutMode === 'VERTICAL' &&
      setNode?.itemSpacing === canvas.itemSpacing &&
      setNode?.paddingTop === canvas.padding &&
      setNode?.paddingLeft === canvas.padding,
    `${setNode?.layoutMode}, gap ${setNode?.itemSpacing}, padding ${setNode?.paddingTop}`
  );

  // Zonder gebonden achtergrond kijkt een designer in dark mode naar donkere
  // componenten op een lichte plaat, en is geen enkele variant meer te lezen.
  const canvasAlias = setNode?.fills?.[0]?.boundVariables?.color;
  const canvasVariable = canvasAlias && byId.get(canvasAlias.id);
  check(
    'de achtergrond hangt aan de documentachtergrond',
    canvasVariable?.name === canvas.boundVariables?.fills.name,
    canvasVariable ? canvasVariable.name : 'niet gebonden'
  );

  // ---------------------------------------------------------------------------
  // Component properties
  // ---------------------------------------------------------------------------

  const set = setNode;
  const definitions = set.componentPropertyDefinitions ?? {};
  const declaredHere = payload.componentSet.componentProperties ?? [];

  if (declaredHere.length) {
    const byName = new Map(
      Object.entries(definitions).map(([propertyId, definition]) => [
        propertyNameOf(propertyId),
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
// Paginavolgorde
// =============================================================================

console.log('\n=== paginavolgorde ===');

const managed = state.root.children
  .filter((page) => page.name.startsWith('dsn/'))
  .map((page) => page.name);
const alphabetical = [...managed].sort((a, b) => a.localeCompare(b, 'nl'));
check(
  'de dsn-paginas staan alfabetisch',
  managed.join('|') === alphabetical.join('|'),
  managed.join(', ')
);

// De pagina's van de designer horen te blijven staan waar ze stonden: een
// plugin die de hele lijst herschikt gooit een indeling om die met de hand is
// gemaakt.
check(
  'de eigen paginas van de designer blijven staan',
  state.root.children[0] === state.page,
  state.root.children[0].name
);

// =============================================================================
// Een tweede import van een component set
// =============================================================================

// Dit is waar het bij een library om draait. Een tweede import moet de
// bestaande set bijwerken, want elke instance in een designbestand hangt aan de
// node-id van zijn variant: een nieuwe variant met dezelfde naam is voor Figma
// een ánder component en laat elke instance los.
console.log('\n=== tweede import van een component set ===');

const rerunPayload = read('packages/figma-sync/dist/button.json');
const buttonPage = state.root.children.find(
  (page) => page.name === rerunPayload.componentSet.page
);
const setsOf = (page, name) =>
  page.children.filter(
    (node) => node.type === 'COMPONENT_SET' && node.name === name
  );

const setBefore = setsOf(buttonPage, rerunPayload.componentSet.name)[0];
const setIdBefore = setBefore.id;
const variantIdsBefore = new Map(
  setBefore.children.map((variant) => [variant.name, variant.id])
);
const propertyIdsBefore = Object.keys(
  setBefore.componentPropertyDefinitions ?? {}
).sort();

// Een geplaatste instance, zoals een designer die in een designbestand zet.
// Die moet de import overleven.
const placed = setBefore.children[0].createInstance();
state.page.appendChild(placed);
const placedOn = setBefore.children[0];

// Een variant die wel in Figma staat maar niet meer in de spec. Verwijderen
// zou elke instance ervan detachen, dus die hoort te blijven staan en gemeld te
// worden.
const ghost = figma.createComponent();
ghost.name = 'variant=ghost, size=small, state=default';
setBefore.appendChild(ghost);

const beforeRerunProblems = problems.length;
const editsBeforeRerun = state.propertyEdits;
const rerun = await importComponentSet(rerunPayload, log);
const rerunProblems = problems.slice(beforeRerunProblems);
const editsDuringRerun = state.propertyEdits - editsBeforeRerun;

check(
  'er komt geen tweede set naast de bestaande',
  setsOf(buttonPage, rerunPayload.componentSet.name).length === 1,
  `${setsOf(buttonPage, rerunPayload.componentSet.name).length} sets op ${buttonPage.name}`
);

const setAfter = setsOf(buttonPage, rerunPayload.componentSet.name)[0];
check(
  'de set zelf is dezelfde node',
  setAfter.id === setIdBefore,
  `${setAfter.id}`
);

check(
  'alle varianten uit de spec worden bijgewerkt, geen enkele nieuw aangemaakt',
  rerun.updated === rerunPayload.componentSet.components.length &&
    rerun.created === 0,
  `${rerun.updated} bijgewerkt, ${rerun.created} nieuw`
);

// Strenger dan alleen tellen: een variant die opnieuw aangemaakt wordt heeft
// dezelfde naam maar een andere node-id, en juist daar hangen de instances aan.
const changedIds = setAfter.children.filter(
  (variant) =>
    variantIdsBefore.has(variant.name) &&
    variantIdsBefore.get(variant.name) !== variant.id
);
check(
  'de varianten houden hun node-id',
  changedIds.length === 0,
  changedIds.length
    ? `${changedIds.length}x gewijzigd, o.a. ${changedIds[0].name}`
    : `${variantIdsBefore.size} varianten`
);

check(
  'een geplaatste instance blijft aan zijn component hangen',
  placed.mainComponent === placedOn && placedOn.parent === setAfter,
  placed.mainComponent === placedOn ? 'zelfde component' : 'losgeraakt'
);

// De inhoud wordt wél vervangen: het component blijft, zijn lagen niet. Zonder
// deze controle zou een import die de variant ongemoeid laat hier net zo groen
// zijn, en dan komt een CSS-wijziging nooit in Figma aan.
const rebuilt = setAfter.children.find(
  (variant) => variant.name === rerunPayload.componentSet.components[0].name
);
check(
  'de inhoud van een bijgewerkte variant is opnieuw opgebouwd',
  rebuilt.children.length > 0,
  `${rebuilt.children.length} lagen`
);

check(
  'een variant die niet meer in de spec staat blijft staan en wordt gemeld',
  ghost.parent === setAfter &&
    rerun.orphans.includes(ghost.name) &&
    rerunProblems.some(
      (problem) =>
        problem.level === 'warn' && problem.message.includes(ghost.name)
    ),
  ghost.parent === setAfter ? 'gemeld en behouden' : 'weggegooid'
);

// Een property opnieuw aanmaken levert een nieuwe property-id op, en Figma
// bewaart de waarde die een instance aan een property geeft onder díé id.
const propertyIdsAfter = Object.keys(
  setAfter.componentPropertyDefinitions ?? {}
).sort();
check(
  'de component properties houden hun id',
  propertyIdsAfter.join('|') === propertyIdsBefore.join('|'),
  `${propertyIdsAfter.length} properties`
);
check(
  'de properties zijn niet gedupliceerd',
  propertyIdsAfter.length ===
    (rerunPayload.componentSet.componentProperties ?? []).length,
  propertyIdsAfter.join(', ')
);

// Figma weigert een dubbele propertynaam niet maar hernoemt hem naar
// "label 2". Alleen op de id letten zou dat missen: dat is een ander id, en
// het aantal klopt zolang de oude er ook nog staat.
const namesAfter = propertyIdsAfter.map(propertyNameOf).sort();
const declaredNames = (rerunPayload.componentSet.componentProperties ?? [])
  .map((property) => property.name)
  .sort();
// Een import die niets aan een property verandert hoort er ook niets aan te
// schrijven. Figma duwt een opnieuw gezette INSTANCE_SWAP-default door naar
// elke gekoppelde geneste instance, en die swap wist de kleuroverride die de
// plugin op het icoon had gelegd: het icoon valt dan terug op de kleur van het
// icooncomponent zelf.
check(
  'een ongewijzigde property wordt niet opnieuw geschreven',
  editsDuringRerun === 0,
  `${editsDuringRerun} schrijfacties`
);

check(
  'de properties houden hun naam, zonder "2" erachter',
  namesAfter.join('|') === declaredNames.join('|'),
  namesAfter.join(', ')
);

// Een variant die in Figma ontbreekt maar wel in de spec staat hoort erbij te
// komen, anders mist een nieuwe maat of stand na een import.
const dropped = setAfter.children.find(
  (variant) => variant.name === rerunPayload.componentSet.components[1].name
);
const droppedName = dropped.name;
dropped.remove();

const added = await importComponentSet(rerunPayload, log);
const setWithAdded = setsOf(buttonPage, rerunPayload.componentSet.name)[0];
check(
  'een variant die nog niet in Figma staat wordt toegevoegd',
  added.created === 1 &&
    added.updated === rerunPayload.componentSet.components.length - 1 &&
    setWithAdded.children.some((variant) => variant.name === droppedName),
  `${added.created} nieuw, ${added.updated} bijgewerkt`
);

// Een toegevoegde variant hangt achteraan in de kinderlijst, dus zonder
// herordenen staat een teruggezette `state=hover` onderaan de plaat in plaats
// van bij zijn eigen maat. De varianten die niet meer in de spec staan horen
// juist wél achteraan.
const specOrder = rerunPayload.componentSet.components.map(
  (component) => component.name
);
check(
  'de varianten staan in de volgorde van de spec',
  setWithAdded.children
    .slice(0, specOrder.length)
    .every((variant, index) => variant.name === specOrder[index]),
  `positie van ${droppedName}: ${setWithAdded.children.findIndex((v) => v.name === droppedName)}, verwacht ${specOrder.indexOf(droppedName)}`
);
check(
  'een variant die niet meer in de spec staat schuift naar achteren',
  setWithAdded.children.at(-1) === ghost,
  setWithAdded.children.at(-1)?.name
);

// =============================================================================
// De kleurmeting
// =============================================================================

// `diagnoseColors` bestaat om in Figma vast te stellen wát er met de
// kleuroverride gebeurt, en niet om hier iets te bewijzen: de mock kan het
// mechanisme nog niet nadoen. Wat hier gecontroleerd wordt is dat de meting
// draait en de goede lagen te pakken heeft, zodat hij niet stilletjes stukgaat
// tussen twee sessies in Figma door.
console.log('\n=== kleurmeting ===');

const measured = await importComponentSet(rerunPayload, log, {
  diagnose: true,
});
const diagnosis = measured.diagnosis;

// Drie gebonden kleurlagen per variant: twee iconen en de tekst.
const expectedProbes = rerunPayload.componentSet.components.length * 3;
check(
  'de meting pakt elke gebonden kleurlaag, iconen én tekst',
  diagnosis?.probes === expectedProbes,
  `${diagnosis?.probes} lagen, verwacht ${expectedProbes}`
);

check(
  'op de variant draagt elke laag de kleur uit de spec',
  diagnosis?.before.variantWrong === 0 &&
    diagnosis.before.variantOk === expectedProbes,
  `${diagnosis?.before.variantOk} zoals gevraagd, ${diagnosis?.before.variantWrong} niet`
);

// Dit is issue #388, en het is de enige controle hier die op de plek kijkt waar
// het misging. De kleur op de variant klopte namelijk altijd al; in Figma was
// hij fout op een geplaatste instance, omdat de override op een geneste
// instance via het laagpad wordt teruggezocht en `resetVariant` dat pad elke
// import opnieuw opbouwde.
//
// Deze regel wordt rood zodra `resetVariant` de icoon-instances weer weggooit
// in plaats van ze te hergebruiken. Dat is precies wat de mock hiervoor niet
// kon zien.
check(
  'op een geplaatste instance draagt elke laag de kleur uit de spec',
  diagnosis?.placed > 0 && diagnosis.before.instanceWrong === 0,
  `${diagnosis?.placed} instances gemeten, ${diagnosis?.before.instanceWrong} lagen fout (${diagnosis?.before.iconInstanceWrong} icoon, ${diagnosis?.before.textInstanceWrong} tekst)`
);

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

// Hetzelfde voor het icoon. Dat het icoon de kleur uit de spec draagt is één
// ding; de reden dat die kleur aan een variable hangt is dat hij meebeweegt met
// de mode. Zonder deze controle zou een icoon dat netjes gebonden is aan een
// variable die in elke mode dezelfde waarde heeft er even goed uitzien.
const iconNode = withFill?.node.children.find(
  (child) => child.type === 'VECTOR' && child.boundVariables?.fills
);
const iconReference = iconNode?.boundVariables.fills;
const iconVariable = state.variables.find(
  (variable) =>
    variable.name === iconReference?.name &&
    collectionOf(variable).name === iconReference.collection
);

const iconLight = resolveInMode(iconVariable, 'start-light');
const iconDark = resolveInMode(iconVariable, 'start-dark');

check(
  'de icoonkleur van een gebonden Button verschilt per mode',
  Boolean(iconLight) && JSON.stringify(iconLight) !== JSON.stringify(iconDark),
  `${iconReference?.name}: light ${channels(iconLight)} vs dark ${channels(iconDark)}`
);

console.log(
  `\n${process.exitCode ? '✗ smoke test gefaald' : '✓ smoke test geslaagd'}\n`
);
