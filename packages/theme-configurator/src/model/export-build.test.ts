// @vitest-environment node
import { describe, it, expect, afterAll } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import StyleDictionary from 'style-dictionary';
// @ts-expect-error - build-script zonder type-declaraties
import { createFullConfig } from '../../../design-tokens/src/config/config.js';
import { defaultConfig, exportTheme } from './theme';
import type { ThemeConfig } from './theme';

/**
 * De export van de theme configurator moet direct in de starter kit passen.
 * Deze test zet de geëxporteerde bestanden in een tijdelijke themamap en
 * bouwt ze met de Style Dictionary-config van design-tokens, zoals
 * `pnpm build:tokens` dat doet voor Start.
 */

const DESIGN_TOKENS = path.resolve(__dirname, '../../../design-tokens');
const MODES = ['light', 'dark'] as const;
const tempDirs: string[] = [];

afterAll(() => {
  for (const dir of tempDirs) fs.rmSync(dir, { recursive: true, force: true });
});

/** Bouwt de export en geeft de CSS per mode terug. */
async function buildExport(
  config: ThemeConfig
): Promise<Record<string, string>> {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dsn-theme-export-'));
  tempDirs.push(dir);
  const themeDir = path.join(dir, 'theme');
  fs.mkdirSync(themeDir);
  for (const [file, content] of Object.entries(exportTheme(config))) {
    fs.writeFileSync(path.join(themeDir, file), content);
  }

  const css: Record<string, string> = {};
  for (const mode of MODES) {
    const config = createFullConfig('start', mode, 'default');
    const buildPath = path.join(dir, 'dist', mode) + path.sep;
    const sd = new StyleDictionary({
      ...config,
      // De themabestanden uit de export; componenten en project type uit de repo.
      source: config.source.map((source: string) =>
        source.startsWith('src/tokens/themes/start/')
          ? path.join(themeDir, path.basename(source))
          : path.join(DESIGN_TOKENS, source)
      ),
      platforms: {
        css: { ...config.platforms.css, buildPath },
      },
      log: { verbosity: 'silent', warnings: 'disabled' },
    });
    await sd.buildAllPlatforms();
    css[mode] = fs.readFileSync(
      path.join(buildPath, `start-${mode}-default.css`),
      'utf-8'
    );
  }
  return css;
}

/**
 * Wat Style Dictionary schrijft: zonder de regel met de bouwtijd, en zonder
 * het prefers-reduced-motion-blok dat build.js er daarna achter zet.
 */
function styleDictionaryPart(css: string): string {
  const reducedMotion = css.indexOf('\n@media (prefers-reduced-motion');
  return (reducedMotion === -1 ? css : css.slice(0, reducedMotion)).replace(
    /^ \* Generated on .*$/m,
    ''
  );
}

describe('export van de theme configurator', () => {
  it('bouwt met de standaardconfig precies de CSS van Start', async () => {
    const css = await buildExport(defaultConfig());
    for (const mode of MODES) {
      const start = fs.readFileSync(
        path.join(DESIGN_TOKENS, `dist/css/start-${mode}-default.css`),
        'utf-8'
      );
      expect(styleDictionaryPart(css[mode])).toBe(styleDictionaryPart(start));
    }
  });

  it('bouwt zonder fouten met een andere kleur en een eigen groep', async () => {
    const config = defaultConfig();
    config.colors.intensity = 1.4;
    config.colors.groups['accent-1'] = { base: '#7c3aed' };
    config.colors.groups.info = { base: '#0284c7' };
    config.colors.groups.brand = { base: '#e6194b' };
    const css = await buildExport(config);
    for (const mode of MODES) {
      expect(css[mode]).toMatch(/--dsn-color-brand-bg-default: oklch\(/);
      expect(css[mode]).toMatch(/--dsn-color-info-inverse-bg-default: oklch\(/);
    }
  });
});
