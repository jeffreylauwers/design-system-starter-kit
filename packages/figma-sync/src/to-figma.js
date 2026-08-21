/**
 * Zet een computed DOM-boom om naar een Figma node spec.
 *
 * De kern van de vertaling is flexbox -> auto layout. Dat is de reden dat deze
 * route werkt waar CSS-parsing faalt: `display:flex` met gap, padding en
 * alignment bevat exact de informatie die Figma nodig heeft om een frame te
 * laten meeschalen in plaats van een dood, absoluut gepositioneerd blok.
 */

// =============================================================================
// WAARDE-CONVERSIE
// =============================================================================

/** `rgb(27, 89, 164)` of `rgba(0, 0, 0, 0)` -> Figma RGBA (kanalen 0..1). */
export function parseCssColor(input) {
  const match = String(input).match(
    /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.%]+))?\s*\)/i
  );
  if (!match) return null;

  const [, r, g, b, a] = match;
  let alpha = 1;
  if (a !== undefined) {
    alpha = a.endsWith('%') ? Number(a.slice(0, -1)) / 100 : Number(a);
  }

  return {
    r: Number(r) / 255,
    g: Number(g) / 255,
    b: Number(b) / 255,
    a: alpha,
  };
}

/** `12px` -> 12. `normal` en lege waarden -> fallback. */
function px(value, fallback = 0) {
  const number = Number.parseFloat(value);
  return Number.isFinite(number) ? Math.round(number * 100) / 100 : fallback;
}

const PRIMARY_AXIS_ALIGN = {
  'flex-start': 'MIN',
  start: 'MIN',
  center: 'CENTER',
  'flex-end': 'MAX',
  end: 'MAX',
  'space-between': 'SPACE_BETWEEN',
};

const COUNTER_AXIS_ALIGN = {
  'flex-start': 'MIN',
  start: 'MIN',
  center: 'CENTER',
  'flex-end': 'MAX',
  end: 'MAX',
  baseline: 'BASELINE',
  // Figma kent geen STRETCH op de counter axis van de parent; dat wordt op het
  // kind gezet via layoutAlign. Zie stretchChildren verderop.
  stretch: 'MIN',
};

// =============================================================================
// NODE-CONVERSIE
// =============================================================================

/** Bouwt de auto layout-eigenschappen uit de flexbox computed styles. */
function autoLayoutFrom(styles, warnings, pathLabel) {
  const isFlex = styles.display === 'flex' || styles.display === 'inline-flex';
  if (!isFlex) {
    if (styles.display === 'grid' || styles.display === 'inline-grid') {
      warnings.push(
        `${pathLabel}: display:grid heeft geen auto layout-equivalent, wordt een vaste frame-layout`
      );
    }
    return { layoutMode: 'NONE' };
  }

  const vertical = styles.flexDirection.startsWith('column');
  const reversed = styles.flexDirection.endsWith('-reverse');
  if (reversed) {
    warnings.push(
      `${pathLabel}: ${styles.flexDirection} kent Figma niet, kinderen zijn in omgekeerde volgorde gezet`
    );
  }
  if (styles.flexWrap === 'wrap') {
    warnings.push(`${pathLabel}: flex-wrap:wrap wordt layoutWrap WRAP`);
  }

  const gap = px(
    vertical ? (styles.rowGap ?? styles.gap) : (styles.columnGap ?? styles.gap),
    0
  );

  return {
    layoutMode: vertical ? 'VERTICAL' : 'HORIZONTAL',
    layoutWrap: styles.flexWrap === 'wrap' ? 'WRAP' : 'NO_WRAP',
    itemSpacing: gap,
    itemReverseZIndex: false,
    paddingTop: px(styles.paddingTop),
    paddingRight: px(styles.paddingRight),
    paddingBottom: px(styles.paddingBottom),
    paddingLeft: px(styles.paddingLeft),
    primaryAxisAlignItems: PRIMARY_AXIS_ALIGN[styles.justifyContent] ?? 'MIN',
    counterAxisAlignItems: COUNTER_AXIS_ALIGN[styles.alignItems] ?? 'MIN',
    // Kinderen krijgen layoutAlign STRETCH als de parent ze uitrekt.
    stretchChildren: styles.alignItems === 'stretch',
    reversed,
  };
}

