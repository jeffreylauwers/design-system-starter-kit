/**
 * Variant-matrix voor DateInput.
 *
 * Een native `<input type="date">` met een eigen knop ernaast die de
 * browserkiezer opent. De knop is een gewone `dsn-button` in de subtle-variant,
 * icon-only, dus dit is meteen de toets of een Button binnen een ander
 * component dezelfde maten oplevert als in zijn eigen set.
 *
 * De knop verdwijnt in de uitgeschakelde en alleen-lezen stand, zoals in
 * `DateInput.tsx`. Dat volgt uit de stand en is dus geen aparte boolean.
 *
 * De native kiezer-indicator van de browser (`::-webkit-calendar-picker-indicator`)
 * is een pseudo-element en heeft in Figma dus geen tegenhanger; de CSS verbergt
 * hem, en de zichtbare knop is de laag die overkomt.
 */

import { icon } from '../icons.js';

import {
  FIELD_TEXT_AXES,
  FIELD_TEXT_PROPERTIES,
  fieldTextAttributes,
} from '../field-text.js';

import { FLAG, skipFlagCombinations } from '../flags.js';

export default {
  component: 'DateInput',

  fonts: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  ],

  css: [
    '@dsn-starter-kit/design-tokens/dist/css/start-light-default.css',
    '@dsn-starter-kit/components-html/src/icon/icon.css',
    '@dsn-starter-kit/components-html/src/button/button.css',
    '@dsn-starter-kit/components-html/src/text-input/text-input.css',
    '@dsn-starter-kit/components-html/src/date-input/date-input.css',
  ],

  wrapperStyle: 'width: 343px;',

  // De root is een wrapper-div om het veld en zijn icoon heen; die naam zegt
  // een designer niets. De set heet naar het component zelf.
  // Het veld en zijn icoon worden in Figma één frame, zie `mergeAdornments`.
  mergeAdornments: true,

  setName: 'dsn-date-input',

  axes: {
    state: ['default', 'hover', 'focus'],
    disabled: FLAG,
    invalid: FLAG,
    ...FIELD_TEXT_AXES,
  },

  componentProperties: FIELD_TEXT_PROPERTIES,

  skipVariant: skipFlagCombinations({
    flags: ['disabled', 'invalid'],
    base: { state: 'default' },
  }),

  pseudoStates: { hover: 'hover', focus: 'focus' },

  render(variant) {
    const disabled = variant.disabled === 'true';
    const invalid = variant.invalid === 'true' ? ' aria-invalid="true"' : '';

    const button = disabled
      ? ''
      : `<button type="button" class="dsn-button dsn-button--subtle dsn-button--size-small dsn-button--icon-only dsn-date-input__button">
           ${icon('calendar-event')}
           <span class="dsn-button__label">Datumkiezer openen</span>
         </button>`;

    return `<div class="dsn-date-input-wrapper" data-figma-root>
      <input type="date" class="dsn-text-input dsn-date-input"${fieldTextAttributes(variant, { value: '01-01-2026', placeholder: 'dd-mm-jjjj', native: false })}${disabled ? ' disabled' : ''}${invalid}>
      ${button}
    </div>`;
  },
};
