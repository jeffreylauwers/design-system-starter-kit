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
  // Alleen gelezen om FILL te herkennen: een kind met `flex: 1` in een rij
  // vult de rest van die rij, zoals de kop in de header van ModalDialog.
  'flexGrow',
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
  'minWidth',
  'minHeight',
  'backgroundColor',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'borderTopColor',
  'borderRightColor',
  'borderBottomColor',
  'borderLeftColor',
  // Per zijde, niet de shorthand: bij verschillende randen geeft de browser
  // daar "none none none solid" terug en is er niets uit af te leiden.
  'borderTopStyle',
  'borderRightStyle',
  'borderBottomStyle',
  'borderLeftStyle',
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
  // `transform` wordt alleen gelezen om er een rotatie uit te halen, zoals de
  // chevron van Details die omklapt zodra het paneel open staat. Zie
  // `rotationFrom` in to-figma.js.
  'transform',
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

  const readStyles = (element, pseudo = null) => {
    const computed = getComputedStyle(element, pseudo);
    const result = {};
    for (const property of properties) result[property] = computed[property];
    return result;
  };

  const px = (value) => Number.parseFloat(value) || 0;
  const round = (value) => Math.round(value * 100) / 100;

  // ---------------------------------------------------------------------------
  // Markers van lijsten
  //
  // `::marker` is een pseudo-element en dus geen DOM-node, maar wel een stuk
  // van wat de gebruiker ziet. Hier wordt het een laag: het list item wordt een
  // rij met een markerkolom en de tekst ernaast. Die kolom staat in de browser
  // in de `padding-inline-start` van de lijst, dus die padding verhuist naar
  // het item, als `minWidth` van de kolom en met hetzelfde token.
  // ---------------------------------------------------------------------------

  // `list-style-type` -> het teken dat de browser zet. Alleen wat het design
  // system gebruikt plus de gangbare buren; iets anders levert een melding op
  // in plaats van een verzonnen teken.
  const SYMBOLS = { disc: '•', circle: '◦', square: '▪' };
  const roman = (value) => {
    const table = [
      [1000, 'm'],
      [900, 'cm'],
      [500, 'd'],
      [400, 'cd'],
      [100, 'c'],
      [90, 'xc'],
      [50, 'l'],
      [40, 'xl'],
      [10, 'x'],
      [9, 'ix'],
      [5, 'v'],
      [4, 'iv'],
      [1, 'i'],
    ];
    let rest = value;
    let out = '';
    for (const [amount, letters] of table) {
      while (rest >= amount) {
        out += letters;
        rest -= amount;
      }
    }
    return out;
  };
  const alpha = (value) => {
    let rest = value;
    let out = '';
    while (rest > 0) {
      rest -= 1;
      out = String.fromCharCode(97 + (rest % 26)) + out;
      rest = Math.floor(rest / 26);
    }
    return out;
  };
  const ORDINALS = {
    decimal: (n) => `${n}`,
    'decimal-leading-zero': (n) => (n < 10 && n >= 0 ? `0${n}` : `${n}`),
    'lower-roman': roman,
    'upper-roman': (n) => roman(n).toUpperCase(),
    'lower-alpha': alpha,
    'lower-latin': alpha,
    'upper-alpha': (n) => alpha(n).toUpperCase(),
    'upper-latin': (n) => alpha(n).toUpperCase(),
  };

  const isListItem = (element) =>
    element?.nodeType === Node.ELEMENT_NODE &&
    getComputedStyle(element).display === 'list-item';

  // Een marker die we tekenen: een list item met een teken buiten de tekst.
  // `inside` en `list-style-image` horen bij de tekst zelf en blijven buiten
  // beschouwing; die zijn in dit design system ook niet in gebruik.
  const hasOutsideMarker = (element) => {
    if (!isListItem(element)) return false;
    const computed = getComputedStyle(element);
    return (
      computed.listStyleType !== 'none' &&
      computed.listStylePosition === 'outside' &&
      computed.listStyleImage === 'none'
    );
  };

  // Het rangnummer zoals de browser het telt: `start` en `reversed` op de
  // lijst, `value` op een item. De computed style geeft de teller niet prijs.
  const ordinalOf = (element) => {
    const list = element.parentElement;
    const items = Array.from(list?.children ?? []).filter(isListItem);
    const reversed = list?.tagName === 'OL' && list.reversed;
    const start =
      list?.tagName === 'OL' && list.hasAttribute('start')
        ? list.start
        : reversed
          ? items.length
          : 1;
    let value = start;
    for (const [index, item] of items.entries()) {
      if (item.hasAttribute('value'))
        value = Number(item.getAttribute('value'));
      else if (index > 0) value += reversed ? -1 : 1;
      if (item === element) return value;
    }
    return start;
  };

  const markerTextOf = (element) => {
    const type = getComputedStyle(element).listStyleType;
    if (SYMBOLS[type]) return SYMBOLS[type];
    const format = ORDINALS[type];
    return format ? `${format(ordinalOf(element))}.` : null;
  };

  // Breedte van een stuk tekst in de stijl van de marker. Een spatie telt
  // alleen mee met `white-space: pre`.
  const textWidth = (element, text) => {
    const probe = document.createElement('span');
    const marker = getComputedStyle(element, '::marker');
    probe.style.cssText = `position:absolute;visibility:hidden;white-space:pre;font-family:${marker.fontFamily};font-size:${marker.fontSize};font-weight:${marker.fontWeight};font-style:${marker.fontStyle};letter-spacing:${marker.letterSpacing}`;
    probe.textContent = text;
    document.body.appendChild(probe);
    const width = probe.getBoundingClientRect().width;
    probe.remove();
    return width;
  };

  // De inspringing waar de marker van een item in staat: de padding aan de
  // inline-start van zijn lijst.
  const indentOf = (element) =>
    px(getComputedStyle(element.parentElement).paddingLeft);

  // De lijsten waar de root van de matrix in genest staat. Een item op het
  // tweede niveau staat in de markerkolom van het item erboven; dat is de
  // inspringing die het geneste item in Figma zelf moet dragen.
  const ancestorItems = (element) => {
    const found = [];
    for (
      let node = element.parentElement;
      node && node !== document.body;
      node = node.parentElement
    ) {
      if (hasOutsideMarker(node)) found.unshift(node);
    }
    return found;
  };

  const rootIndents =
    hasOutsideMarker(root) && getComputedStyle(root).direction === 'ltr'
      ? [...ancestorItems(root), root].map(indentOf)
      : [];

  // De root begint in Figma waar zijn markerkolom begint, dus de oorsprong
  // schuift mee naar links.
  const rootRect = root.getBoundingClientRect();
  const origin = {
    x: rootRect.x - rootIndents.reduce((sum, value) => sum + value, 0),
    y: rootRect.y,
  };

  // Stijlen voor een laag die de walker zelf maakt: alles neutraal, behalve
  // wat de laag moet doen.
  const neutralStyles = (base, overrides) => ({
    ...base,
    display: 'block',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: '0px',
    rowGap: '0px',
    columnGap: '0px',
    alignItems: 'normal',
    justifyContent: 'normal',
    alignSelf: 'auto',
    flexGrow: '0',
    paddingTop: '0px',
    paddingRight: '0px',
    paddingBottom: '0px',
    paddingLeft: '0px',
    minWidth: 'auto',
    minHeight: 'auto',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    borderTopWidth: '0px',
    borderRightWidth: '0px',
    borderBottomWidth: '0px',
    borderLeftWidth: '0px',
    borderTopStyle: 'none',
    borderRightStyle: 'none',
    borderBottomStyle: 'none',
    borderLeftStyle: 'none',
    borderTopLeftRadius: '0px',
    borderTopRightRadius: '0px',
    borderBottomLeftRadius: '0px',
    borderBottomRightRadius: '0px',
    opacity: '1',
    boxShadow: 'none',
    position: 'static',
    overflow: 'visible',
    transform: 'none',
    ...overrides,
  });

  /**
   * Maakt van een list item een rij: [inspringing...] [marker] [inhoud].
   *
   * Werkt op de al gemeten node. De markerkolom is precies de inspringing van
   * de lijst breed (een `minWidth` met het token van die padding), de marker
   * staat er rechts in, met de ruimte van een spatie tot de tekst. Zo zet de
   * browser hem ook: het teken plus een spatie, tegen de tekst aan.
   */
  const withMarker = (element, node, indents) => {
    const text = markerTextOf(element);
    if (text === null) {
      node.notes = [
        ...(node.notes ?? []),
        `list-style-type ${getComputedStyle(element).listStyleType} kent de generator niet, de marker is weggelaten`,
      ];
      return;
    }
    if (getComputedStyle(element).direction !== 'ltr') {
      node.notes = [
        ...(node.notes ?? []),
        'een marker in een rechts-naar-links lijst wordt nog niet getekend',
      ];
      return;
    }

    const own = indents[indents.length - 1];
    const before = indents.slice(0, -1);
    const total = indents.reduce((sum, value) => sum + value, 0);
    const lineHeight =
      px(node.styles.lineHeight) || px(node.styles.fontSize) * 1.2;
    // Los gemeten en niet als verschil tussen "1. " en "1.": dat verschil
    // hangt van de kerning met het teken ervoor af, en dan zou elk item een
    // net iets andere padding krijgen en elke instance een override.
    const space = round(textWidth(element, ' '));

    const markerStyles = readStyles(element, '::marker');
    const parentTokens = window.__dsnReadTokenSources(element.parentElement);

    const x = node.rect.x - total;
    const ancestors = ancestorItems(element);
    // Het padding-token van de lijst waar het item op niveau `index` in staat.
    const indentToken = (index) =>
      window.__dsnReadTokenSources(ancestors[index].parentElement)[
        'padding-left'
      ];

    const marker = {
      tag: 'marker',
      classes: [],
      synthetic: 'marker',
      rect: {
        x: round(x + before.reduce((s, v) => s + v, 0)),
        y: node.rect.y,
        width: round(Math.max(own, textWidth(element, `${text} `))),
        height: round(lineHeight),
      },
      styles: neutralStyles(node.styles, {
        display: 'inline-flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
        paddingRight: `${space}px`,
        minWidth: `${own}px`,
      }),
      tokens: parentTokens['padding-left']
        ? { 'min-width': parentTokens['padding-left'] }
        : {},
      slot: null,
      instance: null,
      instanceVariant: null,
      children: [
        {
          kind: 'text',
          text,
          slot: element.dataset.figmaMarkerSlot || null,
          textStyles: {
            ...node.styles,
            ...markerStyles,
            lineHeight:
              markerStyles.lineHeight === 'normal'
                ? node.styles.lineHeight
                : markerStyles.lineHeight,
            textAlign: 'right',
          },
          textTokens: window.__dsnReadTokenSources(element, '::marker'),
        },
      ],
    };

    // Meer dan één kind (tekst met een link erin, een geneste lijst) gaat in
    // een eigen blok naast de marker, zodat het samen afbreekt en de marker bij
    // de eerste regel blijft.
    const content =
      node.children.length > 1
        ? [
            {
              tag: 'content',
              classes: [],
              synthetic: 'content',
              rect: { ...node.rect },
              styles: neutralStyles(node.styles, { flexGrow: '1' }),
              tokens: node.tokens,
              slot: null,
              instance: null,
              instanceVariant: null,
              children: node.children,
            },
          ]
        : node.children;

    // Een rij: marker en inhoud naast elkaar, bovenaan uitgelijnd zodat de
    // marker bij de eerste regel blijft.
    const row = {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'nowrap',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      gap: '0px',
      rowGap: '0px',
      columnGap: '0px',
    };

    // De inspringing van de lijsten erboven. De eerste is de padding van het
    // item zelf; elk volgend niveau is een frame om marker en inhoud heen, met
    // de padding van zijn lijst. Zo staat elk niveau aan zijn eigen token, en
    // heeft elke laag inhoud om om te huggen: een lege laag die alleen uit
    // padding bestaat hugt in Figma niet, en bleef daar 100 bij 100.
    let children = [marker, ...content];
    for (let index = before.length - 1; index >= 1; index -= 1) {
      const start = x + before.slice(0, index).reduce((s, v) => s + v, 0);
      const token = indentToken(index);
      children = [
        {
          tag: 'indent',
          classes: [],
          synthetic: 'indent',
          rect: {
            x: round(start),
            y: node.rect.y,
            width: round(x + node.rect.width + total - start),
            height: node.rect.height,
          },
          styles: neutralStyles(node.styles, {
            ...row,
            flexGrow: '1',
            paddingLeft: `${before[index]}px`,
          }),
          tokens: token ? { 'padding-left': token } : {},
          slot: null,
          instance: null,
          instanceVariant: null,
          children,
        },
      ];
    }

    node.styles = { ...node.styles, ...row };
    node.rect = {
      ...node.rect,
      x: round(x),
      width: round(node.rect.width + total),
    };
    if (before.length) {
      const token = indentToken(0);
      node.styles.paddingLeft = `${before[0]}px`;
      node.tokens = { ...node.tokens };
      if (token) node.tokens['padding-left'] = token;
      else delete node.tokens['padding-left'];
    }
    node.children = children;
    node.drawsMarker = true;
  };

  // Alleen deze velden tekenen een `::placeholder`. Een `type="date"` of
  // `type="time"` toont zijn formaathint (`dd-mm-jjjj`) in de tekstkleur van
  // het veld zelf, dus daar gelden de stijl en tokens van het element.
  const PLACEHOLDER_TYPES = new Set([
    'text',
    'search',
    'email',
    'tel',
    'url',
    'password',
    'number',
  ]);
  const showsPlaceholder = (element) =>
    element.tagName === 'TEXTAREA' ||
    (element.tagName === 'INPUT' && PLACEHOLDER_TYPES.has(element.type));

  // De stijl van `::placeholder`, op de stijl van het veld. Chromium geeft
  // voor een pseudo-element soms `line-height: normal` terug terwijl de tekst
  // de regelhoogte van het veld gebruikt; die komt dan van het veld.
  const placeholderStyles = (element) => {
    const own = readStyles(element);
    const pseudo = readStyles(element, '::placeholder');
    return {
      ...own,
      ...pseudo,
      lineHeight:
        pseudo.lineHeight === 'normal' ? own.lineHeight : pseudo.lineHeight,
    };
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
      // De laag waar straks een component property aan hangt. De matrix zet
      // dit attribuut; zonder markering in de markup zou de plugin de laag op
      // klassenaam moeten raden, en dat breekt zodra de markup verandert.
      slot: element.dataset.figmaSlot || null,
      // Een subboom die een ander component ís. Normaal herkent de generator
      // dat zelf aan de blokklasse (`dsn-checkbox` in een CheckboxOption);
      // deze twee attributen zijn er voor wat daar niet uit te lezen is. Zie
      // "Geneste componenten" in de README.
      instance: element.dataset.figmaInstance || null,
      instanceVariant: element.dataset.figmaVariant || null,
      // De kinderen van dit element komen in een Figma-slot, zodat een
      // designer er zelf items of opties bij zet of uit haalt. De waarde is de
      // naam van het slot. Zie "Slots" in de README.
      contentSlot: element.dataset.figmaChildren || null,
      children: [],
    };

    // Een tekstveld heeft geen tekst in de DOM: een ingevulde waarde is een
    // eigenschap van het element, en een placeholder een pseudo-element. Er
    // valt dus niets af te lopen. De matrix zegt met `data-figma-value` of
    // `data-figma-placeholder` welke tekst er staat, en die wordt hier een
    // tekstlaag in het contentvlak van het veld.
    //
    // Een waarde wint van een placeholder, net als in de browser. De
    // placeholder krijgt de stijl en de tokens van `::placeholder`; een waarde
    // die van het veld zelf, en die erft de tekstlaag al van zijn ouder.
    const fieldText =
      element.dataset.figmaValue ?? element.dataset.figmaPlaceholder;
    if (fieldText !== undefined) {
      const isValue = element.dataset.figmaValue !== undefined;
      const computed = getComputedStyle(element);
      const px = (value) => Number.parseFloat(value) || 0;
      const left = px(computed.borderLeftWidth) + px(computed.paddingLeft);
      const top = px(computed.borderTopWidth) + px(computed.paddingTop);
      const width =
        rect.width -
        left -
        px(computed.borderRightWidth) -
        px(computed.paddingRight);
      const lineHeight = px(computed.lineHeight) || px(computed.fontSize) * 1.2;

      node.children.push({
        kind: 'text',
        text: fieldText,
        slot: isValue ? 'value' : 'placeholder',
        rect: {
          x: Math.round((node.rect.x + left) * 100) / 100,
          y: Math.round((node.rect.y + top) * 100) / 100,
          width: Math.round(width * 100) / 100,
          height: Math.round(lineHeight * 100) / 100,
        },
        ...(isValue || !showsPlaceholder(element)
          ? {}
          : {
              textStyles: placeholderStyles(element),
              textTokens: window.__dsnReadTokenSources(
                element,
                '::placeholder'
              ),
            }),
      });
      return node;
    }

    // SVG wordt niet uitgelopen: dat wordt in Figma één vector-node.
    if (node.tag === 'svg') {
      node.kind = 'vector';
      node.svg = element.outerHTML;
      // Zonder naam heet elke icoonlaag in Figma "icon" en is een designer de
      // rest van het bestand aan het opentrekken om te zien wélk icoon het is.
      node.iconName = element.dataset.icon || null;
      return node;
    }

    // Figma zet kinderen in auto layout neer in de volgorde van de array, dus
    // die moet de visuele volgorde zijn en niet de DOM-volgorde. In een flex-
    // of grid-container verschuift `order` die, zoals bij de pre-header van
    // Card (DR-2026-11). De sortering is stabiel: gelijke `order` houdt de
    // DOM-volgorde, en tekstnodes tellen als `order: 0`, net als in de browser.
    const display = getComputedStyle(element).display;
    const ordersChildren = /flex|grid/.test(display);
    const orderOf = (child) =>
      ordersChildren && child.nodeType === Node.ELEMENT_NODE
        ? Number.parseInt(getComputedStyle(child).order, 10) || 0
        : 0;
    const childNodes = Array.from(element.childNodes)
      .map((child, index) => ({ child, index, order: orderOf(child) }))
      .sort((a, b) => a.order - b.order || a.index - b.index)
      .map(({ child }) => child);

    for (const child of childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent.trim();
        if (text) node.children.push({ kind: 'text', text });
        continue;
      }
      if (child.nodeType !== Node.ELEMENT_NODE) continue;
      if (child.classList.contains(hiddenClass)) continue;

      const childStyles = getComputedStyle(child);
      // Volledig doorzichtige elementen (zoals de native input onder een
      // custom control) leveren in Figma alleen een onzichtbare node op.
      if (childStyles.opacity === '0') continue;
      // `display: none` rendert niet, dus er is niets te meten: zonder deze
      // regel komt zo'n element als 0x0-laag in Figma terecht, mét zijn
      // kinderen eronder. Zichtbaar bij de compacte BreadcrumbNavigation, waar
      // een container query alle items op één na verbergt.
      if (childStyles.display === 'none') continue;
      // `visibility: hidden` neemt wél ruimte in maar tekent niets. Een laag
      // die alleen ruimte bezet is in Figma geen laag maar padding.
      if (childStyles.visibility === 'hidden') continue;
      // Een dichte `<details>` verbergt zijn inhoud niet met `display: none`
      // maar in een slot die de browser niet rendert: de computed display
      // blijft `block` en de drie regels hierboven vangen hem dus niet. Zonder
      // deze regel komt die inhoud als 0x0-frame in Figma terecht, en omdat
      // zo'n frame op HUG om zijn tekst heen groeit, ziet de dichte stand er
      // in Figma open uit.
      //
      // Dit staat met opzet op de tag en niet op "rect is 0x0": een `<option>`
      // in een `<select>` heeft ook geen box, en díe draagt wel de tekst en de
      // slot-markering van Select.
      if (
        element.tagName === 'DETAILS' &&
        !element.open &&
        child.tagName !== 'SUMMARY'
      ) {
        continue;
      }
      node.children.push(visit(child));
    }

    if (hasOutsideMarker(element)) {
      withMarker(
        element,
        node,
        element === root ? rootIndents : [indentOf(element)]
      );
    }

    // De inspringing van deze lijst staat nu in de markerkolom van zijn items.
    // Liet de lijst hem ook staan, dan sprong alles twee keer in.
    if (node.children.some((child) => child.drawsMarker)) {
      node.styles = { ...node.styles, paddingLeft: '0px' };
      if (node.tokens) delete node.tokens['padding-left'];
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
 * Meetviewport. Mobile-first: een small-viewport ontwerp is 360px breed, en
 * daar lossen de fluid clamps op hun ondergrens op. De gemeten typografie komt
 * daarmee overeen met de `default-mobile` mode van de Density-collection.
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
