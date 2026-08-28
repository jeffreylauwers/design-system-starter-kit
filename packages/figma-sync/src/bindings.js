/**
 * Koppelt de gemeten eigenschappen van een node aan Figma-variables.
 *
 * Zonder deze stap krijgt een gegenereerde Button een fill van `#1b59a4` en
 * verandert er niets als de designer in Figma naar `start-dark` schakelt. Met
 * een binding wijst de laag naar `dsn/Components -> button/strong/background-
 * color`, en volgt hij de hele delegatieketen die de variables-import al legt.
 *
 * De herkomst komt uit `browser-tokens.js` (welk token leverde deze property),
 * de vertaling naar een variable uit `variable-index.js`. Wat hier gebeurt is
 * de derde stap: het veld in Figma kiezen, en controleren of het token
 * werkelijk de gemeten waarde oplevert.
 */

/** Zoveel mag de waarde van het token van de gemeten waarde afwijken. */
const NUMBER_TOLERANCE = 0.05;
const CHANNEL_TOLERANCE = 0.005;

/**
 * Velden die Figma aan een variable laat binden, met de CSS-longhand die de
 * waarde leverde.
 *
 * `fills` en `strokes` staan er als veldnaam bij, maar zijn in de Plugin API
 * geen node-veld: een paint wordt gebonden via `setBoundVariableForPaint`.
 * De plugin herkent ze aan de naam.
 */
const FRAME_FIELDS = [
  // `materialise` betekent: bestaat de paint niet, laat de plugin hem dan
  // aanmaken. Voor een fill kan dat, want een transparante fill tekent niets.
  // Voor een stroke niet: een frame zonder rand heeft in Figma wel een
  // standaard strokeWeight, dus daar zou een lijn ontstaan die de CSS niet heeft.
  {
    field: 'fills',
    property: 'background-color',
    kind: 'paint',
    materialise: true,
  },
  { field: 'strokes', property: 'border-top-color', kind: 'paint' },
  { field: 'strokeWeight', property: 'border-top-width', kind: 'number' },
  {
    field: 'topLeftRadius',
    property: 'border-top-left-radius',
    kind: 'number',
  },
  {
    field: 'topRightRadius',
    property: 'border-top-right-radius',
    kind: 'number',
  },
  {
    field: 'bottomRightRadius',
    property: 'border-bottom-right-radius',
    kind: 'number',
  },
  {
    field: 'bottomLeftRadius',
    property: 'border-bottom-left-radius',
    kind: 'number',
  },
  { field: 'paddingTop', property: 'padding-top', kind: 'number' },
  { field: 'paddingRight', property: 'padding-right', kind: 'number' },
  { field: 'paddingBottom', property: 'padding-bottom', kind: 'number' },
  { field: 'paddingLeft', property: 'padding-left', kind: 'number' },
];

const TEXT_FIELDS = [
  { field: 'fills', property: 'color', kind: 'paint', materialise: true },
  { field: 'fontSize', property: 'font-size', kind: 'number' },
];

const VECTOR_FIELDS = [
  { field: 'fills', property: 'color', kind: 'paint', materialise: true },
];

/** De gemeten waarde die bij een veld hoort, uit de al opgebouwde node spec. */
function measuredValue(spec, field) {
  switch (field) {
    case 'fills':
      return spec.fills?.[0];
    case 'strokes':
      return spec.strokes?.[0];
    case 'topLeftRadius':
    case 'topRightRadius':
    case 'bottomRightRadius':
    case 'bottomLeftRadius':
      return spec.cornerRadius ?? spec[field];
    default:
      return spec[field];
  }
}

/**
 * Velden die in Figma alleen bestaan bij auto layout. Op een frame zonder
 * layoutMode is er domweg geen padding om aan te binden, ook al staat er in de
 * CSS wel een token.
 */
function unavailableReason(spec, field) {
  const needsAutoLayout =
    field.startsWith('padding') || field === 'itemSpacing';
  if (!needsAutoLayout) return null;
  if (spec.layoutMode && spec.layoutMode !== 'NONE') return null;
  return 'de node heeft geen auto layout, dus Figma kent hier geen padding';
}

/**
 * Klopt de waarde van het token met wat er gemeten is?
 *
 * Dit is de vangnetcontrole onder de cascade-benadering in `browser-tokens.js`.
 * Een verkeerd gekozen token levert vrijwel altijd een andere waarde op, en
 * valt hier dus om in plaats van als stille verkeerde binding in Figma te
 * belanden.
 */
