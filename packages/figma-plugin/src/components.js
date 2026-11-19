/**
 * Importeert een volledige component set: nieuw of bijgewerkt.
 *
 * Dit bestand regelt alleen de volgorde; het werk zit in de modules ernaast:
 *
 * - `fonts.js`: welke fonts nodig zijn, en ze laden
 * - `reuse.js`: een bestaande variant terugzetten zonder zijn lagen te verliezen
 * - `build.js`: de lagen van een variant bouwen uit de spec
 * - `layout.js`: stijl, auto layout, plaatsing en sizing van één laag
 * - `properties.js`: component properties, en bestaande varianten terugvinden
 * - `canvas.js`: de plaat waar de varianten op staan
 * - `finalize.js`: wat pas aan het eind kan (pinnen, effect styles, kleuren)
 * - `nodes.js`: kleine bewerkingen op een node die overal nodig zijn
 *
 * De volgorde waarin Figma-eigenschappen gezet worden is niet vrij:
 * - `layoutSizing*` op HUG kan pas als de node zelf een layoutMode heeft
 * - `layoutSizing*` op FILL kan pas als de node in een auto-layout ouder hangt
 * - een tekstnode accepteert pas karakters als het font geladen is
 *
 * Vandaar: node maken, aan de ouder hangen, stijl zetten, layoutMode zetten,
 * kinderen bouwen, en pas als laatste de eigen sizing.
 *
 * De bindingen aan variables komen daar nog achteraan: een `paddingTop` valt
 * pas te binden als de node auto layout heeft, en een paint pas als hij er is.
 */

import {
  createStats,
  loadVariableIndex,
  requireCollections,
} from './bindings.js';
import {
  applyFrame,
  buildNode,
  buildSvgComponent,
  dropStaleContentSlots,
} from './build.js';
import {
  applyCanvas,
  findOrCreateCanvasFrame,
  placeBesideOthers,
} from './canvas.js';
import { assertSchema, rootShapeOf } from './contract.js';
import { diagnoseColors } from './diagnose.js';
import {
  applyEffectStyles,
  pinAbsolute,
  recolorIcons,
  reportBindings,
  verifyIconColors,
} from './finalize.js';
import { collectFonts, loadFonts } from './fonts.js';
import { loadIconIndex } from './icons.js';
import { resolveInstanceTargets } from './instances.js';
import { applySizing } from './layout.js';
import { findOrCreatePage, openPage, sortManagedPages } from './pages.js';
import {
  applyComponentProperties,
  axesOf,
  variantFinder,
} from './properties.js';
import { dropUnusedIcons, resetVariant } from './reuse.js';

/**
 * Geeft de sandbox even lucht zodat een voortgangsmelding de UI kan bereiken.
 *
 * Een verse import heeft in de variantlus geen enkel await-punt: alles wordt
 * dan pas bezorgd als de hele set al klaar is, en dan staat de indicator de
 * hele tijd stil op de eerste variant. Bij een tweede import is er wél een
 * await, maar daarop leunen zou betekenen dat de voortgang alleen werkt in het
 * geval waar je hem het minst nodig hebt.
 */
const YIELD_EVERY = 8;
const yieldToUi = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Importeert een volledige component set: nieuw of bijgewerkt.
 *
 * Staat er al een set met deze naam op de pagina, dan wordt die bijgewerkt.
 * Elke geplaatste instance hangt aan de node-id van zijn variant, dus een
 * variant die opnieuw wordt aangemaakt laat elke instance los; zie
 * `resetVariant`.
 *
 * @param {object} payload de inhoud van een {component}.json
 * @param {object} log verzamelaar met .info/.warn/.error
 * @param {object} [options] `{ diagnose }`; zie `diagnoseColors`
 */
