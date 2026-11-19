/**
 * Component properties op de set, en het terugvinden van bestaande varianten.
 *
 * Allebei gaat het om hetzelfde: wat een designer al aan de set gekoppeld
 * heeft (een property-waarde op een instance, een instance aan een variant)
 * moet een nieuwe import overleven.
 */

import { ICON_PAGE } from './contract.js';
import { propertyNameOf } from './nodes.js';

/** Het veld dat elk propertytype op een laag aanstuurt. */
const FIELD_FOR_TYPE = {
  TEXT: 'characters',
  BOOLEAN: 'visible',
  INSTANCE_SWAP: 'mainComponent',
};

/**
 * De standaardwaarde die Figma bij dit propertytype verwacht.
 *
 * INSTANCE_SWAP is het lastige geval: de generator noemt een icoon bij naam,
 * en Figma wil een verwijzing naar het component. De Plugin API accepteert
 * daar historisch zowel de `key` als de node-id, afhankelijk van versie en van
 * of het component gepubliceerd is. Beide worden daarom geprobeerd, en welke
 * het werd staat in de log; stil de verkeerde kiezen zou een property
 * opleveren die pas in Figma zelf blijkt te weigeren.
 */
function defaultValuesFor(property, targets, context) {
  if (property.type === 'TEXT') {
    return [property.default ?? targets[0].characters ?? ''];
  }
  if (property.type === 'BOOLEAN') {
    return [property.default ?? true];
  }

  const component = context.icons.get(property.default);
  if (!component) return null;
  return [component.key, component.id].filter(Boolean);
}

/**
 * De iconen die de swap-lijst als eerste toont. Zonder dit moet een designer
 * elk icoon uit het hele bestand bij elkaar zoeken.
 */
function preferredIcons(context) {
  const values = [...context.icons.values()]
    .filter((component) => component.key)
    .map((component) => ({ type: 'COMPONENT', key: component.key }));
  return values.length ? { preferredValues: values } : undefined;
}

/**
 * De properties die al op de set staan, op naam.
 *
 * De variant-assen (`size`, `variant`, ...) staan hier ook in, maar die komen
 * uit de variantnamen en worden niet door de generator gedeclareerd; ze horen
 * dus niet in deze afweging thuis.
 */
function existingProperties(set) {
  const byName = new Map();
  for (const [propertyId, definition] of Object.entries(
    set.componentPropertyDefinitions ?? {}
  )) {
    // Een SLOT-property hoort bij zijn slot en wordt daar beheerd; zie
    // `buildContentSlot` en `dropStaleContentSlots`.
    if (definition.type === 'VARIANT' || definition.type === 'SLOT') continue;
    byName.set(propertyNameOf(propertyId), { propertyId, ...definition });
  }
  return byName;
}

/**
 * Staat deze property er al precies zo op?
 *
 * `defaults` bevat bij een INSTANCE_SWAP twee kandidaten (de `key` en de
 * node-id van het icooncomponent), want welke Figma accepteert verschilt per
 * versie. Komt de bestaande waarde met één van beide overeen, dan is er niets
 * te wijzigen.
 */
function unchangedProperty(existing, property, defaults, options) {
  // Bij een INSTANCE_SWAP telt de standaardwaarde niet mee. Wat Figma daar
  // opslaat is niet per se de `key` of de node-id die wij aanleverden, dus een
  // vergelijking erop slaat nooit aan en dan zou hier elke import doorheen
  // lopen. Belangrijker: die waarde opnieuw zetten laat Figma de geneste
  // instance verwisselen en dat wist de kleuroverride erop. Het icoon dat een
  // designer als standaard kiest is bovendien zijn keuze, niet die van een
  // volgende import.
  const sameDefault =
    property.type === 'INSTANCE_SWAP' ||
    defaults.some((value) => existing.defaultValue === value);
  if (!sameDefault) return false;

  const wanted = options?.preferredValues;
  if (wanted === undefined) return true;
  return (
    JSON.stringify(existing.preferredValues ?? []) === JSON.stringify(wanted)
  );
}

/**
 * Zorgt dat de property op de set staat en geeft zijn id terug.
 *
 * Bestaat hij al met hetzelfde type, dan wordt hij bijgewerkt in plaats van
 * opnieuw aangemaakt. Dat is niet cosmetisch: Figma bewaart de waarde die een
 * instance aan een property geeft onder de property-id, dus een property
 * weggooien en opnieuw aanmaken zet elke instance terug op de standaardwaarde.
 *
 * Van type wisselen kan niet; dan moet de oude er wel uit, en dat wordt gemeld.
 */
