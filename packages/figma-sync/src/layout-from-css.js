/**
 * Flexbox, grid en block layout uit de computed styles, vertaald naar auto
 * layout in Figma: richting, gap, padding, uitlijning, tracks en de
 * minimum- en maximummaten.
 *
 * De kern van de vertaling is flexbox -> auto layout. `display: flex` met gap,
 * padding en alignment bevat precies de informatie die Figma nodig heeft om
 * een frame te laten meeschalen.
 */

import { px } from './values.js';

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

/** Heeft dit kind een eigen `align-self`, los van zijn ouder? */
export const ownAlignment = (child) => {
  const value = child.styles?.alignSelf;
  return Boolean(value) && value !== 'auto' && value !== 'normal';
};

/**
 * Een kind met een eigen `align-self` in een ouder die uitrekt.
 *
 * Figma kent geen `align-self`: de uitlijning op de kruisas zit op de ouder,
 * en een kind kan alleen uitrekken (`layoutAlign: STRETCH`) of de ouder volgen.
 * In een ouder die uitrekt staat die uitlijning op MIN, want de kinderen
 * rekken toch. Centreert één kind zichzelf, zoals de uitklapknop van MenuLink,
 * dan krijgt de ouder die uitlijning: de andere kinderen rekken nog steeds, en
 * het ene kind volgt de ouder. Willen kinderen verschillende kanten op, dan is
 * dat in Figma niet te maken en blijft de ouder staan.
 */
export function selfAlignment(
  figmaNode,
  children,
  stretchChildren,
  warnings,
  label
) {
  if (!stretchChildren) return;
  const wanted = new Set(
    children
      .map(({ child }) => child)
      .filter(
        (child) =>
          ownAlignment(child) &&
          child.styles.alignSelf !== 'stretch' &&
          child.styles.position !== 'absolute' &&
          child.styles.position !== 'fixed'
      )
      .map((child) => COUNTER_AXIS_ALIGN[child.styles.alignSelf] ?? 'MIN')
  );
  if (wanted.size === 1) {
    figmaNode.counterAxisAlignItems = [...wanted][0];
  } else if (wanted.size > 1) {
    warnings.push(
      `${label}: kinderen met verschillende align-self (${[...wanted].join(', ')}); Figma kent maar één uitlijning per ouder, dus die blijft MIN`
    );
  }
}

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
 * Bepaalt per track of hij vast of flexibel is.
 *
 * De browser lost `1fr` op naar pixels voordat wij kunnen meten, dus uit één
 * meting is `fr` niet van een vaste maat te onderscheiden. Door hetzelfde
 * component ook in een bredere container te meten wordt het wel zichtbaar:
 * een track die meegroeit was flexibel, een track die gelijk blijft was vast.
 */
function trackSizesFrom(template, wideTemplate, fallbackType = 'FIXED') {
  const sizes = trackSizes(template);
  const wide = trackSizes(wideTemplate ?? '');

  return sizes.map((value, index) => {
    const grew = wide.length === sizes.length && wide[index] - value > 0.5;
    // Figma's FLEX-waarde komt overeen met de fr-eenheid in CSS.
    if (grew) return { type: 'FLEX', value: 1 };
    return fallbackType === 'HUG' ? { type: 'HUG' } : { type: 'FIXED', value };
  });
}

/**
 * CSS Grid naar Figma's GRID auto layout.
 *
 * Figma kent sinds 2025 een grid-layoutmodus met expliciete plaatsing per kind.
 * Dat past op een grid met expliciete `grid-column` / `grid-row`, zoals Alert.
 */
