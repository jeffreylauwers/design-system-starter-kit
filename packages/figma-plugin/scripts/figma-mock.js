/**
 * Minimale nabootsing van de Figma Plugin API, genoeg om de import-logica
 * buiten Figma te kunnen draaien.
 *
 * De mock is bewust streng op de drie volgorde-eisen die in Figma echt fouten
 * geven, want dat zijn precies de bugs die je anders pas in de app ontdekt:
 *
 * 1. `characters` zetten voordat het font geladen is
 * 2. `layoutSizing*` op FILL terwijl de ouder geen auto layout heeft
 * 3. `layoutSizing*` op HUG terwijl de node zelf geen layoutMode heeft
 * 4. `gridColumnAnchorIndex` en `gridRowAnchorIndex` zijn read-only; plaatsen
 *    in een grid gaat via setGridChildPosition(rowIndex, columnIndex)
 * 5. `gridAutoTracks` gaat over automatisch rijen toevoegen; de maten van de
 *    tracks horen in `gridColumnSizes` en `gridRowSizes`
 * 6. `setBoundVariable` accepteert alleen bestaande velden, en het type van de
 *    variable moet bij het veld passen (een kleur is geen padding)
 * 7. padding, itemSpacing en de minimum-maten bestaan alleen op een frame met
 *    auto layout
 */

/**
 * Velden die Figma aan een variable laat binden, met het variable-type dat
 * erbij hoort. Alles wat hier niet in staat geeft in Figma
 * "cannot bind variable to field".
 */
const BINDABLE_FIELDS = {
  width: 'FLOAT',
  height: 'FLOAT',
  minWidth: 'FLOAT',
  maxWidth: 'FLOAT',
  minHeight: 'FLOAT',
  maxHeight: 'FLOAT',
  itemSpacing: 'FLOAT',
  counterAxisSpacing: 'FLOAT',
  paddingTop: 'FLOAT',
  paddingRight: 'FLOAT',
  paddingBottom: 'FLOAT',
  paddingLeft: 'FLOAT',
  topLeftRadius: 'FLOAT',
  topRightRadius: 'FLOAT',
  bottomRightRadius: 'FLOAT',
  bottomLeftRadius: 'FLOAT',
  strokeWeight: 'FLOAT',
  strokeTopWeight: 'FLOAT',
  strokeRightWeight: 'FLOAT',
  strokeBottomWeight: 'FLOAT',
  strokeLeftWeight: 'FLOAT',
  opacity: 'FLOAT',
  fontSize: 'FLOAT',
  letterSpacing: 'FLOAT',
  lineHeight: 'FLOAT',
  paragraphSpacing: 'FLOAT',
  paragraphIndent: 'FLOAT',
  fontWeight: 'FLOAT',
  visible: 'BOOLEAN',
  characters: 'STRING',
  fontFamily: 'STRING',
  fontStyle: 'STRING',
  textDecoration: 'STRING',
};

/** Velden die pas bestaan zodra de node auto layout heeft. */
const AUTO_LAYOUT_FIELDS = new Set([
  'itemSpacing',
  'counterAxisSpacing',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'minWidth',
  'maxWidth',
  'minHeight',
  'maxHeight',
]);

let nextId = 1;
const id = (prefix) => `${prefix}:${nextId++}`;

/** Velden waar een component property aan gekoppeld kan worden. */
const FIELD_FOR_PROPERTY_TYPE = {
  TEXT: 'characters',
  BOOLEAN: 'visible',
  INSTANCE_SWAP: 'mainComponent',
};
const COMPONENT_PROPERTY_FIELDS = new Set(
  Object.values(FIELD_FOR_PROPERTY_TYPE)
);

const loadedFonts = new Set();

class Node {
  constructor(type) {
    this.type = type;
    this.id = id(type);
    this.children = [];
    this.parent = null;
    this.width = 0;
    this.height = 0;
    this.x = 0;
    this.y = 0;
    this.layoutMode = 'NONE';
    this.fills = [];
    // Zoals in Figma: een nieuw grid heeft FLEX-tracks, dus wie ze niet zet
    // krijgt gelijke kolommen.
    this.gridColumnSizes = [];
    this.gridRowSizes = [];
  }

