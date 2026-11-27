import { describe, it, expect } from 'vitest';
import { flattenTokens, mergeTokenTrees } from './tokens.ts';
import type { TokenTree } from './tokens.ts';

const VIEWPORT = { min: 360, max: 1440 };

describe('mergeTokenTrees', () => {
  it('laat een latere boom per token winnen en houdt de rest', () => {
    const merged = mergeTokenTrees(
      { dsn: { a: { $value: '1px' }, b: { $value: '2px' } } },
      { dsn: { b: { $value: '3px' }, c: { $value: '4px' } } }
    );
    expect(merged).toEqual({
      dsn: { a: { $value: '1px' }, b: { $value: '3px' }, c: { $value: '4px' } },
    });
  });

  it('verandert de bronbomen niet', () => {
    const source: TokenTree = { dsn: { a: { $value: '1px' } } };
    const merged = mergeTokenTrees(source);
    (merged.dsn as TokenTree).a = { $value: '9px' };
    expect(source).toEqual({ dsn: { a: { $value: '1px' } } });
  });
});

describe('flattenTokens', () => {
  const tree: TokenTree = {
    dsn: {
      $description: 'genegeerd',
      size: {
        min: { $value: '1rem' },
        max: { $value: 'calc(1rem * 1.25)' },
        md: { $value: 'fluid({dsn.size.min}, {dsn.size.max})' },
      },
      color: {
        base: { $value: 'oklch(0.5 0.1 250)', $type: 'color' },
        alias: { $value: '{dsn.color.base}', $type: 'color' },
        none: { $value: 'transparent', $type: 'color' },
      },
      shadow: { $value: '0 1px 2px {dsn.color.base}' },
    },
  };

  it('schrijft tokens zoals de token-build ze in CSS zet', () => {
    expect(flattenTokens(tree, VIEWPORT)).toEqual([
      { path: 'dsn.size.min', name: '--dsn-size-min', value: '1rem' },
      {
        path: 'dsn.size.max',
        name: '--dsn-size-max',
        value: 'calc(1rem * 1.25)',
      },
      {
        path: 'dsn.size.md',
        name: '--dsn-size-md',
        value: 'clamp(1rem, 0.91667rem + 0.37037vw, 1.25rem)',
      },
      {
        path: 'dsn.color.base',
        name: '--dsn-color-base',
        value: 'oklch(0.5 0.1 250)',
      },
      {
        path: 'dsn.color.alias',
        name: '--dsn-color-alias',
        value: 'var(--dsn-color-base)',
      },
      {
        path: 'dsn.color.none',
        name: '--dsn-color-none',
        value: 'rgba(0, 0, 0, 0)',
      },
      {
        path: 'dsn.shadow',
        name: '--dsn-shadow',
        value: '0 1px 2px var(--dsn-color-base)',
      },
    ]);
  });

  it('weigert een onbekende verwijzing en een kringverwijzing', () => {
    expect(() =>
      flattenTokens({ dsn: { a: { $value: '{dsn.b}' } } }, VIEWPORT)
    ).toThrow('onbekende verwijzing {dsn.b}');
    expect(() =>
      flattenTokens(
        {
          dsn: {
            a: { $value: '{dsn.b}' },
            b: { $value: '{dsn.a}' },
            c: { $value: 'fluid({dsn.a}, 1rem)' },
          },
        },
        VIEWPORT
      )
    ).toThrow('Kringverwijzing');
  });
});
