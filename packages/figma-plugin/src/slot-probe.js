/**
 * Meet wat de Plugin API met slots doet, voordat er iets op gebouwd wordt.
 *
 * Issue #450. Slots bestaan in de Plugin API sinds 10 juni 2026, en op het
 * Figma-forum staat dat het vullen van een slot per script een tijd niet
 * werkte. Een mock bouwen op aannames over zo'n jonge API is precies hoe de
 * icoonkleur vier keer naast de oorzaak zat (zie `diagnose.js`). Dus eerst
 * meten, in Figma zelf.
 *
 * De meting bouwt alles op een eigen pagina, `dsn-meting/Slots`, en raakt de
 * rest van het bestand niet aan. Bij een volgende run gaat die pagina eerst
 * weg, zodat de uitkomst niet van een vorige run afhangt. Hij blijft na afloop
 * staan, zodat je kunt bekijken wat er gebouwd is.
 *
 * Elke stap draait los en logt wat hij zag. Een stap die mislukt houdt de rest
 * niet tegen: juist wát er mislukt is de uitkomst.
 *
 * De vragen, in de volgorde van de log:
 *
 *  A. Bestaat `createSlot`, en wat levert hij op (type, ouder, property)?
 *  B. Kan het slot zelf auto layout dragen, met padding en itemSpacing?
 *  C. Kan het slot standaardinhoud krijgen: instances van een ander component,
 *     exposed, met hun TEXT-property in het paneel?
 *  D. Een tweede slot in hetzelfde component, en of het weghalen van een slot
 *     zijn property opruimt.
 *  E. Hoe gaat het in een set: krijgt elke variant zijn eigen slot-property, of
 *     delen ze er één?
 *  F. In een instance: per script een item toevoegen, weghalen en de tekst
 *     ervan aanpassen.
 *  G. De tweede import. Onze plugin bouwt een variant van binnen opnieuw op.
 *     Wat gebeurt er met een instance waarvan een designer het slot al vulde,
 *     als (1) het slot blijft staan en alleen zijn standaardinhoud wordt
 *     vervangen, of (2) het slot weggaat en opnieuw wordt gemaakt?
 *  H. `resetSlot` en `limitViolations` op een instance.
 *
 * Niet gemeten, want al bekend: de root van een component kan zelf geen slot
 * zijn. Het slot is een frame binnen de root, met de naam `slot`. Zo doet een
 * designer het met de hand, en zo bouwt deze meting het ook.
 *
 * Alles wordt twee keer gelezen waar het ertoe doet: direct, en na een tick.
 * Figma werkt instances soms pas na de synchrone run bij.
 */

import { openPage } from './pages.js';

const PAGE_NAME = 'dsn-meting/Slots';
const SETTLE_MS = 400;
const FONT = { family: 'Inter', style: 'Regular' };

const settle = () => new Promise((resolve) => setTimeout(resolve, SETTLE_MS));

/** Korte, leesbare beschrijving van een node voor in de log. */
function describe(node) {
  if (!node) return 'niets';
  const parts = [`${node.type} "${node.name}"`];
  if ('layoutMode' in node) parts.push(`layoutMode=${node.layoutMode}`);
  if ('children' in node) parts.push(`${node.children.length} kinderen`);
  return parts.join(', ');
}

/** De property-definities van een component of set, compact. */
function definitions(node) {
  try {
    const defs = node.componentPropertyDefinitions ?? {};
    const entries = Object.entries(defs);
    if (!entries.length) return 'geen properties';
    return entries
      .map(([key, def]) => {
        const settings = def.slotSettings
          ? ` slotSettings=${JSON.stringify(def.slotSettings)}`
          : '';
        const extra = Object.keys(def)
          .filter(
            (field) => !['type', 'defaultValue', 'slotSettings'].includes(field)
          )
          .join(',');
        return `${key}: ${def.type} default=${JSON.stringify(def.defaultValue)}${settings}${extra ? ` (velden: ${extra})` : ''}`;
      })
      .join(' | ');
  } catch (error) {
    return `componentPropertyDefinitions gooit: ${error.message}`;
  }
}

function slotIn(node) {
  if (!node) return null;
  if (node.type === 'SLOT') return node;
  if (typeof node.findOne === 'function') {
    return node.findOne((child) => child.type === 'SLOT');
  }
  return null;
}

function texts(node) {
  if (!node || typeof node.findAll !== 'function') return [];
  return node
    .findAll((child) => child.type === 'TEXT')
    .map((child) => child.characters);
}