export async function importComponentSet(payload, log, options = {}) {
  assertSchema(payload, 'components');

  const spec = payload.componentSet;

  // Alle fonts van alle varianten in één keer laden.
  log.progress?.(`${spec.name}: fonts laden`);
  const fonts = new Map();
  for (const component of spec.components) collectFonts(component.node, fonts);
  const loaded = await loadFonts(fonts, log);

  // De variables moeten er zijn vóórdat er lagen aan gebonden worden.
  log.progress?.(`${spec.name}: variables lezen`);
  const variables = await loadVariableIndex();
  requireCollections(payload.bindings?.collections ?? [], variables);

  // De icooncomponenten uit een eerdere icons.json-import. Ontbreken ze, dan
  // worden de iconen ingebakken en meldt buildIcon dat.
  log.progress?.(`${spec.name}: iconen zoeken`);
  const icons = await loadIconIndex();

  // De sets waar deze set instances van bevat. Ontbreekt er één, dan stopt de
  // import hier, vóór er een pagina of variant is aangeraakt.
  log.progress?.(`${spec.name}: geneste componenten zoeken`);
  const instanceTargets = await resolveInstanceTargets(spec, log);

  const stats = createStats();
  const context = {
    fonts: loaded,
    log,
    variables,
    stats,
    icons,
    instanceTargets,
    inlinedIcons: new Set(),
    // Per icoonlaag de paints die eroverheen moeten; aan het eind herhaald.
    recolors: [],
    // Absolute lagen met constraints; aan het eind gezet, zie `pinAbsolute`.
    pinned: [],
    // Elke laag met een kleur-variable, iconen én tekst; zie `diagnoseColors`.
    colorChecks: [],
    // Lagen die een effect style krijgen; aan het eind gelegd, zie
    // `applyEffectStyles`.
    effectStyleQueue: [],
    // De geneste instances van de variant die nu gebouwd wordt, op component-id.
    reusable: new Map(),
    // Per variant opnieuw gevuld; zie de bouwlus hieronder.
    slots: new Map(),
    // Het component dat nu gebouwd wordt: alleen daarop bestaat `createSlot`.
    component: null,
    // De slots van de vorige import, op naam; zie `buildContentSlot`.
    reusableSlots: new Map(),
    // Namen van slots die uit de spec verdwenen; zie `dropStaleContentSlots`.
    staleSlots: new Set(),
  };

  // Eén pagina per component. `createNodeFromSvg` (voor de ingebakken iconen)
  // en `combineAsVariants` werken op de huidige pagina, dus die moet ook echt
  // open staan en niet alleen bestaan.
  const page = spec.page
    ? await findOrCreatePage(spec.page)
    : figma.currentPage;
  await openPage(page);

  // Een matrix zonder assen levert één component zonder variant-properties op.
  // Een component set in Figma móet een as hebben, dus zo'n component wordt
  // geen set: het is een los component in een eigen canvasframe.
  const single =
    spec.components.length === 1 &&
    Object.keys(spec.components[0].variantProperties ?? {}).length === 0;

  // Een bestaande set wordt bijgewerkt, niet vervangen. Elke geplaatste
  // instance hangt aan de node-id van zijn variant; een nieuwe variant met
  // dezelfde naam is voor Figma een ander component en laat elke instance los.
  const existingSets = page.children.filter(
    (node) => node.type === 'COMPONENT_SET' && node.name === spec.name
  );

  // Een set die een los component is geworden kan niet bijgewerkt worden: het
  // node-type verschilt. Hij gaat weg, en dat laat de instances die eraan
  // hingen los. Daarom staat het er met zoveel woorden in de log.
  if (single && existingSets.length) {
    for (const stale of existingSets) stale.remove();
    log.warn(
      `"${spec.name}" was een component set met een kunstmatige as en is nu een los component. De oude set is verwijderd; instances die je ervan had geplaatst zijn losgelaten en moeten opnieuw.`
    );
  }

  const target = single ? null : (existingSets[0] ?? null);

  if (!single && existingSets.length > 1) {
    log.warn(
      `Er staan ${existingSets.length} sets "${spec.name}" op ${page.name}; alleen de bovenste is bijgewerkt. De rest komt uit een oudere plugin-versie en kan weg zodra de instances zijn overgezet.`
    );
  }

  // Het canvasframe van een los component. Een set is zelf de plaat waar zijn
  // varianten op staan; een los component heeft daar een frame om zich heen
  // voor nodig, anders staat hij in `start-dark` onleesbaar op het grijs van
  // Figma.
  const canvasFrame = single ? findOrCreateCanvasFrame(page, spec.name) : null;

  const knownVariants = new Map(
    ((single ? canvasFrame : target)?.children ?? [])
      .filter((node) => node.type === 'COMPONENT')
      .map((node) => [node.name, node])
  );
  const findKnown = variantFinder(knownVariants, spec.variantAxes);

  // Tijdens het bouwen mag de set geen auto layout hebben. Een variant die in
  // een auto-layout ouder hangt krijgt andere sizing-regels dan een die los op
  // de pagina staat, en dan zou een tweede import iets anders opleveren dan de
  // eerste. `applyCanvas` zet de stapeling verderop terug.
  if (target) target.layoutMode = 'NONE';
  if (canvasFrame) canvasFrame.layoutMode = 'NONE';

  const components = [];
  const variantSlots = [];
  let created = 0;
  let updated = 0;
  let cursorX = 0;

  for (const [index, component] of spec.components.entries()) {
    log.progress?.(
      `${spec.name}: variant ${index + 1} van ${spec.components.length}`
    );
    if (index && index % YIELD_EVERY === 0) await yieldToUi();

    const known = findKnown(component);
    const wrapper = known ?? figma.createComponent();

    // De variantnaam staat er vanaf het begin op en blijft er de hele bouw op
    // staan. Een component set leidt zijn variant-assen af uit de namen van
    // zijn kinderen, en op de update-route hangt deze wrapper daar al in: een
    // wrapper die ook maar even "dsn-link" heet is daar geen geldige variant,
    // en negen wrappers die tegelijk zo heten laat Figma niet staan. Vandaar
    // ook de naam als los argument aan `applyFrame`, dat anders de naam van
    // het root-element eroverheen zet.
    wrapper.name = component.name;

    // Hoe de root gebouwd wordt; de generator rekent met dezelfde regel.
    const rootShape = rootShapeOf(component.node);

    if (known) {
      await resetVariant(wrapper, context, {
        keepText: component.node.type === 'TEXT',
        keepSvg: rootShape === 'svg' ? component.node.svg : null,
      });
      updated += 1;
    } else {
      // Een verse variant heeft niets om te hergebruiken, maar de pool van de
      // vorige variant mag hier niet blijven staan: dan zou een icoon uit die
      // variant in deze belanden.
      context.reusable = new Map();
      context.reusableText = null;
      context.reusableLayers = new Map();
      context.reusableSlots = new Map();
      context.pooled = new Set();
      context.keptSlots = new Set();
      // Een nieuwe variant hangt meteen in de set als die er al is; anders op
      // de pagina, waar `combineAsVariants` hem straks ophaalt. De naam staat
      // er al op, want een set met een ongeldig genoemd kind is stuk.
      (target ?? canvasFrame ?? page).appendChild(wrapper);
      created += 1;
    }

    // Elke variant heeft zijn eigen lagen, dus ook zijn eigen slots.
    context.slots = new Map();
    context.component = wrapper;

    // Waar de lagen van deze variant in `colorChecks` beginnen. De meting leest
    // een laag terug via zijn pad vanaf de variant, en dat pad is er niet
    // zonder te weten bij welke variant een laag hoort.
    const checksBefore = context.colorChecks.length;
    context.layerPath = [];

    // Het root-element wórdt het component. Een extra frame eromheen zou een
    // lege laag met dezelfde auto layout toevoegen, en dat is precies de
    // nesting die een Figma-library onwerkbaar maakt.
    if (rootShape === 'frame') {
      applyFrame(wrapper, component.node, context, component.name);
      applySizing(wrapper, component.node, log, context);
    } else if (rootShape === 'svg') {
      // Een SVG die geen icoon is (Logo): het component is zelf het vlak met
      // de vormen erin; zie `buildSvgComponent`.
      buildSvgComponent(wrapper, component.node, context);
    } else {
      // Een component dat in zijn geheel tot tekst of een icoon inklapt kan
      // zichzelf niet zijn; die krijgt wel een frame om zich heen.
      wrapper.layoutMode = 'HORIZONTAL';
      wrapper.primaryAxisSizingMode = 'AUTO';
      wrapper.counterAxisSizingMode = 'AUTO';
      wrapper.fills = [];
      buildNode(component.node, wrapper, context);
    }

    // Alleen bij een verse import: varianten naast elkaar leggen zodat
    // combineAsVariants ze kan ophalen. Zit de variant al in een set, dan
    // bepaalt de auto layout van die set zijn plek.
    if (!target && !single) {
      wrapper.x = cursorX;
      wrapper.y = 0;
      cursorX += wrapper.width + 40;
      if ((index + 1) % 6 === 0) cursorX = 0;
    }

    // Wat er niet uit de pool is opgehaald hoort niet meer bij deze variant.
    dropUnusedIcons(context);
    for (const layer of context.reusableLayers?.values() ?? []) layer.remove();
    context.reusableLayers = new Map();
    for (const [name, slot] of context.reusableSlots) {
      slot.remove();
      context.staleSlots.add(name);
    }
    context.reusableSlots = new Map();

    for (const check of context.colorChecks.slice(checksBefore)) {
      check.variant = wrapper;
    }

    components.push(wrapper);
    variantSlots.push({ component: wrapper, slots: context.slots });
  }

  let set = target;
  if (single) {
    // Niets te combineren: het component staat al in zijn canvasframe.
    set = null;
  } else if (!set) {
    try {
      set = figma.combineAsVariants(components, page);
      set.name = spec.name;
      placeBesideOthers(page, set);
    } catch (error) {
      log.error(
        `Component set "${spec.name}" kon niet gecombineerd worden: ${error.message}. De losse varianten staan wel op de pagina.`
      );
      return {
        name: spec.name,
        variants: components.length,
        created,
        updated,
        orphans: [],
        combined: false,
        bindings: reportBindings(payload, stats, log),
      };
    }
  }

  // Varianten die uit de spec verdwenen zijn blijven staan. Ze automatisch
  // verwijderen zou elke instance ervan detachen, en dat is een beslissing van
  // een mens. Dezelfde afweging als bij een icoon dat uit de assets-map valt.
  //
  // Eén uitzondering: een variant die andere assen draagt dan de spec. Figma
  // eist dat elk kind van een set precies dezelfde variant-properties heeft;
  // een kind met een as die niet meer bestaat, of zonder een as die erbij
  // gekomen is, zet de set in een fouttoestand. Dan gooit
  // `componentPropertyDefinitions` eruit en komt er van de hele import niets
  // terecht. Zo'n variant laten staan is dus geen voorzichtige keuze maar een
  // kapotte set. Zichtbaar geweest bij FormFieldLabel, toen de as `suffix`
  // verdween: twee oude varianten hielden de set stuk en de properties konden
  // die ronde niet gelegd worden.
  const specAxes = Object.keys(spec.variantAxes ?? {})
    .sort()
    .join('|');
  const inSpec = new Set(spec.components.map((component) => component.name));
  const leftovers = [...knownVariants].filter(([name]) => !inSpec.has(name));
  const orphans = [];
  for (const [name, node] of leftovers) {
    if (axesOf(name).sort().join('|') !== specAxes) {
      node.remove();
      log.warn(
        `Variant "${name}" is verwijderd: hij draagt andere assen dan de spec (${specAxes.split('|').join(', ')}). Een set waarin de kinderen verschillende assen dragen is voor Figma een set met fouten, en dan mislukken de component properties.`
      );
      continue;
    }
    orphans.push(name);
    log.warn(
      `Variant "${name}" staat wel in ${spec.name} in Figma maar niet meer in de spec; handmatig verwijderen als dat de bedoeling is`
    );
  }

  // De varianten in de volgorde van de spec zetten. Een variant die opnieuw
  // wordt toegevoegd hangt anders achteraan in de kinderlijst, en dan staat een
  // teruggezette `state=hover` onderaan de plaat in plaats van bij zijn eigen
  // maat. Varianten die niet meer in de spec staan schuiven daarmee naar
  // achteren, en dat is precies waar ze horen.
  // De plaat waar het resultaat op staat: de set zelf, of het canvasframe van
  // een los component.
  const canvasNode = single ? canvasFrame : set;

  components.forEach((variant, index) => {
    if (canvasNode.children[index] !== variant) {
      canvasNode.insertChild(index, variant);
    }
  });

  applyCanvas(canvasNode, spec.canvas, context);

  // Losse componenten op de pagina, buiten de set of het canvasframe. Die
  // blijven over als een import halverwege afbreekt: de varianten zijn dan al
  // gebouwd maar nooit gecombineerd. Ze zien eruit als het component en zijn
  // het niet, dus ze horen gemeld te worden. Weggooien doet de plugin niet;
  // het kan ook werk van een designer zijn.
  const loose = page.children.filter(
    (node) => node.type === 'COMPONENT' && node !== canvasNode
  );
  if (loose.length) {
    const names = loose
      .slice(0, 3)
      .map((node) => `"${node.name}"`)
      .join(', ');
    log.warn(
      `Er ${loose.length === 1 ? 'staat 1 los component' : `staan ${loose.length} losse componenten`} op ${page.name}, buiten de set: ${names}${loose.length > 3 ? ', ...' : ''}. Dat blijft over als een import halverwege afbreekt; verwijder het met de hand.`
    );
  }

  log.info(
    single
      ? `${spec.name}: los component (${created} nieuw, ${updated} bijgewerkt)`
      : `${spec.name}: ${components.length} varianten (${created} nieuw, ${updated} bijgewerkt)`
  );
  reportBindings(payload, stats, log);

  // Na combineAsVariants: component properties horen op de set, niet op de
  // losse varianten. Bij een los component horen ze op het component zelf; het
  // canvasframe eromheen is geen component en kan ze niet dragen.
  log.progress?.(`${spec.name}: properties leggen`);
  const properties = applyComponentProperties(
    single ? components[0] : set,
    spec.componentProperties,
    variantSlots,
    context
  );

  dropStaleContentSlots(single ? components[0] : set, context.staleSlots, log);

  pinAbsolute(context);

  log.progress?.(`${spec.name}: schaduwen leggen`);
  const effectStyles = await applyEffectStyles(context);
  if (payload.bindings?.styled) {
    log.info(
      `${effectStyles.applied} lagen aan een effect style gehangen van de ${payload.bindings.styled} verwachte`
    );
  }

  // Als allerlaatste, ná het koppelen van de properties: zie `recolorIcons`.
  log.progress?.(`${spec.name}: kleuren zetten`);
  const recolored = recolorIcons(context);
  const lostColors = verifyIconColors(context);

  // Alleen wanneer erom gevraagd wordt: de meting wacht een tick en leest elke
  // laag twee keer terug, en bij 81 varianten is dat een lange log voor iemand
  // die alleen een import wil draaien.
  const diagnosis = options.diagnose
    ? await diagnoseColors(context, log, spec.name)
    : null;

  if (payload.warnings && payload.warnings.length) {
    for (const warning of payload.warnings) log.warn(warning);
  }

  // Pas nadat de pagina bestaat: de nieuwe pagina moet mee in de sortering.
  log.progress?.("pagina's sorteren");
  await sortManagedPages();

  figma.currentPage.selection = [canvasNode];
  figma.viewport.scrollAndZoomIntoView([canvasNode]);

  return {
    name: spec.name,
    page: page.name,
    variants: components.length,
    created,
    updated,
    orphans,
    recolored,
    lostColors,
    diagnosis,
    combined: !single,
    single,
    bindings: { ...stats, missing: [...stats.missing] },
    effectStyles,
    properties,
  };
}