  appendChild(child) {
    if (child.parent) {
      child.parent.children = child.parent.children.filter((c) => c !== child);
    }
    child.parent = this;
    this.children.push(child);
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
  }

  // Read-only in de echte API: eraan toewijzen geeft "no setter for property".
  get gridColumnAnchorIndex() {
    return this._gridColumnAnchorIndex;
  }
  set gridColumnAnchorIndex(_value) {
    throw new Error('no setter for property gridColumnAnchorIndex');
  }
  get gridRowAnchorIndex() {
    return this._gridRowAnchorIndex;
  }
  set gridRowAnchorIndex(_value) {
    throw new Error('no setter for property gridRowAnchorIndex');
  }

  set gridAutoTracks(value) {
    if (typeof value === 'object') {
      throw new Error(
        "gridAutoTracks verwacht 'NONE' of 'ROWS'; gebruik gridColumnSizes en gridRowSizes voor trackmaten"
      );
    }
    this._gridAutoTracks = value;
  }
  get gridAutoTracks() {
    return this._gridAutoTracks;
  }

  setGridChildPosition(rowIndex, columnIndex) {
    if (!this.parent || this.parent.layoutMode !== 'GRID') {
      throw new Error('setGridChildPosition vereist een GRID-ouder');
    }
    if (!Number.isInteger(rowIndex) || !Number.isInteger(columnIndex)) {
      throw new Error('setGridChildPosition verwacht (rowIndex, columnIndex)');
    }
    if (columnIndex >= (this.parent.gridColumnCount ?? 1)) {
      throw new Error(`kolomindex ${columnIndex} valt buiten het grid`);
    }
    this._gridRowAnchorIndex = rowIndex;
    this._gridColumnAnchorIndex = columnIndex;
  }

  remove() {
    if (this.parent) {
      this.parent.children = this.parent.children.filter((c) => c !== this);
    }
  }

  /**
   * Zet de stroke om naar een vulling. De echte API levert een nieuwe node op
   * náást het origineel, in dezelfde ouder, en laat het origineel staan.
   * Zonder stroke is er niets om om te zetten en komt er null terug.
   */
  outlineStroke() {
    if (!Array.isArray(this.strokes) || !this.strokes.length) return null;
    if (!this.parent) {
      throw new Error('outlineStroke vereist een node in het document');
    }
    const outlined = new Node('VECTOR');
    outlined.name = this.name;
    outlined.width = this.width;
    outlined.height = this.height;
    outlined.x = this.x;
    outlined.y = this.y;
    outlined.fills = this.strokes.map((paint) => ({ ...paint }));
    this.parent.appendChild(outlined);
    return outlined;
  }

  // minWidth en maxWidth bestaan in Figma alleen op een auto-layout frame of
  // een direct kind daarvan; eraan toewijzen geeft anders een fout.
  set minWidth(value) {
    this.#assertAutoLayoutField('minWidth');
    this._minWidth = value;
  }
  get minWidth() {
    return this._minWidth;
  }
  set minHeight(value) {
    this.#assertAutoLayoutField('minHeight');
    this._minHeight = value;
  }
  get minHeight() {
    return this._minHeight;
  }

