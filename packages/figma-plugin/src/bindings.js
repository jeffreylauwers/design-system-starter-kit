/**
 * Het leggen van variable-bindingen, gedeeld door de component- en de
 * iconimport.
 *
 * De generator wijst een variable aan met collection + naam, want een
 * variable-naam is alleen binnen zijn eigen collection uniek. Hier wordt die
 * verwijzing opgezocht en op de node gelegd.
 */

/**
 * Een kleur die in de gemeten mode transparant is levert geen paint op, maar
 * kan in een andere mode wel zichtbaar zijn. Zonder paint is er niets om aan
 * te binden, dus die maken we alsnog; de variable bepaalt daarna kleur én
 * alpha.
 */
export const PLACEHOLDER_PAINT = {
  type: 'SOLID',
  color: { r: 0, g: 0, b: 0 },
  opacity: 0,
};

/**
 * De variables in dit bestand, op collection + naam.
 *
 * @returns {Promise<{byName: Map<string, Variable>, collections: Set<string>}>}
 */
export async function loadVariableIndex() {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const nameById = new Map(
    collections.map((collection) => [collection.id, collection.name])
  );

  const byName = new Map();
  for (const variable of await figma.variables.getLocalVariablesAsync()) {
    const collection = nameById.get(variable.variableCollectionId);
    byName.set(`${collection}|${variable.name}`, variable);
  }

  return { byName, collections: new Set(nameById.values()) };
}

/** Verse tellers voor één import. */
export function createStats() {
  return { bound: 0, failed: 0, missing: new Set() };
}

/** Zoekt de variable die de generator heeft aangewezen. */
export function variableFor(reference, context) {
  const variable = context.variables.byName.get(
    `${reference.collection}|${reference.name}`
  );
  if (!variable) {
    context.stats.missing.add(`${reference.collection} / ${reference.name}`);
    return null;
  }
  return variable;
}

/**
 * Paints zijn immutable: binden levert een nieuwe paint op, en die moet als
 * nieuwe lijst terug op de node.
 */
export function paintsBoundTo(paints, variable) {
  const rest = paints && paints.length ? paints.slice(1) : [];
  const base = paints && paints.length ? paints[0] : PLACEHOLDER_PAINT;
  return [
    figma.variables.setBoundVariableForPaint(base, 'color', variable),
    ...rest,
  ];
}

/**
 * Bindt de velden die de generator heeft aangewezen.
 *
 * `fills` en `strokes` zijn geen node-velden in de Plugin API maar paints; die
 * krijgen hun eigen route. De rest gaat via `setBoundVariable`.
 */
export function applyBindings(node, spec, context) {
  for (const [field, reference] of Object.entries(spec.boundVariables ?? {})) {
    const variable = variableFor(reference, context);
    if (!variable) continue;

    try {
      if (field === 'fills' || field === 'strokes') {
        node[field] = paintsBoundTo(node[field], variable);
      } else {
        node.setBoundVariable(field, variable);
      }
      context.stats.bound += 1;
    } catch (error) {
      context.stats.failed += 1;
      context.log.warn(
        `${spec.name ?? spec.type}: ${field} kon niet aan ${reference.name} gebonden worden: ${error.message}`
      );
    }
  }
}

/** De velden die een maat binden; zie `applySizeBindings`. */
const SIZE_FIELDS = ['width', 'height'];

/**
 * Legt de bindingen op `width` en `height` (opnieuw).
 *
 * `resize()` zet een vaste waarde op de node, en daarmee raakt een binding op
 * diezelfde maat los. De plugin zet de gemeten maat in `applySizing` als
 * laatste terug, dus de maatbindingen moeten daarna nog een keer gelegd
 * worden. Bij een herhaling telt de binding niet opnieuw mee
 * (`count: false`); bij een icoon, waar `applyBindings` niet langskomt, wel.
 */
export function applySizeBindings(node, spec, context, { count = false } = {}) {
  for (const field of SIZE_FIELDS) {
    const reference = spec.boundVariables?.[field];
    if (!reference) continue;
    const variable = variableFor(reference, context);
    if (!variable) continue;
    try {
      node.setBoundVariable(field, variable);
      if (count) context.stats.bound += 1;
    } catch (error) {
      if (count) context.stats.failed += 1;
      context.log.warn(
        `${spec.name ?? spec.type}: ${field} kon niet aan ${reference.name} gebonden worden: ${error.message}`
      );
    }
  }
}

