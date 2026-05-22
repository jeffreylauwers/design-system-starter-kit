import {
  makeOklch,
  adjustLForContrast,
  clampToSRGB,
  oklchToHex,
  contrastRatio,
} from './oklch';
import type {
  OklchColor,
  SwatchData,
  TokenMap,
  InverseTokenMap,
  ColorGroup,
  ColorMode,
} from '../types';

function swatch(
  oklch: OklchColor,
  bgForContrast?: OklchColor,
  required?: number,
  isFallback?: boolean
): SwatchData {
  const clamped = clampToSRGB(oklch);
  const hex = oklchToHex(clamped);
  let contrastVsBgDefault: number | undefined;
  let contrastPass: boolean | undefined;

  if (bgForContrast !== undefined && required !== undefined) {
    contrastVsBgDefault = contrastRatio(clamped, bgForContrast);
    contrastPass = contrastVsBgDefault >= required;
  }

  return {
    oklch: clamped,
    hex,
    contrastVsBgDefault,
    contrastRequired: required,
    contrastPass,
    isFallback,
  };
}

export function generatePalette(
  baseHex: string,
  baseOklch: OklchColor,
  mode: ColorMode,
  intensity: number
): { tokens: TokenMap; inverseTokens: InverseTokenMap } {
  const H = baseOklch.h ?? 0;
  const baseC = baseOklch.c;
  const C = (c: number) => c * intensity;

  if (mode === 'light') {
    return generateLightPalette(baseOklch, H, baseC, C, baseHex);
  } else {
    return generateDarkPalette(baseOklch, H, baseC, C, baseHex);
  }
}

