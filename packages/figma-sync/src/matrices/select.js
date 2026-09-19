/**
 * Variant-matrix voor Select.
 *
 * Een `<select>` met een eigen chevron ernaast: de native pijl wordt met
 * `appearance: none` weggehaald, en het icoon is een echte laag die absoluut
 * over het veld heen ligt. De root is de wrapper, want die draagt de maat.
 *
 * De chevron verdwijnt in de uitgeschakelde stand, precies zoals in
 * `Select.tsx`. Dat is geen boolean maar een gevolg van de stand, dus het
 * hangt aan de `state`-as.
 */

import { icon } from '../icons.js';
import { TEKST } from '../text.js';

import { FLAG, skipFlagCombinations } from '../flags.js';

export default {
  component: 'Select',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/icon/icon.css',
    '@dsn-starter-kit/components-html/src/text-input/text-input.css',
    '@dsn-starter-kit/components-html/src/select/select.css',
  ],

  wrapperStyle: 'width: 343px;',

  // De root is een wrapper-div om het veld en zijn icoon heen; die naam zegt
  // een designer niets. De set heet naar het component zelf.
  // Het veld en zijn icoon worden in Figma één frame, zie `mergeAdornments`.
  mergeAdornments: true,

  setName: 'dsn-select',

  axes: {
    state: ['default', 'hover', 'focus'],
    disabled: FLAG,
    invalid: FLAG,
    width: ['auto', 'xs', 'sm', 'md', 'lg', 'xl', 'full'],
  },

  skipVariant: skipFlagCombinations({
    flags: ['disabled', 'invalid'],
    base: { state: 'default' },
  }),

  // Een `<select>` toont de gekozen optie; er is niets in te typen en er is
  // geen placeholder, dus één tekst-property in plaats van de twee van een
  // tekstveld.
  componentProperties: [{ name: 'value', type: 'TEXT', slot: 'value' }],

  pseudoStates: { hover: 'hover', focus: 'focus' },

  render({ width, ...variant }) {
    const wrapperClasses = [
      'dsn-select-wrapper',
      width !== 'auto' && `dsn-select-wrapper--width-${width}`,
    ]
      .filter(Boolean)
      .join(' ');

    const disabled = variant.disabled === 'true';
    const invalid = variant.invalid === 'true' ? ' aria-invalid="true"' : '';

    return `<div class="${wrapperClasses}" data-figma-root>
      <select class="dsn-text-input dsn-select"${disabled ? ' disabled' : ''}${invalid}>
        <option data-figma-slot="value">${TEKST}</option>
      </select>
      ${disabled ? '' : icon('chevron-down', { className: 'dsn-select__icon' })}
    </div>`;
  },
};