/** Randen: alleen uniforme randen worden een Figma stroke. */
function strokesFrom(styles, warnings, pathLabel) {
  const widths = [
    px(styles.borderTopWidth),
    px(styles.borderRightWidth),
    px(styles.borderBottomWidth),
    px(styles.borderLeftWidth),
  ];
  const maximum = Math.max(...widths);
  if (maximum === 0 || styles.borderStyle === 'none') return null;

  const uniform = widths.every((width) => width === widths[0]);
  if (!uniform) {
    warnings.push(
      `${pathLabel}: ongelijke randbreedtes (${widths.join('/')}), Figma krijgt de dikste`
    );
  }
  if (styles.borderStyle !== 'solid') {
    warnings.push(
      `${pathLabel}: border-style ${styles.borderStyle} wordt in Figma een dashPattern`
    );
  }

  const color = parseCssColor(styles.borderTopColor);
  if (!color) return null;

  return {
    strokeWeight: maximum,
    strokes: [{ type: 'SOLID', color: rgbOf(color), opacity: color.a }],
    dashPattern: styles.borderStyle === 'dashed' ? [4, 4] : [],
  };
}

/** Figma scheidt kleur en alpha: opacity zit op de paint, niet in de kleur. */
function rgbOf({ r, g, b }) {
  return { r, g, b };
}

function cornerRadiusFrom(styles) {
  const corners = [
    px(styles.borderTopLeftRadius),
    px(styles.borderTopRightRadius),
    px(styles.borderBottomRightRadius),
    px(styles.borderBottomLeftRadius),
  ];
  const uniform = corners.every((corner) => corner === corners[0]);
  return uniform
    ? { cornerRadius: corners[0] }
    : {
        topLeftRadius: corners[0],
        topRightRadius: corners[1],
        bottomRightRadius: corners[2],
        bottomLeftRadius: corners[3],
      };
}

