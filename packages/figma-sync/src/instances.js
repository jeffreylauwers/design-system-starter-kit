/**
 * Geneste componenten worden instances in plaats van gemeten lagen.
 *
 * Een CheckboxOption bevat een Checkbox, een Alert een Heading en een
 * Paragraph. Zonder deze stap wordt elk van die subbomen opnieuw gemeten en
 * nagebouwd, en dan kunnen de twee stil uit elkaar lopen: bij Checkbox gebeurde
 * dat al met een overgetypt vinkje. Als instance volgt de laag zijn component,
 * en een wijziging aan Heading werkt overal door.
 *
 * Drie stappen, alle drie hier:
 *
 * 1. **Herkennen.** Een element waarvan een klasse precies een `cssBlock` uit
 *    `components-html/manifest.json` is, ís dat component. Dat is geen raden op
 *    klassenaam: `dsn-checkbox__control` is een BEM-element en geen blok, en
 *    matcht dus niet. Wat in de klassen niet te zien is (de Heading in een
 *    HeadingGroup is de root zelf, niet een kind) wijst de matrix aan met
 *    `data-figma-instance`.
 * 2. **De variant kiezen.** Uit de klassen is die niet altijd af te lezen: of
 *    een Checkbox aangevinkt is zit in het `<input>`, en hover is een
 *    pseudo-toestand. De subboom wordt daarom gewoon gemeten en vergeleken met
 *    elke variant van de doelset; de variant met de minste verschillen wint.
 *    Is dat niet eenduidig, dan stopt de build en wijst de matrix hem aan met
 *    `data-figma-variant`.
 * 3. **Overrides.** Wat na die keuze nog verschilt gaat als override mee: de
 *    kop in een Alert heeft een andere kleur dan een losse Heading. De
 *    bindingen in die overrides zijn tijdens het meten al geverifieerd (zie
 *    DR-2026-06), dus een override kan geen verkeerde binding leggen.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MANIFEST = path.resolve(
  __dirname,
  '..',
  '..',
  'components-html',
  'manifest.json'
);

/**
 * Blokken die nooit een instance worden.
 *
 * De layoutcomponenten tekenen niets en hebben bewust geen set (zie "Welke
 * componenten wel en niet een matrix krijgen" in de README). Behalve een
 * layoutcomponent dat toch een matrix heeft: ActionGroup, waarvan de knoppen
 * in een slot staan. Dat is dan een set, en dus een instance. `dsn-icon` heeft
 * zijn eigen route: een `<svg>` wordt een instance van de iconset via
 * `data-icon`.
 */
const SKIPPED_CATEGORIES = new Set(['layout']);
const SKIPPED_BLOCKS = new Set(['dsn-icon', 'dsn-body']);

const MATRICES = path.resolve(__dirname, 'matrices');

/** Heeft dit blok een eigen matrix, en dus een set in Figma? */
const hasMatrix = (block) =>
  fs.existsSync(path.join(MATRICES, `${block.replace(/^dsn-/, '')}.js`));

/** De opt-out in de markup: `data-figma-instance="none"`. */
const OPT_OUT = 'none';

let manifestBlocks;

/** Alle `cssBlock`s uit de manifest die een instance kunnen worden. */
export function instanceBlocks() {
  if (!manifestBlocks) {
    const { components } = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
    manifestBlocks = new Set(
      components
        .filter(
          (component) =>
            !SKIPPED_CATEGORIES.has(component.category) ||
            (component.cssBlock && hasMatrix(component.cssBlock))
        )
        .map((component) => component.cssBlock)
        .filter((block) => block && !SKIPPED_BLOCKS.has(block))
    );
  }
  return manifestBlocks;
}

/**
 * Welk component dit element ís, of `null`.
 *
 * `ownBlocks` zijn de blokken van de root van de matrix. Een HeadingGroup-root
 * draagt `dsn-heading` én `dsn-heading-group`; een kind met `dsn-heading` zou
 * daar een tweede kop zijn, maar de root zelf is geen instance van zichzelf.
 */
export function blockOf(node, ownBlocks) {
  if (node.instance === OPT_OUT) return null;
  if (node.instance) return node.instance;
  if (node.kind) return null;

  const blocks = instanceBlocks();
  return (
    (node.classes ?? []).find(
      (name) => blocks.has(name) && !ownBlocks.has(name)
    ) ?? null
  );
}

