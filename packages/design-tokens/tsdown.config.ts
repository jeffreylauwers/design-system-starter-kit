import { copyFile } from 'node:fs/promises';
import { defineConfig } from 'tsdown';

// De ESM-token-modules worden door Style Dictionary gegenereerd (src/config/build.js).
// Deze stap draait daarna en zet er een CommonJS-variant naast, zodat het package ook
// bruikbaar is vanuit CJS-configuratie zoals tailwind.config.js of jest.config.js.
const entries = ['tokens', 'tokens-dark'];

export default defineConfig({
  entry: entries.map((name) => `dist/js/${name}.js`),
  outDir: 'dist/js',
  format: ['cjs'],
  // De .d.ts wordt door Style Dictionary gegenereerd en beschrijft beide
  // exportvormen al; die hergebruiken we voor de CJS-variant.
  dts: false,
  sourcemap: false,
  clean: false,
  // De tokenmodules hebben bewust zowel benoemde exports als een default export.
  outputOptions: { exports: 'named' },
  async onSuccess() {
    await Promise.all(
      entries.map((name) =>
        copyFile(`dist/js/${name}.d.ts`, `dist/js/${name}.d.cts`)
      )
    );
  },
});
