import type { Preview } from '@storybook/react';

// NOTE: We do NOT import the token CSS statically here anymore.
// The tokens are loaded dynamically by the decorator and preview-head.html
// to support runtime theme/mode/density switching.

// Core styles (layout, resets, etc. - NOT tokens)
import '../../core/dist/core.css';
import './preview-body.css';

// =============================================================================
// TOKEN CONFIGURATION LOADER
// =============================================================================

// Map of all available configurations
// We'll dynamically fetch and apply these when globals change
// Use relative path to support both local and GitHub Pages deployment
const CONFIG_BASE_URL = './design-tokens/dist/css';

/**
 * Loads a CSS configuration file and applies it to the document.
 * This overwrites the :root CSS variables with the new values.
 */
async function loadTokenConfig(configName: string): Promise<void> {
  const url = `${CONFIG_BASE_URL}/${configName}.css`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to load token config: ${url}`);
      return;
    }

    const cssText = await response.text();

    // Remove any existing dynamic style element
    const existingStyle = document.querySelector('[data-dsn-tokens]');
    if (existingStyle) {
      existingStyle.remove();
    }

    // Create and inject new style element
    const style = document.createElement('style');
    style.setAttribute('data-dsn-tokens', configName);
    style.textContent = cssText;
    document.head.appendChild(style);

    // Dispatch event for components that need to react
    window.dispatchEvent(
      new CustomEvent('storybook-globals-updated', {
        detail: { configName },
      })
    );
  } catch (error) {
    console.error('Error loading token config:', error);
  }
}

// =============================================================================
// GLOBAL TYPES (Storybook Toolbar)
// =============================================================================

// Preload default tokens immediately when Storybook loads
// This ensures tokens are available even on docs-only pages (like Introduction)
if (typeof window !== 'undefined') {
  loadTokenConfig('start-light-default');
}

const preview: Preview = {
  parameters: {
    backgrounds: { disable: true },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      // @ts-expect-error storySort is serialized to manager, avoid TS annotations
      storySort: (story1, story2) => {
        // @ts-expect-error: storybook-multilevel-sort registreert zichzelf op globalThis, buiten TS-controle
        return globalThis['storybook-multilevel-sort:storySort'](
          story1,
          story2
        );
      },
    },
  },
  globalTypes: {
    // Theme selector (affects all tokens except colors and font-sizes)
    theme: {
      name: 'Theme',
      description: 'Design system theme (branding/visual identity)',
      defaultValue: 'start',
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: 'start', title: 'Start Theme', icon: 'star' },
          { value: 'wireframe', title: 'Wireframe', icon: 'outline' },
        ],
        dynamicTitle: true,
      },
    },
    // Mode selector (affects only colors)
    mode: {
      name: 'Mode',
      description: 'Color mode (light/dark)',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light Mode', icon: 'sun' },
          { value: 'dark', title: 'Dark Mode', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
    // Project type selector (affects only font-sizes)
    projectType: {
      name: 'Density',
      description: 'Typography density (affects font-sizes)',
      defaultValue: 'default',
      toolbar: {
        icon: 'listunordered',
        items: [
          { value: 'default', title: 'Default (Fluid)', icon: 'expand' },
          {
            value: 'information-dense',
            title: 'Information Dense (Fixed)',
            icon: 'collapse',
          },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    // Theme switching decorator - loads appropriate CSS based on globals
    (Story, context) => {
      // Use defaults if globals are undefined or empty strings
      const theme = context.globals.theme || 'start';
      const mode = context.globals.mode || 'light';
      const projectType = context.globals.projectType || 'default';
      const configName = `${theme}-${mode}-${projectType}`;

      // Load the appropriate token configuration
      if (typeof window !== 'undefined') {
        // Check if we need to load a new config
        const currentConfig = document
          .querySelector('[data-dsn-tokens]')
          ?.getAttribute('data-dsn-tokens');

        if (currentConfig !== configName) {
          loadTokenConfig(configName);
        }

        // Update body classes for any CSS scoping
        const densityClass =
          projectType === 'information-dense' ? 'dense' : 'default';
        document.body.className = `dsn-body dsn-theme-${theme} dsn-mode-${mode} dsn-density-${densityClass}`;
      }

      return Story();
    },
  ],
};

export default preview;
