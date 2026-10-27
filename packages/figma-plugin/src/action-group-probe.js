/**
 * Meet wat de Plugin API doet met een ActionGroup als component met een slot,
 * voordat er iets op gebouwd wordt.
 *
 * De slotmeting van issue #450 liet twee dingen open die ActionGroup nodig
 * heeft:
 *
 *  A. Afbreken naar een nieuwe regel. ActionGroup heeft `flex-wrap: wrap` en
 *     een aparte gap voor kolommen en rijen. Het slot moet dat dus zelf
 *     dragen: `layoutWrap = 'WRAP'` en `counterAxisSpacing`, beide aan hun
 *     variable gebonden. Grid weigert Figma op een slot; of wrap wel mag, is
 *     niet bekend.
 *  B. Slot in slot. De footer van ModalDialog is een slot, en daarin komt een
 *     instance van ActionGroup met zijn eigen slot. Kan een designer in een
 *     geplaatste dialog de knoppen in dat binnenste slot aanpassen? En gaat
 *     dat beter als de footer géén slot is, maar een gewoon frame met de
 *     ActionGroup als exposed instance?
 *  C. De tweede import. Blijft wat een designer in dat binnenste slot deed
 *     staan, als (1) de plugin de footer opnieuw vult en de ActionGroup-
 *     instance laat staan, en (2) de standaardinhoud van ActionGroup zelf
 *     verandert?
 *
 * Zelfde opzet als de slotmeting: alles op een eigen pagina,
 * `dsn-meting/ActionGroup`, die bij een volgende run eerst weggaat en na
 * afloop blijft staan. Elke stap draait los; een stap die mislukt houdt de
 * rest niet tegen. Waar het ertoe doet wordt twee keer gelezen: direct, en na
 * een tick.
 *
 * Tijdelijk: gaat weer weg zodra ActionGroup gebouwd is.
 */

import { openPage } from './pages.js';

const PAGE_NAME = 'dsn-meting/ActionGroup';
const SETTLE_MS = 400;
const FONT = { family: 'Inter', style: 'Regular' };

const settle = () => new Promise((resolve) => setTimeout(resolve, SETTLE_MS));

function describe(node) {
  if (!node) return 'niets';
  const parts = [`${node.type} "${node.name}"`];
  if ('layoutMode' in node) parts.push(`layoutMode=${node.layoutMode}`);
  if ('layoutWrap' in node) parts.push(`layoutWrap=${node.layoutWrap}`);
  if ('children' in node) parts.push(`${node.children.length} kinderen`);
  return parts.join(', ');
}

function slotsIn(node) {
  if (!node || typeof node.findAll !== 'function') return [];
  return node.findAll((child) => child.type === 'SLOT');
}

/** Het slot met deze naam, ergens in de boom. */
function slotNamed(node, name) {
  return slotsIn(node).find((slot) => slot.name === name) ?? null;
}

function texts(node) {
  if (!node || typeof node.findAll !== 'function') return [];
  return node
    .findAll((child) => child.type === 'TEXT')
    .map((child) => child.characters);
}