  #assertAutoLayoutField(field) {
    const inAutoLayout =
      this.layoutMode !== 'NONE' ||
      (this.parent && this.parent.layoutMode !== 'NONE');
    if (!inAutoLayout) {
      throw new Error(`${field} vereist auto layout`);
    }
  }

  /**
   * Figma weigert een reference naar een property die niet op de omvattende
   * component set staat, en naar een veld dat deze node niet heeft: een
   * `mainComponent` bestaat alleen op een instance, `characters` alleen op
   * tekst.
   */
  set componentPropertyReferences(value) {
    for (const [field, propertyId] of Object.entries(value ?? {})) {
      if (!COMPONENT_PROPERTY_FIELDS.has(field)) {
        throw new Error(`onbekend veld voor een component property: ${field}`);
      }
      if (field === 'mainComponent' && this.type !== 'INSTANCE') {
        throw new Error(
          `mainComponent bestaat alleen op een instance, niet op een ${this.type}`
        );
      }
      if (field === 'characters' && this.type !== 'TEXT') {
        throw new Error(
          `characters bestaat alleen op een tekstnode, niet op een ${this.type}`
        );
      }

      let ancestor = this.parent;
      while (ancestor && ancestor.type !== 'COMPONENT_SET') {
        ancestor = ancestor.parent;
      }
      if (!ancestor) {
        throw new Error(
          `${field}: deze laag hangt niet in een component set, dus er is geen property om naar te wijzen`
        );
      }
      if (!ancestor.componentPropertyDefinitions?.[propertyId]) {
        throw new Error(`property ${propertyId} bestaat niet op de set`);
      }
      const expected =
        FIELD_FOR_PROPERTY_TYPE[
          ancestor.componentPropertyDefinitions[propertyId].type
        ];
      if (expected !== field) {
        throw new Error(
          `${propertyId} is een ${ancestor.componentPropertyDefinitions[propertyId].type}-property en hoort aan ${expected}, niet aan ${field}`
        );
      }
    }
    this._componentPropertyReferences = value;
  }
  get componentPropertyReferences() {
    return this._componentPropertyReferences;
  }

  /**
   * Properties horen op een component of een component set. De naam moet uniek
   * zijn, en het type van de standaardwaarde moet bij het propertytype passen.
   */
  addComponentProperty(name, type, defaultValue, options) {
    if (this.type !== 'COMPONENT_SET' && this.type !== 'COMPONENT') {
      throw new Error(`addComponentProperty bestaat niet op een ${this.type}`);
    }
    if (!FIELD_FOR_PROPERTY_TYPE[type]) {
      throw new Error(`onbekend propertytype ${type}`);
    }

    this.componentPropertyDefinitions = this.componentPropertyDefinitions ?? {};
    const taken = Object.values(this.componentPropertyDefinitions).some(
      (definition) => definition.name === name
    );
    if (taken) throw new Error(`property ${name} bestaat al op deze set`);

    const expected = { TEXT: 'string', BOOLEAN: 'boolean' }[type];
    if (expected && typeof defaultValue !== expected) {
      throw new Error(
        `${type} verwacht een ${expected} als standaardwaarde, kreeg ${typeof defaultValue}`
      );
    }
    if (type === 'INSTANCE_SWAP') {
      // De echte API accepteert hier een verwijzing naar een component; wat
      // de plugin aanlevert moet in elk geval een niet-lege string zijn.
      if (typeof defaultValue !== 'string' || !defaultValue) {
        throw new Error(
          'INSTANCE_SWAP verwacht een verwijzing naar een component als standaardwaarde'
        );
      }
    }

    const propertyId = `${name}#${id('PROP')}`;
    this.componentPropertyDefinitions[propertyId] = {
      name,
      type,
      defaultValue,
      preferredValues: options?.preferredValues,
    };
    return propertyId;
  }

  setBoundVariable(field, variable) {
    const expected = BINDABLE_FIELDS[field];
    if (!expected) {
      throw new Error(`cannot bind variable to field ${field}`);
    }
    if (variable.resolvedType !== expected) {
      throw new Error(
        `${field} verwacht een ${expected}-variable, kreeg ${variable.resolvedType}`
      );
    }
    if (AUTO_LAYOUT_FIELDS.has(field) && this.layoutMode === 'NONE') {
      throw new Error(`${field} bestaat niet zonder auto layout`);
    }
    this.boundVariables = {
      ...this.boundVariables,
      [field]: { type: 'VARIABLE_ALIAS', id: variable.id },
    };
  }

  set layoutSizingHorizontal(value) {
    this.#assertSizing('layoutSizingHorizontal', value);
    this._layoutSizingHorizontal = value;
  }
  get layoutSizingHorizontal() {
    return this._layoutSizingHorizontal;
  }

  set layoutSizingVertical(value) {
    this.#assertSizing('layoutSizingVertical', value);
    this._layoutSizingVertical = value;
  }
  get layoutSizingVertical() {
    return this._layoutSizingVertical;
  }

  #assertSizing(axis, value) {
    if (value === 'HUG' && this.layoutMode === 'NONE') {
      throw new Error(`${axis}=HUG vereist een layoutMode op de node zelf`);
    }
    if (
      value === 'FILL' &&
      (!this.parent || this.parent.layoutMode === 'NONE')
    ) {
      throw new Error(`${axis}=FILL vereist een auto-layout ouder`);
    }
  }
}