function gridLayoutFrom(styles, wideStyles, warnings, pathLabel) {
  // Figma kent geen subgrid. Een rij die zijn kolommen van de lijst overneemt
  // (`grid-template-columns: subgrid`, zoals de rij van DataList in de
  // brede weergave) geeft uit de browser geen pixelmaten terug maar het woord
  // `subgrid`, en daar is niets uit te lezen. De laag wordt daarom gemarkeerd
  // en de ouder zet zijn eigen tracks erop zodra die bekend zijn; zie
  // `resolveSubgrid`.
  const subgridColumns = /^subgrid\b/.test(styles.gridTemplateColumns ?? '');

  const columns = subgridColumns
    ? []
    : trackSizesFrom(
        styles.gridTemplateColumns,
        wideStyles?.gridTemplateColumns
      );
  // Rijen in CSS Grid zijn standaard `auto`, dus inhoudsgestuurd. Uit de
  // computed waarde is dat niet te zien (die is altijd een pixelmaat), maar
  // een vaste rijhoogte zou betekenen dat het component niet meegroeit als
  // tekst afbreekt. HUG is daarom de juiste standaard.
  const rows = trackSizesFrom(
    styles.gridTemplateRows,
    wideStyles?.gridTemplateRows,
    'HUG'
  );

  if (!subgridColumns && columns.length > 1 && !wideStyles) {
    warnings.push(
      `${pathLabel}: geen tweede meting beschikbaar, alle grid-tracks zijn vast; controleer in Figma welke flexibel moet zijn`
    );
  }

  return {
    layoutMode: 'GRID',
    gridColumnCount: Math.max(columns.length, 1),
    gridRowCount: Math.max(rows.length, 1),
    gridColumnGap: px(styles.columnGap ?? styles.gap),
    gridRowGap: px(styles.rowGap ?? styles.gap),
    // Let op de namen: gridAutoTracks is iets anders (automatisch rijen
    // toevoegen). De maten van de tracks zelf horen hier.
    gridColumnSizes: columns,
    gridRowSizes: rows,
    ...(subgridColumns ? { subgridColumns: true } : {}),
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

/**
 * Een grid van één rij, met één kind per kolom, als horizontale auto layout.
 *
 * Zo'n grid is in CSS een rij met kolommen van `auto` en `fr`: de balk van
 * PageHeader (`1fr auto 1fr`, het logo in het midden) en de compact-layout
 * (`auto 1fr auto`). In Figma is dat met auto layout te maken, en dat is daar
 * handiger dan een grid: een kolom van `fr` wordt FILL, een kolom van `auto`
 * hugt zijn inhoud, en de kinderen staan op hun kruisas uitgelijnd zoals
 * `align-items` het zegt. In een Figma-grid staan ze bovenin hun cel.
 *
 * Alleen als dat niets verandert: geen kind met een eigen cel of span, en de
 * `fr`-kolommen even breed. Figma verdeelt de ruimte gelijk over FILL-kinderen
 * en kent geen `2fr`.
 */
function rowGridLayoutFrom(node, styles, wideStyles) {
  if (/^subgrid\b/.test(styles.gridTemplateColumns ?? '')) return null;
  if (trackSizes(styles.gridTemplateRows ?? '').length > 1) return null;

  const columns =
    authoredTracks(node.tokens?.['grid-template-columns']?.value) ??
    trackSizesFrom(styles.gridTemplateColumns, wideStyles?.gridTemplateColumns);
  const children = (node.children ?? []).filter(
    (child) =>
      child.styles &&
      child.styles.position !== 'absolute' &&
      child.styles.position !== 'fixed'
  );
  // Minder kinderen dan kolommen kan, als de lege kolommen achteraan `auto`
  // zijn: zo'n kolom is 0 breed, en van hem blijft in CSS alleen de gap over.
  // Die komt bij de padding aan het eind. Zo blijft een File zonder actie
  // dezelfde rij als een File met.
  if (!children.length || children.length > columns.length) return null;
  const empty = columns.slice(children.length);
  if (empty.some((track) => track.type === 'FLEX')) return null;
  if (
    children.some(
      (child) =>
        child.styles.gridColumnStart !== 'auto' ||
        child.styles.gridRowStart !== 'auto'
    )
  ) {
    return null;
  }
  if (!columns.some((track) => track.type === 'FLEX')) return null;

  const flexWidths = children
    .filter((_, index) => columns[index].type === 'FLEX')
    .map((child) => child.rect.width);
  if (Math.max(...flexWidths) - Math.min(...flexWidths) > STACK_TOLERANCE) {
    return null;
  }

  children.forEach((child, index) => {
    child.gridTrack = columns[index].type;
  });

  const stretch =
    styles.alignItems === 'normal' || styles.alignItems === 'stretch';
  const gap = px(styles.columnGap ?? styles.gap, 0);
  const padding = paddingFrom(styles);
  if (empty.length) padding.paddingRight += gap * empty.length;
  return {
    layoutMode: 'HORIZONTAL',
    layoutWrap: 'NO_WRAP',
    itemSpacing: gap,
    itemReverseZIndex: false,
    ...padding,
    primaryAxisAlignItems: 'MIN',
    counterAxisAlignItems: COUNTER_AXIS_ALIGN[styles.alignItems] ?? 'MIN',
    stretchChildren: stretch,
    reversed: false,
  };
}

/**
 * De kolommen zoals de CSS ze schrijft: `auto 1fr auto`. Alleen een lijst van
 * losse maten; met `repeat()`, `minmax()` of een `var()` is uit de tekst niet
 * af te lezen wat er gerenderd wordt, en geldt de meting.
 */
function authoredTracks(template) {
  if (!template || !/^[\w\s.%-]+$/.test(template.trim())) return null;
  const tracks = template.trim().split(/\s+/);
  const fractions = tracks.filter((track) => /^[\d.]+fr$/.test(track));
  if (new Set(fractions).size > 1) return null;
  return tracks.map((track) =>
    /fr$/.test(track) ? { type: 'FLEX', value: 1 } : { type: 'HUG' }
  );
}

/** De vier paddings als Figma ze verwacht. */
function paddingFrom(styles) {
  return {
    paddingTop: px(styles.paddingTop),
    paddingRight: px(styles.paddingRight),
    paddingBottom: px(styles.paddingBottom),
    paddingLeft: px(styles.paddingLeft),
  };
}

/** Hoeveel twee gemeten waarden mogen schelen om nog "gelijk" te heten. */
const STACK_TOLERANCE = 0.5;

/**
 * Zet een element zonder flex of grid alsnog op verticale auto layout, als dat
 * aantoonbaar niets verschuift.
 *
 * Figma kent padding, `minWidth` en `minHeight` uitsluitend op een auto-layout
 * frame. Een element dat in CSS gewoon een blok is (een `<input>`, een `<ol>`,
 * de footer van een Card) verloor daardoor al zijn spacing-bindingen: de maat
 * klopte visueel, want die is gemeten, maar het token erachter was weg. Dat was
 * veruit de grootste post in het bindingsrapport.
 *
 * Promoveren mag alleen als de plaatsing er niet van verandert, en dat is in
 * twee gevallen hard te maken:
 *
 * 1. **Geen kinderen.** Er valt niets te ordenen. Elk formulierveld valt
 *    hieronder, en dat is precies waar de meeste spacing-tokens zitten.
 * 2. **Kinderen die al onder elkaar staan, met steeds dezelfde tussenruimte.**
 *    Dat is wat verticale auto layout óók doet. Overlappen ze, staan ze naast
 *    elkaar, of verschillen de gaten, dan zou Figma ze verplaatsen en blijft
 *    het frame zonder auto layout.
 *
 * Absoluut gepositioneerde kinderen sluiten promotie uit: die vallen buiten de
 * stroom, dus uit hun rechthoek is niets af te leiden over de rest.
 */
function blockLayoutFrom(node, styles, warnings, pathLabel) {
  const base = {
    layoutWrap: 'NO_WRAP',
    itemReverseZIndex: false,
    ...paddingFrom(styles),
    primaryAxisAlignItems: 'MIN',
    counterAxisAlignItems: 'MIN',
    stretchChildren: false,
    reversed: false,
  };

  const children = node.children ?? [];
  // Zonder kinderen valt er niets te ordenen, dus de richting maakt niet uit.
  if (!children.length) {
    return { ...base, layoutMode: 'VERTICAL', itemSpacing: 0 };
  }

  if (children.some((child) => child.styles?.position === 'absolute')) {
    return null;
  }
  if (children.some((child) => !child.rect)) return null;

  const spacing = stackSpacing(children, 'vertical');
  const layoutMode = spacing !== null ? 'VERTICAL' : 'HORIZONTAL';
  const gap = spacing ?? stackSpacing(children, 'horizontal');
  if (gap === null) return null;

  // De ruimte tussen blokken komt uit de marges van de kinderen, niet uit een
  // `gap`, en de binder leest alleen gaps. De waarde klopt dus wel maar hangt
  // aan niets. Melden in plaats van stil laten: een stil verlies is in het
  // bindingsrapport niet terug te vinden.
  if (gap > 0) {
    warnings.push(
      `${pathLabel}: de ruimte van ${gap}px tussen de kinderen komt uit hun marges en niet uit een gap, dus itemSpacing houdt een vaste waarde`
    );
  }

  return {
    ...base,
    layoutMode,
    itemSpacing: gap,
    ...(layoutMode === 'VERTICAL' && centersChildren(node, styles)
      ? { counterAxisAlignItems: 'CENTER' }
      : {}),
  };
}

/**
 * Staan alle kinderen van dit blok horizontaal in het midden?
 *
 * Zo centreert CSS een blok met een maximale breedte: `margin-inline: auto`,
 * zoals de inner van de masthead en de navbar van PageHeader. In Figma is dat
 * de uitlijning CENTER op de ouder. Een kind dat de hele breedte vult staat
 * ook in het midden; minstens één kind moet er echt ruimte naast hebben.
 */
function centersChildren(node, styles) {
  const left =
    node.rect.x + px(styles.borderLeftWidth, 0) + px(styles.paddingLeft, 0);
  const right =
    node.rect.x +
    node.rect.width -
    px(styles.borderRightWidth, 0) -
    px(styles.paddingRight, 0);
  let indented = false;
  for (const child of node.children ?? []) {
    if (!child.rect) continue;
    const before = child.rect.x - left;
    const after = right - (child.rect.x + child.rect.width);
    if (Math.abs(before - after) > 1) return false;
    if (before > 1) indented = true;
    // Een kind dat de CSS met `margin-inline: auto` centreert, ook als het
    // op deze breedte de hele ouder vult: in Figma kan een designer de
    // variant breder maken, en dan hoort het in het midden te blijven.
    if (maxWidthFrom(child.styles ?? {}, child.tokens).maxWidth) {
      indented = true;
    }
  }
  return indented;
}

/**
 * De tussenruimte als de kinderen in deze richting op een rij staan, of `null`
 * als ze dat niet doen.
 *
 * Op een rij staan betekent: elk volgend kind begint na het vorige, ze
 * overlappen niet, en de gaten zijn steeds even groot. Dat is precies wat
 * auto layout ook doet, dus dan verschuift promoveren niets.
 *
 * Twee richtingen, want een tabelrij zet zijn cellen naast elkaar terwijl een
 * `<ol>` zijn items onder elkaar zet. Zonder de horizontale variant verloor
 * elke `<tr>` zijn padding-bindingen, want Figma kent padding alleen op een
 * auto-layout frame.
 */
function stackSpacing(children, direction) {
  const vertical = direction === 'vertical';
  const start = (child) => (vertical ? child.rect.y : child.rect.x);
  const size = (child) => (vertical ? child.rect.height : child.rect.width);

  const gaps = [];
  for (const [index, child] of children.entries()) {
    if (index === 0) continue;
    const previous = children[index - 1];

    const gap = start(child) - (start(previous) + size(previous));
    // Negatief betekent overlap; gelijke start betekent bovenop elkaar.
    if (gap < -STACK_TOLERANCE) return null;
    if (Math.abs(start(child) - start(previous)) < STACK_TOLERANCE) return null;
    gaps.push(Math.max(gap, 0));
  }

  const spacing = gaps[0] ?? 0;
  if (gaps.some((value) => Math.abs(value - spacing) > STACK_TOLERANCE)) {
    return null;
  }
  return spacing;
}

/** Bouwt de auto layout-eigenschappen uit de flexbox computed styles. */
export function autoLayoutFrom(node, styles, wideStyles, warnings, pathLabel) {
  if (styles.display === 'grid' || styles.display === 'inline-grid') {
    // Een grid zonder kolommen en met één rij zet zijn kinderen onder elkaar,
    // net als een blok. Het zoekpaneel van PageHeader is zo'n grid, alleen
    // voor de uitklapanimatie (`grid-template-rows: 0fr` naar `1fr`).
    const noColumns =
      !(node.tokens?.['grid-template-columns']?.value ?? '').trim() ||
      /^none$/.test(node.tokens?.['grid-template-columns']?.value?.trim());
    if (
      noColumns &&
      trackSizes(styles.gridTemplateRows ?? '').length <= 1 &&
      (node.children ?? []).filter((child) => child.styles).length <= 1
    ) {
      const block = blockLayoutFrom(node, styles, warnings, pathLabel);
      if (block) return block;
    }
    return (
      rowGridLayoutFrom(node, styles, wideStyles) ??
      gridLayoutFrom(styles, wideStyles, warnings, pathLabel)
    );
  }

  const isFlex = styles.display === 'flex' || styles.display === 'inline-flex';
  if (!isFlex) {
    return (
      blockLayoutFrom(node, styles, warnings, pathLabel) ?? {
        layoutMode: 'NONE',
      }
    );
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

  // Bij afbreken is er een tweede gap, tussen de rijen (of kolommen). Figma
  // heet die counterAxisSpacing; zonder afbreken bestaat hij niet.
  const wraps = styles.flexWrap === 'wrap';
  const crossGap = wraps
    ? px(
        vertical
          ? (styles.columnGap ?? styles.gap)
          : (styles.rowGap ?? styles.gap),
        0
      )
    : undefined;

  return {
    layoutMode: vertical ? 'VERTICAL' : 'HORIZONTAL',
    layoutWrap: wraps ? 'WRAP' : 'NO_WRAP',
    itemSpacing: gap,
    ...(wraps ? { counterAxisSpacing: crossGap } : {}),
    itemReverseZIndex: false,
    ...paddingFrom(styles),
    primaryAxisAlignItems: PRIMARY_AXIS_ALIGN[styles.justifyContent] ?? 'MIN',
    counterAxisAlignItems: COUNTER_AXIS_ALIGN[styles.alignItems] ?? 'MIN',
    // Kinderen krijgen layoutAlign STRETCH als de parent ze uitrekt.
    stretchChildren: styles.alignItems === 'stretch',
    reversed,
  };
}

/**
 * Minimum-maten uit de CSS.
 *
 * Zonder deze wordt een `min-block-size` stil weggegooid: het frame is in Figma
 * HUG, dus die rekent de hoogte opnieuw uit content plus padding en komt lager
 * uit dan de browser. Bij Button scheelt dat het verschil tussen 42px en het
 * aanraakdoel van 48px uit WCAG 2.5.5.
 *
 * Alleen een pixelmaat telt: `auto` is de standaard voor een flex-item, en een
 * percentage is in Figma layoutgedrag en geen maat.
 */
export function minimumSizesFrom(styles, layout) {
  // In Figma bestaan minWidth en minHeight alleen op een auto-layout frame.
  if (!layout.layoutMode || layout.layoutMode === 'NONE') return {};

  const pixels = (value) =>
    /^-?[\d.]+px$/.test(String(value).trim()) && px(value) > 0
      ? px(value)
      : undefined;

  return {
    minWidth: pixels(styles.minWidth),
    minHeight: pixels(styles.minHeight),
  };
}

/**
 * De maximale breedte van een blok dat CSS in het midden zet.
 *
 * `max-inline-size: var(--dsn-page-max-inline-size); margin-inline: auto` is
 * hoe de inner van PageHeader en PageFooter op een brede pagina 1200px breed
 * blijft en in het midden staat, en op een smalle pagina de hele breedte
 * vult. In Figma is dat een kind op FILL met een `maxWidth`, in een ouder die
 * centreert; zie de plaatsing en `centersChildren`. De `maxWidth` hangt aan
 * het token.
 *
 * Alleen met `margin-inline: auto`, zoals de CSS het schrijft: een
 * formulierveld heeft ook een maximale breedte, maar staat links en vult
 * zijn ouder niet. Die blijft zoals hij was.
 */
export function maxWidthFrom(styles, tokens) {
  const auto = (side) => tokens?.[`margin-${side}`]?.value?.trim() === 'auto';
  if (!auto('left') || !auto('right')) return {};
  if (!/^[\d.]+px$/.test(String(styles.maxWidth ?? '').trim())) return {};
  return { maxWidth: px(styles.maxWidth) };
}
