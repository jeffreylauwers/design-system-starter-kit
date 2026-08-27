/**
 * Getypeerde toegang tot de token-loader uit `.storybook/preview-head.html`.
 *
 * Dat script is de enige bron van waarheid voor het pad naar de token-CSS
 * (`design-tokens/dist/css/`, afgeleid van `document.baseURI`) en voor het
 * injecteren van de stylesheet. Het draait als klassiek inline-script in de
 * head van de preview-iframe, dus vóór de Storybook-bundel: alles wat deze
 * module importeert kan ervan uitgaan dat de loader er is.
 *
 * Voeg hier geen tweede implementatie toe. Wie het pad of het injecteren wil
 * aanpassen, doet dat in `preview-head.html`.
 */

export interface DsnTokenLoader {
  /** Volledige URL naar de CSS van een configuratie, bijv. `start-dark-default`. */
  configUrl(configName: string): string;
  /**
   * Laadt een configuratie en injecteert de tokens. Idempotent: dezelfde
   * configuratie tweemaal aanvragen doet niets (tenzij `forceReload`).
   */
  load(configName: string, forceReload?: boolean): Promise<void>;
  /** Zet `dsn-theme-*`, `dsn-mode-*` en `dsn-density-*` op `<body>`. */
  applyBodyClasses(theme: string, mode: string, projectType: string): void;
  /** De configuratie die nu geladen is, of `null` als er nog niets geladen is. */
  getCurrentConfigName(): string | null;
}

declare global {
  interface Window {
    __DSN_TOKENS__?: DsnTokenLoader;
  }
}

/**
 * Geeft de loader terug, of `undefined` buiten de preview-iframe (SSR, tests).
 */
export function getTokenLoader(): DsnTokenLoader | undefined {
  if (typeof window === 'undefined') return undefined;

  const loader = window.__DSN_TOKENS__;
  if (!loader) {
    console.error(
      'Token loader ontbreekt op window.__DSN_TOKENS__; draait .storybook/preview-head.html wel?'
    );
  }

  return loader;
}

/**
 * Bouwt een configuratienaam uit de Storybook-globals.
 */
export function toConfigName(
  theme: string,
  mode: string,
  projectType: string
): string {
  return `${theme}-${mode}-${projectType}`;
}

/**
 * Splitst een configuratienaam weer uit. `projectType` kan zelf een streepje
 * bevatten (`information-dense`), dus alles na het tweede segment hoort erbij.
 */
export function fromConfigName(configName: string): {
  theme: string;
  mode: string;
  projectType: string;
} {
  const [theme, mode, ...projectType] = configName.split('-');

  return {
    theme: theme || 'start',
    mode: mode || 'light',
    projectType: projectType.join('-') || 'default',
  };
}
