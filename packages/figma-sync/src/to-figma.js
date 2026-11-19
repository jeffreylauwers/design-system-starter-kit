/**
 * Bouwt een complete component set-spec uit de gemeten varianten.
 *
 * Dit bestand regelt de volgorde per variant en stelt de JSON voor de plugin
 * samen; het eigenlijke omzetten staat in de modules ernaast:
 *
 * - `convert.js`: een gemeten DOM-boom, element voor element, naar een node
 *   spec
 * - `layout-from-css.js`: flexbox, grid en block layout naar auto layout
 * - `styles-from-css.js`: randen, hoekradius, tekststijl en rotatie
 * - `values.js`: pixels, afronden, kleuren en SVG-kleuren
 * - `post-process.js`: bewerkingen op de boom van een hele variant
 *
 * De kern van de vertaling is flexbox -> auto layout. Dat is de reden dat deze
 * route werkt waar CSS-parsing faalt: `display:flex` met gap, padding en
 * alignment bevat exact de informatie die Figma nodig heeft om een frame te
 * laten meeschalen in plaats van een dood, absoluut gepositioneerd blok.
 */

import { createBindingReport, dropUnfixedSizeBindings } from './bindings.js';
import { bindVariables, convertNode, withContentSlot } from './convert.js';
import { toInstance } from './instances.js';
import {
  checkSpreadClip,
  fillRootChildren,
  fixInstancesInHuggingParents,
  hugRootWidth,
  hugTracksOfSizedItems,
  mergeAdornments,
  pinAbsoluteSlots,
  placementOf,
  sizeFromTokens,
} from './post-process.js';
import { pageNameFor, SCHEMAS } from '../../figma-plugin/src/contract.js';

/** De naam van het slot op de root van een doelset, of `null`. */
function targetRootSlot(target) {
  const children = target.components?.[0]?.node?.children ?? [];
  return children.length === 1 && children[0].type === 'SLOT'
    ? children[0].name
    : null;
}

/**
 * Verzamelt de slots die daadwerkelijk in de gebouwde boom zitten.
 *
 * Een gedeclareerde property die nergens landt is de stille mislukking die dit
 * onderdeel juist moet uitsluiten, dus dat wordt hier al zichtbaar in plaats
 * van pas in Figma.
 */
function collectSlots(node, into = new Set()) {
  if (node.componentSlot) into.add(node.componentSlot);
  for (const child of node.children ?? []) collectSlots(child, into);
  return into;
}

/**
 * Controleert de gedeclareerde component properties tegen de gebouwde boom.
 *
 * Een property moet in **elke** variant een laag hebben. Figma definieert de
 * properties op de component set, en een variant zonder de bijbehorende laag
 * levert daar een property op die de helft van de tijd niets doet.
 */
function checkComponentProperties(declared, components, warnings) {
  if (!declared?.length) return [];

  const perVariant = components.map((component) => ({
    name: component.name,
    slots: collectSlots(component.node),
  }));

  return declared.filter((property) => {
    const missing = perVariant.filter(
      (variant) => !variant.slots.has(property.slot)
    );
    if (!missing.length) return true;

    // Een optionele property hoort maar bij een deel van de varianten: de
    // tekst van een TextInput bestaat alleen waar Show Value aan staat. Figma
    // koppelt hem aan de lagen die er zijn. Nergens een laag blijft een fout.
    if (property.optional && missing.length < perVariant.length) return true;

    warnings.push(
      missing.length === perVariant.length
        ? `component property "${property.name}" wijst naar slot "${property.slot}", en geen enkele variant rendert data-figma-slot="${property.slot}"`
        : `component property "${property.name}" mist slot "${property.slot}" in ${missing.length} van de ${perVariant.length} varianten (o.a. ${missing[0].name}); een property op de set moet in elke variant een laag hebben`
    );
    return false;
  });
}

// =============================================================================
// HET CANVAS ROND EEN COMPONENT SET
// =============================================================================

/**
 * De ruimte rond en tussen de varianten op het canvas.
 *
 * Bewust een vast getal en geen token: dit is de presentatie van de
 * bibliotheekpagina, geen eigenschap van het component. Een spacing-token
 * hieraan hangen zou betekenen dat de afstand tussen twee varianten meebeweegt
 * met een densitywissel, en dat zegt over het component niets.
 */
const CANVAS_SPACING = 48;