/**
 * Alle blokken die in een gemeten boom als instance in aanmerking komen, ook
 * die van matrices die (nog) niet op instances staan. De build print die, zodat
 * zichtbaar is waar het patroon nog niet geldt.
 */
export function findCandidates(tree) {
  const own = new Set(tree.classes ?? []);
  const found = new Set();
  const walk = (node, isRoot) => {
    if (!isRoot) {
      const block = blockOf(node, own);
      if (block) found.add(block);
    }
    for (const child of node.children ?? []) walk(child, false);
  };
  walk(tree, true);
  return found;
}

// =============================================================================
// VERGELIJKEN
// =============================================================================

/**
 * De velden die een override kunnen worden.
 *
 * Bewust zonder maat en plaatsing: die horen op de instance zelf en komen uit
 * de host (een Heading die in een Alert de cel vult). Ook zonder de auto-layout
 * stand: een ander `layoutMode` is een andere opbouw, en dat is geen override
 * maar een ander component.
 */
const OVERRIDE_FIELDS = [
  'characters',
  'fills',
  'strokes',
  'strokeWeight',
  'strokeWeights',
  'dashPattern',
  'cornerRadius',
  'topLeftRadius',
  'topRightRadius',
  'bottomRightRadius',
  'bottomLeftRadius',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'itemSpacing',
  'opacity',
  'fontFamily',
  'fontSize',
  'fontWeight',
  'italic',
  'lineHeight',
  'letterSpacing',
  'textCase',
  'textDecoration',
  'textAlignHorizontal',
];

/**
 * Sizing hoort bij de plek in de host, niet bij het component. Een label dat in
 * een losse CheckboxOption hugt, vult in een CheckboxGroup de breedte; dat is
 * dezelfde CheckboxOption op een andere plek, en dus een override en geen
 * andere opbouw.
 */
const SIZING_FIELDS = ['layoutSizingHorizontal', 'layoutSizingVertical'];

/** De overrides van een instance zonder hun sizing, om op opbouw te vergelijken. */
function withoutSizing(overrides) {
  return (overrides ?? [])
    .map((override) => {
      const rest = { ...override };
      for (const field of SIZING_FIELDS) delete rest[field];
      return rest;
    })
    .filter((override) => Object.keys(override).length > 1);
}

/** Tekstinhoud telt niet mee voor de keuze van een variant, wel als override. */
const CONTENT_FIELDS = new Set(['characters']);

/** Getallen op vier decimalen, zodat 0.1 + 0.2 niet als verschil telt. */
function normalised(value) {
  return JSON.stringify(value, (_key, item) =>
    typeof item === 'number' ? Math.round(item * 10000) / 10000 : item
  );
}

function same(a, b) {
  return normalised(a) === normalised(b);
}

function sameReference(a, b) {
  return (
    (a?.collection ?? null) === (b?.collection ?? null) &&
    (a?.name ?? null) === (b?.name ?? null)
  );
}

/**
 * Een opbouw die niet als override uit te drukken is: een ander aantal lagen,
 * een ander type laag, of een ander icoon. Figma zoekt overrides terug via het
 * laagpad, dus zodra dat pad verschilt is er niets om op te leggen.
 */
function structuralDifference(measured, target, label) {
  if (measured.type !== target.type) {
    return `${label}: ${measured.type} tegenover ${target.type}`;
  }
  if (measured.type === 'VECTOR' && measured.name !== target.name) {
    return `${label}: icoon ${measured.name} tegenover ${target.name}`;
  }
  if (measured.type === 'INSTANCE') {
    if (
      measured.component !== target.component ||
      measured.variant !== target.variant
    ) {
      return `${label}: instance van ${measured.component} (${measured.variant}) tegenover ${target.component} (${target.variant})`;
    }
    if (
      !same(withoutSizing(measured.overrides), withoutSizing(target.overrides))
    ) {
      return `${label}: geneste instance met andere overrides`;
    }
    return null;
  }
  if ((measured.layoutMode ?? 'NONE') !== (target.layoutMode ?? 'NONE')) {
    return `${label}: layout ${measured.layoutMode} tegenover ${target.layoutMode}`;
  }
  const a = measured.children ?? [];
  const b = target.children ?? [];
  if (a.length !== b.length) {
    return `${label}: ${a.length} lagen tegenover ${b.length}`;
  }
  for (const [index, child] of a.entries()) {
    const difference = structuralDifference(
      child,
      b[index],
      `${label} > ${index}`
    );
    if (difference) return difference;
  }
  return null;
}

