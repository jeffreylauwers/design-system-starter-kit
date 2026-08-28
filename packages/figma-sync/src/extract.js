/**
 * Leest de *computed* layout van een component uit een echte browser.
 *
 * De CSS parsen zou onbetrouwbaar zijn: cascade, custom properties, clamp() en
 * media queries bepalen samen pas de eindwaarde. Door de component te renderen
 * en getComputedStyle te lezen krijgen we exact wat de gebruiker ziet, en
 * bovendien flexbox-informatie die vrijwel 1-op-1 op Figma auto layout past.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

import { createTokenReader, TRACKED_PROPERTIES } from './browser-tokens.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(__dirname, '..', '..', '..');

/** `@dsn-starter-kit/x/y/z.css` -> absoluut pad binnen de monorepo. */
function resolveCssPath(specifier) {
  const match = specifier.match(/^@dsn-starter-kit\/([^/]+)\/(.+)$/);
  if (!match) return path.resolve(monorepoRoot, specifier);
  return path.join(monorepoRoot, 'packages', match[1], match[2]);
}

/**
 * Eigenschappen die we uitlezen. Alles wat hier niet in staat bestaat voor de
 * generator niet, dus deze lijst is de feitelijke scope van de conversie.
 */
const CAPTURED_PROPERTIES = [
  'display',
  'flexDirection',
  'flexWrap',
  'gap',
  'rowGap',
  'columnGap',
  'alignItems',
  'justifyContent',
  'alignSelf',
  'gridTemplateColumns',
  'gridTemplateRows',
  'gridColumnStart',
  'gridColumnEnd',
  'gridRowStart',
  'gridRowEnd',
  'top',
  'right',
  'bottom',
  'left',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'backgroundColor',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'borderTopColor',
  'borderStyle',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
  'color',
  'fontFamily',
  'fontSize',
  'fontWeight',
  'fontStyle',
  'lineHeight',
  'letterSpacing',
  'textAlign',
  'textDecorationLine',
  'textTransform',
  'opacity',
  'boxShadow',
  'position',
  'overflow',
];

/**
 * Klasse die een element alleen voor screenreaders bedoeld maakt. Zulke
 * elementen staan buiten beeld geklemd op 1x1px en hebben in Figma geen
 * tegenhanger; ze zouden alleen maar een onzichtbare 1px-node opleveren.
 */
const VISUALLY_HIDDEN_CLASS = 'dsn-visually-hidden';

/**
 * Loopt de DOM af binnen de browser en geeft een boom terug met per element
 * de computed styles en de positie ten opzichte van de root.
 */
/* c8 ignore start - draait in de browsercontext, niet in Node */
function domWalker([properties, hiddenClass]) {
  const root = document.querySelector('[data-figma-root]');
  if (!root) throw new Error('geen [data-figma-root] gevonden');
  const origin = root.getBoundingClientRect();

  const readStyles = (element) => {
    const computed = getComputedStyle(element);
    const result = {};
    for (const property of properties) result[property] = computed[property];
    return result;
  };

  const visit = (element) => {
    const rect = element.getBoundingClientRect();
    const node = {
      tag: element.tagName.toLowerCase(),
      classes: Array.from(element.classList),
      rect: {
        x: Math.round((rect.x - origin.x) * 100) / 100,
        y: Math.round((rect.y - origin.y) * 100) / 100,
        width: Math.round(rect.width * 100) / 100,
        height: Math.round(rect.height * 100) / 100,
      },
      styles: readStyles(element),
      // Welk token elke gemeten eigenschap leverde; de basis voor de
      // variable-bindingen in Figma.
      tokens: window.__dsnReadTokenSources(element),
      children: [],
    };

    // SVG wordt niet uitgelopen: dat wordt in Figma één vector-node.
    if (node.tag === 'svg') {
      node.kind = 'vector';
      node.svg = element.outerHTML;
      return node;
    }

    for (const child of element.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent.trim();
        if (text) node.children.push({ kind: 'text', text });
        continue;
      }
      if (child.nodeType !== Node.ELEMENT_NODE) continue;
      if (child.classList.contains(hiddenClass)) continue;
      // Volledig doorzichtige elementen (zoals de native input onder een
      // custom control) leveren in Figma alleen een onzichtbare node op.
      if (getComputedStyle(child).opacity === '0') continue;
      node.children.push(visit(child));
    }

    return node;
  };

  return visit(root);
}
/* c8 ignore stop */

/**
 * Rendert elke cel van de matrix en levert de computed boom per variant.
 *
 * @param {object} matrix Een matrixdefinitie uit src/matrices/
 * @returns {Promise<Array<{variant: object, tree: object}>>}
 */
/**
 * Documentstijlen die altijd meegeladen worden.
 *
 * body.css zet de basis-font-family. Zonder dit erft elk element dat zelf geen
 * font-family declareert (een <div>, een <p> zonder eigen token) het
 * browser-standaardlettertype, en meet de generator Times in plaats van het
 * lettertype van het design system.
 */
const BASE_CSS = ['@dsn-starter-kit/components-html/src/body/body.css'];

/**
 * body.css hangt aan de klasse `.dsn-body`, niet aan het element. Een consument
 * zet die klasse zelf op zijn body, dus de meetpagina doet dat ook.
 */
const BODY_CLASS = 'dsn-body';

