/**
 * Het contract tussen de generators en de plugin.
 *
 * Drie builds schrijven JSON die deze plugin inleest: `design-tokens` (de
 * variables), `figma-sync/build-icons.js` (de iconset) en
 * `figma-sync/build-components.js` (de component sets). Wat die JSON betekent
 * moet aan beide kanten hetzelfde zijn, en stond eerst aan beide kanten los
 * uitgeschreven: de schema-namen, de paginanamen, en hoe de plugin de root van
 * een component bouwt. Loopt zo'n kopie uit de pas, dan merkt niemand het tot
 * er in Figma iets op de verkeerde pagina staat of een instance zijn laag niet
 * vindt.
 *
 * Dit bestand staat in de plugin omdat de plugin geen afhankelijkheden heeft:
 * de generators kunnen het importeren zonder dat er een kring ontstaat, en
 * esbuild bundelt het gewoon mee. Daarom ook: geen `figma`, geen Node, alleen
 * gewone functies.
 */

/** Het `$schema` van elk bestand dat de plugin kan inlezen, per soort. */
export const SCHEMAS = {
  variables: 'dsn-figma-variables/1',
  icons: 'dsn-figma-icons/1',
  components: 'dsn-figma-components/1',
};

/**
 * De volgorde waarin de soorten geïmporteerd moeten worden: componenten
 * binden aan variables, en hun iconen zijn instances van de iconset.
 */
export const IMPORT_ORDER = ['variables', 'icons', 'components'];

/** De soort van een ingelezen bestand, of `null` als het schema onbekend is. */
export function kindOf(payload) {
  return (
    Object.keys(SCHEMAS).find((kind) => SCHEMAS[kind] === payload?.$schema) ??
    null
  );
}

/** Weigert een bestand dat niet het verwachte schema heeft. */
export function assertSchema(payload, kind) {
  if (payload.$schema === SCHEMAS[kind]) return;
  throw new Error(
    `Onbekend formaat: ${payload.$schema ?? 'geen $schema'}. Verwacht ${SCHEMAS[kind]}.`
  );
}

/**
 * Alle pagina's van de bibliotheek beginnen hiermee. Zo kan de plugin ze
 * alfabetisch zetten zonder aan de pagina's van de designer te komen.
 */
export const PAGE_PREFIX = 'dsn/';

/**
 * De pagina van een component: `Button` wordt `dsn/Button`.
 *
 * Eén pagina per component. Alles op één pagina zetten werkt alleen zolang het
 * er vijf zijn: bij de volle bibliotheek is een pagina per component de enige
 * indeling waarin een designer een component terugvindt zonder eerst het hele
 * canvas af te scrollen.
 *
 * De naam volgt de matrix en niet de CSS-klasse. De set zelf heet `dsn-button`,
 * want dat is waar een designer in de code op zoekt; een paginalijst leest
 * prettiger als `dsn/Button`, en de plugin sorteert die lijst alfabetisch.
 */
export function pageNameFor(component) {
  return `${PAGE_PREFIX}${component}`;
}

/**
 * De pagina van de iconset. Een componentimport zoekt de iconen hier om er
 * instances van te plaatsen.
 *
 * Bewust een eigen pagina met losse componenten, geen component set met een
 * `icon`-as. Een instance swap property kiest uit componenten; een set van 51
 * varianten levert in die keuzelijst één regel op waarna de designer alsnog
 * via de variant-dropdown moet zoeken. Losse componenten zijn precies wat de
 * swap-picker verwacht.
 */
export const ICON_PAGE = pageNameFor('Icons');

/**
 * Hoe de plugin de root van een variant bouwt.
 *
 * - `frame`: het root-element wórdt het component.
 * - `svg`: een SVG die geen icoon is (Logo); het component is zelf het vlak,
 *   met de vormen er direct in.
 * - `wrapped`: een root die tot tekst of een icoon inklapt (Heading,
 *   Paragraph) kan zichzelf niet zijn en krijgt een frame om zich heen. In een
 *   instance zit die laag dan één niveau dieper.
 *
 * De generator moet dit weten om de lagen van een instance terug te vinden,
 * de plugin om het component te bouwen.
 *
 * @param {object} [node] de root-spec van een variant
 * @returns {'frame' | 'svg' | 'wrapped'}
 */
export function rootShapeOf(node) {
  if (node?.type === 'FRAME') return 'frame';
  if (node?.type === 'VECTOR' && node.shapes) return 'svg';
  return 'wrapped';
}

/**
 * Zet component sets ná de sets waar ze instances van bevatten: een
 * HeadingGroup na Heading en PreHeading. Andersom weigert de plugin.
 *
 * Een set wordt aangewezen op pagina én naam: een onderdeel als `__item` staat
 * op meer pagina's. Wat niet tot een component set herleidbaar is (`null` uit
 * `componentSetOf`) blijft op zijn plek in de volgorde.
 *
 * @template T
 * @param {T[]} items
 * @param {(item: T) => object | null | undefined} componentSetOf
 * @returns {T[]}
 */
export function dependencyOrder(items, componentSetOf) {
  const bySet = new Map();
  for (const item of items) {
    const set = componentSetOf(item);
    if (set) bySet.set(`${set.page}|${set.name}`, item);
  }

  const ordered = [];
  const done = new Set();
  const visit = (item) => {
    if (done.has(item)) return;
    done.add(item);
    for (const { name, page } of componentSetOf(item)?.dependsOn ?? []) {
      const dependency = bySet.get(`${page}|${name}`);
      if (dependency) visit(dependency);
    }
    ordered.push(item);
  };
  for (const item of items) visit(item);
  return ordered;
}

/**
 * De gekozen bestanden als imports op volgorde.
 *
 * Het schema bepaalt wat er geïmporteerd wordt, niet de bestandsnaam. Een
 * selectie in de bestandskiezer komt op alfabetische volgorde binnen, en dan
 * zou button.json vóór variables.json gaan en geweigerd worden. Daarna nog de
 * component sets onderling: een HeadingGroup na Heading.
 *
 * @param {{name: string, payload: object}[]} files
 * @returns {{jobs: {name: string, kind: string, payload: object}[],
 *   rejected: {name: string, schema: string | undefined}[]}}
 */
export function planImports(files) {
  const jobs = [];
  const rejected = [];
  for (const { name, payload } of files) {
    const kind = kindOf(payload);
    if (kind) jobs.push({ name, kind, payload });
    else rejected.push({ name, schema: payload?.$schema });
  }

  jobs.sort(
    (a, b) => IMPORT_ORDER.indexOf(a.kind) - IMPORT_ORDER.indexOf(b.kind)
  );
  return {
    jobs: dependencyOrder(jobs, (job) =>
      job.kind === 'components' ? job.payload.componentSet : null
    ),
    rejected,
  };
}