/**
 * De verschillen tussen een gemeten subboom en een variant van de doelset, per
 * laag.
 *
 * `path` volgt de lagen zoals ze in Figma staan. Een component dat tot één
 * tekstlaag inklapt (Heading, Paragraph) krijgt in de plugin een frame om zich
 * heen, en dan zit die tekst op `[0]` binnen de instance en niet op de
 * instance zelf. `rootPath` geeft dat verschil mee.
 */
function collectDifferences(
  measured,
  target,
  nodePath,
  into,
  tally = { values: 0, tokens: 0 }
) {
  const fields = {};
  const bindings = {};
  const unbind = [];

  for (const field of OVERRIDE_FIELDS) {
    if (!(field in measured) && !(field in target)) continue;
    if (same(measured[field], target[field])) continue;
    if (measured[field] === undefined) {
      // Een rand die het component wel heeft en de host niet: dat is een
      // lege lijst, geen ontbrekend veld.
      if (field === 'strokes' || field === 'fills') fields[field] = [];
      continue;
    }
    fields[field] = measured[field];
    if (!CONTENT_FIELDS.has(field)) tally.values += 1;
  }

  // Een binding hoort bij zijn veld: dezelfde waarde aan een ander token is
  // net zo goed een verschil, want in een andere mode lopen ze uiteen.
  const bound = new Set([
    ...Object.keys(measured.boundVariables ?? {}),
    ...Object.keys(target.boundVariables ?? {}),
  ]);
  for (const field of bound) {
    const mine = measured.boundVariables?.[field];
    const theirs = target.boundVariables?.[field];
    if (sameReference(mine, theirs) && !(field in fields)) continue;
    if (mine) {
      bindings[field] = mine;
      if (!(field in fields) && measured[field] !== undefined) {
        fields[field] = measured[field];
        tally.tokens += 1;
      }
    } else if (theirs && field in fields) {
      // De host zet hier een vaste waarde neer waar het component een token
      // heeft. Zonder losmaken wint de binding van het component.
      unbind.push(field);
    }
  }

  if (
    Object.keys(fields).length ||
    Object.keys(bindings).length ||
    unbind.length
  ) {
    into.push({
      path: nodePath,
      ...fields,
      ...(Object.keys(bindings).length ? { boundVariables: bindings } : {}),
      ...(unbind.length ? { unbind } : {}),
    });
  }

  // Een geneste instance draagt zijn eigen overrides. Op de sizing na zijn die
  // al gelijk bevonden (zie `structuralDifference`); wat aan sizing verschilt
  // gaat als override op de laag binnen die instance, met het pad erdoorheen.
  if (measured.type === 'INSTANCE') {
    collectSizingDifferences(measured, target, nodePath, into);
    return into;
  }

  (measured.children ?? []).forEach((child, index) =>
    collectDifferences(
      child,
      target.children[index],
      [...nodePath, index],
      into,
      tally
    )
  );
  return into;
}

/**
 * De sizing die bij een geneste instance anders is dan in de doelset: op de
 * instance zelf, en op de lagen die zijn eigen overrides aanwijzen.
 */
