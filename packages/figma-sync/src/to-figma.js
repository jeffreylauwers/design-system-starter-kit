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

/**
 * Telt de tracks in een computed grid-template.
 * De browser lost `1fr` op naar pixels, dus de tracks komen er als
 * pixelwaarden uit: `"32px 500px"`.
 */
function trackSizes(template) {
  if (!template || template === 'none') return [];
  return template
    .split(/\s+/)
    .map((track) => Number.parseFloat(track))
    .filter((track) => Number.isFinite(track));
}

/**
 * CSS Grid naar Figma's GRID auto layout.
 *
 * Figma kent sinds 2025 een grid-layoutmodus met expliciete plaatsing per kind
 * (gridColumnAnchorIndex / gridRowAnchorIndex). Dat past op een grid met
 * expliciete `grid-column` / `grid-row`, zoals Alert.
 */
function gridLayoutFrom(styles, warnings, pathLabel) {
  const columns = trackSizes(styles.gridTemplateColumns);
  const rows = trackSizes(styles.gridTemplateRows);

  // De browser lost fr-tracks op naar pixels, dus hier is niet meer te zien
  // welke track flexibel was. De designer moet dat in Figma nazetten.
  if (columns.length > 1) {
    warnings.push(
      `${pathLabel}: grid-tracks komen als vaste pixelmaten binnen; controleer in Figma welke track flexibel moet zijn`
    );
  }

  return {
    layoutMode: 'GRID',
    gridColumnCount: Math.max(columns.length, 1),
    gridRowCount: Math.max(rows.length, 1),
    gridColumnGap: px(styles.columnGap ?? styles.gap),
    gridRowGap: px(styles.rowGap ?? styles.gap),
    gridAutoTracks: {
      columns: columns.map((value) => ({ type: 'FIXED', value })),
      rows: rows.map((value) => ({ type: 'FIXED', value })),
    },
    // De kinderen dragen hun eigen cel, dus Figma moet niet zelf plaatsen.
    gridItemsPositioning: 'MANUAL',
    paddingTop: px(styles.paddingTop),
    paddingRight: px(styles.paddingRight),
    paddingBottom: px(styles.paddingBottom),
    paddingLeft: px(styles.paddingLeft),
    stretchChildren: false,
    reversed: false,
  };
}

/** Bouwt de auto layout-eigenschappen uit de flexbox computed styles. */
function autoLayoutFrom(styles, warnings, pathLabel) {
  if (styles.display === 'grid' || styles.display === 'inline-grid') {
    return gridLayoutFrom(styles, warnings, pathLabel);
  }

  const isFlex = styles.display === 'flex' || styles.display === 'inline-flex';
  if (!isFlex) {
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
 * Zet de plaatsing van een kind binnen zijn ouder.
 *
 * Twee gevallen die niet in de gewone auto layout-stroom passen:
 * een absoluut gepositioneerd kind (Figma: layoutPositioning ABSOLUTE) en een
 * kind met een expliciete cel in een grid (Figma: grid anchors).
 */
function applyChildPlacement(
  converted,
  child,
  parentLayout,
  warnings,
  label,
  parentContentWidth
) {
  const styles = child.styles;
  if (!styles) return;

  // Een kind dat precies de binnenbreedte van zijn ouder vult is een
  // blok-element. In Figma hoort dat FILL te zijn: met een vaste breedte
  // schaalt het niet mee als de ouder groeit.
  if (
    parentContentWidth !== undefined &&
    Math.abs(child.rect.width - parentContentWidth) < 1
  ) {
    converted.layoutSizingHorizontal = 'FILL';
  }

  if (styles.position === 'absolute' || styles.position === 'fixed') {
    // Een absoluut kind valt buiten de stroom; Figma houdt het op zijn plek
    // ten opzichte van de ouder in plaats van het mee te laten stromen.
    converted.layoutPositioning = 'ABSOLUTE';
    return;
  }

  if (parentLayout.layoutMode !== 'GRID') return;

  const columnStart = Number.parseInt(styles.gridColumnStart, 10);
  const rowStart = Number.parseInt(styles.gridRowStart, 10);

  if (!Number.isFinite(columnStart) || !Number.isFinite(rowStart)) {
    warnings.push(
      `${label}: geen expliciete grid-cel, Figma plaatst dit kind zelf in leesvolgorde`
    );
    return;
  }

  // CSS-gridlijnen tellen vanaf 1, Figma's anchors vanaf 0.
  converted.gridColumnAnchorIndex = columnStart - 1;
  converted.gridRowAnchorIndex = rowStart - 1;

  const columnEnd = Number.parseInt(styles.gridColumnEnd, 10);
  const rowEnd = Number.parseInt(styles.gridRowEnd, 10);
  if (Number.isFinite(columnEnd) && columnEnd - columnStart > 1) {
    converted.gridColumnSpan = columnEnd - columnStart;
  }
  if (Number.isFinite(rowEnd) && rowEnd - rowStart > 1) {
    converted.gridRowSpan = rowEnd - rowStart;
  }
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

  // Binnenbreedte van dit element: de rect min padding en randen.
  const contentWidth =
    node.rect.width -
    px(styles.paddingLeft) -
    px(styles.paddingRight) -
    px(styles.borderLeftWidth) -
    px(styles.borderRightWidth);
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
      applyChildPlacement(
        converted,
        child,
        autoLayout,
        warnings,
        childLabel,
        contentWidth
      );
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
