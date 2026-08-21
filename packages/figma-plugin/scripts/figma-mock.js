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
 */

let nextId = 1;
const id = (prefix) => `${prefix}:${nextId++}`;

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

const state = {
  collections: [],
  variables: [],
  page: new Node('PAGE'),
};

export const figma = {
  currentPage: state.page,
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
    return new Node('COMPONENT');
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
  combineAsVariants(components, parent) {
    const set = new Node('COMPONENT_SET');
    parent.appendChild(set);
    for (const component of components) set.appendChild(component);
    return set;
  },
};

export { state };