/**
 * De achtergrond van het canvas is de documentachtergrond van het design
 * system, gebonden aan zijn variable.
 *
 * Zonder dit staat de set op het grijs van Figma zelf. Dat is niet alleen
 * lelijk: schakelt een designer de `dsn/Primitives`-mode naar `start-dark`, dan
 * worden de componenten donker op een lichte plaat en is er geen enkele variant
 * meer te lezen. Gebonden aan de variable schakelt de plaat mee.
 *
 * Net als de kleur van de iconset is dit een gekozen standaard en geen gemeten
 * binding: er is geen element op het canvas om tegen af te zetten. De
 * verificatie uit DR-2026-06 geldt hier dus niet.
 */
const CANVAS_BACKGROUND = 'dsn-color-neutral-bg-document';

function canvasFor(variableIndex, report) {
  const canvas = { padding: CANVAS_SPACING, itemSpacing: CANVAS_SPACING };

  const variable = variableIndex?.lookup(CANVAS_BACKGROUND);
  if (!variable || variable.type !== 'COLOR' || !variable.value) return canvas;

  const { r, g, b, a = 1 } = variable.value;
  canvas.fills = [{ type: 'SOLID', color: { r, g, b }, opacity: a }];
  canvas.boundVariables = {
    fills: { collection: variable.collection, name: variable.name },
  };
  // Meetellen in hetzelfde rapport als de rest: de plugin legt deze binding via
  // dezelfde route, en de smoke test vergelijkt beide aantallen.
  report.bind(variable.collection);

  return canvas;
}

/**
 * Vat waarschuwingen samen die alleen in hun variant verschillen.
 *
 * Elke waarschuwing draagt het pad waar hij vandaan komt, en dat begint met de
 * variant: `TextInput[state=focus, width=md] > dsn-text-input: ...`. Ontdubbelen
 * op de hele tekst helpt dan niets, en TextInput leverde 21 keer dezelfde regel
 * over box-shadow op. Met acht formuliervelden verdrinkt daar een échte melding
 * in, en dan is een waarschuwing die niemand meer leest net zo goed geen
 * waarschuwing.
 *
 * De variant gaat er daarom af en het aantal komt erbij. Wat overblijft is per
 * knelpunt één regel, met de eerste variant erbij om het terug te vinden.
 */
function summariseWarnings(warnings) {
  const groups = new Map();

  for (const warning of warnings) {
    // `Component[as=waarde, as=waarde]` aan het begin; de rest is het knelpunt.
    const match = warning.match(/^([A-Za-z]+)\[([^\]]*)\](.*)$/s);
    if (!match) {
      groups.set(warning, { text: warning, variants: [] });
      continue;
    }

    const [, component, variant, rest] = match;
    const key = `${component}${rest}`;
    const existing = groups.get(key);
    if (existing) {
      existing.variants.push(variant);
      continue;
    }
    groups.set(key, { text: `${component}${rest}`, variants: [variant] });
  }

  return [...groups.values()].map(({ text, variants }) => {
    if (variants.length <= 1) {
      return variants.length ? `${text} (${variants[0]})` : text;
    }
    return `${text} — in ${variants.length} varianten, o.a. ${variants[0]}`;
  });
}

/**
 * De naam van de set zoals een designer hem in Figma ziet.
 *
 * Meestal de setnaam zelf. Een onderdeel dat alleen binnen zijn component
 * gebruikt wordt (het item van een lijst) is de uitzondering: dat draagt
 * `partOf`, en heet in Figma naar zijn BEM-element met `__` ervoor. Figma
 * publiceert een component waarvan de naam met `_` begint niet naar de
 * bibliotheek, dus afnemers zien alleen het hele component.
 *
 * `dsn-unordered-list__item` wordt zo `__item`. Op de pagina van de lijst is
 * dat genoeg; de setnaam blijft intern de sleutel, want `__item` komt op meer
 * pagina's voor.
 */
export function figmaNameFor(matrix, setName) {
  if (!matrix.partOf) return setName;
  const element = setName.split('__')[1];
  if (!element) {
    throw new Error(
      `${matrix.component}: partOf vraagt een setName met een BEM-element (dsn-blok__element), niet "${setName}"`
    );
  }
  return `__${element}`;
}

/**
 * Een `variantFromTag` moet een bestaande as aanwijzen, met alleen waarden die
 * op die as bestaan. Anders kiest een instance straks een variant die er niet
 * is, en dat valt pas op in de host.
 */
