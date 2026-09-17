/**
 * Variant-matrix voor TextArea.
 *
 * Zelfde tokens als TextInput, maar met een eigen `min-block-size` voor
 * meerdere regels en `resize: vertical`. Dat laatste heeft in Figma geen
 * tegenhanger; wat overkomt is de hoogte waarmee het veld begint.
 */

import {
  FIELD_TEXT_AXES,
  FIELD_TEXT_PROPERTIES,
  fieldTextAttributes,
} from '../field-text.js';
import { TEKST } from '../text.js';

export default {
  component: 'TextArea',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/text-area/text-area.css',
  ],

  wrapperStyle: 'width: 343px;',

  axes: {
    state: ['default', 'hover', 'focus', 'disabled', 'invalid'],
    ...FIELD_TEXT_AXES,
    width: ['auto', 'md', 'full'],
  },

  componentProperties: FIELD_TEXT_PROPERTIES,

  pseudoStates: { hover: 'hover', focus: 'focus' },

  render({ state, width, ...variant }) {
    const classes = [
      'dsn-text-area',
      width !== 'auto' && `dsn-text-area--width-${width}`,
    ]
      .filter(Boolean)
      .join(' ');

    const disabled = state === 'disabled' ? ' disabled' : '';
    const invalid = state === 'invalid' ? ' aria-invalid="true"' : '';

    // Een textarea draagt zijn waarde als inhoud, niet als attribuut.
    const text = fieldTextAttributes(variant, {
      value: TEKST,
      placeholder: 'Placeholder',
      native: false,
    });
    const placeholder =
      variant.showPlaceholder === 'true' ? ' placeholder="Placeholder"' : '';
    const content = variant.showValue === 'true' ? TEKST : '';

    return `<textarea class="${classes}"${placeholder}${text}${disabled}${invalid} data-figma-root>${content}</textarea>`;
  },
};
