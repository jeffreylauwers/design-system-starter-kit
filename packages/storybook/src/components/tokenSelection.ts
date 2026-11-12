/**
 * Welke tokens een `TokenTable` toont, gekozen uit `token-docs.json`.
 *
 * Los van de React-component, zodat `tests/design-tokens-page.test.ts` met
 * precies dezelfde regels kan nagaan of elk semantisch token op de pagina staat.
 */

export interface TokenDoc {
  name: string;
  description: string;
  component: string | null;
}

export interface TokenSelection {
  /** Eén of meer prefixen, gescheiden door spaties: `--dsn-color-neutral-`. */
  prefix?: string;
  /** Prefixen of volledige namen die binnen `prefix` niet meedoen. */
  exclude?: string;
  /** Losse tokens op naam, gescheiden door spaties, in deze volgorde. */
  tokens?: string;
}

function words(value?: string): string[] {
  return value?.split(/\s+/).filter(Boolean) ?? [];
}

/**
 * Tokens uit `all` volgens de selectie: eerst de `prefix`-tokens in de
 * volgorde van de JSON, daarna de losse `tokens` in de opgegeven volgorde.
 * Een losse naam die niet bestaat, komt terug met `description: undefined`,
 * zodat de tabel hem als onbekend kan tonen.
 */
export function selectTokens(
  all: TokenDoc[],
  { prefix, exclude, tokens }: TokenSelection
): (TokenDoc | { name: string; description?: undefined })[] {
  const byName = new Map(all.map((token) => [token.name, token]));
  const named = words(tokens).map((name) => byName.get(name) ?? { name });

  const prefixes = words(prefix);
  const excluded = words(exclude);
  const matched = prefixes.length
    ? all.filter(
        (token) =>
          prefixes.some((p) => token.name.startsWith(p)) &&
          !excluded.some((e) => token.name.startsWith(e))
      )
    : [];

  return [...matched, ...named];
}