function checkVariantFromTag(matrix) {
  const { axis, tags } = matrix.variantFromTag;
  const values = matrix.axes?.[axis];
  if (!values) {
    throw new Error(
      `${matrix.component}: variantFromTag wijst naar de as "${axis}", maar die staat niet in axes`
    );
  }
  const unknown = Object.values(tags).filter(
    (value) => !values.includes(value)
  );
  if (unknown.length) {
    throw new Error(
      `${matrix.component}: variantFromTag noemt waarden die niet op de as "${axis}" staan: ${unknown.join(', ')}`
    );
  }
  return { axis, tags };
}

/**
 * De naam van de component set.
 *
 * De naam die een designer in Figma terugvindt is de CSS-klasse, niet de
 * matrixnaam: `dsn-button` is waar hij in de code op zoekt. Klapt de root om
 * welke reden dan ook niet naar een `dsn-`-element, dan blijft de matrixnaam
 * over.
 *
 * `setName` overschrijft dat. Nodig zodra de root meerdere blokklassen
 * draagt: HeadingGroup is `class="dsn-heading dsn-heading--2
 * dsn-heading-group"`, en de eerste klasse wint, dus zonder override zouden
 * Heading en HeadingGroup allebei `dsn-heading` heten. Twee sets met dezelfde
 * naam is voor een designer die op de klasse zoekt geen keuze maar een gok.
 *
 * De klasse komt uit de DOM en niet uit de laagnaam van de root: een root die
 * tot tekst inklapt (Heading, Paragraph) heet als laag "Tekst".
 */
export function setNameFor(matrix, extracted) {
  const rootClass = extracted[0]?.tree.classes?.[0];
  return (
    matrix.setName ??
    (rootClass?.startsWith('dsn-') ? rootClass : matrix.component)
  );
}

/**
 * Bouwt een complete Figma component set uit de geëxtraheerde varianten.
 *
 * @param {object} matrix de matrixdefinitie
 * @param {Array<{variant: object, tree: object}>} extracted
 * @param {Map<number, object>|object} [variableIndexes] een index per gemeten
 *   breedte, uit variable-index.js, of één index die voor elke variant geldt.
 *   Ontbreken ze, dan worden er geen variables gebonden en houdt alles zijn
 *   vaste waarde.
 */
