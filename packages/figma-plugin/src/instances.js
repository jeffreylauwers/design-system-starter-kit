/**
 * Geneste componenten: een laag die een instance is van een andere set.
 *
 * De generator wijst ze aan (`type: 'INSTANCE'` in de spec, met de set, de
 * variant en wat er in deze host anders is). Hier worden ze opgezocht en
 * geplaatst. Hetzelfde patroon als bij de iconen, maar dan voor elke set uit
 * de bibliotheek: een Heading in een HeadingGroup volgt daarna de Heading-set,
 * in plaats van een nagebouwde kopie te zijn die er stil van kan afwijken.
 */

/** Alle INSTANCE-specs in een boom. */
function collectInstanceSpecs(node, into = []) {
  if (node.type === 'INSTANCE') into.push(node);
  for (const child of node.children ?? []) collectInstanceSpecs(child, into);
  return into;
}

/** De sets en losse componenten die deze import nodig heeft, op naam. */
function findTarget(name, pageName) {
  const pages = figma.root.children.filter((page) => page.type === 'PAGE');
  // Eerst de pagina die de generator noemt; staat de set daar niet, dan elke
  // andere pagina. Een designer mag een set verplaatst hebben.
  //
  // Behalve een onderdeel als `__item`: die naam staat op de pagina van elke
  // lijst, dus op een andere pagina is het een ander item.
  const ordered = [
    ...pages.filter((page) => page.name === pageName),
    ...(name.startsWith('_')
      ? []
      : pages.filter((page) => page.name !== pageName)),
  ];

  for (const page of ordered) {
    for (const node of page.children) {
      if (node.name !== name) continue;
      if (node.type === 'COMPONENT_SET') {
        return new Map(
          node.children
            .filter((child) => child.type === 'COMPONENT')
            .map((child) => [child.name, child])
        );
      }
      // Een matrix zonder assen staat als los component in een canvasframe
      // met dezelfde naam; zie "Een matrix zonder assen" in de README.
      if (node.type === 'FRAME') {
        const single = node.children.find(
          (child) => child.type === 'COMPONENT' && child.name === name
        );
        if (single) return new Map([[name, single]]);
      }
      if (node.type === 'COMPONENT') return new Map([[name, node]]);
    }
  }
  return null;
}

/** De fonts van de tekstlagen in een component, om vooraf te laden. */
function textFontsOf(node, into) {
  if (
    node.type === 'TEXT' &&
    node.fontName &&
    typeof node.fontName === 'object'
  ) {
    into.set(`${node.fontName.family}|${node.fontName.style}`, node.fontName);
  }
  for (const child of node.children ?? []) textFontsOf(child, into);
  return into;
}

/**
 * Zoekt elk doelcomponent van deze import op, en weigert als er één ontbreekt.
 *
 * Weigeren en niet terugvallen op een gemeten laag: een set die er goed
 * uitziet maar zijn Heading heeft nagebouwd is precies het probleem dat dit
 * oplost, en dat zie je aan een laag niet. Hetzelfde als bij ontbrekende
 * variables.
 *
 * De fonts van de tekstlagen in die componenten worden hier ook geladen. Een
 * override op `characters` kan alleen als het font van de laag geladen is,
 * en dat font komt uit het doelcomponent, niet uit deze spec.
 *
 * @returns {Promise<Map<string, ComponentNode>>} op `set|variant`
 */
