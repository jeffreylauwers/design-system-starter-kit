/**
 * Variant-matrix voor FormFieldDescription.
 *
 * Uitleg onder een label. Bewust één laag zonder opsmuk: uit toegankelijkheids-
 * onderzoek met VoiceOver volgde dat er geen lijst en geen link in een
 * description hoort, dus die staan hier ook niet in de matrix. Wat er wel in
 * mag is een regelafbreking, en die tweede regel staat er daarom in: zo is in
 * Figma te zien hoe de regelhoogte uitpakt.
 */

import { TEKST, VEEL_TEKST } from '../text.js';

export default {
  component: 'FormFieldDescription',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/form-field-description/form-field-description.css',
  ],

  wrapperStyle: 'width: 343px;',

  axes: {
    length: ['short-text', 'long-text'],
  },

  componentProperties: [{ name: 'label', type: 'TEXT', slot: 'label' }],

  render({ length }) {
    const text = length === 'short-text' ? TEKST : VEEL_TEKST;
    return `<p class="dsn-form-field-description" data-figma-root data-figma-slot="label">${text}</p>`;
  },
};
