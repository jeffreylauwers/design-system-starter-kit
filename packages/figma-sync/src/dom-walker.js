/**
 * Het deel van de meting dat in de browser draait.
 *
 * `domWalker` gaat met `page.evaluate` naar de meetpagina, en Playwright
 * stuurt daarvoor alleen de broncode van de functie mee. Hij mag dus niets
 * van buiten gebruiken: geen imports, geen andere functies uit dit bestand.
 * Wat hij nodig heeft (`CAPTURED_PROPERTIES`, `VISUALLY_HIDDEN_CLASS`) krijgt
 * hij als argument.
 */

/**
 * Eigenschappen die we uitlezen. Alles wat hier niet in staat bestaat voor de
 * generator niet, dus deze lijst is de feitelijke scope van de conversie.
 */
export const CAPTURED_PROPERTIES = [
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
  // Een blok dat met een maximale breedte in het midden staat (de inner van
  // PageHeader en PageFooter); zie `maxWidthFrom` in to-figma.js.
  'maxWidth',
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
  // Alleen gelezen om de visually-hidden techniek te herkennen, zoals het
  // label van een icon-only Button. Zie `isVisuallyHidden` in to-figma.js.
  'clipPath',
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
export const VISUALLY_HIDDEN_CLASS = 'dsn-visually-hidden';

/**
 * Loopt de DOM af binnen de browser en geeft een boom terug met per element
 * de computed styles en de positie ten opzichte van de root.
 */
/* c8 ignore start - draait in de browsercontext, niet in Node */
export function domWalker([properties, hiddenClass]) {
  const root = document.querySelector('[data-figma-root]');
  if (!root) throw new Error('geen [data-figma-root] gevonden');

  // `text-decoration` erft niet, maar de browser tekent een onderstreping wel
  // door over de tekst in een element: de `<span>` met het label van Link
  // heeft zelf `none`, en staat toch onderstreept omdat de `<a>` eromheen dat
  // is. Dit zoekt de voorouder waar de lijn vandaan komt. Een absoluut,
  // zwevend of atomair inline element (inline-block, inline-flex) krijgt
  // geen lijn van buiten, dus daar stopt het zoeken; ook bij de root, zodat
  // de wrapper van de matrix niet meetelt.
  const blocksDecoration = (style) =>
    style.position === 'absolute' ||
    style.position === 'fixed' ||
    style.float !== 'none' ||
    /^inline-(block|flex|grid|table)$/.test(style.display);

  const propagatedDecoration = (element, computed) => {
    let current = element;
    let style = computed;
    while (current !== root && !blocksDecoration(style)) {
      const parent = current.parentElement;
      if (!parent) break;
      const parentStyle = getComputedStyle(parent);
      if (parentStyle.textDecorationLine !== 'none') {
        return parentStyle.textDecorationLine;
      }
      current = parent;
      style = parentStyle;
    }
    return 'none';
  };

  // Een SVG-vorm die zijn stijl uit de CSS krijgt. Wat er per vorm meegaat:
  // de presentatie-eigenschappen die de vorm tekenen.
  const SHAPE_SELECTOR = 'circle, ellipse, line, path, polygon, polyline, rect';
  const SHAPE_STYLES = [
    ['fill', 'fill'],
    ['fillOpacity', 'fill-opacity'],
    ['stroke', 'stroke'],
    ['strokeOpacity', 'stroke-opacity'],
    ['strokeWidth', 'stroke-width'],
    ['strokeDasharray', 'stroke-dasharray'],
    ['strokeDashoffset', 'stroke-dashoffset'],
    ['strokeLinecap', 'stroke-linecap'],
    ['strokeLinejoin', 'stroke-linejoin'],
  ];
  // Lengtes staan in de computed style in px, en in een SVG-attribuut zijn
  // dat gebruikerseenheden van de viewBox: `2px` wordt `2`.
  const userUnits = (value) =>
    String(value).replace(/px/g, '').replace(/,\s*/g, ' ');

  /**
   * De vormen van een SVG die geen icoon is, met hun stijl uit de CSS.
   *
   * Een icoon draagt zijn tekening in de markup en neemt zijn kleur van
   * `currentColor`. De cirkels van Spinner niet: kleur, lijndikte en streepjes
   * staan in `spinner.css`, en `outerHTML` heeft daar niets van. Dit schrijft
   * die stijl als attributen in een kopie van de SVG, met de gemeten maat als
   * `width` en `height`, zodat Figma de lijnen meeschaalt zoals de browser.
   *
   * Per vorm gaan ook de kleuren en de lijndikte mee, met hun tokens, zodat de
   * generator de strokes per vorm kan binden. De lijndikte is wat er in beeld
   * staat: de waarde uit de CSS keer de schaal van de viewBox.
   */
  /**
   * Een cirkel met één streep (de boog van Spinner) als boogpad.
   *
   * Figma legt een streepjespatroon per bochtsegment van de vector, en een
   * cirkel bestaat daar uit vier segmenten: `47 16` werden vier korte
   * streepjes in plaats van één boog. Past er maar één streep op de omtrek,
   * dan is het een boog, en die tekent een pad zonder streepjes in elk
   * programma hetzelfde. Hij begint waar de browser een cirkel begint (rechts,
   * op drie uur) en loopt met de klok mee.
   */
  const singleDashArc = (shape, computed) => {
    if (shape.tagName.toLowerCase() !== 'circle') return null;
    const dashes = userUnits(computed.strokeDasharray).split(/\s+/).map(Number);
    if (dashes.length !== 2 || dashes.some(Number.isNaN)) return null;
    if (Number.parseFloat(computed.strokeDashoffset) !== 0) return null;

    const cx = shape.cx.baseVal.value;
    const cy = shape.cy.baseVal.value;
    const r = shape.r.baseVal.value;
    const [dash, gap] = dashes;
    if (dash + gap < 2 * Math.PI * r - 0.5 || dash >= 2 * Math.PI * r) {
      return null;
    }

    const angle = dash / r;
    const round = (value) => Math.round(value * 1000) / 1000;
    const endX = round(cx + r * Math.cos(angle));
    const endY = round(cy + r * Math.sin(angle));
    const large = angle > Math.PI ? 1 : 0;
    return `M${round(cx + r)} ${round(cy)}A${r} ${r} 0 ${large} 1 ${endX} ${endY}`;
  };

  const readShapes = (svg) => {
    const shapes = Array.from(svg.querySelectorAll(SHAPE_SELECTOR));
    if (!shapes.length) return null;

    const rect = svg.getBoundingClientRect();
    const copy = svg.cloneNode(true);
    copy.setAttribute('width', String(Math.round(rect.width * 100) / 100));
    copy.setAttribute('height', String(Math.round(rect.height * 100) / 100));
    const copies = Array.from(copy.querySelectorAll(SHAPE_SELECTOR));

    const measured = shapes.map((shape, index) => {
      const computed = getComputedStyle(shape);
      for (const [property, attribute] of SHAPE_STYLES) {
        copies[index].setAttribute(attribute, userUnits(computed[property]));
      }
      const arc = singleDashArc(shape, computed);
      if (arc) {
        const path = document.createElementNS(svg.namespaceURI, 'path');
        for (const { name, value } of copies[index].attributes) {
          if (!['cx', 'cy', 'r', 'stroke-dasharray'].includes(name)) {
            path.setAttribute(name, value);
          }
        }
        path.setAttribute('d', arc);
        copies[index].replaceWith(path);
      }
      const scale = shape.getScreenCTM()?.a ?? 1;
      return {
        name: shape.classList[0] ?? shape.tagName.toLowerCase(),
        fill: computed.fill,
        stroke: computed.stroke,
        strokeWeight:
          Math.round(Number.parseFloat(computed.strokeWidth) * scale * 100) /
          100,
        tokens: window.__dsnReadTokenSources(shape),
      };
    });

    // Pas na het meten: de attributen staan dan op de kopie.
    return { svg: copy.outerHTML, shapes: measured };
  };

  const readStyles = (element, pseudo = null) => {
    const computed = getComputedStyle(element, pseudo);
    const result = {};
    for (const property of properties) result[property] = computed[property];
    if (!pseudo && result.textDecorationLine === 'none') {
      result.textDecorationLine = propagatedDecoration(element, computed);
    }
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
      instanceProperties: element.dataset.figmaProperties || null,
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
      // Een SVG die geen icoon is (de cirkels van Spinner) krijgt zijn stijl
      // uit de CSS, en die gaat niet mee in `outerHTML`. Zie `readShapes`.
      if (!node.iconName) {
        const shapes = readShapes(element);
        if (shapes) {
          node.shapes = shapes.shapes;
          node.svg = shapes.svg;
        }
      }
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
        if (text) {
          // De breedte van de tekst zelf, zodat de generator kan nagaan of
          // een flex-item precies om zijn inhoud past (`shrinksInRow`). Bewust
          // niet `rect`: daaraan herkent de plaatsing een element.
          const range = document.createRange();
          range.selectNodeContents(child);
          const bounds = range.getBoundingClientRect();
          node.children.push({
            kind: 'text',
            text,
            textRect: { width: Math.round(bounds.width * 100) / 100 },
          });
        }
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
      // `data-figma-unwrap`: dit element komt niet als laag in Figma, zijn
      // kinderen schuiven een niveau op. Voor een wrapper die alleen voor de
      // semantiek bestaat, zoals de `<li>` om een knop in ActionGroup: in een
      // slot sleept een designer een Button, geen `<li>` met een Button erin.
      // Alleen als het element zelf niets tekent of ruimte inneemt, anders
      // verdwijnt er iets zichtbaars.
      if (child.dataset.figmaUnwrap !== undefined) {
        const drawn = [
          'paddingTop',
          'paddingRight',
          'paddingBottom',
          'paddingLeft',
          'marginTop',
          'marginRight',
          'marginBottom',
          'marginLeft',
          'borderTopWidth',
          'borderRightWidth',
          'borderBottomWidth',
          'borderLeftWidth',
        ].filter((field) => Number.parseFloat(childStyles[field]) !== 0);
        const background = childStyles.backgroundColor;
        if (background !== 'rgba(0, 0, 0, 0)' && background !== 'transparent') {
          drawn.push('backgroundColor');
        }
        if (childStyles.backgroundImage !== 'none') {
          drawn.push('backgroundImage');
        }
        if (drawn.length) {
          throw new Error(
            `data-figma-unwrap op .${child.classList[0] ?? child.tagName.toLowerCase()}, maar dat element tekent zelf iets (${drawn.join(', ')}). Weglaten zou dat uit Figma halen.`
          );
        }
        const unwrapped = visit(child);
        // Een blok met één inline kind, zoals de kop van Card met de
        // stretched link erin: het kind neemt de plek van het blok over. Een
        // inline element is zo breed als zijn tekst, dus zonder dit verloor de
        // kop zijn FILL en brak lange tekst in Figma niet meer af.
        const [only] = unwrapped.children;
        if (
          unwrapped.children.length === 1 &&
          only.rect &&
          only.styles?.display === 'inline' &&
          !childStyles.display.startsWith('inline')
        ) {
          only.rect = { ...unwrapped.rect };
        }
        node.children.push(...unwrapped.children);
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
