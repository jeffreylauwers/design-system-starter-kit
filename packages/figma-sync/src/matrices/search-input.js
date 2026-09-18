/**
 * Variant-matrix voor SearchInput.
 *
 * Een tekstveld met een zoekicoon aan de inline-start. Anders dan bij Select
 * staat het icoon vóór het veld in de DOM, en schuift de tekst opzij met extra
 * `padding-inline-start`.
 */

import { icon } from '../icons.js';

import {
  FIELD_TEXT_AXES,
  FIELD_TEXT_PROPERTIES,
  fieldTextAttributes,
} from '../field-text.js';
import { TEKST } from '../text.js';

import { FLAG, skipFlagCombinations } from '../flags.js';

export default {
  component: 'SearchInput',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/icon/icon.css',
    '@dsn-starter-kit/components-html/src/text-input/text-input.css',
    '@dsn-starter-kit/components-html/src/search-input/search-input.css',
  ],

  wrapperStyle: 'width: 343px;',

  axes: {
    state: ['default', 'hover', 'focus'],
    disabled: FLAG,
    invalid: FLAG,
    ...FIELD_TEXT_AXES,
    width: ['auto', 'md', 'full'],
  },

  componentProperties: FIELD_TEXT_PROPERTIES,

  skipVariant: skipFlagCombinations({
    flags: ['disabled', 'invalid'],
    base: { state: 'default' },
  }),

  pseudoStates: { hover: 'hover', focus: 'focus' },

  render({ width, ...variant }) {
    const wrapperClasses = [
      'dsn-search-input-wrapper',
      width !== 'auto' && `dsn-search-input-wrapper--width-${width}`,
    ]
      .filter(Boolean)
      .join(' ');

    const disabled = variant.disabled === 'true' ? ' disabled' : '';
    const invalid = variant.invalid === 'true' ? ' aria-invalid="true"' : '';

    return `<div class="${wrapperClasses}" data-figma-root>
      ${icon('search', { className: 'dsn-search-input__icon' })}
      <input type="search" class="dsn-text-input dsn-search-input"${fieldTextAttributes(variant, { value: TEKST, placeholder: 'Placeholder' })}${disabled}${invalid}>
    </div>`;
  },
};
