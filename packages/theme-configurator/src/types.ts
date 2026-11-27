import type { ColorGroup, ColorMode } from '@dsn-starter-kit/theme-engine';

export type {
  TokenStep,
  InverseTokenStep,
  OklchColor,
  SwatchData,
  TokenMap,
  InverseTokenMap,
  ColorGroup,
  ColorMode,
} from '@dsn-starter-kit/theme-engine';
export {
  TOKEN_STEPS,
  INVERSE_TOKEN_STEPS,
  DEFAULT_GROUP_NAMES,
} from '@dsn-starter-kit/theme-engine';

export const DEFAULT_BASE_COLORS: Record<string, string> = {
  neutral: '#868686',
  'accent-1': '#1B59A4',
  'accent-2': '#7C3AED',
  'accent-3': '#0891B2',
  'action-1': '#2563EB',
  'action-2': '#059669',
  info: '#0284C7',
  positive: '#16A34A',
  negative: '#DC2626',
  warning: '#D97706',
};

export type DisplayFormat = 'oklch' | 'hex';

export interface PaletteState {
  groups: ColorGroup[];
  mode: ColorMode;
  intensity: number;
  displayFormat: DisplayFormat;
}