/**
 * De paints voor een icoon, met de kleur-variable eraan gebonden.
 * Een icoon is in Figma een frame met vectoren erin; de kleur hoort op die
 * vectoren, dus de binding gaat niet via het frame maar via de paints zelf.
 */
export function paintsForVector(spec, context) {
  const reference = spec.boundVariables?.fills;
  if (!reference) return spec.fills;

  const variable = variableFor(reference, context);
  if (!variable) return spec.fills;

  try {
    const paints = paintsBoundTo(spec.fills, variable);
    context.stats.bound += 1;
    return paints;
  } catch (error) {
    context.stats.failed += 1;
    context.log.warn(
      `${spec.name ?? 'icon'}: kleur kon niet aan ${reference.name} gebonden worden: ${error.message}`
    );
    return spec.fills;
  }
}

/**
 * Weigert de import als de variables er nog niet zijn.
 *
 * Doorgaan levert een library op die er goed uitziet maar de theme-schakelaar
 * niet volgt: precies het probleem dat deze import moet oplossen. Dan liever
 * weigeren dan stil een halfbakken library neerzetten.
 */
export function requireCollections(required, variables) {
  if (!required.length) return;
  if (required.some((name) => variables.collections.has(name))) return;
  throw new Error(
    `Dit bestand heeft nog geen ${required.join(' / ')}. Importeer eerst design-tokens/dist/figma/variables.json; anders krijgen de lagen vaste waarden en volgen ze de theme-schakelaar niet.`
  );
}

/**
 * Velden van een effect die Figma aan een variable laat binden. Net als bij
 * paints gaat dat niet via `setBoundVariable` op de node maar via een eigen
 * functie, en is het effect immutable: er komt een nieuw effect uit.
 */
const EFFECT_FIELDS = new Set([
  'color',
  'radius',
  'spread',
  'offsetX',
  'offsetY',
]);

/**
 * Een effect uit de spec (generator of effect style) als Figma-effect, met de
 * bindingen erop.
 *
 * `showShadowBehindNode: false` is wat CSS doet: een `box-shadow` wordt nooit
 * onder het element zelf getekend, ook niet waar dat doorzichtig is.
 *
 * @param {object} spec `{type, offset, radius, spread, color, boundVariables}`
 * @param {(reference: object) => Variable|null} resolve zoekt de variable op
 * @param {(field: string, reference: object, error: Error) => void} onError
 * @returns {{effect: Effect, bound: number}}
 */
export function effectFromSpec(spec, resolve, onError) {
  let effect = {
    type: spec.type,
    color: { ...spec.color },
    offset: { ...spec.offset },
    radius: spec.radius ?? 0,
    spread: spec.spread ?? 0,
    visible: true,
    blendMode: 'NORMAL',
  };
  if (spec.type === 'DROP_SHADOW') effect.showShadowBehindNode = false;

  let bound = 0;
  for (const [field, reference] of Object.entries(spec.boundVariables ?? {})) {
    if (!EFFECT_FIELDS.has(field)) continue;
    const variable = resolve(reference);
    if (!variable) continue;
    try {
      effect = figma.variables.setBoundVariableForEffect(
        effect,
        field,
        variable
      );
      bound += 1;
    } catch (error) {
      onError(field, reference, error);
    }
  }
  return { effect, bound };
}

/**
 * Zet de effects uit de spec op een laag, met hun bindingen.
 *
 * Een effect style komt hier níet: `setEffectStyleIdAsync` is asynchroon en
 * de bouw is dat niet. De style wordt aan het eind van de import gelegd (zie
 * `applyEffectStyles` in components.js); tot die tijd staan de gemeten
 * effects erop, en die zijn gelijk aan de style.
 */
export function applyEffects(node, spec, context) {
  if (spec.effectStyle !== undefined) {
    context.effectStyleQueue?.push({ node, name: spec.effectStyle, spec });
  }
  if (spec.effects === undefined) return;
  node.effects = spec.effects.map((effectSpec) => {
    const { effect, bound } = effectFromSpec(
      effectSpec,
      (reference) => variableFor(reference, context),
      (field, reference, error) => {
        context.stats.failed += 1;
        context.log.warn(
          `${spec.name ?? spec.type}: schaduw-${field} kon niet aan ${reference.name} gebonden worden: ${error.message}`
        );
      }
    );
    context.stats.bound += bound;
    return effect;
  });
}
