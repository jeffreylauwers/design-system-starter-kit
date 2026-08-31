import { defineConfig } from 'tsdown';

const css = {
  // Alle component-CSS in één bestand, inclusief de @import-ketens naar
  // components-html. Naam blijft index.css, zodat de bestaande export
  // '@dsn-starter-kit/components-react/css' ongewijzigd blijft werken.
  fileName: 'index.css',
  splitting: false,
  // Bewust uit: met inject blijven er CSS-imports in de JS staan, en juist die
  // maken de bundel onlaadbaar in Node (server-side rendering, Jest, require).
  // Consumers importeren de CSS zelf, één keer. Zie DR-2026-07.
  inject: false,
} as const;

export default defineConfig([
  {
    // ESM blijft ongebundeld: één module per component, zodat de bundler van de
    // consument ongebruikte componenten kan weglaten. Samen met "sideEffects": false
    // in de package.json scheelt dat fors: React plus alleen Button is 214 kB in
    // plaats van 262 kB.
    entry: ['src/index.ts'],
    format: ['esm'],
    unbundle: true,
    dts: true,
    sourcemap: true,
    clean: true,
    css,
  },
  {
    // CJS wordt wél gebundeld. In unbundle-modus laat tsdown per component een
    // require naar de weggestripte CSS-module staan ("./Button.cjs"), een bestand
    // dat niet bestaat: 69 kapotte requires. De ESM-output heeft dat probleem niet.
    // Zolang dat niet is opgelost blijft CJS één bestand; die consumenten missen
    // alleen het tree-shaking-voordeel.
    entry: ['src/index.ts'],
    format: ['cjs'],
    dts: true,
    sourcemap: true,
    clean: false,
    css,
  },
]);