/** Tekststijl uit de computed styles van het *ouder*-element. */
function textStyleFrom(styles) {
  const lineHeight = styles.lineHeight;
  return {
    fontFamily: styles.fontFamily.split(',')[0].replace(/['"]/g, '').trim(),
    fontSize: px(styles.fontSize, 16),
    fontWeight: Number.parseInt(styles.fontWeight, 10) || 400,
    italic: styles.fontStyle === 'italic',
    lineHeight:
      lineHeight === 'normal'
        ? { unit: 'AUTO' }
        : { unit: 'PIXELS', value: px(lineHeight) },
    letterSpacing:
      styles.letterSpacing === 'normal' ? 0 : px(styles.letterSpacing),
    textAlignHorizontal: (styles.textAlign === 'start'
      ? 'left'
      : styles.textAlign
    ).toUpperCase(),
    textDecoration:
      styles.textDecorationLine === 'underline' ? 'UNDERLINE' : 'NONE',
    textCase: styles.textTransform === 'uppercase' ? 'UPPER' : 'ORIGINAL',
    fills: paintFrom(styles.color),
  };
}

function paintFrom(cssColor) {
  const color = parseCssColor(cssColor);
  if (!color || color.a === 0) return [];
  return [{ type: 'SOLID', color: rgbOf(color), opacity: color.a }];
}

/**
 * Zet één DOM-node om naar een Figma-node.
 *
 * @param {object} node computed DOM-node
 * @param {string[]} warnings verzamelt alles wat niet exact vertaald kon worden
 * @param {string} pathLabel leesbaar pad voor in de waarschuwing
 */
function convertNode(node, warnings, pathLabel) {
  if (node.kind === 'text') {
    // Een kale tekstnode erft zijn stijl van de ouder; die wordt daar gezet.
    return { type: 'TEXT', characters: node.text };
  }

  if (node.kind === 'vector') {
    return {
      type: 'VECTOR',
      name: 'icon',
      width: node.rect.width,
      height: node.rect.height,
      // De plugin importeert dit met figma.createNodeFromSvg().
      svg: node.svg,
      fills: paintFrom(node.styles.color),
    };
  }

  const { styles } = node;
  const layout = autoLayoutFrom(styles, warnings, pathLabel);
  const strokes = strokesFrom(styles, warnings, pathLabel);

  // Een element dat alleen tekst bevat en zelf niets tekent, wordt in Figma
  // één TEXT-node. Zonder deze stap krijgt elke <span> een eigen frame en
  // ontstaat precies de diepe nesting die een Figma-library onwerkbaar maakt.
  const onlyChildIsText =
    node.children.length === 1 && node.children[0].kind === 'text';
  const drawsNothing =
    paintFrom(styles.backgroundColor).length === 0 &&
    !strokes &&
    px(styles.borderTopLeftRadius) === 0;

  if (onlyChildIsText && drawsNothing) {
    return {
      type: 'TEXT',
      name: node.classes[0] ?? node.children[0].text.slice(0, 24),
      characters: node.children[0].text,
      ...textStyleFrom(styles),
    };
  }

  if (styles.boxShadow && styles.boxShadow !== 'none') {
    warnings.push(
      `${pathLabel}: box-shadow moet een Figma effect style worden, niet meegenomen`
    );
  }

  const { stretchChildren, reversed, ...autoLayout } = layout;
  const children = reversed ? [...node.children].reverse() : node.children;

  const figmaNode = {
    type: 'FRAME',
    name: node.classes[0] ?? node.tag,
    width: node.rect.width,
    height: node.rect.height,
    x: node.rect.x,
    y: node.rect.y,
    ...autoLayout,
    ...cornerRadiusFrom(styles),
    fills: paintFrom(styles.backgroundColor),
    ...(strokes ?? {}),
    opacity: Number(styles.opacity) === 1 ? undefined : Number(styles.opacity),
    clipsContent: styles.overflow === 'hidden',
    children: children.map((child, index) => {
      const childLabel = `${pathLabel} > ${child.classes?.[0] ?? child.kind ?? child.tag ?? index}`;
      const converted = convertNode(child, warnings, childLabel);
      if (converted.type === 'TEXT') {
        // Tekst erft de typografie van het element waarin hij staat.
        Object.assign(converted, textStyleFrom(styles), {
          name: converted.characters.slice(0, 24),
        });
      }
      if (stretchChildren) converted.layoutAlign = 'STRETCH';
      return converted;
    }),
  };

  // Een inline-flex element hugt zijn inhoud; block-elementen vullen de breedte.
  figmaNode.layoutSizingHorizontal =
    styles.display === 'inline-flex' ? 'HUG' : 'FIXED';
  figmaNode.layoutSizingVertical = 'HUG';

  return figmaNode;
}

/**
 * Bouwt een complete Figma component set uit de geëxtraheerde varianten.
 *
 * @param {object} matrix de matrixdefinitie
 * @param {Array<{variant: object, tree: object}>} extracted
 */
export function toComponentSet(matrix, extracted) {
  const warnings = [];

  const components = extracted.map(({ variant, tree }) => {
    const label = Object.entries(variant)
      .map(([axis, value]) => `${axis}=${value}`)
      .join(', ');
    const node = convertNode(tree, warnings, `${matrix.component}[${label}]`);
    return { name: label, variantProperties: variant, node };
  });

  return {
    $schema: 'dsn-figma-components/1',
    generatedAt: new Date().toISOString(),
    componentSet: {
      name: matrix.component,
      variantAxes: matrix.axes,
      components,
    },
    // Ontdubbeld: dezelfde waarschuwing komt per variant terug.
    warnings: [...new Set(warnings)],
  };
}
