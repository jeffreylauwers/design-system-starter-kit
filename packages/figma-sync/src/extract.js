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

import { createTokenReader, TRACKED_PROPERTIES } from './browser-tokens.js';
import {
  CAPTURED_PROPERTIES,
  domWalker,
  VISUALLY_HIDDEN_CLASS,
} from './dom-walker.js';
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(__dirname, '..', '..', '..');

/** `@dsn-starter-kit/x/y/z.css` -> absoluut pad binnen de monorepo. */
/**
 * De `exports`-map van een package, als bestandspaden.
 *
 * Nodig omdat de component-CSS haar afhankelijkheden via de package-exports
 * declareert en niet via een pad: `hero.css` doet
 * `@import '@dsn-starter-kit/design-tokens/css/scoped/start-hero-image-light'`,
 * en dat wijst naar `dist/css/scoped/start-light-hero-image.css`. De exportnaam
 * en de bestandsnaam verschillen daar, dus dat pad valt niet te raden.
 */
function exportsOf(packageName) {
  const manifest = path.join(
    monorepoRoot,
    'packages',
    packageName,
    'package.json'
  );
  if (!fs.existsSync(manifest)) return new Map();

  const { exports: map } = JSON.parse(fs.readFileSync(manifest, 'utf8'));
  const entries = new Map();

  for (const [key, value] of Object.entries(map ?? {})) {
    const target = typeof value === 'string' ? value : value?.default;
    if (typeof target !== 'string' || !target.endsWith('.css')) continue;
    entries.set(key.replace(/^\.\//, ''), target.replace(/^\.\//, ''));
  }

  return entries;
}

function resolveCssPath(specifier) {
  const match = specifier.match(/^@dsn-starter-kit\/([^/]+)\/(.+)$/);
  if (!match) return path.resolve(monorepoRoot, specifier);

  const [, packageName, subpath] = match;
  const packageRoot = path.join(monorepoRoot, 'packages', packageName);

  // Eerst het letterlijke pad; de matrices schrijven `src/button/button.css`.
  const direct = path.join(packageRoot, subpath);
  if (fs.existsSync(direct)) return direct;

  // Anders de exports-map, waar de CSS zelf zijn afhankelijkheden mee aanwijst.
  const exported = exportsOf(packageName).get(subpath);
  if (exported) return path.join(packageRoot, exported);

  return direct;
}

/**
 * Leest een stylesheet en vervangt zijn `@import`-regels door de inhoud waar ze
 * naar wijzen.
 *
 * De stylesheets gaan als tekst in een `<style>`-blok, en daarin lost een
 * relatief `@import` nooit op: er is geen basis-URL om hem tegen af te zetten.
 * Dat ging stil mis. `components-react/src/Checkbox/Checkbox.css` is sinds de
 * verhuizing van de formuliercontrols nog maar één regel, namelijk een
 * `@import` van de echte CSS in `components-html`, en de Checkbox werd daardoor
 * volledig ongestyled gemeten: geen kleuren, geen randen, geen enkele binding.
 * De build was groen, want een component zonder tokens levert ook geen
 * misgelopen bindingen op.
 *
 * Een import die niet te vinden is gooit daarom, in plaats van te verdwijnen.
 * Beter een build die stukloopt dan een Figma-component dat er is maar leeg.
 */
function readStylesheet(file, seen = new Set()) {
  if (seen.has(file)) return '';
  seen.add(file);

  const source = fs.readFileSync(file, 'utf8');

  return source.replace(
    /@import\s+(?:url\()?['"]([^'"]+)['"]\)?\s*;/g,
    (statement, specifier) => {
      const target = specifier.startsWith('@dsn-starter-kit/')
        ? resolveCssPath(specifier)
        : path.resolve(path.dirname(file), specifier);

      if (!fs.existsSync(target)) {
        throw new Error(
          `${file} doet \`${statement}\`, maar ${target} bestaat niet. Een @import lost in een inline <style> niet op, dus dit zou een component zonder stijl opleveren.`
        );
      }

      return readStylesheet(target, seen);
    }
  );
}

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
 * Meetviewport. Mobile-first: een small-viewport ontwerp is 360px breed, en
 * daar lossen de fluid clamps op hun ondergrens op. De gemeten typografie komt
 * daarmee overeen met de `start-default-vp-small` mode van de Density-collection.
 */
const DEFAULT_VIEWPORT = { width: 360, height: 900 };

/**
 * Extra breedte voor de tweede meting waarmee flexibele grid-tracks worden
 * herkend. De browser lost `1fr` op naar pixels voordat wij kunnen meten, dus
 * de enige manier om `fr` van een vaste maat te onderscheiden is kijken welke
 * track meegroeit als de container breder wordt.
 */
const GRID_PROBE_DELTA = 240;

/**
 * Controleert of de matrix elke `@dsn-depends-on` van zijn componenten laadt.
 *
 * Sinds DR-2026-09 declareert elke component-CSS bovenaan van welke andere
 * lagen hij afhangt. Een matrix die zo'n laag niet meelaadt meet een component
 * dat er half uitziet, en dat valt niet op: de meting slaagt gewoon, alleen met
 * de verkeerde waarden.
 *
 * Dat is precies wat er bij Table gebeurde. `table.css` hangt van `button` af,
 * de matrix laadde die niet, en de sorteerknop werd gemeten met de knop-chrome
 * van de browser: 13,33px Arial en een `outset` rand. Drie waarschuwingen die
 * er als een generatorfout uitzagen, terwijl de matrix simpelweg te weinig CSS
 * laadde. Na het toevoegen van button.css ging Table van 97 naar 181
 * bindingen.
 *
 * Een waarschuwing en geen fout: een matrix mag bewust een afhankelijkheid
 * weglaten, bijvoorbeeld omdat die laag in die variant niet gerenderd wordt.
 */
function checkDeclaredDependencies(files, warnings) {
  const loaded = new Set(files.map((file) => path.basename(file, '.css')));

  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    const declared = source.match(/\/\*\s*@dsn-depends-on:\s*([^*]+?)\s*\*\//);
    if (!declared) continue;

    const missing = declared[1]
      .split(',')
      .map((name) => name.trim())
      .filter((name) => name && !loaded.has(name));

    if (missing.length) {
      warnings.push(
        `${path.basename(file)} declareert @dsn-depends-on: ${missing.join(', ')}, maar die CSS staat niet in de css-lijst van de matrix. Het component wordt dan gemeten zonder die laag.`
      );
    }
  }
}

/**
 * Rendert elke cel van de matrix en levert de computed boom per variant.
 *
 * @param {object} matrix Een matrixdefinitie uit src/matrices/
 * @returns {Promise<Array<{variant: object, tree: object}>>}
 */
export async function extractMatrix(matrix) {
  const files = [...BASE_CSS, ...matrix.css].map(resolveCssPath);
  checkDeclaredDependencies(files, matrix.warnings ?? (matrix.warnings = []));

  const stylesheets = files.map((file) => readStylesheet(file)).join('\n');

  const fontLinks = (matrix.fonts ?? [])
    .map((href) => `<link rel="stylesheet" href="${href}">`)
    .join('');

  const viewport = matrix.viewport ?? DEFAULT_VIEWPORT;

  /**
   * De meetviewport van één variant.
   *
   * Normaal geldt `matrix.viewport` voor de hele matrix. Een component met
   * layouts die elkaar per viewport aflossen heeft dat niet genoeg: de
   * large-layout van PageHeader is onder 64em `display: none` en levert op 360
   * niets op om te meten. Zo'n matrix zet `viewports` neer en wijst met
   * `viewportAxis` de as aan die ertussen kiest, en dan meet elke variant op
   * zijn eigen breedte.
   */
  const viewportFor = (combination) => {
    if (!matrix.viewports) {
      return { ...viewport, wrapperStyle: matrix.wrapperStyle };
    }

    const key = combination[matrix.viewportAxis];
    const entry = matrix.viewports[key];
    if (!entry) {
      throw new Error(
        `${matrix.component}: geen viewport voor ${matrix.viewportAxis}=${key}; bekende waarden: ${Object.keys(matrix.viewports).join(', ')}`
      );
    }

    return {
      width: entry.width,
      height: entry.height ?? viewport.height,
      wrapperStyle: entry.wrapperStyle ?? matrix.wrapperStyle,
    };
  };

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport });

  // De tokenlezer gaat als tekst de pagina in. Hij wordt per variant opnieuw
  // geïnstalleerd: `setContent` vervangt de stylesheets, en de lezer bouwt
  // daar bij het eerste gebruik een cascade-index van.
  const installTokenReader = `window.__dsnReadTokenSources = (${createTokenReader.toString()})(${JSON.stringify(TRACKED_PROPERTIES)});`;

  // `skipVariant` laat combinaties weg die niets betekenen: een uitgeschakelde
  // knop heeft geen hover. Zie `flags.js`.
  const combinations = cartesian(matrix.axes ?? {}).filter(
    (combination) => !matrix.skipVariant?.(combination)
  );
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
    const variantViewport = viewportFor(combination);

    // Alleen zetten als hij verandert: elke setViewportSize dwingt een
    // herberekening van de layout af.
    const current = page.viewportSize();
    if (
      current.width !== variantViewport.width ||
      current.height !== variantViewport.height
    ) {
      await page.setViewportSize({
        width: variantViewport.width,
        height: variantViewport.height,
      });
    }

    const wrapperStyle = extraWidth
      ? `${variantViewport.wrapperStyle ?? ''};width:${variantViewport.width + extraWidth}px`
      : (variantViewport.wrapperStyle ?? '');

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

    // Waar de muis heen moet. Standaard het midden van de root, en dat werkt
    // zolang de root zelf de stijl draagt. Bij CheckboxOption niet: de
    // hover-stijl hangt aan het `<input>`, dat over de control heen ligt,
    // terwijl het midden van de root in de labeltekst valt. Een input is een
    // sibling van de control en geen ancestor, dus hoveren op de tekst levert
    // daar helemaal geen toestand op. `pseudoTarget` richt de muis dan op de
    // laag die de toestand wél heeft.
    const target = matrix.pseudoTarget
      ? `[data-figma-root] ${matrix.pseudoTarget}`
      : '[data-figma-root]';

    if (pseudo === 'hover') await page.hover(target);
    // `:focus-visible` ontstaat alleen bij toetsenbordfocus; een
    // programmatische `.focus()` zet hem in Chromium niet. Tab landt op het
    // eerste focusbare element, dus een matrix met een focus-as hoort er maar
    // één te renderen.
    if (pseudo === 'focus') await page.keyboard.press('Tab');
    // `:active` is geen toestand die je kunt zetten: er moet een muisknop
    // ingedrukt staan boven het element. In de browser geldt dan ook `:hover`,
    // en de CSS rekent daarop (`:hover` eerst, `:active` erna), dus dit is
    // precies wat een gebruiker ziet tijdens het klikken.
    if (pseudo === 'active') {
      await page.hover(target);
      await page.mouse.down();
    }

    await page.evaluate(installTokenReader);

    const tree = await page.evaluate(domWalker, [
      CAPTURED_PROPERTIES,
      VISUALLY_HIDDEN_CLASS,
    ]);

    // De knop weer los. Een ingedrukte muisknop blijft tussen varianten staan,
    // net als de cursorpositie, en dan meet alles na een active-variant ook
    // als active.
    if (pseudo === 'active') await page.mouse.up();

    return tree;
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

      results.push({
        variant: combination,
        tree,
        wideTree,
        // Welke index de bindingen van deze variant moeten gebruiken: de modes
        // van `dsn/Density` hangen aan de gemeten breedte.
        viewportWidth: viewportFor(combination).width,
      });
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
