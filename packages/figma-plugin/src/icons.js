/**
 * Bouwt de iconset uit `figma-sync/dist/icons.json`.
 *
 * Waarom dit een andere import is dan die van de componenten: hier is er geen
 * variant-matrix en geen gemeten geometrie. Er zijn 51 losse componenten met
 * één vaste maat, en het enige dat er echt toe doet is dat een tweede import
 * bestaande iconen *bijwerkt* in plaats van vervangt.
 *
 * Dat laatste is de reden dat een bestaand component nooit weggegooid en
 * opnieuw aangemaakt wordt: elke instance in het bestand hangt aan de node-id
 * van het component. Een nieuw component met dezelfde naam is voor Figma een
 * ander component, en alle geplaatste iconen zouden losraken. De inhoud wordt
 * daarom binnen het bestaande component vervangen.
 */

import {
  createStats,
  loadVariableIndex,
  paintsForVector,
  requireCollections,
} from './bindings.js';

/** Hoeveel iconen naast elkaar, en hoeveel ruimte eromheen. */
const COLUMNS = 10;
const CELL = 72;

/**
 * De pagina waar de iconset op staat.
 *
 * Ook nodig bij een componentimport, die de iconen als instances plaatst en
 * dus zonder icons.json in de hand moet weten waar ze staan. De generator zet
 * dezelfde naam in de payload; `importIconSet` meldt het als die twee uit
 * elkaar lopen.
 */
export const ICON_PAGE = 'dsn/Icons';

/**
 * De pagina waar de iconset op staat.
 *
 * `figma.root.children` is pas te lezen na loadAllPagesAsync in een bestand met
 * dynamic page loading; zonder die aanroep gooit Figma daar sinds 2024 een
 * fout op.
 */
async function findOrCreatePage(name) {
  if (typeof figma.loadAllPagesAsync === 'function') {
    await figma.loadAllPagesAsync();
  }

  const existing = figma.root.children.find(
    (page) => page.type === 'PAGE' && page.name === name
  );
  if (existing) return existing;

  const page = figma.createPage();
  page.name = name;
  return page;
}

/**
 * Opent een pagina. In een bestand met dynamic page loading is het synchrone
 * `figma.currentPage =` niet meer toegestaan; setCurrentPageAsync is de route
 * die het wel is.
 */
async function openPage(page) {
  if (figma.currentPage === page) return;
  if (typeof figma.setCurrentPageAsync === 'function') {
    await figma.setCurrentPageAsync(page);
  } else {
    figma.currentPage = page;
  }
}

/**
 * Zet de strepen van een lijn-icoon om naar vlakken.
 *
 * Zonder deze stap is de kleur van een icoon soms een `stroke` en soms een
 * `fill`, afhankelijk van of Tabler het icoon als lijn of als vlak tekende. Een
 * instance swap wisselt dan tussen twee lagen die hun kleur uit een ander veld
 * halen, en de override die op `fills` stond komt op het nieuwe icoon nergens
 * terecht. Na het omzetten heeft élk icoon precies één `fills`.
 *
 * `outlineStroke()` levert een nieuwe node op en laat het origineel staan. Wáár
 * die nieuwe node landt ligt niet vast: in de praktijk blijkt dat de huidige
 * pagina te kunnen zijn in plaats van de ouder van het origineel. Hij wordt
 * daarom expliciet in `parent` gezet. Figma houdt bij het verhangen de absolute
 * positie aan, dus de vorm blijft staan waar hij stond.
 */
function outlineStrokes(nodes, parent, icon, log) {
  const drawn = [];

  for (const node of nodes) {
    const hasStroke = Array.isArray(node.strokes) && node.strokes.length;
    if (!hasStroke) {
      drawn.push(node);
      continue;
    }

    let outlined = null;
    try {
      outlined = node.outlineStroke();
    } catch (error) {
      log.warn(
        `${icon.name}: een lijn kon niet naar een vlak omgezet worden (${error.message}); het icoon houdt een stroke`
      );
    }

    if (!outlined) {
      drawn.push(node);
      continue;
    }

    if (outlined.parent !== parent) parent.appendChild(outlined);

    if (Array.isArray(node.fills) && node.fills.length) {
      node.strokes = [];
      drawn.push(node);
    } else {
      node.remove();
    }
    drawn.push(outlined);
  }

  return drawn;
}

