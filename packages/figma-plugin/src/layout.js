/**
 * Stijl en layout van een gebouwde laag: verf, hoeken, auto layout,
 * minimum-maten, plaatsing in de ouder, sizing en rotatie.
 *
 * De volgorde waarin Figma-eigenschappen gezet worden is niet vrij:
 * - `layoutSizing*` op HUG kan pas als de node zelf een layoutMode heeft
 * - `layoutSizing*` op FILL kan pas als de node in een auto-layout ouder hangt
 *
 * Vandaar dat `applySizing` als laatste komt; zie `buildNode` in build.js.
 */

import { applySizeBindings } from './bindings.js';
import { stepAside } from './nodes.js';

/** De vier paddingzijden; bestaan alleen op een frame met auto layout. */
export const PADDING_FIELDS = [
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
];

/**
 * De minimum- en maximummaten die uit de CSS kunnen komen. Een vers frame
 * heeft ze niet; zie `applyMinimumSizes`, `resetLayer` en `resetVariant`.
 */
export const SIZE_LIMIT_FIELDS = ['minWidth', 'minHeight', 'maxWidth'];

export function applyPaints(target, spec) {
  if (spec.fills) target.fills = spec.fills;
  if (spec.strokes) {
    target.strokes = spec.strokes;
    if (spec.strokeWeight !== undefined)
      target.strokeWeight = spec.strokeWeight;
    if (spec.dashPattern) target.dashPattern = spec.dashPattern;
  }
  // Na strokeWeight: dat veld zet in Figma alle vier de zijden tegelijk, dus
  // de losse diktes moeten erna komen. Zonder deze stap loopt de accentrand
  // van een Note rondom in plaats van alleen aan de inline-start. Ook zonder
  // `strokes`: een override die alleen de zijde verlegt (de indicator van een
  // MenuLink in een horizontaal menu, onderaan in plaats van links) noemt de
  // kleur niet, want die is gelijk.
  for (const [field, weight] of Object.entries(spec.strokeWeights ?? {})) {
    target[field] = weight;
  }
}

export function applyCorners(target, spec) {
  if (spec.cornerRadius !== undefined) {
    target.cornerRadius = spec.cornerRadius;
    return;
  }
  for (const corner of [
    'topLeftRadius',
    'topRightRadius',
    'bottomRightRadius',
    'bottomLeftRadius',
  ]) {
    if (spec[corner] !== undefined) target[corner] = spec[corner];
  }
}

export function applyAutoLayout(frame, spec, log, context) {
  if (!spec.layoutMode || spec.layoutMode === 'NONE') {
    // Een hergebruikte variant houdt zijn layout tot hier (zie
    // `resetVariant`); vraagt de spec er geen, dan gaat hij nu pas uit.
    if (frame.layoutMode && frame.layoutMode !== 'NONE') {
      frame.layoutMode = 'NONE';
    }
    return;
  }
  if (frame.layoutMode !== spec.layoutMode) {
    frame.layoutMode = spec.layoutMode;
  }
  releasePooled(frame, context);

  if (spec.layoutMode === 'GRID') {
    if (spec.gridColumnCount) frame.gridColumnCount = spec.gridColumnCount;
    if (spec.gridRowCount) frame.gridRowCount = spec.gridRowCount;
    if (spec.gridColumnGap !== undefined)
      frame.gridColumnGap = spec.gridColumnGap;
    if (spec.gridRowGap !== undefined) frame.gridRowGap = spec.gridRowGap;
    if (spec.gridItemsPositioning) {
      // Een waarde die Figma niet kent gooit, en dat brak de hele import af:
      // bij PageFooter bleef er één variant van de acht staan. Eén geweigerde
      // eigenschap hoort een melding te zijn, niet het einde van de set.
      try {
        frame.gridItemsPositioning = spec.gridItemsPositioning;
      } catch (error) {
        log?.warn(
          `${spec.name ?? spec.type}: gridItemsPositioning=${spec.gridItemsPositioning} is niet toegestaan (${error.message})`
        );
      }
    }
    // Zonder deze twee blijft Figma bij zijn eigen standaard (alle tracks
    // FLEX) en worden alle kolommen even breed, ongeacht de CSS.
    if (spec.gridColumnSizes) frame.gridColumnSizes = spec.gridColumnSizes;
    if (spec.gridRowSizes) frame.gridRowSizes = spec.gridRowSizes;
  } else {
    // Overal een expliciete waarde, ook als de spec het veld niet noemt. Op een
    // vers frame is dat de standaard en verandert er niets, maar een variant die
    // uit een vorige import wordt hergebruikt houdt anders een gap of een
    // uitlijning die in de nieuwe spec niet meer staat.
    frame.itemSpacing = spec.itemSpacing ?? 0;
    frame.layoutWrap = spec.layoutWrap ?? 'NO_WRAP';
    // Bestaat alleen bij afbreken: de gap tussen de rijen.
    if (frame.layoutWrap === 'WRAP') {
      frame.counterAxisSpacing = spec.counterAxisSpacing ?? 0;
    }
    frame.primaryAxisAlignItems = spec.primaryAxisAlignItems ?? 'MIN';
    frame.counterAxisAlignItems = spec.counterAxisAlignItems ?? 'MIN';
  }

  for (const side of PADDING_FIELDS) {
    frame[side] = spec[side] ?? 0;
  }
}

