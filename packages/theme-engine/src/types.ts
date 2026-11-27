export type TokenStep =
  | 'bg-document'
  | 'bg-elevated'
  | 'bg-subtle'
  | 'bg-default'
  | 'bg-hover'
  | 'bg-active'
  | 'border-subtle'
  | 'border-default'
  | 'border-hover'
  | 'border-active'
  | 'color-subtle'
  | 'color-default'
  | 'color-hover'
  | 'color-active'
  | 'color-document';

export type InverseTokenStep = `inverse-${TokenStep}`;

export const TOKEN_STEPS: TokenStep[] = [
  'bg-document',
  'bg-elevated',
  'bg-subtle',
  'bg-default',
  'bg-hover',
  'bg-active',
  'border-subtle',
  'border-default',
  'border-hover',
  'border-active',
  'color-subtle',
  'color-default',
  'color-hover',
  'color-active',
  'color-document',
];

export const INVERSE_TOKEN_STEPS: InverseTokenStep[] = TOKEN_STEPS.map(
  (step): InverseTokenStep => `inverse-${step}`
);

export const DEFAULT_GROUP_NAMES = [
  'neutral',
  'accent-1',
  'accent-2',
  'accent-3',
  'action-1',
  'action-2',
  'info',
  'positive',
  'negative',
  'warning',
] as const;

export interface OklchColor {
  mode: 'oklch';
  l: number;
  c: number;
  h: number;
}

export interface SwatchData {
  oklch: OklchColor;
  hex: string;
  contrastVsBgDefault?: number;
  contrastRequired?: number;
  contrastPass?: boolean;
  isFallback?: boolean;
}

export type TokenMap = Record<TokenStep, SwatchData>;
export type InverseTokenMap = Record<InverseTokenStep, SwatchData>;

export interface ColorGroup {
  id: string;
  name: string;
  baseColor: string;
  tokens: TokenMap;
  inverseTokens: InverseTokenMap;
}

export type ColorMode = 'light' | 'dark';
