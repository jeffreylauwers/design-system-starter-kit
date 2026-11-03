import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintReact from '@eslint-react/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';
import storybook from 'eslint-plugin-storybook';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default defineConfig(
  {
    ignores: [
      '**/dist/**',
      '**/build/**',
      '**/node_modules/**',
      '**/storybook-static/**',
      '**/*.config.js',
      '**/*.generated.*',
      '**/scripts/**/*.js',
      '**/config/**/*.js',
    ],
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ['**/*.{jsx,tsx}'],
    ...eslintReact.configs['recommended-typescript'],
  },
  reactHooks.configs.flat.recommended,
  storybook.configs['flat/recommended'],
  prettier,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    settings: {
      // components-react ondersteunt React 18 en 19 (peer dependency
      // `react >= 18`). Met 18 als doel stelt de plugin geen API's voor die
      // alleen in 19 bestaan, zoals ref als gewone prop in plaats van forwardRef.
      'react-x': {
        version: '18.3.1',
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      // Componenten als ActionGroup, BreadcrumbNavigation en DataList stellen
      // hun markup samen uit children; de Children- en cloneElement-API is
      // daar een bewuste keuze.
      '@eslint-react/no-children-count': 'off',
      '@eslint-react/no-children-map': 'off',
      '@eslint-react/no-children-to-array': 'off',
      '@eslint-react/no-clone-element': 'off',
      // Dekt react-hooks/set-state-in-effect al, en die is preciezer
      '@eslint-react/set-state-in-effect': 'off',
    },
  },
  {
    // De Figma-plugin draait in de plugin-sandbox, niet in een browser of in
    // Node. Die omgeving levert `figma` en `__html__` als globals aan.
    files: ['packages/figma-plugin/src/**/*.js'],
    languageOptions: {
      globals: {
        figma: 'readonly',
        __html__: 'readonly',
      },
    },
  }
);
