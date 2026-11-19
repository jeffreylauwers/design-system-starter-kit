/**
 * Legt de stand van de mock vast als gewone JSON.
 *
 * Bedoeld als vangnet bij een refactor: na een herschikking van de plugin
 * hoort elke laag, elke variable en elke property er precies zo bij te staan
 * als ervoor. Zie `scripts/figma-snapshot.mjs` in de root.
 *
 * Alles wat de plugin op een node zet komt mee, ook de velden achter een
 * getter (`_layoutMode`, `_name`): de mock bewaart ze als eigen veld, en een
 * refactor die er één vergeet te zetten moet hier opvallen. Een verwijzing
 * naar een andere node of variable wordt zijn id; anders zou de boom in
 * zichzelf rondlopen.
 */

/** Een object dat uit een klasse van de mock komt, geen los JSON-object. */
function isEntity(value) {
  const prototype = Object.getPrototypeOf(value);
  return prototype !== Object.prototype && prototype !== null;
}

function plain(value) {
  if (value === null || typeof value !== 'object') {
    return typeof value === 'function' ? undefined : value;
  }
  if (Array.isArray(value)) return value.map(plain);
  if (value instanceof Map || value instanceof Set) {
    return plain(
      value instanceof Map ? Object.fromEntries(value) : [...value].sort()
    );
  }
  if (isEntity(value)) return value.id !== undefined ? `#${value.id}` : null;

  const result = {};
  for (const key of Object.keys(value).sort()) {
    const field = plain(value[key]);
    if (field !== undefined) result[key] = field;
  }
  return result;
}

/** Eén node, variable of style met al zijn eigen velden, en zijn kinderen. */
function serializeEntity(entity) {
  const result = {};
  for (const key of Object.keys(entity).sort()) {
    if (key === 'parent') continue;
    if (key === 'children') {
      result.children = entity.children.map(serializeEntity);
      continue;
    }
    const field = plain(entity[key]);
    if (field !== undefined) result[key] = field;
  }
  return result;
}

/** De hele stand: het document met zijn pagina's, de variables en de styles. */
export function serializeState(state) {
  return {
    document: serializeEntity(state.root),
    collections: state.collections.map(serializeEntity),
    variables: state.variables.map(serializeEntity),
    effectStyles: state.effectStyles.map(serializeEntity),
  };
}