/**
 * Vult `component` met precies één laagpad: `Group > Shape`.
 *
 * Dit is de kern van een bruikbare iconset. Een instance swap wisselt het
 * `mainComponent` van een instance, maar de kleuroverrides die daarop liggen
 * worden door Figma op **laagpad** teruggezocht. Verschilt de laagstructuur per
 * icoon, dan landt de override na een swap op een andere laag dan bedoeld, of
 * op geen enkele: dan houdt het glyph de standaardkleur van het icooncomponent
 * en krijgt een andere laag de kleur die voor het glyph bedoeld was.
 *
 * Eén vorm voor alle 51 iconen maakt dat probleem onmogelijk. Dezelfde vorm
 * die met de hand ook wordt aangehouden, zodat een swap tussen een gegenereerd
 * en een handgemaakt icoon net zo goed werkt.
 *
 * Het bouwen gebeurt volledig binnen het frame dat `createNodeFromSvg`
 * oplevert; pas de afgeronde `Group` verhuist naar het component. Zo hoeft er
 * maar één node een ouder te wisselen in plaats van alle losse vectoren, en
 * hebben `flatten` en `group` altijd nodes en ouder bij elkaar.
 */
function fillWithSvg(component, icon, context) {
  for (const child of [...component.children]) child.remove();

  const source = figma.createNodeFromSvg(icon.svg);
  const drawn = outlineStrokes([...source.children], source, icon, context.log);

  if (!drawn.length) {
    context.log.warn(`${icon.name}: de SVG leverde geen tekenbare laag op`);
    source.remove();
    return;
  }

  const shape = figma.flatten(drawn, source);
  shape.name = 'Shape';
  // Na het platslaan is de kleur altijd een vulling; de binding hoort daar dan
  // ook op, en niet meer op een stroke die er niet meer is.
  shape.fills = paintsForVector(icon, context);
  shape.strokes = [];

  const group = figma.group([shape], source);
  group.name = 'Group';

  // Figma houdt bij het verhangen de absolute positie aan, en `source` staat
  // ergens anders dan het component. De offset binnen het 24x24-kader wordt
  // daarom onthouden en teruggezet.
  const { x, y } = group;
  component.appendChild(group);
  group.x = x;
  group.y = y;
  source.remove();

  // Zonder dit blijft de vorm op zijn plek als een designer de instance
  // vergroot, en groeit alleen het kader mee.
  try {
    shape.constraints = { horizontal: 'SCALE', vertical: 'SCALE' };
  } catch (error) {
    context.log.warn(
      `${icon.name}: constraints niet toegestaan (${error.message}); het icoon schaalt niet mee`
    );
  }
}

/**
 * De icooncomponenten in dit bestand, op naam.
 *
 * Dit is het koppelstuk tussen de twee imports: een icoon in een component set
 * wordt een instance van het component dat hier staat, en dat is wat een
 * instance swap property nodig heeft om iets te kunnen verwisselen.
 *
 * Ontbreekt de pagina, dan komt er een lege index terug. De componentimport
 * valt dan terug op een ingebakken SVG en meldt dat; weigeren zou betekenen
 * dat je zonder iconset helemaal geen componenten meer kunt importeren.
 *
 * @returns {Promise<Map<string, ComponentNode>>}
 */
export async function loadIconIndex(pageName = ICON_PAGE) {
  if (typeof figma.loadAllPagesAsync === 'function') {
    await figma.loadAllPagesAsync();
  }

  const page = figma.root.children.find(
    (candidate) => candidate.type === 'PAGE' && candidate.name === pageName
  );
  if (!page) return new Map();

  return new Map(
    page.children
      .filter((node) => node.type === 'COMPONENT')
      .map((node) => [node.name, node])
  );
}

/**
 * Importeert de iconset.
 *
 * @param {object} payload de inhoud van figma-sync/dist/icons.json
 * @param {object} log verzamelaar met .info/.warn/.error
 */
