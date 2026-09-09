/**
 * Meet wat Figma daadwerkelijk met de kleur op een gebonden laag doet.
 *
 * Dit is geen controle die iets repareert. Het is een meting, en hij bestaat
 * omdat vier eerdere aannames over de icoonkleur na een tweede import allemaal
 * naast de oorzaak bleken te zitten. `verifyIconColors` leest de kleur terug op
 * de laag ín de variant en die klopt; in Figma is hij toch fout. Dat kan op twee
 * manieren tegelijk waar zijn, en deze meting scheidt ze:
 *
 * 1. **De kleur is fout op een geplaatste instance, niet op de variant.** Figma
 *    zoekt de override van een geneste laag terug via het laagpad, en een
 *    variant wordt bij elke import van binnen opnieuw opgebouwd. Dan meet de
 *    plugin op de variant iets anders dan de designer op zijn pagina ziet.
 * 2. **De kleur wordt pas ná de import opgeruimd.** Alles wat de plugin schrijft
 *    gebeurt binnen één synchrone run. Ruimt Figma daarna nog iets op, dan leest
 *    elke controle die in diezelfde run draait de goede waarde terug.
 *
 * Vandaar twee metingen: één direct na de import, één na een tick. En elke
 * meting op twee plekken: op de variant en op elke geplaatste instance ervan.
 *
 * De TEXT-laag gaat mee omdat hij aan dezelfde variable hangt als de iconen.
 * Verliest het icoon zijn kleur en de tekst niet, dan is het iets van de geneste
 * instance en niet van de binding in het algemeen.
 */

/** Hoe lang er gewacht wordt voordat er een tweede keer gemeten wordt. */
const SETTLE_MS = 400;

/** Hoeveel varianten er regel voor regel in de log komen. */
const SAMPLE_VARIANTS = 3;

/**
 * `collection|naam` per variable-id.
 *
 * Een gelezen binding levert een id op en dat zegt in een log niets. De index
 * van de import gaat de andere kant op, dus die wordt hier omgedraaid.
 */
function namesById(variables) {
  const byId = new Map();
  for (const [name, variable] of variables.byName) byId.set(variable.id, name);
  return byId;
}