/**
 * Haalt de hergebruikte instances die in dit frame wachten uit de stroom.
 *
 * Bij een tweede import hangt `resetVariant` de geneste instances (de Heading
 * en Paragraph van een Note) direct onder de variant, zodat hun node-id blijft
 * bestaan. Zodra de variant weer een grid wordt, geeft Figma ze elk een cel,
 * en die cellen zijn dan bezet voordat het icoon en de inhoud hun plek
 * krijgen: in Figma kwamen het icoon en de Paragraph in een derde rij terecht.
 * Absoluut tellen ze niet mee. `rejoinFlow` haalt ze terug zodra ze hun
 * nieuwe plek krijgen.
 */
function releasePooled(frame, context) {
  const { pooled, keptSlots } = context.variant;
  for (const child of frame.children ?? []) {
    if (pooled.has(child) || keptSlots.has(child)) {
      stepAside(child, context.log);
    }
  }
}

/**
 * Minimum-maten uit de CSS.
 *
 * Een HUG-frame rekent zijn maat opnieuw uit content plus padding, dus zonder
 * deze zou een `min-block-size` uit de CSS in Figma verdwijnen en zou de button
 * onder zijn aanraakdoel uitkomen.
 */
export function applyMinimumSizes(frame, spec, log) {
  for (const field of SIZE_LIMIT_FIELDS) {
    if (spec[field] === undefined) continue;
    try {
      frame[field] = spec[field];
    } catch (error) {
      log.warn(
        `${spec.name ?? spec.type}: ${field} niet toegestaan: ${error.message}`
      );
    }
  }
}

/** Plaatsing van een kind binnen zijn ouder: absoluut of in een gridcel. */
export function applyPlacement(node, spec, log, parentSpec, pinned) {
  try {
    if (spec.layoutPositioning === 'ABSOLUTE') {
      node.layoutPositioning = 'ABSOLUTE';
      if (spec.x !== undefined) node.x = spec.x;
      if (spec.y !== undefined) node.y = spec.y;
      // Aan welke rand van de ouder het kind blijft hangen als die van maat
      // verandert, zoals de knop rechts in DateInput. Pas aan het eind van de
      // import, zie `pinAbsolute`.
      if (spec.constraints) pinned?.push({ node, spec });
      return;
    }
    // Een ouder zonder auto layout plaatst niets zelf: zonder deze stap komt
    // elk kind op 0,0 en liggen ze over elkaar. Zo'n ouder ontstaat waar de
    // ruimte tussen de kinderen uit ongelijke marges komt, zoals bij een
    // FormField met een beschrijving.
    //
    // De gemeten plek is relatief aan de root van het component, Figma wil hem
    // relatief aan de ouder.
    if (node.parent?.layoutMode === 'NONE' && node.parent.type !== 'PAGE') {
      if (spec.x !== undefined) node.x = spec.x - (parentSpec?.x ?? 0);
      if (spec.y !== undefined) node.y = spec.y - (parentSpec?.y ?? 0);
    }
    if (spec.gridColumnAnchorIndex !== undefined) {
      // gridColumnAnchorIndex en gridRowAnchorIndex zijn read-only; plaatsing
      // gaat via deze methode, en die neemt de rij als eerste argument.
      node.setGridChildPosition(
        spec.gridRowAnchorIndex,
        spec.gridColumnAnchorIndex
      );
    }
    // De span hoort er ook op zonder anchor. Bij autoplaatsing
    // (`gridItemsPositioning: 'AUTO'`) kiest Figma de cel, maar de span is wat
    // het kind over meerdere kolommen trekt: zonder dit zou een GridItem van
    // PageFooter met `colSpan=12` één kolom breed worden.
    if (spec.gridColumnSpan) node.gridColumnSpan = spec.gridColumnSpan;
    if (spec.gridRowSpan) node.gridRowSpan = spec.gridRowSpan;
    if (spec.layoutAlign) node.layoutAlign = spec.layoutAlign;
  } catch (error) {
    log.warn(`${spec.name ?? spec.type}: plaatsing mislukt: ${error.message}`);
  }
}

