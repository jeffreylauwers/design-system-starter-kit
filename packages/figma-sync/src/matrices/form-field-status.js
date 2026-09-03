/**
 * Variant-matrix voor FormFieldStatus.
 *
 * Statusregel onder een veld, bijvoorbeeld het aantal resterende tekens. De
 * drie varianten verschillen structureel en niet alleen in kleur: `default` is
 * een blok zonder icoon, terwijl `positive` en `warning` een flexrij met een
 * icoon zijn. Daarmee is dit de toets of één component set twee verschillende
 * layoutmodellen naast elkaar kan dragen.
 */

import { icon } from '../icons.js';
import { TEKST } from '../text.js';

const ICON_NAMES = {
  positive: 'circle-check',
  warning: 'alert-triangle',
};

export default {
  component: 'FormFieldStatus',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/icon/icon.css',
    '@dsn-starter-kit/components-html/src/form-field-status/form-field-status.css',
  ],

  wrapperStyle: 'width: 343px;',

  axes: {
    variant: ['default', 'positive', 'warning'],
  },

  componentProperties: [{ name: 'label', type: 'TEXT', slot: 'label' }],

  render({ variant }) {
    const classes = [
      'dsn-form-field-status',
      variant !== 'default' && `dsn-form-field-status--${variant}`,
    ]
      .filter(Boolean)
      .join(' ');

    const iconMarkup = ICON_NAMES[variant] ? icon(ICON_NAMES[variant]) : '';

    return `<p class="${classes}" data-figma-root>
      ${iconMarkup}
      <span data-figma-slot="label">${TEKST}</span>
    </p>`;
  },
};
