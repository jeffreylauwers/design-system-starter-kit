#!/usr/bin/env node
/**
 * Validates the component manifest against manifest-schema.json.
 *
 * The manifest is the source of truth for the platforms field of every
 * component, so a typo there is a silent bug rather than a build failure. This
 * module turns such a typo into a hard error. build-manifest.js runs it on
 * every per-component file and on the assembled manifest.json, before the CSS
 * build.
 *
 * It implements only the JSON Schema keywords manifest-schema.json actually
 * uses, so it needs no dependencies. An unknown keyword in the schema throws
 * instead of being skipped, because a silently ignored keyword would mean the
 * schema claims a guarantee that nothing checks.
 */

const fs = require('fs');
const path = require('path');

const PACKAGE_DIR = path.resolve(__dirname, '..');

/** Keywords carrying no constraint; present for humans and editors. */
const ANNOTATIONS = new Set([
  '$schema',
  '$id',
  'title',
  'description',
  '$defs',
]);

const VALIDATORS = {
  type: (value, expected, at, errors) => {
    const allowed = Array.isArray(expected) ? expected : [expected];
    if (!allowed.some((name) => isType(value, name))) {
      errors.push(`${at}: verwacht type ${allowed.join(' of ')}`);
      return false;
    }
    return true;
  },

  enum: (value, allowed, at, errors) => {
    if (!allowed.some((option) => option === value)) {
      errors.push(
        `${at}: ${JSON.stringify(value)} is geen geldige waarde (${allowed.join(', ')})`
      );
    }
    return true;
  },

  pattern: (value, pattern, at, errors) => {
    if (typeof value === 'string' && !new RegExp(pattern).test(value)) {
      errors.push(
        `${at}: ${JSON.stringify(value)} matcht niet op /${pattern}/`
      );
    }
    return true;
  },

  minLength: (value, minimum, at, errors) => {
    if (typeof value === 'string' && value.length < minimum) {
      errors.push(`${at}: mag niet leeg zijn`);
    }
    return true;
  },

  minItems: (value, minimum, at, errors) => {
    if (Array.isArray(value) && value.length < minimum) {
      errors.push(`${at}: verwacht minstens ${minimum} item(s)`);
    }
    return true;
  },

  uniqueItems: (value, unique, at, errors) => {
    if (!unique || !Array.isArray(value)) return true;
    const seen = value.map((item) => JSON.stringify(item));
    if (new Set(seen).size !== seen.length) {
      errors.push(`${at}: bevat dubbele items`);
    }
    return true;
  },

  required: (value, names, at, errors) => {
    if (!isType(value, 'object')) return true;
    for (const name of names) {
      if (!(name in value)) errors.push(`${at}: mist verplicht veld '${name}'`);
    }
    return true;
  },

  additionalProperties: (value, allowed, at, errors, schema) => {
    if (allowed !== false || !isType(value, 'object')) return true;
    const known = Object.keys(schema.properties ?? {});
    for (const key of Object.keys(value)) {
      if (!known.includes(key)) errors.push(`${at}: onbekend veld '${key}'`);
    }
    return true;
  },
};