export async function probeSlots(log) {
  let passed = 0;
  let failed = 0;

  /** Eén stap: logt de uitkomst, gooit nooit. */
  const step = async (label, run) => {
    try {
      const result = await run();
      passed += 1;
      log.info(`✓ ${label}${result !== undefined ? `: ${result}` : ''}`);
      return true;
    } catch (error) {
      failed += 1;
      log.error(`✗ ${label}: ${error.message}`);
      return false;
    }
  };
  const note = (message) => log.info(`  ${message}`);
  const heading = (message) => log.warn(`— ${message}`);

  heading('Omgeving');
  note(`apiVersion: ${figma.apiVersion ?? 'onbekend'}`);
  note(`figma.createSlot: ${typeof figma.createSlot}`);

  // Een schone pagina. Alleen de pagina die deze meting zelf maakt gaat weg.
  if (typeof figma.loadAllPagesAsync === 'function') {
    await figma.loadAllPagesAsync();
  }
  const old = figma.root.children.find((page) => page.name === PAGE_NAME);
  const page = figma.createPage();
  page.name = PAGE_NAME;
  await openPage(page);
  if (old) {
    await step('vorige meetpagina opgeruimd', () => {
      old.remove();
    });
  }
  await figma.loadFontAsync(FONT);

  let cursorX = 0;
  const place = (node) => {
    node.x = cursorX;
    node.y = 0;
    cursorX += Math.max(node.width, 200) + 80;
  };

  // ---------------------------------------------------------------------------
  // Het item: een klein component met een TEXT-property, zoals `__item`.
  // ---------------------------------------------------------------------------
  const item = figma.createComponent();
  item.name = '__item';
  item.layoutMode = 'HORIZONTAL';
  item.primaryAxisSizingMode = 'AUTO';
  item.counterAxisSizingMode = 'AUTO';
  item.fills = [];
  const itemText = figma.createText();
  itemText.fontName = FONT;
  itemText.characters = 'Item';
  item.appendChild(itemText);
  let labelKey = null;
  await step('item met TEXT-property label', () => {
    labelKey = item.addComponentProperty('label', 'TEXT', 'Item');
    itemText.componentPropertyReferences = { characters: labelKey };
    return labelKey;
  });
  page.appendChild(item);
  place(item);

  /** Een lijst-component met een slot erin en drie items als standaard. */
  const buildHost = (name) => {
    const host = figma.createComponent();
    host.name = name;
    host.layoutMode = 'VERTICAL';
    host.primaryAxisSizingMode = 'AUTO';
    host.counterAxisSizingMode = 'AUTO';
    host.paddingLeft = 16;
    host.itemSpacing = 4;
    host.fills = [];
    page.appendChild(host);
    return host;
  };

  // ---------------------------------------------------------------------------
  heading('A. createSlot');
  // ---------------------------------------------------------------------------
  const host = buildHost('lijst');
  let slot = null;
  const hasCreateSlot = typeof host.createSlot === 'function';
  note(`component.createSlot: ${typeof host.createSlot}`);
  if (!hasCreateSlot) {
    log.error(
      '✗ createSlot bestaat niet op een ComponentNode in deze Figma. De rest van de meting heeft geen zin; update Figma en draai hem opnieuw.'
    );
    return { passed, failed: failed + 1 };
  }

  await step('createSlot() op een component', () => {
    slot = host.createSlot();
    return describe(slot);
  });
  await step('ouder van het slot', () => describe(slot?.parent));
  await step('properties na createSlot', () => definitions(host));
  await step('naam en type van het slot', () => `${slot.name} / ${slot.type}`);
  await step('slot hernoemen naar "slot"', () => {
    slot.name = 'slot';
    return definitions(host);
  });

  // ---------------------------------------------------------------------------
  heading('B. Auto layout op het slot');
  // ---------------------------------------------------------------------------
  await step('layoutMode VERTICAL', () => {
    slot.layoutMode = 'VERTICAL';
    return slot.layoutMode;
  });
  await step('itemSpacing 4 en paddingLeft 8', () => {
    slot.itemSpacing = 4;
    slot.paddingLeft = 8;
    return `itemSpacing=${slot.itemSpacing}, paddingLeft=${slot.paddingLeft}`;
  });
  await step('slot vult de breedte van het component (FILL)', () => {
    slot.layoutSizingHorizontal = 'FILL';
    return slot.layoutSizingHorizontal;
  });
  await step('slot hugt in de hoogte (HUG)', () => {
    slot.layoutSizingVertical = 'HUG';
    return slot.layoutSizingVertical;
  });
  await step('layoutMode GRID (mag volgens de docs niet)', () => {
    slot.layoutMode = 'GRID';
    const result = slot.layoutMode;
    slot.layoutMode = 'VERTICAL';
    return `werd ${result}`;
  });

  // ---------------------------------------------------------------------------
  heading('C. Standaardinhoud');
  // ---------------------------------------------------------------------------
  const fill = (target, count, prefix) => {
    for (let index = 0; index < count; index += 1) {
      const instance = item.createInstance();
      target.appendChild(instance);
      if (labelKey) {
        instance.setProperties({ [labelKey]: `${prefix} ${index + 1}` });
      }
    }
  };
  await step('3 item-instances in het slot', () => {
    fill(slot, 3, 'Standaard');
    return `${slot.children.length} kinderen: ${texts(slot).join(', ')}`;
  });
  await step('item-instances exposed', () => {
    for (const child of slot.children) child.isExposedInstance = true;
    return slot.children.map((child) => child.isExposedInstance).join(',');
  });
  await step('exposedInstances op het component', () => {
    const exposed = host.exposedInstances ?? [];
    return `${exposed.length} exposed`;
  });
  await step('item vult de breedte van het slot (FILL)', () => {
    slot.children[0].layoutSizingHorizontal = 'FILL';
    return slot.children[0].layoutSizingHorizontal;
  });
  await step('een gewoon frame in het slot (geen instance)', () => {
    const frame = figma.createFrame();
    frame.name = 'los frame';
    frame.resize(40, 8);
    slot.appendChild(frame);
    const count = slot.children.length;
    frame.remove();
    return `kon, ${count} kinderen`;
  });
  place(host);

  // ---------------------------------------------------------------------------
  heading('D. Meer dan één slot');
  // ---------------------------------------------------------------------------
  await step('tweede slot in hetzelfde component', () => {
    const second = host.createSlot();
    const result = `${describe(second)}; ${definitions(host)}`;
    second.remove();
    return result;
  });
  await step('slot weghalen ruimt de property op', () => {
    const extra = host.createSlot();
    extra.name = 'weg';
    const before = Object.keys(host.componentPropertyDefinitions).length;
    extra.remove();
    const after = Object.keys(host.componentPropertyDefinitions).length;
    return `${before} properties → ${after}`;
  });

  // ---------------------------------------------------------------------------
  heading('E. In een set');
  // ---------------------------------------------------------------------------
  const variants = [];
  for (const size of ['small', 'large']) {
    await step(`variant size=${size} met slot`, () => {
      const variant = buildHost(`size=${size}`);
      const variantSlot = variant.createSlot();
      variantSlot.name = 'slot';
      variantSlot.layoutMode = 'VERTICAL';
      fill(variantSlot, 2, size);
      variants.push(variant);
      return definitions(variant);
    });
  }
  let set = null;
  if (variants.length === 2) {
    await step('combineAsVariants', () => {
      set = figma.combineAsVariants(variants, page);
      set.name = 'lijst-set';
      set.layoutMode = 'HORIZONTAL';
      set.itemSpacing = 40;
      set.primaryAxisSizingMode = 'AUTO';
      set.counterAxisSizingMode = 'AUTO';
      place(set);
      return definitions(set);
    });
    await step('instance van de set wisselt van variant', () => {
      const instance = variants[0].createInstance();
      page.appendChild(instance);
      instance.y = 400;
      instance.x = set.x;
      const instanceSlot = slotIn(instance);
      fill(instanceSlot, 1, 'Eigen');
      const before = texts(instanceSlot).join(', ');
      instance.swapComponent(variants[1]);
      const after = texts(slotIn(instance)).join(', ');
      return `voor: ${before} | na wissel: ${after}`;
    });
  }

  // ---------------------------------------------------------------------------
  heading('F. Een instance vullen per script');
  // ---------------------------------------------------------------------------
  const instance = host.createInstance();
  page.appendChild(instance);
  instance.x = host.x;
  instance.y = 400;
  let instanceSlot = null;
  await step('slot in de instance', () => {
    instanceSlot = slotIn(instance);
    if (!instanceSlot)
      throw new Error('geen SLOT-node in de instance gevonden');
    return describe(instanceSlot);
  });
  await step('item toevoegen', () => {
    fill(instanceSlot, 1, 'Toegevoegd');
    return `${instanceSlot.children.length} kinderen`;
  });
  await step('item weghalen', () => {
    instanceSlot.children[0].remove();
    return `${instanceSlot.children.length} kinderen`;
  });
  await step('tekst van een item via zijn property', () => {
    const first = instanceSlot.children[0];
    first.setProperties({ [labelKey]: 'Aangepast' });
    return texts(instanceSlot).join(', ');
  });
  await step('item daarna nog aan te passen', () => {
    const last = instanceSlot.children[instanceSlot.children.length - 1];
    last.setProperties({ [labelKey]: 'Nog een keer' });
    return texts(instanceSlot).join(', ');
  });
  await settle();
  await step('na een tick', () => texts(slotIn(instance)).join(', '));
  await step('limitViolations', () =>
    JSON.stringify(slotIn(instance).limitViolations ?? null)
  );

  // ---------------------------------------------------------------------------
  heading('G. De tweede import');
  // ---------------------------------------------------------------------------
  // Een host per scenario, want scenario 2 is destructief.
  const scenario = async (title, rebuild) => {
    // De voorbereiding loopt ook via `step`: juist het vullen van een
    // instance per script is wat op het forum niet werkte, en dan moet de
    // rest van de meting gewoon doorgaan.
    let target = null;
    let placed = null;
    const ready = await step(`${title}: voorbereiden`, () => {
      target = buildHost(title);
      const targetSlot = target.createSlot();
      targetSlot.name = 'slot';
      targetSlot.layoutMode = 'VERTICAL';
      fill(targetSlot, 3, 'Standaard');
      place(target);

      placed = target.createInstance();
      page.appendChild(placed);
      placed.x = target.x;
      placed.y = 400;
      return describe(slotIn(placed));
    });
    if (!ready) return;

    const keyBefore = Object.keys(target.componentPropertyDefinitions).join(
      ','
    );
    // Wat een designer doet: één item erbij, de tekst van het eerste anders.
    const filled = await step(
      `${title}: instance vullen zoals een designer`,
      () => {
        const placedSlot = slotIn(placed);
        fill(placedSlot, 1, 'Designer');
        placedSlot.children[0].setProperties({ [labelKey]: 'Designer-tekst' });
        return texts(placedSlot).join(', ');
      }
    );
    if (!filled) {
      note(`${title}: overgeslagen, de instance liet zich niet vullen`);
      return;
    }

    await step(`${title}: opnieuw opbouwen`, () => rebuild(target));
    const keyAfter = Object.keys(target.componentPropertyDefinitions).join(',');
    await step(`${title}: property-key`, () =>
      keyBefore === keyAfter
        ? `gelijk gebleven (${keyAfter})`
        : `veranderd: ${keyBefore} → ${keyAfter}`
    );
    await step(`${title}: instance direct`, () =>
      texts(slotIn(placed)).join(', ')
    );
    await settle();
    await step(`${title}: instance na een tick`, () =>
      texts(slotIn(placed)).join(', ')
    );
  };

  await scenario('G1 slot blijft, inhoud vervangen', (target) => {
    const targetSlot = slotIn(target);
    for (const child of [...targetSlot.children]) child.remove();
    fill(targetSlot, 3, 'Nieuw');
    return texts(targetSlot).join(', ');
  });
  await scenario('G2 slot weg en opnieuw', (target) => {
    slotIn(target).remove();
    const fresh = target.createSlot();
    fresh.name = 'slot';
    fresh.layoutMode = 'VERTICAL';
    fill(fresh, 3, 'Nieuw');
    return texts(fresh).join(', ');
  });
  await scenario('G3 slot blijft, padding anders, inhoud blijft', (target) => {
    const targetSlot = slotIn(target);
    targetSlot.itemSpacing = 12;
    return `itemSpacing=${targetSlot.itemSpacing}`;
  });

  // ---------------------------------------------------------------------------
  heading('H. resetSlot');
  // ---------------------------------------------------------------------------
  await step('resetSlot op de instance uit F', () => {
    const target = slotIn(instance);
    if (typeof target.resetSlot !== 'function') {
      throw new Error('resetSlot bestaat niet');
    }
    target.resetSlot();
    return texts(slotIn(instance)).join(', ');
  });

  figma.viewport.scrollAndZoomIntoView(page.children);
  return { passed, failed };
}
