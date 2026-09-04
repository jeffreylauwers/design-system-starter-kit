/**
 * Variant-matrix voor OptionLabel.
 *
 * Het label naast een Checkbox of Radio. Eén laag met eigen typografie- en
 * kleurtokens, plus een uitgeschakelde stand met een eigen kleur.
 *
 * De uitgeschakelde stand komt hier van de klasse `dsn-option-label--disabled`
 * en niet van een pseudo-klasse: het label is een `<span>` en kent zelf geen
 * `:disabled`. In de React-laag zet CheckboxOption die klasse zodra de input
 * uitgeschakeld is.
 */

import { TEKST } from '../text.js';

export default {
  component: 'OptionLabel',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/option-label/option-label.css',
  ],

  axes: {
    state: ['default', 'disabled'],
  },

  componentProperties: [{ name: 'label', type: 'TEXT', slot: 'label' }],

  render({ state }) {
    const classes = [
      'dsn-option-label',
      state === 'disabled' && 'dsn-option-label--disabled',
    ]
      .filter(Boolean)
      .join(' ');

    return `<span class="${classes}" data-figma-root data-figma-slot="label">${TEKST}</span>`;
  },
};