/**
 * Een component heeft een `key` (de verwijzing die een instance swap gebruikt)
 * en kan instances maken. Een instance is een eigen node met een kopie van de
 * lagen van het component; overrides op die lagen zijn wat de plugin gebruikt
 * om een icoon de tekstkleur te geven.
 */
class ComponentNode extends Node {
  constructor() {
    super('COMPONENT');
    this.key = id('KEY');
  }

  createInstance() {
    const instance = new Node('INSTANCE');
    instance.mainComponent = this;
    instance.width = this.width;
    instance.height = this.height;
    for (const child of this.children) instance.appendChild(cloneNode(child));
    return instance;
  }
}

/** Diepe kopie van een laag, genoeg om overrides op te kunnen leggen. */
function cloneNode(node) {
  const copy = new Node(node.type);
  copy.name = node.name;
  copy.width = node.width;
  copy.height = node.height;
  copy.x = node.x;
  copy.y = node.y;
  copy.fills = node.fills ? node.fills.map((paint) => ({ ...paint })) : [];
  if (node.strokes) copy.strokes = node.strokes.map((paint) => ({ ...paint }));
  for (const child of node.children) copy.appendChild(cloneNode(child));
  return copy;
}

class TextNode extends Node {
  constructor() {
    super('TEXT');
    this._characters = '';
  }

  set characters(value) {
    const font = this.fontName;
    if (!font || !loadedFonts.has(`${font.family}|${font.style}`)) {
      throw new Error(
        `characters gezet zonder geladen font (${font ? `${font.family} ${font.style}` : 'geen fontName'})`
      );
    }
    this._characters = value;
  }
  get characters() {
    return this._characters;
  }
}

class Variable {
  constructor(name, collection, resolvedType) {
    this.id = id('VAR');
    this.name = name;
    this.resolvedType = resolvedType;
    this.variableCollectionId = collection.id;
    this.valuesByMode = {};
    this.description = '';
  }

  setValueForMode(modeId, value) {
    if (!modeId) throw new Error(`onbekende modeId voor ${this.name}`);
    this.valuesByMode[modeId] = value;
  }

  remove() {
    state.variables = state.variables.filter((v) => v !== this);
  }
}

class VariableCollection {
  constructor(name) {
    this.id = id('COL');
    this.name = name;
    this.modes = [{ modeId: id('MODE'), name: 'Mode 1' }];
  }

  addMode(name) {
    // Figma begrenst het aantal modes per plan; Professional staat er 10 toe.
    if (this.modes.length >= 10) {
      throw new Error('Limiet van 10 modes per collection bereikt');
    }
    const mode = { modeId: id('MODE'), name };
    this.modes.push(mode);
    return mode.modeId;
  }

  renameMode(modeId, name) {
    const mode = this.modes.find((m) => m.modeId === modeId);
    if (!mode) throw new Error(`mode ${modeId} bestaat niet`);
    mode.name = name;
  }
}

const rootPage = new Node('PAGE');
rootPage.name = 'Page 1';

const root = new Node('DOCUMENT');
root.appendChild(rootPage);

const state = {
  collections: [],
  variables: [],
  page: rootPage,
  root,
};