function isType(value, name) {
  if (name === 'array') return Array.isArray(value);
  if (name === 'null') return value === null;
  if (name === 'object') {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
  if (name === 'integer') return Number.isInteger(value);
  return typeof value === name;
}

/** Resolves the only $ref form this schema uses: "#/$defs/<name>". */
function resolveRef(ref, root) {
  const match = /^#\/\$defs\/([A-Za-z0-9_-]+)$/.exec(ref);
  const target = match && root.$defs?.[match[1]];
  if (!target) throw new Error(`Niet-ondersteunde $ref: ${ref}`);
  return target;
}

function validate(value, schema, at, root, errors) {
  if (schema.$ref) {
    validate(value, resolveRef(schema.$ref, root), at, root, errors);
    return;
  }

  for (const [keyword, constraint] of Object.entries(schema)) {
    if (ANNOTATIONS.has(keyword)) continue;
    if (keyword === 'properties' || keyword === 'items') continue;

    const check = VALIDATORS[keyword];
    if (!check) {
      throw new Error(
        `manifest-schema.json gebruikt keyword '${keyword}', dat deze validator niet kent`
      );
    }

    // A failing type check makes every other keyword meaningless here.
    if (!check(value, constraint, at, errors, schema)) return;
  }

  if (schema.properties && isType(value, 'object')) {
    for (const [key, subSchema] of Object.entries(schema.properties)) {
      if (key in value) {
        validate(value[key], subSchema, `${at}/${key}`, root, errors);
      }
    }
  }

  if (schema.items && Array.isArray(value)) {
    value.forEach((item, index) => {
      validate(item, schema.items, `${at}/${index}`, root, errors);
    });
  }
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (error) {
    throw new Error(`${path.basename(filePath)}: ${error.message}`);
  }
}

/**
 * Returns every way `manifest` violates `schema`, as human-readable strings.
 * An empty array means the manifest is valid.
 */
function validateManifest(manifest, schema, { packageDir = PACKAGE_DIR } = {}) {
  const errors = [];
  validate(manifest, schema, '', schema, errors);

  // Beyond the schema: a $schema that points nowhere leaves editors without
  // validation, which is exactly the state this file was added to fix.
  if (
    typeof manifest?.$schema === 'string' &&
    !/^https?:/.test(manifest.$schema)
  ) {
    if (!fs.existsSync(path.resolve(packageDir, manifest.$schema))) {
      errors.push(`/$schema: '${manifest.$schema}' bestaat niet`);
    }
  }

  // Beyond the schema: JSON Schema cannot express uniqueness on one field.
  const seen = new Set();
  for (const component of manifest?.components ?? []) {
    if (seen.has(component?.name)) {
      errors.push(`/components: '${component.name}' staat er dubbel in`);
    }
    seen.add(component?.name);
  }

  (manifest?.components ?? []).forEach((component, index) => {
    checkApi(component, `/components/${index}`, errors);
  });

  return errors;
}

/**
 * Validates one component entry, as found in a src/<dir>/<name>.manifest.json
 * file, against #/$defs/component. `at` prefixes every error, so a message can
 * name the file instead of a position in the assembled array.
 */
function validateComponent(component, schema, at = '') {
  const errors = [];
  validate(component, schema.$defs.component, at, schema, errors);
  checkApi(component, at, errors);
  return errors;
}

/**
 * The rules of the api block that the schema cannot express without keywords
 * this validator does not implement (if/then, oneOf). Assumes nothing about
 * the shape beyond what it tests, so a component that already failed the
 * schema check does not make this throw.
 */
function checkApi(component, at, errors) {
  const api = component?.api;
  if (!isType(api, 'object')) return;

  const props = Array.isArray(api.props) ? api.props : [];
  const slots = Array.isArray(api.slots) ? api.slots : [];
  const states = Array.isArray(api.states) ? api.states : [];

  for (const [list, field] of [
    [props, 'props'],
    [slots, 'slots'],
    [states, 'states'],
  ]) {
    const names = new Set();
    for (const item of list) {
      if (names.has(item?.name)) {
        errors.push(`${at}/api/${field}: '${item.name}' staat er dubbel in`);
      }
      names.add(item?.name);
    }
  }

  const slotNames = new Set(slots.map((slot) => slot?.name));

  // Every axis value and component property in Figma belongs to exactly one
  // part of the API. Two parts claiming the same one is a copy-paste error.
  const claimed = new Map();

  const checkBindings = (bindings, where, { owner = 'prop' } = {}) => {
    const isState = owner === 'state';
    if (!Array.isArray(bindings)) return;
    if (bindings.some((b) => b?.kind === 'none') && bindings.length > 1) {
      errors.push(
        `${where}/figma: 'none' kan niet samen met een andere binding`
      );
    }
    for (const binding of bindings) {
      if (!isType(binding, 'object')) continue;
      if (binding.kind === 'none') {
        if (!binding.reason) {
          errors.push(`${where}/figma: 'none' heeft een reason nodig`);
        }
        if (binding.property !== undefined) {
          errors.push(`${where}/figma: 'none' heeft geen property`);
        }
        continue;
      }
      if (!binding.property) {
        errors.push(
          `${where}/figma: '${binding.kind}' heeft een property nodig`
        );
        continue;
      }
      if (isState && binding.kind === 'variant' && !binding.value) {
        errors.push(
          `${where}/figma: een state op een variant-as heeft een value nodig`
        );
      }
      // A prop can claim one value of a shared axis (checked and
      // indeterminate on Checkbox's state axis); a slot claims a whole axis
      // (present or not), and only a variant axis has values at all.
      if (
        binding.value !== undefined &&
        (owner === 'slot' || binding.kind !== 'variant')
      ) {
        errors.push(
          `${where}/figma: value hoort alleen bij een variant-binding van een prop of state`
        );
      }
      if (
        binding.instance !== undefined &&
        !['boolean', 'text', 'instance-swap'].includes(binding.kind)
      ) {
        errors.push(
          `${where}/figma: instance hoort alleen bij een component property (boolean, text, instance-swap)`
        );
      }
      if (
        binding.unset !== undefined &&
        (owner !== 'prop' ||
          binding.kind !== 'variant' ||
          binding.value !== undefined)
      ) {
        errors.push(
          `${where}/figma: unset hoort alleen bij een prop die een hele variant-as heeft`
        );
      }
      if (isState && binding.kind !== 'variant') {
        errors.push(`${where}/figma: een state kan alleen een variant zijn`);
      }
      if (binding.kind === 'slot' && owner !== 'slot') {
        errors.push(`${where}/figma: 'slot' hoort alleen bij api.slots`);
      }
      const key = `${binding.instance ?? ''}:${binding.kind}:${binding.property}:${binding.value ?? ''}`;
      if (claimed.has(key)) {
        errors.push(
          `${where}/figma: ${binding.kind} '${binding.property}' is al gekoppeld in ${claimed.get(key)}`
        );
      }
      claimed.set(key, where);
    }
  };

  props.forEach((prop, index) => {
    const where = `${at}/api/props/${index}`;
    if (!isType(prop, 'object')) return;
    if ((prop.type === undefined) === (prop.values === undefined)) {
      errors.push(
        `${where}: '${prop.name}' heeft precies één van type en values nodig`
      );
    }
    if ((prop.figma === undefined) === (prop.slots === undefined)) {
      errors.push(
        `${where}: '${prop.name}' heeft precies één van figma en slots nodig (een prop die een slot vult, krijgt de binding van dat slot)`
      );
    }
    for (const slot of Array.isArray(prop.slots) ? prop.slots : []) {
      if (!slotNames.has(slot)) {
        errors.push(`${where}/slots: slot '${slot}' staat niet in api.slots`);
      }
    }
    checkBindings(prop.figma, where);
  });

  slots.forEach((slot, index) => {
    checkBindings(slot?.figma, `${at}/api/slots/${index}`, { owner: 'slot' });
  });

  states.forEach((state, index) => {
    checkBindings(state?.figma, `${at}/api/states/${index}`, {
      owner: 'state',
    });
  });

  // primaryProps is the curated summary of api.props, so it may not say
  // anything that api.props contradicts.
  const byName = new Map(props.map((prop) => [prop?.name, prop]));
  const primaryProps = Array.isArray(component.primaryProps)
    ? component.primaryProps
    : [];
  primaryProps.forEach((primary, index) => {
    const where = `${at}/primaryProps/${index}`;
    const full = byName.get(primary?.name);
    if (!full) {
      errors.push(`${where}: '${primary?.name}' ontbreekt in api.props`);
      return;
    }
    for (const field of ['type', 'values', 'default', 'required']) {
      const a = JSON.stringify(primary[field]);
      const b = JSON.stringify(full[field]);
      if (a !== b) {
        errors.push(
          `${where}: ${field} van '${primary.name}' is ${a ?? 'leeg'}, in api.props ${b ?? 'leeg'}`
        );
      }
    }
  });
}

module.exports = { validateManifest, validateComponent, readJson };
