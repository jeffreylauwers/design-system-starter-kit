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
