#!/usr/bin/env node
/**
 * Validates manifest.json against manifest-schema.json.
 *
 * The manifest is the source of truth for the platforms field of every
 * component, so a typo there is a silent bug rather than a build failure. This
 * script runs before the CSS build and turns such a typo into a hard error.
 *
 * It implements only the JSON Schema keywords manifest-schema.json actually
 * uses, so it needs no dependencies. An unknown keyword in the schema throws
 * instead of being skipped, because a silently ignored keyword would mean the
 * schema claims a guarantee that nothing checks.
 */

const fs = require('fs');
const path = require('path');

const PACKAGE_DIR = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(PACKAGE_DIR, 'manifest.json');
const SCHEMA_PATH = path.join(PACKAGE_DIR, 'manifest-schema.json');

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

  return errors;
}

function main() {
  const schema = readJson(SCHEMA_PATH);
  const manifest = readJson(MANIFEST_PATH);
  const errors = validateManifest(manifest, schema);

  if (errors.length > 0) {
    console.error('manifest.json voldoet niet aan manifest-schema.json:');
    for (const error of errors) console.error(`  ${error}`);
    process.exit(1);
  }

  console.log(
    `Validated manifest.json: ${manifest.components.length} components.`
  );
}

if (require.main === module) main();

module.exports = { validateManifest };
