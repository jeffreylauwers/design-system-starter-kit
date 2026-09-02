/**
 * Variant-matrix voor StatusBadge.
 *
 * Een inline-flex met een optioneel icoon ervoor. Het icoon staat op een as en
 * niet op een boolean: `gap` telt alleen mee als er iets naast de tekst staat,
 * dus de gemeten breedte verschilt per stand.
 *
 * Het icoon verschilt per variant, zoals in de gebruiksvoorbeelden in
 * `status-badge.css`. Daarom géén instance swap property: die zou de designer
 * een icoon laten kiezen dat niet bij de variant hoort.
 */

import { icon } from '../icons.js';
import { TEKST } from '../text.js';

const ICON_NAMES = {
  neutral: 'info-circle',
  info: 'info-circle',
  positive: 'circle-check',
  negative: 'exclamation-circle',
  warning: 'alert-triangle',
};

export default {
  component: 'StatusBadge',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/icon/icon.css',
    '@dsn-starter-kit/components-html/src/status-badge/status-badge.css',
  ],

  axes: {
    variant: ['neutral', 'info', 'positive', 'negative', 'warning'],
    icon: ['with-icon', 'no-icon'],
  },

  componentProperties: [{ name: 'label', type: 'TEXT', slot: 'label' }],

  render({ variant, icon: iconAxis }) {
    const classes = [
      'dsn-status-badge',
      variant !== 'neutral' && `dsn-status-badge--${variant}`,
    ]
      .filter(Boolean)
      .join(' ');

    const iconMarkup =
      iconAxis === 'with-icon'
        ? icon(ICON_NAMES[variant], { modifier: 'sm' })
        : '';

    return `<strong class="${classes}" data-figma-root>
      ${iconMarkup}
      <span data-figma-slot="label">${TEKST}</span>
    </strong>`;
  },
};
