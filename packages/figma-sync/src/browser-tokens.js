/**
 * Leest uit welk token een computed waarde kwam.
 *
 * De extractor meet de *uitgerekende* waarde (`rgb(27, 89, 164)`), maar voor
 * een Figma-binding is de *naam* nodig (`--dsn-button-strong-background-color`).
 * Die naam staat alleen in de authored CSS, dus die kant moet wel via de CSSOM.
 *
 * Let op het verschil met CSS parsen als vervanging van meten: hier wordt de
 * gemeten waarde niet vervangen, alleen van een herkomst voorzien. Klopt de
 * herkomst niet, dan valt dat om in de verificatie in `bindings.js` (waarde van
 * het token tegenover de gemeten waarde) en wordt er niet gebonden.
 *
 * Deze module wordt als tekst de browser in geschoten (`Function.prototype
 * .toString`), dus alles moet binnen de factory staan: imports en closures over
 * modulescope overleven die oversteek niet.
 */

/**
 * Longhands waarvan de herkomst wordt bijgehouden. Alles wat hier niet in staat
 * kan nooit gebonden worden.
 */
export const TRACKED_PROPERTIES = [
  'background-color',
  'color',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'border-top-width',
  'border-right-width',
  'border-bottom-width',
  'border-left-width',
  'border-top-left-radius',
  'border-top-right-radius',
  'border-bottom-right-radius',
  'border-bottom-left-radius',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'row-gap',
  'column-gap',
  'font-size',
];

/**
 * Bouwt de lezer die in de browser draait.
 *
 * @returns {(element: Element) => Record<string, {chain: string[], value: string}>}
 */