export function toComponentSet(
  matrix,
  extracted,
  variableIndexes,
  { targets = new Map() } = {}
) {
  const warnings = [];
  const report = createBindingReport();

  // De blokken die als instance in aanmerking komen maar het (nog) niet
  // worden. Zie instances.js.
  const candidates = new Set();
  const resolveInstance = (block, converted, node, label) => {
    candidates.add(block);
    // Tot een matrix op instances staat blijft alles gemeten. Zo kan het
    // patroon per component aan, en is in Figma te bevestigen dat het werkt
    // voordat de hele bibliotheek omgaat.
    if (!matrix.instances) return converted;

    const target = targets.get(block);
    if (!target) {
      if (node.instance) {
        throw new Error(
          `${label}: data-figma-instance="${block}" wijst naar een set die niet bestaat. Bouw die matrix eerst, of controleer de naam.`
        );
      }
      warnings.push(
        `${label}: ${block} is een component uit de manifest maar heeft geen eigen set in Figma, dus het blijft een gemeten laag`
      );
      return converted;
    }

    // Een doelset met een slot op de root (ActionGroup) heeft in Figma een
    // laag `slot` tussen de root en zijn inhoud. De markup in de host heeft
    // die niet, dus de gemeten subboom krijgt eerst dezelfde vorm; anders
    // lijkt geen enkele variant op de meting.
    const rootSlot = targetRootSlot(target);
    let comparable =
      rootSlot && !converted.children?.some((child) => child.type === 'SLOT')
        ? withContentSlot(converted, rootSlot, true, label)
        : converted;

    // Een doelset die zijn veld en versiering tot één frame samenvoegt
    // (SearchInput) heeft die vorm ook als instance nodig. De plek in de host
    // blijft die van de wrapper: een zoekveld dat in de balk de ruimte vult,
    // vult die ook als instance.
    if (target.mergeAdornments) {
      const merged = mergeAdornments(
        comparable,
        node,
        warnings,
        label,
        target.absoluteAdornments
      );
      comparable = { ...merged, ...placementOf(comparable) };
    }

    return toInstance(comparable, node, target, label);
  };

  // Een index per gemeten breedte; zie `build-components.js`. Eén index blijft
  // werken, en dan geldt die voor elke variant.
  const indexes =
    variableIndexes instanceof Map
      ? variableIndexes
      : variableIndexes
        ? new Map([[null, variableIndexes]])
        : undefined;
  const defaultIndex = indexes ? [...indexes.values()][0] : undefined;

  const setName = setNameFor(matrix, extracted);

  const components = extracted.map(
    ({ variant, tree, wideTree, viewportWidth }) => {
      // De bindingen van deze variant gaan tegen de index van zijn eigen
      // breedte: een variant die op 1440 gemeten is hoort tegen de
      // `vp-large`-modes van `dsn/Density` geverifieerd te worden, niet
      // tegen de `vp-small`-modes.
      const index = indexes?.get(viewportWidth) ?? defaultIndex;
      const bindings = {
        index,
        report,
        instances: {
          own: new Set(tree.classes ?? []),
          resolve: resolveInstance,
        },
      };

      const axisLabel = Object.entries(variant)
        .map(([axis, value]) => `${axis}=${value}`)
        .join(', ');
      // Een matrix zonder assen levert één component op. Dat is in Figma geen
      // set maar een los component, en het heet naar het component zelf: bij
      // een onderdeel dus `__item`, anders publiceert Figma het toch.
      const label = axisLabel || figmaNameFor(matrix, setName);
      const pathLabel = axisLabel
        ? `${matrix.component}[${axisLabel}]`
        : matrix.component;
      let node = convertNode(tree, wideTree, warnings, pathLabel, bindings, {
        root: true,
      });

      // Een veld met een icoon of knop ernaast wordt één frame, zie
      // `mergeAdornments`.
      if (matrix.mergeAdornments) {
        node = mergeAdornments(
          node,
          tree,
          warnings,
          pathLabel,
          matrix.absoluteAdornments
        );
      }
      // Absolute lagen die aan een rand van hun ouder blijven hangen, zie
      // `pinAbsoluteSlots`.
      if (matrix.absoluteConstraints) {
        pinAbsoluteSlots(node, matrix.absoluteConstraints, pathLabel);
      }
      // Een blok dat in Figma met zijn eigen inhoud moet meegroeien, zie
      // `hugRootWidth`.
      if (matrix.hugRoot) {
        hugRootWidth(node, warnings, pathLabel);
      }
      // Kinderen die met de breedte van het component mee moeten rekken, zie
      // `fillRootChildren`.
      if (matrix.fillRootChildren) {
        fillRootChildren(node, warnings, pathLabel);
      }
      // Een component dat in zijn geheel tot tekst inklapt heeft geen ouder die
      // de binding voor hem kan leggen.
      if (node.type === 'TEXT') {
        node.boundVariables = bindVariables(node, tree.tokens, bindings);
      }
      hugTracksOfSizedItems(node);
      fixInstancesInHuggingParents(node);
      sizeFromTokens(node);
      dropUnfixedSizeBindings(node);
      checkSpreadClip(node, warnings, pathLabel);
      return { name: label, variantProperties: variant, node };
    }
  );

  // Wat er werkelijk in de boom staat. Het rapport telt tijdens het omzetten,
  // en `mergeAdornments` gooit daarna een laag weg (de wrapper) en laat een
  // padding-binding los. De plugin controleert zijn eigen aantal tegen dit
  // getal, dus het hoort over de opgeleverde boom te gaan.
  // De bindingen in de overrides van een instance tellen mee: de plugin legt
  // ze via dezelfde route.
  // Een binding op een schaduwveld zit in het effect zelf, niet op de laag.
  const ownBindings = (layer) =>
    Object.keys(layer.boundVariables ?? {}).length +
    (layer.effects ?? []).reduce(
      (total, effect) =>
        total + Object.keys(effect.boundVariables ?? {}).length,
      0
    );
  const countBindings = (node) =>
    ownBindings(node) +
    (node.overrides ?? []).reduce(
      (total, override) => total + ownBindings(override),
      0
    ) +
    (node.shapes ?? []).reduce(
      (total, shape) => total + ownBindings(shape),
      0
    ) +
    (node.children ?? []).reduce(
      (total, child) => total + countBindings(child),
      0
    );
  // Lagen die een effect style krijgen, op dezelfde manier verzameld. De
  // plugin legt ze aan het eind en telt ze na; ontbreekt een style in het
  // bestand, dan meldt hij dat.
  const styledLayers = [];
  const collectStyled = (node) => {
    if (node.effectStyle) styledLayers.push(node.effectStyle);
    for (const override of node.overrides ?? []) {
      if (override.effectStyle) styledLayers.push(override.effectStyle);
    }
    for (const child of node.children ?? []) collectStyled(child);
  };
  for (const component of components) collectStyled(component.node);

  // De sets waar deze set instances van bevat. Alleen wat er werkelijk in de
  // boom staat: de Checkbox in een CheckboxGroup zit binnen de
  // CheckboxOption-instance en is een afhankelijkheid van díe set, niet van de
  // groep. De volgorde klopt daarna vanzelf via de keten.
  const dependsOn = new Map();
  const collectTargets = (node) => {
    if (node.type === 'INSTANCE') {
      // Op pagina én naam: `__item` staat op meer pagina's.
      dependsOn.set(`${node.page}|${node.component}`, {
        name: node.component,
        page: node.page,
      });
      return;
    }
    for (const child of node.children ?? []) collectTargets(child);
  };
  for (const component of components) collectTargets(component.node);

  // Vóór report.summary(): de achtergrondbinding telt mee in hetzelfde rapport.
  const canvas = canvasFor(defaultIndex, report);

  return {
    $schema: SCHEMAS.components,
    generatedAt: new Date().toISOString(),
    componentSet: {
      // Eén pagina per component; de plugin maakt hem aan en zet de
      // `dsn/`-pagina's daarna alfabetisch. Een onderdeel met `partOf` (het
      // item van een lijst) staat op de pagina van het component waar het bij
      // hoort.
      page: pageNameFor(matrix.partOf ?? matrix.component),
      canvas,
      name: figmaNameFor(matrix, setName),
      // De sleutel waarop andere matrices deze set aanwijzen, als die afwijkt
      // van de naam in Figma.
      ...(figmaNameFor(matrix, setName) !== setName ? { key: setName } : {}),
      // De sets die er al moeten staan voordat deze geïmporteerd kan worden:
      // de doelen van zijn instances. De plugin weigert zonder.
      ...(dependsOn.size ? { dependsOn: [...dependsOn.values()] } : {}),
      variantAxes: matrix.axes ?? {},
      // Voor een instance van deze set in een andere: de host voegt het veld
      // en zijn versiering op dezelfde manier samen. Zie `mergeAdornments`.
      ...(matrix.mergeAdornments
        ? {
            mergeAdornments: true,
            ...(matrix.absoluteAdornments
              ? { absoluteAdornments: matrix.absoluteAdornments }
              : {}),
          }
        : {}),
      // Voor een instance van deze set in een andere: welke as uit de tag van
      // het element volgt. Zie `variantFromTag` in de README.
      ...(matrix.variantFromTag
        ? { variantFromTag: checkVariantFromTag(matrix) }
        : {}),
      componentProperties: checkComponentProperties(
        matrix.componentProperties,
        components,
        warnings
      ),
      components,
    },
    // Samengevat: dezelfde waarschuwing komt per variant terug, en dat zijn er
    // bij een grote set tientallen. De matrix mag er zelf ook een meegeven,
    // voor een beperking die de generator niet kán zien: `::marker` is geen
    // DOM-element, dus een lijst komt zonder bolletjes in Figma en niets in de
    // meting valt daarover op te merken.
    // Blokken die als instance in aanmerking komen maar het nog niet zijn,
    // omdat de matrix niet op `instances: true` staat.
    ...(!matrix.instances && candidates.size
      ? { instanceCandidates: [...candidates].sort() }
      : {}),
    warnings: [
      ...(matrix.warnings ?? []),
      ...summariseWarnings([...new Set(warnings)]),
    ],
    // Wat er aan variables gebonden is, en wat een vaste waarde hield.
    bindings: {
      ...report.summary(),
      bound:
        components.reduce(
          (total, component) => total + countBindings(component.node),
          0
        ) + countBindings(canvas),
      styled: styledLayers.length,
      effectStyles: [...new Set(styledLayers)].sort(),
      // Welke modes de verificatie gebruikt heeft. Bij een matrix met varianten
      // op verschillende viewports is dat er één set per gemeten breedte.
      modes:
        indexes && indexes.size > 1
          ? Object.fromEntries(
              [...indexes].map(([width, index]) => [width, index.modes])
            )
          : defaultIndex?.modes,
    },
  };
}
