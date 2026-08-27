import type { Preview } from '@storybook/react-vite';
import { getTokenLoader, toConfigName } from '../src/token-loader';

// NOTE: We do NOT import the token CSS statically here anymore.
// De tokens worden dynamisch geladen door de loader in preview-head.html,
// zodat theme/mode/density tijdens runtime kunnen wisselen. Die loader kent
// als enige het pad naar de token-CSS; de decorator hieronder vertelt hem
// alleen welke configuratie de toolbar-globals vragen.

// Core styles (layout, resets, etc. - NOT tokens)
import '../../core/dist/core.css';
import './preview-body.css';

const preview: Preview = {
  parameters: {
    backgrounds: { disabled: true },
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

      const loader = getTokenLoader();
      if (loader) {
        // De loader dedupliceert zelf; opnieuw dezelfde config vragen is gratis.
        void loader.load(toConfigName(theme, mode, projectType));
        loader.applyBodyClasses(theme, mode, projectType);

        // Stories renderen op een body die zich als dsn-body gedraagt.
        // Docs-pagina's bewust niet: die houden de Storybook-typografie.
        document.body.classList.add('dsn-body');
      }

      return Story();
    },
  ],
};

export default preview;