export const figma = {
  root,
  currentPage: rootPage,
  viewport: { scrollAndZoomIntoView() {} },
  ui: { postMessage() {} },
  showUI() {},
  closePlugin() {},

  variables: {
    async getLocalVariableCollectionsAsync() {
      return state.collections;
    },
    async getLocalVariablesAsync() {
      return state.variables;
    },
    createVariableCollection(name) {
      const collection = new VariableCollection(name);
      state.collections.push(collection);
      return collection;
    },
    createVariable(name, collection, resolvedType) {
      const variable = new Variable(name, collection, resolvedType);
      state.variables.push(variable);
      return variable;
    },
    createVariableAlias(variable) {
      return { type: 'VARIABLE_ALIAS', id: variable.id };
    },
    setBoundVariableForPaint(paint, field, variable) {
      if (field !== 'color') {
        throw new Error(`een paint kent geen veld ${field}`);
      }
      if (variable.resolvedType !== 'COLOR') {
        throw new Error(
          `een paint verwacht een COLOR-variable, kreeg ${variable.resolvedType}`
        );
      }
      // Paints zijn immutable in de Plugin API: er komt een nieuwe uit.
      return {
        ...paint,
        boundVariables: {
          ...paint.boundVariables,
          color: { type: 'VARIABLE_ALIAS', id: variable.id },
        },
      };
    },
  },

  async loadFontAsync(font) {
    // Alleen fonts die Figma standaard heeft plus het font van dit systeem.
    const known = ['Inter', 'IBM Plex Sans', 'IBM Plex Mono', 'Roboto'];
    if (!known.includes(font.family)) {
      throw new Error(`font ${font.family} niet beschikbaar`);
    }
    loadedFonts.add(`${font.family}|${font.style}`);
  },

  createFrame() {
    const frame = new Node('FRAME');
    frame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    return frame;
  },
  createText() {
    return new TextNode();
  },
  createComponent() {
    return new ComponentNode();
  },
  createPage() {
    const page = new Node('PAGE');
    root.appendChild(page);
    return page;
  },
  async loadAllPagesAsync() {},
  async setCurrentPageAsync(page) {
    if (page.type !== 'PAGE')
      throw new Error('setCurrentPageAsync verwacht een pagina');
    figma.currentPage = page;
  },
  createNodeFromSvg(svg) {
    const node = new Node('FRAME');
    node.isSvg = true;
    node.svg = svg;
    // De echte API levert vector-kinderen op. Die zijn nodig om te kunnen
    // controleren of de icoonkleur daadwerkelijk wordt doorgezet: in de
    // browser erft een icoon `currentColor`, in Figma wordt het zwart.
    const vector = new Node('VECTOR');
    vector.fills = [];
    vector.strokes = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
    node.appendChild(vector);
    return node;
  },
  /**
   * Slaat een aantal lagen plat tot één vector. De echte API eist dat de
   * lagen in het document staan, en levert een nieuwe node in `parent`.
   */
  flatten(nodes, parent) {
    if (!nodes.length) throw new Error('flatten verwacht minstens één node');
    if (nodes.some((node) => !node.parent)) {
      throw new Error('flatten vereist nodes die in het document staan');
    }

    const flattened = new Node('VECTOR');
    flattened.name = nodes[0].name;
    flattened.x = Math.min(...nodes.map((node) => node.x));
    flattened.y = Math.min(...nodes.map((node) => node.y));
    flattened.width = Math.max(...nodes.map((node) => node.width));
    flattened.height = Math.max(...nodes.map((node) => node.height));
    // Het resultaat neemt de stijl van de onderste laag over.
    const source = nodes.find(
      (node) => Array.isArray(node.fills) && node.fills.length
    );
    flattened.fills = source ? source.fills.map((paint) => ({ ...paint })) : [];

    for (const node of nodes) node.remove();
    (parent ?? nodes[0].parent).appendChild(flattened);
    return flattened;
  },

  /** Groepeert lagen die dezelfde ouder hebben. */
  group(nodes, parent) {
    if (!nodes.length) throw new Error('group verwacht minstens één node');
    const groupNode = new Node('GROUP');
    parent.appendChild(groupNode);
    for (const node of nodes) groupNode.appendChild(node);
    return groupNode;
  },

  combineAsVariants(components, parent) {
    const set = new Node('COMPONENT_SET');
    parent.appendChild(set);
    for (const component of components) set.appendChild(component);
    return set;
  },
};

export { state };