export async function probeActionGroup(log) {
  let passed = 0;
  let failed = 0;

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

  // De echte gap-variables, als variables.json al geïmporteerd is. Zonder
  // die import slaat de meting alleen de bindingen over.
  let columnGap = null;
  let rowGap = null;
  await step('variables action-group/column-gap en row-gap', async () => {
    const floats = await figma.variables.getLocalVariablesAsync('FLOAT');
    columnGap = floats.find((v) => v.name === 'action-group/column-gap');
    rowGap = floats.find((v) => v.name === 'action-group/row-gap');
    return `column-gap ${columnGap ? 'gevonden' : 'ontbreekt'}, row-gap ${rowGap ? 'gevonden' : 'ontbreekt'}`;
  });

  let cursorX = 0;
  const place = (node, y = 0) => {
    node.x = cursorX;
    node.y = y;
    cursorX += Math.max(node.width, 240) + 80;
  };

  // ---------------------------------------------------------------------------
  // De knop: een klein component met een TEXT-property, zoals Button.
  // ---------------------------------------------------------------------------
  const button = figma.createComponent();
  button.name = 'knop';
  button.layoutMode = 'HORIZONTAL';
  button.primaryAxisSizingMode = 'AUTO';
  button.counterAxisSizingMode = 'AUTO';
  button.paddingLeft = 12;
  button.paddingRight = 12;
  button.paddingTop = 8;
  button.paddingBottom = 8;
  button.fills = [{ type: 'SOLID', color: { r: 0.85, g: 0.9, b: 1 } }];
  const buttonText = figma.createText();
  buttonText.fontName = FONT;
  buttonText.characters = 'Knop';
  button.appendChild(buttonText);
  let labelKey = null;
  await step('knop met TEXT-property label', () => {
    labelKey = button.addComponentProperty('label', 'TEXT', 'Knop');
    buttonText.componentPropertyReferences = { characters: labelKey };
    return labelKey;
  });
  page.appendChild(button);
  place(button);

  const addButtons = (target, count, prefix) => {
    for (let index = 0; index < count; index += 1) {
      const instance = button.createInstance();
      target.appendChild(instance);
      if (labelKey) {
        instance.setProperties({ [labelKey]: `${prefix} ${index + 1}` });
      }
    }
  };

  // ---------------------------------------------------------------------------
  heading('A. ActionGroup: een slot dat afbreekt');
  // ---------------------------------------------------------------------------
  const group = figma.createComponent();
  group.name = 'actiegroep';
  group.layoutMode = 'HORIZONTAL';
  group.primaryAxisSizingMode = 'AUTO';
  group.counterAxisSizingMode = 'AUTO';
  group.fills = [];
  page.appendChild(group);

  let slot = null;
  await step('createSlot binnen de root, naam "slot"', () => {
    slot = group.createSlot();
    slot.name = 'slot';
    return describe(slot);
  });
  await step('layoutMode HORIZONTAL', () => {
    slot.layoutMode = 'HORIZONTAL';
    return slot.layoutMode;
  });
  await step('layoutWrap WRAP', () => {
    slot.layoutWrap = 'WRAP';
    return slot.layoutWrap;
  });
  await step('itemSpacing 16 en counterAxisSpacing 8', () => {
    slot.itemSpacing = 16;
    slot.counterAxisSpacing = 8;
    return `itemSpacing=${slot.itemSpacing}, counterAxisSpacing=${slot.counterAxisSpacing}`;
  });
  await step('counterAxisAlignItems CENTER', () => {
    slot.counterAxisAlignItems = 'CENTER';
    return slot.counterAxisAlignItems;
  });
  if (columnGap && rowGap) {
    await step('itemSpacing gebonden aan column-gap', () => {
      slot.setBoundVariable('itemSpacing', columnGap);
      return slot.boundVariables?.itemSpacing?.id === columnGap.id
        ? 'gebonden'
        : `niet gebonden: ${JSON.stringify(slot.boundVariables?.itemSpacing ?? null)}`;
    });
    await step('counterAxisSpacing gebonden aan row-gap', () => {
      slot.setBoundVariable('counterAxisSpacing', rowGap);
      return slot.boundVariables?.counterAxisSpacing?.id === rowGap.id
        ? 'gebonden'
        : `niet gebonden: ${JSON.stringify(slot.boundVariables?.counterAxisSpacing ?? null)}`;
    });
  } else {
    note('bindingen overgeslagen: importeer eerst variables.json');
  }
  await step('slot vult de breedte van de groep (FILL)', () => {
    slot.layoutSizingHorizontal = 'FILL';
    slot.layoutSizingVertical = 'HUG';
    return `${slot.layoutSizingHorizontal} / ${slot.layoutSizingVertical}`;
  });
  await step('2 knoppen als standaardinhoud', () => {
    addButtons(slot, 2, 'Standaard');
    return texts(slot).join(', ');
  });
  place(group);

  await step('afbreken: groep 160 breed met 4 knoppen', () => {
    const instance = group.createInstance();
    page.appendChild(instance);
    instance.x = group.x;
    instance.y = 200;
    addButtons(slotNamed(instance, 'slot'), 2, 'Extra');
    instance.layoutSizingHorizontal = 'FIXED';
    instance.resize(160, instance.height);
    const rows = new Set(
      slotNamed(instance, 'slot').children.map((child) => Math.round(child.y))
    );
    return `${rows.size} rijen, hoogte ${Math.round(instance.height)}`;
  });
  await settle();
  await step('afbreken na een tick', () => {
    const instance = page.children.find(
      (node) => node.type === 'INSTANCE' && node.y === 200
    );
    const rows = new Set(
      slotNamed(instance, 'slot').children.map((child) => Math.round(child.y))
    );
    return `${rows.size} rijen, hoogte ${Math.round(instance.height)}`;
  });

  // ---------------------------------------------------------------------------
  heading('B. Slot in slot');
  // ---------------------------------------------------------------------------
  /** Een dialog met een footer: als slot, of als gewoon frame. */
  const buildDialog = (name, footerAsSlot) => {
    const dialog = figma.createComponent();
    dialog.name = name;
    dialog.layoutMode = 'VERTICAL';
    dialog.primaryAxisSizingMode = 'AUTO';
    dialog.counterAxisSizingMode = 'FIXED';
    dialog.resize(320, 100);
    dialog.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    page.appendChild(dialog);

    let footer;
    if (footerAsSlot) {
      footer = dialog.createSlot();
    } else {
      footer = figma.createFrame();
      dialog.appendChild(footer);
    }
    footer.name = 'footer';
    footer.layoutMode = 'VERTICAL';
    footer.paddingTop = 16;
    footer.paddingBottom = 16;
    footer.paddingLeft = 16;
    footer.paddingRight = 16;
    footer.fills = [];
    footer.layoutSizingHorizontal = 'FILL';
    footer.layoutSizingVertical = 'HUG';

    const nested = group.createInstance();
    footer.appendChild(nested);
    nested.layoutSizingHorizontal = 'FILL';
    return { dialog, footer, nested };
  };

  let slotDialog = null;
  await step('B1 dialog met footer als slot, ActionGroup erin', () => {
    slotDialog = buildDialog('dialog (footer = slot)', true);
    place(slotDialog.dialog);
    return `${describe(slotDialog.footer)}; slots in de dialog: ${slotsIn(
      slotDialog.dialog
    )
      .map((s) => s.name)
      .join(', ')}`;
  });
  await step('B1 properties van de dialog', () =>
    Object.entries(slotDialog.dialog.componentPropertyDefinitions)
      .map(([key, def]) => `${key}: ${def.type}`)
      .join(' | ')
  );

  let plainDialog = null;
  await step('B2 dialog met footer als frame, ActionGroup erin', () => {
    plainDialog = buildDialog('dialog (footer = frame)', false);
    place(plainDialog.dialog);
    return describe(plainDialog.footer);
  });
  await step('B2 ActionGroup exposed in het frame', () => {
    plainDialog.nested.isExposedInstance = true;
    return `${plainDialog.nested.isExposedInstance}, ${
      plainDialog.dialog.exposedInstances?.length ?? 0
    } exposed`;
  });

  /** Wat een designer in een geplaatste dialog doet met de knoppen. */
  const editAsDesigner = async (title, dialog) => {
    let placed = null;
    const ready = await step(`${title}: instance plaatsen`, () => {
      placed = dialog.createInstance();
      page.appendChild(placed);
      placed.x = dialog.x;
      placed.y = 400;
      return slotsIn(placed)
        .map((s) => `${s.name} (${s.children.length})`)
        .join(', ');
    });
    if (!ready) return null;

    const inner = () => slotNamed(placed, 'slot');
    await step(`${title}: binnenste slot gevonden`, () => {
      if (!inner()) throw new Error('geen slot "slot" in de instance');
      return describe(inner());
    });
    await step(`${title}: knop toevoegen in het binnenste slot`, () => {
      addButtons(inner(), 1, 'Designer');
      return texts(inner()).join(', ');
    });
    await step(`${title}: eerste knop weghalen`, () => {
      inner().children[0].remove();
      return texts(inner()).join(', ');
    });
    await step(`${title}: tekst van een knop aanpassen`, () => {
      inner().children[0].setProperties({ [labelKey]: 'Aangepast' });
      return texts(inner()).join(', ');
    });
    await settle();
    await step(`${title}: na een tick`, () => texts(inner()).join(', '));
    return placed;
  };

  const placedSlot = slotDialog
    ? await editAsDesigner('B3 footer = slot', slotDialog.dialog)
    : null;
  const placedPlain = plainDialog
    ? await editAsDesigner('B4 footer = frame', plainDialog.dialog)
    : null;

  // ---------------------------------------------------------------------------
  heading('C. De tweede import');
  // ---------------------------------------------------------------------------
  // C1: de plugin vult de footer opnieuw en laat de ActionGroup-instance
  // staan (zo werkt resetVariant voor instances in een slot). Alleen de
  // footer-padding verandert, als teken dat er iets is bijgewerkt.
  if (placedSlot) {
    await step('C1 footer bijgewerkt, ActionGroup blijft staan', () => {
      slotDialog.footer.paddingTop = 20;
      return texts(slotNamed(placedSlot, 'slot')).join(', ');
    });
  }
  if (placedPlain) {
    await step('C1 idem bij footer = frame', () => {
      plainDialog.footer.paddingTop = 20;
      return texts(slotNamed(placedPlain, 'slot')).join(', ');
    });
  }

  // C2: de standaardinhoud van ActionGroup zelf verandert, zoals bij een
  // tweede import van action-group.json. Het slot blijft, de knoppen gaan
  // eruit en er komen nieuwe in.
  await step('C2 standaardinhoud van ActionGroup vervangen', () => {
    for (const child of [...slot.children]) child.remove();
    addButtons(slot, 2, 'Nieuw');
    return texts(slot).join(', ');
  });
  await settle();
  if (placedSlot) {
    await step('C2 footer = slot, aangepaste instance', () =>
      texts(slotNamed(placedSlot, 'slot')).join(', ')
    );
  }
  if (placedPlain) {
    await step('C2 footer = frame, aangepaste instance', () =>
      texts(slotNamed(placedPlain, 'slot')).join(', ')
    );
  }
  await step('C2 een nieuwe, ongemoeide dialog-instance', () => {
    const fresh = slotDialog.dialog.createInstance();
    page.appendChild(fresh);
    fresh.x = slotDialog.dialog.x;
    fresh.y = 700;
    return texts(slotNamed(fresh, 'slot')).join(', ');
  });

  figma.viewport.scrollAndZoomIntoView(page.children);
  return { passed, failed };
}