function generateLightPalette(
  base: OklchColor,
  H: number,
  baseC: number,
  C: (c: number) => number,
  _baseHex: string
): { tokens: TokenMap; inverseTokens: InverseTokenMap } {
  // Track 1: Backgrounds (very light, barely tinted)
  const bgDocument = makeOklch(0.99, C(baseC * 0.06), H);
  const bgElevated = makeOklch(0.99, C(baseC * 0.06), H);
  const bgSubtle = makeOklch(0.955, C(baseC * 0.1), H);
  const bgDefault = makeOklch(0.915, C(baseC * 0.14), H);
  const bgHover = makeOklch(0.895, C(baseC * 0.18), H);
  const bgActive = makeOklch(0.875, C(baseC * 0.22), H);

  // Track 2: Borders (mid-range L, higher C)
  // Anchor at L=0.52 for cross-group visual alignment; adjust only if needed.
  const borderSubtle = makeOklch(0.77, C(baseC * 0.45), H);
  let borderDefault = makeOklch(0.52, C(baseC), H);
  borderDefault = adjustLForContrast(borderDefault, bgDefault, 3, 'darken');
  let borderHover = makeOklch(borderDefault.l - 0.04, C(borderDefault.c), H);
  borderHover = adjustLForContrast(borderHover, bgHover, 3, 'darken');
  let borderActive = makeOklch(borderHover.l - 0.04, C(borderHover.c), H);
  borderActive = adjustLForContrast(borderActive, bgActive, 3, 'darken');

  // Track 3: Text/icons (high contrast)
  // Anchor at L=0.40 for cross-group visual alignment; adjust only if needed.
  let colorDefault = makeOklch(0.4, C(baseC), H);
  colorDefault = adjustLForContrast(colorDefault, bgDefault, 4.5, 'darken');
  let colorHover = makeOklch(colorDefault.l - 0.04, C(colorDefault.c), H);
  colorHover = adjustLForContrast(colorHover, bgHover, 4.5, 'darken');
  let colorActive = makeOklch(colorHover.l - 0.04, C(colorHover.c), H);
  colorActive = adjustLForContrast(colorActive, bgActive, 4.5, 'darken');

  // color-subtle: try lightening color-default, fall back if fails
  let colorSubtle = makeOklch(
    colorDefault.l + 0.05,
    C(colorDefault.c * 0.9),
    H
  );
  let colorSubtleFallback = false;
  if (contrastRatio(colorSubtle, bgSubtle) < 4.5) {
    colorSubtle = colorDefault;
    colorSubtleFallback = true;
  }

  // color-document: very dark tint
  let colorDocument = makeOklch(0.18, C(baseC * 0.6), H);
  colorDocument = adjustLForContrast(colorDocument, bgSubtle, 4.5, 'darken');

  // Inverse track: dark backgrounds
  let invBgDefault = makeOklch(base.l, C(baseC), H);
  invBgDefault = adjustLForContrast(invBgDefault, bgDefault, 3, 'darken');
  // Ensure inverse-bg-default is sufficiently dark to look "inverse"
  if (invBgDefault.l > 0.55) invBgDefault = makeOklch(0.45, C(baseC * 0.85), H);

  const invBgSubtle = makeOklch(invBgDefault.l - 0.08, C(baseC * 0.7), H);
  const invBgDocument = makeOklch(invBgSubtle.l + 0.04, C(baseC * 0.6), H);
  const invBgElevated = invBgDocument;
  const invBgHover = makeOklch(
    invBgDefault.l - 0.04,
    C(invBgDefault.c * 1.0),
    H
  );
  const invBgActive = makeOklch(invBgHover.l - 0.04, C(invBgHover.c * 1.0), H);

  // Inverse borders (lighter = more visible on dark bg)
  let invBorderDefault = makeOklch(invBgDefault.l + 0.25, C(baseC * 0.55), H);
  invBorderDefault = adjustLForContrast(
    invBorderDefault,
    invBgDefault,
    3,
    'lighten'
  );
  const invBorderSubtle = makeOklch(
    invBorderDefault.l - 0.08,
    C(invBorderDefault.c),
    H
  );
  let invBorderHover = makeOklch(
    invBorderDefault.l + 0.05,
    C(invBorderDefault.c),
    H
  );
  invBorderHover = adjustLForContrast(invBorderHover, invBgHover, 3, 'lighten');
  let invBorderActive = makeOklch(
    invBorderHover.l + 0.05,
    C(invBorderHover.c),
    H
  );
  invBorderActive = adjustLForContrast(
    invBorderActive,
    invBgActive,
    3,
    'lighten'
  );

  // Inverse text: try bg-document value; fall back to white
  const bgDocumentAsText = clampToSRGB(bgDocument);
  let invColorDefault: OklchColor;
  if (contrastRatio(bgDocumentAsText, invBgDefault) >= 4.5) {
    invColorDefault = bgDocumentAsText;
  } else {
    invColorDefault = makeOklch(0.99, 0, H);
  }

  let invColorHover: OklchColor;
  if (contrastRatio(bgDocumentAsText, invBgHover) >= 4.5) {
    invColorHover = bgDocumentAsText;
  } else {
    invColorHover = makeOklch(0.99, 0, H);
  }

  let invColorActive: OklchColor;
  if (contrastRatio(bgDocumentAsText, invBgActive) >= 4.5) {
    invColorActive = bgDocumentAsText;
  } else {
    invColorActive = makeOklch(0.99, 0, H);
  }

  let invColorSubtle = makeOklch(invColorDefault.l - 0.05, C(baseC * 0.4), H);
  if (contrastRatio(invColorSubtle, invBgDocument) < 4.5) {
    invColorSubtle = invColorDefault;
  }

  let invColorDocument: OklchColor;
  if (contrastRatio(bgDocumentAsText, invBgDefault) >= 4.5) {
    invColorDocument = bgDocumentAsText;
  } else {
    invColorDocument = makeOklch(0.99, 0, H);
  }

  return {
    tokens: {
      'bg-document': swatch(bgDocument),
      'bg-elevated': swatch(bgElevated),
      'bg-subtle': swatch(bgSubtle),
      'bg-default': swatch(bgDefault),
      'bg-hover': swatch(bgHover),
      'bg-active': swatch(bgActive),
      'border-subtle': swatch(borderSubtle, bgDefault, 3),
      'border-default': swatch(borderDefault, bgDefault, 3),
      'border-hover': swatch(borderHover, bgHover, 3),
      'border-active': swatch(borderActive, bgActive, 3),
      'color-subtle': swatch(colorSubtle, bgSubtle, 4.5, colorSubtleFallback),
      'color-default': swatch(colorDefault, bgDefault, 4.5),
      'color-hover': swatch(colorHover, bgHover, 4.5),
      'color-active': swatch(colorActive, bgActive, 4.5),
      'color-document': swatch(colorDocument, bgSubtle, 4.5),
    },
    inverseTokens: {
      'inverse-bg-document': swatch(invBgDocument),
      'inverse-bg-elevated': swatch(invBgElevated),
      'inverse-bg-subtle': swatch(invBgSubtle),
      'inverse-bg-default': swatch(invBgDefault, bgDefault, 3),
      'inverse-bg-hover': swatch(invBgHover),
      'inverse-bg-active': swatch(invBgActive),
      'inverse-border-subtle': swatch(invBorderSubtle),
      'inverse-border-default': swatch(invBorderDefault, invBgDefault, 3),
      'inverse-border-hover': swatch(invBorderHover, invBgHover, 3),
      'inverse-border-active': swatch(invBorderActive, invBgActive, 3),
      'inverse-color-subtle': swatch(invColorSubtle, invBgDocument, 4.5),
      'inverse-color-default': swatch(invColorDefault, invBgDefault, 4.5),
      'inverse-color-hover': swatch(invColorHover, invBgHover, 4.5),
      'inverse-color-active': swatch(invColorActive, invBgActive, 4.5),
      'inverse-color-document': swatch(invColorDocument, invBgDefault, 4.5),
    },
  };
}