export async function resolveInstanceTargets(spec, log) {
  const required = spec.dependsOn ?? [];
  const instances = spec.components.flatMap((component) =>
    collectInstanceSpecs(component.node)
  );
  if (!required.length && !instances.length) return new Map();

  if (typeof figma.loadAllPagesAsync === 'function') {
    await figma.loadAllPagesAsync();
  }

  const sets = new Map();
  const missingSets = [];
  for (const { name, page } of required) {
    const variants = findTarget(name, page);
    if (variants) sets.set(name, variants);
    else missingSets.push({ name, page });
  }

  if (missingSets.length) {
    throw new Error(
      `${spec.name} bevat instances van ${missingSets
        .map((target) => target.name)
        .join(
          ', '
        )}, maar die staan nog niet in dit bestand. Importeer eerst ${missingSets
        .map((target) => `de JSON van ${target.page}`)
        .join(
          ' en '
        )}; anders wordt het een nagebouwde kopie die niet meebeweegt.`
    );
  }

  const resolved = new Map();
  const missingVariants = new Set();
  for (const instance of instances) {
    const component = sets.get(instance.component)?.get(instance.variant);
    if (!component) {
      missingVariants.add(`${instance.component} (${instance.variant})`);
      continue;
    }
    resolved.set(`${instance.component}|${instance.variant}`, component);
  }

  if (missingVariants.size) {
    throw new Error(
      `${spec.name} wijst naar varianten die in Figma niet bestaan: ${[...missingVariants].slice(0, 3).join(', ')}. Importeer die sets opnieuw met de huidige build.`
    );
  }

  const fonts = new Map();
  for (const component of new Set(resolved.values())) {
    textFontsOf(component, fonts);
  }
  for (const font of fonts.values()) {
    try {
      await figma.loadFontAsync(font);
    } catch {
      log.warn(
        `Font "${font.family} ${font.style}" uit een doelcomponent is niet beschikbaar; tekst-overrides op die laag kunnen mislukken`
      );
    }
  }

  return resolved;
}

/** De laag binnen een instance waar een override op hoort. */
function nodeAt(instance, path) {
  let node = instance;
  for (const index of path) {
    node = node?.children?.[index];
  }
  return node;
}

/** Velden die als gewone toewijzing op de laag gaan. */
const PLAIN_FIELDS = [
  'cornerRadius',
  'topLeftRadius',
  'topRightRadius',
  'bottomRightRadius',
  'bottomLeftRadius',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'itemSpacing',
  'opacity',
  'fontSize',
  'lineHeight',
  'textCase',
  'textDecoration',
  'textAlignHorizontal',
];

/**
 * Legt de overrides uit de spec op de lagen van een instance.
 *
 * `helpers` komt uit components.js (fonts, bindingen), zodat dit module geen
 * kringverwijzing met de bouwcode krijgt.
 */
export function applyOverrides(instance, spec, context, helpers) {
  for (const override of spec.overrides ?? []) {
    const node = nodeAt(instance, override.path);
    const label = `${spec.name} > ${override.path.join(' > ') || 'root'}`;
    if (!node) {
      context.log.error(
        `${label}: deze laag bestaat niet in de instance van ${spec.component} (${spec.variant}); de override is niet gelegd`
      );
      continue;
    }

    try {
      // Eerst het font, dan de tekst: `characters` vereist een geladen font,
      // en een ander gewicht is een ander font.
      if (node.type === 'TEXT' && override.fontFamily !== undefined) {
        node.fontName = helpers.fontFor(override, node.fontName);
      }
      if (node.type === 'TEXT' && override.characters !== undefined) {
        node.characters = override.characters;
      }
      for (const field of PLAIN_FIELDS) {
        if (override[field] !== undefined) node[field] = override[field];
      }
      if (override.letterSpacing !== undefined) {
        node.letterSpacing = { unit: 'PIXELS', value: override.letterSpacing };
      }
      helpers.applyPaints(node, override);
      if (override.fills !== undefined) node.fills = override.fills;

      for (const field of override.unbind ?? []) {
        if (field === 'fills' || field === 'strokes') continue;
        node.setBoundVariable(field, null);
      }
      helpers.applyBindings(node, { ...override, name: label }, context);
      helpers.applyEffects(node, { ...override, name: label }, context);

      // Als laatste: FILL vraagt een auto-layout ouder, en dat is de
      // instance (of een frame daarin), die er nu staat.
      if (override.layoutSizingHorizontal) {
        node.layoutSizingHorizontal = override.layoutSizingHorizontal;
      }
    } catch (error) {
      context.log.error(
        `${label}: override op de instance van ${spec.component} mislukt: ${error.message}`
      );
    }
  }
}
