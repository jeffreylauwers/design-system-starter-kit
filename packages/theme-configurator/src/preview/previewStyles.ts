import type { ColorMode } from '@dsn-starter-kit/theme-engine';
// The same files the configurator itself loads (see main.tsx), as URLs: the
// frame links them, so they are downloaded once and come from the cache.
import coreCssUrl from '@dsn-starter-kit/core/css?url';
import componentsCssUrl from '@dsn-starter-kit/components-react/css?url';
import type { ResolvedToken } from '../model/theme';

export type Density = 'default' | 'information-dense';

type CssModule = { default: string };

/**
 * Start's complete token CSS per mode and density, as the token build writes
 * it. The preview has a document of its own, so it simply loads the full
 * configuration of one combination on its own `:root`, without classes.
 * Each is about 200 kB, so each is its own chunk, loaded when it is first
 * chosen.
 */
const TOKEN_LOADERS: Record<
  ColorMode,
  Record<Density, () => Promise<CssModule>>
> = {
  light: {
    default: () =>
      import('../../../design-tokens/dist/css/start-light-default.css?inline'),
    'information-dense': () =>
      import('../../../design-tokens/dist/css/start-light-information-dense.css?inline'),
  },
  dark: {
    default: () =>
      import('../../../design-tokens/dist/css/start-dark-default.css?inline'),
    'information-dense': () =>
      import('../../../design-tokens/dist/css/start-dark-information-dense.css?inline'),
  },
};

const loaded = new Map<string, Promise<string>>();

/** Start's token CSS for a mode and density; loaded once, then cached. */
export function loadTokenCss(
  mode: ColorMode,
  density: Density
): Promise<string> {
  const key = `${mode}-${density}`;
  let css = loaded.get(key);
  if (!css) {
    css = TOKEN_LOADERS[mode][density]().then((module) => module.default);
    loaded.set(key, css);
  }
  return css;
}

/** The overrides as CSS: one `:root` rule after Start's tokens. */
export function overridesCss(tokens: ResolvedToken[]): string {
  if (tokens.length === 0) return '';
  const lines = tokens.map((token) => `  ${token.name}: ${token.value};`);
  return `:root {\n${lines.join('\n')}\n}\n`;
}

/** Style sheets the preview document links: the reset and the components. */
export const PREVIEW_LINKS = [
  { id: 'core', href: coreCssUrl },
  { id: 'components', href: componentsCssUrl },
];

/** The preview document's own styles, in cascade order. */
export function previewStyles(
  tokensCss: string,
  overrides: ResolvedToken[]
): { id: string; css: string }[] {
  return [
    { id: 'tokens', css: tokensCss },
    { id: 'overrides', css: overridesCss(overrides) },
  ];
}
