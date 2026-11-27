import { isFluidValue, resolveFluid } from './fluid.ts';
import type { FluidViewport } from './fluid.ts';

/** A token as it is written in the token JSON. */
export interface TokenLeaf {
  $value: unknown;
  $type?: string;
  $description?: string;
}

/** A group of tokens. Keys starting with `$` (such as `$description`) are metadata. */
export interface TokenTree {
  [key: string]: TokenTree | TokenLeaf | string;
}

/** One CSS custom property, as the token build writes it. */
export interface ResolvedToken {
  /** Token path, e.g. `dsn.color.accent-1.bg-default`. */
  path: string;
  /** CSS custom property, e.g. `--dsn-color-accent-1-bg-default`. */
  name: string;
  /** The value in CSS: a reference becomes `var()`, fluid() a clamp(). */
  value: string;
}

const REFERENCE = /\{([^}]+)\}/g;

function isLeaf(node: unknown): node is TokenLeaf {
  return typeof node === 'object' && node !== null && '$value' in node;
}

function isTree(node: unknown): node is TokenTree {
  return typeof node === 'object' && node !== null && !isLeaf(node);
}

/**
 * Merges token trees into one. A later tree wins per token, like a later
 * source file in Style Dictionary: a project type overrides a theme token.
 */
export function mergeTokenTrees(...trees: TokenTree[]): TokenTree {
  const result: TokenTree = {};
  for (const tree of trees) {
    for (const [key, node] of Object.entries(tree)) {
      const current = result[key];
      if (typeof node !== 'object') result[key] = node;
      else if (isTree(node)) {
        result[key] = isTree(current)
          ? mergeTokenTrees(current, node)
          : mergeTokenTrees(node);
      } else result[key] = { ...node };
    }
  }
  return result;
}

/** Every token in the tree, keyed by its dotted path, in document order. */
function collectTokens(tree: TokenTree): Map<string, TokenLeaf> {
  const tokens = new Map<string, TokenLeaf>();
  const walk = (node: TokenTree, path: string[]) => {
    for (const [key, child] of Object.entries(node)) {
      if (key.startsWith('$') || typeof child !== 'object') continue;
      if (isLeaf(child)) tokens.set([...path, key].join('.'), child);
      else walk(child, [...path, key]);
    }
  };
  walk(tree, []);
  return tokens;
}

export function cssName(path: string): string {
  return `--${path.replace(/\./g, '-')}`;
}

/**
 * Flattens a token tree into CSS custom properties, the way the token build
 * writes them with `outputReferences`: a reference stays a `var()`, so the
 * custom property follows when the token it points at changes. A fluid token
 * is the exception: its references are resolved to values and turned into a
 * clamp(), with the same calculation as the build.
 */
export function flattenTokens(
  tree: TokenTree,
  viewport: FluidViewport
): ResolvedToken[] {
  const tokens = collectTokens(tree);

  const resolveValue = (path: string, seen: string[] = []): string => {
    if (seen.includes(path)) {
      throw new Error(`Kringverwijzing: ${[...seen, path].join(' -> ')}`);
    }
    const token = tokens.get(path);
    if (!token) throw new Error(`Onbekende verwijzing: {${path}}`);
    return String(token.$value).replace(REFERENCE, (_, ref: string) =>
      resolveValue(ref, [...seen, path])
    );
  };

  const result: ResolvedToken[] = [];
  for (const [path, token] of tokens) {
    const raw = String(token.$value);
    let value: string;
    if (isFluidValue(raw)) {
      value = resolveFluid(resolveValue(path), viewport);
    } else if (token.$type === 'color' && raw === 'transparent') {
      // Style Dictionary's color/css transform writes this as rgba().
      value = 'rgba(0, 0, 0, 0)';
    } else {
      value = raw.replace(REFERENCE, (_, ref: string) => {
        if (!tokens.has(ref))
          throw new Error(`${path}: onbekende verwijzing {${ref}}`);
        return `var(${cssName(ref)})`;
      });
    }
    result.push({ path, name: cssName(path), value });
  }
  return result;
}