/** `dsn/Components|link/color` wordt `Components|link/color`. */
function short(name) {
  return name ? name.replace(/^dsn\//, '') : name;
}

/** De naam achter een gelezen binding, of wat er in plaats daarvan stond. */
function nameOf(id, byId) {
  if (!id) return 'geen binding';
  return short(byId.get(id) ?? `onbekende variable ${id}`);
}

/**
 * Het pad van kind-indexen van `root` naar `node`.
 *
 * Op index en niet op naam: een geplaatste instance spiegelt de lagen van zijn
 * component op volgorde, en laagnamen zijn niet uniek. De twee iconen in
 * dezelfde variant heten allebei naar hun glyph.
 */
function pathTo(root, node) {
  const path = [];
  let current = node;

  while (current && current !== root) {
    const parent = current.parent;
    if (!parent) return null;
    const index = parent.children.indexOf(current);
    if (index === -1) return null;
    path.unshift(index);
    current = parent;
  }

  return current === root ? path : null;
}

/** De laag op `path` onder `root`, of null als het pad daar niet bestaat. */
function nodeAt(root, path) {
  let current = root;
  for (const index of path) {
    const children = current && current.children;
    if (!children || !children[index]) return null;
    current = children[index];
  }
  return current;
}

/**
 * De diepste laag die echt een vulling draagt.
 *
 * Bij een icoon is dat de `Shape` binnen de `Group` binnen de instance; het
 * kader eromheen heeft geen vulling. Bij een tekstlaag is het de laag zelf.
 */
function paintedNode(node) {
  if (!node) return null;
  if (Array.isArray(node.fills) && node.fills.length) return node;
  for (const child of node.children ?? []) {
    const found = paintedNode(child);
    if (found) return found;
  }
  return null;
}

/** De variable-id die aan de eerste vulling van deze laag hangt. */
function boundColorOf(node) {
  const paint = node?.fills?.[0];
  return paint?.boundVariables?.color?.id ?? null;
}

/**
 * De geplaatste instances van een variant.
 *
 * Welke API dat oplevert verschilt per versie, en in de mock bestaat geen van
 * beide. Zonder instances blijft de meting bruikbaar; hij meldt dan alleen
 * niets over de kant die er het meest toe doet.
 */
async function placedInstancesOf(variant) {
  try {
    if (typeof variant.getInstancesAsync === 'function') {
      return (await variant.getInstancesAsync()) ?? [];
    }
    if (Array.isArray(variant.instances)) return variant.instances;
  } catch {
    // Zonder loadAllPagesAsync weigert Figma dit; dan is er niets te meten.
  }
  return [];
}

/** De lagen die de import aan een kleur-variable had moeten binden. */
function buildProbes(context) {
  const probes = [];

  for (const check of context.colorChecks ?? []) {
    if (!check.variant) continue;

    const painted = paintedNode(check.node);
    const path = painted ? pathTo(check.variant, painted) : null;

    probes.push({
      variant: check.variant,
      slot: check.spec.componentSlot ?? check.spec.type.toLowerCase(),
      name: check.spec.name ?? check.spec.type,
      type: check.spec.type,
      wanted: `${check.spec.boundVariables.fills.collection}|${check.spec.boundVariables.fills.name}`,
      path,
    });
  }

  return probes;
}

/** Leest elke probe terug, op de variant en op elke instance ervan. */
async function measure(probes, byId) {
  const instancesPerVariant = new Map();
  const rows = [];

  for (const probe of probes) {
    if (!probe.path) {
      rows.push({ probe, onVariant: null, onInstances: [] });
      continue;
    }

    if (!instancesPerVariant.has(probe.variant)) {
      instancesPerVariant.set(
        probe.variant,
        await placedInstancesOf(probe.variant)
      );
    }

    rows.push({
      probe,
      onVariant: nameOf(boundColorOf(nodeAt(probe.variant, probe.path)), byId),
      onInstances: instancesPerVariant
        .get(probe.variant)
        .map((instance) =>
          nameOf(boundColorOf(nodeAt(instance, probe.path)), byId)
        ),
    });
  }

  return { rows, instances: instancesPerVariant };
}

/** Telt hoeveel lagen dragen wat de spec wilde, per plek en per laagtype. */
function tally(rows) {
  const counts = {
    variantOk: 0,
    variantWrong: 0,
    instanceOk: 0,
    instanceWrong: 0,
    iconInstanceWrong: 0,
    textInstanceWrong: 0,
    unmeasured: 0,
  };

  for (const { probe, onVariant, onInstances } of rows) {
    if (!probe.path) {
      counts.unmeasured += 1;
      continue;
    }

    const wanted = short(probe.wanted);
    if (onVariant === wanted) counts.variantOk += 1;
    else counts.variantWrong += 1;

    for (const actual of onInstances) {
      if (actual === wanted) {
        counts.instanceOk += 1;
        continue;
      }
      counts.instanceWrong += 1;
      if (probe.type === 'TEXT') counts.textInstanceWrong += 1;
      else counts.iconInstanceWrong += 1;
    }
  }

  return counts;
}

/** Regel voor regel, zodat de meting na te lezen is en niet alleen te tellen. */
function sampleLines(rows, log) {
  const seen = new Set();

  for (const { probe, onVariant, onInstances } of rows) {
    if (!probe.path) {
      log.warn(
        `    ${probe.name}: geen laag met een vulling gevonden; niet gemeten`
      );
      continue;
    }

    if (!seen.has(probe.variant) && seen.size >= SAMPLE_VARIANTS) continue;
    if (!seen.has(probe.variant)) {
      seen.add(probe.variant);
      log.info(`  ${probe.variant.name}`);
    }

    const wanted = short(probe.wanted);
    const variantCell = onVariant === wanted ? 'zoals gevraagd' : onVariant;
    const instanceCell = onInstances.length
      ? onInstances
          .map((actual) => (actual === wanted ? 'zoals gevraagd' : actual))
          .join(' / ')
      : 'geen instance';

    log.info(
      `    ${probe.slot} (${probe.name}) wil ${wanted} | variant: ${variantCell} | instance: ${instanceCell}`
    );
  }
}

/**
 * Meet de kleuren, wacht een tick, en meet ze nog een keer.
 *
 * @param {object} context de importcontext, met `colorChecks` en `variables`
 * @param {object} log verzamelaar met .info/.warn/.error
 * @param {string} name de naam van de component set, voor de kop in de log
 */
export async function diagnoseColors(context, log, name) {
  const byId = namesById(context.variables);
  const probes = buildProbes(context);

  if (!probes.length) {
    log.warn(`DIAGNOSE ${name}: geen gebonden kleurlagen om te meten`);
    return null;
  }

  const first = await measure(probes, byId);
  const placed = [...first.instances.values()].reduce(
    (total, list) => total + list.length,
    0
  );
  const variants = new Set(probes.map((probe) => probe.variant)).size;

  log.info(
    `DIAGNOSE ${name}: ${probes.length} gebonden kleurlagen in ${variants} varianten, ${placed} geplaatste instances gevonden`
  );

  if (!placed) {
    log.warn(
      '  Er staat geen geplaatste instance van deze varianten in het bestand. Sleep een variant naar een gewone pagina en importeer nog een keer; zonder instance is de belangrijkste helft van deze meting leeg.'
    );
  }

  const before = tally(first.rows);
  log.info(
    `  direct na de import | variant: ${before.variantOk} zoals gevraagd, ${before.variantWrong} niet | instance: ${before.instanceOk} zoals gevraagd, ${before.instanceWrong} niet`
  );
  if (before.instanceWrong) {
    log.info(
      `    van de afwijkende lagen op een instance zijn er ${before.iconInstanceWrong} icoon en ${before.textInstanceWrong} tekst`
    );
  }

  sampleLines(first.rows, log);

  // De tweede meting. Alles wat de plugin schrijft gebeurt in één synchrone
  // run; ruimt Figma daarna nog iets op, dan is dat hier te zien en nergens
  // anders.
  await new Promise((resolve) => setTimeout(resolve, SETTLE_MS));
  const second = await measure(probes, byId);
  const after = tally(second.rows);

  const changed = second.rows.filter((row, index) => {
    const was = first.rows[index];
    return (
      row.onVariant !== was.onVariant ||
      row.onInstances.join(' ') !== was.onInstances.join(' ')
    );
  }).length;

  log.info(
    `  na ${SETTLE_MS}ms opnieuw gemeten | variant: ${after.variantOk} zoals gevraagd, ${after.variantWrong} niet | instance: ${after.instanceOk} zoals gevraagd, ${after.instanceWrong} niet`
  );
  log.info(
    changed
      ? `  ${changed} van de ${probes.length} lagen zijn tussen de twee metingen veranderd: Figma ruimt de kleur na de import nog op`
      : '  geen enkele laag is tussen de twee metingen veranderd: wat de plugin achterlaat blijft staan'
  );

  return { probes: probes.length, placed, before, after, changed };
}
