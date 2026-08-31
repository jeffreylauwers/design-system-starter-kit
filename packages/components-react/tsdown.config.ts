import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  css: {
    // Alle component-CSS in één bestand, inclusief de @import-ketens naar
    // components-html. Naam blijft index.css, zodat de bestaande export
    // '@dsn-starter-kit/components-react/css' ongewijzigd blijft werken.
    fileName: 'index.css',
    splitting: false,
    // Bewust uit: met inject blijven er CSS-imports in de JS staan, en juist die
    // maken de bundel onlaadbaar in Node (server-side rendering, Jest, require).
    // Consumers importeren de CSS zelf, één keer.
    inject: false,
  },
});