function matchesMeasurement({ kind, materialise }, variable, measured) {
  if (variable.value === undefined)
    return 'de waarde van het token is onbekend';

  if (kind === 'paint') {
    if (variable.type !== 'COLOR') {
      return `het token is ${variable.type}, geen kleur`;
    }
    // Een volledig transparante gemeten kleur levert geen paint op. Dat wil
    // niet zeggen dat er niets te binden valt: het token blijft de bron van de
    // kleur, en in een andere mode kan dezelfde variable zichtbaar zijn. De
    // plugin maakt de paint dan aan, zodat de laag in Figma laat zien wélk
    // token hem stuurt in plaats van een lege Fill te tonen.
    if (!measured) {
      if (!materialise) return 'er is geen paint om aan te binden';
      if ((variable.value?.a ?? 1) !== 0) {
        return 'de gemeten kleur is transparant, de waarde van het token niet';
      }
      return null;
    }

    const target = variable.value;
    const sameChannels = ['r', 'g', 'b'].every(
      (channel) =>
        Math.abs(measured.color[channel] - target[channel]) < CHANNEL_TOLERANCE
    );
    const sameAlpha =
      Math.abs((measured.opacity ?? 1) - (target.a ?? 1)) < CHANNEL_TOLERANCE;
    if (!sameChannels || !sameAlpha) {
      return 'de waarde van het token wijkt af van de gemeten kleur';
    }
    return null;
  }

  if (variable.type !== 'FLOAT') {
    return `het token is ${variable.type}, geen getal`;
  }
  if (typeof measured !== 'number') {
    return 'er is geen gemeten waarde voor dit veld';
  }
  if (Math.abs(measured - variable.value) > NUMBER_TOLERANCE) {
    return `de waarde van het token (${variable.value}) wijkt af van de gemeten ${measured}`;
  }
  return null;
}

/**
 * Kiest de eerste schakel in de var()-keten die een Figma-variable is.
 *
 * De keten loopt van de property naar het token: een component-CSS kan
 * `var(--dsn-button-background-color)` schrijven en die lokaal doorzetten naar
 * `var(--dsn-button-strong-background-color)`. Alleen de laatste bestaat als
 * token, dus de keten wordt afgelopen tot er een treffer is.
 */
function variableForChain(chain, index) {
  for (const cssName of chain) {
    const found = index.lookup(cssName);
    if (found) return found;
  }
  return null;
}

/**
 * Verzamelt de bindingen van één node.
 *
 * @param {object} spec de al opgebouwde Figma node spec
 * @param {object} sources herkomst per CSS-longhand (uit de browser)
 * @param {object} index variable-index
 * @param {object} report verzamelaar met .bind() en .miss()
 * @returns {object|undefined} boundVariables voor in de spec
 */
export function bindingsFor(spec, sources, index, report) {
  if (!index || !sources) return undefined;

  const fields =
    spec.type === 'TEXT'
      ? TEXT_FIELDS
      : spec.type === 'VECTOR'
        ? VECTOR_FIELDS
        : FRAME_FIELDS;

  const bound = {};

  const consider = (entry) => {
    const { field, property } = entry;
    const source = sources[property];
    if (!source) return;

    if (!source.chain.length) {
      report.miss(property, 'de waarde komt niet uit één token', source.value);
      return;
    }

    const variable = variableForChain(source.chain, index);
    if (!variable) {
      report.miss(
        property,
        'het token bestaat niet als Figma-variable',
        `--${source.chain[source.chain.length - 1]}`
      );
      return;
    }

    const unavailable = unavailableReason(spec, field);
    if (unavailable) {
      report.miss(property, unavailable, variable.name);
      return;
    }

    const mismatch = matchesMeasurement(
      entry,
      variable,
      measuredValue(spec, field)
    );
    if (mismatch) {
      report.miss(property, mismatch, variable.name);
      return;
    }

    bound[field] = { collection: variable.collection, name: variable.name };
    report.bind(variable.collection);
  };

  for (const entry of fields) consider(entry);

  // itemSpacing volgt de as van de auto layout; een GRID-frame heeft aparte
  // gaps die de Plugin API niet aan een variable laat binden.
  if (spec.layoutMode === 'HORIZONTAL' || spec.layoutMode === 'VERTICAL') {
    consider({
      field: 'itemSpacing',
      property: spec.layoutMode === 'VERTICAL' ? 'row-gap' : 'column-gap',
      kind: 'number',
    });
  }

  return Object.keys(bound).length ? bound : undefined;
}

/** Verzamelt hoeveel er gebonden is en wat er is blijven liggen. */
export function createBindingReport() {
  let bound = 0;
  const collections = new Set();
  const misses = new Map();

  return {
    bind(collection) {
      bound += 1;
      collections.add(collection);
    },
    miss(property, reason, detail) {
      const key = `${property}|${reason}|${detail ?? ''}`;
      const existing = misses.get(key);
      if (existing) {
        existing.nodes += 1;
        return;
      }
      misses.set(key, { property, reason, detail, nodes: 1 });
    },
    /** @returns {{bound: number, collections: string[], unbound: Array<object>}} */
    summary() {
      return {
        bound,
        // De plugin gebruikt dit om te controleren of de variables-import al
        // gedraaid heeft voordat hij componenten gaat bouwen.
        collections: [...collections].sort(),
        unbound: [...misses.values()].sort((a, b) => b.nodes - a.nodes),
      };
    },
  };
}