/**
 * Meetviewport. Mobile-first: een small-viewport ontwerp is 375px breed, en
 * daar lossen de fluid clamps op hun ondergrens op. De gemeten typografie komt
 * daarmee overeen met de `default-mobile` mode van de Density-collection.
 */
const DEFAULT_VIEWPORT = { width: 375, height: 900 };

/**
 * Extra breedte voor de tweede meting waarmee flexibele grid-tracks worden
 * herkend. De browser lost `1fr` op naar pixels voordat wij kunnen meten, dus
 * de enige manier om `fr` van een vaste maat te onderscheiden is kijken welke
 * track meegroeit als de container breder wordt.
 */
const GRID_PROBE_DELTA = 240;

export async function extractMatrix(matrix) {
  const stylesheets = [...BASE_CSS, ...matrix.css]
    .map(resolveCssPath)
    .map((file) => fs.readFileSync(file, 'utf8'))
    .join('\n');

  const fontLinks = (matrix.fonts ?? [])
    .map((href) => `<link rel="stylesheet" href="${href}">`)
    .join('');

  const viewport = matrix.viewport ?? DEFAULT_VIEWPORT;

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport });

  // De tokenlezer gaat als tekst de pagina in. Hij wordt per variant opnieuw
  // geïnstalleerd: `setContent` vervangt de stylesheets, en de lezer bouwt
  // daar bij het eerste gebruik een cascade-index van.
  const installTokenReader = `window.__dsnReadTokenSources = (${createTokenReader.toString()})(${JSON.stringify(TRACKED_PROPERTIES)});`;

  const combinations = cartesian(matrix.axes);
  const results = [];

  const documentFor = (combination, wrapperStyle) =>
    `<!doctype html><html><head><meta charset="utf-8"><style>
       /* Neutrale ondergrond zodat de component zelf de enige bron van
          layout is en er geen body-marges meelekken. */
       *, *::before, *::after { box-sizing: border-box; }

       /* Transitions en animaties uitzetten. getComputedStyle leest tijdens
          een transition de tussenwaarde, niet de eindwaarde, en dan meten we
          halverwege een hover-kleur of een icoon dat nog aan het infaden is. */
       *, *::before, *::after {
         transition: none !important;
         animation: none !important;
       }

       /* Bij de brede tweede meting steekt de wrapper buiten de viewport;
          zonder dit verschuift een scrollbalk de layout. */
       body { margin: 0; padding: 40px; background: #fff; overflow: hidden; }
     </style>${fontLinks}<style>${stylesheets}</style></head>
     <body class="${BODY_CLASS}"><div style="${wrapperStyle}">${matrix.render(combination)}</div></body></html>`;

  /**
   * Zet één variant in de pagina en meet hem.
   * `extraWidth` verbreedt alleen de wrapper, niet de viewport, zodat de
   * fluid typografie op de meetviewport vastgeprikt blijft.
   */
  const render = async (combination, extraWidth) => {
    const wrapperStyle = extraWidth
      ? `${matrix.wrapperStyle ?? ''};width:${viewport.width + extraWidth}px`
      : (matrix.wrapperStyle ?? '');

    await page.setContent(documentFor(combination, wrapperStyle), {
      waitUntil: 'load',
    });

    // Toestanden die niet in markup uit te drukken zijn (zoals de
    // indeterminate-property van een checkbox) worden hier gezet.
    if (matrix.domSetup) {
      await page.evaluate(`(() => { ${matrix.domSetup} })()`);
    }

    // Zonder document.fonts.ready meet de eerste variant nog met een
    // fallback-font en wijken de breedtes af van de rest.
    await page.evaluate(() => document.fonts.ready);

    // De cursor blijft tussen varianten staan waar hij stond. Zonder hem eerst
    // weg te zetten meet elke variant na een hover-variant óók als hover,
    // want het element staat op dezelfde plek.
    await page.mouse.move(0, 0);

    // De pseudo-toestand kan op elke as staan, niet per se op een as die
    // toevallig 'state' heet.
    const pseudo = Object.values(combination)
      .map((value) => matrix.pseudoStates?.[value])
      .find(Boolean);
    if (pseudo === 'hover') await page.hover('[data-figma-root]');

    await page.evaluate(installTokenReader);

    return page.evaluate(domWalker, [
      CAPTURED_PROPERTIES,
      VISUALLY_HIDDEN_CLASS,
    ]);
  };

  const hasGrid = (node) =>
    Boolean(node.styles?.display?.endsWith('grid')) ||
    (node.children ?? []).some(hasGrid);

  try {
    for (const combination of combinations) {
      const tree = await render(combination);

      // De tweede meting kost een extra render, dus alleen doen als er
      // daadwerkelijk een grid in zit waarvan de tracks te duiden zijn.
      const wideTree = hasGrid(tree)
        ? await render(combination, GRID_PROBE_DELTA)
        : undefined;

      results.push({ variant: combination, tree, wideTree });
    }
  } finally {
    await browser.close();
  }

  return results;
}

/** Alle combinaties van de assen, in stabiele volgorde. */
export function cartesian(axes) {
  return Object.entries(axes).reduce(
    (accumulator, [name, values]) =>
      accumulator.flatMap((base) =>
        values.map((value) => ({ ...base, [name]: value }))
      ),
    [{}]
  );
}
