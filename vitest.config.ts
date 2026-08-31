import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@dsn/components-react': path.resolve(
        __dirname,
        'packages/components-react/src'
      ),
      '@dsn/components-html': path.resolve(
        __dirname,
        'packages/components-html/src'
      ),
      '@dsn/core': path.resolve(__dirname, 'packages/core/src'),
      '@dsn/design-tokens': path.resolve(__dirname, 'packages/design-tokens'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['packages/**/*.test.{ts,tsx}'],
    css: true,
  },
});