export async function importIconSet(payload, log) {
  if (payload.$schema !== 'dsn-figma-icons/1') {
    throw new Error(
      `Onbekend formaat: ${payload.$schema ?? 'geen $schema'}. Verwacht dsn-figma-icons/1.`
    );
  }

  const spec = payload.iconSet;

  if (spec.page !== ICON_PAGE) {
    log.warn(
      `De generator zet de iconen op "${spec.page}", de componentimport zoekt ze op "${ICON_PAGE}". Instance swap properties vinden ze daar niet.`
    );
  }

  // Dezelfde afweging als bij de componenten: een iconset op een vaste kleur
  // volgt de theme-schakelaar niet, en dat is de helft van wat een iconset in
  // een design system moet doen.
  const variables = await loadVariableIndex();
  requireCollections(payload.bindings?.collections ?? [], variables);

  const stats = createStats();
  const context = { log, variables, stats };

  const page = await findOrCreatePage(spec.page);
  const existing = new Map(
    page.children
      .filter((node) => node.type === 'COMPONENT')
      .map((node) => [node.name, node])
  );

  let created = 0;
  let updated = 0;

  // `createNodeFromSvg` zet zijn frame op de **huidige** pagina, en
  // `outlineStroke()` blijkt zijn resultaat daar ook neer te kunnen zetten.
  // Bouwen terwijl een andere pagina open staat betekent dus dat `flatten` en
  // `group` nodes en ouder op verschillende pagina's krijgen, en Figma weigert
  // dat: "Grouped nodes must be in the same page as the parent". Door de
  // iconpagina te openen gebeurt alles op één pagina. De pagina die de designer
  // openhad gaat er daarna weer overheen, want een component-import zet zijn
  // set op `figma.currentPage`.
  const previousPage = figma.currentPage;
  await openPage(page);

  try {
    for (const [index, icon] of spec.icons.entries()) {
      const known = existing.get(icon.name);
      const component = known ?? figma.createComponent();

      if (known) {
        updated += 1;
      } else {
        page.appendChild(component);
        component.name = icon.name;
        // Alleen bij een nieuw icoon: een bestaand icoon is misschien door een
        // designer verplaatst, en dat terugduwen is geen bijwerken maar
        // opruimen achter iemand aan.
        component.x = (index % COLUMNS) * CELL;
        component.y = Math.floor(index / COLUMNS) * CELL;
        created += 1;
      }

      component.resize(icon.width, icon.height);
      // Een icoon heeft geen achtergrond; zonder dit krijgt elk component het
      // witte vlak dat Figma standaard aanmaakt.
      component.fills = [];
      component.clipsContent = false;
      fillWithSvg(component, icon, context);
    }
  } finally {
    await openPage(previousPage);
  }

  // Iconen die uit de assets-map verdwenen zijn blijven staan. Ze automatisch
  // verwijderen zou elke instance ervan detachen, en dat is een beslissing van
  // een mens.
  const removed = [...existing.keys()].filter(
    (name) => !spec.icons.some((icon) => icon.name === name)
  );
  for (const name of removed) {
    log.warn(
      `${name} staat wel in Figma maar niet meer in de assets-map; handmatig verwijderen als dat de bedoeling is`
    );
  }

  log.info(
    `${spec.page}: ${created} iconen toegevoegd, ${updated} bijgewerkt (${stats.bound} aan een variable gebonden)`
  );

  for (const name of stats.missing) {
    log.warn(
      `Variable ${name} bestaat niet in dit bestand; vaste kleur blijft staan`
    );
  }
  for (const warning of payload.warnings ?? []) log.warn(warning);

  // De pagina wordt bewust niet geopend. Een component-import zet zijn set op
  // `figma.currentPage`, dus de designer hier naartoe slepen zou betekenen dat
  // een button die daarna geïmporteerd wordt tussen de iconen belandt.

  return {
    page: spec.page,
    total: spec.icons.length,
    created,
    updated,
    removed,
    bindings: { ...stats, missing: [...stats.missing] },
  };
}