function generateDarkPalette(
  base: OklchColor,
  H: number,
  baseC: number,
  C: (c: number) => number,
  _baseHex: string
): { tokens: TokenMap; inverseTokens: InverseTokenMap } {
  // Dark mode: backgrounds go from very dark to slightly less dark
  const bgDocument = makeOklch(0.12, C(baseC * 0.12), H);
  const bgElevated = makeOklch(0.155, C(baseC * 0.14), H); // lighter for elevation
  const bgSubtle = makeOklch(0.175, C(baseC * 0.16), H);
  const bgDefault = makeOklch(0.23, C(baseC * 0.18), H);
  const bgHover = makeOklch(0.26, C(baseC * 0.2), H);
  const bgActive = makeOklch(0.29, C(baseC * 0.22), H);

  // Borders: mid-range, visible on dark bg
  // Anchor at L=0.52 for cross-group visual alignment; adjust only if needed.
  const borderSubtle = makeOklch(0.38, C(baseC * 0.45), H);
  let borderDefault = makeOklch(0.52, C(baseC), H);
  borderDefault = adjustLForContrast(borderDefault, bgDefault, 3, 'lighten');
  let borderHover = makeOklch(borderDefault.l + 0.04, C(borderDefault.c), H);
  borderHover = adjustLForContrast(borderHover, bgHover, 3, 'lighten');
  let borderActive = makeOklch(borderHover.l + 0.04, C(borderHover.c), H);
  borderActive = adjustLForContrast(borderActive, bgActive, 3, 'lighten');

  // Text: light on dark bg
  // Anchor at L=0.72 for cross-group visual alignment; adjust only if needed.
  let colorDefault = makeOklch(0.72, C(baseC * 0.8), H);
  colorDefault = adjustLForContrast(colorDefault, bgDefault, 4.5, 'lighten');

  let colorHover = makeOklch(colorDefault.l + 0.04, C(colorDefault.c * 0.9), H);
  colorHover = adjustLForContrast(colorHover, bgHover, 4.5, 'lighten');
  let colorActive = makeOklch(colorHover.l + 0.04, C(colorHover.c * 0.9), H);
  colorActive = adjustLForContrast(colorActive, bgActive, 4.5, 'lighten');

  let colorSubtle = makeOklch(
    colorDefault.l - 0.04,
    C(colorDefault.c * 0.85),
    H
  );
  let colorSubtleFallback = false;
  if (contrastRatio(colorSubtle, bgSubtle) < 4.5) {
    colorSubtle = colorDefault;
    colorSubtleFallback = true;
  }

  let colorDocument = makeOklch(0.93, C(baseC * 0.15), H);
  colorDocument = adjustLForContrast(colorDocument, bgSubtle, 4.5, 'lighten');

  // Dark mode inverse: light backgrounds (flipped from light mode)
  let invBgDefault = makeOklch(base.l, C(baseC), H);
  if (invBgDefault.l < 0.5) invBgDefault = makeOklch(0.58, C(baseC * 0.9), H);
  invBgDefault = adjustLForContrast(invBgDefault, bgDefault, 3, 'lighten');

  const invBgSubtle = makeOklch(invBgDefault.l + 0.06, C(baseC * 0.75), H);
  const invBgDocument = makeOklch(invBgSubtle.l - 0.03, C(baseC * 0.65), H);
  const invBgElevated = makeOklch(invBgDocument.l + 0.04, C(baseC * 0.6), H);
  const invBgHover = makeOklch(invBgDefault.l + 0.04, C(invBgDefault.c), H);
  const invBgActive = makeOklch(invBgHover.l + 0.04, C(invBgHover.c), H);

  // Inverse borders on light inverse backgrounds
  let invBorderDefault = makeOklch(invBgDefault.l - 0.25, C(baseC * 0.6), H);
  invBorderDefault = adjustLForContrast(
    invBorderDefault,
    invBgDefault,
    3,
    'darken'
  );
  const invBorderSubtle = makeOklch(
    invBorderDefault.l + 0.06,
    C(invBorderDefault.c),
    H
  );
  let invBorderHover = makeOklch(
    invBorderDefault.l - 0.04,
    C(invBorderDefault.c),
    H
  );
  invBorderHover = adjustLForContrast(invBorderHover, invBgHover, 3, 'darken');
  let invBorderActive = makeOklch(
    invBorderHover.l - 0.04,
    C(invBorderHover.c),
    H
  );
  invBorderActive = adjustLForContrast(
    invBorderActive,
    invBgActive,
    3,
    'darken'
  );

  // Inverse text on light inverse backgrounds: dark text
  let invColorDefault = makeOklch(bgDocument.l, bgDocument.c, H);
  if (contrastRatio(invColorDefault, invBgDefault) < 4.5) {
    invColorDefault = makeOklch(0.15, C(baseC * 0.3), H);
    invColorDefault = adjustLForContrast(
      invColorDefault,
      invBgDefault,
      4.5,
      'darken'
    );
  }

  let invColorHover = makeOklch(invColorDefault.l - 0.02, invColorDefault.c, H);
  if (contrastRatio(invColorHover, invBgHover) < 4.5)
    invColorHover = invColorDefault;

  let invColorActive = makeOklch(
    invColorDefault.l - 0.04,
    invColorDefault.c,
    H
  );
  if (contrastRatio(invColorActive, invBgActive) < 4.5)
    invColorActive = invColorDefault;

  let invColorSubtle = makeOklch(invColorDefault.l + 0.05, C(baseC * 0.4), H);
  if (contrastRatio(invColorSubtle, invBgDocument) < 4.5)
    invColorSubtle = invColorDefault;

  const invColorDocument = invColorDefault;

  return {
    tokens: {
      'bg-document': swatch(bgDocument),
      'bg-elevated': swatch(bgElevated),
      'bg-subtle': swatch(bgSubtle),
      'bg-default': swatch(bgDefault),
      'bg-hover': swatch(bgHover),
      'bg-active': swatch(bgActive),
      'border-subtle': swatch(borderSubtle, bgDefault, 3),
      'border-default': swatch(borderDefault, bgDefault, 3),
      'border-hover': swatch(borderHover, bgHover, 3),
      'border-active': swatch(borderActive, bgActive, 3),
      'color-subtle': swatch(colorSubtle, bgSubtle, 4.5, colorSubtleFallback),
      'color-default': swatch(colorDefault, bgDefault, 4.5),
      'color-hover': swatch(colorHover, bgHover, 4.5),
      'color-active': swatch(colorActive, bgActive, 4.5),
      'color-document': swatch(colorDocument, bgSubtle, 4.5),
    },
    inverseTokens: {
      'inverse-bg-document': swatch(invBgDocument),
      'inverse-bg-elevated': swatch(invBgElevated),
      'inverse-bg-subtle': swatch(invBgSubtle),
      'inverse-bg-default': swatch(invBgDefault, bgDefault, 3),
      'inverse-bg-hover': swatch(invBgHover),
      'inverse-bg-active': swatch(invBgActive),
      'inverse-border-subtle': swatch(invBorderSubtle),
      'inverse-border-default': swatch(invBorderDefault, invBgDefault, 3),
      'inverse-border-hover': swatch(invBorderHover, invBgHover, 3),
      'inverse-border-active': swatch(invBorderActive, invBgActive, 3),
      'inverse-color-subtle': swatch(invColorSubtle, invBgDocument, 4.5),
      'inverse-color-default': swatch(invColorDefault, invBgDefault, 4.5),
      'inverse-color-hover': swatch(invColorHover, invBgHover, 4.5),
      'inverse-color-active': swatch(invColorActive, invBgActive, 4.5),
      'inverse-color-document': swatch(invColorDocument, invBgDefault, 4.5),
    },
  };
}

export function buildColorGroup(
  id: string,
  name: string,
  baseColor: string,
  baseOklch: OklchColor,
  mode: ColorMode,
  intensity: number
): ColorGroup {
  const { tokens, inverseTokens } = generatePalette(
    baseColor,
    baseOklch,
    mode,
    intensity
  );
  return { id, name, baseColor, tokens, inverseTokens };
}
