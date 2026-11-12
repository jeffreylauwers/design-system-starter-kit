import { isValidElement, type ComponentProps, type ReactNode } from 'react';
import { Markdown, Source } from '@storybook/addon-docs/blocks';
import './DocsMarkdown.css';
import tokenDocs from '@dsn-starter-kit/design-tokens/token-docs.json';

/**
 * Markdown van een `.docs.md`, met de token-tabellen gegenereerd uit de
 * design tokens.
 *
 * Een token-tabel schrijf je niet met de hand, maar als marker:
 *
 *   <!-- tokens: checkbox-group -->
 *   <!-- tokens: --dsn-icon-size-sm --dsn-icon-size-md -->
 *
 * Een woord zonder `--` is een component: alle tokens uit
 * `design-tokens/src/tokens/components/{naam}.json`. Een woord met `--` is één
 * token, voor basistokens die een component gebruikt. Namen en descriptions
 * komen uit `token-docs.json`, dat de token-build schrijft. Zo bestaat elke
 * naam en beschrijving maar op één plek: in de JSON.
 *
 * `scripts/check-token-docs.mjs` controleert in CI dat elke marker naar
 * bestaande tokens wijst.
 */

interface TokenDoc {
  name: string;
  description: string;
  component: string | null;
}

const tokens: TokenDoc[] = tokenDocs.tokens;
const byName = new Map(tokens.map((token) => [token.name, token]));

const MARKER = /^<!--\s*tokens:\s*(.*?)\s*-->$/gm;

function cell(text: string): string {
  return text.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function tokensFor(item: string): TokenDoc[] {
  if (item.startsWith('--')) {
    const token = byName.get(item);
    return [
      token ?? {
        name: item,
        description: '⚠️ Onbekend token',
        component: null,
      },
    ];
  }
  const own = tokens.filter((token) => token.component === item);
  return own.length
    ? own
    : [
        {
          name: item,
          description: '⚠️ Onbekend component',
          component: null,
        },
      ];
}

export function tokenTable(spec: string): string {
  const rows = spec.split(/\s+/).filter(Boolean).flatMap(tokensFor);
  return [
    '| Token | Beschrijving |',
    '| ----- | ------------ |',
    ...rows.map(
      (token) => `| \`${token.name}\` | ${cell(token.description)} |`
    ),
  ].join('\n');
}

/**
 * Brede tabellen (lange token-namen) scrollen horizontaal binnen hun eigen
 * wrapper, net als de tabellen van `TokenTable`: inline code (token-namen)
 * breekt niet af, en de tabel scrolt in plaats van samen te knijpen. De
 * wrapper is focusbaar, zodat ook toetsenbordgebruikers kunnen scrollen.
 */
function ScrollableTable(props: ComponentProps<'table'>) {
  return (
    <div
      role="region"
      aria-label="Tabel"
      tabIndex={0}
      className="docs-markdown-table"
    >
      <table {...props} />
    </div>
  );
}

const SOURCE_LANGUAGES = ['html', 'tsx', 'css', 'json', 'bash'] as const;
type SourceLanguage = (typeof SOURCE_LANGUAGES)[number] | 'text';

function sourceLanguage(className: unknown): SourceLanguage {
  const lang =
    typeof className === 'string'
      ? className.match(/(?:^|\s)lang(?:uage)?-(\S+)/)?.[1]
      : undefined;
  if (lang === 'jsx' || lang === 'ts' || lang === 'typescript') return 'tsx';
  return (SOURCE_LANGUAGES as readonly string[]).includes(lang ?? '')
    ? (lang as SourceLanguage)
    : 'text';
}

/**
 * Een codeblok in dezelfde donkere stijl als `CodeTabs` onder de
 * componentpreview: Storybooks `Source`-block met syntax highlighting,
 * scrollen en een kopieerknop. Ook los te gebruiken in MDX.
 */
export function DocsCode({
  code,
  language = 'text',
}: {
  code: string;
  language?: SourceLanguage;
}) {
  return (
    <div className="docs-markdown-code">
      <Source code={code.replace(/^\n|\n$/g, '')} language={language} dark />
    </div>
  );
}

/** Codeblokken in markdown (```html, ```tsx) renderen als `DocsCode`. */
function CodeBlock({ children }: { children?: ReactNode }) {
  if (!isValidElement<{ className?: string; children?: ReactNode }>(children)) {
    return <pre>{children}</pre>;
  }
  const { className, children: code } = children.props;
  return (
    <DocsCode code={String(code ?? '')} language={sourceLanguage(className)} />
  );
}

const markdownOptions = {
  overrides: {
    table: { component: ScrollableTable },
    pre: { component: CodeBlock },
  },
};

export function DocsMarkdown({ children }: { children: string }) {
  return (
    <Markdown options={markdownOptions}>
      {children.replace(MARKER, (_match, spec: string) => tokenTable(spec))}
    </Markdown>
  );
}
