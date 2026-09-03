/**
 * Variant-matrix voor FormFieldErrorMessage.
 *
 * Een flexrij met een icoon dat via `color: inherit` de foutkleur van de
 * tekst overneemt. Dat is precies het geval waar de cascade-nabootsing voor
 * uitgebreid is: `inherit` is een verwijzing en geen waarde, dus zonder
 * doorlopen naar de ouder zou het icoon een vaste kleur krijgen en de
 * theme-schakelaar niet volgen.
 */

import { icon } from '../icons.js';
import { TEKST, VEEL_TEKST } from '../text.js';

export default {
  component: 'FormFieldErrorMessage',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/icon/icon.css',
    '@dsn-starter-kit/components-html/src/form-field-error-message/form-field-error-message.css',
  ],

  wrapperStyle: 'width: 343px;',

  axes: {
    length: ['short-text', 'long-text'],
  },

  componentProperties: [{ name: 'label', type: 'TEXT', slot: 'label' }],

  render({ length }) {
    const text = length === 'short-text' ? TEKST : VEEL_TEKST;

    return `<p class="dsn-form-field-error-message" data-figma-root>
      ${icon('exclamation-circle')}
      <span data-figma-slot="label">${text}</span>
    </p>`;
  },
};
