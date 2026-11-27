import { describe, it, expect } from 'vitest';
import {
  applyColorTokens,
  generateColorTokens,
  validateThemeConfig,
} from './theme.ts';
import type { ThemeConfig } from './theme.ts';
import { buildColorGroup } from './palette.ts';
import { oklchToCss, parseToOklch } from './oklch.ts';
import { TOKEN_STEPS } from './types.ts';

const CONFIG: ThemeConfig = {
  colors: {
    intensity: 1,
    groups: {
      neutral: { base: '#595959' },
      'accent-1': { base: 'oklch(0.468 0.164 255.8)' },
      info: { alias: 'accent-1' },
    },
  },
};

function token(value: string, description: string) {
  return { $value: value, $type: 'color', $description: description };
}

/** A color JSON in the shape of colors-{mode}.json, for the groups above. */
function template() {
  const group = (name: string) =>
    Object.fromEntries(
      TOKEN_STEPS.map((step) => [step, token('#000000', `${name} ${step}`)])
    );
  return {
    dsn: {
      color: {
        neutral: group('neutral'),
        'accent-1': group('accent-1'),
        info: group('info'),
        'neutral-inverse': group('neutral-inverse'),
        'accent-1-inverse': group('accent-1-inverse'),
        'info-inverse': group('info-inverse'),
        transparent: token('transparent', 'Doorzichtig'),
        shadow: { direct: token('#00000020', 'Schaduw') },
      },
      focus: { 'outline-color': token('#ffdd00', 'Focus') },
    },
  };
}

describe('validateThemeConfig', () => {
  it('keurt een geldige config goed', () => {
    expect(validateThemeConfig(CONFIG)).toEqual([]);
  });

  it('meldt elk probleem', () => {
    expect(validateThemeConfig({})).toEqual(['`colors` ontbreekt']);
    expect(
      validateThemeConfig({
        colors: {
          intensity: 0,
          groups: {
            a: { base: 'geen kleur' },
            b: { base: '#fff', alias: 'a' },
            c: { alias: 'onbekend' },
            d: { alias: 'd' },
            e: { alias: 'f' },
            f: { alias: 'a' },
          },
        },
      })
    ).toEqual([
      '`colors.intensity` moet een getal groter dan 0 zijn',
      'a: "geen kleur" is geen geldige kleur',
      'b: geef óf `base` óf `alias` op, en niets anders',
      'c: verwijst naar onbekende groep "onbekend"',
      'd: verwijst naar zichzelf',
      'e: verwijst naar "f", die zelf ook een verwijzing is',
    ]);
  });
});

describe('generateColorTokens', () => {
  it.each(['light', 'dark'] as const)(
    'neemt de waarden van buildColorGroup over, afgerond als oklch() (%s)',
    (mode) => {
      const values = generateColorTokens(CONFIG, mode);
      const base = parseToOklch('oklch(0.468 0.164 255.8)');
      if (!base) throw new Error('basiskleur');
      const group = buildColorGroup('a', 'a', '', base, mode, 1);
      for (const step of TOKEN_STEPS) {
        expect(values['accent-1'][step]).toBe(
          oklchToCss(group.tokens[step].oklch)
        );
        expect(values['accent-1-inverse'][step]).toBe(
          oklchToCss(group.inverseTokens[`inverse-${step}`].oklch)
        );
      }
    }
  );

  it('laat een alias token voor token verwijzen, ook het inverse deel', () => {
    const values = generateColorTokens(CONFIG, 'light');
    for (const step of TOKEN_STEPS) {
      expect(values.info[step]).toBe(`{dsn.color.accent-1.${step}}`);
      expect(values['info-inverse'][step]).toBe(
        `{dsn.color.accent-1-inverse.${step}}`
      );
    }
  });

  it('weigert een ongeldige config', () => {
    expect(() =>
      generateColorTokens(
        { colors: { intensity: 1, groups: { a: { alias: 'b' } } } },
        'light'
      )
    ).toThrow('verwijst naar onbekende groep "b"');
  });
});

describe('applyColorTokens', () => {
  const values = generateColorTokens(CONFIG, 'light');

  it('verandert alleen $value van de kleurgroepen', () => {
    const before = template();
    const after = applyColorTokens(before, values);

    expect(after.dsn.color['accent-1']['bg-default']).toEqual({
      $value: values['accent-1']['bg-default'],
      $type: 'color',
      $description: 'accent-1 bg-default',
    });
    expect(after.dsn.color.info['color-default'].$value).toBe(
      '{dsn.color.accent-1.color-default}'
    );
    expect(after.dsn.color.transparent).toEqual(before.dsn.color.transparent);
    expect(after.dsn.color.shadow).toEqual(before.dsn.color.shadow);
    expect(after.dsn.focus).toEqual(before.dsn.focus);
  });

  it('houdt de sleutelvolgorde aan', () => {
    const before = template();
    const after = applyColorTokens(before, values);
    expect(Object.keys(after.dsn.color)).toEqual(Object.keys(before.dsn.color));
    expect(Object.keys(after.dsn.color.neutral)).toEqual(TOKEN_STEPS);
  });

  it('laat de template zelf ongemoeid', () => {
    const before = template();
    applyColorTokens(before, values);
    expect(before).toEqual(template());
  });

  it('weigert als de JSON en de config niet dezelfde groepen beschrijven', () => {
    const missingGroup = template() as { dsn: { color: object } };
    delete (missingGroup.dsn.color as Record<string, unknown>).info;
    expect(() => applyColorTokens(missingGroup, values)).toThrow(
      'groep info ontbreekt in de JSON'
    );

    const extraGroup = template();
    (extraGroup.dsn.color as Record<string, unknown>).warning =
      extraGroup.dsn.color.neutral;
    expect(() => applyColorTokens(extraGroup, values)).toThrow(
      'groep warning staat in de JSON maar niet in de config'
    );

    const extraStep = template();
    (extraStep.dsn.color.neutral as Record<string, unknown>)['bg-extra'] =
      token('#000', 'extra');
    expect(() => applyColorTokens(extraStep, values)).toThrow(
      'neutral.bg-extra staat in de JSON maar niet in de generator'
    );
  });
});
