import type { StorybookConfig } from '@storybook/react-vite';
import svgr from 'vite-plugin-svgr';
import { mergeConfig } from 'vite';
import path from 'path';
import { configureSort } from 'storybook-multilevel-sort';

configureSort({
  storyOrder: {
    introduction: null,
    foundations: null,
    'layout-components': {
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
    '@storybook/addon-essentials',
    '@storybook/addon-links',
    '@storybook/addon-themes',
    '@storybook/addon-a11y',
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
      plugins: [svgr()],
      resolve: {
        alias: {
          '@dsn/components-react': path.resolve(
            __dirname,
            '../../components-react/src'
          ),
          '@dsn/core': path.resolve(__dirname, '../../core/src'),
        },
      },
      base: process.env.STORYBOOK_BASE_PATH || '/',
    });
  },
};

export default config;