function ensureComponentProperty(set, property, defaults, options, known, log) {
  const existing = known.get(property.name);
  let lastError;

  if (existing && existing.type !== property.type) {
    log.warn(
      `Property "${property.name}" wijzigt van ${existing.type} naar ${property.type}; opnieuw aangemaakt, instances vallen terug op de standaardwaarde`
    );
    try {
      set.deleteComponentProperty(existing.propertyId);
    } catch (error) {
      lastError = error;
    }
  } else if (existing) {
    // Niets schrijven wat niet verandert. De standaardwaarde van een
    // INSTANCE_SWAP opnieuw zetten laat Figma de geneste instance opnieuw
    // verwisselen, en een swap wist de overrides op die instance: het icoon in
    // de variant verliest dan de kleur die de plugin erop had gelegd en valt
    // terug op de kleur van het icooncomponent zelf.
    if (unchangedProperty(existing, property, defaults, options)) {
      return { id: existing.propertyId, reused: true, unchanged: true };
    }

    // Alleen de velden die daadwerkelijk wijzigen, om dezelfde reden: elke
    // schrijfactie op een INSTANCE_SWAP-default is een verwisseling.
    const changes =
      property.type === 'INSTANCE_SWAP'
        ? [{ ...(options ?? {}) }]
        : defaults.map((value) => ({
            defaultValue: value,
            ...(options ?? {}),
          }));

    for (const change of changes) {
      try {
        return {
          id: set.editComponentProperty(existing.propertyId, change),
          reused: true,
        };
      } catch (error) {
        lastError = error;
      }
    }
    return { id: null, error: lastError, reused: true };
  }

  for (const value of defaults) {
    try {
      return {
        id: set.addComponentProperty(
          property.name,
          property.type,
          value,
          options
        ),
        reused: false,
      };
    } catch (error) {
      lastError = error;
    }
  }

  return { id: null, error: lastError };
}

/** `state=default, width=auto` -> `{ state: 'default', width: 'auto' }`. */
function parseVariantName(name) {
  const properties = {};
  for (const part of name.split(',')) {
    const [key, ...value] = part.split('=');
    if (!value.length) return null;
    properties[key.trim()] = value.join('=').trim();
  }
  return properties;
}

/**
 * Zoekt de bestaande variant bij een variant uit de spec.
 *
 * Eerst op naam. Lukt dat niet, dan kan de set een as bij hebben gekregen: de
 * tekstvelden kregen `showValue` en `showPlaceholder`, en daarmee heet elke
 * bestaande variant anders. Op naam zouden ze allemaal als wees blijven staan,
 * naast een volledig nieuwe set varianten, terwijl de instances in ontwerpen
 * nog aan de oude hangen. Een oude variant wordt daarom overgenomen door de
 * nieuwe variant met dezelfde waarden op de oude assen, en de eerste waarde op
 * elke nieuwe as: de stand die er vóór die as ook al was. Zo houden bestaande
 * instances hun variant.
 */
export function variantFinder(knownVariants, axes) {
  const claimed = new Set();
  const parsed = [...knownVariants].map(([name, node]) => ({
    name,
    node,
    properties: parseVariantName(name),
  }));

  return (component) => {
    const exact = knownVariants.get(component.name);
    if (exact) {
      claimed.add(component.name);
      return exact;
    }

    const wanted = component.variantProperties ?? {};
    const base = (axis) => axes?.[axis]?.[0];
    const match = parsed.find(({ name, properties }) => {
      if (claimed.has(name) || !properties) return false;

      // Een waarde kan ook een eigen as zijn geworden: `state=disabled` werd
      // `state=default` plus `disabled=true`. De oude variant hoort dan bij de
      // nieuwe variant waarin die as aan staat.
      // Een as die uit de spec verdwenen is, zoals `footer` bij Drawer sinds
      // de footer een slot is, telt niet mee. De eerste oude variant die
      // verder past wordt de nieuwe; dat is die met de eerste waarde van die
      // as, want de varianten staan in de volgorde van de spec.
      const dropped = [];
      const promoted = [];
      for (const [key, value] of Object.entries(properties)) {
        if (wanted[key] === value) continue;
        if (axes && !(key in axes)) {
          dropped.push(key);
          continue;
        }
        if (wanted[value] === 'true' && wanted[key] === base(key)) {
          promoted.push(value);
          continue;
        }
        return false;
      }

      const newKeys = Object.keys(wanted).filter((key) => !(key in properties));
      if (!newKeys.length && !promoted.length && !dropped.length) return false;
      return newKeys.every(
        (key) => promoted.includes(key) || base(key) === wanted[key]
      );
    });
    if (!match) return undefined;

    claimed.add(match.name);
    knownVariants.delete(match.name);
    return match.node;
  };
}

