// This file has been automatically migrated to valid ESM format by Storybook.
import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';
import path, { dirname } from 'path';
import { configureSort } from 'storybook-multilevel-sort';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

configureSort({
  storyOrder: {
    introduction: null,
    foundations: {
      'design tokens': null,
      '*': null,
    },
    'layout components': {
      '*': { docs: null },
    },
    components: {
      '*': { docs: null },
    },
  },
  typeOrder: ['docs', 'story'],
});

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)', '../src/**/*.mdx'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-themes',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  // Static folders - serve design tokens for runtime theme switching
  staticDirs: [
    {
      from: '../../design-tokens/dist',
      to: '/design-tokens/dist',
    },
  ],
  async viteFinal(config) {
    return mergeConfig(config, {
      resolve: {
        alias: {
          '@dsn-starter-kit/components-react': path.resolve(
            __dirname,
            '../../components-react/src'
          ),
          '@dsn-starter-kit/core': path.resolve(__dirname, '../../core/src'),
        },
      },
      base: process.env.STORYBOOK_BASE_PATH || '/',
    });
  },
};

export default config;