function collectSizingDifferences(measured, target, nodePath, into) {
  const push = (path, fields) => {
    if (!Object.keys(fields).length) return;
    const existing = into.find((override) => same(override.path, path));
    if (existing) Object.assign(existing, fields);
    else into.push({ path, ...fields });
  };

  const own = {};
  for (const field of SIZING_FIELDS) {
    if (measured[field] !== undefined && measured[field] !== target[field]) {
      own[field] = measured[field];
    }
  }
  push(nodePath, own);

  // Per laag binnen de instance: wat de host daar zet tegenover wat de
  // doelset er zet. Ontbreekt het aan één kant, dan is dat de standaard van
  // het component zelf, en voor een laag in auto layout is dat HUG.
  const paths = new Map();
  for (const override of [
    ...(measured.overrides ?? []),
    ...(target.overrides ?? []),
  ]) {
    paths.set(JSON.stringify(override.path), override.path);
  }
  for (const [key, path] of paths) {
    const mine = (measured.overrides ?? []).find(
      (override) => JSON.stringify(override.path) === key
    );
    const theirs = (target.overrides ?? []).find(
      (override) => JSON.stringify(override.path) === key
    );
    const fields = {};
    for (const field of SIZING_FIELDS) {
      const wanted = mine?.[field] ?? (theirs?.[field] ? 'HUG' : undefined);
      if (wanted !== undefined && wanted !== theirs?.[field]) {
        fields[field] = wanted;
      }
    }
    push([...nodePath, ...path], fields);
  }
}

/**
 * Hoe ver een variant van de meting af zit.
 *
 * Een andere waarde telt zwaarder dan dezelfde waarde aan een ander token. Een
 * kop met eigen tokens die op de maat van `heading-4` uitkomen zou anders even
 * ver van elke Heading-variant af zitten, en dan is er niets te kiezen. Het
 * token gaat wel als override mee, zodat de laag aan het token van de host
 * blijft hangen.
 */
function score({ values, tokens }) {
  return values + tokens / 1000;
}

/** `appearance=heading-3, size=small` -> `{ appearance: 'heading-3', size: 'small' }`. */
function parseVariant(text) {
  return Object.fromEntries(
    text.split(',').map((part) => {
      const [key, ...value] = part.split('=');
      return [key.trim(), value.join('=').trim()];
    })
  );
}

function matchesVariant(component, wanted) {
  return Object.entries(wanted).every(
    ([axis, value]) => component.variantProperties?.[axis] === value
  );
}

/**
 * Kiest de variant van de doelset die bij de gemeten subboom hoort.
 *
 * @returns {{ component: object, overrides: object[] }}
 */
function chooseVariant(measured, target, explicit, label) {
  const rootPath = target.wrapped ? [0] : [];
  const candidates = explicit
    ? target.components.filter((component) =>
        matchesVariant(component, parseVariant(explicit))
      )
    : target.components;

  if (!candidates.length) {
    throw new Error(
      `${label}: data-figma-variant="${explicit}" bestaat niet in ${target.name}. Bekende varianten: ${target.components
        .slice(0, 5)
        .map((component) => component.name)
        .join(' | ')}`
    );
  }

  const scored = [];
  const rejected = [];
  for (const component of candidates) {
    const difference = structuralDifference(measured, component.node, label);
    if (difference) {
      rejected.push(`${component.name}: ${difference}`);
      continue;
    }
    const tally = { values: 0, tokens: 0 };
    const overrides = collectDifferences(
      measured,
      component.node,
      rootPath,
      [],
      tally
    );
    scored.push({ component, overrides, score: score(tally) });
  }

  if (!scored.length) {
    // De variant waar de opbouw het diepst overeenkomt zit er het dichtst bij;
    // die reden zegt het meest over wat er mis is.
    const depth = (reason) => reason.split(' > ').length;
    const closest = [...rejected].sort((a, b) => depth(b) - depth(a))[0];
    throw new Error(
      `${label} is een ${target.name}, maar heeft een andere opbouw dan elke variant van die set, dus er is niets om een override op te leggen. Het dichtst bij: ${closest}. Zet data-figma-instance="none" als dit bewust een eigen laag is.`
    );
  }

  scored.sort((a, b) => a.score - b.score);
  const [best, next] = scored;

  // Twee varianten die even dichtbij zitten maar wel verschillen: dan is de
  // keuze een gok, en een gok hoort niet stil in een library te belanden.
  if (
    !explicit &&
    next &&
    next.score === best.score &&
    best.score > 0 &&
    !same(best.component.node, next.component.node)
  ) {
    throw new Error(
      `${label}: twee varianten van ${target.name} passen even goed (${best.component.name} en ${next.component.name}, elk ${best.score} verschillen). Wijs hem aan met data-figma-variant.`
    );
  }

  return best;
}