/* c8 ignore start - draait in de browsercontext, niet in Node */
export function createTokenReader(trackedProperties) {
  const TRACKED = new Set(trackedProperties);

  /** Properties die overerven; zonder eigen declaratie telt die van de ouder. */
  const INHERITED = new Set(['color', 'font-size']);

  const BORDER_STYLES = new Set([
    'none',
    'hidden',
    'dotted',
    'dashed',
    'solid',
    'double',
    'groove',
    'ridge',
    'inset',
    'outset',
  ]);

  const BORDER_WIDTH_KEYWORDS = new Set(['thin', 'medium', 'thick']);

  // ===========================================================================
  // TEKST-HULPJES
  // ===========================================================================

  /**
   * Splitst op een scheidingsteken buiten haakjes en quotes.
   * `var(--a, 1px) solid` mag niet middenin een var() uit elkaar vallen.
   */
  function splitTop(input, separator) {
    const parts = [];
    let depth = 0;
    let quote = null;
    let current = '';

    for (const char of String(input)) {
      if (quote) {
        current += char;
        if (char === quote) quote = null;
        continue;
      }
      if (char === '"' || char === "'") {
        quote = char;
        current += char;
        continue;
      }
      if (char === '(') depth += 1;
      if (char === ')') depth -= 1;

      const isSeparator =
        depth === 0 &&
        (separator === ' ' ? /\s/.test(char) : char === separator);
      if (isSeparator) {
        parts.push(current);
        current = '';
        continue;
      }
      current += char;
    }
    parts.push(current);
    return parts.map((part) => part.trim()).filter(Boolean);
  }

  /**
   * Specificiteit van één selector-tak.
   *
   * Benadering, geen volledige implementatie: `:is()` en `:has()` tellen hun
   * argumenten mee in plaats van het maximum te nemen. Die komen in dit design
   * system niet voor, en een misrekening kan hier geen verkeerde binding
   * opleveren: de gekozen kandidaat wordt in `bindings.js` alsnog tegen de
   * gemeten waarde gehouden.
   */
  function specificityOf(selector) {
    let rest = selector.replace(/:where\([^)]*\)/g, '');
    rest = rest.replace(/:(?:is|not|has|matches|any)\(/g, '(');

    const ids = rest.match(/#[\w-]+/g) ?? [];
    rest = rest.replace(/#[\w-]+/g, '');

    const pseudoElements = rest.match(/::[\w-]+/g) ?? [];
    rest = rest.replace(/::[\w-]+/g, '');

    const classes = rest.match(/\.[\w-]+/g) ?? [];
    const attributes = rest.match(/\[[^\]]*\]/g) ?? [];
    const pseudoClasses = rest.match(/:[\w-]+/g) ?? [];
    rest = rest.replace(/\.[\w-]+|\[[^\]]*\]|:[\w-]+/g, '');

    const elements = rest.match(/[a-zA-Z][\w-]*/g) ?? [];

    return (
      ids.length * 10000 +
      (classes.length + attributes.length + pseudoClasses.length) * 100 +
      (elements.length + pseudoElements.length)
    );
  }

  /**
   * Leest de authored declaraties uit een regel.
   *
   * Niet via `rule.style.getPropertyValue`: zodra een shorthand een `var()`
   * bevat stelt de browser de expansie uit, en geven de longhands een lege
   * string terug. De shorthand-tekst zelf staat wel nog in `cssText`.
   */
  function parseDeclarations(cssText) {
    const declarations = [];

    for (const part of splitTop(cssText, ';')) {
      const colon = part.indexOf(':');
      if (colon < 1) continue;

      const rawName = part.slice(0, colon).trim();
      // Custom properties zijn hoofdlettergevoelig, gewone properties niet.
      const name = rawName.startsWith('--') ? rawName : rawName.toLowerCase();

      let value = part.slice(colon + 1).trim();
      const important = /!\s*important$/i.test(value);
      if (important) value = value.replace(/!\s*important$/i, '').trim();

      declarations.push({ name, value, important });
    }

    return declarations;
  }

  // ===========================================================================
  // SHORTHAND-EXPANSIE
  // ===========================================================================

  /**
   * `1px 2px` -> [boven, rechts, onder, links].
   * Werkt ook voor de hoeken van border-radius, die dezelfde 1-2-3-4-regel
   * volgen (linksboven, rechtsboven, rechtsonder, linksonder).
   */
  function fourValues(parts) {
    const [a, b = a, c = a, d = b] = parts;
    return [a, b, c, d];
  }

  /** Fysieke naam van een logische zijde, binnen writing-mode horizontal-tb. */
  function physicalSides(direction) {
    const rtl = direction === 'rtl';
    return {
      'block-start': 'top',
      'block-end': 'bottom',
      'inline-start': rtl ? 'right' : 'left',
      'inline-end': rtl ? 'left' : 'right',
    };
  }

  /** Fysieke hoek van een logische hoeknaam (`start-start` -> `top-left`). */
  function physicalCorners(direction) {
    const sides = physicalSides(direction);
    const corner = (block, inline) =>
      `${sides[`block-${block}`]}-${sides[`inline-${inline}`]}`;
    return {
      'start-start': corner('start', 'start'),
      'start-end': corner('start', 'end'),
      'end-start': corner('end', 'start'),
      'end-end': corner('end', 'end'),
    };
  }

  /**
   * `border: var(--w) solid var(--c)` -> width- en color-longhands.
   *
   * De grammatica staat elke volgorde toe, dus wat geen stijl-keyword is wordt
   * eerst op vorm geclassificeerd (een getal is een breedte, een kleurnaam een
   * kleur). Wat dan nog een kale `var()` is, wordt op naam geplaatst
   * (`-width` / `-color`) en anders in de gebruikelijke volgorde.
   * Een verkeerde gok kan geen verkeerde binding worden: `bindings.js` eist dat
   * het variable-type bij het veld past.
   */
  function expandBorder(sides, value) {
    const slots = { width: null, color: null };
    const pending = [];

    for (const part of splitTop(value, ' ')) {
      const lower = part.toLowerCase();
      if (BORDER_STYLES.has(lower)) continue;

      if (/^var\(/i.test(part)) {
        pending.push(part);
        continue;
      }
      if (/^-?[\d.]/.test(part) || BORDER_WIDTH_KEYWORDS.has(lower)) {
        slots.width = part;
        continue;
      }
      slots.color = part;
    }

    for (const part of pending) {
      const named = /--[\w-]*-width\s*[,)]/.test(part)
        ? 'width'
        : /--[\w-]*-color\s*[,)]/.test(part)
          ? 'color'
          : null;
      const slot = named ?? (slots.width === null ? 'width' : 'color');
      if (slots[slot] === null) slots[slot] = part;
    }

    const expanded = [];
    for (const side of sides) {
      if (slots.width) expanded.push([`border-${side}-width`, slots.width]);
      if (slots.color) expanded.push([`border-${side}-color`, slots.color]);
    }
    return expanded;
  }

  const ALL_SIDES = ['top', 'right', 'bottom', 'left'];
  const ALL_CORNERS = ['top-left', 'top-right', 'bottom-right', 'bottom-left'];

  /**
   * Zet één authored declaratie om naar de longhands die wij volgen.
   * @returns {Array<[string, string]>}
   */
  function expand(name, value, direction) {
    const sides = physicalSides(direction);
    const corners = physicalCorners(direction);
    const parts = splitTop(value, ' ');

    // -- padding --------------------------------------------------------------
    if (name === 'padding') {
      return fourValues(parts).map((part, index) => [
        `padding-${ALL_SIDES[index]}`,
        part,
      ]);
    }
    if (name === 'padding-block' || name === 'padding-inline') {
      const axis = name.slice('padding-'.length);
      const [start, end = start] = parts;
      return [
        [`padding-${sides[`${axis}-start`]}`, start],
        [`padding-${sides[`${axis}-end`]}`, end],
      ];
    }
    const paddingLogical = name.match(
      /^padding-((?:block|inline)-(?:start|end))$/
    );
    if (paddingLogical) {
      return [[`padding-${sides[paddingLogical[1]]}`, value]];
    }

    // -- border-radius --------------------------------------------------------
    if (name === 'border-radius') {
      // De elliptische vorm (`10px / 20px`) heeft twee radii per hoek; Figma
      // kent er maar één, dus daar valt niets te binden.
      if (value.includes('/')) return [];
      return fourValues(parts).map((part, index) => [
        `border-${ALL_CORNERS[index]}-radius`,
        part,
      ]);
    }
    const cornerLogical = name.match(
      /^border-((?:start|end)-(?:start|end))-radius$/
    );
    if (cornerLogical) {
      return [[`border-${corners[cornerLogical[1]]}-radius`, value]];
    }

    // -- border ---------------------------------------------------------------
    if (name === 'border') return expandBorder(ALL_SIDES, value);
    if (name === 'border-width' || name === 'border-color') {
      const slot = name.slice('border-'.length);
      return fourValues(parts).map((part, index) => [
        `border-${ALL_SIDES[index]}-${slot}`,
        part,
      ]);
    }
    const borderSide = name.match(/^border-(top|right|bottom|left)$/);
    if (borderSide) return expandBorder([borderSide[1]], value);

    const borderLogicalAxis = name.match(/^border-(block|inline)$/);
    if (borderLogicalAxis) {
      const axis = borderLogicalAxis[1];
      return expandBorder(
        [sides[`${axis}-start`], sides[`${axis}-end`]],
        value
      );
    }
    const borderLogicalSide = name.match(
      /^border-((?:block|inline)-(?:start|end))(-(?:width|color))?$/
    );
    if (borderLogicalSide) {
      const side = sides[borderLogicalSide[1]];
      if (!borderLogicalSide[2]) return expandBorder([side], value);
      return [[`border-${side}${borderLogicalSide[2]}`, value]];
    }

    // -- gap ------------------------------------------------------------------
    if (name === 'gap') {
      const [row, column = row] = parts;
      return [
        ['row-gap', row],
        ['column-gap', column],
      ];
    }

    return TRACKED.has(name) ? [[name, value]] : [];
  }

  // ===========================================================================
  // CASCADE
  // ===========================================================================

  let rules = null;

  /** Alle style rules in documentvolgorde, media queries meegerekend. */
  function collectRules() {
    const collected = [];

    const visit = (list) => {
      for (const rule of list) {
        if (
          typeof CSSMediaRule !== 'undefined' &&
          rule instanceof CSSMediaRule
        ) {
          if (matchMedia(rule.conditionText).matches) visit(rule.cssRules);
          continue;
        }
        if (
          typeof CSSSupportsRule !== 'undefined' &&
          rule instanceof CSSSupportsRule
        ) {
          if (CSS.supports(rule.conditionText)) visit(rule.cssRules);
          continue;
        }
        if (rule.cssRules && !rule.selectorText) {
          // @layer en andere groeperende at-rules: gewoon doorlopen.
          visit(rule.cssRules);
          continue;
        }
        if (!rule.selectorText) continue;
        collected.push({
          selectorText: rule.selectorText,
          declarations: parseDeclarations(rule.style.cssText),
        });
      }
    };

    for (const sheet of document.styleSheets) {
      // Een cross-origin stylesheet (de webfont-CDN) laat zich niet uitlezen.
      try {
        visit(sheet.cssRules);
      } catch {
        continue;
      }
    }

    return collected;
  }

  const winnerCache = new WeakMap();

  /**
   * De winnende declaratie per longhand voor één element.
   *
   * Volgorde zoals de cascade: `!important` eerst, dan specificiteit, dan
   * documentvolgorde. Alle regels hebben dezelfde origin (author), dus verder
   * speelt er niets mee.
   */
  function winnersFor(element) {
    const cached = winnerCache.get(element);
    if (cached) return cached;

    if (!rules) rules = collectRules();
    const direction = getComputedStyle(element).direction;
    const winners = new Map();

    let order = 0;
    const beats = (rank, previous) => {
      for (let index = 0; index < rank.length; index += 1) {
        if (rank[index] !== previous[index])
          return rank[index] > previous[index];
      }
      return false;
    };
    const consider = (name, value, important, specificity) => {
      order += 1;
      const rank = [important ? 1 : 0, specificity, order];
      const previous = winners.get(name);
      if (previous && !beats(rank, previous.rank)) return;
      winners.set(name, { value, rank });
    };

    const apply = (declarations, specificity) => {
      for (const declaration of declarations) {
        if (declaration.name.startsWith('--')) {
          consider(
            declaration.name,
            declaration.value,
            declaration.important,
            specificity
          );
          continue;
        }
        for (const [longhand, value] of expand(
          declaration.name,
          declaration.value,
          direction
        )) {
          if (!TRACKED.has(longhand)) continue;
          consider(longhand, value, declaration.important, specificity);
        }
      }
    };

    for (const rule of rules) {
      let specificity = -1;
      for (const branch of splitTop(rule.selectorText, ',')) {
        try {
          if (!element.matches(branch)) continue;
        } catch {
          continue;
        }
        specificity = Math.max(specificity, specificityOf(branch));
      }
      if (specificity < 0) continue;
      apply(rule.declarations, specificity);
    }

    // Een style-attribuut wint van elke selector.
    if (element.getAttribute('style')) {
      apply(parseDeclarations(element.style.cssText), 1000000);
    }

    winnerCache.set(element, winners);
    return winners;
  }

  /** Waarde van een custom property: eigen declaratie, anders die van een voorouder. */
  function customPropertyValue(element, name) {
    for (let node = element; node; node = node.parentElement) {
      const found = winnersFor(node).get(name);
      if (found) return found.value;
    }
    return null;
  }

  /**
   * Volgt `var(--a)` -> `--a: var(--b)` tot de keten ophoudt.
   *
   * Alleen een waarde die *helemaal* uit één `var()` bestaat telt mee. Een
   * `calc(var(--a) + var(--b))` combineert twee tokens en heeft geen enkele
   * variable die de waarde kan leveren; die hoort in het report, niet in een
   * binding.
   */
  function chainFor(element, value) {
    const chain = [];
    let current = value;

    for (let guard = 0; guard < 10; guard += 1) {
      const match = String(current)
        .trim()
        .match(/^var\(\s*--([A-Za-z0-9_-]+)\s*(?:,[\s\S]*)?\)$/);
      if (!match) break;

      const name = match[1];
      if (chain.includes(name)) break;
      chain.push(name);

      const next = customPropertyValue(element, `--${name}`);
      if (next === null) break;
      current = next;
    }

    return chain;
  }

  /**
   * Herkomst van elke gevolgde property op dit element.
   * @returns {Record<string, {chain: string[], value: string}>}
   */
  return function readTokenSources(element) {
    const sources = {};

    for (const property of TRACKED) {
      let owner = element;
      let winner = winnersFor(owner).get(property);

      while (!winner && INHERITED.has(property) && owner.parentElement) {
        owner = owner.parentElement;
        winner = winnersFor(owner).get(property);
      }
      if (!winner) continue;

      sources[property] = {
        chain: chainFor(owner, winner.value),
        value: winner.value,
      };
    }

    return sources;
  };
}
/* c8 ignore stop */