/**
 * Legt de gedeclareerde component properties op de set en koppelt de lagen.
 *
 * Alles wat hier niet lukt gaat als fout de log in. Een property die stil
 * wegvalt is precies het handwerk dat na elke import opnieuw gedaan moet
 * worden, en dat is niet te zien aan een set die er verder goed uitziet.
 */
export function applyComponentProperties(set, properties, variants, context) {
  const { log } = context;
  const applied = [];
  const known = existingProperties(set);

  for (const property of properties ?? []) {
    const found = variants.map((variant) => variant.slots.get(property.slot));
    const missing = found.filter((target) => !target).length;
    // Een optionele property koppelt aan de varianten die de laag hebben, zoals
    // de waarde van een tekstveld die alleen bestaat waar Show Value aan staat.
    const targets = property.optional ? found.filter(Boolean) : found;
    if (property.optional ? !targets.length : missing) {
      log.error(
        `Property "${property.name}": slot "${property.slot}" ontbreekt in ${missing} van de ${variants.length} varianten; niet gelegd`
      );
      continue;
    }

    if (property.type === 'INSTANCE_SWAP') {
      const notInstances = targets.filter(
        (target) => target.type !== 'INSTANCE'
      ).length;
      if (notInstances) {
        log.error(
          `Property "${property.name}" kan niet gelegd worden: de laag in slot "${property.slot}" is in ${notInstances} varianten geen instance maar een ingebakken SVG. Importeer eerst icons.json.`
        );
        continue;
      }
    }

    const defaults = defaultValuesFor(property, targets, context);
    if (!defaults) {
      log.error(
        `Property "${property.name}": icoon "${property.default}" staat niet op de pagina ${ICON_PAGE}; niet gelegd`
      );
      continue;
    }

    const options =
      property.type === 'INSTANCE_SWAP' ? preferredIcons(context) : undefined;

    const outcome = ensureComponentProperty(
      set,
      property,
      defaults,
      options,
      known,
      log
    );
    const id = outcome.id;
    let lastError = outcome.error;

    if (!id) {
      log.error(
        `Property "${property.name}" (${property.type}) kon niet ${outcome.reused ? 'bijgewerkt' : 'aangemaakt'} worden: ${lastError?.message ?? 'onbekende fout'}`
      );
      continue;
    }

    known.delete(property.name);

    // De lagen op de standaardstand zetten vóór de koppeling: daarna bepaalt
    // de property de waarde, en een laag die daar niet mee overeenkomt laat de
    // set iets anders zien dan de property zegt.
    const field = FIELD_FOR_TYPE[property.type];
    let failed = 0;
    for (const target of targets) {
      try {
        if (property.type === 'BOOLEAN') target.visible = defaults[0];
        // Een koppeling die al klopt niet opnieuw leggen. Bij een INSTANCE_SWAP
        // is `mainComponent` zetten voor Figma een verwisseling, en die wist de
        // kleuroverride op de geneste lagen van die instance. Sinds de icoon-
        // instances hergebruikt worden staat de koppeling er bij een tweede
        // import al op, en dan is dit puur schade.
        if (target.componentPropertyReferences?.[field] === id) continue;
        target.componentPropertyReferences = {
          ...target.componentPropertyReferences,
          [field]: id,
        };
      } catch (error) {
        failed += 1;
        lastError = error;
      }
    }

    if (failed) {
      log.error(
        `Property "${property.name}" is aangemaakt maar niet gekoppeld aan ${failed} van de ${targets.length} lagen: ${lastError.message}`
      );
      continue;
    }

    applied.push(property.name);
  }

  if (applied.length) {
    log.info(`Component properties gelegd: ${applied.join(', ')}`);
  }

  // Wat na de lus in `known` overblijft staat wel op de set maar niet meer in
  // de spec. Verwijderen zou de waarde wegnemen die instances eraan hebben
  // gegeven, dus dat blijft een beslissing van een mens.
  for (const name of known.keys()) {
    log.warn(
      `Property "${name}" staat wel op ${set.name} in Figma maar niet meer in de spec; handmatig verwijderen als dat de bedoeling is`
    );
  }

  return applied;
}

/** `size=small, state=hover` -> `['size', 'state']`. */
export function axesOf(variantName) {
  return variantName
    .split(',')
    .map((part) => part.split('=')[0].trim())
    .filter(Boolean);
}
