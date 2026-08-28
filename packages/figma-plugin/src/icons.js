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
import { recolorVectors } from './svg.js';

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
 * Zet de vectoren uit de SVG rechtstreeks in `component`.
 *
 * `createNodeFromSvg` levert een frame met de vectoren erin. Dat frame gaat er
 * hier weer af: het zou een lege laag tussen het component en zijn vectoren
 * opleveren, en dat is precies de nesting die een Figma-library onwerkbaar
 * maakt.
 *
 * De posities worden vóór het verhangen onthouden en erna teruggezet. Figma
 * behoudt bij `appendChild` de absolute positie, dus een component dat al
 * ergens op de pagina staat zou zijn vectoren anders buiten beeld krijgen.
 */
function fillWithSvg(component, icon, context) {
  for (const child of [...component.children]) child.remove();

  const source = figma.createNodeFromSvg(icon.svg);
  const placed = [...source.children].map((child) => ({
    child,
    x: child.x,
    y: child.y,
  }));

  for (const { child, x, y } of placed) {
    component.appendChild(child);
    child.x = x;
    child.y = y;
    // Zonder dit blijft een vector op zijn plek als een designer de instance
    // vergroot, en dan groeit alleen het kader mee.
    child.constraints = { horizontal: 'SCALE', vertical: 'SCALE' };
  }
  source.remove();

  recolorVectors(
    placed.map(({ child }) => child),
    paintsForVector(icon, context)
  );
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