/**
 * Rotatie, ná de sizing.
 *
 * `resize` rekent langs de assen van de node zelf, dus een node die al gedraaid
 * staat krijgt zijn gemeten maat op de verkeerde as. De chevron van Details
 * staat 180 graden gedraaid zodra het paneel open is.
 */
export function applyRotation(node, spec, log) {
  if (!spec.rotation) return;
  try {
    node.rotation = spec.rotation;
  } catch (error) {
    log.warn(
      `${spec.name ?? spec.type}: rotatie van ${spec.rotation} graden kon niet gezet worden: ${error.message}`
    );
  }
}

/**
 * Sizing als laatste: HUG vereist een eigen layoutMode, FILL een auto-layout
 * ouder. Met `context` worden daarna de maatbindingen opnieuw gelegd, want de
 * `resize()` hieronder maakt ze los.
 */
export function applySizing(node, spec, log, context) {
  applyMeasuredSize(node, spec, log);
  if (context) applySizeBindings(node, spec, context);
}

export function applyMeasuredSize(node, spec, log) {
  for (const axis of ['layoutSizingHorizontal', 'layoutSizingVertical']) {
    const value = spec[axis];
    if (!value) continue;
    try {
      node[axis] = value;
    } catch {
      // Niet elke combinatie is geldig (FILL zonder auto-layout ouder,
      // HUG zonder layoutMode). De gemeten afmeting blijft dan staan.
      log.warn(`${spec.name ?? spec.type}: ${axis}=${value} niet toegestaan`);
    }
  }

  // De gemeten maat wordt in applyFrame gezet, maar dat gebeurt vóór de auto
  // layout en vóór de kinderen. Daarna rekent Figma de maat opnieuw uit, en
  // FIXED bevriest dus niet de gemeten waarde maar wat Figma er zelf van
  // maakte. Zichtbaar bij Checkbox als `20.08 x 24`: de breedte was gekrompen
  // naar het vinkje en dáár vastgezet.
  //
  // Een FIXED as krijgt daarom hier zijn gemeten maat terug, ná alles wat hem
  // kon verschuiven.
  const fixedWidth = spec.layoutSizingHorizontal === 'FIXED' && spec.width;
  const fixedHeight = spec.layoutSizingVertical === 'FIXED' && spec.height;
  if (!fixedWidth && !fixedHeight) return;

  try {
    node.resize(
      fixedWidth ? spec.width : node.width,
      fixedHeight ? spec.height : node.height
    );
  } catch (error) {
    log.warn(
      `${spec.name ?? spec.type}: kon de gemeten maat niet terugzetten: ${error.message}`
    );
    return;
  }

  // `resize` zet een as die op HUG stond om naar FIXED. Bij een node die maar
  // op één as vast is (een Alert is FIXED breed en HUG hoog) zou de hoogte
  // daarmee stilletjes bevriezen en niet meer meegroeien met zijn tekst.
  for (const axis of ['layoutSizingHorizontal', 'layoutSizingVertical']) {
    if (spec[axis] !== 'HUG') continue;
    try {
      node[axis] = 'HUG';
    } catch {
      log.warn(
        `${spec.name ?? spec.type}: ${axis}=HUG niet hersteld na resize`
      );
    }
  }
}