/** De velden die over de plek van de instance in de host gaan. */
const PLACEMENT_FIELDS = [
  'x',
  'y',
  'width',
  'height',
  'layoutPositioning',
  'gridColumnAnchorIndex',
  'gridRowAnchorIndex',
  'gridColumnSpan',
  'gridRowSpan',
  'layoutAlign',
  'rotation',
];

/**
 * Zet een gemeten subboom om naar een instance van zijn component.
 *
 * @param {object} measured de gemeten spec van de subboom, mét zijn plaatsing
 *   in de host
 * @param {object} node de gemeten DOM-node, voor `data-figma-variant`
 * @param {object} target de doelset: `{ name, page, components, wrapped,
 *   exposed }`
 */
export function toInstance(measured, node, target, label) {
  const { component, overrides } = chooseVariant(
    measured,
    target,
    node.instanceVariant,
    label
  );

  const instance = {
    type: 'INSTANCE',
    name: target.name,
    component: target.name,
    page: target.page,
    variant: component.name,
  };
  for (const field of PLACEMENT_FIELDS) {
    if (measured[field] !== undefined) instance[field] = measured[field];
  }

  // De sizing van de instance komt uit de host. Een component dat tot tekst
  // inklapt heeft er zelf geen (een tekstlaag hugt), en staat in de host dan
  // op de breedte die de tekst daar kreeg.
  instance.layoutSizingHorizontal = measured.layoutSizingHorizontal ?? 'HUG';

  // Een vaste breedte die gelijk is aan de natuurlijke breedte van het
  // component zegt niets over de host: dan hugt de instance, net als het
  // component zelf. Zonder dit stond een Button in de footer van een
  // ModalDialog op een vaste 129px, gemeten mét de chevrons die in Figma via
  // `showIconStart` en `showIconEnd` uit staan, en was hij daar dus te breed.
  if (
    instance.layoutSizingHorizontal === 'FIXED' &&
    component.node.layoutSizingHorizontal === 'HUG' &&
    Math.abs((measured.width ?? 0) - (component.node.width ?? -1)) < 0.5
  ) {
    instance.layoutSizingHorizontal = 'HUG';
  }
  instance.layoutSizingVertical = target.wrapped
    ? 'HUG'
    : (measured.layoutSizingVertical ?? 'HUG');

  // De tekst binnen zo'n instance moet meerekken, anders breekt hij niet af
  // als de instance in de host de breedte vult. Dat is een override op de
  // geneste laag, en een van de dingen die in Figma zelf te bevestigen zijn.
  if (target.wrapped && instance.layoutSizingHorizontal === 'FILL') {
    const existing = overrides.find((override) => override.path.length === 1);
    if (existing) existing.layoutSizingHorizontal = 'FILL';
    else overrides.push({ path: [0], layoutSizingHorizontal: 'FILL' });
  }

  if (overrides.length) instance.overrides = overrides;
  // Een instance van een component met eigen properties wordt "exposed": dan
  // staan de label en de opties van de Heading gewoon in het paneel van de
  // HeadingGroup, zonder dat de host ze opnieuw hoeft te declareren.
  if (target.exposed) instance.exposed = true;
  if (measured.componentSlot) instance.componentSlot = measured.componentSlot;

  return instance;
}

// =============================================================================
// VOLGORDE
// =============================================================================

/**
 * Zet de matrices op een volgorde waarin elke doelset vóór zijn samenstelling
 * komt.
 *
 * @param {string[]} keys
 * @param {(key: string) => string[]} dependenciesOf de matrixsleutels waar een
 *   matrix van afhangt
 */
export function dependencyOrder(keys, dependenciesOf) {
  const ordered = [];
  const state = new Map();

  const visit = (key, trail) => {
    if (state.get(key) === 'done') return;
    if (state.get(key) === 'busy') {
      throw new Error(
        `Een kringverwijzing tussen componenten: ${[...trail, key].join(' -> ')}`
      );
    }
    state.set(key, 'busy');
    for (const dependency of dependenciesOf(key)) {
      if (keys.includes(dependency)) visit(dependency, [...trail, key]);
    }
    state.set(key, 'done');
    ordered.push(key);
  };

  for (const key of keys) visit(key, []);
  return ordered;
}
